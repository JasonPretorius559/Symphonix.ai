from flask import Flask, request, jsonify
from flask_cors import CORS
import pexpect
import logging
from threading import Lock
import re
import signal
import sys

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes
logging.basicConfig(level=logging.DEBUG)

class AIModel:
    def __init__(self, command):
        self.command = command
        self.process = None
        self.lock = Lock()

    def start(self):
        if not self.process:
            logging.info("Starting AI model...")
            try:
                self.process = pexpect.spawn(self.command, encoding='utf-8', timeout=None)
                self.process.expect('>>>')  # Wait for the model to be ready
                logging.info("AI model started and ready for input.")
            except Exception as e:
                logging.error(f"Failed to start AI model: {e}")
                self.process = None

    def send_message(self, message):
        if not self.process:
            raise RuntimeError("AI model is not running")

        with self.lock:
            try:
                logging.debug(f"Sending message to AI model: {message}")
                self.process.sendline(message)
                self.process.expect('>>>')  # Wait for the prompt to return

                response = self.process.before.strip()
                cleaned_response = ResponseFormatter.format_response(response)
                logging.debug(f"Received response: {cleaned_response}")
                return cleaned_response

            except Exception as e:
                logging.error(f"Exception occurred while communicating with the model: {e}")
                raise RuntimeError(f"Error during communication with the AI model: {e}")

    def shutdown(self):
        if self.process:
            logging.info("Shutting down AI model...")
            self.process.sendline('/bye')  # Send the termination command
            self.process.close()
            self.process = None
        else:
            logging.error("AI model is not running")

class ResponseFormatter:
    
    @staticmethod
    def format_response(response):
        """Clean and format the response, accommodating single lines, lists, and code blocks."""
        # Remove unwanted initial text
        response = re.sub(r'^Send a message \(/\? for help\)', '', response).strip()
        
        # Remove user's question if present in the response
        response = re.sub(r'^(.*?)(?=\s*The Nissan 350Z|The Nissan 350Z)', '', response).strip()
        
        # Remove ANSI escape sequences and other control characters
        response = re.sub(r'\x1B[@-_][0-?]*[ -/]*[@-~]', '', response)
        response = re.sub(r'\x1B\[([0-9;]*)[A-Za-z]', '', response)
        response = re.sub(r'[\u2800-\u28FF]', '', response)  # Remove Braille spinner characters
        response = response.replace("*", "")
        response = re.sub(r'\s+', ' ', response)  # Collapse multiple spaces into one
        
        # Remove exact word repetitions while avoiding cutting off words
        response = re.sub(r'\b(\w+)( \1\b)+', r'\1', response)
        
        # Handle repeated phrases
        response = re.sub(r'\b(\w+ \w+)( \1\b)+', r'\1', response)

        # Remove partial word repetitions that occur due to processing errors
        response = re.sub(r'\b(\w+)(\w{1,3}) \1', r'\1', response)

        # Handle specific formatting
        response = re.sub(r'([a-zA-Z])\s+([,.:;!?])', r'\1\2', response)  # Remove space before punctuation
        response = re.sub(r'\(\s+', '(', response)  # Remove space after opening parenthesis
        response = re.sub(r'\s+\)', ')', response)  # Remove space before closing parenthesis
        response = re.sub(r'\s{2,}', ' ', response)  # Collapse multiple spaces again

        # Split the response into lines for further handling
        lines = response.splitlines()

        # Process lines to ensure clean list formatting
        formatted_lines = []
        for line in lines:
            if re.match(r'^\d+\.\s', line):  # Detect numbered lists
                formatted_lines.append(line.strip())
            elif re.match(r'^\s*-\s', line):  # Detect bullet points
                formatted_lines.append(line.strip())
            else:  # General text or code
                formatted_lines.append(line.strip())

        # Reassemble the cleaned and formatted lines
        formatted_response = "\n".join(formatted_lines)

        # Final cleaning of repeated phrases that span multiple lines
        formatted_response = re.sub(r'\b(\w+ \w+)( \1\b)+', r'\1', formatted_response)

        return formatted_response

# Initialize the AI model
ai_model = AIModel('/usr/local/bin/ollama run llama3')

@app.route('/chat', methods=['POST'])
def chat():
    message = request.json.get('message')
    if not message:
        logging.error("No message provided")
        return jsonify({'error': 'No message provided'}), 400

    logging.debug(f"Received message: {message}")

    try:
        response = ai_model.send_message(message)
        return jsonify({'reply': response})
    except RuntimeError as e:
        return jsonify({'error': str(e)}), 500

@app.route('/shutdown', methods=['POST'])
def shutdown():
    try:
        ai_model.shutdown()
        return jsonify({'status': 'AI model has been shut down'})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.before_first_request
def before_first_request():
    ai_model.start()

def graceful_shutdown(signal, frame):
    """Ensure the AI model is properly shut down on exit."""
    logging.info("Graceful shutdown initiated.")
    ai_model.shutdown()
    sys.exit(0)

# Register signal handlers for graceful shutdown
signal.signal(signal.SIGINT, graceful_shutdown)
signal.signal(signal.SIGTERM, graceful_shutdown)

if __name__ == '__main__':
    ai_model.start()
    app.run(host='0.0.0.0', port=5000)
