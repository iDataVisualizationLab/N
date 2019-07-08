// Ngan - Jun 7 2019




d3.radarMap = function () {
    let graphicopt = {
            margin: {top: 5, right: 0, bottom: 0, left: 0},
            width: 1000,
            height: 600,
            scalezoom: 10,
            widthView: function(){return this.width*this.scalezoom},
            heightView: function(){return this.height*this.scalezoom},
            widthG: function(){return this.widthView()-this.margin.left-this.margin.right},
            heightG: function(){return this.heightView()-this.margin.top-this.margin.bottom},
            dotRadius: 2,
            summary: {size:30}
        },
        radaropt = {
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
        arr = [],
        isBusy = false,
        isStable = false;
        // tsne = new tsnejs.tSNE(graphicopt.opt);
        // tsne = new Worker ('src/scripts/worker/tSNEworker.js');
    let sizebox = 50;
    let maxlist = 20;
    let radarMap ={};
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
    let geTopComand = _.once(radarMap.getTop10);
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

    radarMap.init = function(){
        // tsne.postMessage({action:"inittsne",value:option});


        svg.attrs({
            width: graphicopt.width,
            height: graphicopt.height,
            // overflow: "visible",

        });
        timescale.range([0,graphicopt.widthG()]);
        rowscale.domain([0,1]);
        // svg.style('visibility','hidden');
        // svg.append("defs").append("clipPath")
        //     .attr("id", "clip")
        //     .append("rect")
        //     .attr("width", graphicopt.widthG())
        //     .attr("height", graphicopt.heightG());
        // gradient
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
            .attr("class", "x gAxis")
            .attr("transform", "translate(0, 10)");

        // .attr("clip-path", "url(#clip)");
        // const rect = g.append('rect').attr("rx", 10)
        //     .attr("ry", 10)
        //     .attr("width", graphicopt.widthG()-2)
        //     .attr("height", graphicopt.heightG())
        //     .attr("stroke-width", 1)
        //     .style("box-shadow", "10px 10px 10px #666");

        // panel = d3.select("#subzone").style('top',graphicopt.offset.top+'px');
        // panel.select(".details").append("span").text('t-SNE cost: ');
        // panel.select(".details").append("span").attr('class','cost');
        // panel.select(".details").append("span").text(',     iteration: ');
        // panel.select(".details").append("span").attr('class','iteration');
        //
        // const sizegraph = sizebox - 6;
        // scaleX_small.range([0,sizegraph]);
        // scaleY_small.range([sizegraph/4-3,sizegraph*5/4-3]);
        // graphicopt.top10.width = Math.min(graphicopt.width/4,300);
        // if (!graphicopt.eventpad)
        //     graphicopt.eventpad ={};
        // graphicopt.eventpad.size = graphicopt.eventpad.size || 10;
        // graphicopt.eventpad.eventpadtotalwidth = graphicopt.top10.width - sizebox;
        // graphicopt.eventpad.maxstack = Math.floor(graphicopt.eventpad.eventpadtotalwidth /graphicopt.eventpad.size);
        // tsne.postMessage({action:"maxstack",value:graphicopt.eventpad.maxstack});
        // tsne.postMessage({action:"group_mode",value:group_mode});
        // graphicopt.top10.details.clulster.attr.width = graphicopt.eventpad.size;
        // graphicopt.top10.details.clulster.attr.height = graphicopt.eventpad.size;
        // panel.select(".top10DIV").style('max-height', Math.min (graphicopt.height-130, sizebox*50.5)+"px");
        // panel.select(".top10").attrs({width: graphicopt.top10.width,
        //     height: sizebox*50.5});
        // g = g.append('g')
        //     .attr('class','graph')
        // //.attr('transform',`translate(${graphicopt.widthG()/2},${graphicopt.heightG() /2})`);
        // function zoomed() {
        //     ssscale = d3.zoomTransform(this).k;
        //     tx = d3.zoomTransform(this).x;
        //     ty = d3.zoomTransform(this).y;
        //     if (store.Y) updateEmbedding(store.Y,store.cost,store.iteration,true);
        // }
        // var zoom = d3.zoom()
        //     .on("zoom", zoomed);
        // svg.call(zoom);

        // ssscale= graphicopt.scalezoom;
        // svg.call(zoom.translateBy, graphicopt.widthG() / 2,graphicopt.heightG() / 2);
        //
        // graphicopt.step = function () {
        //     if (!isBusy && !isStable) {
        //         isBusy = true;
        //         tsne.postMessage({action: 'step'});
        //     }
        // };


        //summary
        // d3.select('.rightPanel').select('.averageSumPlot')
        //     .attrs({width:graphicopt.summary.size,
        //         height:graphicopt.summary.size,
        //     })

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
    radarMap.draw = function(){
        if (first){
            isBusy = false;
            isStable = false;
            // initradar (arr[0].length);
            radarMap.redraw();
        }else {
            needUpdate = true;
            if (graphicopt.display.symbol.type ==='path') {
                drawEmbedding(arr);
                // let newdata = g.selectAll(".linkLineg")
                //     .data(arr, d => d.name);
                // newdata.select('clipPath').select('path')
                //     .transition('expand').duration(runopt.simDuration/2).ease(d3.easePolyInOut)
                //     .attr("d", d => radarcreate(d));
                // newdata.select('.tSNEborder')
                //     .transition('expand').duration(runopt.simDuration/2).ease(d3.easePolyInOut)
                //     .attr("d", d => radarcreate(d));
            }
            // if (!isBusy) {
            //     isBusy = true;
            //     isStable = false;
            //     tsne.postMessage({action: "updateData", value: arr, index: currentIndex});
            // }


        }
    };

    radarMap.getTop10  = function (){
        console.log(new Date() -caltime);
        tsne.postMessage({action:"updateTracker"});
        // clearInterval(intervalCalculate);
    };

    radarMap.pause  = function (){
        if (intervalUI)
            clearInterval(intervalUI);
        // clearInterval(intervalCalculate);
    };

    radarMap.resume  = function (){
        intervalUI = setInterval(graphicopt.step,10);
        // intervalCalculate = setInterval(updateData,2000);
    };

    radarMap.redraw  = function (){
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
        // radarMap.resume();
    };

    radarMap.remove  = function (){
        if (!first){
            panel.classed("active",false);
            // svg.style('visibility','hidden');
            isBusy = true;
            isStable = false;
            radarMap.pause();
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
        arr = [];
        data.forEach(d=>d.values.forEach(e=>arr.push(e.arr)));
        radaropt.densityScale = d3.scaleLinear().domain(d3.extent(arr,d=>d.density));
        return arr;
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
    let rowscale = d3.scaleLinear().range([0, radaropt.h]);
    function drawEmbedding(data) {
        timescale.domain(d3.extent(data,d=>d.time));

        let time_axis = d3.axisTop()
            .scale(timescale);
        let timeAxis = g.select('.gAxis')
            .attr("transform", "translate("+(radaropt.w/2)+", "+rowscale(1)+")")
            .transition()
            .call(time_axis);

        rowscale.range([0,radaropt.h]);
        let rowlabel = _.pairs(rowMap);

        let lables = g.selectAll(".linkLable_text")
            .data(rowlabel,d=>+d[0]);
        lables.exit();
        lables.enter().append('text')
            .attr('class','linkLable_text')
            .merge(lables)
            .attr('y',d=>rowscale(+d[0]))
            .style('font-size',"11px")
            .style('fill',"currentColor")
            .attr('dy',"1.5em")
            .attr('text-anchor',"end")
            .text(d=>d.join('  '));

        let datapoint = g.selectAll(".linkLineg")
            .data(data,d=>d.key);
        datapoint.exit().remove();
        let datapointN = datapoint
            .enter().append("g")
            .merge(datapoint).attr("class", d=>"linkLineg "+fixstr(d.id))
            .attr('transform',d=>'translate('+timescale(d.time)+','+rowscale(d.loc)+')')
            .on('mouseover',mouseover)
            .on('mouseleave',mouseleave)
            .each(d=>
                RadarChart(".linkLineg."+fixstr(d.id),[d],radaropt));
        function mouseover (d) {
            d3.selectAll('#'+removeWhitespace(rowMap[d.loc])+'.geoPath').classed('selected',true);
        }
        function mouseleave (d) {
            d3.selectAll('#'+removeWhitespace(rowMap[d.loc])+'.geoPath').classed('selected',false);
        }
    }
    function fixstr(s) {
        return s.replace(/ |-|#/gi,'');
    }
    radarMap.data = function (_) {
        return arguments.length ? (arr = handledata(_), radarMap) : arr;

    };

    radarMap.schema = function (_) {
        return arguments.length ? (radaropt.schema = _, radarMap) : radaropt.schema;

    };

    radarMap.reset = function (_) {
        return arguments.length ? (first = _, radarMap) : first;

    };

    radarMap.svg = function (_) {
        return arguments.length ? (svg = _, radarMap) : svg;

    };

    radarMap.displaystyle = function (_) {
        if (arguments.length){
            graphicopt.display = _;
            changeshape ();
            return radarMap;
        }
        return graphicopt.display;
    };

    radarMap.graphicopt = function (_) {
        if (arguments.length) {
            for(var i in _){
                if('undefined' !== typeof _[i]){ graphicopt[i] = _[i]; }
            }
            return radarMap
        }else
            return graphicopt;
    };
    radarMap.option = function (_) {
        if (arguments.length){
            isBusy = true;
            option = _;
            tsne.postMessage({action:"inittsne",value:option});
            return radarMap;
        }
        return option;
    };
    radarMap.runopt = function (_) {
        return arguments.length ? (runopt = _, radarMap) : runopt;
    };
    radarMap.axis = function (_) {
        return arguments.length ? (axis = _, radarMap) : axis;
    };
    radarMap.group_mode = function (_) {
        if (arguments.length){
            isBusy = true;
            group_mode = _;
            // tsne.postMessage({action:"group_mode",value:group_mode});
            return radarMap;
        }
        return group_mode;
    };
    radarMap.dispatch = function (_) {
        return arguments.length ? (returnEvent = _, radarMap) : returnEvent;
    };

    radarMap.RadarColor = function (_) {
        return arguments.length ? (arrColor = _.arrColor,UpdateGradient(), radarMap) : arrColor;
    };

    radarMap.ClusterColor = function (_) {
        return arguments.length ? (colorCategory = d3.scaleOrdinal(_.arrColor), radarMap) : colorCategory;
    };

    radarMap.rowMap = function (_) {
        return arguments.length ? (rowMap = _ , radarMap) : rowMap;
    };

    return radarMap;
};
