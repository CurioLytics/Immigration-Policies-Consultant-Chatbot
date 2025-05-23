# Use an official Python runtime as a parent image
FROM python:3.12-alpine

# # Set environment variables
# ENV PYTHONDONTWRITEBYTECODE 1
# ENV PYTHONUNBUFFERED 1

# Install system dependencies
# Alpine Linux uses 'apk' instead of 'apt-get'
# 'build-base' is a meta-package that includes gcc and other common build tools.
# 'python3-dev' provides headers for building Python C extensions.
# 'postgresql-dev' provides headers for libpq (for PostgreSQL).
RUN apk update && apk add --no-cache \
    build-base \
    python3-dev \
    postgresql-dev \
    # Add any other system dependencies here if needed
    && rm -rf /var/cache/apk/*

# Create and set the working directory
WORKDIR /app

# Copy the current directory contents into the container at /app
COPY . /app

# Install any needed packages specified in requirements.txt
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

# Make port 5000 available to the world outside this container
EXPOSE 5000

# Set the Flask application
ENV FLASK_APP=main.py

# Run the Flask development server
CMD ["python", "main.py", "--host=0.0.0.0", "--port=5000"]
