from flask import Flask, jsonify, request
# flask_cors is needed to allow the React frontend (running on a different port/origin)
# to make requests to the Flask backend without running into CORS policy issues.
from flask_cors import CORS 

# Initialize the Flask application
app = Flask(__name__)
# Enable CORS for all routes
CORS(app) 

@app.route('/api/message', methods=['GET'])
def get_message():
    """
    API Endpoint: Returns a simple JSON response.
    This is the data the React frontend will fetch and display.
    """
    print("--- API Call Received: /api/message ---")
    return jsonify({
        'status': 'success',
        'message': 'Great ! Data successfully received from Flask API!'
    })


@app.route('/api/post-message', methods=['POST'])
def post_message():
    """
    API Endpoint: Receives a JSON payload from the frontend and echoes a response.
    """
    # Get the JSON data sent from the React frontend
    data = request.get_json()
    if not data or 'message' not in data:
        # Handle case where the JSON payload is missing or incorrectly formatted
        print("--- API Call Received: /api/post-message (POST) - Error: Missing JSON/message ---")
        return jsonify({
            'status': 'error',
            'message': 'Missing JSON payload or "message" field.'
        }), 400

    received_message = data['message']
    print(f"--- API Call Received: /api/post-message (POST) - Received: '{received_message}' ---")
    
    # Echo back a confirmation message
    return jsonify({
        'status': 'success',
        'message': f"Flask received your message: '{received_message}'. Processed successfully.",
        'original_message': received_message
    })


@app.route('/')
def home():
    """
    Root route: In a production environment, this route would typically serve
    the compiled index.html file of the React application.
    """
    return "<h1>Flask Backend Running!</h1><p>The API is available at <a href='/api/message'>/api/message</a></p>"

if __name__ == '__main__':
    # The Flask application runs on port 5000 by default.
    # The React frontend is configured to send requests to this port.
    print("Flask server starting on http://127.0.0.1:5000")
    app.run(debug=True, port=5000)