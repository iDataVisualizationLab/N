importScripts("https://d3js.org/d3.v5.min.js");
importScripts("../tsne.js");
importScripts("../../lib/underscore-min.js");
importScripts("https://unpkg.com/simple-statistics@2.2.0/dist/simple-statistics.min.js");
importScripts("../../lib/jLouvain.js");
importScripts("../../lib/scagnosticsnd.min.js");


let tsne,sol,
    stepnumber = 100,
    countstack =0,
    stack = 100,
    cost,
    costa =[],
    stop = false,
    store_step,
    store_step_temp,
    hostname,
    stopCondition =0.00001,
    community = jLouvain(),
    currentMaxIndex =0,
    requestIndex = 0,
    group_mode='outlier';
let geTopComand = _.once(stepstable);
let average;
function stepstable (cost , solution,community){
    postMessage({action: 'cluster', result: community});
    postMessage({action:'step', result: {cost: cost, solution: solution}, maxloop: countstack, status: "stable"});
}
addEventListener('message',function ({data}){
        switch (data.action) {
            case "inittsne":
                tsne = new tsnejs.tSNE(data.value);
                break;
            case "maxstack":
                maxstack = (data.value);
                break;
            case "initDataRaw":
                geTopComand = _.once(stepstable);
                countstack = 0;
                tsne.initDataRaw(data.value);
                currentMaxIndex = 0;
                requestIndex = 0;
                stop = false;
                let cost_first = tsne.step();
                for (let  i =0; i<40;i++) {
                    cost = tsne.step();
                    countstack++;
                }
                stop = ((cost - cost_first) <stopCondition)&&(cost - cost_first) >0;
                hostname = data.value.map(d=>d.name);
                //jLouvain-------
                var result = findGroups(data.value,group_mode);
                groups = result;
                postMessage({action:'cluster', result: result});
                //---------------
                store_step = initStore(hostname,tsne.getSolution(),result);
                store_step_temp = copyStore(store_step);
                //postMessage({action:'step', result: {cost: cost, solution: tsne.getSolution()}});
                if (stop)
                    geTopComand(cost,tsne.getSolution(),groups);
                postMessage({action:data.action, status:stop?"stable":"done", maxloop: countstack});
                break;
            case "updateData":
                geTopComand = _.once(stepstable);
                countstack = 0;
                requestIndex = data.index;
                average = calAverage (data.value);
                postMessage({action: 'mean', val: average});
                if (requestIndex > currentMaxIndex ) {
                    // UPDATE
                    tsne.updateData(data.value);
                    stop = false;
                    for (let i = 0; i < 1 && (!stop); i++) {
                        const cost_old = tsne.step();
                        stop = ((cost_old - cost) < stopCondition) && (cost_old - cost) > 0;
                        cost = cost_old;
                        countstack++;
                        //postMessage({action:'step', result: {cost: cost, solution: tsne.getSolution()}});
                    }
                    //jLouvain-------
                    // community.edges(convertLink(tsne.getProbability(), hostname));
                    // var result = community();
                    var result = findGroups(data.value,group_mode)
                    groups = result;
                    // postMessage({action: 'cluster', result: result});
                    //---------------
                    if (stop)
                        geTopComand(cost,tsne.getSolution(),result);
                }else{
                    stop = true;
                    groups = {};
                    store_step.forEach((d,i)=>groups[d.name] = d.cluster[requestIndex])
                    geTopComand(costa[requestIndex], store_step.map((d,i)=>d[requestIndex]),groups)
                }

                postMessage({action:data.action, status:stop?"stable":"done", maxloop: countstack});
                break;
            case "updateTracker":
                console.log(requestIndex+"_"+currentMaxIndex)
                if (requestIndex > currentMaxIndex ||currentMaxIndex===0 ) {
                    currentMaxIndex = requestIndex;
                    currentLastIndex = currentMaxIndex-1;
                    updateStore(tsne.getSolution(), groups,cost);
                    currentLastIndex = currentMaxIndex;
                }
                postMessage({action:data.action,  status:"done", top10: getTop10 (store_step,requestIndex) });
                break;
            case "option":
                stepnumber = data.value;
                break;
            case "group_mode":
                group_mode = data.value;
                break;
            case "step":
                if (!stop){
                    for (let i = 0; (i < stepnumber)&&(!stop); i++) {
                        const cost_old = tsne.step();
                        stop = (((cost_old - cost) <stopCondition)&&(cost_old - cost) >0)||isNaN(cost_old);
                        cost = cost_old;
                        countstack++;
                        sol = tsne.getSolution();
                        // updateTempStore(sol);
                        // if (countstack>stack){
                        //     postMessage({action:'updateTracker', top10: getTop10 (store_step_temp)});
                        //     countstack =0;
                        // }
                    }
                        //jLouvain-------
                        // community.edges(convertLink(tsne.getProbability(), hostname));
                        // var result = community();
                        // postMessage({action: 'cluster', result: result, maxloop: countstack, status: stop?"stable":"done"});
                        postMessage({action: 'imform',status: stop?"stable":"done"});
                        //---------------
                    if (stop)
                        geTopComand(cost,sol,groups);
                        // postMessage({action: 'step', result: {cost: cost, solution: sol}, status: stop?"stable":"done", maxloop: countstack});
                }else {
                    postMessage({action: 'stable'});
                }
                break;
        }
});
function initStore(host,sol,clus){
    costa = [];
    return  host.map((d,i)=>{
        // let temp = [sol[i].slice()];
        let temp = [];
        temp.name = d;
        // temp.dis = 0;
        temp.dis = [0];
        // temp.cluster = [{timeStep:0,val:clus[d]}];
        temp.cluster = [];
        return temp;});
}
function copyStore(store){
    return  store.map((d,i)=>{
        let temp = d.slice();
        temp.name = d.name;
        temp.dis = d.dis;
        return temp;});
}
function updateStore(sol,clus,cost){
    costa.push(cost);
    sol.forEach((s,i)=>{
        const ss = s.slice();
        store_step[i].push(ss);
        const currentLastIndex = store_step[i].length-2;
        if (currentLastIndex >-1 ) {
            store_step[i].dis.push(store_step[i].dis[currentLastIndex]+ distance(store_step[i][currentLastIndex], ss))
            // store_step[i].dis.push += distance(store_step[i][currentLastIndex], ss);
        }
        store_step[i].cluster.push({timeStep:currentLastIndex+1,val:clus[store_step[i].name]});
        currentMaxIndex = currentLastIndex+1;
        });
}

function updateTempStore(sol){ // store data point in a step
    return sol.map((s,i)=>{
        const ss = s.slice();
        store_step_temp[i].push(ss);
        const currentLastIndex = store_step_temp[i].length-2;
        store_step_temp[i].dis += distance(store_step_temp[i][currentLastIndex],ss);
    });
}

function distance (a,b) {
    let dsum = 0;
    a.forEach((d, i) => {
        dsum += (d - b[i]) * (d - b[i])
    });
    return Math.sqrt(dsum);
}
let maxstack = 10;
// function getTop10 (store,requestIndex) {
//     return _(store).sortBy(d=>d.dis).reverse().slice(0,50).map(data=>{
//         const NCluster = (requestIndex||currentMaxIndex) +1;
//         //if (NCluster>maxstack-1){
//             const startpos = Math.max(NCluster - maxstack,0);
//             data.clusterS = data.cluster.slice(startpos,NCluster);
//         //}
//         return data;
//     });
// }
function getTop10 (store,requestIndex) {
    var datasort = _(store).sortBy(d=>d.dis[requestIndex||currentMaxIndex]);
    if (group_mode==="outlier")
        datasort = _(datasort).sortBy(d=>d.cluster[requestIndex||currentMaxIndex].val);
    return datasort.reverse().slice(0,50).map(data=>{
        const NCluster = (requestIndex||currentMaxIndex) +1;
        //if (NCluster>maxstack-1){
        const startpos = Math.max(NCluster - maxstack,0);
        let shortdata = data.slice(startpos,NCluster);
        shortdata.name = data.name;
        shortdata.clusterS = data.cluster.slice(startpos,NCluster);
        //}
        return shortdata;
    });
}
function calAverage (data) {
    return _(data).unzip().map(function (d){return{mean:ss.mean(d), q1: ss.quantile(d,0.25), q3: ss.quantile(d,0.75)}});
    // return _(data).unzip().map(d=>d3.mean(d));
}
function convertLink (P,ids) {
    const N = ids.length;
    let links =[];
    for (let i = 0; i < N; i++)
        for (let j = i+1; j < N; j++)
            links.push({source: ids[i], target:ids[j], weight: P[i*N+j]});
    return links;
}
let scagOptions ={
    startBinGridSize: 30,
    minBins: 20,
    maxBins: 100,
    outlyingCoefficient: 1.5,
    incrementA:2,
    incrementB:0,
    decrementA:0.5,
    decrementB:0,
};
function findGroups(data,method) {
    switch (method) {
        case 'jLouvain':
            return getComunity ();
        case 'outlier':
            return outlier (data);
        default:
            return outlier (data);
    }
}
function outlier (data) {
    let group
    try {
        let scag = scagnosticsnd(data.map(d => {
            var temp = d;
            d.data = d.name;
            return temp;
        }), scagOptions);
        let outlyingPoints = scag.outlyingPoints.map(d => d.data);
        group = data.map(d => outlyingPoints.find(e => e === d.name) === undefined ? 0 : 1);
    }catch(e){
        group = data.map(d =>0);
    }
    return _.object(hostname,group);
}
function getComunity (){
    community.nodes(hostname).edges(convertLink(tsne.getProbability(),hostname));
    return community();
}