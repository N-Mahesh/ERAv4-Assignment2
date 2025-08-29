from flask import Flask, render_template, request, jsonify
import os
import io

app = Flask(__name__)
app.config['MAX_CONTENT_LENGTH'] = 64 * 1024 * 1024  # 64 MB safety cap

def human_size(num_bytes: int) -> str:
    for unit in ['bytes','KB','MB','GB','TB']:
        if num_bytes < 1024.0 or unit == 'TB':
            return f"{num_bytes:.2f} {unit}" if unit != 'bytes' else f"{num_bytes} {unit}"
        num_bytes /= 1024.0

@app.route("/", methods=["GET"])
def index():
    return render_template("index.html")

@app.route("/upload", methods=["POST"])
def upload():
    if 'file' not in request.files:
        return jsonify({"error": "No file part"}), 400

    file = request.files['file']
    if file.filename == '':
        return jsonify({"error": "No selected file"}), 400

    # Determine file size without saving
    stream = file.stream
    pos = stream.tell()
    stream.seek(0, os.SEEK_END)
    size_bytes = stream.tell()
    stream.seek(pos, io.SEEK_SET)

    return jsonify({
        "name": file.filename,
        "size_bytes": size_bytes,
        "size_human": human_size(size_bytes),
        "type": file.mimetype or "application/octet-stream"
    }), 200

if __name__ == "__main__":
    app.run(host="127.0.0.1", port=5000, debug=True)
