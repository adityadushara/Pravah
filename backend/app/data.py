from datetime import date, timedelta

# Fictional demonstration data only. Not real military or operational data.
LOCATIONS = [
    {"id": "loc-north", "name": "North Ridge Depot", "region": "Northern Sector (Demo)"},
    {"id": "loc-valley", "name": "Valley Support Hub", "region": "Valley Sector (Demo)"},
    {"id": "loc-east", "name": "East Field Store", "region": "Eastern Sector (Demo)"},
    {"id": "loc-west", "name": "Western Forward Base", "region": "Western Sector (Demo)"},
    {"id": "loc-central", "name": "Central Reserve Hub", "region": "Central Command (Demo)"},
]

INVENTORY = [
    # Rations & Hydration
    {"id": "food-001", "name": "Emergency Ration Pack A (24-hr)", "category": "Food & Rations", "location_id": "loc-north", "stock": 650, "daily_usage": 100, "reorder_level": 300, "unit": "packs"},
    {"id": "food-002", "name": "Ready-to-Eat Meal Pack MRE-II", "category": "Food & Rations", "location_id": "loc-valley", "stock": 580, "daily_usage": 80, "reorder_level": 250, "unit": "packs"},
    {"id": "food-003", "name": "High-Altitude Energy Bars (Crates of 120)", "category": "Food & Rations", "location_id": "loc-west", "stock": 20, "daily_usage": 12, "reorder_level": 40, "unit": "crates"},
    {"id": "water-001", "name": "Potable Water Canisters (20L Jerrycans)", "category": "Water & Hydration", "location_id": "loc-east", "stock": 90, "daily_usage": 45, "reorder_level": 120, "unit": "canisters"},
    {"id": "water-002", "name": "Water Purification Tablets (Box of 500)", "category": "Water & Hydration", "location_id": "loc-central", "stock": 450, "daily_usage": 8, "reorder_level": 30, "unit": "boxes"},

    # Fuel & Lubricants
    {"id": "fuel-001", "name": "Arctic Sub-Zero Diesel (D-80 Drums, 200L)", "category": "Fuel & Lubricants", "location_id": "loc-north", "stock": 210, "daily_usage": 25, "reorder_level": 100, "unit": "drums"},
    {"id": "fuel-002", "name": "Aviation Turbine Fuel (ATF K-50 Barrels)", "category": "Fuel & Lubricants", "location_id": "loc-valley", "stock": 140, "daily_usage": 10, "reorder_level": 50, "unit": "barrels"},
    {"id": "fuel-003", "name": "Synthetic Sub-Zero Engine Oil (OW-40)", "category": "Fuel & Lubricants", "location_id": "loc-west", "stock": 25, "daily_usage": 15, "reorder_level": 80, "unit": "litres"},
    {"id": "fuel-004", "name": "Field Generator Fuel (Kerosene Blended)", "category": "Fuel & Lubricants", "location_id": "loc-east", "stock": 50, "daily_usage": 18, "reorder_level": 70, "unit": "drums"},

    # Medical & Trauma
    {"id": "med-001", "name": "Tactical Combat Casualty Care (TCCC) Kits", "category": "Medical & Trauma", "location_id": "loc-north", "stock": 28, "daily_usage": 6, "reorder_level": 35, "unit": "kits"},
    {"id": "med-002", "name": "Emergency Plasma & Saline Bags (500ml)", "category": "Medical & Trauma", "location_id": "loc-valley", "stock": 140, "daily_usage": 8, "reorder_level": 50, "unit": "units"},
    {"id": "med-003", "name": "HAPE First-Line Emergency Kits", "category": "Medical & Trauma", "location_id": "loc-west", "stock": 4, "daily_usage": 3, "reorder_level": 20, "unit": "kits"},
    {"id": "med-004", "name": "Broad-Spectrum Antibiotics & Dressing Packs", "category": "Medical & Trauma", "location_id": "loc-east", "stock": 35, "daily_usage": 10, "reorder_level": 60, "unit": "packs"},
    {"id": "med-005", "name": "Portable Medical Oxygen Cylinders (4L)", "category": "Medical & Trauma", "location_id": "loc-central", "stock": 240, "daily_usage": 4, "reorder_level": 25, "unit": "cylinders"},

    # Maintenance & Spares
    {"id": "parts-001", "name": "Heavy All-Terrain Run-Flat Tires (Set of 4)", "category": "Maintenance & Spares", "location_id": "loc-valley", "stock": 45, "daily_usage": 3, "reorder_level": 20, "unit": "sets"},
    {"id": "parts-002", "name": "24V Cold-Cranking Military Batteries", "category": "Maintenance & Spares", "location_id": "loc-west", "stock": 5, "daily_usage": 5, "reorder_level": 30, "unit": "units"},
    {"id": "parts-003", "name": "Hydraulic Brake Caliper Assembly Kits", "category": "Maintenance & Spares", "location_id": "loc-north", "stock": 35, "daily_usage": 4, "reorder_level": 25, "unit": "kits"},
    {"id": "parts-004", "name": "Heavy Vehicle Snow Chains & Cleats", "category": "Maintenance & Spares", "location_id": "loc-east", "stock": 22, "daily_usage": 7, "reorder_level": 40, "unit": "pairs"},

    # Tactical Gear & Communications
    {"id": "gear-001", "name": "Extreme Cold Weather Clothing System (Layer-3)", "category": "Tactical Gear", "location_id": "loc-north", "stock": 80, "daily_usage": 8, "reorder_level": 50, "unit": "suits"},
    {"id": "gear-002", "name": "Mountaineering Dynamic Ropes & Carabiners", "category": "Tactical Gear", "location_id": "loc-east", "stock": 18, "daily_usage": 3, "reorder_level": 25, "unit": "coils"},
    {"id": "gear-003", "name": "Thermal Sub-Zero Bivouac Sleeping Bags", "category": "Tactical Gear", "location_id": "loc-west", "stock": 20, "daily_usage": 6, "reorder_level": 45, "unit": "bags"},
    {"id": "comm-001", "name": "Tactical VHF/UHF Handheld Radio Sets", "category": "Communications", "location_id": "loc-north", "stock": 35, "daily_usage": 2, "reorder_level": 20, "unit": "sets"},
    {"id": "comm-002", "name": "Solar Field Charging Power Banks (100W)", "category": "Communications", "location_id": "loc-valley", "stock": 50, "daily_usage": 3, "reorder_level": 25, "unit": "units"},
    {"id": "comm-003", "name": "Thermal Reconnaissance Monoculars (Gen-3)", "category": "Communications", "location_id": "loc-west", "stock": 3, "daily_usage": 1, "reorder_level": 15, "unit": "units"},
    {"id": "comm-004", "name": "Secure Satellite BGAN Field Terminals", "category": "Communications", "location_id": "loc-central", "stock": 60, "daily_usage": 1, "reorder_level": 10, "unit": "units"},

    # Ammunition & Ordnance
    {"id": "ammo-001", "name": "7.62x51mm Linked Ball Ammo (Crates of 1000)", "category": "Ammunition & Ordnance", "location_id": "loc-north", "stock": 120, "daily_usage": 15, "reorder_level": 80, "unit": "crates"},
    {"id": "ammo-002", "name": "5.56x45mm Standard Cartridges (Crates of 1200)", "category": "Ammunition & Ordnance", "location_id": "loc-west", "stock": 40, "daily_usage": 20, "reorder_level": 100, "unit": "crates"},
    {"id": "ammo-003", "name": "Screening Multi-Spectral Smoke Canisters", "category": "Ammunition & Ordnance", "location_id": "loc-east", "stock": 35, "daily_usage": 8, "reorder_level": 60, "unit": "canisters"},
]

# Synthetic 14-day daily consumption history for baseline models
HISTORY = {
    "food-001": [92, 98, 101, 95, 104, 99, 103, 100, 97, 102, 105, 96, 100, 98],
    "food-002": [75, 78, 82, 80, 85, 79, 81, 84, 80, 82, 79, 83, 81, 80],
    "food-003": [10, 12, 11, 14, 13, 12, 11, 13, 12, 14, 11, 12, 13, 12],
    "water-001": [42, 44, 46, 45, 48, 43, 47, 45, 44, 46, 48, 43, 46, 45],
    "water-002": [7, 8, 9, 8, 8, 7, 9, 8, 7, 9, 8, 8, 9, 8],
    "fuel-001": [22, 24, 26, 25, 28, 24, 27, 25, 24, 26, 28, 25, 26, 25],
    "fuel-002": [9, 10, 11, 10, 12, 9, 11, 10, 9, 11, 10, 10, 11, 10],
    "fuel-003": [14, 15, 16, 15, 17, 14, 16, 15, 14, 16, 17, 15, 16, 15],
    "fuel-004": [16, 18, 19, 18, 20, 17, 19, 18, 17, 19, 20, 18, 19, 18],
    "med-001": [5, 6, 7, 6, 6, 5, 7, 6, 5, 7, 6, 6, 7, 6],
    "med-002": [7, 8, 9, 8, 10, 8, 9, 8, 7, 9, 8, 8, 9, 8],
    "med-003": [2, 3, 3, 4, 3, 2, 4, 3, 2, 4, 3, 3, 4, 3],
    "med-004": [9, 10, 11, 10, 12, 9, 11, 10, 9, 11, 10, 10, 11, 10],
    "med-005": [3, 4, 4, 5, 4, 3, 5, 4, 3, 5, 4, 4, 5, 4],
    "parts-001": [2, 3, 3, 4, 3, 2, 4, 3, 2, 4, 3, 3, 4, 3],
    "parts-002": [4, 5, 5, 6, 5, 4, 6, 5, 4, 6, 5, 5, 6, 5],
    "parts-003": [3, 4, 4, 5, 4, 3, 5, 4, 3, 5, 4, 4, 5, 4],
    "parts-004": [6, 7, 8, 7, 8, 6, 8, 7, 6, 8, 7, 7, 8, 7],
    "gear-001": [7, 8, 9, 8, 10, 8, 9, 8, 7, 9, 8, 8, 9, 8],
    "gear-002": [2, 3, 3, 4, 3, 2, 4, 3, 2, 4, 3, 3, 4, 3],
    "gear-003": [5, 6, 7, 6, 7, 5, 7, 6, 5, 7, 6, 6, 7, 6],
    "comm-001": [1, 2, 2, 3, 2, 1, 3, 2, 1, 3, 2, 2, 3, 2],
    "comm-002": [2, 3, 3, 4, 3, 2, 4, 3, 2, 4, 3, 3, 4, 3],
    "comm-003": [1, 1, 1, 2, 1, 1, 2, 1, 1, 2, 1, 1, 2, 1],
    "comm-004": [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    "ammo-001": [13, 15, 16, 15, 18, 14, 17, 15, 14, 16, 18, 15, 16, 15],
    "ammo-002": [18, 20, 22, 21, 23, 19, 22, 20, 19, 21, 23, 20, 21, 20],
    "ammo-003": [7, 8, 9, 8, 10, 8, 9, 8, 7, 9, 8, 8, 9, 8],
}
