import EDR_EII from "../../data/EDR-EII.csv"
import {csv} from 'd3';

const keyCol = ['Category','NFG','Lead','Status'];
const numberCol = ['M BTU/D','TIC','EII Reduction Estimate','CO2 Reduction (Metric Ton/yr)','Savings USD/YR'];

export const getData = csv(EDR_EII);
export function handleNodeLink(data){

    let nodesObj = {};
    let linksObj = {};
    let columnsDisplay = [
    ];
    Object.keys(data[0]).forEach(k=>columnsDisplay.push({ field: k, headerName: k, width: 150}))
    data.forEach((d,i)=>{
        Object.keys(d).forEach(k=>d[k]=d[k].trim());
        d._value = {};
        updateNodes(d,keyCol[0]);
        for (let ci=1;ci<keyCol.length;ci++){
            updateNodes(d,keyCol[ci]);
            updateLinks(d,keyCol[ci-1],keyCol[ci]);
        }
        numberCol.forEach(col=>{
            d._value[col] = (+d[col]);
            if(isNaN(d._value[col]))
                d._value[col] = 0;
        })
        d.id=d.id??i;
    });
    debugger
    const nodes = Object.values(nodesObj);
    const links = Object.values(linksObj);
    return {nodes,links,columnsDisplay};

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
            if (!nodesObj[d[c]]) {
                let node = {id: d[c], element: []};
                nodesObj[d[c]] = node;
            }
            nodesObj[d[c]].element.push(d);
        }
    }
}
export const valueCol = numberCol
