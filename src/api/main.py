from fastapi import Body, FastAPI
from fastapi.middleware.cors import CORSMiddleware
from datetime import datetime, timedelta
from fastapi.responses import JSONResponse
from pymongo import MongoClient, UpdateOne
from azure.core.exceptions import AzureError
from azure.core.credentials import AzureKeyCredential
import json
from openai import AzureOpenAI
# from dotenv import dotenv_values
import os
# config = dotenv_values()

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/amenities")
def get_amenities():
    amenities = ["Pool", "Gym", "WiFi", "Parking"]
    return {"amenities": amenities}

@app.post("/query-message")
def post_query_message(content: str = Body(..., embed=True), amenity: str = Body(..., embed=True)):
    print("content: ", content)
    response = search_listings(content, amenity)
    return JSONResponse(response)


print("connecting...")
# Connect to MongoDB
MONGO_CONNECTION_STRING= os.getenv("MONGO_CONNECTION_STRING_DISKANN")
mongo_client = MongoClient(MONGO_CONNECTION_STRING)

db = mongo_client['contoso_bookings']

# Create collection if it doesn't exist
COLLECTION_NAME = "listings"

collection = db[COLLECTION_NAME]

if COLLECTION_NAME not in db.list_collection_names():
    db.create_collection(COLLECTION_NAME)
    print("Created collection '{}'.\n".format(COLLECTION_NAME))
else:
    print("Using collection: '{}'.\n".format(COLLECTION_NAME))


# Define the user's location
user_location = {
    "type": "Point",
    "coordinates": [-105.0020980834961, 39.766414642333984]  # User's location (longitude, latitude)
}

def search_listings(query, amenity):
   # Create an index on the location field
   # TODO: Keyword search 
    command = { "createIndexes": "listings", "indexes": [ { "key": { "location": 1 }, "name": "location" } ] }
    db.command(command)

    # Search for the top 5 closest vectors to the query within a 30 mile radius of user's location
    pipeline = [
                {
                    "$search": {
                        "cosmosSearch": {
                            "path": "embeddings",
                            "query": query,  # Replace with your query
                            "k": 5,  # Limit to top 5 closest vectors
                            "filter": {"$and": [
                                { "amenities": { "$in": ["Dishwasher", "Gym"] }},
                                #  The query converts the distance to radians by dividing by the approximate equatorial radius of the earth, 3963.2 miles
                                {"location": {"$geoWithin": 
                                                {"$centerSphere":[user_location["coordinates"], 30/3963.2 ]}}}
                                ]
                            }
                        }
                    }
                },
                {

                    "$limit": 5  # Limit to top 5 results
                },
                {
                    '$project': {
                        "location": 1,
                        "description": 1,
                        "price": 1,
                        "_id": 0  # Exclude the _id field
                    }, 

                }
            ]
    # Execute the aggregation
    results = collection.aggregate(pipeline)
    results = list(results)
    return results
    