// d3.json('data/processed_gene_data_normalized.json',function(error,data){
//     sampleS = d3.nest().key(d=>getType(d)).key(d=>d.gene_id).object(data);
//     hosts = d3.keys(sampleS['wt']).map(d=>({name:d}));
//     csv = "timestamp,category,";
//     csv += hosts.map(h=>sampleS['wt'][h.name].map(d=>h.name+'-'+getCondition(d)).join(',')).join(',');
//
//     // one timestep
//     csv +=d3.keys(sampleS).map((type,ti)=>{
//         str = '\nJan 2020,'+type+",";
//         str += d3.keys(sampleS[type]).map(id=>sampleS[type][id].slice(ti*6,ti*6+6).map(d=>d.GENE_VALUE_NORMALIZED).join(',')).join(',');
//         return str;
//     }).join('');
//     console.log(csv);
// });
var dataRaw;
d3.json('data/processed_gene_data_normalized.json',function(error,data){
    dataRaw =data;
    sampleS = d3.nest().key(d=>getType(d)).key(d=>d.gene_id).object(data);
    hosts = d3.keys(sampleS['wt']).map(d=>({name:d}));
    csv = "timestamp,";
    csv += d3.keys(sampleS).map((type,ti)=>hosts.map(h=>sampleS['wt'][h.name].map(d=>h.name+'|'+type+'-'+getCondition(d)).join(',')).join(',')).join(',');

    // one timestep
    csv += '\nJan 2020,';
    csv += d3.keys(sampleS).map((type,ti)=>{
        str = d3.keys(sampleS[type]).map(id=>sampleS[type][id].map(d=>d.GENE_VALUE_NORMALIZED).join(',')).join(',');
        return str;
    }).join(',');
});
function getType(d){
    if(d.treatment_counter<12)
        return 'wt';
    else
        return 'stop1';
}
// function getCondition(d){
//     let index = d.treatment_counter%12;
//     switch (index) {
//         case 0:
//
//             return `hp6`;
//         case 1:
//
//             return `lp6`;
//         case 2:
//
//             return `hp5`;
//         case 3:
//
//             return `lp5`;
//         case 4:
//
//             return `al`;
//         case 5:
//
//             return `fe`;
//     }
// }
function getCondition(d){
    let index = d.treatment_counter%12;
    switch (index) {
        case 0:
        case 1:
            return `hp6_${index+1}`;
        case 2:
        case 3:
            return `lp6_${index - 1}`;
        case 4:
        case 5:
            return `hp5_${index - 3}`;
        case 6:
        case 7:
            return `lp5_${index - 5}`;
        case 8:
        case 9:
            return `al_${index - 7}`;
        case 10:
        case 11:
            return `fe_${index - 9}`;
    }
}