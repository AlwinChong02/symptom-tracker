import json
from flask import Flask, request, jsonify
from flask_cors import CORS
from google import genai
from config import ApiConfig

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

@app.route('/api/symptom-checker', methods=['POST'])
def symptom_check():
    
    """
    Handles the conversational symptom check.
    """
    data = request.get_json()
    if not data or 'history' not in data:
        return jsonify({"error": "Invalid request. 'history' is required."}), 400

    history = data.get('history', [])
    conversation = "\n".join([f"Q: {item.get('question', '')}\nA: {item.get('answer', '')}" for item in history])

    if len(history) >= 10:
        prompt = f"""
        The conversation history is:\n{conversation}\n
        You have reached the maximum number of questions (10). Based on the complete history, you MUST provide a final analysis with possible causes and recommended actions. Do not ask any more questions.
        """ + """
        Respond in JSON format for a final analysis: { 'summary': '...', 'suggested_causes': [{'title': '...', 'description': '...'}], 'treatment_plans': [{'title': '...', 'description': '...'}], 'is_final': true }
        """
        
    elif len(history) == 0:
        # Initial question
        prompt = """
        You are an AI medical assistant. Your first task is to ask the user a single, clear question about their primary symptom or the most concerning problem they're experiencing.
        Provide 4-5 relevant options for the user to choose from.
        Format the output as a JSON object with three keys: 'question' (a single string), 'options' (an array of strings), and 'is_final' (boolean, set to false).
        Example: {"question": "What is your primary symptom or the most concerning problem you're experiencing?", "options": ["Chest pain", "Difficulty breathing", "Abdominal pain", "Severe headache", "Dizziness/Lightheadedness"], "is_final": false}
        """
    else:
        prompt = f"""
        You are an AI medical assistant continuing a conversation with a user about their symptoms. You have already asked the primary symptom. Now, ask a follow-up question to better understand their condition based on the conversation history:
        {conversation}

        Ask the next most relevant question to diagnose the issue and provide 4-5 helpful options.
        If you have sufficient information, provide a final analysis with possible causes and recommended actions.
        You can ask a maximum of 10 questions in total. Please check the conversation length before asking a new question.
        """ + """
        Respond in JSON. 
        For a question: {"question": "...", "options": ["..."], "is_final": false}
        For a final analysis: {"summary": "...", "suggested_causes": [{"title": "...", "description": "..."}], "treatment_plans": [{"title": "...", "description": "..."}], "is_final": true}
        """

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
        return jsonify(response_json)
    
    except json.JSONDecodeError:
        return jsonify({"error": "AI response was not valid JSON."}), 500
    except Exception as e:
        print(f"An unexpected error occurred: {e}")
        return jsonify({"error": "An unexpected error occurred with the AI service."}), 500


if __name__ == '__main__':
    app.run(port=5328, debug=True)

