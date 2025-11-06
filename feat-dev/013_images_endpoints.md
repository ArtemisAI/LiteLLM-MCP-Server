# Tool: Images

**Description:** This tool provides a set of functions to interact with the images endpoints of the LiteLLM API. It allows you to generate and edit images.

**Functions:**

- `generate_image(prompt, **kwargs)`: Generates a new image from a text prompt. This function uses the `/images/generations`, `/v1/images/generations`, and `/openai/deployments/{model}/images/generations` endpoints.
- `edit_image(image, prompt, **kwargs)`: Edits an existing image based on a text prompt. This function uses the `/images/edits`, `/v1/images/edits`, and `/openai/deployments/{model}/images/edits` endpoints.

**API Endpoints:**

- **POST /images/generations**: Generates a new image from a text prompt.
- **POST /v1/images/generations**: Generates a new image from a text prompt.
- **POST /openai/deployments/{model}/images/generations**: Generates a new image from a text prompt for a specific model deployment.
- **POST /images/edits**: Edits an existing image based on a text prompt.
- **POST /v1/images/edits**: Edits an existing image based on a text prompt.
- **POST /openai/deployments/{model}/images/edits**: Edits an existing image based on a text prompt for a specific model deployment.