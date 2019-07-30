

var tool_tip = d3.tip()
    .attr("class", "d3-tip")
    .attr("id", "d3-tip-mc1")
    .direction('w')
    .html(function(d1,hideLine) {
        return cotenttip(hideLine); });
let tooltip_cof = {w:350,h:200,schema:serviceFullList,showText:true,levels:6,summary:{mean:true, minmax:true, quantile:true},gradient:true,strokeWidth:0.5};
function cotenttip (hideLine){
    str="";
    hideLine = hideLine||false;
    var classtype =  "radarChart_tip";
    str += '<div class="tootltip_instruction"><span>Click to hold</span></div>'; // instruction holder
    str += '<div class="tootltip_text"></div>'; // text holder
    str += '<div class="'+classtype+'"></div>'; // Spider chart holder
    str += '<div class="lineChart_tip"></div>'; // Lingeph holder
    str += '<button onclick="recover()">Close</button>';
    str += '<div class="loaderDiv"></div>';
    // str += '<button onclick="saveSVG(this)">Save Image</button>';
    // str += '<button onclick="saveSVG_light(this,\'svg\')" class="modal-trigger" href="#savedialog">Save SVG</button>';
    // str += '<button onclick="saveSVG_light(this,\'png\')" class="modal-trigger" href="#savedialog">Save PNG</button>';
    // str += '<button onclick="saveSVG_light(this,\'jpg\')" class="modal-trigger" href="#savedialog">Save JPG</button>';
    return str;
}
function recover(){
    tool_tip.hide();
    d3.select('#d3-tip-mc1').classed('enablemouse',false);
    CircleMapplot.addMouseEvent();
    onmouseleaveRadar(d3.select('#d3-tip-mc1').datum());
}
function tooltipBox (data){
    d3.select('#d3-tip-mc1').datum(data);
    let type = data.loc==='all'?'Summary':(isNaN(+data.loc)?'Static':'Mobile');
    let id = isNaN(+data.loc)?+data.loc.replace('s',''):+data.loc;
    let headertext = type==="Summary"? type: type+' - ID: '+id;
    d3.select('.tootltip_text').append('h6').text(headertext);
    if (data.time)
    d3.select('.tootltip_text').append('h6').html('Time: <b>'+d3.timeFormat("%I %p - %a %d")(data.time)+'</b>');
    if (data.data.users)
        d3.select('.tootltip_text').append('h6').text('Users: '+ data.data.users.join(','));
    let table = d3.select('.tootltip_text').append('div').attr('class','tip-divtable')
        .append('table').attr('class','tip-table');
    // table.append('thead').selectAll('th')
    //     .data(['Measurment','Value']).enter().append('th').text(d=>d);
    let mm = [
        {key:'minval',text:'Min'},
        {key:'maxval',text:'Max'},
        {key:'q1',text:'Q1'},
        {key:'q3',text:'Q3'},
        {key:'median',text:'Median'},
        {key:'std',text:'Std'}
    ];
    let table_data = mm.map(k=>[k.text,data.data[k.key].toFixed(2)]);
    let tr = table.append('tbody').selectAll('tr')
        .data(table_data)
        .enter().append('tr')
        .selectAll('td').data(d=>d)
        .enter().append('td').text(d=>d);

}