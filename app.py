import os
import subprocess
import json
from flask import Flask, render_template, request, jsonify
from werkzeug.utils import secure_filename

# Flask server configuration to serve modular frontend files & call matcher.c
app = Flask(__name__, template_folder='.', static_folder='.')

UPLOAD_FOLDER = 'uploads'
C_SOURCE_FILE = 'matcher.c'
C_EXECUTABLE = './matcher'

app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

def ensure_c_binary():
    """Compiles matcher.c into an executable binary if not already built."""
    if not os.path.exists(C_EXECUTABLE):
        print("[Architect] Compiling C matching engine...")
        compile_result = subprocess.run(['gcc', C_SOURCE_FILE, '-o', 'matcher'], capture_output=True, text=True)
        if compile_result.returncode != 0:
            print(f"[Error] C Compilation failed:\n{compile_result.stderr}")
            return False
        print("[Architect] C binary compiled successfully.")
    return True

@app.route('/')
def index():
    """Serves index.html from root folder."""
    return render_template('index.html')

@app.route('/style.css')
def serve_css():
    """Serves stylesheet."""
    return app.send_static_file('style.css')

@app.route('/app.js')
def serve_js():
    """Serves client-side JavaScript controller."""
    return app.send_static_file('app.js')

@app.route('/search', methods=['POST'])
def search_image():
    """Accepts image upload, invokes compiled C matcher binary, and returns JSON."""
    if 'image' not in request.files:
        return jsonify({'success': False, 'error': 'No image file provided.'}), 400

    file = request.files['image']
    if file.filename == '':
        return jsonify({'success': False, 'error': 'Empty filename.'}), 400

    filename = secure_filename(file.filename)
    file_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
    file.save(file_path)

    try:
        if not ensure_c_binary():
            return jsonify({'success': False, 'error': 'C compilation failed.'}), 500

        # Execute compiled C binary via subprocess, passing the uploaded image path
        result = subprocess.run([C_EXECUTABLE, file_path], capture_output=True, text=True, timeout=5)
        
        # Clean up temporary uploaded file
        if os.path.exists(file_path):
            os.remove(file_path)

        if result.returncode != 0:
            return jsonify({'success': False, 'error': f'C engine error: {result.stderr}'}), 500

        # Parse JSON output returned from C program stdout
        c_output_json = json.loads(result.stdout)
        
        return jsonify({
            'success': True,
            'matches': c_output_json.get('matches', [])
        })

    except Exception as e:
        if os.path.exists(file_path):
            os.remove(file_path)
        return jsonify({'success': False, 'error': str(e)}), 500

if __name__ == '__main__':
    ensure_c_binary()
    # Bind to 0.0.0.0 and port 5000 for Replit web preview compatibility
    app.run(host='0.0.0.0', port=5000, debug=True)
