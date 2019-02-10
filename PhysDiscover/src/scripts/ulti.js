function UnzipData(dataRaw){
    let temp = [];
    dataRaw.forEach(d=>{
        d.value[serviceListattr[chosenService]].forEach((it,i)=>
            temp.push({f: it[service_part],df: 0, key: d.key, timestep:i, undefined:false}));
    });
    return temp;
}
function calData(data){
    sumnet =[];
    let nest = d3.nest()
        .key(function(d) { return d.timestep; })
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
    scaleX = d3.scaleLinear().domain(d3.extent(data,d=>d.f)).range([0,1]);
    scaleY = d3.scaleLinear().domain(d3.extent(data,d=>d.df)).range([0,1]);
    nestbyKey.forEach(key => {
        // let gap = 0;
        // key.values.forEach((t,i)=>{
        //     gap += distance([t.f,t.df],[sumnet[i].f,sumnet[i].df]);
        // })
        key.gap = integration (key.values.map(d=>normalize(d)),sumnet.map(d=>normalize(d)));
    });
    return data;
}
function distance (a,b){
    let dis = 0;
    a.forEach((ai,i)=> dis += (ai-b[i])*(ai-b[i]));
    return Math.sqrt(dis);
}
function normalize(a){
    return [scaleX(a.f),scaleY(a.df)];
}
function integration (a,b){
    let gap = 0;
    a.forEach((t,i)=>{
        gap += distance(t,b[i]);
    });
    return gap;
}
function drawSumgap(){
    mainsvg.attrs({
        ViewBox:"0 0 "+widthSvg+" " +heightSvg,
        preserveAspectRatio:"xMidYMid meet"
    }).attrs({
        width: widthSvg,
        height: heightSvg,
        // overflow: "visible",

    });
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
        .attr('height', legendFullHeight)
        .style('position', 'fixed')
        .style('float', 'right');
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
    legendScale = d3.scaleLinear()
        .domain(color.domain().reverse())
        .range([legendHeight, 0]);

    var legendAxis = d3.axisRight(legendScale)
    // .tickValues(d3.range(-3, 4))
    // .tickFormat(d3.format("d"));

    legendSvg.append("g")
        .attr("class", "legend axis")
        .attr("transform", "translate(" + legendWidth + ", 0)")
        .call(legendAxis);
    brush = d3.brushY()
        .extent([[0, 0], [legendWidth, legendHeight]])
        .on("brush end", brushed);
    legendSvg.append("g")
        .attr("class", "brush")
        .call(brush)
        .call(brush.move, legendScale.range().reverse());
}
function brushed() {
    if (d3.event.sourceEvent && d3.event.sourceEvent.type === "zoom") return; // ignore brush-by-zoom
    let s = d3.event.selection || legendScale.range();
    let range = s.map(legendScale.invert, legendScale);
    d3.selectAll(".gCategory")
        .filter(d=>(d.gap<=range[0] && d.gap>=range[1]));
    // d3.selectAll(".gCategory")
    // x.domain(s.map(x2.invert, x2));
    // focus.select(".area").attr("d", area);
    // focus.select(".axis--x").call(xAxis);
    // svg.select(".zoom").call(zoom.transform, d3.zoomIdentity
    //     .scale(width / (s[1] - s[0]))
    //     .translate(-s[0], 0));
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

    netsvg.selectAll(".linkLineg").style('opacity',0.2);
    d3.select('#mini'+datapoint.key).style('opacity',1);
    d3.selectAll(".linkGap").style('stroke-opacity',0.1);
    d3.selectAll(".linkGap").filter(d=>d.source.key===datapoint.key||d.target.key===datapoint.key).style('stroke-opacity',1);
    if (!currentHost.select('.linkLine').empty())
        currentHost.select('.linkLine').datum(d=>d.values).call(lineConnect)
            .transition()
            .duration(2000)
            .attrTween("stroke-dasharray", tweenDash);
    else
        currentHost.append('path').datum(d=>d.values).call(lineConnect)
            .transition()
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
    netsvg.selectAll(".linkLineg").style('opacity',1);
    netsvg.selectAll(".linkGap").style('stroke-opacity',0.3);
}
function lineConnect(l,scale){
    scale = scale||1;
    return l
        .attrs({
            class: 'linkLine',
            d: d3.line()
                .curve(d3.curveCardinal)
                .x(function(d) {
                    return x(d.values[0].f)/scale; })
                .y(function(d) { return y(d.values[0].df)/scale; })
        })
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

// Netgap

function callgapsall(data,limit){
    let newdata = {nodes:[],links:[]};
    nestbyKey.forEach((key,i) => {
        for (let j=i+1; j<nestbyKey.length;j++) {
            let target = nestbyKey[j];
            let gap2 = integration(key.values.map(d=> normalize(d)), target.values.map(d=> normalize(d)));
            if (limit === undefined || gap2<limit) {
                newdata.links.push({
                    source: key.key,
                    target: target.key,
                    value: gap2
                });
            }
        }
        newdata.nodes.push({
            id: key.key,
            value: key.gap,
            extra: {text: key.values[0].text, topic: key.values[0].topic},
            values: d3.nest().key(function(d) { return d.timestep; })
                .entries(key.values)
        })
    });
    return newdata;
}
function updateLinks (){

}
function drawNetgap(nodenLink){
    let marginNet = ({top: 5, right: 20, bottom: 20, left: 5});
    let scalezoom = 1.5;
    netsvg.attrs({
        // viewBox:  [-widthSvg*scalezoom / 2, -heightSvg*scalezoom / 2, widthSvg*scalezoom, heightSvg*scalezoom],
        viewBox:  [0,0, widthSvg*scalezoom, heightSvg*scalezoom],
        preserveAspectRatio:"xMidYMid meet"
    }).attrs({
        width: widthSvg,
        height: heightSvg,
        // overflow: "visible",

    });
    let widthNet= widthSvg*scalezoom-marginNet.left-marginNet.right;
    let heightNet= heightSvg*scalezoom-marginNet.top-marginNet.bottom;
    let radius =5;

    function cutbyIQR() {
        nodenLink.links.sort((a, b) => {
            a.value - b.value
        });
        let templarray = nodenLink.links.map(d => d.value);
        const q1 = d3.quantile(templarray, 0.25);
        const q3 = d3.quantile(templarray, 0.75);
        const iqr = q3 - q1;
        return nodenLink.links.filter(d=> (d.value>(q3+1.5*iqr)||d.value<(q1-1.5*iqr)));
    }

    function cutbyThreshold(threshhold, maxlink) {
        let tempLinks=[];
        let tempc = d3.nest()
            .key(d=>d.source)
            .sortValues((a,b)=>a.value-b.value)
            .rollup(d=>d.slice(0,maxlink).filter(l=>l.value<threshhold))
            .entries(nodenLink.links);
        tempc.forEach(d=>{tempLinks = d3.merge([tempLinks,d.value])});
        return tempLinks;
    }

    const links = cutbyThreshold(2, 4).map(d => Object.create(d));
    const nodes = nodenLink.nodes.map(d => {
        let temp = Object.create(d);
        temp.key = d.id;
        temp.gap = d.value;
        return temp;
    });
    // const scalerevse = d3.scaleLinear().domain(d3.extent(links,d=>d.value)).range([1,200]);
    const scalerevse = d3.scalePow().exponent(10).domain(d3.extent(links,d=>d.value)).range([0,100]);
    let invertscale =  d3.scalePow().exponent(10).domain(d3.extent(links,d=>d.value)).range([1,0.2]);
    const simulation = d3.forceSimulation(nodes)
        .force("link", d3.forceLink(links).id(d => d.id).distance(d=>scalerevse(d.value)).strength(d=>invertscale(d.value)))
        // .force("link", d3.forceLink(links).id(d => d.id).distance(d=>scalerevse(d.value)).strength(1))
        .force("charge", d3.forceManyBody().strength(-3))
        .force('collision',d3.forceCollide().radius(10))
        .force("center", d3.forceCenter(widthNet / 2, heightNet / 2));
    // .force("x", d3.forceX())
    // .force("y", d3.forceY());


    netsvg.call(tip);
    const netsvgG = netsvg.append("g").attr('transform',`translate(${marginNet.left},${marginNet.top})`);
    const link = netsvgG.append("g")
        .attr("stroke", "#999")
        .attr("stroke-opacity", 0.3)
        .selectAll(".linkGap")
        .data(links).join("line")
        // .enter().append("line")
        .attr("class","linkGap")
        .attr("stroke-width", d => Math.sqrt(d.value));
    const node = netsvgG
        .selectAll(".linkLineg")
        // .data(nodenLink.nodes,d=>d.values)
        .data(nodes)
        .enter().append('g')
        .attr('class','linkLineg')
        .attr('id',(d,i)=>'mini'+nodes[i].key)
        .style('pointer-events','auto');
    node.append('path')
        .style('stroke',d=>
            color(d.gap))
        .datum(d=>d.values)
        .call(d=>lineConnect(d,5))

        .attr('stroke-width',0.5);
    node.selectAll('path')
        .style('pointer-events','auto')
        .on('mouseover',(d)=>{
            tip.show({values: [{key:d.key}]});})
        .on('mouseleave',(d)=>tip.hide())
        .call(drag(simulation));
    node.nodes().forEach(d=>{
        let e= d3.select(d).select('path').node().getBoundingClientRect();
        d.__data__.width = e.width;
        d.__data__.height = e.height;
    });
    // .attr("stroke", "#fff")
    // .attr("stroke-width", 0.5)
    // .selectAll("circle")
    // .data(nodes)
    // .enter().append("circle")
    // .attr("r", 2)
    // .attr("fill", d=>color(d.value))


    node.append("title")
        .text(d => d.id);


    simulation.on("tick", () => {
        link
            .attr("x1", d => d.source.x)
            .attr("y1", d => d.source.y)
            .attr("x2", d => d.target.x)
            .attr("y2", d => d.target.y);

        node
            .attr("transform", d=>{

                d.x = Math.max(widthSvg/10, Math.min(widthNet - widthSvg/5, d.x));
                d.y = Math.max(heightSvg/10, Math.min(heightNet - heightSvg/5, d.y));
                return `translate(${d.x- widthSvg/10},${d.y- heightSvg/10})`});
    });
    function drag (simulation) {

        function dragstarted(d) {
            if (!d3.event.active) simulation.alphaTarget(0.3).restart();
            d.fx = d.x;
            d.fy = d.y;
        }

        function dragged(d) {
            d.fx = d3.event.x;
            d.fy = d3.event.y;
        }

        function dragended(d) {
            if (!d3.event.active) simulation.alphaTarget(0);
            d.fx = null;
            d.fy = null;
        }

        return d3.drag()
            .on("start", dragstarted)
            .on("drag", dragged)
            .on("end", dragended);
    }
    //invalidation.then(() => simulation.stop());
}
$( document ).ready(function(){
    $(".dropdown-trigger").dropdown();
    $('.collapsible').collapsible();

    let menucombo = d3.select("#listvar")
        .selectAll('li')
        .data(serviceLists)
        .enter()
        .append('li');
    menucombo
        .append('div')
        .attrs(d=>{return {class: 'collapsible-header',
            text: d.text}});
    // menucombo
    //     .append('div')
    //     .attrs(d=>{return {class: 'collapsible-body'}})
    //     .data(d=>{return d.sub})
    //     .enter();

    // menucombo.selectAll('.collapsible-header').data((d,i)=>[{id: i,text: d}])
    //     .join("div")
    menucombo
        .on('click',changeVar)
        .text(d=>d.text);
});
function changeVar(d){
    chosenService =d.id;
    reset();
    $('#currentservice').text(d.text);
}

function reset(){
    mainsvg.selectAll('*').remove();
    d3.select('#legend-svg').selectAll('*').remove();
    netsvg.selectAll('*').remove();

    data = calData(UnzipData(dataRaw));
    nodenLink = callgapsall(data);
    drawSumgap();
    drawNetgap(nodenLink);
}