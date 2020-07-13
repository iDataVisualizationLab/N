

var tool_tip = d3.tip()
    .attr("class", "d3-tip")
    .attr("id", "d3-tip-mc1")
    .direction('w')
    .html(function(d1,hideLine) {
        return cotenttip(hideLine); });
let tooltip_cof = {w:300,h:300,schema:serviceFullList,showText:true,levels:6,summary:{mean:true, minmax:true, quantile:true},gradient:true,strokeWidth:0.5};
function cotenttip (hideLine){
    str="";
    var classtype =  "radarChart_tip";
    str += '<div class="lineChart_tip"></div>'; // Lingeph holder
    str += '<div class="messages_content"></div>'; // Spider chart holder
    // str += '<button onclick="tool_tip.hide()">Close</button>';
    // str += '<button onclick="saveSVG(this)">Save Image</button>';
    // str += '<button onclick="saveSVG_light(this,\'svg\')" class="modal-trigger" href="#savedialog">Save SVG</button>';
    // str += '<button onclick="saveSVG_light(this,\'png\')" class="modal-trigger" href="#savedialog">Save PNG</button>';
    // str += '<button onclick="saveSVG_light(this,\'jpg\')" class="modal-trigger" href="#savedialog">Save JPG</button>';
    return str;
}

function updateTable (data,list){
    let tablediv = d3.select('#messages_table');
    tablediv.selectAll('*').remove();
    let table = tablediv.append('table');
        let header = table.append("thead").append('tr')
            .selectAll('th').data(['Time','Title', 'Abstract']).enter()
            .append('th').text(d => d);

        let rows = table.append('tbody').selectAll('tr')
            .data(data, d => listopt.timeformat(d.date))
            .enter().append('tr');
        rows.append('td').attr('class', 'text').style('max-width','150px').text(d => multiFormat(listopt.timeformat(d.date)));
        // rows.append('td').attr('class', 'text').style('max-width','200px').html(d => d.location);
        rows.append('td').attr('class', 'text').html(d => d.title);
        rows.append('td').attr('class', 'text').html(d => d.abstract);
      let table_object = $(table.node()).DataTable({
                "order": [[0, "asc"]],
          "pageLength": 50,
          "deferRender": true,
          "columnDefs": [
              { "width": "120px", "targets": 0 },{ "width": "150px", "targets": 1 },
              {"render": function ( data, type, row ) {
                    return data;}, "targets": 1},
              {"render": function ( data, type, row ) {
                      return markWord(data,list);}, "targets": 2},

          ]
            });
    // table_object.on('preDraw',function( settings ) {
    //     console.log( table_object.page());
    // })

    // else {
    //     let rows = table.select('tbody').selectAll('tr')
    //         .data(data, d => d.time+d.account);
    //     rows.enter().append('tr')
    //     rows.append('td').attr('class', 'text').text(d => d.time);
    //     rows.append('td').attr('class', 'text').text(d => d.account);
    //     rows.append('td').attr('class', 'text').html(d => d.html);
    //     var tableFunc = $(table.node()).DataTable();
    //     tableFunc.draw();
    // }
}

$.fn.dataTable.ext.search.push(
    function( settings, data, dataIndex ) {
        var min = new Date( $('#min_time').val());
        var max = new Date( $('#max_time').val());
        var age = new Date( data[0]); // use data for the age column

        if ( ( isNaN( min.getTime() ) && isNaN( max.getTime() ) ) ||
            ( isNaN( min.getTime() ) && age <= max ) ||
            ( min <= age   && isNaN( max.getTime() ) ) ||
            ( min <= age   && age <= max ) )
        {
            return true;
        }
        return false;
    }
);