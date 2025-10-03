import os
import re
from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
import google.generativeai as genai

# Load environment variables from .env
load_dotenv()

app = Flask(__name__)
CORS(app)  # allow frontend requests during development

# Configure Gemini
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
if not GEMINI_API_KEY:
    raise RuntimeError("❌ GEMINI_API_KEY not set in environment")
genai.configure(api_key=GEMINI_API_KEY)

# Always use this model
GEMINI_MODEL = "models/gemini-2.5-flash"


def count_words(text: str) -> int:
    """Helper: count words in a string."""
    return len(re.findall(r"\w+", text))


def generate_story_with_gemini(prompt: str, target_words: int = 300) -> str:
    """Generate a ~300 word child-friendly story using Gemini."""
    system_instruction = (
        f"You are a helpful assistant that writes short, illustrated, child-friendly stories. "
        f"Make it around {target_words} words (+/- 30 words). "
        "The story should be fun, magical, and wholesome. "
        "Output only the story text, no extra comments."
    )

    model = genai.GenerativeModel(GEMINI_MODEL)
    response = model.generate_content([system_instruction, prompt])

    if not response or not response.text:
        raise RuntimeError("Gemini did not return text")
    return response.text.strip()


@app.route("/generate_from_text", methods=["POST"])
def generate_story_from_text():
    """
    Accepts JSON: { "prompt": "A kind dragon who loves pancakes" }
    Returns JSON: { "story": "...", "word_count": 300 }
    """
    data = request.get_json(force=True, silent=True)
    if not data:
        return jsonify({"error": "Invalid JSON body"}), 400

    prompt = data.get("prompt", "")
    if not isinstance(prompt, str) or len(prompt.strip()) < 3:
        return jsonify({"error": "Prompt must be a non-empty string"}), 400

    try:
        story = generate_story_with_gemini(prompt.strip())
    except Exception as e:
        return jsonify({"error": str(e)}), 500

    return jsonify({
        "story": story,
        "word_count": count_words(story)
    })


@app.route("/generate_story_from_audio", methods=["POST"])
def generate_story_from_audio():
    """
    Accepts form-data with audio file: key = 'audio'
    Returns JSON: { "transcription": "...", "story": "..." }
    """
    if "audio" not in request.files:
        return jsonify({"error": "No audio uploaded"}), 400

    audio_file = request.files["audio"]
    audio_bytes = audio_file.read()

    model = genai.GenerativeModel(GEMINI_MODEL)

    # Step 1: Convert speech → text
    transcription = model.generate_content([
        "Transcribe this audio to plain text.",
        {"mime_type": "audio/wav", "data": audio_bytes}
    ])

    if not transcription.text:
        return jsonify({"error": "Could not transcribe audio"}), 500

    # Step 2: Use transcription to generate a story
    story_prompt = f"Write a creative short story inspired by this input: {transcription.text}"
    story_response = model.generate_content(story_prompt)

    return jsonify({
        "transcription": transcription.text,
        "story": story_response.text
    })


@app.route("/generate_story_from_image", methods=["POST"])
def generate_story_from_image():
    """
    Accepts form-data with image file: key = 'image'
    Returns JSON: { "story": "..." }
    """
    if "image" not in request.files:
        return jsonify({"error": "No image file uploaded"}), 400

    image_file = request.files["image"]
    image_bytes = image_file.read()

    model = genai.GenerativeModel(GEMINI_MODEL)

    response = model.generate_content([
        "Write a short, imaginative, fun story inspired by this image. "
        "Avoid giving a literal description — turn it into a creative narrative.",
        {"mime_type": "image/jpeg", "data": image_bytes}
    ])

    if not response or not response.text:
        return jsonify({"error": "Gemini did not return text"}), 500

    return jsonify({"story": response.text})


if __name__ == "__main__":
    port = int(os.getenv("PORT", 5000))
    app.run(host="0.0.0.0", port=port, debug=True)
