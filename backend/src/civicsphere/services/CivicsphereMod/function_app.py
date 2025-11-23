import azure.functions as func
import json
import os
import logging
from openai import AzureOpenAI

app = func.FunctionApp()

# --- Azure OpenAI client setup ---
client = AzureOpenAI(
    api_key=os.environ["AZURE_OPENAI_API_KEY"],
    api_version=os.environ["AZURE_OPENAI_API_VERSION"],
    azure_endpoint=os.environ["AZURE_OPENAI_ENDPOINT"],
)

MODEL = os.environ["AZURE_OPENAI_DEPLOYMENT"]

SAFETY_PROMPT = """
You are a content safety engine.
Detect if the given text contains:
- hate or harassment
- violence or threats
- sexual content
- self-harm content
- profanity or extremely rude language

Respond ONLY as strict JSON:
{
  "flagged": true or false,
  "reason": "short explanation"
}
"""

VALIDATION_PROMPT = """
You are a fact-check evaluator.
Decide if the content seems:
- mostly true
- mostly false
- uncertain / unverifiable.

Respond ONLY as strict JSON:
{
  "validation": "True" | "False" | "Uncertain",
  "reason": "short explanation"
}
"""


def call_openai(system_prompt: str, text: str) -> dict:
    """
    Helper to call Azure OpenAI ChatCompletion and parse JSON response.
    """
    response = client.chat.completions.create(
        model=MODEL,
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": text},
        ]
    )
    content = response.choices[0].message.content
    # Model returns text, we expect it to be valid JSON
    return json.loads(content)


@app.route(route="analyze_post", auth_level=func.AuthLevel.FUNCTION, methods=["POST"])
def analyze_post(req: func.HttpRequest) -> func.HttpResponse:
    logging.info("analyze_post function triggered")

    try:
        body = req.get_json()
    except ValueError:
        return func.HttpResponse(
            json.dumps({"success": False, "error": "Invalid JSON body"}),
            status_code=400,
            mimetype="application/json",
        )

    title = body.get("title")
    description = body.get("description")

    if not title or not description:
        return func.HttpResponse(
            json.dumps({"success": False, "error": "Missing title or description"}),
            status_code=400,
            mimetype="application/json",
        )

    text = f"{title}\n\n{description}"

    try:
        # 1️⃣ Safety / harmful content check
        safety_result = call_openai(SAFETY_PROMPT, text)

        # 2️⃣ Truthfulness / validation check
        validation_result = call_openai(VALIDATION_PROMPT, text)

        response_body = {
            "success": True,
            "flagged": safety_result.get("flagged", False),
            "flag_reason": safety_result.get("reason", ""),
            "validation": validation_result.get("validation", "Uncertain"),
            "validation_reason": validation_result.get("reason", ""),
        }

        return func.HttpResponse(
            json.dumps(response_body),
            status_code=200,
            mimetype="application/json",
        )

    except Exception as e:
        logging.exception("Error in analyze_post")
        return func.HttpResponse(
            json.dumps({"success": False, "error": str(e)}),
            status_code=500,
            mimetype="application/json",
        )
