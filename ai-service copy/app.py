import json
from flask import Flask, request, jsonify
from flask_cors import CORS
from google import genai
from config import ApiConfig
from pymongo import MongoClient
from bson.objectid import ObjectId
from datetime import datetime

# Initialize Flask app
app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# --- AI Configuration ---
config = ApiConfig()
client = genai.Client(
    # api_key=config.GEMINI_API_KEY,
    vertexai=True,
    project=config.VERTEX_PROJECT_ID,
    location=config.VERTEX_LOCATION
)
# -------------------------

# --- Database Configuration ---
try:
    client = MongoClient(config.MONGODB_CONNECTION_STRING)
    db = client[config.MONGODB_DB_NAME]
    assessments_collection = db.assessments
    print("Successfully connected to MongoDB.")
except Exception as e:
    print(f"Failed to connect to MongoDB: {e}")
    client = None
# ----------------------------

@app.route('/api/symptom-tracker', methods=['POST', 'GET'])
def symptom_check():
    """Handles the conversational symptom check."""
    data = request.get_json()
    if not data or 'history' not in data:
        return jsonify({"error": "Invalid request. 'history' is required."}), 400

    history = data.get('history', [])
    user_id = data.get('userId')
    conversation = "\n".join([f"Q: {item.get('question', '')}\nA: {item.get('answer', '')}" for item in history])

    if len(history) >= 10:
        prompt = f"""
        The conversation history is:\n{conversation}\n
        You have reached the maximum number of questions (10). Based on the complete history, you MUST provide a final analysis with possible causes and recommended actions. Do not ask any more questions.
        
        Respond in JSON format for a final analysis: {{"analysis": "...", "is_final": true}}
        """
    elif not history:
        # Initial question
        prompt = """
        You are an AI medical assistant. Your first task is to ask the user about their primary symptom. Please provide a question and 4-5 relevant options.
        Format the output as a JSON object with three keys: 'question' (string), 'options' (array of strings), and 'is_final' (boolean, set to false).
        Example: {"question": "What is your primary symptom?", "options": ["Headache", "Fever", "Cough", "Fatigue"], "is_final": false}
        """
    else:
        prompt = f"""
        Continue a conversation with a user about their symptoms. The history is:\n{conversation}\n
        Based on this, ask the next most relevant question to diagnose the issue, providing 4-5 options.
        If you have enough information, provide a final analysis with possible causes and recommended actions.
        A maximum of you can ask the user are 10 questions in total. Count the conversation first before releasing a new question.
        
        Respond in JSON. 
        For a question: {{"question": "...", "options": ["..."], "is_final": false}}
        For a final analysis: {{"analysis": "...", "is_final": true}}
        """

    try:
        response = client.models.generate_content(
            model="gemini-2.0-flash-001",
            contents=prompt,)
            # config=GenerateContentConfig(
            #     system_instruction=system_instruction,
            #     ))
        # Clean the response to ensure it's valid JSON
        cleaned_text = response.text.strip().lstrip('```json').rstrip('```').strip()
        response_json = json.loads(cleaned_text)

        # If the analysis is final, save it to the database
        if response_json.get('is_final') and client:
            try:
                assessment_doc = {
                    "history": history,
                    "analysis": response_json.get('analysis'),
                    "createdAt": datetime.utcnow(),
                }
                if user_id:
                    assessment_doc['userId'] = ObjectId(user_id)
                assessments_collection.insert_one(assessment_doc)
            except Exception as e:
                print(f"Failed to save assessment to database: {e}")

        return jsonify(response_json)
    
    except json.JSONDecodeError:
        return jsonify({"error": "AI response was not valid JSON."}), 500
    except Exception as e:
        print(f"An unexpected error occurred: {e}")
        return jsonify({"error": "An unexpected error occurred with the AI service."}), 500


if __name__ == '__main__':
    app.run(port=5328, debug=True)

