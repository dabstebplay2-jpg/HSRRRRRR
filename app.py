from __future__ import annotations

import json
from pathlib import Path

from flask import Flask, jsonify, render_template, request

app = Flask(__name__)

DATA_PATH = Path(__file__).parent / "data" / "characters.json"


def load_characters() -> list[dict]:
    with DATA_PATH.open("r", encoding="utf-8") as file:
        return json.load(file)


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
    characters = load_characters()
    character = next((item for item in characters if item.get("id") == character_id), None)
    if character is None:
        return jsonify({"error": "not found"}), 404
    return jsonify(character)


@app.errorhandler(404)
def handle_not_found(error):
    if request.path.startswith("/api/"):
        return jsonify({"error": "not found"}), 404
    return render_template("404.html"), 404


if __name__ == "__main__":
    app.run(debug=True)
