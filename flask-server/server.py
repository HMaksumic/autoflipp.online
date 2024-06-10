from flask import Flask, jsonify
from flask_cors import CORS



app = Flask(__name__)
cors = CORS(app,origins='*')

@app.route("/api/users", methods=['GET'])
def users():
    return jsonify(
        {
        "users" : ["a1", "a2", "a3", "a4"]
        }
    )

if __name__ == "__main__":
    app.run(debug=True, port = 8080)
