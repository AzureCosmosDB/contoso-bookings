# from geopy.geocoders import Nominatim
# from geopy.distance import distance

# # Function to get the coordinates of a city
# def get_city_coordinates(city_name):
#     try:
#         # Create a geolocator object using Nominatim service
#         geolocator = Nominatim(user_agent="MyAPP")
        
#         # Geocode the city name to get location details
#         location = geolocator.geocode(city_name)
        
#         if location:
#             # Extract the latitude and longitude from the location object
#             lat = location.latitude
#             lon = location.longitude
#             return lat, lon
#         else:
#             print(f"City '{city_name}' not found.")
#             return None, None
#     except Exception as e:
#         print(f"Error occurred: {e}")
#         return None, None

# def calculate_distance(current_location, transaction_location):
#     # Calculate the distance between two locations
#     return distance(current_location, transaction_location).meters
