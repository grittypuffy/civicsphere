import logging
from typing import Optional
from azure.identity.aio import DefaultAzureCredential
from azure.ai.projects.aio import AIProjectClient
from azure.ai.agents.aio import AgentsClient
from azure.ai.agents.models import (
    AgentThreadCreationOptions,
    ThreadMessageOptions,
    MessageTextContent,
)
from azure.ai.agents.models import (
    ListSortOrder,
    AsyncToolSet,
    BingGroundingTool,
    AzureAISearchTool,
    AzureAISearchQueryType,
)
from src.civicsphere.config import AppConfig
from src.civicsphere.models.api.chat import ChatData, ChatResponse

config = AppConfig()

async def execute_agent_query(
    prompt: str, language: str, user_language: str
) -> str:
    """Create an AI agent, run the query, and return the response."""
    credential = DefaultAzureCredential()
    instructions = f"""\
You are a helpful civilian assistant that answers local community query, political query, and provides information on local policies and laws for NYC.

If the user asks about candidates or voting, provide factual information about the candidates but DO NOT provide specific recommendations or show bias. Maintain strict neutrality and fairness.

Keep your responses concise, relevant, and use simple language that is easy to understand.

Guidelines:
- Use simple language and answer with language code {user_language}
- Be unbiased and neutral, especially regarding elections.
- Do not say You should vote for X. Instead, say Candidate X supports Y.
- Provide factual data with citations
"""

    async with credential:
        project_client = AIProjectClient(
            endpoint=config.env.azure_foundry_project_endpoint, credential=credential
        )
        async with project_client:
            agents_client: AgentsClient = project_client.agents

            # Get the Bing tool connection ID
            bing_connection_id = (
                await project_client.connections.get(
                    config.env.bing_tool_connection_name
                )
            ).id

            # Set up Bing grounding tool
            bing = BingGroundingTool(
                connection_id=bing_connection_id,
                market=language or "en-US",
                set_lang=user_language,
                count=3,
            )

            # Set up Azure AI search tool
            ai_search = AzureAISearchTool(
                index_connection_id=config.env.ai_search_tool_connection_name,
                index_name=config.env.ai_search_index_name,
                query_type=AzureAISearchQueryType.SIMPLE,
                top_k=2,
                filter="",
            )
            bing_search_def = bing.definitions
            definition = [*bing_search_def]
            definition.extend(ai_search.definitions)

            # Create the agent
            agent = await agents_client.create_agent(
                model=config.env.ai_agent_model_name,
                name="civicsphere-agent-bot",
                instructions=instructions,
                tools=definition,
                tool_resources=bing.resources,
            )

            # Create a new thread and process the query
            run = await agents_client.create_thread_and_process_run(
                agent_id=agent.id,
                thread=AgentThreadCreationOptions(
                    messages=[ThreadMessageOptions(role="user", content=prompt)]
                ),
            )

            if run.status == "failed":
                error_message = f"Failed to retrieve response from chat agent. Error: {run.last_error}"
                logging.error(error_message)
                raise Exception(error_message)

            # Retrieve the response from the agent
            messages = agents_client.messages.list(
                thread_id=run.thread_id, order=ListSortOrder.ASCENDING
            )
            last_message = None
            # Collect all the messages (or find the last one directly)
            async for msg in messages:
                last_message = msg
            if last_message:
                last_part = last_message.content[-1]
                if isinstance(last_part, MessageTextContent):
                    # Format the response text with citations
                    response = " ".join(
                        [
                            text_message.text.value
                            for text_message in last_message.content
                        ]
                    )
                    for annotation in msg.url_citation_annotations:
                        response = response.replace(
                            annotation.text,
                            f" [{annotation.url_citation.title}]({annotation.url_citation.url})",
                        )
                    response += f"\nReference: Bing: https://www.bing.com/search?q={prompt}"
                    await agents_client.delete_agent(
                        agent.id
                    )  # Clean up the agent after use
                    return response

            # Fallback if no response found
            raise Exception("Agent returned no valid response.")
