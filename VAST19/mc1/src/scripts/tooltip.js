

var tool_tip = d3.tip()
    .attr("class", "d3-tip")
    .attr("id", "d3-tip-mc1")
    .direction('w')
    .html(function(d1,hideLine) {
        return cotenttip(hideLine); });
function cotenttip (hideLine){
    str="";
    hideLine = hideLine||false;
    var classtype =  "radarChart_tip";
    str += '<div class="tootltip_text"></div>'; // Lingeph holder
    str += '<div class="'+classtype+'"></div>'; // Spider chart holder
    // str += '<button onclick="tool_tip.hide()">Close</button>';
    // str += '<button onclick="saveSVG(this)">Save Image</button>';
    // str += '<button onclick="saveSVG_light(this,\'svg\')" class="modal-trigger" href="#savedialog">Save SVG</button>';
    // str += '<button onclick="saveSVG_light(this,\'png\')" class="modal-trigger" href="#savedialog">Save PNG</button>';
    // str += '<button onclick="saveSVG_light(this,\'jpg\')" class="modal-trigger" href="#savedialog">Save JPG</button>';
    return str;
}

function tooltipBox (data){
    let type = data.loc==='all'?'Summary':'Location';
    let id = isNaN(+data.loc)?+data.loc.replace('s',''):+data.loc;
    let headertext = '<b>'+(type==="Summary"? type: dataRaw.location[data.loc])+'</b>';
    // headertext+=' - '+ data.time.toUTCString();
    let headerdiv = d3.select('.tootltip_text').append('div').attr('class','header col s12');
    headerdiv.append('h6').attr('class','col').html(headertext);
    headerdiv.append('h6').attr('class','col').html('Time: <b>'+d3.timeFormat("%I %p - %a %d")(data.time)+'</b>');
    headerdiv.append('h6').attr('class','col').html('#reports: <b>'+data.data.num+'</b>');
    // let table = d3.select('.tootltip_text').append('div').attr('class','tip-divtable')
    //     .append('table').attr('class','tip-table');
    // // table.append('thead').selectAll('th')
    // //     .data(['Measurment','Value']).enter().append('th').text(d=>d);
    // let mm = [
    //     {key:'minval',text:'Min'},
    //     {key:'maxval',text:'Max'},
    //     {key:'val',text:'Mean'},
    //     {key:'q1',text:'Q1'},
    //     {key:'q3',text:'Q2'}
    // ];
    // let datatable = [['Time',d3.timeFormat("%I %p - %a %d")(data.time)],
    //     ['#reports',data.data.num]
    //     ]
    // //
    // let tr = table.append('tbody').selectAll('tr')
    //     .data(datatable)
    //     .enter().append('tr')
    //     .selectAll('td').data(d=>d)
    //     .enter().append('td').text(d=>d);

}