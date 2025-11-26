from typing import Optional, List
import logging
from fastapi import APIRouter, Request, Depends, File, UploadFile
from fastapi.responses import JSONResponse
from langchain_core.prompts import PromptTemplate
from langchain_core.output_parsers import StrOutputParser
from azure.identity.aio import DefaultAzureCredential
from azure.ai.projects.aio import AIProjectClient
from azure.ai.agents.aio import AgentsClient
from azure.ai.agents.models import ListSortOrder
from azure.ai.agents.models import AsyncToolSet
from azure.ai.agents.models import BingGroundingTool
from azure.ai.agents.models import AzureAISearchTool
from azure.ai.agents.models import AzureAISearchQueryType

from ..config import AppConfig
from ..models.api.user import UserPreferences
from ..models.api.chat import Chat, ChatData, ChatRequest, ChatResponse
from ..models.api.post import PostResponse
from ..services.chatbot.rag import search_documents
from ..services.chatbot.scraper.web.nyc import parse_address, get_pollsite_info, summarize_pollsite, summarize_accessibility
from ..services.chatbot.external.nyc import process_voice_prompt

config: AppConfig = AppConfig()
router = APIRouter(tags=["Chatbot"])

instructions = """\
You are a helpful civilian assistant that answers local community query, political query, and provides information on local policies and laws for NYC.

If the user asks about candidates or voting, provide factual information about the candidates but DO NOT provide specific recommendations or show bias. \
Maintain strict neutrality and fairness.

Keep your responses concise, relevant, and use simple language that is easy to understand.\

Guidelines:
- Use simple language
- Be unbiased and neutral, especially regarding elections.
- Do not say "You should vote for X". Instead, say "Candidate X supports Y".
- Provide factual data with citations
"""

async def get_user_preferences(user_id: str) -> UserPreferences:
    """Fetch user preferences from the database."""
    prefs = await config.db["userPreferences"].find_one(
        {"user_id": user_id},
        {
            "location": 1,
            "address": 1,
            "profession": 1,
            "interests": 1,
            "language": 1,
            "_id": 0,
        },
    )

    if not prefs:
        raise ValueError("Preferences not found. User may not have completed onboarding.")

    return UserPreferences(**prefs)


@router.post(
    "/new",
    response_model=ChatResponse
)
async def chat(
    req: Request,
    prompt: ChatRequest = Depends(),
    files: Optional[List[UploadFile]] = File(None),
    voice: Optional[UploadFile] = File(None)
):
    """
    Prompt chatbot with user queries
    """

    # User authentication
    user_id = None
    if req.state.user:
        user_id = req.state.user.get("user_id")

    if not user_id:
        logging.exception("Error occurred in /chat. User is not authenticated.")
        return JSONResponse(
            status_code=401,
            content=ChatResponse(
                success=False,
                message="User is not authenticated"
            ).model_dump()
        )

    # Get preferences
    try:
        prefs_data = await get_user_preferences(user_id)
        language = prefs_data.language or "en"

        prompt = None

        # Process voice prompt
        
        if voice:
            prompt_text = await process_voice_prompt(voice, language)
        else:
            prompt_text = prompt.prompt
        if voice:
            voice_content_type = voice.content_type
            audio_processor: AudioProcessor = AudioProcessor()
            match voice_content_type:
                case "audio/wav" | "video/webm":
                    transcription = await upload_client.get_audio_transcription(
                        file_path, language_code
                    )
                    if (
                        transcripted_text := transcription.get("data")
                    ) and not transcription.get("error"):
                        prompt = transcripted_text
                case _:
                    return JSONResponse(
                        status_code=406,
                        content={
                            "status": "failed",
                            "data": None,
                            "message": "Unsupported format",
                        },
                    )

            try:
                transcript = await audio_processor.process_voice(lang, voice)
                transcription = transcript.get("text", None)
                if transcription is None:
                    return JSONResponse(
                        status_code=400,
                        content={
                            "success": False,
                            "message": "No transcriptions found",
                            "details": func_response.text
                        }
                    )
                prompt = transcription
            except Exception as e:
                return JSONResponse(
                    status_code=500,
                    content={
                        "success": False,
                        "message": "Error while transcripting text",
                        "details": func_response.text
                    }
                )


        match prompt.prompt:
            case "Find my nearest pollsites":
                parsed_address = None
                try:
                    parsed_address = parse_address(prefs_data.address)
                    response = await get_pollsite_info(**parsed_address)
                    summary = summarize_pollsite(response)
                    return ChatResponse(
                        success=True,
                        data=ChatData(
                            role="assistant",
                            content=summary
                        ),
                        message="Fetched pollsite summary"
                    )

                except Exception as e:
                    return JSONResponse(
                        status_code=400,
                        content=ChatResponse(
                            success=False,
                            message=f"An error occurred while checking nearest pollsites. Please check your address. Error: {e}"
                        ).dict()
                    )

            case "Trending discussions in my area":
                if prefs_data.location:
                    posts_cursor = config.db["posts"].find({
                        "location": location
                    }).limit(3)
                    posts = []
                    async for post in posts_cursor:
                        post["post_id"] = str(post.pop("_id"))
                        posts.append(PostResponse(**post))
                    posts.sort(key=lambda x: x.created_at, reverse=True)
                    if not posts:
                        return ChatResponse(
                            success=True,
                            message="No trending posts in your area right now.",
                            data=ChatData(
                                role="assistant",
                                content="No trending posts in your area right now."
                            )
                        )

                    md = "# Trending Discussions Near You\n\n"
                    for idx, post in enumerate(posts, start=1):
                        md += f"### {idx}. {post.title}\n"
                        if post.description:
                            md += f"{post.description}\n"
                        if post.tags:
                            md += f"**Tags:** {', '.join(post.tags)}\n"
                        md += "\n---\n\n"
                    return ChatResponse(
                        success=True,
                        message="Successfully fetched trending posts",
                        data=ChatData(
                            role="assistant",
                            content=md
                        )
                    )
                else:
                    return JSONResponse(
                        status_code=400,
                        content=ChatResponse(
                           success=False,
                            message="User interests or location not set"
                        ).dict()
                    )

            case "Accessibility options available at my nearest polling sites":
                parsed_address = None
                try:
                    parsed_address = parse_address(prefs_data.address)
                    response = await get_pollsite_info(**parsed_address)
                    accessibility_summary = summarize_accessibility(response)
                    return ChatResponse(
                        success=True,
                        data=ChatData(
                            role="assistant",
                            content=accessibility_summary
                        ),
                        message="Fetched pollsite accessibility summary"
                    )

                except Exception as e:
                    return JSONResponse(
                        status_code=400,
                        content=ChatResponse(
                            success=False,
                            message="An error occurred while checking nearest pollsites. Please check your address."
                        ).dict()
                    )

            case _:
                credential = DefaultAzureCredential()
                async with credential:
                    project_client: AIProjectClient = AIProjectClient(
                        endpoint=config.env.azure_foundry_project_endpoint,
                        credential=credential,
                    )
                    async with project_client:
                        agents_client: AgentsClient = project_client.agents
                        bing_connection_id = (await project_client.connections.get(
                            config.env.bing_tool_connection_name
                        )).id
                        bing = BingGroundingTool(
                            connection_id=bing_connection_id,
                            market=config.market_codes.get(language) or "en-US",
                            set_lang=prefs_data.language,
                            count=3
                        )
                        ai_search = AzureAISearchTool(
                           index_connection_id=config.env.ai_search_tool_connection_name,
                           index_name=config.env.ai_search_index_name,
                           query_type=AzureAISearchQueryType.SIMPLE,
                           top_k=2,
                           filter=""
                        )
                        toolset = AsyncToolSet()
                        toolset.add(bing)
                        toolset.add(ai_search)
                        agents_client.enable_auto_function_calls(toolset)
                        agent = await agents_client.create_agent(
                            model=config.env.ai_agent_model_name,
                            name="civicsphere-agent-bot",
                            instructions=instructions,
                            toolset=toolset,
                        )

                        run = await agents_client.create_thread_and_process_run(
                                agent_id=agent.id,
                                thread=AgentThreadCreationOptions(
                                    messages=[ThreadMessageOptions(role="user", content=prompt.prompt)]
                                ),
                            )

                        if run.status == "failed":
                            logging.error("Error occurred in /chat endpoint")
                            return JSONResponse(
                                status_code=500,
                                content=ChatResponse(
                                    success=False,
                                    message=f"Failed to retrieve response from chat agent. Error: {run.last_error}"
                                ).model_dump()
                            )


                        messages = agents_client.messages.list(
                            thread_id=run.thread_id,
                            order=ListSortOrder.ASCENDING,
                        )
                        async for msg in messages:
                            last_part = msg.content[-1]
                            if isinstance(last_part, MessageTextContent):
                                responses = []
                                responses.append(text_message.text.value)
                                message = " ".join(responses)
                                for annotation in msg.url_citation_annotations:
                                    message = message.replace(
                                        annotation.text, f" [{annotation.url_citation.title}]({annotation.url_citation.url})"
                                    )
                                await agents_client.delete_agent(agent.id)
                                return ChatResponse(
                                    success=True,
                                    message="Agent executed successfully",
                                    data=ChatData(
                                        role=msg.role,
                                        content=last_part.text.value
                                    )
                                )

    except ValueError as e:
        return JSONResponse(status_code=400, content=ChatResponse(success=False, message=str(e)).model_dump())

    except Exception as e:
        logging.exception("Error occurred in /chat endpoint")
        return JSONResponse(
            status_code=500,
            content=ChatResponse(
                success=False,
                message=str(e)
            ).model_dump()
        )


