// store
var chosenService = 0;
const variablesNames = ['profile','serviceFullList']
var conf={};
variablesNames.forEach(d=>conf[d] = window[d]);

//***********************
Loadtostore();

//***********************

function SaveStore() {
    variablesNames.forEach(d=>{ conf[d] = window[d];saveConf(d);});
}
function checkInvalidStore(){
    var retrievedObject = localStorage.getItem('serviceFullList');
    if (retrievedObject!=null&&retrievedObject!==undefined&&retrievedObject!=="undefined") {
        let checkpoint = JSON.parse(retrievedObject);
        return checkpoint[0].angle ===undefined;
    } else {
        return true;
    }
}
function Loadtostore() {
    if(checkInvalidStore())
        DeleteAllstore();
    variablesNames.forEach(d=>{ window[d] = checkConf(d)});
}
function DeleteAllstore() {
    variablesNames.forEach(d=>refeshConf(d));
}
function checkConf(namekey) {
    var retrievedObject = localStorage.getItem(namekey);
    if (retrievedObject!=null&&retrievedObject!==undefined&&retrievedObject!=="undefined") {
        conf[namekey] = JSON.parse(retrievedObject);
        return conf[namekey];
    } else {
        saveConf(namekey);
        return conf[namekey];
    }
}

function saveConf(namekey) {
    localStorage.setItem(namekey, JSON.stringify(conf[namekey]));
}

function refeshConf(namekey) {
    localStorage.removeItem(namekey);
}
