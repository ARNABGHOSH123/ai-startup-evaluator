# ---------- builder stage ----------
FROM python:3.13-slim AS builder
WORKDIR /app

ENV DEBIAN_FRONTEND=noninteractive

# Install build deps (only in builder)
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential gcc ca-certificates \
 && rm -rf /var/lib/apt/lists/*

# Copy only dependency manifest first to leverage docker cache
COPY requirements.txt /app/requirements.txt

# Install into a prefix so we can copy to runtime
RUN python -m pip install --upgrade pip setuptools wheel \
 && python -m pip install --prefix=/install --no-cache-dir -r /app/requirements.txt

# Copy app source
COPY . /app

# ---------- runtime stage ----------
FROM python:3.13-slim AS runtime
WORKDIR /app

# Create non-root user
RUN adduser --disabled-password --gecos "" myuser \
 && mkdir -p /home/myuser/.local \
 && chown -R myuser:myuser /home/myuser

# Install LibreOffice and basic fonts for Office->PDF conversion
USER root
RUN apt-get update && apt-get install -y --no-install-recommends \
    libreoffice-writer libreoffice-impress libreoffice-core \
    fonts-dejavu fonts-liberation ffmpeg \
 && rm -rf /var/lib/apt/lists/*
USER myuser

# Copy installed packages from builder
COPY --from=builder /install /usr/local
# Copy app code
COPY --from=builder /app /app

ENV PATH="/home/myuser/.local/bin:/usr/local/bin:$PATH" \
    PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    JOB_RUN_TIMEOUT_SECONDS=900

# Make sure files owned by non-root user
RUN chown -R myuser:myuser /app

USER myuser
WORKDIR /app

# Default entrypoint: run your job script (main.py at project root)
# Cloud Run Job will use ENTRYPOINT by default; overrides possible during job execute.
ENTRYPOINT ["python", "/app/main.py"]