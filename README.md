# Real-Time AirBnB Property Search with Location and Text-based Filters
Use a dataset of Airbnb listings with associated descriptions and geospatial metadata (longitude/ latitude). Combine spatial filtering (find properties in a specific area) with text-based search (e.g., "garden", "3 bedrooms")/ semantic search.
 
Dataset link: https://insideairbnb.com/get-the-data/

## How to run locally

### Set Environment variables:
- Update the env.example file with your own values and rename it to .env
- Alternatively: You can create user secrets if running in a Codespace (can do this in vscode command palette)

### Install dependencies:
```bash
cd src/api && pip install -r requirements.txt
cd ../frontend && npm install
```

### Run the app:
```bash 
cd src/api && uvicorn main:app --reload
cd ../frontend && npm run start
```
