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
    """A class to manage an AI model interaction through a subprocess."""
    
    def __init__(self, command: str):
        self.command = command
        self.process = None
        self.lock = Lock()

    def start(self):
        """Starts the AI model subprocess and waits for it to be ready."""
        if not self.process:
            logging.info("Starting AI model...")
            try:
                self.process = pexpect.spawn(self.command, encoding='utf-8', timeout=None)
                self.process.expect('>>>')  # Wait for the model to be ready
                logging.info("AI model started and ready for input.")
            except Exception as e:
                logging.error(f"Failed to start AI model: {e}")
                self.process = None

    def send_message(self, message: str) -> str:
        """Sends a message to the AI model and ensures the complete message is captured before processing."""
        if not self.process:
            raise RuntimeError("AI model is not running")

        with self.lock:
            try:
                logging.debug(f"Sending message to AI model: {message}")
                self.process.sendline(message)
                
                # Wait for the AI to complete its response
                index = self.process.expect(['>>>', pexpect.EOF, pexpect.TIMEOUT])

                if index == 0:
                    response = self.process.before.strip()
                    logging.debug(f"Received response: {response}")
                    return self.clean_and_format_text(response)
                else:
                    logging.error("Failed to receive complete response from AI model")
                    return "Error: Incomplete response from AI model"

            except Exception as e:
                logging.error(f"Exception occurred while communicating with the model: {e}")
                raise RuntimeError(f"Error during communication with the AI model: {e}")

    def shutdown(self):
        """Shuts down the AI model subprocess."""
        if self.process:
            logging.info("Shutting down AI model...")
            self.process.sendline('/bye')  # Send the termination command
            self.process.close()
            self.process = None
        else:
            logging.error("AI model is not running")

    @staticmethod
    def clean_and_format_text(text):
        """Cleans text by removing duplicated words and normalizing whitespace."""
        text = re.sub(r'\s+', ' ', text).strip()
        text = re.sub(r'\b(\w+)( \1\b)+', r'\1', text, flags=re.IGNORECASE)
        return text

@app.route('/chat', methods=['POST'])
def chat():
    """Receives a message from the client, sends it to the AI, and returns the AI's response."""
    message = request.json.get('message')
    if not message:
        logging.error("No message provided")
        return jsonify({'error': 'No message provided'}), 400

    try:
        response = ai_model.send_message(message)
        return jsonify({'reply': response})
    except RuntimeError as e:
        return jsonify({'error': str(e)}), 500

@app.route('/shutdown', methods=['POST'])
def shutdown():
    """Shuts down the AI model on request and returns the shutdown status."""
    try:
        ai_model.shutdown()
        return jsonify({'status': 'AI model has been shut down'})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.before_first_request
def before_first_request():
    """Start the AI model before the first request is handled."""
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
    ai_model = AIModel('/usr/local/bin/ollama run llama3')
    ai_model.start()
    app.run(host='0.0.0.0', port=5000)
