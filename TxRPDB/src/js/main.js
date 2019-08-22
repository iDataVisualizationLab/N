$(document).ready(function(){

    init();
});
function initmap(){
    map_conf.height = map.clientHeight
}
function initFilterSetting(){
    let schema_field = d3.select("#schemaSetting").selectAll('div').data(arr_variable_collection)
        .enter()
        .append('div')
        .attr('class','schema-field');
    schema_field.append('h5').text(d=>d.text);
    schema_field.append('div').attr('class','schema-field-chart')
        .append('svg').each(function(d){
        d.schemabox = Schemabox().graphicopt(schemaSvg_option).svg(d3.select(this)).init();
    });
    schema_field.append('select').attr('class','schema-field-tag');
}
function init(){
    initmap();
    initFilterSetting();
    d3.select('#projects').selectAll('projects_item').data(Object.keys(project_collection).map(k=>project_collection[k]))
        .enter().append('li').attr('class','button projects_item').classed('has-submenu',d=>d.sub.length).each(function(d){
        const currentel = d3.select(this);
        currentel.text(d.text);
            if(d.sub.length) {
                let ul_item = currentel.append('ul').attr('class','submenu menu vertical').attr('data-submenu','');
                ul_item.selectAll('li').data(e=>e.sub)
                    .enter().append('li').text(e=>e).on('click',e=>addFilter({type:'DataType',text:e,id:e}));
            }else{
                currentel.on('click',e=>addFilter({type:'DataType',text:e.text,id:e.id}));
            }

            function addFilter(d){
                let sameType = filters.find(e=>e.type===d.type)
                if (d.type==='DataType'&&sameType) { //avoid multi datatype
                    sameType.text = d.text;
                    sameType.id = d.id;
                }else{
                    filters.push(d);
                }
                updateFilterChip(d3.select('#filterContent'),filters);
                filterData(filters);
                Updatemap();
                redrawMap();
            }
      }
    );
    d3.select('#filterContent').on('removeFilter',function(d){
        filters = d3.selectAll('.chip').data();
        filterData(filters);
        Updatemap();
        redrawMap();
    })
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
    }).then(function(){
        return readConf("listMedia").then((data)=>{mediaQuery=data});
    }).then (function(){
            return readLib("TxDOT_Districts",'json').then((data)=>
                us_dis=data,us_dis);
        }
    ).then (function(){
            return readLib("TX-48-texas-counties",'json').then((data)=>us=data,us);
        }
    ).then(function() {
        plotMaps(dp);
        redrawMap();
    });
}

function redrawMap(){
    d3.select('#numberSection').text(dp.length);
    plotCounties();
    plotDistrict();
    plotRoad();
    plotGPS();
    UpdateSchema();
}

function UpdateSchema(){
    arr_variable_collection.forEach(v=>{
        let data =d3.nest().key(d=>d[v.id])
            .rollup(d=>d.length)
            .entries(dp);
        data.range =[0,dp.length];
        v.schemabox.data(data);
    });
}
function updateFilterschema(){

}