import os
from dotenv import load_dotenv

load_dotenv()

class ApiConfig:

    SECRET_KEY = os.getenv('SECRET_KEY')

    # MongoDB Database Configuration
    MONGODB_CONNECTION_STRING = os.getenv('MONGODB_CONNECTION_STRING')
    MONGODB_DB_NAME = os.getenv('MONGODB_DB_NAME')
    MONGODB_URI = os.getenv("MONGODB_URI")

    #Vertex AI API Configuration
    VERTEX_PROJECT_ID = os.getenv('VERTEX_PROJECT_ID')
    VERTEX_LOCATION = os.getenv('VERTEX_LOCATION')
    GEMINI_API_KEY = os.getenv('GEMINI_API_KEY')
