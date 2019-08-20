$(document).ready(function(){

    init();
});
function initmap(){
    map_conf.height = map.clientHeight
}
function init(){
    initmap();
    d3.select('#projects').selectAll('projects_item').data(Object.keys(project_collection).map(k=>project_collection[k]))
        .enter().append('li').attr('class','button projects_item').classed('has-submenu',d=>d.sub.length).each(function(d){
        const currentel = d3.select(this);
        currentel.text(d.text);
            if(d.sub.length) {
                let ul_item = currentel.append('ul').attr('class','submenu menu vertical').attr('data-submenu','');
                ul_item.selectAll('li').data(e=>e.sub)
                    .enter().append('li').text(e=>e);
            }
      }
    );
    Foundation.reInit($('#projects'));
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
