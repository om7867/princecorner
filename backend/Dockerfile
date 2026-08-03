FROM python:3.11-slim

WORKDIR /app

# Install system dependencies needed for python packages (e.g. postgresql client libs)
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    libpq-dev \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Copy dependencies list and install
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application source
COPY . .

# Expose backend port
EXPOSE 8000

# Entry script runs seeding/migrations and starts Uvicorn ASGI server
CMD ["sh", "-c", "python -m app.seed && uvicorn app.main:app --host 0.0.0.0 --port 8000"]
