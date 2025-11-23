from openai import AzureOpenAI
import os
from ..config import AppConfig, get_config
config: AppConfig = get_config()

client = AzureOpenAI(
    api_key=os.environ["AZURE_OPENAI_API_KEY"],
    api_version=os.environ["AZURE_OPENAI_API_VERSION"],
    azure_endpoint=os.environ["AZURE_OPENAI_ENDPOINT"],
)

MODEL = os.environ["AZURE_OPENAI_DEPLOYMENT"]

async def analyze_post_for_user(profession: str, location: str, title: str, description: str):
    """
    Sends user context + post content to Azure OpenAI and
    returns:
        - simple summary
        - 'what's in it for me' benefit analysis
    """

    prompt = f"""
    You are an AI assistant helping a citizen understand a community-related post.
    The user's profession is **{profession}** and the user lives in **{location}**.

    Here is the post:
    - Title: {title}
    - Description: {description}

    TASK:
    1. Summarize the post in **simple, easy-to-understand terms**.
    2. Then answer **“What’s in it for me?”**:
        - Explain how this post might affect the user’s life,
        - Mention any benefits, opportunities, risks or actions they might take,
        - Tailor it specifically to someone who works as **{profession}** and lives in **{location}**.

    Return it in the following JSON format:

    {{
        "summary": "...",
        "whats_in_it_for_me": "..."
    }}
    """

    response = client.chat.completions.create(
        model=MODEL,
        messages=[{"role": "user", "content": prompt}]
    )

    return response.choices[0].message.content
