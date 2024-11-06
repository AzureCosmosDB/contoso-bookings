from pymongo import MongoClient, UpdateOne
import os


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
    
