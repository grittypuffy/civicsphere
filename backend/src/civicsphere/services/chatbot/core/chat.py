from azure.identity.aio import DefaultAzureCredential
from azure.ai.projects.aio import AIProjectClient
from azure.ai.agents.aio import AgentsClient
from azure.ai.agents.models import ListSortOrder, AsyncToolSet, BingGroundingTool, AzureAISearchTool, AzureAISearchQueryType
from ....config import AppConfig
from ....models.api.chat import ChatData
from ....models.api.user import UserPreferences
from ....models.api.chat import ChatResponse
import logging

config = AppConfig()

instructions = """\
You are a helpful civilian assistant that answers local community query, political query, and provides information on local policies and laws for NYC.

If the user asks about candidates or voting, provide factual information about the candidates but DO NOT provide specific recommendations or show bias. Maintain strict neutrality and fairness.

Keep your responses concise, relevant, and use simple language that is easy to understand.

Guidelines:
- Use simple language
- Be unbiased and neutral, especially regarding elections.
- Do not say "You should vote for X". Instead, say "Candidate X supports Y".
- Provide factual data with citations
"""

async def create_agent_and_run_query(prompt: str, language: str, prefs_data: UserPreferences) -> str:
    """Create an AI agent, run the query, and return the response."""
    credential = DefaultAzureCredential()
    async with credential:
        project_client = AIProjectClient(endpoint=config.env.azure_foundry_project_endpoint, credential=credential)
        async with project_client:
            agents_client: AgentsClient = project_client.agents

            # Get the Bing tool connection ID
            bing_connection_id = (await project_client.connections.get(config.env.bing_tool_connection_name)).id

            # Set up Bing grounding tool
            bing = BingGroundingTool(
                connection_id=bing_connection_id,
                market=config.market_codes.get(language, "en-US"),
                set_lang=prefs_data.language,
                count=3
            )

            # Set up Azure AI search tool
            ai_search = AzureAISearchTool(
                index_connection_id=config.env.ai_search_tool_connection_name,
                index_name=config.env.ai_search_index_name,
                query_type=AzureAISearchQueryType.SIMPLE,
                top_k=2,
                filter=""
            )

            # Create the toolset and add tools
            toolset = AsyncToolSet()
            toolset.add(bing)
            toolset.add(ai_search)

            # Enable automatic function calls for the agent
            agents_client.enable_auto_function_calls(toolset)

            # Create the agent
            agent = await agents_client.create_agent(
                model=config.env.ai_agent_model_name,
                name="civicsphere-agent-bot",
                instructions=instructions,
                toolset=toolset,
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
            messages = agents_client.messages.list(thread_id=run.thread_id, order=ListSortOrder.ASCENDING)
            async for msg in messages:
                last_part = msg.content[-1]
                if isinstance(last_part, MessageTextContent):
                    # Format the response text with citations
                    response = " ".join([text_message.text.value for text_message in msg.content])
                    for annotation in msg.url_citation_annotations:
                        response = response.replace(annotation.text, f" [{annotation.url_citation.title}]({annotation.url_citation.url})")
                    await agents_client.delete_agent(agent.id)  # Clean up the agent after use
                    return response

            # Fallback if no response found
            raise Exception("Agent returned no valid response.")
