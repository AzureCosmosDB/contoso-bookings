from fastapi import Body, FastAPI
from fastapi.middleware.cors import CORSMiddleware
# from datetime import datetime, timedelta
from fastapi.responses import JSONResponse
import cosmosdb
import chat
import json
# from dotenv import dotenv_values
# config = dotenv_values()

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.post("/query-message")
def post_query_message(content: str = Body(..., embed=True), amenities: list = Body(..., embed=True)):
    response_message, listing_metadata = chat.send_chat_message(content, amenities)

    response_data = {
        "message": response_message,
        "listings": listing_metadata
    }
    return JSONResponse(response_data)




    


