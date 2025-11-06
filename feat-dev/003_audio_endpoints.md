# Tool: Audio

**Description:** This tool provides a set of functions to interact with the audio endpoints of the LiteLLM API. It allows you to create audio transcriptions and generate audio from text.

**Functions:**

- `create_audio_transcription(file)`: Creates an audio transcription from an audio file. This function uses the `/audio/transcriptions` and `/v1/audio/transcriptions` endpoints.
- `create_audio_speech(text)`: Generates audio from text. This function uses the `/audio/speech` and `/v1/audio/speech` endpoints.

**API Endpoints:**

- **POST /audio/transcriptions**: Creates an audio transcription from an audio file.
- **POST /v1/audio/transcriptions**: Creates an audio transcription from an audio file.
- **POST /audio/speech**: Generates audio from text.
- **POST /v1/audio/speech**: Generates audio from text.