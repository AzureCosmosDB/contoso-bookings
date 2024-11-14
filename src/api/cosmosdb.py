from pymongo import MongoClient, UpdateOne
import os
import bson


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


def search_listings(query, amenity, user_location):

    amenities = ["WiFi"]
    
    if type(amenity) == list:
        amenities.extend(amenity)
    else:
        amenities.append(amenity)

    # print(amenities)
    # Search for the top 5 closest vectors to the query within a 30 mile radius of user's location
    pipeline = [
                {
                    "$search": {
                        "cosmosSearch": {
                            "path": "embeddings",
                            "query": query,  
                            "k": 5,  # Top 5 results
                            "filter": {
                                "$and": [
                                { "amenities": { "$in": amenities} },
                                #  The query converts the distance to radians by dividing by the approximate equatorial radius of the earth, 3963.2 miles
                                {"location": {"$geoWithin": 
                                                {"$centerSphere":[user_location, 30/3963.2 ]}}}
                                ]
                            }
                        }
                    }
                },
                {

                    "$limit": 5  # Limit to top 5 results
                },
                {

                 '$project': { "similarity_score": { '$round': [{ '$meta': 'searchScore' }, 2] }, 
                                "location": 1,
                                "description": 1,
                                "price": 1,
                                "name": 1,
                                "amenities": 1,
                                "description": 1,
                                "neighborhood_overview": 1,
                                "beds" : 1,
                                "bedrooms" : 1,
                                "bathrooms" : 1,
                                "bathrooms_text" : 1,
                                "property_type" : 1,
                                "room_type" : 1,
                                "host_about" : 1,
                                "_id": { "$toString": "$_id" } 
                            }, 
                }
            ]
        
    results = collection.aggregate(pipeline)
    results = list(results)
    # print(results)

    return results
    
