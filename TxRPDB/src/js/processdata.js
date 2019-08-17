function dataProcessor(data) {
    data.allCounties = _.uniq(_.flatten(data.filter(d=>d["County"]!==null).map(d=>d["County"])))
    return data;
}

function seperateStr(str){
    return str.split(/&|\/| and /).map(d=>d.trim().toLowerCase());
}

function filterApply(str){
    return str.split(/&|\/| and /).map(d=>d.trim().toLowerCase());
}