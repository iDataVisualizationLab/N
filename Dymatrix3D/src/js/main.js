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
let getDataVis = getDataVis_imbd;

$(document).ready(function(){

    updateProcess({percentage:5,text:'Load UI...'})
    initMenu();
    initClusterUI();
    updateProcess({percentage:15,text:'Preprocess data...'});
    initdraw();
    // getDataVis('src/data/IEEE VIS papers 1990-2020 - Main dataset.csv').then(initTimeElement);
    // getDataVis('src/data/imdb85_50.tsv').then(initTimeElement);
    // getDataVis('src/data/imdb1.tsv').then(initTimeElement);
    getDataVis('src/data/pcCombined3.tsv').then(initTimeElement);
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
                        ti: i
                    };
                    objs[a].timeArr[i]._index = dataIn.net[i].nodes.length;
                    dataIn.net[i].nodes.push(objs[a].timeArr[i]);
                };
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

function getDataVis_imbd(url){
    return d3.tsv(url).then(__data=>{
        _data = __data//.filter(d=>(+d['Year'])>=1980);
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
        const objs = {};
        _data.forEach(r=>{
            const i = time_stamp_ob[r.Year];
            const authors= r['Author Names'].split(';').map(a=>a.trim());
            authors.forEach((a,ai)=>{
                if (!objs[a]){
                    let item = {
                        id: a,
                        type: 'author',
                        name: a,
                        data:{},
                        timeArr:[],
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
                        ti: i
                    };
                    objs[a].timeArr[i]._index = dataIn.net[i].nodes.length;
                    dataIn.net[i].nodes.push(objs[a].timeArr[i]);
                };
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
        console.log('#item ',dataIn.root_nodes.length)
        return dataIn;
    });
}
