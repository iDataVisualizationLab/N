$(document).ready(function(){


    init();
});
function initmap(){
    map_conf.height = map.clientHeight
}
function init(){
    initmap();
    readConf("Data_details").then((data)=>{
        basedata = data;
        basearr = d3.values(data) ;
        basearr.forEach(d=>{
            if (d['GPSEnd'] !== null)
                d['GPSEnd'] = dmstoLongLat(d['GPSEnd']);
            if (d['GPSStart'] !== null)
                d['GPSStart'] = dmstoLongLat(d['GPSStart']);
            if (d['County'] !== null)
                d['County'] = seperateStr(d['County'])
        });
        dp = new dataProcessor(basearr);
    }).then (function(){
            return readLib("TX-48-texas-counties").then((data)=>us=data,us);
        }
    ).then(function() {
        plotMaps(dp);
        plotCounties();
        plotRoad();
    });
}
