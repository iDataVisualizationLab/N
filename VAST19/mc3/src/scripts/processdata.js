const regionNameList =
    ['Palace Hills',
        'Northwest',
        'Old Town',
        'Safe Town',
        'Southwest',
        'Downtown',
        'Wilson Forest',
        'Scenic Vista',
        'Broadview',
        'Chapparal',
        'Terrapin Springs',
        'Pepper Mill',
        'Cheddarford',
        'Easton',
        'Weston',
        'Southton',
        'Oak Willow',
        'East Parton',
        'West Parton'];

var termsList = {"sewer_and_water": ["discharged", "discharge", "drain", "drainage", "flood", "hygiene", "irrigation", "pipes", "pump", "river", "sanitary", "sewage", "sewer", "stream", "underground", "wash", "waste", "water"],

    "power/energy": ["valve", "heat", "gas", "power", "electric", "candle", "flashlight", "generator", "black out", "blackout", "dark", "radiation", "radio rays", "energy", "nuclear", "fuel", "battery", "radiant"],

    "roads_and_bridges": ["airport", "avenue", "bridge", "bus", "congestion", "drive", "flight", "jam", "logistic", "metro", "mta", "road", "street", "subway", "traffic", "train", "transit", "transportation", "highway", "route", "lane"],

    "medical": ["medical", "red cross", "food", "emergency", "urgent", "evacuate", "evacuating", "evacuation", "protection", "ambulance", "escape", "first aid", "rescue", "rescuing", "dead", "death", "kill", "help", "help out", "help with", "volunteer", "volunteering", "explosion", "exploding", "explode", "victim", "fatalities"],

    "buildings": ["collapse", "housing", "house"],

    "earthquake": ["seismic", "earthquake", "quake", "quaking", "shake", "shaking", "wobble", "wobbling", "quiver", "epicenter" ],

    "grounds": ["mudslide", "rupture", "landslides", "liquefaction",  "liquifactjheion"],

    "flooding": ["tsunami", "flood"],

    "aftershock": ["aftershock"],

    "fire": ["fire", "smoke"]
};

var catergogry = ['user','location','hastash','userlink'];

for (var d in termsList){
    category.push(d);
}


