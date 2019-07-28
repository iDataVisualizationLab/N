// Ngan - Jun 7 2019




d3.eventTimeLine = function () {
    let graphicopt = {
            margin: {top: 15, right: 0, bottom: 40, left: 0},
            width: 1000,
            height: 600,
            scalezoom: 10,
            widthView: function(){return this.width*this.scalezoom},
            heightView: function(){return this.height*this.scalezoom},
            widthG: function(){return this.widthView()-this.margin.left-this.margin.right},
            heightG: function(){return this.heightView()-this.margin.top-this.margin.bottom},
            dotRadius: 2,
            summary: {size:30},
            fitscreen:true
        },
        radaropt = {
            summary:{quantile:true,minmax:true},
            mini:true,
            levels:6,
            gradient:true,
            w:graphicopt.summary.size,
            h:graphicopt.summary.size,
            margin: {top: 0, right: 0, bottom: 0, left: 0},
        },
        option = {
            epsilon : 20, // epsilon is learning rate (10 = default)
            perplexity : 30, // roughly how many neighbors each point influences (30 = default)
            dim : 2, // dimensionality of the embedding (2 = default)
            maxtries: 50
        },
        runopt,
        axis,
        arr = [],arrIcon=[],
        isBusy = false,
        isStable = false;
        // tsne = new tsnejs.tSNE(graphicopt.opt);
        // tsne = new Worker ('src/scripts/worker/tSNEworker.js');
    let sizebox = 50;
    let maxlist = 20;
    let eventTimeLine ={};
    let svg, g,radarcreate,trackercreate,glowEffect,panel,rowMap,
        scaleX_small = d3.scaleLinear(),
        scaleY_small = d3.scaleLinear(),
        store={},
        ssscale = 1,
        tx = 0,
        ty =0;
    let needUpdate = false;
    let first = true;
    let returnEvent;
    let group_mode = "outlier";
    let annotations =[];
    //event register
    let mouseoverEvent, mouseleaveEvent;

    function updateSummary(data){
        // const data_new = dataRaw.Variables.map((s,si)=>{
        //     let dataarr = _.flatten(dataRaw.YearsDataTrue.map(d=>d['v'+si].map(e=>e/100)));
        //     return {axis:s, value: ss.mean(dataarr),origin: {mean: ss.mean(dataarr),q1: ss.min(dataarr),q3: ss.max(dataarr)}};
        // })


        const data_new = data.map((d,i)=>{return {axis:axis[i],value:d.mean,origin:d}});
        data_new.type = "statistics";
        RadarChart('.averageSUm',[data_new],{levels:6,w:graphicopt.summary.size,h:graphicopt.summary.size});
    }
    function updateRenderRanking(data) {
        var max = d3.max(d3.extent(d3.merge(d3.extent(data,d=>d3.extent(d3.merge(d))))).map(d=>Math.abs(d)));
        scaleX_small.domain([-max,max]);
        scaleY_small.domain([-max,max]);
        // console.log(data.top10);
        try {
            panel.select('.top10').selectAll('.top10_item').interrupt().selectAll("*").interrupt();
        }catch(e){
            console.log(e)
        }
        const dataTop = panel.select('.top10').selectAll('.top10_item')
            .data(data, d => d.name);
        // EXIT
        dataTop.exit()
            .interrupt().selectAll("*").interrupt();
        dataTop.exit()  .transition()
            .duration(Math.min(runopt.simDuration,500)/3)//Math.min(runopt.simDuration/50*(i+1),runopt.simDuration/20))
            .attr('transform', function (d) {
                return 'translate(40,' + getTransformation(d3.select(this).attr('transform')).translateY + ')'
            })
            .transition()
            .duration(Math.min(runopt.simDuration,500)/2)//Math.min(runopt.simDuration/50*(i+1),runopt.simDuration/20))
            .attr('transform', 'translate(40,' + (maxlist + 0.5) * sizebox + ")")
            .remove();
        // ENTER
        const newdiv = dataTop.enter().append("g")
            .attr('class',d=> 'top10_item '+fixstr(d.name));
        newdiv
            .attr('transform', 'translate(0,' + (maxlist + 0.5) * sizebox + ")")
            .style('opacity', 0)
            .transition('update')
            .duration((d, i) => Math.min(runopt.simDuration,500)/2)//Math.min(runopt.simDuration/50*(i+1),runopt.simDuration/20))
            .style('opacity', 1)
            .attr('transform', (d, i) => 'translate(0,' + (i + 0.5) * sizebox + ")");
        newdiv.append('rect').attrs(
            {class : 'detailDecoration',
                y: -(sizebox-2)/2,
                width: graphicopt.top10.width,
                height: sizebox-2,
            });
        newdiv.append("text").text(d => d.name).attr('x',4);
        const gDetail = newdiv.append("g")
            .attr('class','gd')
            .attr('transform', 'translate('+(graphicopt.eventpad.eventpadtotalwidth)+','+(-sizebox/2)+')')
            .datum(d=>d);
        gDetail.append("path")
            .attr("d",trackercreate)
            .styles(graphicopt.top10.details.path.style);
        gDetail.call(createDetailCircle);

        const gDetailc = newdiv.append("g")
            .attr('class','gc')
            // .attr('transform', 'translate('+(120+sizebox)+','+(-graphicopt.eventpad.size/2)+')')
            .attr('transform', 'translate('+(0)+','+(graphicopt.eventpad.size/2)+')')
            .datum(d=>d.clusterS);
        gDetailc.call(createClulsterPad);

        // UPDATE
        dataTop
            .transition()
            .duration((d, i) => runopt.simDuration/2)//Math.min(runopt.simDuration/50*(i+1),runopt.simDuration/20))
            .attr('transform', (d, i) => 'translate(0,' + (i + 0.5) * sizebox + ")");

        const gd = dataTop.select('.gd').datum(d=>d);
        gd.select("path")
            .attr("d",trackercreate);
        gd
            .call(createDetailCircle);
        const gc = dataTop.select('.gc').datum(d=>d.clusterS);
        gc
            .call(createClulsterPad);
    }
    function createDetailCircle (g){
        let newg = g.selectAll('circle').data(d=>d);
        newg.exit().remove();
        newg.classed('new',false);
        return newg.enter().append('circle')
            .classed('new',true)
            .attrs(graphicopt.top10.details.circle.attr)
            .styles(graphicopt.top10.details.circle.style)
            .merge(newg).attrs(d=> {return {
                cx:scaleX_small(d[0]),
                cy:scaleY_small(d[1]),}
            });
    }

    function createClulsterPad (g){
        try {
            g.selectAll('rect').interrupt().selectAll("*").interrupt();
        }catch(e){
            console.log(e)
        }
        let newg = g.selectAll('rect').data(d=>d,e=>e.timeStep);
        newg.exit()
            .transition()
            .duration(runopt.simDuration)
            .attr("transform", "scale(" + 0 + ")")
            .remove();
        newg.classed('new',false);
        return newg.enter().append('rect')
            .classed('new',true)
            .attrs(graphicopt.top10.details.clulster.attr)
            .styles(graphicopt.top10.details.clulster.style)
            .attr('x',(d,i)=>i*graphicopt.eventpad.size)
            .style('opacity',0)
            .on('mouseover',function(d){
                const name = this.parentNode.parentNode.__data__.name;
                svg.selectAll(".linkLineg").attr('opacity',0.2);
                svg.select(".linkLineg."+fixstr(name)).attr('opacity',1).style("filter", "url(#glowTSne)");
                // console.log(this.parentNode.parentNode.__data__.name)
            }).on('mouseleave',function(d){

                svg.selectAll(".linkLineg").attr('opacity',1).style("filter", null);

                // console.log(this.parentNode.parentNode.__data__.name)
            })
            .merge(newg)
            .style("fill",
                d=>{
                    return colorCategory(d.val)}
            )
            .transition()
            .duration(runopt.simDuration)
            .style('opacity',1)
            .attr('x',(d,i)=>i*graphicopt.eventpad.size);
    }
    let caltime;
    let geTopComand = _.once(eventTimeLine.getTop10);
    // tsne.addEventListener('message',({data})=>{
    //     switch (data.status) {
    //         case 'stable':
    //             isStable = true;
    //             geTopComand();
    //             isBusy = false;
    //             break;
    //         case 'done':
    //             isBusy = false;
    //             break;
    //     }
    //     switch (data.action) {
    //         case 'step':
    //             store.Y = data.result.solution;
    //             store.cost = data.result.cost;
    //             store.iteration = data.iteration;
    //             updateEmbedding(store.Y, store.cost,store.iteration);
    //             break;
    //
    //         case "updateTracker":
    //             updateRenderRanking(data.top10);
    //             // updateSummary(data.average);
    //             returnEvent.call("calDone",this, currentIndex);
    //             break;
    //         case 'cluster':
    //             updateCluster (data.result);
    //             break;
    //         case 'mean':
    //             updateSummary(data.val);
    //             break;
    //     }
    //
    // }, false);
    function reorderdata(data) {
        const NCluster = data[0].cluster.length;
        if (NCluster>graphicopt.eventpad.maxstack){
            const startpos = NCluster - graphicopt.eventpad.maxstack;
            data.forEach(d=>d.cluster = d.cluster.slice(startpos,NCluster));
        }
        return data;
    }
    function initradar (dim){
        // radar
        var total = dim,                 //The number of different axes
            angle1= Math.PI * 2 / total;

        angleSlice = [];
        for (var i=0;i<total;i++){
            angleSlice.push(angle1*i);
        }
        var rScale = d3.scaleLinear()
            .range([0,graphicopt.display.symbol.radius|| graphicopt.dotRadius])
            .domain([0, 1]);
        radarcreate = d3.radialLine()
            .curve(d3.curveCatmullRomClosed.alpha(0.5))
            .radius(function(d) { return rScale(d); })
            .angle(function(d,i) {  return angleSlice[i]; });
    }

    function UpdateGradient() {
        let rdef = svg.select('defs.gradient');
        let rg,rg2;
        if (rdef.empty()){
            rdef = svg.append("defs").attr('class','gradient')
            rg = rdef
                .append("radialGradient")
                .attr("id", "rGradient");
            rg2 = rdef.append("radialGradient")
                .attr("id", "rGradient2");
            rg2.selectAll('stop')
                .data(d3.range(0,101)).enter().append('stop')
                .attr('offset', function(d) { return d + '%'; })
                .attr('style', function(d) { return 'stop-color:' + 'black' + ';stop-opacity:' + (d/100); });
        }
        else {
            rg = rdef.select('#rGradient');
            rg2 = rdef.select('#rGradient2');
        }
        createGradient(rg,0);
        createGradient(rg2,1);
        function createGradient(rg,limitcolor) {
            rg.selectAll('stop').remove();
            const legntharrColor = arrColor.length - 1;
            rg.append("stop")
                .attr("offset", "0%")
                .attr("stop-opacity", 0);
            rg.append("stop")
                .attr("offset", (limitcolor - 1) / legntharrColor * 100 + "%")
                .attr("stop-color", arrColor[limitcolor])
                .attr("stop-opacity", 0);
            arrColor.forEach((d, i) => {
                if (i > (limitcolor - 1)) {
                    rg.append("stop")
                        .attr("offset", i / legntharrColor * 100 + "%")
                        .attr("stop-color", d)
                        .attr("stop-opacity", i / legntharrColor);
                    if (i != legntharrColor)
                        rg.append("stop")
                            .attr("offset", (i + 1) / legntharrColor * 100 + "%")
                            .attr("stop-color", arrColor[i + 1])
                            .attr("stop-opacity", i / legntharrColor);
                }
            });
        }
    }
    function UpdateGradientDensity() {
        let rdef = svg.select('defs.densitygradient');
        let rg;
        let rg2;
        if (rdef.empty()){
            rdef = svg.append("defs").attr('class','densitygradient')
            rg = rdef
                .append("linearGradient")
                .attr('gradientUnits', 'userSpaceOnUse')
                .attr('x1', 0).attr('y1', 0).attr('y2', 0)
                .attr("id", "lGradient");
            rg2 = rdef
                .append("linearGradient")
                .attr('x1', 0).attr('y1', 0).attr('y2', 0)
                .attr("id", "lGradient2");
            rg2.selectAll('stop')
                .data(d3.range(0,101)).enter().append('stop')
                .attr('offset', function(d) { return d + '%'; })
                .attr('style', function(d) { return 'stop-color:' + 'black' + ';stop-opacity:' + (d/100); });
        }
    }

    eventTimeLine.init = function(){
        // tsne.postMessage({action:"inittsne",value:option});


        svg.attrs({
            width: graphicopt.width,
            height: graphicopt.height,
            // overflow: "visible",

        });
        timescale.range([0,graphicopt.widthG()]);
        rowscale.range([0,graphicopt.heightG()]);
        // svg.style('visibility','hidden');
        // svg.append("defs").append("clipPath")
        //     .attr("id", "clip")
        //     .append("rect")
        //     .attr("width", graphicopt.widthG())
        //     .attr("height", graphicopt.heightG());
        // gradient

        UpdateGradientDensity();
        UpdateGradient();
        // END gradient
        glowEffect = svg.append('defs').append('filter').attr('id', 'glowTSne'),
            feGaussianBlur = glowEffect.append('feGaussianBlur').attr('stdDeviation', 2.5).attr('result', 'coloredBlur'),
            feMerge = glowEffect.append('feMerge'),
            feMergeNode_1 = feMerge.append('feMergeNode').attr('in', 'coloredBlur'),
            feMergeNode_2 = feMerge.append('feMergeNode').attr('in', 'SourceGraphic');

        g = svg.append("g")
            .attr('class','pannel')
            .attr('transform',`translate(${graphicopt.margin.left},${graphicopt.margin.top})`);
        g.append("g")
            .attr("class", "x gAxist grid")
            .attr("transform", "translate(0, 10)")
            .styles({
                'stroke-width':'0.1px',
                'stroke':'#ababab',
                'stroke-dasharray': 1
            });
        g.append("g")
            .attr("class", "x gAxis")
            .attr("transform", "translate(0, 10)");

        g.append("g")
            .attr("class", "y gAxis")
            .attr("transform", "translate(0, 10)");

        let colorLegend = g.append('g')
            .attr("class", "colorlegend")
            .attr("transform", "translate(20, 30)");
        colorLegend.append('text')
            .attrs({"class": "label",dy:'-1em'})
            .text('# reports:');
        colorLegend.append('rect')
            .attrs({"class": "colorbox",
                'width': 150,
                height: 20,
                'fill':'url(#lGradient2)',
            });
        colorLegend.append('g')
            .attr("class", "axistick")
            .attr("transform", "translate(0, 20)");

    };

    function updateCluster (data) {
        let group = g.selectAll('.linkLineg')
            .select('circle')
            .style("fill",
                (d,i)=>{
                    return colorCategory(data[d.name]===undefined?data[i].val:data[d.name])}
            );
    }

    function updateEmbedding(Y,cost,iteration,skiptransition) {
        d3.select("#subzone").select('.cost').text(cost.toFixed(2));
        d3.select("#subzone").select('.iteration').text(iteration);
        // get current solution
        // var Y = tsne.getSolution();
        // move the groups accordingly
        let group = g.selectAll('.linkLineg');
        if (skiptransition==true) {
            group
                .interrupt().attr("transform", function(d, i) {
                return "translate(" +
                    (Y[i][0]*runopt.zoom*ssscale+tx) + "," +
                    (Y[i][1]*runopt.zoom*ssscale+ty) + ")"; });
        }else{
            group.transition().duration(runopt.simDuration*1.1)
                .ease(d3.easeLinear)
                .attr("transform", function(d, i) {
                    return "translate(" +
                        (Y[i][0]*runopt.zoom*ssscale+tx) + "," +
                        (Y[i][1]*runopt.zoom*ssscale+ty) + ")"; });
        }
        //let curentHostpos = currenthost.node().getBoundingClientRect();


    }
    let currenthost = {};
    let currentIndex = 0;
    eventTimeLine.draw = function(){
        if (first){
            isBusy = false;
            isStable = false;
            // initradar (arr[0].length);
            eventTimeLine.redraw();
        }else {
            needUpdate = true;
            if (graphicopt.display.symbol.type ==='path') {
                drawEmbedding(arr);
            }
        }
    };

    eventTimeLine.getTop10  = function (){
        console.log(new Date() -caltime);
        tsne.postMessage({action:"updateTracker"});
        // clearInterval(intervalCalculate);
    };

    eventTimeLine.pause  = function (){
        if (intervalUI)
            clearInterval(intervalUI);
        // clearInterval(intervalCalculate);
    };

    eventTimeLine.resume  = function (){
        intervalUI = setInterval(graphicopt.step,10);
        // intervalCalculate = setInterval(updateData,2000);
    };

    eventTimeLine.redraw  = function (){
        // panel.classed("active",true);
        first = false;
        isBusy = true;
        isStable = false;
        // svg.style('visibility','visible');
        // tsne.postMessage({action:"group_mode",value:group_mode});
        // tsne.postMessage({action:"initDataRaw",value:arr});//.initDataRaw(arr);
        drawEmbedding(arr);
        // for (let  i =0; i<40;i++)
        //     tsne.step();
        // eventTimeLine.resume();
    };

    eventTimeLine.remove  = function (){
        if (!first){
            panel.classed("active",false);
            // svg.style('visibility','hidden');
            isBusy = true;
            isStable = false;
            eventTimeLine.pause();
            g.selectAll('*').remove();
        }
    };

    let colorCategory =d3.scaleOrdinal(d3.schemeCategory10);
    let colorScale =d3.scaleSequential(d3.interpolateSpectral);
    let meanArr=[];
    function distanace(a,b){
        let sum =0;
        a.forEach((d,i)=>sum+=(d-b[i])*(d-b[i]));
        return sum;
    }
    function updateData(){
        if (needUpdate) {
            // meanArr = arr[0].map((dd,i)=>d3.mean(arr.map(d=>d[i])));
            // console.log(meanArr);
            // arr.forEach(d=> d.gap = distanace(d,meanArr));
            tsne.updateData(arr);
            // colorScale.domain(d3.extent(arr,d=>d.gap).reverse());
            // g.selectAll('path').style('stroke',d=>colorScale(d.gap));
            needUpdate = false;
        }
    }


    function handledata(data){
        let arrN = [];
        data.forEach(e=>arrN.push(e.arr));
        radaropt.densityScale = d3.scaleLinear().domain(d3.extent(arrN,d=>d.density)).range([0,1]);
        // let desnsityScale = d3.scaleLinear().domain(d3.extent(arrN.filter(e=>e.loc==="all"),e=>e.density)).range(radaropt.densityScale.domain());
        // arrN.filter(e=>e.loc==="all").forEach(e=>{e.density_true = e.density;
        //     e.density = desnsityScale(e.density_true);
        // });
        Updatecolorlegend ();
        return arrN;
    }
    function handledataIcon(data){
        let arrN = [];
        data.forEach(e=>{
            e.arr.density_true = e.arr.density;
            arrN.push(e.arr);
        });
        // radaropt.densityScale = d3.scaleLinear().domain(d3.extent(arrN.filter(e=>e.loc!="20"),d=>d.density)).range([0.025,1]);
        return arrN;
    }
    function changeshape (){
        const selector = g.selectAll(".linkLineg");
        switch (graphicopt.display.symbol.type){
            case "path":
                selector.select('rect').style('display','block');
                selector.select('.tSNEborder').style('display','block');
                selector.select('circle').style('display','none');
                initradar (arr[0].length);
                break;
            case "circle":
                selector.select('rect').style('display','none');
                selector.select('.tSNEborder').style('display','none');
                selector.select('circle').style('display','block')
                    .attr("r",graphicopt.display.symbol.radius|| graphicopt.dotRadius);
                break;
        }

    }

    let timescale = d3.scaleTime().range([0, graphicopt.widthG()]);
    let rowscale = d3.scaleLinear().range([0, graphicopt.heightG()]);
    let timeFormat;
    function updatePosition() {
        let timerange = d3.extent(arr,d=>d.time);
        let time_axis = d3.axisTop();
        let width_needed = timeFormat.range(timerange[0],timerange[1]).length * radaropt.w;
        rowscale.range([0,radaropt.h]);
        if (graphicopt.fitscreen){
            svg.attrs({
                width: graphicopt.width,
                height: graphicopt.height,
            });
            timescale.range([0,graphicopt.widthG()]).domain(timerange);
            rowscale.range([0,graphicopt.heightG()/(_.unique(arr,d=>d.loc).length+2)]);
            time_axis = time_axis.ticks(graphicopt.widthG()/100);
        }else {
            let height_needed = (_.unique(arr,d=>d.loc).length+2) * radaropt.h;
            if (graphicopt.customheight){
                height_needed = graphicopt.customheight;
                rowscale.range([0,(graphicopt.customheight-graphicopt.margin.top-graphicopt.margin.bottom)/(_.unique(arr,d=>d.loc).length+2)]);
            }
            svg.attrs({
                width: width_needed+graphicopt.margin.left+graphicopt.margin.right,
                height: height_needed+graphicopt.margin.top+graphicopt.margin.bottom,
            });
            timescale.range([0, width_needed]).domain(timerange);
            time_axis = time_axis.ticks(width_needed/100);
        }
        time_axis = time_axis.scale(timescale);
        let timeAxis = g.select('.gAxis.x')
            .attr("transform", "translate("+(radaropt.w/2)+", "+rowscale(1)+")")
            .transition()
            .call(time_axis);
        let timeAxis2 = g.select('.gAxist.x')
            .attr("transform", "translate("+(radaropt.w/2)+", "+rowscale(1)+")")
            .transition()
            .call(time_axis.tickFormat("").tickSize(-(svg.attr('height')-graphicopt.margin.top-graphicopt.margin.bottom) ).ticks(d3.timeDay.every(1)).tickSizeOuter(0));

        g.selectAll(".linkLable_textg").attr('transform',d=>'translate('+10+','+rowscale(rowMap[d.loc])+')')
        g.selectAll(".linkLineg").attr('transform',d=>'translate('+timescale(d.time)+','+rowscale(rowMap[d.loc])+')')

    }
    function drawEmbedding(data) {
        var keyVal = 'value';
        let timerange = d3.extent(data,d=>d.time);
        // let valueRange = d3.extent(data,d=>d[keyVal]);
        let valueRange = [1,10];
        let time_axis = d3.axisBottom();
        let val_axis = d3.axisLeft();
        let width_needed = timeFormat.range(timerange[0],timerange[1]).length * radaropt.w;
        let height, width;
        if (graphicopt.fitscreen){
            svg.attrs({
                width: graphicopt.width,
                height: graphicopt.height,
            });
            height = graphicopt.heightG();
            width = graphicopt.widthG();
            timescale.range([0,graphicopt.widthG()]).domain(timerange);
            time_axis = time_axis.ticks(graphicopt.widthG()/100);
        }else {
            let height_needed = Math.min(600,graphicopt.height);
            if (graphicopt.customheight){
                height_needed = graphicopt.customheight;
            }
            svg.attrs({
                width: width_needed+graphicopt.margin.left+graphicopt.margin.right,
                height: height_needed+graphicopt.margin.top+graphicopt.margin.bottom,
            });
            timescale.range([0, width_needed]).domain(timerange);
            time_axis = time_axis.ticks(width_needed/100);
            height = height_needed;
            width = width_needed;
        }
        rowscale.range([height,0]).domain(valueRange);
        time_axis = time_axis.scale(timescale);
        let timeAxis = g.select('.gAxis.x')
            .attr("transform", "translate("+0+", "+height+")")
            .transition()
            .call(time_axis);

        let timeAxis2 = g.select('.gAxist.x')
            .attr("transform", "translate("+0+", "+0+")")
            .transition()
            .call(time_axis.tickFormat("").tickSize((svg.attr('height')-graphicopt.margin.top-graphicopt.margin.bottom) ).ticks(d3.timeDay.every(1)).tickSizeOuter(0));
        val_axis = val_axis.scale(rowscale);
        let color = 'black'
        let yAxis = g.select('.gAxis.y')
            .attr("transform", "translate("+0+", "+0+")")
            .transition()
            .call(val_axis);
        let gradientScale = d3.scaleTime().domain(timescale.domain()).range([0,100]);
        let lgradient = svg.select('defs.densitygradient linearGradient').attr('x2', width);
        lgradient.selectAll('stop').remove();
        lgradient.selectAll('stop')
            .data(data).enter().append('stop')
            .attr('offset', function(d) { return gradientScale(d.time) + '%'; })
            .attr('style', function(d) { return 'stop-color:' + color + ';stop-opacity:' + radaropt.densityScale(d.density); });

        var generateArea = d3.area().curve(d3.curveMonotoneX).x(function (d) {
            return timescale(d.time);
        }).y1(function (d) {
            return rowscale(d.maxval);
        }).y0(function (d) {
            return rowscale(d.minval);
        })
            .defined(d => d[keyVal]!==undefined && !isNaN(d[keyVal]));
        var generateLine = d3.line().curve(d3.curveMonotoneX)
            .x(function (d) {
                return timescale(d.time);
            })
            .y(function (d) {
                return rowscale(d[keyVal]);
            }).defined(d => d[keyVal]!==undefined && !isNaN(d[keyVal]));;

        let datapoint = g.selectAll(".linkLineg")
            .data([data],d=>d);
        datapoint.exit().remove();
        let datapointN = datapoint
            .enter().append("g")
            .merge(datapoint).attr("class", "linkLineg all");
        datapointN.append('path').attr('class','areapath');
        datapointN.select('path.areapath').attr('d',generateArea)
            .on('mouseover',mouseoverEvent)
            .on('mouseleave',mouseleaveEvent)
            .styles({
                'fill':'url(#lGradient)',
                'stroke': color,
                'stroke-width': '1px',
            })
        ;
        datapointN.append('path').attr('class','linepath');
        datapointN.select('path.linepath').attr('d',generateLine)
            .on('mouseover',mouseoverEvent)
            .on('mouseleave',mouseleaveEvent)
            .styles({
                'fill':'none',
                'stroke': color,
                'stroke-width': '1px',
                'stroke-dasharray': 4,
            })
        ;

        let make_elbow_note = d3.annotation().annotations(annotations.filter(d=>d.className==='bagde')).type(d3.annotationCalloutElbow).accessors({ x: function x(d) {
                return timerange(new Date(d.time));
            },
            y: function y(d) {
                return rowscale(d['maxval']);
            }
        }).accessorsInverse({
            time: function date(d) {
                return timeFormat(timerange.invert(d.x));
            },
            value: function close(d) {
                return rowscale.invert(d.y);
            }
        }).type(d3.annotationCalloutElbow)
            .on('subjectover', function (annotation) {
            //cannot reference this if you are using es6 function syntax
            this.append('text').attr('class', 'hover').text(annotation.note.title).attr('text-anchor', 'middle').attr('y', annotation.subject.y && annotation.subject.y == "bottom" ? 50 : -40).attr('x', -15);

            this.append('text').attr('class', 'hover').text(annotation.note.label).attr('text-anchor', 'middle').attr('y', annotation.subject.y && annotation.subject.y == "bottom" ? 70 : -60).attr('x', -15);
        }).on('subjectout', function (annotation) {
            this.selectAll('text.hover').remove();
        });
        annotations.filter(d=>d.className==='gap').forEach(d=> {
                d.subject = {
                    height: rowscale(d3.max(data.filter(e => e.time >= formatTime(new Date(d.data.x1)) && e.time  <= formatTime(new Date(d.data.x2))), e => e.maxval)) - rowscale(valueRange[0]),
                    width: (-timescale(new Date(d.data.x1)) + timescale(new Date(d.data.x2)))
                };
                d.dy = d.subject.height-10;
                d.dx = d.subject.width/2;
            }
        );

        let make_gap = d3.annotation().annotations(annotations.filter(d=>d.className==='gap')).accessors({
            x: function (d) {
                return timescale(new Date(d.x1));
            },
            y: function (d) {
                return rowscale(valueRange[0]);
            }
        });
        let make_pointer = d3.annotation().editMode(true).notePadding(15)
            .annotations(annotations.filter(d=>d.className==='show-bg')).accessors({
            x: function (d) {
                return timescale(new Date(d.x1));
            },
            y: function (d) {
                return rowscale(data.find(e=>(e.time+'')===(formatTime(new Date(d.x1))+'')).maxval);
            }
        }).accessorsInverse({
                x1: d => timescale.invert(d.x),
            });
        g.selectAll('.annotation').remove();
        g.append("g").attr("class", "annotation annotation-label").call(make_elbow_note);
        g.append("g").attr("class", "annotation annotation-gap").call(make_gap);
        g.append("g").attr("class", "annotation annotation-pointer").call(make_pointer);
        //
    }
    function Updatecolorlegend (){
        let time_axis = d3.axisBottom().scale( d3.scaleLinear().domain(radaropt.densityScale.domain()).range([0,150])) .ticks(5).tickFormat(d3.format(".0s"));
        let timeAxis = g.select('.colorlegend').select('.axistick').call(time_axis);
    }
    function doneProcessBar(){
        d3.select('#load_data').classed('hidden',true);
    }
    function updateProcessBar(rate){
        d3.select('#load_data').classed('hidden',false);
        d3.select('#load_data').select('.determinate').style('width',rate*100+'%');
    }
    function fixstr(s) {
        return s.replace(/ |-|#/gi,'');
    }
    eventTimeLine.data = function (_) {
        return arguments.length ? (arr = handledata(_), eventTimeLine) : arr;

    };
    eventTimeLine.dataIcon = function (_) {
        return arguments.length ? (arrIcon = handledataIcon(_), eventTimeLine) : arrIcon;
    };
    eventTimeLine.schema = function (_) {
        return arguments.length ? (radaropt.schema = _, eventTimeLine) : radaropt.schema;

    };

    eventTimeLine.reset = function (_) {
        return arguments.length ? (first = _, eventTimeLine) : first;

    };

    eventTimeLine.svg = function (_) {
        return arguments.length ? (svg = _, eventTimeLine) : svg;

    };

    eventTimeLine.displaystyle = function (_) {
        if (arguments.length){
            graphicopt.display = _;
            changeshape ();
            return eventTimeLine;
        }
        return graphicopt.display;
    };

    eventTimeLine.graphicopt = function (_) {
        if (arguments.length) {
            for(var i in _){
                if('undefined' !== typeof _[i]){ graphicopt[i] = _[i]; }
            }
            return eventTimeLine
        }else
            return graphicopt;
    };
    eventTimeLine.radaropt = function (_) {
        if (arguments.length) {
            for(var i in _){
                if('undefined' !== typeof _[i]){ radaropt[i] = _[i]; }
            }
            return eventTimeLine
        }else
            return radaropt;
    };

    eventTimeLine.option = function (_) {
        if (arguments.length){
            isBusy = true;
            option = _;
            tsne.postMessage({action:"inittsne",value:option});
            return eventTimeLine;
        }
        return option;
    };

    eventTimeLine.scalescreen = function (_) {
        return arguments.length ? (graphicopt.customheight = _,updatePosition(), eventTimeLine) : graphicopt.fitscreen;
    };
    eventTimeLine.annotations = function (_) {
        return arguments.length ? (annotations = _, eventTimeLine) : annotations;
    };
    eventTimeLine.fitscreen = function (_) {
        return arguments.length ? (graphicopt.fitscreen = _,updatePosition(), eventTimeLine) : graphicopt.fitscreen;
    };
    eventTimeLine.runopt = function (_) {
        return arguments.length ? (runopt = _, eventTimeLine) : runopt;
    };
    eventTimeLine.axis = function (_) {
        return arguments.length ? (axis = _, eventTimeLine) : axis;
    };

    eventTimeLine.group_mode = function (_) {
        if (arguments.length){
            isBusy = true;
            group_mode = _;
            // tsne.postMessage({action:"group_mode",value:group_mode});
            return eventTimeLine;
        }
        return group_mode;
    };
    eventTimeLine.dispatch = function (_) {
        return arguments.length ? (returnEvent = _, eventTimeLine) : returnEvent;
    };

    eventTimeLine.onmouseover = function (_) {
        return arguments.length ? (mouseoverEvent = _, eventTimeLine) : mouseoverEvent;
    };

    eventTimeLine.onmouseleave = function (_) {
        return arguments.length ? (mouseleaveEvent = _, eventTimeLine) : mouseleaveEvent;
    };

    eventTimeLine.RadarColor = function (_) {
        return arguments.length ? (arrColor = _.arrColor,UpdateGradient(), eventTimeLine) : arrColor;
    };

    eventTimeLine.ClusterColor = function (_) {
        return arguments.length ? (colorCategory = d3.scaleOrdinal(_.arrColor), eventTimeLine) : colorCategory;
    };

    eventTimeLine.rowMap = function (_) {
        return arguments.length ? (rowMap = _ , eventTimeLine) : rowMap;
    };

    eventTimeLine.timeFormat = function (_) {
        return arguments.length ? (timeFormat = _ , eventTimeLine) : timeFormat;
    };

    return eventTimeLine;
};
