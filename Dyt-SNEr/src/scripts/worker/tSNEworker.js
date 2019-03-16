importScripts("https://d3js.org/d3.v5.min.js");
importScripts("../tsne.js");
importScripts("../../lib/underscore-min.js");

importScripts("../../lib/jLouvain.js");



let tsne,sol,
    stepnumber = 10,
    countstack =0,
    stack = 100,
    cost,
    stop = false,
    store_step,
    store_step_temp,
    hostname,
    stopCondition =0.00001,
    community = jLouvain();
addEventListener('message',function ({data}){
        switch (data.action) {
            case "inittsne":
                tsne = new tsnejs.tSNE(data.value);
                break;
            case "initDataRaw":
                countstack = 0;
                tsne.initDataRaw(data.value);
                stop = false;
                let cost_first = tsne.step();
                for (let  i =0; i<40;i++) {
                    cost = tsne.step();
                    countstack++;
                }
                stop = ((cost - cost_first) <stopCondition)&&(cost - cost_first) >0;
                hostname = data.value.map(d=>d.name);
                //jLouvain-------
                community.nodes(hostname).edges(convertLink(tsne.getProbability(),hostname));
                var result  = community();
                postMessage({action:'cluster', result: result});
                //---------------
                store_step = initStore(hostname,tsne.getSolution(),result);
                store_step_temp = copyStore(store_step);
                postMessage({action:'step', result: {cost: cost, solution: tsne.getSolution()}});
                postMessage({action:data.action, status:stop?"stable":"done", maxloop: countstack});
                break;
            case "updateData":
                countstack = 0;
                tsne.updateData(data.value);
                stop = false;
                for (let  i =0; i<2 &&(!stop);i++) {
                    const cost_old = tsne.step();
                    stop = ((cost_old - cost) <stopCondition)&&(cost_old - cost) >0;
                    cost = cost_old;
                    countstack++;
                    postMessage({action:'step', result: {cost: cost, solution: tsne.getSolution()}});
                }
                //jLouvain-------
                community.edges(convertLink(tsne.getProbability(),hostname));
                var result  = community();
                postMessage({action:'cluster', result: result});
                //---------------
                // updateTempStore(tsne.getSolution());
                // if (countstack>stack){
                //     postMessage({action:'updateTracker', top10: getTop10 (store_step_temp)});
                //     countstack =0;
                // }
                // postMessage({action:'step', result: {cost: cost, solution: sol}});
                postMessage({action:data.action, status:stop?"stable":"done", maxloop: countstack});
                break;
            case "updateTracker":
                updateStore(tsne.getSolution(),community());
                postMessage({action:data.action,  status:"done", top10: getTop10 (store_step) });
                store_step_temp = copyStore(store_step);
                break;
            case "option":
                stepnumber = data.value;
                break;
            case "step":
                if (!stop){
                    for (let i = 0; (i < stepnumber)&&(!stop); i++) {
                        const cost_old = tsne.step();
                        stop = ((cost_old - cost) <stopCondition)&&(cost_old - cost) >0;
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
                        community.edges(convertLink(tsne.getProbability(), hostname));
                        var result = community();
                        postMessage({action: 'cluster', result: result});
                        //---------------
                        postMessage({action: 'step', result: {cost: cost, solution: sol}, status: stop?"stable":"done", maxloop: countstack});
                }else {
                    postMessage({action: 'stable'});
                }
                break;
        }
});
function initStore(host,sol,clus){
    return  host.map((d,i)=>{
        let temp = [sol[i].slice()];
        temp.name = d;
        temp.dis = 0;
        temp.cluster = [{timeStep:0,val:clus[d]}];
        return temp;});
}
function copyStore(store){
    return  store.map((d,i)=>{
        let temp = d.slice();
        temp.name = d.name;
        temp.dis = d.dis;
        return temp;});
}
function updateStore(sol,clus){
    sol.forEach((s,i)=>{
        const ss = s.slice();
        store_step[i].push(ss);
        const currentLastIndex = store_step[i].length-2;
        store_step[i].dis += distance(store_step[i][currentLastIndex],ss);
        store_step[i].cluster.push({timeStep:currentLastIndex+1,val:clus[store_step[i].name]});
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

function getTop10 (store) {
    return _(store).sortBy(d=>d.dis).reverse().slice(0,50);
}

function convertLink (P,ids) {
    const N = ids.length;
    let links =[];
    for (let i = 0; i < N; i++)
        for (let j = i+1; j < N; j++)
            links.push({source: ids[i], target:ids[j], weight: P[i*N+j]});
    return links;
}