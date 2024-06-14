from flask import Flask, jsonify
from flask_cors import CORS
import json
import os

app = Flask(__name__)
cors = CORS(app,origins='*')

@app.route("/api/finn_website_search", methods=['GET'])
def finn_search_api():
    try:
        json_file_path = os.path.join(os.path.dirname(__file__), "website_search.json")
        with open(json_file_path, 'r', encoding='utf-8') as json_file:
            data = json.load(json_file)
            
        return jsonify(data)
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    
@app.route("/api/olx_finn_data")
def olx_finn_data():
    try:
        json_file_path = os.path.join(os.path.dirname(__file__), "olx_finn_data.json")
        with open(json_file_path, 'r', encoding='utf-8') as json_file:
            data = json.load(json_file)
            
        return jsonify(data)
    except Exception as e:
        return jsonify({"error": str(e)}), 500
   
if __name__ == '__main__':
    app.run(port=8080,debug=True)