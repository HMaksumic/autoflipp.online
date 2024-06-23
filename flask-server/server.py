from flask import Flask, jsonify
from flask_cors import CORS
import json
import os

app = Flask(__name__)
cors = CORS(app,origins='*')

@app.route("/api/finn_website_search", methods=['GET'])
def finn_search_api():
    try:
        json_file_path = os.path.join(os.path.dirname(__file__), "data/finn_search_before2015.json")
        with open(json_file_path, 'r', encoding='utf-8') as json_file:
            data = json.load(json_file)
            
        return jsonify(data)
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    
@app.route("/api/finn_website_search_after2015", methods=['GET'])
def finn_search_api_after2015():
    try:
        json_file_path = os.path.join(os.path.dirname(__file__), "data/finn_search_after2015.json")
        with open(json_file_path, 'r', encoding='utf-8') as json_file:
            data = json.load(json_file)
            
        return jsonify(data)
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    
@app.route("/api/olx_finn_data")
def olx_finn_data():
    try:
        json_file_path = os.path.join(os.path.dirname(__file__), "data/olx_finn_before2015.json")
        with open(json_file_path, 'r', encoding='utf-8') as json_file:
            data = json.load(json_file)
            
        return jsonify(data)
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    
@app.route("/api/olx_finn_data_after2015")
def olx_finn_data_after2015():
    try:
        json_file_path = os.path.join(os.path.dirname(__file__), "data/olx_finn_after2015.json")
        with open(json_file_path, 'r', encoding='utf-8') as json_file:
            data = json.load(json_file)
            
        return jsonify(data)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/api/olx_audi")
def olx_audi():
    try:
        json_file_path = os.path.join(os.path.dirname(__file__), "data/=OLX_AUDI.json")
        with open(json_file_path, 'r', encoding='utf-8') as json_file:
            data = json.load(json_file)
            
        return jsonify(data)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/api/olx_bmw")
def olx_bmw():
    try:
        json_file_path = os.path.join(os.path.dirname(__file__), "data/=OLX_BMW.json")
        with open(json_file_path, 'r', encoding='utf-8') as json_file:
            data = json.load(json_file)
            
        return jsonify(data)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/api/olx_mercedes")
def olx_mercedes():
    try:
        json_file_path = os.path.join(os.path.dirname(__file__), "data/=OLX_MERCEDES.json")
        with open(json_file_path, 'r', encoding='utf-8') as json_file:
            data = json.load(json_file)
            
        return jsonify(data)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/api/olx_peugeot")
def olx_peugeot():
    try:
        json_file_path = os.path.join(os.path.dirname(__file__), "data/=OLX_PEUGEOT.json")
        with open(json_file_path, 'r', encoding='utf-8') as json_file:
            data = json.load(json_file)
            
        return jsonify(data)
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    
@app.route("/api/olx_volvo")
def olx_volvo():
    try:
        json_file_path = os.path.join(os.path.dirname(__file__), "data/=OLX_VOLVO.json")
        with open(json_file_path, 'r', encoding='utf-8') as json_file:
            data = json.load(json_file)
            
        return jsonify(data)
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    
@app.route("/api/olx_vw")
def olx_vw():
    try:
        json_file_path = os.path.join(os.path.dirname(__file__), "data/=OLX_VW.json")
        with open(json_file_path, 'r', encoding='utf-8') as json_file:
            data = json.load(json_file)
            
        return jsonify(data)
    except Exception as e:
        return jsonify({"error": str(e)}), 500


        
def create_app():
    return app
   
if __name__ == '__main__':
    app.run(port=8080,debug=True)