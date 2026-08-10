"""
KIRA Voice Assistant - Flask REST API Server
This provides HTTP endpoints for the frontend to interact with KIRA.
Optional alternative to LiveKit WebSocket for simpler deployments.
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
import os
import json
from prompt import find_response

# Load environment variables
load_dotenv()

# Initialize Flask app
app = Flask(__name__)
CORS(app, origins=os.getenv('ALLOWED_ORIGINS', '*').split(','))

# Configuration
app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'dev-secret-key-change-in-production')
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB max upload

# Health check endpoint
@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'service': 'KIRA Voice Assistant API',
        'version': '1.0.0'
    }), 200

# Get response from KIRA memory
@app.route('/api/ask', methods=['POST'])
@app.route('/api/kira/chat', methods=['POST'])
def ask_kira():
    """
    Get a response from KIRA based on user input.
    Expected JSON: { "message": "user question", "language": "Tamil" }
    """
    try:
        data = request.get_json() or {}
        user_message = data.get('message', '').strip()
        
        if not user_message:
            return jsonify({
                'success': False,
                'error': 'Missing message field',
                'response': 'Please enter a message.'
            }), 400
        
        # Get response from AKR-AI-ASSISTANT memory engine
        kira_response = find_response(user_message)
        
        return jsonify({
            'success': True,
            'reply': kira_response,
            'response': kira_response,
            'timestamp': data.get('timestamp'),
            'language': data.get('language', 'English')
        }), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': f'Internal server error: {str(e)}',
            'response': 'Sorry, I am temporarily unavailable. Please try again.'
        }), 500

# Get all available responses (for debugging/training)
@app.route('/api/memory', methods=['GET'])
def get_memory():
    """Get all available response patterns (admin only)"""
    try:
        memory_file = os.path.join(os.path.dirname(__file__), 'kira_memory.json')
        with open(memory_file, 'r', encoding='utf-8') as f:
            memory = json.load(f)
        
        return jsonify({
            'memory': memory,
            'count': len(memory)
        }), 200
        
    except Exception as e:
        return jsonify({
            'error': f'Failed to load memory: {str(e)}'
        }), 500

# Add new response pattern (admin endpoint)
@app.route('/api/memory/add', methods=['POST'])
def add_memory():
    """
    Add a new response pattern to KIRA's memory.
    Expected JSON: { "key": "question", "value": "answer" }
    """
    try:
        data = request.get_json()
        
        if not data or 'key' not in data or 'value' not in data:
            return jsonify({
                'error': 'Missing key or value field'
            }), 400
        
        memory_file = os.path.join(os.path.dirname(__file__), 'kira_memory.json')
        
        # Load existing memory
        with open(memory_file, 'r', encoding='utf-8') as f:
            memory = json.load(f)
        
        # Add new entry
        memory[data['key'].lower().strip()] = data['value']
        
        # Save updated memory
        with open(memory_file, 'w', encoding='utf-8') as f:
            json.dump(memory, f, indent=2, ensure_ascii=False)
        
        return jsonify({
            'success': True,
            'message': 'Response pattern added successfully'
        }), 201
        
    except Exception as e:
        return jsonify({
            'error': f'Failed to add memory: {str(e)}'
        }), 500

# Error handlers
@app.errorhandler(404)
def not_found(error):
    return jsonify({
        'error': 'Endpoint not found',
        'message': 'The requested URL was not found on this server.'
    }), 404

@app.errorhandler(500)
def internal_error(error):
    return jsonify({
        'error': 'Internal server error',
        'message': 'An unexpected error occurred.'
    }), 500

if __name__ == '__main__':
    port = int(os.getenv('PORT', 5000))
    debug = os.getenv('FLASK_ENV') == 'development'
    
    print(f"""
    ╔═══════════════════════════════════════╗
    ║   🤖 KIRA Voice Assistant API         ║
    ║   🌐 Flask Server Running             ║
    ║   📡 Port: {port}                      ║
    ║   🔧 Debug: {debug}                   ║
    ╚═══════════════════════════════════════╝
    
    Available Endpoints:
    - GET  /health          - Health check
    - POST /api/ask         - Ask KIRA a question
    - GET  /api/memory      - View all responses
    - POST /api/memory/add  - Add new response
    
    Press Ctrl+C to stop the server.
    """)
    
    app.run(
        host='0.0.0.0',
        port=port,
        debug=debug
    )
