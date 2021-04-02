//parametter
const COMPUTE = 'nodes_info';
const JOB = 'jobs_info';
const JOBNAME = 'job_name';
const USER = 'user_name';

const timeFormat = d3.timeFormat('%Y-%m-%dT%H:%M:%S-05:00');
// layout
let Layout = {
    data:{},
};

// let getDataVis = getDataVis_vispaper;
// let getDataVis = getDataVis_imbd;
// let getDataVis = getDataVis_pub;
let getDataVis = getDataVis_gen;

$(document).ready(function(){

    updateProcess({percentage:5,text:'Load UI...'})
    initMenu();
    initClusterUI();
    updateProcess({percentage:15,text:'Preprocess data...'});
    initdraw();
    // getDataVis('src/data/IEEE VIS papers 1990-2020 - Main dataset.csv').then(initTimeElement);
    // getDataVis('src/data/imdb85_50.tsv').then(initTimeElement);
    // getDataVis('src/data/imdb1.tsv').then(initTimeElement);
    // getDataVis('src/data/pcCombined3.tsv').then(initTimeElement);
    // getDataVis('src/data/PopCha.tsv').then(initTimeElement);
    // getDataVis('src/data/corpus_ner_geo.tsv').then(initTimeElement);
    getDataVis('src/data/hgnc_complete_set.txt').then(initTimeElement);
});

function initTimeElement(data){
    Layout.data=data;
    setTimeout(()=>{
        handleRankingData(data);
        updateProcess({percentage:80,text:'Preprocess data'})
        drawGantt();
        updateProcess();
    },0);

}

// function getDataVis(url){
//     return d3.csv(url).then(__data=>{
//         const cfilter = {'SciVis':1,'InfoVis':1,'VAST':1};
//         _data = __data//.filter(d=>cfilter[d['Conference']]);
//         debugger
//         const color = d3.scaleOrdinal(d3.schemeCategory10);
//         const time_stamp_ob = {};
//         const DOImap={};
//         _data.forEach(r=>{
//             time_stamp_ob[r.Year] = Object.keys(time_stamp_ob).length-1;
//             DOImap[r.DOI] = r;
//         });
//         const time_stamp = Object.keys(time_stamp_ob).map(d=>new Date(d,0,1));
//         dataIn = {
//             root_nodes: [],
//             net: time_stamp.map((d, ti) => ({nodes: [], links: [], linksObj:{}, time: d, ti})),
//             datamap: {},
//             time_stamp: time_stamp
//         };
//         debugger
//         const objs = {};
//         _data.forEach(r=>{
//             const i = time_stamp_ob[r.Year];
//             const papers= [r.Title,...r['InternalReferences'].split(',').filter(d=>DOImap[d]).map(d=>DOImap[d].Title)];
//             console.log(r.Year,papers.length-1)
//             papers.forEach((a,ai)=>{
//                 if (!objs[a]){
//                     let item = {
//                         id: a,
//                         type: 'paper',
//                         name: a,
//                         data:{},
//                         timeArr:time_stamp.map(d=>undefined),
//                     };
//                     objs[a]=item;
//                     dataIn.root_nodes.push(item);
//                 }
//                 if (!objs[a].timeArr[i]) {
//                     objs[a].timeArr[i] = {
//                         id: a,
//                         name: a,
//                         type: 'paper',
//                         data: {name: a, isNew: []},
//                         parent: objs[a],
//                         ti: i
//                     };
//                     objs[a].timeArr[i]._index = dataIn.net[i].nodes.length;
//                     dataIn.net[i].nodes.push(objs[a].timeArr[i]);
//                 };
//                 // pair
//                 // for (let aj =0; aj < ai ;aj++){
//                 const aj = 0;
//                 if (ai){
//                     const key1 = papers[aj]+'__'+a;
//                     const key2 = a+'__'+papers[aj];
//                     let key = dataIn.net[i].linksObj[key1]?key1:(dataIn.net[i].linksObj[key2]?key2:key1);
//                     if (!dataIn.net[i].linksObj[key]){
//                         // link
//                         dataIn.net[i].linksObj[key] = {
//                             source: papers[aj],
//                             target: a,
//                             value: 1,
//                             color: color(r['Conference']),
//                             _index: dataIn.net[i].links.length
//                         };
//                         dataIn.net[i].links.push(dataIn.net[i].linksObj[key]);
//                     }else{
//                         dataIn.net[i].linksObj[key].value++;
//                     }
//                 }
//                 // }
//             });
//         });
//         drawObject.graphicopt({type1:'paper',type2:'paper'});
//         Layout.color = color;
//         return dataIn;
//     });
// }
function getDataVis_vispaper(url){
    return d3.csv(url).then(__data=>{
        const cfilter = {'SciVis':1,'InfoVis':1,'VAST':1};
        _data = __data//.filter(d=>cfilter[d['Conference']]);
        console.log('Percent data = ',_data.length/__data.length*100)
        const color = d3.scaleOrdinal(d3.schemeCategory10);
        const time_stamp_ob = {};
        _data.forEach(r=>{
            time_stamp_ob[r.Year] = Object.keys(time_stamp_ob).length-1;
        });
        const time_stamp = Object.keys(time_stamp_ob).map(d=>new Date(d,0,1));
        dataIn = {
            root_nodes: [],
            net: time_stamp.map((d, ti) => ({nodes: [], links: [], linksObj:{}, time: d, ti})),
            datamap: {},
            time_stamp: time_stamp
        };
        debugger
        const objs = {};
        _data.forEach(r=>{
            const i = time_stamp_ob[r.Year];
            const authors= r['AuthorNames-Deduped'].split(';');
            authors.forEach((a,ai)=>{
                if (!objs[a]){
                    let item = {
                        id: a,
                        type: 'author',
                        name: a,
                        data:{},
                        timeArr:[],
                        freq:0,
                    };
                    objs[a]=item;
                    dataIn.root_nodes.push(item);
                }
                if (!objs[a].timeArr[i]) {
                    objs[a].timeArr[i] = {
                        id: a,
                        name: a,
                        type: 'author',
                        data: {name: a, isNew: []},
                        parent: objs[a],
                        freq:1,
                        ti: i
                    };
                    objs[a].timeArr[i]._index = dataIn.net[i].nodes.length;
                    dataIn.net[i].nodes.push(objs[a].timeArr[i]);
                }else{
                    objs[a].timeArr[i].freq++;
                    objs[a].freq++;
                };;
                // pair
                for (let aj =0; aj < ai ;aj++){
                    const key1 = authors[aj]+'__'+a;
                    const key2 = a+'__'+authors[aj];
                    let key = dataIn.net[i].linksObj[key1]?key1:(dataIn.net[i].linksObj[key2]?key2:key1);
                    if (!dataIn.net[i].linksObj[key]){
                        // link
                        dataIn.net[i].linksObj[key] = {
                            source: authors[aj],
                            target: a,
                            value: 1,
                            color: color(r['Conference']),
                            _index: dataIn.net[i].links.length
                        };
                        dataIn.net[i].links.push(dataIn.net[i].linksObj[key]);
                    }else{
                        dataIn.net[i].linksObj[key].value++;
                    }
                }
            });
        });
        drawObject.graphicopt({type1:'author',type2:'author'});
        Layout.color = color;
        return dataIn;
    });
}

function getDataVis_imbd(url,filterFunc){
    return d3.tsv(url).then(__data=>{
        _data = __data.filter(r=>r['Author Names'])//.filter(d=>(+d['Year'])>=1980);
        _data.sort((a,b)=>((+a.Year)- (+b.Year)));
        debugger
        console.log('Percent data = ',_data.length);
        console.log('Percent data = ',_data.length/__data.length*100);
        const color = d3.scaleOrdinal(d3.schemeCategory10);
        const time_stamp_ob = {};
        time_stamp_ob[_data[0].Year] = 0;
        _data.forEach(r=>{
            time_stamp_ob[r.Year] = Object.keys(time_stamp_ob).length-1;
        });
        const time_stamp = Object.keys(time_stamp_ob).map(d=>new Date(d,0,1));
        dataIn = {
            root_nodes: [],
            net: time_stamp.map((d, ti) => ({nodes: [], links: [], linksObj:{}, time: d, ti})),
            datamap: {},
            time_stamp: time_stamp
        };
        debugger
        const linksObj = time_stamp.map(t=>new Map());
        let objs = {};
        _data.forEach(r=>{
            const i = time_stamp_ob[r.Year];
            const terms= r['Author Names'].split(';').map(a=>a.trim());
            r.terms = terms;
            terms.forEach((a,ai)=>{
                if (!objs[a]){
                    let item = {
                        id: a,
                        type: 'author',
                        name: a,
                        data:{},
                        color:color(r['Conference']),
                        timeArr:[],
                        freq:0
                    };
                    objs[a]=item;
                    dataIn.root_nodes.push(item);
                }
                if (!objs[a].timeArr[i]) {
                    objs[a].timeArr[i] = {
                        id: a,
                        name: a,
                        type: 'author',
                        data: {name: a, isNew: []},
                        color:color(r['Conference']),
                        parent: objs[a],
                        freq:1,
                        ti: i
                    };
                    objs[a].timeArr[i]._index = dataIn.net[i].nodes.length;
                    dataIn.net[i].nodes.push(objs[a].timeArr[i]);
                }else{
                    objs[a].timeArr[i].freq++;
                    objs[a].freq++;
                };;
                // pair
                // for (let aj =0; aj < ai ;aj++){
                //     const key1 = authors[aj]+'__'+a;
                //     const key2 = a+'__'+authors[aj];
                //     let key = dataIn.net[i].linksObj[key1]?key1:(dataIn.net[i].linksObj[key2]?key2:key1);
                //     if (!dataIn.net[i].linksObj[key]){
                //         // link
                //         dataIn.net[i].linksObj[key] = {
                //             source: authors[aj],
                //             target: a,
                //             value: 1,
                //             color: color(r['Conference']),
                //             _index: dataIn.net[i].links.length
                //         };
                //         dataIn.net[i].links.push(dataIn.net[i].linksObj[key]);
                //     }else{
                //         dataIn.net[i].linksObj[key].value++;
                //     }
                // }
            });
        });
        // reduce data
        console.log('#terms raw ',dataIn.root_nodes.length);
        const numNode = Math.min(120, dataIn.root_nodes.length);
        const numNode2 = Math.min(numNode*10, dataIn.root_nodes.length);
        dataIn.root_nodes.sort((a,b)=>b.freq-a.freq);
        objs = {};
        for (let i=0;i<numNode2;i++){
            objs[dataIn.root_nodes[i].id] = dataIn.root_nodes[i];
        }

        _data.forEach(r=>{
            const i = time_stamp_ob[r.Year];

            const terms=  r.terms.filter(t=>objs[t]);
            terms.forEach((a,ai)=>{
                // pair
                for (let aj =0; aj < ai ;aj++){
                    const key1 = terms[aj]+'__'+a;
                    const key2 = a+'__'+terms[aj];
                    let key = linksObj[i].has(key1)?key1:(linksObj[i].has(key2)?key2:key1);
                    // let key = dataIn.net[i].linksObj[key1]?key1:(dataIn.net[i].linksObj[key2]?key2:key1);
                    if (!linksObj[i].has(key)){
                        // link
                        objs[terms[aj]].hasLink = true;
                        objs[a].hasLink = true;
                        const link = {
                            source: terms[aj],
                            target: a,
                            value: 1,
                            color: color(r['Conference']),
                            _index: dataIn.net[i].links.length
                        };
                        linksObj[i].set(key,link);
                        dataIn.net[i].links.push(link);
                    }else{
                        linksObj[i].get(key).value++;
                    }
                }
            });
        });
        debugger
        const min = 0;
        let objs_2 = {};
        dataIn.net.forEach((n,i)=>{
            n.links=n.links.filter(l=>{
                if(l.value>=min){
                    objs_2[l.source] = objs[l.source];
                    objs_2[l.target] = objs[l.target];
                    return true
                }
                return false;
            });
        });
        dataIn.root_nodes = Object.values(objs_2);

        drawObject.graphicopt({type1:'author',type2:'author'});
        Layout.color = color;
        console.log('#terms ',dataIn.root_nodes.length);
        console.log('#links',d3.sum(dataIn.net,d=>d.links.length));
        return dataIn;
    });
}

function getDataVis_pub(url){
    const TIME = 'time';
    const timeformat = d3.timeFormat('%Y-%m-1');
    const blackList = {};//{'iraq':1,'barack obama':1}
    return d3.tsv(url).then(__data=>{
        _data = __data//.filter(d=>(+d['Year'])>=1980);
        _data.sort((a,b)=>(+new Date(a[TIME]) - (+new Date(b[TIME]))));
        const GROUPS = __data.columns.filter(d=>(d!=='source')&&(d!==TIME));
        debugger
        console.log('Percent data = ',_data.length);
        console.log('Percent data = ',_data.length/__data.length*100);
        const color = d3.scaleOrdinal(d3.schemeCategory10);
        const time_stamp_ob = {};
        const time_stamp = d3.scaleTime().domain([new Date(timeformat(new Date(_data[0][TIME]))), new Date(timeformat(new Date(_data[_data.length-1][TIME])))]).ticks(d3.timeMonth.every(1))
        time_stamp
            .forEach((t,ti)=>{
                time_stamp_ob[timeformat(t)] = ti;
            });
        // _data.forEach(r=>{
        //     r[TIME] = new Date(r[TIME]);
        //     time_stamp_ob[timeformat(r[TIME])] = Object.keys(time_stamp_ob).length-1;
        // });
        const linksObj = time_stamp.map(t=>new Map());
        dataIn = {
            root_nodes: [],
            net: time_stamp.map((d, ti) => ({nodes: [], links: [], time: d, ti})),
            datamap: {},
            time_stamp: time_stamp
        };
        debugger
        let objs = {};
        _data.forEach(r=>{
            r[TIME] = new Date(r[TIME]);
            const i = time_stamp_ob[timeformat(r[TIME])];
            const terms= [];
            GROUPS.forEach(k=>{
                r[k].split('|').forEach(a=>{
                    if (!blackList[a]){
                        terms.push({key:k,value:a.trim()})
                    }
                });
            });
            r.terms = terms;
            terms.forEach((v,ai)=>{
                const a = v.value;
                if (!objs[a]){
                    let item = {
                        id: a,
                        type: 'term',
                        category:v.key,
                        color: color(v.key),
                        name: a,
                        data:{},
                        timeArr:[],
                        freq:1
                    };
                    objs[a]=item;
                    dataIn.root_nodes.push(item);
                }
                if (!objs[a].timeArr[i]) {
                    objs[a].timeArr[i] = {
                        id: a,
                        name: a,
                        type: 'term',
                        category:v.key,
                        color: color(v.key),
                        data: {name: a, isNew: []},
                        parent: objs[a],
                        freq: 1,
                        ti: i
                    };
                    objs[a].freq++;
                    objs[a].timeArr[i]._index = dataIn.net[i].nodes.length;
                    dataIn.net[i].nodes.push(objs[a].timeArr[i]);
                }else{
                    objs[a].timeArr[i].freq++;
                    objs[a].freq++;
                };
            });
        });
        // reduce data
        console.log('#terms raw ',dataIn.root_nodes.length);
        const numNode = Math.min(120, dataIn.root_nodes.length);
        const numNode2 = Math.min(numNode*10, dataIn.root_nodes.length);
        dataIn.root_nodes.sort((a,b)=>b.freq-a.freq);
        objs = {};
        for (let i=0;i<numNode2;i++){
            objs[dataIn.root_nodes[i].id] = dataIn.root_nodes[i];
        }

        _data.forEach(r=>{
            const i = time_stamp_ob[timeformat(r[TIME])];

            const terms=  r.terms.filter(t=>objs[t.value]);
            terms.forEach((v,ai)=>{
                // pair
                const a = v.value;
                for (let aj =0; aj < ai ;aj++){
                    const key1 = terms[aj].value+'__'+a;
                    const key2 = a+'__'+terms[aj].value;
                    let key = linksObj[i].has(key1)?key1:(linksObj[i].has(key2)?key2:key1);
                    // let key = dataIn.net[i].linksObj[key1]?key1:(dataIn.net[i].linksObj[key2]?key2:key1);
                    if (!linksObj[i].has(key)){
                        // link
                        objs[terms[aj].value].hasLink = true;
                        objs[a].hasLink = true;
                        const link = {
                            source: terms[aj].value,
                            target: a,
                            value: 1,
                            color: (terms[aj].key===v.key)?color(v.key):'gray',
                            _index: dataIn.net[i].links.length
                        };
                        linksObj[i].set(key,link);
                        dataIn.net[i].links.push(link);
                    }else{
                        linksObj[i].get(key).value++;
                    }
                }
            });
        });
        debugger
        const min = 30;
        let objs_2 = {};
        dataIn.net.forEach((n,i)=>{
            n.links=n.links.filter(l=>{
                if(l.value>=min){
                    objs_2[l.source] = objs[l.source];
                    objs_2[l.target] = objs[l.target];
                    return true
                }
                return false;
            });
        });
        dataIn.root_nodes = Object.values(objs_2);

        drawObject.graphicopt({type1:'term',type2:'term'});
        Layout.color = color;
        console.log('#terms ',dataIn.root_nodes.length);
        console.log('#links',d3.sum(dataIn.net,d=>d.links.length));
        return dataIn;
    });
}
function getDataVis_gen(url){
    const TIME = 'date_symbol_changed';
    const timeformat = d3.timeFormat('%Y-1-1');
    const blackList = {};//{'iraq':1,'barack obama':1}
    return d3.tsv(url).then(__data=>{
        debugger
        let _data = __data.filter(d=>d['date_symbol_changed']);
        _data.sort((a,b)=>new Date(timeformat(new Date(a[TIME])))-new Date(timeformat(new Date(b[TIME]))))
        _data.forEach(d=>{
            d['Previous Symbols'] = d['prev_symbol'].split('|').join(',');
            d['Synonyms'] = d['alias_symbol'].split('|').join(',');
            d['Approved Symbol'] = d['symbol'];
            return d;
        });

        _data = _data.filter(d => d['Previous Symbols']!=='').slice(0, 0+_data.length/10);
        const color = d3.scaleOrdinal(d3.schemeCategory10);
        const time_stamp_ob = {};
        const time_stamp = d3.scaleTime().domain([new Date(timeformat(new Date(_data[0][TIME]))), new Date(timeformat(new Date(_data[_data.length-1][TIME])))]).ticks(d3.timeYear.every(1))
        time_stamp
            .forEach((t,ti)=>{
                time_stamp_ob[timeformat(t)] = ti;
            })

        dataIn = {
            root_nodes: [],
            net: time_stamp.map((d, ti) => ({nodes: [], links: [], linksObj:{}, time: d, ti})),
            datamap: {},
            time_stamp: time_stamp
        };

        const linksObj = time_stamp.map(t=>new Map());
        let objs = {};

        _data.forEach(d => {
            const i = time_stamp_ob[timeformat(new Date(d[TIME]))];
            handleNode(d['Approved Symbol'],i,'green');
            const _id = d['Approved Symbol'];
            d['Previous Symbols'] = d['Previous Symbols'].split(',');
            d['Previous Symbols'].forEach(id => {
                id = id.trim();
                if (id !== '') {
                    handleNode(id,i,'red');
                    let key = linksObj[i].has(_id)?_id:(linksObj[i].has(id)?id:_id);
                    if (!linksObj[i].has(key)){
                        // link
                        objs[_id].hasLink = true;
                        objs[id].hasLink = true;
                        const link = {
                            source: _id,
                            target: id,
                            value: 1,
                            // color: color(r['Conference']),
                            _index: dataIn.net[i].links.length
                        };
                        linksObj[i].set(key,link);
                        dataIn.net[i].links.push(link);
                    }else{
                        linksObj[i].get(key).value++;
                    }
                }
            });
            d['Synonyms'] = d['Synonyms'].split(',');
            d['Synonyms'].forEach(id => {
                id = id.trim();
                if (id !== '') {
                    handleNode(id,i,'blue');
                    let key = linksObj[i].has(_id)?_id:(linksObj[i].has(id)?id:_id);
                    if (!linksObj[i].has(key)){
                        // link
                        objs[id].hasLink = true;
                        objs[_id].hasLink = true;
                        const link = {
                            source: _id,
                            target: id,
                            value: 1,
                            // color: color(r['Conference']),
                            _index: dataIn.net[i].links.length
                        };
                        linksObj[i].set(key,link);
                        dataIn.net[i].links.push(link);
                    }else{
                        linksObj[i].get(key).value++;
                    }
                }
            });
            function handleNode(a,i,color){
                if (!objs[a]){
                    let item = {
                        id: a,
                        type: 'gen',
                        name: a,
                        data:{},
                        color,
                        timeArr:[],
                        freq:0
                    };
                    objs[a]=item;
                    dataIn.root_nodes.push(item);
                }
                if (!objs[a].timeArr[i]) {
                    objs[a].timeArr[i] = {
                        id: a,
                        name: a,
                        type: 'gen',
                        data: {name: a, isNew: []},
                        color,
                        parent: objs[a],
                        freq:1,
                        ti: i
                    };
                    objs[a].timeArr[i]._index = dataIn.net[i].nodes.length;
                    dataIn.net[i].nodes.push(objs[a].timeArr[i]);
                }else{
                    objs[a].timeArr[i].freq++;
                    objs[a].freq++;
                };
            }

        });

        debugger
        // dataIn.root_nodes = Object.values(objs_2);

        drawObject.graphicopt({type1:'gen',type2:'gen'});
        Layout.color = color;
        console.log('#terms ',dataIn.root_nodes.length);
        console.log('#links',d3.sum(dataIn.net,d=>d.links.length));
        return dataIn;
    });
}
