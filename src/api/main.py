from fastapi import Body, FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import geolocation as geo
import chat
import json


app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class UserInfo:
    coordinates = [-105.0020980834961, 39.766414642333984]  # User's location (longitude, latitude)
    
user = UserInfo()

@app.post("/query_message")
def post_query_message(content: str = Body(..., embed=True), amenities: list = Body(..., embed=True)):
    response_message, listing_metadata = chat.send_chat_message(content, amenities, user.coordinates)

    response_data = {
        "message": response_message,
        "listings": listing_metadata
    }
    return JSONResponse(response_data)

@app.post("/get_location")
def post_get_location(city_name: str = Body(..., embed=True)):
    lat, lon = geo.get_city_coordinates(city_name)
    response_data = {
        "latitude": lat,
        "longitude": lon
    }
    user.coordinates = [lon, lat]   
    return JSONResponse(response_data)

    
