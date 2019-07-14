
var termsList = {
    'local_area': ['Palace Hills',
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
        'West Parton'],

    "sewer_and_water": ["discharged", "discharge", "drain", "drainage", "flood", "hygiene", "irrigation", "pipes", "pump", "river", "sanitary", "sewage", "sewer", "stream", "underground", "wash", "waste", "water"],

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

var collections = {
    'location': ['local_area'],
    'event': ['earthquake','grounds','flooding','aftershock','fire'],
    'resource': ['sewer_and_water','power/energy','roads_and_bridges','medical','buildings']
}

let catergogryObject = {
    'user':{
        'extractFunc': _.partial(getObject,'account')
    },
    'location':{
        'extractFunc': _.partial(getObject,'location')
    },
    'event':{
        'extractFunc': function(data){return extractWords('message',this.keywords,data)},
        'keywords': getTermsArray('event')
    },
    'resource':{
        'extractFunc': function(data){return extractWords('message',this.keywords,data)},
        'keywords': getTermsArray('resource')
    },
    // 'hashtash':{
    //     'extractFunc': _.partial(extractWords,'message',this.keywords),
    //     'keywords': ['earthquake','tsunami','flood']
    // }
};
function getTermsArray(header){
    return _.flatten(collections[header].map(d=>termsList[d]));
}
let catergogryList = _.map(catergogryObject,(v,k)=>{return {key: k, value: v}});
function getObject (key,data) {
    let temp={};
    if (_.isArray(data[key]))
        data[key].forEach(d=>temp[d] = 1);
    else
        temp[data[key]] = 1;
    return temp;
}
// function extractWords (key,terms,data) {
//     let message = data[key];
//     let reg =   new RegExp(terms.join('|'),'gi');
//     const all_matched = _.unique(message.match(reg));
//     return all_matched;
// }

function extractWords (key,terms,data) {
    let message = data[key];
    let collection = {};
    terms.forEach(k=>{
        if (new RegExp(k,'i').test(message))
            collection[k] = 1;
    });
    return collection;
}

// function extractWords (key,terms,data) {
//     let message = data[key];
//     let reg =   new RegExp(terms.join('|'),'gi');
//     const all_matched = _.unique(message.match(reg)); // take only 1
//     let collection = {};
//     all_matched.forEach(term=>collection[term] = 1);
//     return collection;
// }


