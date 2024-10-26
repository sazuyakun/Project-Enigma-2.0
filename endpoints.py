from datetime import datetime
import os
from dotenv import load_dotenv
from flask import Flask, render_template, jsonify, request
from flask_cors import CORS
from pymongo import MongoClient
from ML_Models.Text_Classifier.DrugTextAnalyzer import DrugTextAnalyzer
from Dashboard.Heatmap.heatmap_generation import heatmap_generation
from Dashboard.Activity_Graph.update_activity import update_activity_monitor

load_dotenv()

app = Flask(__name__)
CORS(app)
model = DrugTextAnalyzer()


# MongoDB connection
mongo_uri = os.getenv("MONGO_URI")
client = MongoClient(mongo_uri)
db = client['test']  # Database name
users_collection = db['users'] 
user_collection = db['user'] 
activity_collection = db['activity'] 

# Make the heatmap

# Dashboard endpoints
@app.route('/dashboard/heatmap')
def heatmap():
    heatmap_generation("Dashboard/Heatmap/Data/location.csv", user_collection)
    return render_template('heatmap.html')  # Serve the HTML heatmap

@app.route('/dashboard/activity', methods=['GET'])
def activity_graph():
    update_activity_monitor(users_collection, activity_collection)
    try:
        counts = []
        for activity in activity_collection.find():
            counts.append({str(activity["date"].date()): activity["userCount"]})
        return jsonify(counts)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# Classification endpoints
@app.post("/classify/text-predict")
def drugClassification():
    data = request.json
    postText = data["user"]
    result = model.process_input(str(postText))
    return jsonify({
        "classification": result
    })

# Drug Traffickers Database endpoints
@app.route('/database/users', methods=['GET'])
def get_users():
    try:
        users = []
        for user in users_collection.find():
            users.append({
                "id": str(user["_id"]),
                # "name": user["name"],
                "username": user["username"],
                "email": user["email"],
                "riskScore": user.get("riskScore", 0),
                "lastActive": user.get("lastActive"),
                "location": user.get("location", "Unknown"),
                "behaviors": user.get("behaviors", []),
                "riskFactors": user.get("riskFactors", []),
                # "isFlag": str(user["isFlag"]),
                
            })
        return jsonify(users)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run(port=8080, debug=True)