import EDR_EII from "../../data/EDR-EII.csv"
import {csv} from 'd3';
import {nest} from "d3-collection";

const keyCol = ['Category','NFG','Lead','Status'];
const selectedCol = 'NFG';
const selectedColValues = ['F1','F2','F3','F4'];
const selectedColValuesMap = {'F1':0,'F2':1,'F3':2,'F4':3};
const selectRow = 'Category';
const adjustCol = 'M BTU/D';
const adjustFunc = (d)=>Math.ceil(d/50);
const numberCol = ['M BTU/D','TIC','EII Reduction Estimate','CO2 Reduction (Metric Ton/yr)','Savings USD/YR'];

export const columnsDisplay = [
    // { field: 'col1', headerName: 'Column 1', width: 150 },
    // { field: 'col2', headerName: 'Column 2', width: 150 },
];

export const getData = csv(EDR_EII);
export function handleNodeLink(data){

    let nodesObj = {};
    let linksObj = {};
    Object.keys(data[0]).forEach(k=>columnsDisplay.push({ field: k, headerName: k }))

    data.forEach((d,i)=>{
        Object.keys(d).forEach(k=>d[k]=d[k].trim());
        d._value = {};
        updateNodes(d,selectRow);
        // for (let ci=1;ci<keyCol.length;ci++){
        //     updateNodes(d,keyCol[ci]);
        //     updateLinks(d,keyCol[ci-1],keyCol[ci]);
        // }
        numberCol.forEach(col=>{
            d._value[col] = (+d[col]);
            if(isNaN(d._value[col]))
                d._value[col] = 0;
        })
        d.id=d.id??i;
    });
    debugger
    const nodes = Object.values(nodesObj);
    nest().key(d=>d.name).entries(nodes).forEach(d=>{
        debugger
        d.values.sort((a,b)=>a.layer-b.layer);
        for (let ti=1;ti<d.values.length++;ti++){
            updateLinks(d.values[ti-1],d.values[ti])
        }
    });

    const links = Object.values(linksObj);
    return {nodes,links};

    function updateLinks(d,l1,l2){
        if(d[l1] && d[l2]) {
            const key = d[l1] + '_' + d[l2];
            if (!linksObj[key]) {
                let link = {source: d[l1], target: d[l2], element: []};
                linksObj[key] = link;
            }
            linksObj[key].element.push(d);
        }
    }
    function updateNodes(d,c){
        if(d[c]) {
            const key = [d[selectedCol],d[c]].join('_');
            if (!nodesObj[key]) {
                let node = {id: key, name: d[c], element: [],layer:selectedColValuesMap[d[selectedCol]]};
                nodesObj[key] = node;
            }
            nodesObj[key].element.push(d);
        }
    }
}
export const valueCol = numberCol
