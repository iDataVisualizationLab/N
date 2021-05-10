// d3.csv('data/datatraw/differentially_expressed_genes.csv').then(_data=>{
//     keyob={};
//     _data.forEach(d=>{ if(!keyob[d.type]) keyob[d.type]=[]; keyob[d.type].push(d)});
//     ob = {};
//     let max = 0;
//     ob={}; _data.forEach(d=>{
//         if(!keyob[d.type]) keyob[d.type]=[]; keyob[d.type].push(d);
//         if(!ob[d.atID]) ob[d.atID]={}; ob[d.atID][d.type] = Math.abs(+d.logFC);
//         if(+d.logFC>max)
//             max = Math.abs(+d.logFC);
//     });
//     Object.keys(ob).forEach(k=>Object.keys(keyob).forEach(d=>{
//         ob[k][d]= (ob[k][d]??0)/max;
//     }));
//     csv='atID,'+Object.keys(keyob).join(',')+'\n';
//     csv+=''+Object.keys(ob).map(k=>k+','+ Object.keys(keyob).map(d=>ob[k][d]).join(',')).join('\n')
//     console.log(csv);
// })
// d3.csv('data/datatraw/differentially_expressed_genes.csv').then(_data=>{
//     keyob={};
//     _data.forEach(d=>{ if(!keyob[d.type]) keyob[d.type]=[]; keyob[d.type].push(d)});
//     ob = {};
//     let max = 0;
//     ob={}; _data.forEach(d=>{
//         if(!keyob[d.type]) keyob[d.type]=[]; keyob[d.type].push(d);
//         if(!ob[d.atID]) ob[d.atID]={}; ob[d.atID][d.type] = +d.logFC;
//         if(+d.logFC>max)
//             max = Math.abs(+d.logFC);
//     });
//     Object.keys(ob).forEach(k=>Object.keys(keyob).forEach(d=>{
//         ob[k][d]= (ob[k][d]??0)/max;
//     }));
//     csv='atID,'+Object.keys(keyob).join(',')+'\n';
//     csv+=''+Object.keys(ob).map(k=>k+','+ Object.keys(keyob).map(d=>ob[k][d]).join(',')).join('\n')
//     console.log(csv);
// })
d3.csv('data/datatraw/differentially_expressed_genes_all.csv').then(_data=>{
    keyob={};
    ob = {};
    let max = 0;
    ob={}; _data.forEach(d=>{
        d.atID = d.atID+"|"+d.key;
        d.type = d.type.split('/')[0];
        if(!keyob[d.type]) keyob[d.type]=[]; keyob[d.type].push(d);
        if(!ob[d.atID]) ob[d.atID]={}; ob[d.atID][d.type] = +d.logFC;
        if(+d.logFC>max)
            max = Math.abs(+d.logFC);
    });
    Object.keys(ob).forEach(k=>Object.keys(keyob).forEach(d=>{
        ob[k][d]= (ob[k][d]??0)/max;
    }));
    csv='atID,'+Object.keys(keyob).join(',')+'\n';
    csv+=''+Object.keys(ob).map(k=>k+','+ Object.keys(keyob).map(d=>ob[k][d]).join(',')).join('\n')
    console.log(csv);
})

//forven
d3.csv('data/datatraw/differentially_expressed_genes_all.csv').then(_data=>{
    keyob={};
    ob = {};
    let max = 0;
    ob={};
    _data.forEach(d=>{
        if(!keyob[d.type]) keyob[d.type]={}; keyob[d.type][d.atID]=1;
        if(!ob[d.atID]) ob[d.atID]={};
        ob[d.atID][d.type] = 1;
    });
    csv='atID,'+Object.keys(keyob).join(',')+'\n';
    csv+=''+Object.keys(ob).map(k=>k+','+ Object.keys(keyob).map(d=>ob[k][d]??0).join(',')).join('\n')
    console.log(csv);
})
