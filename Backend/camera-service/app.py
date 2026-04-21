"""
MZ Tailor - Camera Measurement Service
Uses OpenCV + MediaPipe Tasks API
Run: python3 camera-service/app.py
"""
import os, io, math, base64
import numpy as np
import cv2
from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

# Download model if not exists
MODEL_PATH = os.path.join(os.path.dirname(__file__), 'pose_landmarker.task')
if not os.path.exists(MODEL_PATH):
    import urllib.request
    print("Downloading pose model...")
    urllib.request.urlretrieve(
        "https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task",
        MODEL_PATH
    )
    print("Model downloaded!")

from mediapipe.tasks.python import BaseOptions
from mediapipe.tasks.python.vision import PoseLandmarker, PoseLandmarkerOptions, RunningMode
import mediapipe as mp

LM = {
    'NOSE': 0,
    'LEFT_SHOULDER': 11, 'RIGHT_SHOULDER': 12,
    'LEFT_ELBOW': 13, 'RIGHT_ELBOW': 14,
    'LEFT_WRIST': 15, 'RIGHT_WRIST': 16,
    'LEFT_HIP': 23, 'RIGHT_HIP': 24,
    'LEFT_ANKLE': 27, 'RIGHT_ANKLE': 28,
}

def dist(a, b):
    return math.sqrt((a.x - b.x)**2 + (a.y - b.y)**2)

def estimate_measurements(landmarks):
    lm = landmarks

    shoulder_width = dist(lm[LM['LEFT_SHOULDER']], lm[LM['RIGHT_SHOULDER']])
    REAL_SHOULDER_CM = 45
    scale = REAL_SHOULDER_CM / shoulder_width if shoulder_width > 0 else 1

    chest = round(shoulder_width * scale * 2.1)
    hip_width = dist(lm[LM['LEFT_HIP']], lm[LM['RIGHT_HIP']])
    waist = round(hip_width * scale * 1.15 * 2)

    left_ankle = lm[LM['LEFT_ANKLE']]
    has_ankle = left_ankle.visibility > 0.5

    if has_ankle:
        length = round(dist(lm[LM['LEFT_SHOULDER']], left_ankle) * scale * 0.72)
    else:
        length = round(dist(lm[LM['LEFT_SHOULDER']], lm[LM['LEFT_HIP']]) * scale * 0.72 * 2.8)

    arm_norm = dist(lm[LM['LEFT_SHOULDER']], lm[LM['LEFT_ELBOW']]) + \
               dist(lm[LM['LEFT_ELBOW']], lm[LM['LEFT_WRIST']])
    arm_length = round(arm_norm * scale * 0.95)
    shoulder = round(shoulder_width * scale)

    confidence = round(min(
        lm[LM['LEFT_SHOULDER']].visibility,
        lm[LM['RIGHT_SHOULDER']].visibility,
        lm[LM['LEFT_HIP']].visibility,
        lm[LM['RIGHT_HIP']].visibility
    ) * 100)

    return {
        'chest': max(chest, 70), 'waist': max(waist, 55),
        'length': max(length, 50), 'armLength': max(arm_length, 40),
        'shoulder': max(shoulder, 35),
        'bodyType': 'full' if has_ankle else 'half',
        'confidence': confidence
    }

def draw_landmarks(img, landmarks, h, w):
    connections = [
        (11,12),(11,13),(13,15),(12,14),(14,16),
        (11,23),(12,24),(23,24),(23,25),(24,26),(25,27),(26,28)
    ]
    for i, lm in enumerate(landmarks):
        x, y = int(lm.x * w), int(lm.y * h)
        cv2.circle(img, (x, y), 4, (0, 200, 120), -1)
    for a, b in connections:
        if a < len(landmarks) and b < len(landmarks):
            x1, y1 = int(landmarks[a].x * w), int(landmarks[a].y * h)
            x2, y2 = int(landmarks[b].x * w), int(landmarks[b].y * h)
            cv2.line(img, (x1, y1), (x2, y2), (200, 170, 50), 2)

    # Measurement lines
    ls, rs = landmarks[11], landmarks[12]
    cv2.line(img, (int(ls.x*w), int(ls.y*h)), (int(rs.x*w), int(rs.y*h)), (0, 255, 255), 3)
    lh, rh = landmarks[23], landmarks[24]
    cv2.line(img, (int(lh.x*w), int(lh.y*h)), (int(rh.x*w), int(rh.y*h)), (255, 0, 255), 3)

def process_image(img_bytes):
    nparr = np.frombuffer(img_bytes, np.uint8)
    img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    if img is None:
        return None, "Failed to decode image"

    h, w = img.shape[:2]
    img_rgb = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
    mp_image = mp.Image(image_format=mp.ImageFormat.SRGB, data=img_rgb)

    options = PoseLandmarkerOptions(
        base_options=BaseOptions(model_asset_path=MODEL_PATH),
        running_mode=RunningMode.IMAGE,
        num_poses=1
    )

    with PoseLandmarker.create_from_options(options) as landmarker:
        result = landmarker.detect(mp_image)

        if not result.pose_landmarks or len(result.pose_landmarks) == 0:
            return None, "No person detected. Stand straight facing the camera."

        landmarks = result.pose_landmarks[0]
        measurements = estimate_measurements(landmarks)

        annotated = img.copy()
        draw_landmarks(annotated, landmarks, h, w)

        y_pos = 30
        for key, val in measurements.items():
            if key not in ['bodyType', 'confidence']:
                cv2.putText(annotated, f"{key}: {val}cm", (10, y_pos),
                           cv2.FONT_HERSHEY_SIMPLEX, 0.6, (0, 255, 0), 2)
                y_pos += 25

        _, buffer = cv2.imencode('.jpg', annotated, [cv2.IMWRITE_JPEG_QUALITY, 85])
        annotated_b64 = base64.b64encode(buffer).decode('utf-8')

        return {
            'measurements': measurements,
            'annotatedImage': f"data:image/jpeg;base64,{annotated_b64}"
        }, None

@app.route('/health', methods=['GET'])
def health():
    return jsonify({'status': 'ok', 'service': 'MZ Tailor Camera Service'})

@app.route('/measure', methods=['POST'])
def measure():
    try:
        img_bytes = None
        if 'image' in request.files:
            img_bytes = request.files['image'].read()
        elif request.is_json:
            data = request.get_json()
            if 'image' in data:
                b64 = data['image']
                if ',' in b64: b64 = b64.split(',')[1]
                img_bytes = base64.b64decode(b64)
        elif 'image_base64' in request.form:
            b64 = request.form['image_base64']
            if ',' in b64: b64 = b64.split(',')[1]
            img_bytes = base64.b64decode(b64)

        if not img_bytes:
            return jsonify({'error': 'No image provided'}), 400

        result, error = process_image(img_bytes)
        if error:
            return jsonify({'error': error}), 400
        return jsonify(result)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    print("\n🎥 MZ Tailor Camera Service")
    print("📍 http://localhost:5001")
    print("📸 POST /measure - Upload image for measurement")
    print("❤️  GET  /health  - Health check\n")
    app.run(host='0.0.0.0', port=5001, debug=False)
