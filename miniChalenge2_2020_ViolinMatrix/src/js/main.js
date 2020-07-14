$(document).ready(function(){
    init();
    readFile().then(handleDate).then(update);
});

function init(){

}
function readFile(){
    return d3.csv(`src/data/${filepath}.csv`).then(d=>d.map(e=>(e.Score= (+e.Score),e)))
}
function handleDate(data){
    let maxDist = 0;
    let range = d3.extent(data,d=>d.Score);
    let nestByPerson = d3.nest().key(d=>d['Person']).key(d=>d['Label']).rollup(d=>{
        d.summary = hist(d.map(e=>e.Score),range,d[0].Label);
        d.summary.q1=undefined;
        d.summary.median=undefined;
        d.summary.data={Person: d[0].Person, Label : d[0].Label};
        let maxValue = d3.max(d.summary.arr,e=>e[1]);
        if(maxValue>maxDist)
            maxDist = maxValue;
        return d;
    }).entries(data);
    nestByPerson.sort((a,b)=>+a.key-(+b.key))
    let nestByLabel = d3.nest().key(d=>d['Label']).entries(data);
    let summary = {y:{domain:[0,maxDist]},x:{domain:range}};
    return {nestByPerson,nestByLabel,summary};
}
function hist(d,range,key) {
    let outlierMultiply = 1.5;
    d=d.filter(e=>e!==undefined).sort((a,b)=>a-b);
    let r;
    if (d.length){
        var x = d3.scaleLinear()
            .domain(range);
        var histogram = d3.histogram()
            .domain(x.domain())
            .thresholds(x.ticks(20))    // Important: how many bins approx are going to be made? It is the 'resolution' of the violin plot
            .value(d => d);
        let hisdata = histogram(d);

        let sumstat = hisdata.map((d,i)=>[d.x0+(d.x1-d.x0)/2,(d||[]).length]);
        r = {
            axis: key,
            q1: ss.quantileSorted(d,0.25) ,
            q3: ss.quantileSorted(d,0.75),
            median: ss.medianSorted(d) ,
            // outlier: ,
            arr: sumstat};
        r.outlier = []
        // if (d.length>4)
        // {
        //     const iqr = r.q3-r.q1;
        //     r.outlier = _.unique(d.filter(e=>e>(r.q3+outlierMultiply*iqr)||e<(r.q1-outlierMultiply*iqr)));
        // }else{
        //     r.outlier =  _.unique(d);
        // }
    }else{
        r = {
            axis: key,
            q1: undefined ,
            q3: undefined,
            median: undefined ,
            outlier: [],
            arr: []};
    }
    return r;
}
function update({nestByPerson,nestByLabel,summary}){
    isFreeze= false;
    graphicopt.width = document.getElementById('violinMatrixHolder').getBoundingClientRect().width;
    graphicopt.height = document.getElementById('violinMatrixHolder').getBoundingClientRect().height;
    let svg_ = d3.select('#violinMatrix_svg')
        .attr("width", graphicopt.width)
        .attr("height", graphicopt.height)
        .style('overflow','visible');
    let svg = svg_
        .select("g.content");
    function zoomed(){
        svg.attr("transform", d3.event.transform);
    }
    if (svg.empty()){
        let startZoom = d3.zoomIdentity;
        startZoom.x = graphicopt.margin.left;
        startZoom.y = graphicopt.margin.top;
        svg = d3.select('#violinMatrix_svg')
            .call(graphicopt.zoom.on("zoom", zoomed))
            .attr("width", graphicopt.width)
            .attr("height", graphicopt.height)
            .append("g")
            .attr('class','content')
            .on('click',()=>{if (isFreeze){
                const func = isFreeze;
                isFreeze = false;
                func();
            }})
        svg.call(graphicopt.zoom.transform, d3.zoomIdentity);
    }

    graphicopt.el = svg;
    let radio = nestByPerson.length/nestByLabel.length
    const width = Math.min(graphicopt.widthG()/radio,graphicopt.heightG())
    let x = d3.scaleBand()
        .range([0, graphicopt.widthG()])
        .paddingInner(0.1)
        .paddingOuter(0.5)
        .domain(nestByPerson.map(d=>d.key));

    let y = d3.scaleBand()
        .range([graphicopt.heightG(),0])
        .paddingInner(0.1)
        .domain(nestByLabel.map(d=>d.key));
    console.log(x.bandwidth())
    let violiin_chart = d3.viiolinChart().graphicopt({width:x.bandwidth(),height:y.bandwidth(),
        margin: {top: 0, right: 0, bottom: 0, left: 0},
        middleAxis:{'stroke-width':0},
        ticks:{'stroke-width':0.5},
        customrange:summary.x.domain,
        opt:{dataformated:true},
        tick:{visibile:false}});
    violiin_chart.rangeY(summary.y.domain);

    let data = _.flatten(nestByPerson.map(d=>d.values.map(d=>d.value.summary)));

    let person_g = svg.selectAll('g.violin')
        .data(data);
    person_g
        .attr('transform',d=>`translate(${x(d.data.Person)},${y(d.data.Label)})`)
        .each(function(d){
            setTimeout(()=>{
                violiin_chart.data([d]).draw(d3.select(this))
            },0);
    });
    person_g.exit().remove();
    person_g.enter().append('g')
        .attr('class','violin')
        .attr('transform',d=>`translate(${x(d.data.Person)},${y(d.data.Label)})`)
        .each(function(d){
            setTimeout(()=>{
                violiin_chart.data([d]).draw(d3.select(this))
            },0);
        });

    let axis = svg_.select('g.axis');
    if (axis.empty()){
        axis = svg_.append('g')
            .attr('class','axis')
            .attr('transform',`translate(${graphicopt.margin.left},${graphicopt.margin.top})`);
        axis.append('g')
            .attr('class','Xaxis')
            .attr('transform',`translate(0,${graphicopt.heightG()})`);;
        axis.append('g')
            .attr('class','Yaxis');
    }
    axis.select('g.Xaxis').call(d3.axisBottom(x));
    axis.select('g.Yaxis').call(d3.axisLeft(y));
}
