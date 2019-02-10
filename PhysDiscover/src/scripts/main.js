// config
let widthSvg = 500;//document.getElementById("mainPlot").clientWidth-101;
let heightSvg = 500;
let margin = ({top: 20, right: 50, bottom: 50, left: 50});



//dataprt

let service_part =0;

let currentColor ="black";
const mainsvg = d3.select("#content"),
    netsvg = d3.select("#networkcontent");
let x,y,color,brush,legendScale,scaleX,scaleY;

let isColorMatchCategory = false;

let dataRaw = [];
let data,nestbyKey, sumnet=[];
// mainsvg.attrs({
//     width: widthSvg,
//     height: heightSvg,
// });
mainsvg.attrs({
    ViewBox:"0 0 "+widthSvg+" " +heightSvg,
    preserveAspectRatio:"xMidYMid meet"
}).styles({
    width: '90%',
    overflow: "visible",

});

/* Initialize tooltip */
let tip = d3.tip().attr('class', 'd3-tip')
    .offset([-10, 0])
    .html(function(d) { return d.values[0].key; });



init();






function init(){
    dataRaw = object2Data(readData());
    data = calData(UnzipData(dataRaw));
    nodenLink = callgapsall(data);
    drawSumgap();
    drawNetgap(nodenLink,isColorMatchCategory);
}