function dataProcessor(data) {
    data.allCounties = _.uniq(_.flatten(data.filter(d=>d["County"]!==null).map(d=>d["County"])));
    data.allDistrics = _.uniq(_.flatten(data.filter(d=>d["District"]!==null).map(d=>d["District"])));
    return data;
}

function seperateStr(str){
    return str.split(/&|\/| and /).map(d=>d.trim().toLowerCase());
}

function filterData(filters){
    dp = basearr;
    d3.nest().key(d=>d.type).entries(filters)
        .forEach(ff=>dp=dp.filter(e=>ff.values.find(f=>e[f.type]===f.id)));
    dp = new dataProcessor(dp);
}