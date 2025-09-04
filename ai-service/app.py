import json
from flask import Flask, request, jsonify
from flask_cors import CORS
from google import genai
from config import ApiConfig
from pymongo import MongoClient
import datetime

# Initialize Flask app
app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# --- AI Configuration ---
config = ApiConfig()
client = genai.Client(
    api_key=config.GEMINI_API_KEY,
    # vertexai=True,
    # project=config.VERTEX_PROJECT_ID,
    # location=config.VERTEX_LOCATION
)
# -------------------------

# --- Database Configuration ---
try:
    mongo_client = MongoClient(config.MONGODB_CONNECTION_STRING)
    db = mongo_client[config.MONGODB_DB_NAME]
    symptom_histories = db.symptomHistories         
    print("MongoDB connection successful.")
except Exception as e:
    print(f"MongoDB connection failed: {e}")        
# ---------------------------


@app.route('/api/symptom-checker', methods=['POST'])
def symptom_check():
    
    """
    Handles the conversational symptom check.
    """
    data = request.get_json()
    if not data or 'history' not in data or 'userId' not in data:
        return jsonify({"error": "Invalid request. 'history' and 'userId' are required."}), 400

    history = data.get('history', [])
    user_id = data.get('userId')
    conversation = "\n".join([f"Q: {item.get('question', '')}\nA: {item.get('answer', '')}" for item in history])

    if len(history) >= 10:
        
        # For final analysis
        prompt = f"""
            The conversation history is:\n{conversation}\n
            You have reached the maximum number of questions (10).
            
            You are an AI Medical Analyst. Your function is to synthesize the entirety of a user's conversation into a structured, educational, and safe final analysis. You must act with the utmost caution, prioritizing user safety and clarity.

            CORE PRINCIPLES:
            1. Synthesize, Don't Diagnose: Your analysis is a summary of information and possibilities, not a medical diagnosis.
            2. Stratify Risk: Clearly differentiate between conditions that can be managed at home, those that require a doctor's visit, and those that are urgent.
            3. Provide Rationale: Do not simply state possibilities. Briefly explain why the user's symptoms align with a particular suggestion. This demonstrates your reasoning.
                        
            INSTRUCTIONS:          
            1. Summarize: Briefly summarize the key symptoms the user has described.
            2. Suggest Causes: List 2-3 potential, common causes for the symptoms. Do not list rare or life-threatening conditions unless it is a clear emergency.
            3. Treatment Plans: Suggest safe, general next steps. NEVER prescribe medication. Focus on actions like "Consult a healthcare professional," "Monitor your symptoms," or "Consider over-the-counter pain relievers if appropriate."            
            
            """ + """
            Format the output as a single JSON object with the following keys:
            'summary': A brief summary of the key symptoms.
            'suggested_causes': A list of 2-3 potential causes for the symptoms.
            'treatment_plans': A list of 2-3 recommended actions for the user.
            'is_final': A boolean indicating whether this is the final response.
            
            Example: 
            {
                "summary": "...",
                "suggested_causes": [
                    {"name": "...", "description": "..."}
                ],
                "treatment_plans": [
                    {"action": "...", "details": "..."}
                ],
                "is_final": true
            }          
            
            """
        
    elif len(history) == 0:
        # For Initial question
        prompt = """
            You are a helpful and professional AI Medical Assistant. Your goal is to initiate a conversation to understand a user's health concern in a welcoming and clear manner.

            YOUR TASK:
            Generate the very first message for the user. This message must include:

            1. A brief, friendly greeting.
            2. A single, clear question to identify their primary symptom.
            3. A list of 5-6 common, high-level symptom categories as options.
            4. An "Other" option to ensure the user can always proceed.   
            
            FORMATTING INSTRUCTIONS:
            Format the output as a single JSON object with the following keys:
            'question': The question to ask the user.
            'options': A list of options for the user to choose from.
            'is_final': A boolean indicating whether this is the final response.
            
            Example: 
            {
                "question": "What is the primary symptom or health concern you are experiencing?",
                "options": [
                    "Head, Neck, or Throat Issue",
                    "Chest or Abdominal Pain",
                    "Fever or Flu-like Symptoms",
                    "Skin Issue (e.g., rash, lump)",
                    "Dizziness or Weakness",
                    "Something else"
                ],
                "is_final": false
            }
            """
    else:
        # For follow-up questions
        prompt = f"""
            You are an AI Medical Triage Assistant. Your primary goal is to help users understand their symptoms by asking targeted questions. You must be empathetic, clear, and cautious.

            CRITICAL DIRECTIVES:
            You are NOT a doctor. Your analysis is not a diagnosis. Your primary function is to gather information and suggest appropriate next steps.
            Emergency Detection: If at any point the user's symptoms suggest a medical emergency (e.g., severe chest pain, difficulty breathing, uncontrolled bleeding, sudden confusion, signs of a stroke), your only response must be a final analysis advising them to contact emergency services immediately.

            YOUR TASK:
            Based on the provided {conversation}, determine the next logical step.
            Analyze the Conversation: Review the user's symptoms and your previous questions.

            Decide Your Action:
            If more information is needed and you are under the 10-question limit, ask the single most important follow-up question to narrow down the potential causes.
            If you have enough information or have reached the 10-question limit, provide a final analysis.

            """ + """
            INSTRUCTIONS FOR ASKING A QUESTION:
            Formulate a Question: Base your question on a standard diagnostic framework (e.g., OPQRST: Onset, Provocation/Palliation, Quality, Region/Radiation, Severity, Timing). For example, ask about the symptom's location, what makes it better or worse, its duration, or its severity.
            Provide Options: Offer 4-5 clear, distinct, and helpful multiple-choice options.
            
            Format: 
            Respond with the following JSON structure:
            {
                "question": "...", 
                "options": ["...", "...", "..."], 
                "is_final": false
            }    
            
            """



    # Generate response
    try:

        response = client.models.generate_content(
            model="gemini-2.0-flash",
            contents=prompt,)
        # config=GenerateContentConfig(
        #     system_instruction=system_instruction,
        #     ))
        
        # Clean the response to ensure it's valid JSON
        cleaned_text = response.text.strip().lstrip('```json').rstrip('```').strip()
        response_json = json.loads(cleaned_text)
        
        print("Response JSON:", response_json)
        # If the analysis is final, save it to the database
        if response_json.get('is_final'):
            try:
                # Use update_one with upsert=True to create a new document if one doesn't exist.
                # This is a more robust approach than finding and then updating.
                symptom_histories.update_one(
                    {'userId': user_id, 'createdAt': datetime.datetime.now()},
                    {'$set': {
                        'analysis': response_json,
                        'symptoms': history
                        }
                    },
                )
                print(f"Final analysis saved for user {user_id}")
            except Exception as e:
                print(f"Error saving to MongoDB: {e}")

        return jsonify(response_json)
    
    
    
    # Exception Handling
    except json.JSONDecodeError:
        print("AI response was not valid JSON.")
        return jsonify({"error": "AI response was not valid JSON."}), 500
    except Exception as e:
        print(f"An unexpected error occurred: {e}")
        return jsonify({"error": "An unexpected error occurred with the AI service."}), 500



# Main Component Server
if __name__ == '__main__':
    app.run(port=5328, debug=True)

