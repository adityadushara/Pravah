from datetime import date, timedelta

# Fictional demonstration data only. Not real military or operational data.
LOCATIONS = [
    {"id": "loc-north", "name": "North Ridge Depot", "region": "Demo Region A"},
    {"id": "loc-valley", "name": "Valley Support Hub", "region": "Demo Region B"},
    {"id": "loc-east", "name": "East Field Store", "region": "Demo Region C"},
]

INVENTORY = [
    {"id": "food-001", "name": "Food packs", "category": "Food", "location_id": "loc-north", "stock": 700, "daily_usage": 100, "reorder_level": 300, "unit": "packs"},
    {"id": "fuel-001", "name": "Fuel", "category": "Fuel", "location_id": "loc-north", "stock": 1200, "daily_usage": 200, "reorder_level": 500, "unit": "litres"},
    {"id": "med-001", "name": "Medical kits", "category": "Medical", "location_id": "loc-valley", "stock": 80, "daily_usage": 5, "reorder_level": 30, "unit": "kits"},
    {"id": "parts-001", "name": "Vehicle spare parts", "category": "Maintenance", "location_id": "loc-east", "stock": 45, "daily_usage": 4, "reorder_level": 25, "unit": "units"},
    {"id": "water-001", "name": "Water containers", "category": "Water", "location_id": "loc-valley", "stock": 240, "daily_usage": 40, "reorder_level": 100, "unit": "containers"},
]

# Synthetic daily consumption history for demo calculations.
HISTORY = {
    "food-001": [92, 98, 101, 95, 104, 99, 103, 100, 97, 102, 105, 96, 100, 98],
    "fuel-001": [180, 195, 202, 210, 190, 205, 198, 215, 200, 204, 196, 208, 201, 199],
    "med-001": [4, 5, 6, 3, 5, 4, 7, 5, 4, 6, 5, 4, 5, 5],
    "parts-001": [3, 4, 4, 5, 2, 4, 5, 3, 4, 4, 5, 3, 4, 4],
    "water-001": [35, 38, 41, 39, 42, 37, 40, 43, 39, 40, 41, 38, 40, 39],
}
