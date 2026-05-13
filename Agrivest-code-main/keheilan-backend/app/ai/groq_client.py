# =============================================================================
# app/ai/groq_client.py
# Wrapper around Groq API for Whisper voice transcription (free tier).
# =============================================================================

from flask import current_app


def transcribe(audio_file) -> str | None:
    """
    Transcribe an audio file using Groq's Whisper endpoint.
    `audio_file` is a Flask FileStorage object from request.files.
    Returns the transcript text or None on failure.
    """
    api_key = current_app.config.get("GROQ_API_KEY")
    if not api_key:
        return None
    try:
        from groq import Groq
        client = Groq(api_key=api_key)
        transcription = client.audio.transcriptions.create(
            model="whisper-large-v3",
            file=(audio_file.filename, audio_file.stream.read()),
            language="ar",  # default to Arabic — farmers are Egyptian
        )
        return transcription.text.strip()
    except Exception as e:
        current_app.logger.error(f"Groq Whisper error: {e}")
        return None


def chat(system_prompt: str, user_message: str, max_tokens: int = 512) -> str | None:
    """
    Send a chat message to Groq using LLaMA 3.3 70B.
    Free tier: 14,400 requests/day — independent from Gemini quota.
    Returns the assistant reply or None on failure.
    """
    api_key = current_app.config.get("GROQ_API_KEY")
    if not api_key:
        return None
    try:
        from groq import Groq
        client = Groq(api_key=api_key)
        completion = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user",   "content": user_message},
            ],
            max_tokens=max_tokens,
            temperature=0.5,
        )
        return completion.choices[0].message.content.strip()
    except Exception as e:
        current_app.logger.error(f"Groq Chat error: {e}")
        return None

