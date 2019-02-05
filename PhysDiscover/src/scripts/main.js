let widthSvg = 800;
let heightSvg = 600;
let margin = ({top: 20, right: 30, bottom: 30, left: 40});



let mainsvg = d3.select("#content"),
x,y;
let dataRaw = [];
let data;
mainsvg.attrs({
    width: widthSvg,
    height: heightSvg,
});

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
            })
    });
    return data;
}
function draw(){
    x = d3.scaleLinear()
        .domain(d3.extent(data, d => d.f)).nice()
        .range([margin.left, widthSvg - margin.right]);
    y = d3.scaleLinear()
        .domain(d3.extent(data, d => d.df)).nice()
        .range([heightSvg - margin.bottom, margin.top]);
    let xAxis = g => g
        .attr("transform", `translate(0,${heightSvg - margin.bottom})`)
        .call(d3.axisBottom(x))
        .call(g => g.select(".domain").remove())
        .call(g => g.append("text")
            .attr("x", widthSvg - margin.right)
            .attr("y", -4)
            .attr("fill", "#000")
            .attr("font-weight", "bold")
            .attr("text-anchor", "end")
            .text(data.f));
    let yAxis = g => g
        .attr("transform", `translate(${margin.left},0)`)
        .call(d3.axisLeft(y))
        .call(g => g.select(".domain").remove())
        .call(g => g.select(".tick:last-of-type text").clone()
            .attr("x", 4)
            .attr("text-anchor", "start")
            .attr("font-weight", "bold")
            .text(data.df));

    mainsvg.append("g")
        .call(xAxis);

    mainsvg.append("g")
        .call(yAxis);
    let datanest = d3.nest()
        .key(function(d) { return d.key; })
        .key(function(d) { return d.timestep; })
        .entries(data);
    let maing = mainsvg. append('g')
        .attrs({id: 'maing'});
    maing.call(tip);
    let gpoints = maing.selectAll(".gCategory")
        .data(datanest,d=>d.values).enter()
        .append('g')
        .attrs({class: 'gCategory',
                id: d=>d.key})
        .style('opacity',1);
    gpoints.selectAll(".datapoint")
        .data(d=>d.values).enter()
            .append('circle')
            .attrs({class: 'datapoint',
                    cx: d=>x(d.values[0].f),
                    cy: d=>y(d.values[0].df),
                    r:  2})
        .call(activepoint)
        .on('mouseover',mouseoverHandel)
        .on('mouseleave',mouseleaveHandel);

}

function mouseoverHandel(datain){
    tip.show(datain);
    let timestep = datain.key;
    let datapoint = datain.values[0];
    let cpoint = mainsvg.selectAll(".gCategory").filter(f=>f.key!==datapoint.key);
    cpoint.transition().duration(200)
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
    return p.styles({
        fill: 'steelblue',
        opacity: 1
    }).attr('r',2);
}

function deactivepoint(p){
    return p.styles({
        fill: 'gray',
        opacity: 0.1
    }).attr('r',1);
}