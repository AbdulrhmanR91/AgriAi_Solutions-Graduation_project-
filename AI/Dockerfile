FROM python:3.8-slim

WORKDIR /app

COPY requirements.txt /app/
RUN pip install --upgrade pip && pip install -r requirements.txt

COPY . /app

CMD ["uvicorn", "API:app", "--host", "0.0.0.0", "--port", "8080"]
