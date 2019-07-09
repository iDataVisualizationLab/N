

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
    str += '<div class="'+classtype+'"></div>'; // Spider chart holder
    // str += '<button onclick="tool_tip.hide()">Close</button>';
    // str += '<button onclick="saveSVG(this)">Save Image</button>';
    // str += '<button onclick="saveSVG_light(this,\'svg\')" class="modal-trigger" href="#savedialog">Save SVG</button>';
    // str += '<button onclick="saveSVG_light(this,\'png\')" class="modal-trigger" href="#savedialog">Save PNG</button>';
    // str += '<button onclick="saveSVG_light(this,\'jpg\')" class="modal-trigger" href="#savedialog">Save JPG</button>';
    return str;
}