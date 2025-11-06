# Tool: Fine-Tuning

**Description:** This tool provides a set of functions to interact with the fine-tuning endpoints of the LiteLLM API. It allows you to create, manage, and retrieve fine-tuning jobs.

**Functions:**

- `create_fine_tuning_job(model, training_file, **kwargs)`: Creates a new fine-tuning job. This function uses the `/fine_tuning/jobs` and `/v1/fine_tuning/jobs` endpoints.
- `list_fine_tuning_jobs()`: Retrieves a list of all available fine-tuning jobs. This function uses the `/fine_tuning/jobs` and `/v1/fine_tuning/jobs` endpoints.
- `retrieve_fine_tuning_job(fine_tuning_job_id)`: Retrieves a specific fine-tuning job. This function uses the `/fine_tuning/jobs/{fine_tuning_job_id}` and `/v1/fine_tuning/jobs/{fine_tuning_job_id}` endpoints.
- `cancel_fine_tuning_job(fine_tuning_job_id)`: Cancels a specific fine-tuning job. This function uses the `/fine_tuning/jobs/{fine_tuning_job_id}/cancel` and `/v1/fine_tuning/jobs/{fine_tuning_job_id}/cancel` endpoints.

**API Endpoints:**

- **POST /fine_tuning/jobs**: Creates a new fine-tuning job.
- **GET /fine_tuning/jobs**: Retrieves a list of all available fine-tuning jobs.
- **POST /v1/fine_tuning/jobs**: Creates a new fine-tuning job.
- **GET /v1/fine_tuning/jobs**: Retrieves a list of all available fine-tuning jobs.
- **GET /fine_tuning/jobs/{fine_tuning_job_id}**: Retrieves a specific fine-tuning job.
- **GET /v1/fine_tuning/jobs/{fine_tuning_job_id}**: Retrieves a specific fine-tuning job.
- **POST /fine_tuning/jobs/{fine_tuning_job_id}/cancel**: Cancels a specific fine-tuning job.
- **POST /v1/fine_tuning/jobs/{fine_tuning_job_id}/cancel**: Cancels a specific fine-tuning job.