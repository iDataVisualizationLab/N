let widthSvg = 1000;//document.getElementById("mainPlot").clientWidth-101;
let heightSvg = 800;
let margin = ({top: 20, right: 50, bottom: 50, left: 50});



//dataprt

let service_part =0;

let currentColor ="black";
const wssvg = d3.select("#WScontent"),
    netsvg = d3.select("#networkcontent");
let x,y,color,brush,legendScale,scaleX,scaleY;

let filterConfig = {
    time: [undefined,undefined],
    maxevent : 20,
    limitSudden : 15,
    limitconnect : 40,
    scalevalueLimit:0.5
};
let wsConfig ={
    g:{},
    margin: {top: 5, right: 20, bottom: 20, left: 5},
    width: widthSvg,
    height: 300,
    widthG: function(){return this.width-this.margin.left-this.margin.right},
    heightG: function(){return this.height-this.margin.top-this.margin.bottom},
};
let netConfig ={
    g:{},
    margin: {top: 5, right: 20, bottom: 20, left: 5},
    scalezoom: 1.5,
    width: widthSvg,
    height: heightSvg,
    widthView: function(){return this.width*this.scalezoom},
    heightView: function(){return this.height*this.scalezoom},
    widthG: function(){return this.widthView()-this.margin.left-this.margin.right},
    heightG: function(){return this.heightView()-this.margin.top-this.margin.bottom},
    colider: function() {return this.smallgrapSize()/4},
    ratiograph: 20,
    smallgrapSize: function(d){return this.width/this.ratiograph}
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



init();






function init(){


    readData().then((d)=>{
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
        initWS ();
        drawWS();
        nodenLink = callgapsall(data,filterConfig.limitconnect);
        //initNetgap();
        drawNetgapHuff(nodenLink,isColorMatchCategory);

    });

}
function recall (){
    data = filterTop(dataRaw);
    callSum();
    drawWS();
    nodenLink = callgapsall(data,filterConfig.limitconnect);
    //initNetgap();
    drawNetgapHuff(nodenLink,isColorMatchCategory);
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



    wsConfig.timeScale = d3.scaleTime()
        .rangeRound([margin.left, widthSvg - margin.right]);
    brush = d3.brushX()
        .extent([[0, 0], [wsConfig.widthG(), wsConfig.heightG()]])
        .on("brush end", brushedTime);
    wssvg.xAxis = d3.axisBottom(wsConfig.timeScale)
        // .ticks(d3.timeMonth)
        // .tickPadding(0);
    wssvg.select('.axis').append('g')
        .attr('class','axis--x')
        .attr("transform", "translate(0," + wsConfig.heightG() + ")")
        .call(wssvg.xAxis);
    wssvg.g.append("g")
        .attr("class", "brush")
        .call(brush);
}

function drawWS(){
    wsConfig.timeScale.domain(d3.extent(data, function(d) { return d.timestep; }));
    wssvg.select('.axis--x').call(wssvg.xAxis);
    wssvg.g.select('.brush').call(brush.move, wsConfig.timeScale.range());
}

function brushedTime (){
    console.log(d3.event.sourceEvent!=null?d3.event.sourceEvent.type:"nope!!")
    if (d3.event.sourceEvent && d3.event.sourceEvent.type === "zoom") return; // ignore brush-by-zoom
    if (d3.event.sourceEvent && d3.event.sourceEvent.type === "brush") return;
    if (d3.event.sourceEvent && d3.event.sourceEvent.type === "mouseup"){
        var d0 = (d3.event.selection || wsConfig.timeScale.range()).map(wsConfig.timeScale.invert),
            d1 = d0.map(d3.timeMonth.round);
        // If empty when rounded, use floor instead.
        if (d1[0] >= d1[1]) {
            d1[0] = d3.timeMonth.floor(d0[0]);
            d1[1] = d3.timeMonth.offset(d1[0]);
        }
        var timerang1 =d1.map(wsConfig.time2index);
        // console.log(~~(d0[0]-d1[0])+~~( d0[1]-d1[1]));
        console.log(filterConfig.time);
        console.log(timerang1);
        console.log((filterConfig.time[0]===timerang1[0])&&(filterConfig.time[1]===timerang1[1]));
        // if ((filterConfig.time[0]===timerang1[0])&&(filterConfig.time[1]===timerang1[1])) return;
        filterConfig.time = d1.map(wsConfig.time2index);

        recall ();
        d3.select(this).call(d3.event.target.move, d1.map(wsConfig.timeScale));

        return;
    };

    //
    // let s = d3.event.selection || wsConfig.timeScale.range();
    // let range = s.map(wsConfig.timeScale.invert, wsConfig.timeScale);
}


function filterTop(dataR){
    let data =[];
    let topkeys = [];
    let nettemp = d3.nest()
        .key(d=>d.topic)
        .key(function(d) { return d.timestep; }).sortKeys(d3.ascending)
            .entries(dataR);
    nettemp.forEach(c=>{
        c.values=c.values.slice(filterConfig.time[0],filterConfig.time[1]);
        c.values.forEach(t=>{
            t.values.sort((a,b)=>(b.df-a.df));
            topkeys = d3.merge([topkeys,t.values.slice(0,filterConfig.maxevent).filter(d=>d.df>filterConfig.limitSudden).map(it=>it.key)]);
        });
    });
    d3.nest()
        .key(d=>d).entries(topkeys).forEach(d=>{
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
    scaleY = d3.scaleSymlog().domain(d3.extent(data,d=>d.df)).range([0,1]);
    // scaleY = d3.scaleLinear().domain(d3.extent(data,d=>d.df)).range([0,1]);
    nestbyKey.forEach(key => {
        // let gap = 0;
        // key.values.forEach((t,i)=>{
        //     gap += distance([t.f,t.df],[sumnet[i].f,sumnet[i].df]);
        // })
        key.gap = integration (key.values.map(d=>normalize(d)),sumnet.find(d=>d.key===nestbyKey[0].values[0].topic).values.map(d=>normalize(d)));
    });
}
function initNetgap(){
    netConfig.margin = ({top: 5, right: 20, bottom: 20, left: 5});
    netConfig.scalezoom = 1.5;
    netConfig.width = widthSvg;
    netConfig.height = heightSvg;
    netsvg.attrs({
        // viewBox:  [-widthSvg*scalezoom / 2, -heightSvg*scalezoom / 2, widthSvg*scalezoom, heightSvg*scalezoom],
        viewBox:  [0,0, netConfig.widthView(), netConfig.heightView()],
        preserveAspectRatio:"xMidYMid meet"
    }).attrs({
        width: netConfig.width,
        height: netConfig.height,
        // overflow: "visible",

    });
    const netsvgG = netsvg.append("g")
        .attr('class','graph')
        .attr('transform',`translate(${netConfig.margin.left},${netConfig.margin.top})`);

    netsvgG.append("g")
        .attr("stroke", "#999")
        .attr("stroke-opacity", 0.3)
        .attr('class','linkgroup');
    netConfig.g = netsvgG ;
    function zoomed() {
        netConfig.g.attr("transform", d3.event.transform);
    }
    var zoom = d3.zoom()
        .scaleExtent([1, 40])
        .translateExtent([[netConfig.margin.left,netConfig.margin.top], [netConfig.width+netConfig.margin.left,netConfig.height+netConfig.margin.top]])
        .on("zoom", zoomed);
    netsvg.call(zoom);
    netsvg.call(tip);

    netConfig.scalerevse = d3.scalePow().exponent(5).range([netConfig.colider()*1.5,netConfig.colider()*10]);
    netConfig.invertscale =  d3.scalePow().exponent(5).range([0.8,0.2]);
    netConfig.simulation = d3.forceSimulation(netConfig.nodes)
        .force("link", d3.forceLink(netConfig.links).id(d => d.id).distance(d=>netConfig.scalerevse(d.value)).strength(d=>0.1))
        // .force("link", d3.forceLink(netConfig.links).id(d => d.id).distance(d=>netConfig.scalerevse(d.value)).strength(d=>netConfig.invertscale(d.value)))
        .force("charge", d3.forceManyBody().strength(-3))//.strength(-3))
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
    function forceCluster(alpha) {
        for (var i = 0, n = nodes.length, node, cluster, k = alpha * 1; i < n; ++i) {
            node = nodes[i];
            cluster = clusters[node.cluster];
            node.vx -= (node.x - cluster.x) * k;
            node.vy -= (node.y - cluster.y) * k;
        }
    }

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

    const links = cutbyThreshold(d3.mean(nodenLink.links,d=>d.value)*filterConfig.scalevalueLimit, 10).map(d => Object.create(d));
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
        .attr("stroke-width", d => Math.sqrt(d.value));


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

    newnodes.append('rect')
        .attrs({
            x:0,
            y:0,
            width: netConfig.smallgrapSize(),
            height: netConfig.smallgrapSize()
        })
        // .style('fill','#7ee6e6')
        .style('fill','none')
        .style('opacity',0.5);

    newnodes.append('path')
        .style('stroke',d=>
            color(d.topic))
        .datum(d=>d.values)
        .call(d=>lineConnect(d,1))
        .attr('stroke-width',0.5);
    newnodes.append("title");
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
        });

    netConfig.node.select('path')

        .style('pointer-events','auto')
        .on('mouseover',(dd)=>{
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
        .on('mouseleave',(d)=>{
            netConfig.simulation.alphaTarget(.5).restart()

            netsvg.selectAll(".linkLineg").style('opacity',1);
            netsvg.selectAll(".linkGap").style('stroke-opacity',0.3);
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