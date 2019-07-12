

var tool_tip = d3.tip()
    .attr("class", "d3-tip")
    .attr("id", "d3-tip-mc1")
    .direction('w')
    .html(function(d1,hideLine) {
        return cotenttip(hideLine); });
let tooltip_cof = {w:300,h:300,schema:serviceFullList,showText:true,levels:6,summary:{mean:true, minmax:true, quantile:true},gradient:true,strokeWidth:0.5};
function cotenttip (hideLine){
    str="";
    hideLine = hideLine||false;
    var classtype =  "radarChart_tip";
    str += '<div class="lineChart_tip"></div>'; // Lingeph holder
    str += '<div class="'+classtype+'"></div>'; // Spider chart holder
    // str += '<button onclick="tool_tip.hide()">Close</button>';
    // str += '<button onclick="saveSVG(this)">Save Image</button>';
    // str += '<button onclick="saveSVG_light(this,\'svg\')" class="modal-trigger" href="#savedialog">Save SVG</button>';
    // str += '<button onclick="saveSVG_light(this,\'png\')" class="modal-trigger" href="#savedialog">Save PNG</button>';
    // str += '<button onclick="saveSVG_light(this,\'jpg\')" class="modal-trigger" href="#savedialog">Save JPG</button>';
    return str;
}