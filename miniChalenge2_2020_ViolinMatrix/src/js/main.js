$(document).ready(function(){
    init();
    readFile().then(handleData).then(update);
});

function init(){

}
function readFile(){
    return Promise.all([d3.csv(`src/data/${filepath}.csv`).then(d=>d.map(e=>(e.Score= (+e.Score),e))),
        d3.csv(`src/data/${filepath2}.csv`)])
}
function handleData(_dataRaw){
    let data = _dataRaw[0];
    let dataCorrected_raw = _dataRaw[1];
    if(labelLimit&&labelLimit.length){
        data=data.filter(d=>labelLimit.find(l=>l===d.Label));
        dataCorrected_raw=dataCorrected_raw.filter(d=>labelLimit.find(l=>l===d.Label));
    }
    let maxDist = 0;
    // let range = d3.extent(data,d=>d.Score);
    let range = [0,1];
    let nestData = d3.nest().key(d=>d['Person']).key(d=>d['Label']).rollup(d=>{
        d.summary = hist(d.map(e=>e.Score),range,d[0].Label);
        d.summary.q1=undefined;
        // d.summary.median=undefined;
        d.summary.data={Person: d[0].Person, Label : d[0].Label};

        let maxValue = d3.max(d.summary.arr,e=>e[1]);
        if(maxValue>maxDist)
            maxDist = maxValue;
        return d;
    }).entries(data);
    nestData.sort((a,b)=>+a.key-(+b.key));

    let maxSum = 0
    let nestByLabel = d3.nest().key(d=>d['Label']).rollup(d=>{
        d.summary = hist(d.map(e=>e.Score),range,d[0].Label);
        d.summary.data={Person: 'Total', Label : d[0].Label,q1:d.summary.q1,
            median:d.summary.median,mean:d.summary.mean};
        d.summary.q1=undefined;
        // d.summary.median=undefined;
        let maxValue = d3.max(d.summary.arr,e=>e[1]);
        if(maxValue>maxSum)
            maxSum = maxValue;
        return d;
    }).entries(data);
    nestByLabel.sort((a,b)=>a.value.summary.data.mean-b.value.summary.data.mean);
    nestByLabel.domain = [0,maxSum];
    const labelList = nestByLabel.map(d=>d.key);

    let nestByPerson = d3.nest().key(d=>d['Person']).rollup(d=>{
        d.summary = hist(d.map(e=>e.Score),range,d[0].Label);
        d.summary.data={Person: d[0].Person, Label : 'Total',q1:d.summary.q1,
            median:d.summary.median,mean:d.summary.mean};
        d.summary.q1=undefined;
        // d.summary.median=undefined;
        let maxValue = d3.max(d.summary.arr,e=>e[1]);
        if(maxValue>maxSum)
            maxSum = maxValue;
        return d;
    }).entries(data);
    nestByPerson.domain = [0,maxSum];
    nestByPerson.sort((a,b)=>a.value.summary.data.mean-b.value.summary.data.mean);
    const personList = nestByPerson.map(d=>d.key);
    let summary = {y:{domain:[0,maxDist/2]},x:{domain:range}};

    //dataCorrected
    let maxSum_corrected = 0;
    const dataCorrected =[];
    d3.nest().key(d=>d['Person']).key(d=>d['Label']).rollup(d=>{
        d.summary={Person:d[0].Person,Label:d[0].Label,value: d.length}//_.uniq(d.map(d=>d.Image)).length};
        let maxValue = d.summary.value;
        if(maxValue>maxSum_corrected)
            maxSum_corrected = maxValue;
        dataCorrected.push(d);
    }).entries(dataCorrected_raw);
    console.log(maxSum_corrected)
    let maxSumSum_corrected = 0;
    d3.nest().key(d=>d['Person']).rollup(d=>{
        d.summary={Person:d[0].Person,Label:'Total',value: d.length};
        let maxValue = d.length;
        if(maxValue>maxSumSum_corrected)
            maxSumSum_corrected = maxValue;
        dataCorrected.push(d);
    }).entries(dataCorrected_raw);
    d3.nest().key(d=>d['Label']).rollup(d=>{
        d.summary={Person:'Total',Label:d[0].Label,value: d.length};
        let maxValue = d.length;
        if(maxValue>maxSumSum_corrected)
            maxSumSum_corrected = maxValue;
        dataCorrected.push(d);
        if(!labelList.find(l=>l===d[0].Label))
            labelList.push(d[0].Label)
    }).entries(dataCorrected_raw);
    dataCorrected.domain={general:[0,maxSum_corrected],summary:[0,maxSumSum_corrected]};

    personList.push('Total');
    labelList.push('Total');
    return {nestData,nestByLabel,nestByPerson,personList,labelList,dataCorrected,summary};
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
            .thresholds(x.ticks(10))    // Important: how many bins approx are going to be made? It is the 'resolution' of the violin plot
            .value(d => d);
        let hisdata = histogram(d);

        let sumstat = hisdata.map((d,i)=>[d.x0+(d.x1-d.x0)/2,(d||[]).length]);
        r = {
            axis: key,
            q1: ss.quantileSorted(d,0.25) ,
            q3: ss.quantileSorted(d,0.75),
            median: ss.medianSorted(d) ,
            mean: ss.mean(d) ,
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
            mean: undefined ,
            outlier: [],
            arr: []};
    }
    return r;
}
function update({nestData,nestByLabel,nestByPerson,personList,labelList,dataCorrected,summary}){
    isFreeze= false;
    graphicopt.width = document.getElementById('violinMatrixHolder').getBoundingClientRect().width;
    graphicopt.height = document.getElementById('violinMatrixHolder').getBoundingClientRect().height;
    let svg_ = d3.select('#violinMatrix_svg')
        .attr("width", graphicopt.width)
        .attr("height", graphicopt.height)
    let svg = svg_
        .select("g.content");
    let isfirst = false;
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
            .style('clip-path','url(#rectHolder)');
        isfirst = true;
    }

    graphicopt.el = svg;
    let radio = nestData.length/nestByLabel.length
    const width = Math.min(graphicopt.widthG()/radio,graphicopt.heightG());
    const xList = personList;
    let x = d3.scaleBand()
        .range([0, graphicopt.widthG()])
        .paddingInner(0.01)
        .paddingOuter(0.5)
        .domain(xList);
    const yList = labelList;
    let y = d3.scaleBand()
        .range([graphicopt.heightG(),0])
        .paddingInner(0.01)
        .domain(yList);
    let violiin_chart = d3.viiolinChart().graphicopt({width:x.bandwidth(),height:y.bandwidth(),
        margin: {top: 0, right: 0, bottom: 0, left: 0},
        middleAxis:{'stroke-width':0},
        ticks:{'stroke-width':0.5},
        customrange:summary.x.domain,
        opt:{dataformated:true},
        tick:{visibile:false}});
    violiin_chart.rangeY(summary.y.domain).distributionScale('Sqrt');

    let data = _.flatten(nestData.map(d=>d.values.map(d=>d.value.summary)));
    nestByPerson.forEach(n=>data.push(n.value.summary));
    nestByLabel.forEach(n=>data.push(n.value.summary));

    let person_g = svg.selectAll('g.violin')
        .data(data);
    person_g.exit().remove();
    person_g = person_g.enter().append('g')
        .attr('class','violin').merge(person_g);
    person_g
        .attr('transform',d=>`translate(${x(d.data.Person)},${y(d.data.Label)})`)
        .each(function(d){
            setTimeout(()=>{
                if (d.data.Person!=='Total' && d.data.Label!=='Total') {
                    d3.select(this).classed('total',false);
                    violiin_chart.rangeY(summary.y.domain).data([d]).draw(d3.select(this))
                }else if (d.data.Person==='Total') {
                    d3.select(this).classed('total',true);
                    violiin_chart.rangeY(nestByPerson.domain).data([d]).draw(d3.select(this))
                }else {
                    d3.select(this).classed('total',true);
                    violiin_chart.rangeY(nestByLabel.domain).data([d]).draw(d3.select(this))
                }
            },0);
        });


    const scaleCorredted = d3.scaleLinear().range([0,y.bandwidth()]);
    const corrected = svg.selectAll('g.corrected')
        .data(dataCorrected)
        .call(updateCorrected);

    corrected.exit().remove();
    const corrected_n = corrected.enter().append('g')
        .attr('class','corrected');
    corrected_n.append('rect').style('fill','none').style('stroke','green');
    corrected_n.append('text');
    corrected_n.call(updateCorrected);
    function updateCorrected(p){
        p.attr('transform',d=>{
            let y_value = y(d.summary.Label);
            if (d.summary.Label!=='Total'&&d.summary.Person!=='Total')
                y_value+= y.bandwidth()/2-scaleCorredted.domain(dataCorrected.domain.general)(d.summary.value)/2;
            else
                y_value+= y.bandwidth()/2-scaleCorredted.domain(dataCorrected.domain.summary)(d.summary.value)/2;
            return `translate(${x(d.summary.Person)},${y_value})`});
        p.select('text').text(d=>d.summary.value)
        p.select('rect')
            .attr('width',x.bandwidth())
            .attr('height',d=>{
                if (d.summary.Label!=='Total'&&d.summary.Person!=='Total')
                    return scaleCorredted.domain(dataCorrected.domain.general)(d.summary.value);
                else
                    return scaleCorredted.domain(dataCorrected.domain.summary)(d.summary.value)
            });
        return p;
    }


    let axis = svg_.select('g.axis');
    if (axis.empty()){
        axis = svg_.append('g')
            .attr('class','axis')
            // .attr('transform',`translate(${graphicopt.margin.left},${graphicopt.margin.top})`);
        axis
            .append('rect')
            .attr('fill','white')
            .attr('y',graphicopt.heightG())
            .attr('width',graphicopt.width)
            .attr('height',graphicopt.margin.bottom);
        axis.append('g')
            .attr('class','Xaxis')
            .attr('transform',`translate(0,${graphicopt.heightG()})`);
        axis
            .append('rect')
            .attr('fill','white')
            .attr('width',graphicopt.margin.left)
            .attr('height',graphicopt.height);
        axis.append('g')
            .attr('class','Yaxis');
    }
    var xAxis = d3.axisBottom(x);

    var yAxis = d3.axisLeft(y);
    gX = axis.select('g.Xaxis');
    gX.call(d3.axisBottom(x));
    gY = axis.select('g.Yaxis').attr('transform',`translate(${graphicopt.margin.left},0)`);
    gY.call(d3.axisLeft(y));
    d3.select('#close').on('click',()=>triggerImages(false))
    if (isfirst)
        svg.call(graphicopt.zoom.transform, d3.zoomIdentity);
    function zoomed(){
        svg.attr("transform", d3.event.transform);
        x.range([0, graphicopt.widthG()].map(d => d3.event.transform.applyX(d)));
        y.range([graphicopt.heightG(),0].map(d => d3.event.transform.applyY(d)));
        // person_g
        //     .attr('transform',d=>`translate(${x(d.data.Person)},${y(d.data.Label)})`)
        //
        gX.call(xAxis);
        gY.call(yAxis).selectAll('g.tick').on('click',onclicklabel);
    }
    function onclicklabel(d){
        triggerImages(true,d);
    }

    function triggerImages(istrigger,label){
        d3.select('#close').classed('hide',!istrigger);
        if (istrigger){
            svg.call(graphicopt.zoom.transform, d3.zoomIdentity);
            svg.selectAll('g.violin').style('display','none');
            svg.selectAll('g.corrected').style('display','none');
            let stackUser ={};
            const _data = d3.nest().key(d=>d.Image)
                .rollup(d=>{
                    if (stackUser[d[0].Person]===undefined)
                        stackUser[d[0].Person] = 0;
                    else
                        stackUser[d[0].Person]++;
                    d.imageIndex = stackUser[d[0].Person];
                    return d;
                })
                .entries(dataCorrected.find(d=>d.summary.Label===label && d.summary.Person==='Total'));

            x.domain(d3.keys(stackUser).sort((b,a)=>stackUser[b]-stackUser[a]));
            gX.call(xAxis);
            gY.style('display','none');
            const gimage = svg.selectAll('g.image').data(_data).enter()
                .append('g')
                .attr('class','image')
                .attr('transform',d=>`translate(${x(d.value[0].Person)-d3.zoomIdentity.x},${x.bandwidth()*4/3*(d.value.imageIndex)})`);
            gimage
                .append('image')
                .attr('width',x.bandwidth())
                .attr('href',d=>`../miniChalenge2_2020_TimeArc/src/data/MC2-Image-Data/Person${d.value[0].Person}/${d.key}.jpg`);
        }
        else{
            x.domain(xList);
            gX.call(xAxis);
            gY.style('display',null);
            svg.selectAll('g.image').remove();
            svg.selectAll('g.violin').style('display',null);
            svg.selectAll('g.corrected').style('display',null);
        }
    }
}

