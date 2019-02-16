let widthSvg = 1500;//document.getElementById("mainPlot").clientWidth-101;
let heightSvg = 800;
let margin = ({top: 20, right: 50, bottom: 50, left: 50});



//dataprt

let service_part =0;

let currentColor ="black";
const wssvg = d3.select("#WScontent"),
    netsvg = d3.select("#networkcontent"),
    scsvg = d3.select("#Scattercontent");
let x,y,color,brush,legendScale,scaleX,scaleY;

let filterConfig = {
    time: [undefined,undefined],
    maxevent : 30,
    maxeventAll : 200,
    limitSudden : 50,
    limitconnect : 1,
    scalevalueLimit: 0.1
};
let scatterConfig ={
    g:{},
    margin: {top: 10, right: 10, bottom: 40, left: 40},
    scaleView:1,
    width: 500,
    height: 500,
    widthG: function(){return this.width-this.margin.left-this.margin.right},
    heightG: function(){return this.height-this.margin.top-this.margin.bottom},
    scale:5,
};
let wsConfig ={
    g:{},
    margin: {top: 5, right: 20, bottom: 20, left: 5},
    width: widthSvg,
    height: 500,
    widthG: function(){return this.width-this.margin.left-this.margin.right},
    heightG: function(){return this.height-this.margin.top-this.margin.bottom},
};
let netConfig ={
    g:{},
    margin: {top: 0, right: 0, bottom: 0, left: 0},
    scalezoom: 1,
    width: widthSvg,
    height: heightSvg,
    widthView: function(){return this.width*this.scalezoom},
    heightView: function(){return this.height*this.scalezoom},
    widthG: function(){return this.widthView()-this.margin.left-this.margin.right},
    heightG: function(){return this.heightView()-this.margin.top-this.margin.bottom},
    colider: function() {return this.smallgrapSize()/10},
    ratiograph: 24,
    smallgrapSize: function(d){return this.width/this.ratiograph},
    fontRange:[10,15]
};
let isColorMatchCategory = true;

let dataRaw = [];
let data,nestbyKey, sumnet=[];


/* Initialize tooltip */
let tip = d3.tip().attr('class', 'd3-tip')
    .offset([-10, 0])
    .html(function(d) {
        console.log(d)
        return ([d.values[0].text,d.values[0].connect.map(e=> {
            if (e.source.key !== d.values[0].key)
                return e.source.text;
            return  e.target.text;
        }).join(', ')]).join(': '); });
let tip2 = d3.tip().attr('class', 'd3-tip')
    .offset([-10, 0])
    .html(function(d) { return d.values[0].key; });


$(document).ready(function(){
    //scatterConfig.scaleView = $('#mainPlot').width()/scatterConfig.width;
    widthSvg = $('#network').width();
    wsConfig.width = $('#WS').width();
    netConfig.width = widthSvg;
    d3.select("#DarkTheme").on("click",switchTheme);
});

init();






function init(){


    readData(new Date('2010')).then((d)=>{
        // read and assign
        dataRaw = d;

        // filter data maxevent and limitsudden
        data = filterTop(dataRaw);
        initOther();
        callSum();
        initNetgap();
        x = d3.scaleLinear()
            .domain([0,1]).nice()
            .range([0, netConfig.smallgrapSize()]);
        y = d3.scaleLinear()
            .domain([0,1]).nice()
            .range([netConfig.smallgrapSize(),0]);
        initScatter ();
        // WORD STREAM
        initWS ();
        drawWS();

        renderWS(data);
        // SCATTER PLOT
        drawInstances(dataRaw);
        drawScatter();
        nodenLink = callgapsall(data,filterConfig.limitconnect);
        //initNetgap();
        drawNetgapHuff(nodenLink,isColorMatchCategory);
        d3.select('.cover').classed('hidden',true);

    });

}
function recall (){
    let cal1 = new Date();
        data = filterTop(dataRaw);
    let cal2 = new Date();
    console.log('---- filter Top ----: '+(cal2-cal1));
        callSum();
    cal1 = new Date();
    console.log('---- call average ----: '+(cal1-cal2));
    drawWS();
    cal2 = new Date();
    console.log('---- drawWS ----: '+(cal2-cal1));
        // hightlightWS();
        nodenLink = callgapsall(data,filterConfig.limitconnect);
    cal1 = new Date();
    console.log('---- call LINK ----: '+(cal1-cal2));
        //initNetgap();
        drawNetgapHuff(nodenLink,isColorMatchCategory);
        drawScatter();
        d3.select('.cover').classed('hidden',true);
}
function initOther(){
    let colors = d3.schemeCategory10;
    // let colors = d3.scaleOrdinal(d3.schemeCategory10);
    color =function (category) {
        if (category== 'person')
            return colors[2] ; // leaf node
        else if (category=='location')
            return colors[3] ; // leaf node
        else if (category=='organization')
            return colors[0] ; // leaf node
        else if (category=='miscellaneous')
            return colors[1] ; // leaf node
        else
            return '#000000';
    };
    wsConfig.time2index = d3.scaleTime().domain(d3.extent(data, function(d) { return d.timestep; })).rangeRound([0,d3.nest().key(d=>d.timestep).entries(data).length-1]);
    filterConfig.time = wsConfig.time2index.range();
}

function initScatter () {
    scsvg.attrs({
        preserveAspectRatio:"xMinYMin meet",
        viewbox:"0 0 "+scatterConfig.width+" " +scatterConfig.height,
        width:scatterConfig.width,
        height:scatterConfig.height,
    });
    let scsvg_g = scsvg.append('g')
        .attr('class','zoomContent').attr("transform","scale("+scatterConfig.scaleView+","+scatterConfig.scaleView+")");;
    scsvg_g.append('g')
        .attr('class','axis')
        .attr('transform',`translate(${scatterConfig.margin.left},${scatterConfig.margin.top})`);

    scsvg.g = scsvg_g.append('g')
        .attr('class','graph')
        .attr('transform',`translate(${scatterConfig.margin.left},${scatterConfig.margin.top})`)
            .append('svg')
            .attrs({
                width: scatterConfig.widthG(),
                height: scatterConfig.heightG(),
            });

    scatterConfig.scale = netConfig.smallgrapSize()/scatterConfig.widthG();
    scatterConfig.x = d3.scaleSymlog().domain(d3.extent(data,d=>d.f)).nice().range([0, scatterConfig.widthG()]);
    scatterConfig.y = d3.scaleSymlog().domain(d3.extent(data,d=>d.df)).nice().range([scatterConfig.heightG(), 0]);
    scatterConfig.lineConnect = function (l){
        return l
            .attrs({
                class: 'linkLine',
                d: d3.line()
                    .curve(d3.curveCardinal.tension(0.25))
                    .x(function(d) {
                        return scatterConfig.x(d.values[0].f); })
                    .y(function(d) { return scatterConfig.y(d.values[0].df); })
            })
    };
    scatterConfig.xAxis = g => g
        .attr("transform", `translate(0,${scatterConfig.heightG()})`)
        .call(d3.axisBottom(scatterConfig.x).ticks(5))
        .call(g => g.append("text")
            .attr("x", scatterConfig.widthG())
            .attr("y", -4)
            // .attr("fill", "#000")
            .attr("font-weight", "bold")
            .attr("text-anchor", "end")
            .attr('class','labelx axisLabel')
            .text("Frequency"));
    scatterConfig.yAxis = g => g
        .attr("transform", `translate(0,0)`)
        .call(d3.axisLeft(scatterConfig.y).ticks(5))
        //.call(g => g.select(".domain").remove())
        .call(g => g.select(".tick:last-of-type text").clone()
            .attr("x", 4)
            .attr("class","axisLabel")
            .attr("text-anchor", "start")
            .attr("font-weight", "bold")
            .attr('class','labely axisLabel')
            .text("Sudden Change"));
    scsvg.gIn = scsvg.g.append('g')
        .attr('id','InstancePlot');
    scsvg.select('.axis').append('g')
        .attr('class','axis--x')
        .call(scatterConfig.xAxis);
    scsvg.select('.axis').append('g')
        .attr('class','axis--y')
        .call(scatterConfig.yAxis);
    scsvg.g.call(tip2);

    scatterConfig.xAxisSpike = d3.axisTop(scatterConfig.x).tickValues([]).tickSize(scatterConfig.height/2);
    scatterConfig.yAxisSpike = d3.axisRight(scatterConfig.y).tickValues([]).tickSize(scatterConfig.width/2);
    scsvg.select('.axis').append('g')
        .attr('class','axis--y--spike')
        .call(customYAxis);
    scsvg.select('.axis').append('g')
        .attr('class','axis--x--spike')
        .attr("transform", `translate(0,${scatterConfig.heightG()})`)
        .call(customXAxis);
}

function customYAxis(g) {
    g.call(scatterConfig.yAxisSpike);
    g.select(".domain").remove();
    g.selectAll(".tick line").attr("stroke", "#777").attr("stroke-dasharray", "2,2");
    g.selectAll(".tick text").attr("x", 4).attr("dy", -4);
}

function customXAxis(g) {
    g.call(scatterConfig.xAxisSpike);
    g.select(".domain").remove();
    g.selectAll(".tick line").attr("stroke", "#777").attr("stroke-dasharray", "2,2");
    g.selectAll(".tick text").style('text-anchor','end').attr("dx", -4).attr("y", -4);
}

function customTimeAxis(g) {
    g.call(wsConfig.timeAxisSpike);
    g.select(".domain").remove();
    g.selectAll(".tick line").attr("stroke", "#777").attr("stroke-dasharray", "2,2");
    g.selectAll(".tick text").style('text-anchor','end').attr("dx", -4).attr("y", -4);
}

function updateSpike(x,y,time){
    if (x&&y) {
        scatterConfig.yAxisSpike.tickValues([y]).tickSize(scatterConfig.x(x));
        scsvg.select('.axis--y--spike').call(customYAxis);
        scatterConfig.xAxisSpike.tickValues([x]).tickSize(scatterConfig.heightG() - scatterConfig.y(y));
        scsvg.select('.axis--x--spike').call(customXAxis);
        wsConfig.timeAxisSpike.tickValues([time]);
        wssvg.select('.axis--x--spike').call(customTimeAxis);
    }else
    {
        scatterConfig.yAxisSpike.tickValues([]);
        scsvg.select('.axis--y--spike').call(customYAxis);
        scatterConfig.xAxisSpike.tickValues([]);
        scsvg.select('.axis--x--spike').call(customXAxis);
        wsConfig.timeAxisSpike.tickValues([]);
        wssvg.select('.axis--x--spike').call(customTimeAxis);
    }
}

function drawInstances(dataR){
    let datanest = d3.nest()
        .key(function(d) { return d.key; }).sortValues((a,b)=>(b.df-a.df))
        .rollup(d=>d.slice(0,1))
        .entries(dataR);
    let pointsdata = scsvg.gIn.selectAll(".gInstance")
        .data(datanest,d=>d.value);
    let gpoints_new = pointsdata.enter()
        .append('g')
        .attr('class','gInstance').style('opacity',0);

    gpoints_new.selectAll(".instancePoint")
        .data(d=>d.value).enter()
        .append('circle')
        .attr('class','instancePoint');
    //remove
    pointsdata.exit().transition().duration(1000)
        .style('opacity',0.1).remove();
    //update data
    let gpoints = scsvg.g.selectAll(".gInstance")
        .attr('id', d=>'instance'+d.key).call(activepoint);

    gpoints.selectAll(".instancePoint").attrs({
        cx: d=>scatterConfig.x(d.f),
        cy: d=>scatterConfig.y(d.df),
        r:  2})
        .style('opacity',0.2)
        .style('fill',d=> color(d.topic));


}

function drawScatter(){
    let datanest = d3.nest()
        .key(function(d) { return d.key; })
        .key(function(d) { return d.timestep; })
        .entries(data);

    datanest.forEach((d,i)=>d.gap =nestbyKey[i].gap);

    let pointsdata = scsvg.g.selectAll(".gCategory")
        .data(datanest,d=>d.values);
    let gpoints_new = pointsdata.enter()
        .append('g')
        .attr('class','gCategory').style('opacity',0);

    gpoints_new.selectAll(".datapoint")
        .data(d=>d.values).enter()
        .append('circle')
        .attr('class','datapoint');
    //remove
    pointsdata.exit().transition().duration(1000)
        .style('opacity',0.1).remove();
    //update data
    let gpoints = scsvg.g.selectAll(".gCategory")
        .attr('id', d=>d.key).call(activepoint);

    gpoints.selectAll(".datapoint").attrs({
        cx: d=>scatterConfig.x(d.values[0].f),
        cy: d=>scatterConfig.y(d.values[0].df),
        r:  2})
        .style('fill',d=> color(d.values[0].topic))
        .on('mouseover',function(d){
            tip2.show(d);
            mouseoverHandel(d);})
        .on('mouseleave',function(d){
            tip2.hide();
            mouseleaveHandel(d)})

    // scsvg.g.call(sumgap);
   // d3.select('#legend-svg').call(colorlegend);
}

function mouseoverHandel(datain){
    console.log(datain);

    let timestep = datain.key;
    let datapoint = datain.values[0];
    let cpoint = scsvg.g.selectAll(".gCategory").filter(f=>f.key!==datapoint.key);
    cpoint.transition().duration(500)
        .call(deactivepoint);
    let currentHost = scsvg.g.select("#"+datapoint.key);
    updateSpike(datapoint.f,datapoint.df,datapoint.timestep);
    netsvg.selectAll(".linkLineg").style('opacity',0.2);
    d3.select('#mini'+datapoint.key).style('opacity',1);
    d3.selectAll(".linkGap").style('stroke-opacity',0.1);
    d3.selectAll(".linkGap").filter(d=>d.source.key===datapoint.key||d.target.key===datapoint.key).style('stroke-opacity',1);
    if (!currentHost.select('.linkLine').empty())
        currentHost.select('.linkLine').datum(d=>d.values)
            .call(scatterConfig.lineConnect)
            .transition()
            .duration(2000)
            .attrTween("stroke-dasharray", tweenDash);
    else
        currentHost.append('path').datum(d=>d.values).call(scatterConfig.lineConnect)
            .style('stroke',d=> color(d[0].values[0].topic))
            .transition()
            .duration(2000)
            .attrTween("stroke-dasharray", tweenDash);
    // word stream
    wssvg.selectAll('.gtext').filter(d=>d.data.key!==datapoint.key).style('opacity',0.1);
    function tweenDash() {
        var l = this.getTotalLength(),
            i = d3.interpolateString("0," + l, l + "," + l);
        return function (t) { return i(t); };
    }
}
function mouseleaveHandel(){
    // let timestep = datain.key;
    // let datapoint = datain.values;
    let cpoint = scsvg.g.selectAll(".gCategory")
        .transition().duration(200)
        .call(activepoint);
    scsvg.g.selectAll(".linkLine").style("opacity",0.5);
    netsvg.selectAll(".linkLineg").style('opacity',1);
    netsvg.selectAll(".linkGap").style('stroke-opacity',0.5);
    wssvg.selectAll('.gtext').style('opacity',1);
    updateSpike();
}
function initWS () {
    wssvg.attrs({
        ViewBox:"0 0 "+wsConfig.width+" " +wsConfig.height,
        preserveAspectRatio:"xMidYMid meet"
    }).attrs({
        width: wsConfig.width,
        height: wsConfig.height,
    });

    wssvg.append('g')
        .attr('class','axis')
        .attr('transform',`translate(${wsConfig.margin.left},${wsConfig.margin.top})`);

    wssvg.g = wssvg.append('g')
        .attr('class','graph')
        .attr('transform',`translate(${wsConfig.margin.left},${wsConfig.margin.top})`);
    wssvg.g.append('g')
        .attr("class",'wsArea');


    wsConfig.timeScale = d3.scaleTime()
        .rangeRound([0, wsConfig.widthG()]);
    brush = d3.brushX()
        .extent([[0, wsConfig.heightG()-wsConfig.heightG()/10], [wsConfig.widthG(), wsConfig.heightG()+wsConfig.heightG()/10]])
        .on("brush end", brushedTime);
    wssvg.xAxis = d3.axisBottom(wsConfig.timeScale);
        // .ticks(d3.timeMonth)
        // .tickPadding(0);
    wssvg.select('.axis').append('g')
        .attr('class','axis--x')
        .attr("transform", "translate(0," + wsConfig.heightG() + ")")
        .call(wssvg.xAxis);
    let brushArea = wssvg.g.append("g")
        .attr("class", "brush")
        .call(brush);
    wsConfig.timeAxisSpike = d3.axisTop(wsConfig.timeScale)
        .tickValues([])
        .tickSize(wsConfig.height)
        .tickFormat(d3.timeFormat("%B %Y"));
    wssvg.select('.axis').append('g')
        .attr('class','axis--x--spike')
        .attr("transform", `translate(0,${wsConfig.heightG()})`)
        .call(customTimeAxis);
}

function drawWS(){
    wsConfig.timeScale.domain(d3.extent(dataRaw, function(d) { return d.timestep; }));
    wssvg.select('.axis--x').call(wssvg.xAxis);
    wssvg.g.select('.brush').call(brush.move, wsConfig.timeScale.range());
}

function brushedTime (){
    console.log(d3.event.sourceEvent!=null?d3.event.sourceEvent.type:"nope!!");
    if (d3.event.sourceEvent && d3.event.sourceEvent.type === "zoom") return; // ignore brush-by-zoom
    if (d3.event.sourceEvent && d3.event.sourceEvent.type === "brush") return;

    var d0 = (d3.event.selection || wsConfig.timeScale.range()).map(wsConfig.timeScale.invert),
        d1 = d0.map(d3.timeMonth.round);
    // If empty when rounded, use floor instead.
    if (d1[0] >= d1[1]) {
        d1[0] = d3.timeMonth.floor(d0[0]);
        d1[1] = d3.timeMonth.offset(d1[0]);
    }
    updateAxisX(d1);
    hightlightWS(d1);
    //wssvg.selectAll(".handle--custom").attr("display", null).attr("transform", function(d, i) { return "translate(" + d0[i] + "," + wsConfig.heightG() / 20 + ")"; });
    if (d3.event.sourceEvent && (d3.event.sourceEvent.type === "mouseup"||d3.event.sourceEvent.type === "touchend")){

        filterConfig.time = d1.map(wsConfig.time2index);
        d3.select('.cover').classed('hidden',false);
        let temp = d3.event.target;
        setTimeout(()=> {
            recall();
            d3.select(this).call(temp.move, d1.map(wsConfig.timeScale));
        },0);

    }
    function updateAxisX(d1){
        wssvg.xAxis.tickValues(d3.merge([wsConfig.timeScale.ticks(),d1]));
        wssvg.select('.axis--x') .call(wssvg.xAxis);
    }
    //
    // let s = d3.event.selection || wsConfig.timeScale.range();
    // let range = s.map(wsConfig.timeScale.invert, wsConfig.timeScale);
}


function filterTop(dataR){
    let data =[];
    let topkeys = [];
    let nettemp = d3.nest()
        .key(d=>d.topic).sortValues(d=>d.timestep)
        .key(function(d) { return d.timestep; })
            .entries(dataR);
    filterConfig.limitSudden = 0;
    nettemp.forEach(c=>{
        c.values=c.values.slice(filterConfig.time[0],filterConfig.time[1]);
        filterConfig.limitSudden = d3.mean([filterConfig.limitSudden,d3.max(c.values,d=>(d3.max(d.values,e=>e.df)))]);
    });
    filterConfig.limitSudden = filterConfig.limitSudden*0.25;
    nettemp.forEach(c=>{
        c.values.forEach(t=>{
            t.values.sort((a,b)=>(b.df-a.df));
            topkeys = d3.merge([topkeys,t.values.slice(0,filterConfig.maxevent).filter(d=>d.df>filterConfig.limitSudden).map(it=>it)]);
        });
    });
    topkeys.sort((a,b)=>a.df-b.df);
    d3.nest()
        .key(d=>d.key).entries(topkeys).slice(0,filterConfig.maxeventAll).forEach(d=>{
        nettemp.forEach(c=>{
            c.values.forEach(t=>{
                let ins = t.values.find(e=>e.key===d.key);
                if (ins != undefined)
                    data.push(t.values.find(e=>e.key===d.key));
            });
        });
    });
    return data;
}
function callSum(){
    sumnet =[];
        let nest = d3.nest()
            .key(d=>d.topic)
            .key(function(d) { return d.timestep; })
            .entries(data);
        nest.forEach(d=>{
            let sumnetit={};
            sumnetit.key = d.key;
            sumnetit.values = [];
            d.values.forEach((n,i)=>{
                let currentMean = d3.mean(n.values,m=>m.f);
                sumnetit.values.push({f: currentMean, df: d3.mean(n.values,m=>m.df),timestep:i});
            });
            sumnet.push(sumnetit);
        });
    nestbyKey = d3.nest()
        .key(function(d) { return d.key; }).sortKeys(function(a,b) { return a.timestep-b.timestep})
        .entries(data);
    scaleX = d3.scaleSymlog().domain(d3.extent(data,d=>d.f)).range([0,1]);
    // scaleX = d3.scaleLinear().domain(d3.extent(data,d=>d.f)).range([0,1]);
    //scaleY = d3.scaleSymlog().domain(d3.extent(data,d=>d.df)).range([0,1]);
    scaleY = d3.scaleSymlog().domain(d3.extent(data,d=>d.df)).range([0,1]);
    // scaleY = d3.scaleLinear().domain(d3.extent(data,d=>d.df)).range([0,1]);
    nestbyKey.forEach(key => {
        key.gap = integration (key.values.map(d=>normalize(d)),sumnet.find(d=>d.key===nestbyKey[0].values[0].topic).values.map(d=>normalize(d)));
    });
}


function initNetgap(){
    netConfig.margin = ({top: 0, right: 0, bottom: 0, left: 0});
    netConfig.width = widthSvg;
    netConfig.height = heightSvg;
    netsvg
    //     .attrs({
    //     // viewBox:  [-widthSvg*scalezoom / 2, -heightSvg*scalezoom / 2, widthSvg*scalezoom, heightSvg*scalezoom],
    //     viewBox:  [0,0, netConfig.widthView(), netConfig.heightView()],
    //     preserveAspectRatio:"xMidYMid meet"
    // })
        .attrs({
        width: netConfig.width,
        height: netConfig.height,
        // overflow: "visible",

    });
    const netsvgG = netsvg.append("g")
        .attr('class','graph')
        .attr('transform',`translate(${netConfig.margin.left},${netConfig.margin.top})`);

    netsvgG.append("g")
        .attr("stroke", "#999")
        .attr("stroke-opacity", 0.9)
        .attr("stroke-width", 1)
        .attr('class','linkgroup');
    netConfig.g = netsvgG ;
    function zoomed() {
        netConfig.g.attr("transform", d3.event.transform);
    }
    var zoom = d3.zoom()
        .scaleExtent([1/netConfig.scalezoom, 40])
        //.translateExtent([[-netConfig.width/2,-netConfig.height/2], [netConfig.width*1.5,netConfig.height*1.5]])
        .on("zoom", zoomed);
    netsvg.call(zoom);
    netsvg.call(tip);
    zoom.scaleTo(netsvg, 1/netConfig.scalezoom);
    netsvg.call(zoom   .translateTo, netConfig.widthG() / 2,netConfig.heightG() / 2);
    netConfig.scalerevse = d3.scalePow().exponent(5).range([netConfig.colider()*1.5,netConfig.colider()*20]);
    netConfig.invertscale =  d3.scalePow().exponent(5).range([0.8,0.1]);
    netConfig.simulation = d3.forceSimulation(netConfig.nodes)
        .force("link", d3.forceLink(netConfig.links).id(d => d.id).distance(d=>netConfig.scalerevse(d.value)).strength(d=>netConfig.invertscale(d.value)))
        // .force("link", d3.forceLink(netConfig.links).id(d => d.id).distance(d=>netConfig.scalerevse(d.value)).strength(d=>netConfig.invertscale(d.value)))
        .force("charge", d3.forceManyBody().distanceMax(netConfig.colider()*50)
            .distanceMin(netConfig.colider()*1.5))//.strength(-3))
        .force('collision',d3.forceCollide().radius(netConfig.colider()))
        //.force("cluster", forceCluster)
        .force("center", d3.forceCenter(netConfig.widthG() / 2, netConfig.heightG() / 2))
        .on("tick", () => {
            netConfig.link
            .attr("x1", d => d.source.x)
            .attr("y1", d => d.source.y)
            .attr("x2", d => d.target.x)
            .attr("y2", d => d.target.y);

            netConfig.node
            .attr("transform", d=>{

                // d.x = Math.max(netConfig.width/10, Math.min(netConfig.widthG() - netConfig.width/5, d.x));
                // d.y = Math.max(netConfig.height/10, Math.min(netConfig.heightG() - netConfig.height/5, d.y));
                let smallgaph = netConfig.smallgrapSize();
                d.x = Math.max(smallgaph, Math.min(netConfig.widthG() - smallgaph/2, d.x));
                d.y = Math.max(smallgaph, Math.min(netConfig.heightG() - smallgaph/2, d.y));
                return `translate(${d.x},${d.y-smallgaph})`});
                //return `translate(${d.x- netConfig.width/10},${d.y- netConfig.height/10})`});
    });


}

function drawNetgapHuff(nodenLink){

    netConfig.simulation.stop();

    let widthNet= netConfig.widthG();
    let heightNet= netConfig.heightG();

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
    let q1 = d3.quantile(nodenLink.links.map(d=>d.value).sort((a,b)=>a-b),0.25);
    let q3 = d3.quantile(nodenLink.links.map(d=>d.value).sort((a,b)=>a-b),0.75);
    filterConfig.scalevalueLimit = (q1- (q3-q1)*1.5);
    filterConfig.scalevalueLimit = q1;
    // const links = cutbyThreshold(d3.mean(nodenLink.links,d=>d.value)*filterConfig.scalevalueLimit, 10).map(d => Object.create(d));
    const links = cutbyThreshold(filterConfig.scalevalueLimit, filterConfig.limitconnect).map(d => Object.create(d));
    const nodes = nodenLink.nodes.map(d => {
        let temp = Object.create(d);
        temp.key = d.id;
        temp.gap = d.value;
        temp.text = d.extra.text;
        temp.topic = d.extra.topic;
        return temp;
    });
    // const scalerevse = d3.scaleLinear().domain(d3.extent(links,d=>d.value)).range([1,200]);
    // const scalerevse = d3.scalePow().exponent(10).domain(d3.extent(links,d=>d.value)).range([0,100]);
    // const invertscale =  d3.scalePow().exponent(10).domain(d3.extent(links,d=>d.value)).range([1,0.2]);

    netConfig.scalerevse.domain(d3.extent(links,d=>d.value));
    netConfig.invertscale.domain(d3.extent(nodes,d=>d.value));
    let fontscale = d3.scaleLog().domain(d3.extent(nodenLink.nodes, d=>d3.mean(d.values,e=>e.values[0].f))).range(netConfig.fontRange);
    // netConfig.simulation.nodes(nodes);
    // netConfig.simulation.force("link").links(links);
        // .force("link", d3.forceLink(links).id(d => d.id).distance(d=>scalerevse(d.value)).strength(d=>invertscale(d.value)));
        // .force("link", d3.forceLink(links).id(d => d.id).distance(d=>scalerevse(d.value)).strength(1))

    // .force("x", d3.forceX())
    // .force("y", d3.forceY());

    const netsvgG = netConfig.g;

    netConfig.link = netsvgG.select('.linkgroup')
        .selectAll(".linkGap")
        .data(links).join("line")
        // .enter().append("line")
        .attr("class","linkGap")
        .attr("stroke", 'black')
        .attr("stroke-width", d => Math.sqrt(Math.sqrt(d.value)));


    // DATA JOIN
    // Join new data with old elements, if any.
    netConfig.node = netsvgG
        .selectAll(".linkLineg")
        .data(nodes);
    // UPDATE
    // Update old elements as needed.
    netConfig.node
        .attr('id',(d,i)=>'mini'+nodes[i].key)
        .style('pointer-events','auto');
    // ENTER
    // Create new elements as needed.
    //
    // ENTER + UPDATE
    // After merging the entered elements with the update selection,
    // apply operations to both.
    let newnodes = netConfig.node
        .enter().append('g')
        .attr('class','linkLineg')
        .attr('id',(d,i)=>'mini'+nodes[i].key)
        .style('pointer-events','auto');
    // EXIT
    // Remove old elements as needed.
    netConfig.node.exit().remove();


    netConfig.node.select('path')
        .style('stroke',d=>
            color(d.topic))
        .datum(d=>d.values)
        .call(d=>lineConnect(d,1))
        .attr('stroke-width',0.5);

    let newsvg = newnodes.append('svg')
        .attrs({
            x:0,
            y:0,
            width: netConfig.smallgrapSize(),
            height: netConfig.smallgrapSize()
        });

    newsvg.append('path')
        .style('stroke',d=>
            color(d.topic))
        .datum(d=>d.values)
        .call(d=>lineConnect(d,1))
        .attr('stroke-width',0.5);
    newsvg.append("title");
    newnodes.append("text");

    netConfig.node = netsvgG
        .selectAll(".linkLineg");

    netConfig.node.select("title")
        .text(d => d.id);

    netConfig.node.select("text")
        .text(d => d.text)
        .attrs({
            x:0,
            y:netConfig.smallgrapSize(),
            dy: ".71em"
        }).style('font-size',d=>fontscale(d3.mean(d.values,e=>e.values[0].f)));

    // netConfig.node.select('path')
    netConfig.node
        .style('pointer-events','auto')
        .on('mouseover',(dd)=>{
            let maxSudden = d3.max(dd.values,d=>d.values[0].df);
            let maxSuddenPoint = dd.values.find(d=>d.values[0].df===maxSudden);
            mouseoverHandel(maxSuddenPoint);
            netConfig.simulation.stop();
            netsvg.selectAll(".linkLineg").style('opacity',0.2);
            d3.select("#mini"+dd.key).style('opacity',1);
            d3.selectAll(".linkGap").style('stroke-opacity',0.1);
            let connect = d3.selectAll(".linkGap").filter(d=>d.source.key===dd.key||d.target.key===dd.key).style('stroke-opacity',1);
            connect.data().forEach(d=>{
                let id = "#mini"+(d.source.key!=dd.key?d.source.key:d.target.key);
                console.log(id);
                d3.select(id).style('opacity',1);
            });
            tip.show({values: [{key:dd.key,topic:dd.topic,text:dd.text, connect: connect.data()}]});})
        .on('mouseleave',(dd)=>{
            mouseleaveHandel();
            netConfig.simulation.alphaTarget(.5).restart()

            netsvg.selectAll(".linkLineg").style('opacity',1);
            netsvg.selectAll(".linkGap").style('stroke-opacity',0.5);
            tip.hide()})
        .call(dragForce(netConfig.simulation));






    // netConfig.node.nodes().forEach(d=>{
    //     let e= d3.select(d).select('path').node().getBBox();
    //     d.__data__.cwidth = e.x+e.width/2;
    //     d.__data__.cheight = e.y+e.height/2;
    // });
    netConfig.simulation.nodes(nodes);
    netConfig.simulation.force("link").links(links);
    netConfig.simulation.alphaTarget(.5).restart()
    //invalidation.then(() => simulation.stop());
}

function dragForce (simulation) {

    function dragstarted(d) {
        if (!d3.event.active) simulation.alphaTarget(.03).restart();
        d.fx = d.x;
        d.fy = d.y;
    }

    function dragged(d) {
        d.fx = d3.event.x;
        d.fy = d3.event.y;
    }

    function dragended(d) {
        if (!d3.event.active) simulation.alphaTarget(.5);
        d.fx = null;
        d.fy = null;
    }

    return d3.drag()
        .on("start", dragstarted)
        .on("drag", dragged)
        .on("end", dragended);
}
function renderWS (data){
    const cal1 = new Date();
    // d3.selectAll(".wordStreamDiv").selectAll('svg').remove();
    // handledata(data);
    let TermwDay = d3.nest().key(d=>d.timestep)
        .key(d=>d.topic)
        .rollup(e=>{return e.filter(d=>d.f).map(d=> {
            return {
            frequency: Math.sqrt(d.f),
                sudden: d.df,
                text: d.text,
                topic: d.topic,
                data:d
        }})})
        .entries(data);

    TermwDay.forEach(t=>{
        t.words ={};
        t.values.forEach(d=>{
            t.words[d.key] = d.value;
        });
        delete t.values;
    });
    wsConfig.wstep = wsConfig.widthG()/TermwDay.length;
    const cal2 = new Date();
    console.log('Word Stream calculate time: '+(cal2-cal1));
    // parse the date / time

    var configwc = {width: wsConfig.widthG(),height: wsConfig.heightG()};
    myWordCloud = wordCloud('.wsArea',configwc);

    myWordCloud.update(TermwDay);

}

function hightlightWS(d1){
    d3.selectAll('.stext')
        .classed('disableWord',false)
        .filter(d=> {
            let cT = d.data.timestep;
            let TR = d1||filterConfig.time.map(wsConfig.time2index.invert);
            return (cT < TR[0]) || (cT > TR[1]); //in range time
        }).classed('disableWord',true);
}

function switchTheme(){
    if (this.value==="light"){
        this.value = "dark";
        this.text = "Light";
        d3.select('body').classed('light',false);
        return;
    }
    this.value = "light";
    this.text = "Dark";
    d3.select('body').classed('light',true);
    return
}