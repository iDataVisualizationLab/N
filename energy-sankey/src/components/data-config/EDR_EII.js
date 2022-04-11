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
// const adjustCol = 'Status';
// const adjustFunc = (d)=>d;
const numberCol = ['M BTU/D','TIC','EII Reduction Estimate','CO2 Reduction (Metric Ton/yr)','Savings USD/YR'];

export const columnsDisplay = [
    // { field: 'col1', headerName: 'Column 1', width: 150 },
    // { field: 'col2', headerName: 'Column 2', width: 150 },
];

export const getData = csv(EDR_EII);
export function handleNodeLink(data){

    let groupsObj = {};
    let nodesObj = {};
    let linksObj = {};
    Object.keys(data[0]).forEach(k=>columnsDisplay.push({ field: k, headerName: k }))

    data.forEach((d,i)=>{
        Object.keys(d).forEach(k=>d[k]=d[k].trim());
        d._value = {};
        d['Adjust '+adjustCol] = adjustFunc(d[adjustCol]);
        updateGroups(d,selectRow);

        numberCol.forEach(col=>{
            d._value[col] = (+d[col]);
            if(isNaN(d._value[col]))
                d._value[col] = 0;
        })
        d.id=d.id??i;
    });

    Object.keys(groupsObj).forEach(k=>{
        const d = groupsObj[k];
        const b = ''+selectedColValues[0];
        const d_b = d[b];
        if(d_b){
            updateNodes(d_b,b, getUserName(Object.keys(d_b.keys)),0);
        }
    })
    for (let i = 1; i < selectedColValues.length; ++i) {
        const a = ''+selectedColValues[i - 1];
        const b = ''+selectedColValues[i];
        Object.keys(groupsObj).forEach(k=>{
            const d = groupsObj[k];
            const d_a = d[a];
            const d_b = d[b];
            if(d_b){
                updateNodes(d_b,b, getUserName(Object.keys(d_b.keys)), i);
            }

            if (d_a && d_b){
                const sourceName = [a, getUserName( Object.keys(d_a.keys) )].join('_');
                const targetName = [b, getUserName(Object.keys(d_b.keys))].join('_');
                updateLinks(d_a.element,sourceName,targetName,i)
            }
        })
    }
    const nodes = Object.values(nodesObj);
    const links = Object.values(linksObj);

    return {nodes,links};
    function getUserName(arr){
        if (arr && arr.length)
        {
            return arr.join(',');
        }else
            return 'No info';
    }
    function updateLinks(d,sourceName,targetName){
        const key = sourceName + '_' + targetName;
        if (!linksObj[key]) {
            let link = {source: sourceName, target: targetName, element: []};
            linksObj[key] = link;
        }
        d.forEach(e=>linksObj[key].element.push(e))
    }
    function updateNodes(d,c1,c2,layer){
        const key = [c1,c2].join('_')
        if (!nodesObj[key]) {
            let node = {id: key, name: c2, element: [],layer,ids:{}};
            nodesObj[key] = node;
        }
        d.element.forEach(e=>{
            if(!nodesObj[key].ids[e.id]) {
                nodesObj[key].ids[e.id] = e;
                nodesObj[key].element.push(e);
            }
        });
    }
    function updateGroups(d,c){
        if(d[c]) {
            // const key = [d[selectedCol],d[c]].join('_');
            // if (!nodesObj[key]) {
            //     let node = {id: key, name: d[c], element: [],layer:selectedColValuesMap[d[selectedCol]]};
            //     nodesObj[key] = node;
            // }
            // nodesObj[key].element.push(d);

            if(!groupsObj[d['Adjust '+adjustCol]]){
                groupsObj[d['Adjust '+adjustCol]] = {};
            }
            if(!groupsObj[d['Adjust '+adjustCol]][d[selectedCol]]){
                groupsObj[d['Adjust '+adjustCol]][d[selectedCol]] = {element:[],keys:{}}
            }
            groupsObj[d['Adjust '+adjustCol]][d[selectedCol]].element.push(d);
            groupsObj[d['Adjust '+adjustCol]][d[selectedCol]].keys[d[selectRow]]=1;

        }
    }
}
export const valueCol = numberCol
