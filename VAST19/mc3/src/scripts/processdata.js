
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

let catergogryObject = {
    'user':{
        'extractFunc': _.partial(getObject,'account')
    },
    'location':{
        'extractFunc': _.partial(getObject,'location')
    },
    'event':{
        'extractFunc': function(data){return extractWords('message',this.keywords,data)},
        'keywords': ['earthquake','tsunami','flood']
    },
    'resource':{
        'extractFunc': function(data){return extractWords('message',this.keywords,data)},
        'keywords': _.flatten(_.map(termsList,function(term, key){ return term; }))
    },
    // 'hashtash':{
    //     'extractFunc': _.partial(extractWords,'message',this.keywords),
    //     'keywords': ['earthquake','tsunami','flood']
    // }
};

let catergogryList = _.map(catergogryObject,(v,k)=>{return {key: k, value: v}});
function getObject (key,data) {
    let temp={};
    if (_.isArray(data[key]))
        data[key].forEach(d=>temp[d] = 1);
    else
        temp[data[key]] = 1;
    return temp;
}
function extractWords (key,terms,data) {
    let message = data[key];
    let reg =   new RegExp(terms.join('|'),'gi');
    const all_matched = _.unique(message.match(reg)); // take only 1
    let collection = {}
    all_matched.forEach(term=>collection[term] = 1);
    // const getWordsFreq = words => words.forEach(word => collection[word] = ++collection[word] || 1);
    // getWordsFreq (all_matched);
    return collection;
}


