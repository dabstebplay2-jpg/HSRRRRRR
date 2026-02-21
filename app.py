from __future__ import annotations

import json
from pathlib import Path
from urllib.error import URLError
from urllib.request import Request, urlopen

from flask import Flask, Response, jsonify, render_template, request

app = Flask(__name__)

DATA_PATH = Path(__file__).parent / "data" / "characters.json"


def load_characters() -> list[dict]:
    with DATA_PATH.open("r", encoding="utf-8") as file:
        return json.load(file)


def get_character_by_id(character_id: str) -> dict | None:
    return next((item for item in load_characters() if item.get("id") == character_id), None)


@app.get("/")
def index():
    return render_template("index.html")


@app.get("/characters")
def characters_page():
    return render_template("characters.html")


@app.get("/characters/<string:character_id>")
def character_page(character_id: str):
    return render_template("character.html", character_id=character_id)


@app.get("/api/characters")
def get_characters():
    return jsonify(load_characters())


@app.get("/api/characters/<string:character_id>")
def get_character(character_id: str):
    character = get_character_by_id(character_id)
    if character is None:
        return jsonify({"error": "not found"}), 404
    return jsonify(character)


@app.get("/images/<string:character_id>")
def proxy_image(character_id: str):
    character = get_character_by_id(character_id)
    if character is None:
        return jsonify({"error": "not found"}), 404

    image_url = character.get("image")
    if not image_url:
        return jsonify({"error": "image not found"}), 404

    request_headers = {
        "User-Agent": (
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
            "(KHTML, like Gecko) Chrome/127.0.0.0 Safari/537.36"
        ),
        "Referer": "https://honkai-star-rail.fandom.com/",
    }

    try:
        with urlopen(Request(image_url, headers=request_headers), timeout=12) as response:
            content = response.read()
            content_type = response.headers.get_content_type() or "image/png"
            return Response(content, mimetype=content_type, headers={"Cache-Control": "public, max-age=86400"})
    except URLError:
        return jsonify({"error": "image unavailable"}), 502


@app.errorhandler(404)
def handle_not_found(error):
    if request.path.startswith("/api/"):
        return jsonify({"error": "not found"}), 404
    return render_template("404.html"), 404


if __name__ == "__main__":
    app.run(debug=True)
