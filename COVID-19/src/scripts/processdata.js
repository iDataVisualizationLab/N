
var termsList = {
    'China': (()=>(d=(['China', 'Chinese']),d.category='GPE',d)) (),
    'South Korea': (()=>(d=(['Korea', 'Korean','Seoul']),d.category='GPE',d)) (),
    'United States': (()=>(d=(['U.S','United States','USA']),d.category='GPE',d)) (),
    'Portugal': (()=>(d=(['Portugal', 'Portuguese']),d.category='GPE',d)) (),
    'Hubei': (()=>(d=(['Hubei']),d.category='LOC',d)) (),
    'Wuhan': (()=>(d=(['Wuhan']),d.category='LOC',d)) (),
    'Intensive care unit': (()=>(d=(['ICU']),d.category='ORG',d)) (),
    'MERS-CoV': (()=>(d=(['MERS','MER-CoV','Middle East']),d.category='Virus',d)) (),
    'SARS-CoV': (()=>(d=(['SARS','ZJ01','Severe Acute Respiratory Syndrome']),d.category='Virus',d)) (),
    'Zika': (()=>(d=(['Zika']),d.category='Virus',d)) (),
    'Sarbecovirus': (()=>(d=(['Sarbecovirus']),d.category='Virus',d)) (),
    'H1N1': (()=>(d=(['H1N1']),d.category='Virus',d)) (),
    'Influenza B': (()=>(d=(['Influenza','Yamagata']),d.category='Virus',d)) (),
    'Coronavirus': (()=>(d=(['Coronavir','CoV ','PDCoV','corona virus','Coronovirus','CoVs']),d.category='Virus',d)) (),
    'COVID-19': (()=>(d=(['COVID-','Coronavirus Disease 2019','Coronavirus Disease','Corona Virus Disease','2019-nCoV','disease-2019']),d.category='COVID-19',d)) (),
    'WHO': (()=>(d=(['WHO','World Health Organization']),d.category='ORG',d)) (),
    'Clinical': (()=>(d=(['Clinical']),d.category='ORG',d)) (),
};
var dictionary = {};
termsList2dictionary()
function termsList2dictionary(){
    dictionary = {};
    Object.keys(termsList).forEach(k=>{
        termsList[k].forEach(d=>{
            dictionary[d] = k;
        })
    })
}
function replaceTerm(t){
    let dict = dictionary[t];
    if (!dict){
        dict = Object.keys(dictionary).find(d=>(new RegExp(d,'gi')).test(t));
        if (dict)
            dict = dictionary[dict];
    }

    if (dict)
        return {term: dict, category: termsList[dict].category};
    return undefined;
}

var collections = {
    'location_post': ['location_in_message'],
    'location_in_message': ['location_in_message'],
    'event': ['earthquake','grounds','flooding','fire','aftershock'],
    'resource': ['sewer','power/energy','roads_and_bridges','medical','shelter','food','water'],
}

let catergogryObject = {
    'user':{
        'extractFunc': function(data){return extracSpecial('user','message',{s:'@',replace:true},data,_.partial(getObject,'account')(data))},
        colororder: 2
    },
    'event':{
        'extractFunc': function(data){return extractWordsCollection('message',this.keywords,data)},
        'keywords': getTermsArrayCollection('event'),
        colororder: 4
    },
    'resource':{
        'extractFunc': function(data){return extractWordsCollection('message',this.keywords,data)},
        'keywords': getTermsArrayCollection('resource'),
        colororder: 0
    },
    'hashtag':{
        'extractFunc': function(data){return extracSpecial('hashtag','message',{s:'#',replace:false},data)},
        colororder: 5
    },
    'location (in the message)':{
        'extractFunc': function(data){return extractWordsCollection('message',this.keywords,data)},
        'keywords': getTermsArrayCollection('location_in_message'),
        colororder: 3
    },
    'location (of the message)':{
        'extractFunc': _.partial(getObject,'location'),
        colororder: 1
    }
    // 'hashtash':{
    //     'extractFunc': _.partial(extractWords,'message',this.keywords),
    //     'keywords': ['earthquake','tsunami','flood']
    // }
};
function getTermsArrayCollection(header){
    return collections[header].map(d=>{return {key:d, value: termsList[d]}});
}
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
function extracSpecial (termkey,key,symbolOb,data,oldcollection) {
    let message = data[key];
    let symbol = symbolOb.s;
    let collection = oldcollection||{};
    let terms_coll = message.match(new RegExp(symbol+'\\w*','g'));
    if (terms_coll) {
        if (symbolOb.replace)
            terms_coll = terms_coll.map(t => t.replace(symbol, ''));
        terms_coll.forEach(t =>{
            if (!termsList[termkey].find(e=>e===t))
                termsList[termkey].push(t);
            collection[t] = 1;});
    }
    return collection;
}
function extractWordsCollection (key,terms,data,oldcollection) {
    let message = data[key];
    let collection = oldcollection||{};
    terms.forEach(t=>{
        t.value.find(
            k => {
                if ((new RegExp(' '+k+'|^'+k,'i')).test(message)) {
                    collection[t.key] = 1;
                    return true;
                }
                return false;

            })

    });
    return collection;
}

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

function markWord (message,keys){
    keys.forEach(maink=>{
        if (termsList[maink.text])
            termsList[maink.text].forEach(k=>{
                const reg = new RegExp(k,'g');
                // const reg = new RegExp(' '+k+'|^'+k+'|@'+k,'gi');
                if(reg.test(message))
                    message = message.replace(reg,generatemark(maink,termsList[maink.text].length>1?maink.text:undefined))
            });
        else {
            // const reg = new RegExp(maink.text,'g');
            let termfix = maink.text.replace(/%/g,'\\%');
            const reg = new RegExp(' '+termfix+'|^'+termfix+'|@'+termfix,'gi');
            if(reg.test(message))
                message = message.replace(reg, generatemark(maink));
        }
    });
    return message;
}
function generatemark(category,subcategory){
    let str = '<mark class="entity" style="background:'+category.color+';">';
    str += '$&';
    str += '<span>'+(subcategory?subcategory:category.group).split(' ')[0]+'</span>';
    str += '</mark>';
    return str;
}
let spamTopics = ["How You Can Help","powerlines on bus line","removed. ^ag"]
function spamremove (data){
    return new Promise((resolve, reject) => {
        let dd = data.filter(d=>new RegExp(' sale|^sale | deal |deals|opotuni').test(d.message));
        let nest_spam = d3.nest().key(d=>d.account).rollup(d=>d.length).entries(dd);
        const spamlist = nest_spam.sort((a,b)=>b.value-a.value).filter(d=>d.value>10);
        data = data.filter(d=>!spamlist.find(e=>e.key===d.account));
        resolve( data.filter(d=>!spamTopics.find(e=>new RegExp(e).test(d.message))));
    });
}

function removeNonecategory (data){
    return new Promise((resolve, reject) => {
        resolve( data.filter(d=>d3.sum(_.without(Object.keys(catergogryObject),'location (of the message)','user'),function(k){return d.category[k]?1:0})));
        // resolve( data.filter(d=>d.location==="Broadview").filter(d=>d3.sum(_.without(Object.keys(catergogryObject),'location (of the message)','user'),function(k){return d.category[k]?1:0})));
        // resolve(data.filter(d=>d.location==="Old Town"));
    });
}