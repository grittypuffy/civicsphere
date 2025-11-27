from fastapi import UploadFile

from ....config import AppConfig
from ....models.api.post import PostResponse
from ..scraper.web.nyc import (
    parse_address,
    get_pollsite_info,
    summarize_pollsite,
    summarize_accessibility,
)

from ....services.media_processors.audio import AudioProcessor

config: AppConfig = AppConfig()

async def process_voice_prompt(voice: UploadFile, language: str) -> str:
    """Process a voice file input and return its transcribed text."""
    match voice.content_type:
        case ("audio/wav" | "video/webm"):
            try:
                audio_processor: AudioProcessor = AudioProcessor()
                transcript = await audio_processor.process_voice_prompt(language, voice)
            except Exception as e:
                raise RuntimeError(f"Error while transcribing voice: {e}") from e

            if not transcript or "text" not in transcript:
                raise ValueError("Transcription failed: No 'text' in response.")

            return transcript.get("text")

        case _:
            raise ValueError(f"Unsupported voice format: {voice_content_type}")

async def get_pollsite_summary(address: str) -> str:
    """Fetch and summarize polling site information."""
    parsed_address = parse_address(address)
    result = await get_pollsite_info(**parsed_address)
    return summarize_pollsite(result)


async def get_accessibility_summary(address: str) -> str:
    """Fetch and summarize polling site accessibility information."""
    parsed_address = parse_address(address)
    result = await get_pollsite_info(**parsed_address)
    return summarize_accessibility(result)


async def get_trending_posts(location: str) -> str:
    """Fetch and format trending posts for a given location."""
    posts_cursor = (
        config.db["posts"]
        .find({"location": location})
        .limit(3)
    )

    posts = []
    async for post in posts_cursor:
        post["post_id"] = str(post.pop("_id"))
        posts.append(PostResponse(**post))

    posts.sort(key=lambda p: p.created_at, reverse=True)

    if not posts:
        return "No trending posts in your area right now."

    markdown = "# Trending Discussions Near You\n\n"
    for idx, post in enumerate(posts, start=1):
        markdown += f"### {idx}. {post.title}\n"
        if post.description:
            markdown += f"{post.description}\n"
        if post.tags:
            markdown += f"**Tags:** {', '.join(post.tags)}\n"
        markdown += "\n---\n\n"

    return markdown
