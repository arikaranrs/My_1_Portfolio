FROM python:3.11-slim

WORKDIR /app

# Copy requirements and install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy backend files
COPY . .

EXPOSE 5000

ENV PORT=5000
ENV FLASK_ENV=production

CMD ["python", "flask_server.py"]
