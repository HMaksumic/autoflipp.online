from flask import Flask, jsonify, request
from flask_cors import CORS
import json
import os
from flask_sqlalchemy import SQLAlchemy
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity, decode_token
from dotenv import load_dotenv
from datetime import datetime

load_dotenv()

app = Flask(__name__)
CORS(app, origins='https://autoflipp.online/', supports_credentials=True)

app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('DATABASE_URL')
app.config['JWT_SECRET_KEY'] = os.getenv('JWT_SECRET_KEY')

db = SQLAlchemy(app)
jwt = JWTManager(app)

class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    password = db.Column(db.String(120), nullable=False)

class Car(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    car_name = db.Column(db.String(100), nullable=False)
    year = db.Column(db.Integer, nullable=False)
    finn_price = db.Column(db.Integer, nullable=False)
    finn_link = db.Column(db.String(200), nullable=False)
    image_url = db.Column(db.String(200), nullable=False)
    regno = db.Column(db.String(20), nullable=False)
    olx_prices = db.Column(db.ARRAY(db.Integer), nullable=False)
    olx_ids = db.Column(db.ARRAY(db.Integer), nullable=False)
    tax_return = db.Column(db.Integer, nullable=True)

class Favorite(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    car_id = db.Column(db.Integer, db.ForeignKey('car.id'), nullable=False)
    car = db.relationship('Car', backref=db.backref('favorites', lazy=True))

@app.route('/register', methods=['POST'])
def register():
    data = request.json
    username = data['username']
    password = data['password']

    existing_user = User.query.filter_by(username=username).first()
    if existing_user:
        return jsonify({"success": False, "message": "Username already exists"}), 400

    new_user = User(username=username, password=password)
    db.session.add(new_user)
    try:
        db.session.commit()
        return jsonify({"success": True, "message": "User registered successfully"})
    except Exception:
        db.session.rollback()
        return jsonify({"success": False, "message": "Registration failed"}), 500

@app.route('/login', methods=['POST'])
def login():
    data = request.json
    username = data['username']
    password = data['password']

    user = User.query.filter_by(username=username).first()
    if user and user.password == password:
        access_token = create_access_token(identity=user.id)
        return jsonify({"success": True, "message": "Login successful", "user": {"username": user.username, "access_token": access_token}})
    else:
        return jsonify({"success": False, "message": "Invalid username or password"}), 400

@app.route('/protected', methods=['GET'])
@jwt_required()
def protected():
    current_user = get_jwt_identity()
    return jsonify(logged_in_as=current_user), 200

@app.route('/decode-token', methods=['POST'])
def decode_jwt():
    data = request.json
    token = data['token']
    decoded = decode_token(token)
    return jsonify({
        "decoded_token": decoded,
        "current_time": datetime.now()
    })

##### FAVORITE HANDLING #####
@app.route('/favorites', methods=['GET'])
@jwt_required()
def get_favorites():
    user_id = get_jwt_identity()
    favorites = Favorite.query.filter_by(user_id=user_id).all()
    favorite_cars = [
        {
            "id": fav.car.id, 
            "car_name": fav.car.car_name, 
            "image_url": fav.car.image_url, 
            "year": fav.car.year, 
            "finn_price": fav.car.finn_price, 
            "finn_link": fav.car.finn_link, 
            "regno": fav.car.regno, 
            "olx_prices": fav.car.olx_prices, 
            "olx_ids": fav.car.olx_ids, 
            "tax_return": fav.car.tax_return
        } 
        for fav in favorites
    ]
    return jsonify({"success": True, "favorites": favorite_cars})

@app.route('/favorites', methods=['POST'])
@jwt_required()
def add_favorite():
    data = request.json
    car_data = data.get('car')

    if not car_data:
        return jsonify({"success": False, "message": "Invalid data"}), 422

    user_id = get_jwt_identity()

    try:
        for key, value in car_data.items():
            print(f"{key}: {value}")

        existing_car = Car.query.filter_by(regno=car_data['regno']).first()
        if not existing_car:
            new_car = Car(
                car_name=car_data.get('car_name'),
                year=car_data.get('year'),
                finn_price=car_data.get('finn_price'),
                finn_link=car_data.get('finn_link'),
                image_url=car_data.get('image_url'),
                regno=car_data.get('regno'),
                olx_prices=car_data.get('olx_prices'),
                olx_ids=car_data.get('olx_ids'),
                tax_return=car_data.get('tax_return', None) 
            )
            db.session.add(new_car)
            db.session.commit()
            car_id = new_car.id
        else:
            car_id = existing_car.id

        existing_favorite = Favorite.query.filter_by(user_id=user_id, car_id=car_id).first()
        if existing_favorite:
            return jsonify({"success": False, "message": "Car already favorited"}), 400

        new_favorite = Favorite(user_id=user_id, car_id=car_id)
        db.session.add(new_favorite)
        db.session.commit()
        return jsonify({"success": True, "message": "Car favorited successfully"})
    except Exception as e:
        print(f"Error adding favorite: {str(e)}")  
        return jsonify({"success": False, "message": "An error occurred while favoriting the car"}), 500


@app.route('/favorites/<int:car_id>', methods=['DELETE'])
@jwt_required()
def remove_favorite(car_id):
    user_id = get_jwt_identity()

    favorite = Favorite.query.filter_by(user_id=user_id, car_id=car_id).first()
    if not favorite:
        return jsonify({"success": False, "message": "Favorite not found"}), 404

    db.session.delete(favorite)
    db.session.commit()
    return jsonify({"success": True, "message": "Favorite removed successfully"})

#####API ENDPOINTS FOR NORMAL CAR ENTRIES####
@app.route("/api/finn_website_search", methods=['GET'])
def finn_search_api():
    try:
        json_file_path = os.path.join(os.path.dirname(__file__), "data/finn_search_before2015.json")
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
    with app.app_context():
        db.create_all()
    app.run(port=8080, debug=True)