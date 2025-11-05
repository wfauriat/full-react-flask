import sqlite3
import json
from flask import Flask, jsonify, request, g
from flask_cors import CORS 

# --- FLASK APPLICATION SETUP ---
# CRITICAL FIX: 'app' must be defined before any decorators or code blocks use it.
app = Flask(__name__)
CORS(app) 

# --- DATABASE CONFIGURATION ---
DATABASE = 'todo.db'

def get_db():
    """Opens a new database connection if there is none yet for the current application context."""
    db = getattr(g, '_database', None)
    if db is None:
        db = g._database = sqlite3.connect(DATABASE)
        # Configure SQLite to return rows as dictionaries (using sqlite3.Row or json)
        db.row_factory = sqlite3.Row
    return db

# This decorator now runs AFTER 'app' has been defined.
@app.teardown_appcontext
def close_connection(exception):
    """Closes the database connection at the end of the request."""
    db = getattr(g, '_database', None)
    if db is not None:
        db.close()

def init_db():
    """Initializes the database schema if it doesn't exist."""
    # We rely on 'with app.app_context():' below to handle the context for us.
    db = get_db()
    # Create the 'todos' table with an ID, the content, and a creation timestamp
    db.execute('''
        CREATE TABLE IF NOT EXISTS todos (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            text TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
    ''')
    db.commit()

# Initialize the database on startup
# This block correctly uses the defined 'app' object.
with app.app_context():
    init_db()

# --- API ENDPOINTS ---

@app.route('/api/message', methods=['GET'])
def get_message():
    """Original GET Endpoint (Status Check)."""
    print("--- API Call Received: /api/message (GET) ---")
    return jsonify({
        'status': 'success',
        'message': 'Initial connection check successful. Database initialized.'
    })

@app.route('/api/todos', methods=['GET', 'POST'])
def handle_todos():
    db = get_db()
    
    if request.method == 'GET':
        """Handle GET to retrieve all ToDo items."""
        cursor = db.execute("SELECT id, text, created_at FROM todos ORDER BY created_at DESC")
        # Convert sqlite3.Row objects to standard Python dictionaries for JSON serialization
        todos = [dict(row) for row in cursor.fetchall()]
        
        print(f"--- API Call Received: /api/todos (GET) - Returning {len(todos)} items ---")
        return jsonify(todos)

    elif request.method == 'POST':
        """Handle POST to add a new ToDo item."""
        data = request.get_json()
        if not data or 'text' not in data:
            return jsonify({'error': 'Missing "text" field in JSON payload.'}), 400

        todo_text = data['text']
        db.execute("INSERT INTO todos (text) VALUES (?)", (todo_text,))
        db.commit()
        
        print(f"--- API Call Received: /api/todos (POST) - Added: '{todo_text}' ---")
        return jsonify({
            'status': 'success',
            'message': 'To-Do item added successfully.',
            'text': todo_text
        }), 201


@app.route('/')
def home():
    """Root route."""
    return "<h1>Flask Backend Running!</h1><p>Database endpoints available at <a href='/api/todos'>/api/todos</a></p>"

if __name__ == '__main__':
    print(f"SQLite Database: {DATABASE}")
    print("Flask server starting on http://127.0.0.1:5000")
    app.run(debug=True, port=5000)