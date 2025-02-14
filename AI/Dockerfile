# استخدام صورة Python خفيفة
FROM python:3.8-slim

# تحديد مجلد العمل
WORKDIR /app

# نسخ ملف المتطلبات وتثبيتها
COPY requirements.txt /app/
RUN pip install --upgrade pip && pip install -r requirements.txt

# نسخ باقي ملفات المشروع
COPY . /app

# تشغيل التطبيق باستخدام Uvicorn
CMD ["uvicorn", "API:app", "--host", "0.0.0.0", "--port", "8080"]
