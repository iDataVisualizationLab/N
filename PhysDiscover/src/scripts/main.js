
let widthSvg = 800;//document.getElementById("mainPlot").clientWidth-101;
let heightSvg = 600;
let margin = ({top: 20, right: 50, bottom: 50, left: 50});



let mainsvg = d3.select("#content"),
x,y,color;
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

}).call(resize);

d3.select(window).on("resize." + "mainPlot", resize);

// get width of container and resize svg to fit it
function resize() {
    var targetWidth = parseInt(d3.select(mainsvg.node().parentNode).style("width"));
    mainsvg.attr("width", targetWidth);
    mainsvg.attr("height", Math.round(targetWidth / (widthSvg/heightSvg)));
}
/* Initialize tooltip */
let tip = d3.tip().attr('class', 'd3-tip')
    .offset([-10, 0])
    .html(function(d) { return d.values[0].key; });



init();






function init(){
    dataRaw = object2Data(readData());
    data = calData(UnzipData(dataRaw));
    draw();

}
function UnzipData(dataRaw){
    let temp = [];
    dataRaw.forEach(d=>{
        d.value[serviceListattr[chosenService]].forEach((it,i)=>
            temp.push({f: it[1],df: 0, key: d.key, timestep:i, undefined:false}));
    });
    return temp;
}
function calData(data){
    let nest = d3.nest()
        .key(function(d) { return d.timestep; })
        //.key(function(d) { return d.variety; })
        .entries(data);
    nest.forEach((n,i)=>{
        let currentMean = d3.mean(n.values,m=>m.f);
            n.values.forEach(d => {
                if (d.f===undefined) {
                    d.undefined =true;
                    d.f = currentMean;
                }
                if (i)
                d.df = d.f - nest[i-1].values.find(t => t.key === d.key).f;
            });
        sumnet.push({f: currentMean, df: d3.mean(n.values,m=>m.df),timestep:i});
    });
    nestbyKey = d3.nest()
        .key(function(d) { return d.key; }).sortKeys(function(a,b) { return a.timestep-b.timestep})
        .entries(data);
    nestbyKey.forEach(key => {
        let gap = 0;
        key.values.forEach((t,i)=>{
            gap += distance([t.f,t.df],[sumnet[i].f,sumnet[i].df]);
        })
        key.gap = gap;
    });
    return data;
}
function distance (a,b){
    let dis = 0;
    a.forEach((ai,i)=> dis += (ai-b[i])*(ai-b[i]));
    return Math.sqrt(dis);
}
function draw(){
    color = d3.scaleSequential(d3.interpolateSpectral)
        .domain(d3.extent(nestbyKey,d=>d.gap).reverse());
    x = d3.scaleLinear()
        .domain(d3.extent(data, d => d.f)).nice()
        .range([margin.left, widthSvg - margin.right]);
    y = d3.scaleLinear()
        .domain(d3.extent(data, d => d.df)).nice()
        .range([heightSvg - margin.bottom, margin.top]);
    let xAxis = g => g
        .attr("transform", `translate(0,${heightSvg - margin.bottom})`)
        .call(d3.axisBottom(x))
        //.call(g => g.select(".domain").remove())
        .call(g => g.append("text")
            .attr("class","axisLabel")
            .attr("x", widthSvg - margin.right)
            .attr("y", -4)
            .attr("fill", "#000")
            .attr("font-weight", "bold")
            .attr("text-anchor", "end")
            .text("Temperature"));
    let yAxis = g => g
        .attr("transform", `translate(${margin.left},0)`)
        .call(d3.axisLeft(y))
        //.call(g => g.select(".domain").remove())
        .call(g => g.select(".tick:last-of-type text").clone()
            .attr("x", 4)
            .attr("class","axisLabel")
            .attr("text-anchor", "start")
            .attr("font-weight", "bold")
            .text("Delta Temperature"));

    mainsvg.append("g")
        .call(xAxis);

    mainsvg.append("g")
        .call(yAxis);
    let datanest = d3.nest()
        .key(function(d) { return d.key; })
        .key(function(d) { return d.timestep; })
        .entries(data);
    datanest.forEach((d,i)=>d.gap =nestbyKey[i].gap);
    let maing = mainsvg. append('g')
        .attrs({id: 'maing'});
    maing.call(tip);
    let gpoints = maing.selectAll(".gCategory")
        .data(datanest,d=>d.values).enter()
        .append('g')
        .attrs({class: 'gCategory',
                id: d=>d.key})
        .call(activepoint);
    gpoints.selectAll(".datapoint")
        .data(d=>d.values).enter()
            .append('circle')
            .attrs({class: 'datapoint',
                    cx: d=>x(d.values[0].f),
                    cy: d=>y(d.values[0].df),
                    r:  2})
        .on('mouseover',mouseoverHandel)
        .on('mouseleave',mouseleaveHandel);
    maing.call(sumgap);
    d3.select('#legend-svg').call(colorlegend);
}

function colorlegend (g){
    // add the legend now
    var legendFullHeight = heightSvg-margin.bottom;
    var legendFullWidth = 80;

    var legendMargin = { top: 20, bottom: 20, left: 20, right: 35 };

    // use same margins as main plot
    var legendWidth = legendFullWidth - legendMargin.left - legendMargin.right;
    var legendHeight = legendFullHeight - legendMargin.top - legendMargin.bottom;

    var legendSvgMain = g.attr('width', legendFullWidth)
        .attr('height', legendFullHeight);
    var legendSvg = legendSvgMain.append('g')
        .attr('transform', 'translate(' + legendMargin.left + ',' +
            legendMargin.top + ')');
    legendSvgMain.append("text")
        .attr("class","axisLabel")
        .attr("transform", "rotate(-90)")
        .attr("x",0 - (legendFullHeight / 2))
        .attr("dy", "1em")
        .attr("font-weight", "bold")
        .style("text-anchor", "middle")
        .text("Derivation from the average curve");
    var gradient = legendSvg.append('defs')
        .append('linearGradient')
        .attr('id', 'gradient')
        .attr('x1', '0%') // bottom
        .attr('y1', '100%')
        .attr('x2', '0%') // to top
        .attr('y2', '0%')
        .attr('spreadMethod', 'pad');
    // programatically generate the gradient for the legend
    // this creates an array of [pct, colour] pairs as stop
    // values for legend
    var pct = linspace(0, 100, 10).map(function(d) {
        return Math.round(d);
    });
    let gap = Math.abs(color.domain()[1]-color.domain()[0]);
    pct.forEach(function(d) {
        gradient.append('stop')
            .attr('offset', d+"%")
            .attr('stop-color', color(d*gap/100))
            .attr('stop-opacity', 1);
    });

    legendSvg.append('rect')
        .attr('x1', 0)
        .attr('y1', 0)
        .attr('width', legendWidth)
        .attr('height', legendHeight)
        .style('fill', 'url(#gradient)');

    // create a scale and axis for the legend
    var legendScale = d3.scaleLinear()
        .domain(color.domain().reverse())
        .range([legendHeight, 0]);

    var legendAxis = d3.axisRight(legendScale)
        // .tickValues(d3.range(-3, 4))
        // .tickFormat(d3.format("d"));

    legendSvg.append("g")
        .attr("class", "legend axis")
        .attr("transform", "translate(" + legendWidth + ", 0)")
        .call(legendAxis);
}
function linspace(start, end, n) {
    var out = [];
    var delta = (end - start) / (n - 1);

    var i = 0;
    while(i < (n - 1)) {
        out.push(start + (i * delta));
        i++;
    }

    out.push(end);
    return out;
}
function sumgap (g){
    g.append('path').datum(sumnet)
        .attrs({
            id: 'sumgap',
            class: 'gapLine',
            d: d3.line()
                .curve(d3.curveCardinal)
                .x(function(d) {
                    return x(d.f); })
                .y(function(d) { return y(d.df); })
        });
}
function mouseoverHandel(datain){
    tip.show(datain);
    let timestep = datain.key;
    let datapoint = datain.values[0];
    let cpoint = mainsvg.selectAll(".gCategory").filter(f=>f.key!==datapoint.key);
    cpoint.transition().duration(500)
        .call(deactivepoint);
    let currentHost = mainsvg.select("#"+datapoint.key);
    if (!currentHost.select('.linkLine').empty())
        currentHost.select('.linkLine').datum(d=>d.values)
        .style("opacity",1)
        .attrs({
            class: 'linkLine',
            d: d3.line()
                .curve(d3.curveCardinal)
                .x(function(d) {
                    return x(d.values[0].f); })
                .y(function(d) { return y(d.values[0].df); })
        }).transition()
            .duration(2000)
            .attrTween("stroke-dasharray", tweenDash);
    else
        currentHost.append('path').datum(d=>d.values)
        .attrs({
            class: 'linkLine',
            d: d3.line()
                .curve(d3.curveCardinal)
                .x(function(d) {
                    return x(d.values[0].f); })
                .y(function(d) { return y(d.values[0].df); })
        }).transition()
            .duration(2000)
            .attrTween("stroke-dasharray", tweenDash);
    function tweenDash() {
        var l = this.getTotalLength(),
            i = d3.interpolateString("0," + l, l + "," + l);
        return function (t) { return i(t); };
    }
}
function mouseleaveHandel(datain){
    tip.hide();
    // let timestep = datain.key;
    // let datapoint = datain.values;
    let cpoint = mainsvg.selectAll(".gCategory")
        .transition().duration(200)
        .call(activepoint);
    mainsvg.selectAll(".linkLine").style("opacity",0.5);
}

function activepoint(p){
    return p.style('fill',d=>color(d.gap))
        .style('opacity',1)
        .attr('r',2);
}

function deactivepoint(p){
    return p.style('fill','gray')
        .style('opacity',0.1).attr('r',1);
}


// // materialize
// document.addEventListener('DOMContentLoaded', function() {
//     var elems = document.querySelectorAll('.sidenav');
//     var instances = M.Sidenav.init(elems, options);
// });
//
// // Or with jQuery
//
// $(document).ready(function(){
//     $('.sidenav').sidenav();
// });
