import io
import os
import pickle

import numpy as np
from PIL import Image
from flask import Flask, jsonify, request, send_from_directory


BASE_DIR = os.path.dirname(os.path.abspath(__file__))
FRONTEND_DIST_DIR = os.path.join(BASE_DIR, "frontend website", "dist")
FRONTEND_ASSETS_DIR = os.path.join(FRONTEND_DIST_DIR, "assets")
MODEL_PATH = os.path.join(BASE_DIR, "SkinModel.pkl")


with open(MODEL_PATH, "rb") as file:
    model = pickle.load(file)


label_map = {
    0: "Melanocytic nevi",
    1: "Melanoma",
    2: "Benign keratosis-like lesions",
    3: "Basal cell carcinoma",
    4: "Actinic keratoses",
    5: "Vascular lesions",
    6: "Dermatofibroma",
    7: "Other",
}


CONFIDENCE_THRESHOLD = 0.7

app = Flask(__name__, static_folder=FRONTEND_DIST_DIR, static_url_path="")


@app.errorhandler(500)
def handle_server_error(error):
    return jsonify({"error": f"Server error: {error}"}), 500


def preprocess_image(file_storage):
    image = Image.open(io.BytesIO(file_storage.read()))
    original_image = image.copy()

    if image.mode != "RGB":
        image = image.convert("RGB")

    image = image.resize((128, 128))
    image_array = np.array(image) / 255.0
    image_array = np.expand_dims(image_array, axis=0)

    return original_image, image_array


@app.post("/api/predict")
def predict():
    uploaded_file = request.files.get("image")
    if uploaded_file is None or uploaded_file.filename == "":
        return jsonify({"error": "Please upload an image file."}), 400

    try:
        _, image_array = preprocess_image(uploaded_file)
        predictions = model.predict(image_array)
        predicted_label = int(np.argmax(predictions))
        confidence = float(predictions[0][predicted_label])
    except Exception as exc:
        return jsonify({"error": f"Failed to process image: {exc}"}), 400

    if confidence < CONFIDENCE_THRESHOLD:
        return jsonify(
            {
                "prediction": "No skin disease detected",
                "confidence": confidence,
                "confidenceThreshold": CONFIDENCE_THRESHOLD,
                "belowThreshold": True,
            }
        )

    return jsonify(
        {
            "prediction": label_map[predicted_label],
            "confidence": confidence,
            "confidenceThreshold": CONFIDENCE_THRESHOLD,
            "belowThreshold": False,
        }
    )


@app.get("/assets/<path:filename>")
def serve_assets(filename):
    return send_from_directory(FRONTEND_ASSETS_DIR, filename)


@app.get("/", defaults={"path": ""})
@app.get("/<path:path>")
def serve_frontend(path):
    requested_path = os.path.join(FRONTEND_DIST_DIR, path)

    if path and os.path.exists(requested_path) and os.path.isfile(requested_path):
        return send_from_directory(FRONTEND_DIST_DIR, path)

    index_path = os.path.join(FRONTEND_DIST_DIR, "index.html")
    if os.path.exists(index_path):
        return send_from_directory(FRONTEND_DIST_DIR, "index.html")

    return (
        "Frontend build not found. Run `npm install` and `npm run build` inside "
        "`frontend website`, then start `python app.py` again.",
        503,
    )


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
