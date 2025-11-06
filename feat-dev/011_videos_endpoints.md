# Tool: Videos

**Description:** This tool provides a set of functions to interact with the videos endpoints of the LiteLLM API. It allows you to list, generate, and manage videos.

**Functions:**

- `list_videos()`: Retrieves a list of all available videos. This function uses the `/videos` and `/v1/videos` endpoints.
- `generate_video(prompt)`: Generates a new video from a text prompt. This function uses the `/videos` and `/v1/videos` endpoints.
- `get_video_status(video_id)`: Retrieves the status of a specific video. This function uses the `/videos/{video_id}` and `/v1/videos/{video_id}` endpoints.
- `get_video_content(video_id)`: Downloads the content of a specific video. This function uses the `/videos/{video_id}/content` and `/v1/videos/{video_id}/content` endpoints.
- `remix_video(video_id, prompt)`: Remixes an existing video with a new prompt. This function uses the `/videos/{video_id}/remix` and `/v1/videos/{video_id}/remix` endpoints.

**API Endpoints:**

- **GET /videos**: Retrieves a list of all available videos.
- **POST /videos**: Generates a new video from a text prompt.
- **GET /v1/videos**: Retrieves a list of all available videos.
- **POST /v1/videos**: Generates a new video from a text prompt.
- **GET /videos/{video_id}**: Retrieves the status of a specific video.
- **GET /v1/videos/{video_id}**: Retrieves the status of a specific video.
- **GET /videos/{video_id}/content**: Downloads the content of a specific video.
- **GET /v1/videos/{video_id}/content**: Downloads the content of a specific video.
- **POST /videos/{video_id}/remix**: Remixes an existing video with a new prompt.
- **POST /v1/videos/{video_id}/remix**: Remixes an existing video with a new prompt.