from pymongo import MongoClient
import nltk
from datetime import datetime
from dotenv import load_dotenv
import os
import csv
from math import radians, sin, cos, sqrt, atan2

load_dotenv()

mongo_uri = os.getenv("MONGO_URI")
client = MongoClient(mongo_uri)
db = client['test']  # Database name
users_collection = db['users'] 
user_collection = db['user'] 
activity_collection = db['activity'] 

class UserProfileScore:
    # Helper Functions for Risk Scoring
    def calculate_post_frequency_score(post_count):
        # do for post_count in a day
        return min(5, post_count)

    def calculate_keyword_score(text):
        flagged_keywords = ["drug", "coke", "hit me up", "deal"]
        score = sum(1 for word in flagged_keywords if word in text.lower())
        return min(10, score)

    # def calculate_image_score(image_path):
    #     # Placeholder for image processing, this requires OpenCV or another library
    #     suspicious_objects_detected = False  # Change to True if detection is implemented
    #     return 5 if suspicious_objects_detected else 0

    def calculate_location_score(user_location, hotspots):
        # user_location = [latitude, longitude]
        # hotspots = [[lat1, lon1], [lat2, lon2] etc...] basically, convert heatmap csv to array.
        distance_threshold=0.1
        def load_hotspots_from_csv(csv_path):
            hotspots = []
            with open(csv_path, newline='') as csvfile:
                reader = csv.DictReader(csvfile)
                for row in reader:
                    lat, lon = float(row['latitude']), float(row['longitude'])
                    hotspots.append((lat, lon))
            return hotspots

        def haversine_distance(lat1, lon1, lat2, lon2):
            R = 6371.0  # Earth radius in kilometers
            lat1, lon1, lat2, lon2 = map(radians, [lat1, lon1, lat2, lon2])
            
            dlat = lat2 - lat1
            dlon = lon2 - lon1
            a = sin(dlat / 2)**2 + cos(lat1) * cos(lat2) * sin(dlon / 2)**2
            c = 2 * atan2(sqrt(a), sqrt(1 - a))
            
            return R * c  # Distance in kilometers

        user_lat, user_lon = user_location
        risk_score = 0
        
        for hotspot_lat, hotspot_lon in hotspots:
            distance = haversine_distance(user_lat, user_lon, hotspot_lat, hotspot_lon)
            
            # Assign score based on proximity
            if distance <= distance_threshold:
                risk_score = 5  # High risk if within the threshold
                break  # Exit once a hotspot within range is found

        return risk_score

    def calculate_message_score(messages):
        total_positive=
        total_coded=0.5*
        return min(10, total_coded+total_positive)
