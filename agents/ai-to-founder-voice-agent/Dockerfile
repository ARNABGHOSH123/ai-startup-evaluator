# Use an official Python runtime as a parent image
FROM python:3.11-slim

# Prevents Python from writing .pyc files and buffers stdout/stderr
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1

# Set working directory
WORKDIR /app

# Install system dependencies only if needed by some libs (kept minimal)
# RUN apt-get update && apt-get install -y --no-install-recommends \
#     build-essential \
#  && rm -rf /var/lib/apt/lists/*

# Install Python dependencies first (better layer caching)
COPY requirements.txt /app/
RUN pip install --upgrade pip && \
    pip install -r requirements.txt

# Copy application code
COPY . /app

# Expose the port (Cloud Run will set PORT env var; default to 8080)
EXPOSE 8080

# Start the FastAPI app with Uvicorn
# Use PORT provided by Cloud Run (default to 8080 for local run)
CMD ["bash", "-lc", "uvicorn main:app --host 0.0.0.0 --port ${PORT:-8080}"]
