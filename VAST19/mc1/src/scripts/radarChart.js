/////////////////////////////////////////////////////////
/////////////// The Radar Chart Function ////////////////
/////////////// Written by Nadieh Bremer ////////////////
////////////////// VisualCinnamon.com ///////////////////
/////////// Inspired by the code of alangrafu ///////////
////////////// Modified by Ngan IDVL 2019 ///////////////
/////////////////////////////////////////////////////////

function RadarChart(id, data, options) {
    var cfg = {
        w: 300,				//Width of the circle
        h: 300,				//Height of the circle
        margin: {top: 20, right: 55, bottom: 10, left: 55}, //The margins of the SVG
        levels: 3,				//How many levels or inner circles should there be drawn
        maxValue: 1, 			//What is the value that the biggest circle will represent
        minValue: 0, 			//What is the value that the biggest circle will represent
        labelFactor: 1.15, 	//How much farther than the radius of the outer circle should the labels be placed
        wrapWidth: 60, 		//The number of pixels after which a label needs to be given a new line
        opacityArea: 0.35, 	//The opacity of the area of the blob
        dotRadius: 4, 			//The size of the colored circles of each blog
        opacityCircles: 0.1, 	//The opacity of the circles of each blob
        strokeWidth: 1, 		//The width of the stroke around each blob
        roundStrokes: true,	//If true the area and stroke will follow a round path (cardinal-closed)
        isNormalize: true,
        mini:false, //mini mode
        schema: undefined,
        color: function(){return 'black'},	//Color function
        arrColor: ["#110066", "#4400ff", "#00cccc", "#00dd00", "#ffcc44", "#ff0000", "#660000"],
    };

    //Put all of the options into a variable called cfg
    if('undefined' !== typeof options){
        for(var i in options){
            if('undefined' !== typeof options[i]){ cfg[i] = options[i]; }
        }//for i
    }//if


    var undefinedValue =0;
    //If the supplied maxValue is smaller than the actual one, replace by the max in the data
    var maxValue,minValue,range,arrThresholds,colorTemperature,opaTemperature,allAxis,rScale,scaleMarkedLegend;
    // NEW SETTING
    //If the supplied maxValue is smaller than the actual one, replace by the max in the data

    if (cfg.isNormalize){
        minValue = 0;
        maxValue = 1;
        range = [minValue,maxValue];
    } else {
        maxValue = Math.max(cfg.maxValue, d3.max(data, function (i) {
            return d3.max(i.map(function (o) {
                return o.value;
            }))
        }));
        minValue = Math.min(cfg.minValue, d3.min(data, function (i) {
            return d3.min(i.map(function (o) {
                return o.value;
            }))
        }));
        range = [minValue,maxValue]
    }
    if (cfg.markedLegend) scaleMarkedLegend = d3.scaleLinear().domain(range).range(cfg.markedLegend);
    var dif = 1 / (cfg.levels-2);
    var right = 1 + dif;
    
    var colorLength = cfg.arrColor.length-1;
    cfg.arrThresholds = [-dif];
    for (var i=0;i<colorLength-1;i++)
        cfg.arrThresholds.push(i/(colorLength-1));
    cfg.arrThresholds.push(right);
    colorTemperature = d3.scaleLinear()
        .domain(cfg.arrThresholds)
        .range(cfg.arrColor)
        .interpolate(d3.interpolateHcl); //interpolateHsl interpolateHcl interpolateRgb


    if (cfg.schema){
        range = [0,1];
        allAxis = cfg.schema.filter(d=>d.enable);
    }else{
        //Names of each axis
        angleSlice = cfg.angleSlice;
        allAxis = (data[0].map(function (i, j) {
            return {text: i.axis, angle: angleSlice[j]};
        }));
    }

    // Re-adjust angles
    minValue = range[0]-dif*(range[1]-range[0]);
    maxValue = range[1]+dif*(range[1]-range[0]);

    var radius = Math.min(cfg.w/2, cfg.h/2), 	//Radius of the outermost circle
        Format = d3.format('.0%');			 	//Percentage formatting

    data = data.map(ditem=>{
        if (ditem.bin)
            ditem.bin.val = ditem.bin.val.map(v=>v.filter((d,i)=>allAxis.find(e=>e.text===ditem[i].axis)));

        const ditem_filtered = ditem.filter(d=>allAxis.find(e=>e.text===d.axis));
        let temp = _.sortBy(ditem_filtered,d=>allAxis.find(e=>e.text===d.axis).angle);
        temp.type = ditem.type;
        temp.density = ditem.density;
        temp.bin = ditem.bin; return temp;});

    //Scale for the radius
    rScale = d3.scaleLinear()
        .range([0, radius])
        .domain([minValue, maxValue]);

    /////////////////////////////////////////////////////////
    //////////// Create the container SVG and g /////////////
    /////////////////////////////////////////////////////////

    //Remove whatever chart with the same id/class was present before
    d3.select(id).selectAll("svg").nodes().forEach(d=>{
        if (d3.select(d).attr("class")!==("radar"+id.replace(".","").replace("."," ")))
            d3.select(d).remove();
    });

    //Initiate the radar chart SVG
    var first = false;
    var svg = d3.select(id).select(".radar"+id.replace(".",""));
    var g = svg.select("#radarGroup");
    if (svg.empty()) {
        first = true;
        svg = d3.select(id).append("svg")
            .attr("width", cfg.w + cfg.margin.left + cfg.margin.right)
            .attr("height", cfg.h + cfg.margin.top + cfg.margin.bottom)
            .attr("class", "radar" + id.replace(".","").replace("."," "))
            .style("overflow",'visible');
        //Append a g element
        g = svg.append("g")
            .attr("id","radarGroup")
            .attr("transform", "translate(" + (cfg.w/2 + cfg.margin.left) + "," + (cfg.h/2 + cfg.margin.top) + ")");
    }


    /////////////////////////////////////////////////////////
    ////////// Glow filter for some extra pizzazz ///////////
    /////////////////////////////////////////////////////////
    function toDegrees(rad) {
        let deg = rad * (180/Math.PI)%360;
        return deg;
    }
    function toRadian(deg) {
        return deg * (Math.PI/180);
    }
    //Filter for the outside glow
    if (first && !cfg.mini) {

        //Filter for the outside glow
        var filter = g.append('defs').append('filter').attr('id', 'glow'),
            feGaussianBlur = filter.append('feGaussianBlur').attr('stdDeviation', '2.5').attr('result', 'coloredBlur'),
            feMerge = filter.append('feMerge'),
            feMergeNode_1 = feMerge.append('feMergeNode').attr('in', 'coloredBlur'),
            feMergeNode_2 = feMerge.append('feMergeNode').attr('in', 'SourceGraphic');

        //Filter for the outside glow
        var filter = g.append('defs').append('filter').attr('id', 'glow2'),
            feGaussianBlur = filter.append('feGaussianBlur').attr('stdDeviation', '1').attr('result', 'coloredBlur'),
            feMerge = filter.append('feMerge'),
            feMergeNode_1 = feMerge.append('feMergeNode').attr('in', 'coloredBlur'),
            feMergeNode_2 = feMerge.append('feMergeNode').attr('in', 'SourceGraphic');

        /////////////////////////////////////////////////////////
        /////////////// Draw the Circular grid //////////////////
        /////////////////////////////////////////////////////////

        //Wrapper for the grid & axes
        var axisGrid = g.append("g").attr("class", "axisWrapper");

        //Draw the background circles
        axisGrid.selectAll(".levels")
            .data(d3.range(1, (cfg.levels + 1)).reverse())
            .enter()
            .append("circle")
            .attr("class", "gridCircle")
            .attr("r", function (d, i) {
                return radius / cfg.levels * d;
            })
            .style("fill", "#CDCDCD")
            .style("stroke", function (d, i) {
                var v = (maxValue - minValue) * d / cfg.levels + minValue;
                return colorTemperature(v);
            }).style("stroke-width", 0.3)
            .style("stroke-opacity", 1)
            .style("fill-opacity", cfg.opacityCircles)
            .style("visibility", (d, i) => ((cfg.bin || cfg.gradient) && i == 0) ? "hidden" : "visible");
        // .style("filter", "url(#glow)");

        //Text indicating at what % each level is
        // axisGrid.selectAll(".axisLabel")
        //     .data(d3.range(1, (cfg.levels + 1)).reverse())
        //     .enter().append("text")
        //     .attr("class", "axisLabel")
        //     .attr("x", 4)
        //     .attr("y", function (d) {
        //         return -d * radius / cfg.levels;
        //     })
        //     .attr("dy", "0.4em")
        //     .style("font-size", "10px")
        //     .attr("fill", "#737373")
        //     .text(function (d, i) {
        //         return Format((maxValue * d / cfg.levels));
        //     });
    }

    if (!cfg.mini) {
        /////////////////////////////////////////////////////////
        //////////////////// Draw the axes //////////////////////
        /////////////////////////////////////////////////////////
        var axisGrid = g.select(".axisWrapper");
        //Create the straight lines radiating outward from the center
        var axis_o = axisGrid.selectAll(".axis")
            .data(allAxis, d => d.text);

        var axis_n = axis_o.enter()
            .append("g")
            .attr("class", "axis")
            .style('transform-origin', '0,0');
        axis_n.merge(axis_o)
            .style('transform', function (d, i) {
                return "rotate(" + toDegrees(d.angle) + "deg)"
            });

        //Append the lines
        axis_n.append("line")
            .attr("x1", 0)
            .attr("y1", 0)
            .attr("x2", 0)
            .attr("y2", function (d, i) {
                return -rScale(maxValue * (cfg.bin || cfg.gradient ? ((cfg.levels - 1) / cfg.levels) : 1.05));
            })
            .attr("class", "line")
            .style("stroke", "white")
            .style("stroke-width", "1px");
        //Append the labels at each axis
        if (cfg.showText) {
            axis_n.append("text")
                .attr("class", "legend")
                .style("font-size", "12px")
                .attr("font-family", "sans-serif")
                .attr("text-anchor", "middle")
                .attr("dy", "0.35em")
                .attr("x", 0)
                .merge(axis_o.select('.legend'))
                // .classed('flip_h',(d,i)=>(d.angle>Math.PI*3/4)&&(d.angle<5*Math.PI/4))
                .attr("y", function (d, i) {
                    return -rScale(maxValue * cfg.labelFactor);
                })
                .text(function (d) {
                    return d.text;
                })
                .call(wrap, cfg.wrapWidth);
        }

    }
    /////////////////////////////////////////////////////////
    ///////////// Draw the radar chart blobs ////////////////
    /////////////////////////////////////////////////////////
    if (cfg.bin) {
        var densityscale = cfg.scaleDensity;
        var scaleStroke = d3.scaleLinear()
            .domain([0,1])
            .range([0,5]);
        data.forEach(d=> d.forEach((v,i)=> {
            v.minval = d3.min(d.bin.val,v=>v[i]);
            v.maxval = d3.max(d.bin.val,v=>v[i]);}));
    }
    //The radial line function
    //The radial line function

    var radarLine = d3.radialLine()
    // .interpolate("linear-closed")
        .curve(d3.curveCatmullRom.alpha(0.5))
        .radius(function(d) {
            return rScale(d.value||d)||undefinedValue; })
        .angle(function(d,i) {  return getAngle(d,i); });

    var radialAreaGenerator = d3.radialArea()
        .angle(function(d,i) {  return getAngle(d,i); })
        .innerRadius(function(d,i) {
            return rScale(d.minval)||undefinedValue;
        })
        .outerRadius(function(d,i) {
            return rScale(d.maxval)||undefinedValue;
        });

    let radialAreaQuantile = d3.radialArea()
        .angle(function(d,i) {  return getAngle(d,i); })
        .innerRadius(function(d,i) {
            return rScale(d.q1)||undefinedValue;
        })
        .outerRadius(function(d,i) {
            return rScale(d.q3)||undefinedValue;
        });

    if(cfg.roundStrokes) {
        radarLine.curve(d3.curveCardinalClosed.tension(0.5));
        radialAreaGenerator.curve(d3.curveCardinalClosed.tension(0.5));
        radialAreaQuantile.curve(d3.curveCardinalClosed.tension(0.5));
    }


    //Create a wrapper for the blobs
    var blobWrapperg = g.selectAll(".radarWrapper")
        .data(data);
    //Create the outlines
    blobWrapperg.exit().remove();
    var blobWrapper = blobWrapperg
        .enter().append("g")
        .attr("class", "radarWrapper");

    //function update
    function drawCluster(paths){
        paths.attr("d", d => {
            d.forEach((v,i)=>{
                let temp = d.bin.val.map(ve=>ve[allAxis.findIndex(e=>e.text===v.axis)]);
                let mean = d3.mean(temp);
                let std = d3.deviation(temp)||0;
                v.minval =  mean - std/2;
                v.maxval =  mean + std/2;
            });

            return radialAreaGenerator(d);}).transition()
            .style("stroke", (d, i) => cfg.color(i))
            .style("stroke-width", () => cfg.strokeWidth + "px")
            .style("fill-opacity", d => densityscale(d.bin.val.length))
            .style("fill", (d, i) => cfg.color(i));
    }
    function drawOutlying(paths){
        paths.attr("d", d => radarLine(d)).transition()
            .style("stroke", (d, i) => 'black')
            .style("stroke-width", () => cfg.strokeWidth + "px")
            //.style("fill-opacity", d => 1)
            .style("fill", 'none');
    }
    function drawMeanLine(paths){
        return paths
            .attr("d", d =>radarLine(d))
            .styles({"fill":'none',
                'stroke':'black',
                'stroke-width':0.5,
                'stroke-dasharray': '1 2'});
    }

    //update the outlines
    var blobWrapperpath = blobWrapperg.select(".radarStroke");
    if (cfg.bin) { // bin type
        // area radar shape
        blobWrapperpath.filter(d=>d.type!=="outlying")
            .classed("outlying",false)
            .call(drawCluster);
        blobWrapperpath.filter(d=>d.type==="outlying")
            .classed("outlying",true)
            .call(drawOutlying);
        //Create the outlines
        blobWrapper.filter(d=>d.type!=="outlying")
            .append("path")
            .attr("class", "radarStroke")
            .call(drawCluster);
        blobWrapper.filter(d=>d.type==="outlying")
            .append("path")
            .attr("class", "radarStroke outlying")
            .call(drawOutlying);
    }else if (cfg.gradient && cfg.summary){
        function drawMeanLine(paths){
            return paths
                .attr("d", d =>radarLine(d))
                .styles({"fill":'none',
                    'stroke':'black',
                    'stroke-dasharray': '1 2'})
                .style("stroke-width", (d) => ( (cfg.densityScale && d.density !==undefined ? cfg.densityScale(d.density) :1) * cfg.strokeWidth) + "px");
        }
        function drawQuantileArea(paths){
            return paths
                .attr("d", d =>radialAreaQuantile(d))
                .styles({"fill":'none',
                    'stroke':'black'})
                .style("stroke-width", (d) => ( (cfg.densityScale && d.density !==undefined ? cfg.densityScale(d.density) :1) * cfg.strokeWidth) + "px");
        }
        //update the outlines
        blobWrapperg.select('.radarLine').transition().call(drawMeanLine);
        blobWrapperg.select('.radarQuantile').transition().call(drawQuantileArea);
        blobWrapperpath.style("fill", "none").transition()
            .attr("d", d => radialAreaGenerator(d))
            .style("stroke-width", (d) => ( (cfg.densityScale && d.density !==undefined ? cfg.densityScale(d.density) :1) * cfg.strokeWidth) + "px")
            .style("stroke", (d, i) => cfg.color(i));
        blobWrapperg.select('clipPath')
            .select('path')
            .transition('expand').ease(d3.easePolyInOut)
            .attr("d", d =>radialAreaGenerator(d));
        //Create the outlines
        blobWrapper.append("clipPath")
            .attr("id",(d,i)=>"sum"+correctId (id))
            .append("path")
            .attr("d", d => radialAreaGenerator(d));
        blobWrapper.append("rect")
            .style('fill', 'url(#rGradient2)')
            .attr("clip-path",( d,i)=>"url(#sum"+correctId (id)+")")
            .attr("x",-radius)
            .attr("y",-radius)
            .attr("width",(radius)*2)
            .attr("height",(radius)*2);
        blobWrapper.append("path")
            .attr("class", "radarStroke")
            .attr("d", d => radialAreaGenerator(d))
            .style("fill", "none")
            .transition()
            .style("stroke-width", (d) => ( (cfg.densityScale && d.density !==undefined ? cfg.densityScale(d.density) :1) * cfg.strokeWidth) + "px")
            //.style("stroke-opacity", d => cfg.bin ? densityscale(d.bin.val.length) : 0.5)
            .style("stroke", (d, i) => cfg.color(i));
        blobWrapper
            .append("path").classed('radarLine',true).style("fill", "none").call(drawMeanLine);

        blobWrapper
            .append("path").classed('radarQuantile',true).style("fill", "none").call(drawQuantileArea);
    }
    else {
        if (cfg.gradient) {
            blobWrapperg.select('clipPath')
                .select('path')
                .transition('expand').ease(d3.easePolyInOut)
                .attr("d", d => radarLine(d));
            //Create the outlines
            blobWrapper.append("clipPath")
                .attr("id", (d, i) => "sum" + correctId(id))
                .append("path")
                .attr("d", d => radarLine(d));
            blobWrapper.append("rect")
                .style('fill', 'url(#rGradient2)')
                .attr("clip-path", (d, i) => "url(#sum" + correctId(id) + ")")
                .attr("x", -radius)
                .attr("y", -radius)
                .attr("width", (radius) * 2)
                .attr("height", (radius) * 2);
            blobWrapper.append("path")
                .attr("class", "radarStroke")
                .attr("d", d => radarLine(d))
                .style("fill", "none")
                .transition()
                .style("stroke-width", (d) => ( (cfg.densityScale && d.density !==undefined ? cfg.densityScale(d.density) :1) * cfg.strokeWidth) + "px")
                //.style("stroke-opacity", d => cfg.bin ? densityscale(d.bin.val.length) : 0.5)
                .style("stroke", (d, i) => cfg.color(i));
        }else {
            blobWrapperpath.transition().attr("d", d => radarLine(d))
                .style("fill", "none")
                .style("stroke-width", (d) => ( (cfg.densityScale && d.density !==undefined ? cfg.densityScale(d.density) :1) * cfg.strokeWidth) + "px")
                .style("stroke-opacity", d => cfg.bin ? densityscale(d.bin.val.length) : 0.5)
                .style("stroke", (d, i) => cfg.color(i));
            //Create the outlines
            blobWrapper.append("path")
                .attr("class", "radarStroke")
                .attr("d", d => radarLine(d))
                .style("stroke-width", (d) => ( (cfg.densityScale && d.density !==undefined ? cfg.densityScale(d.density) :1) * cfg.strokeWidth) + "px")
                .style("stroke-opacity", d => cfg.bin ? densityscale(d.bin.val.length) : 0.5)
                .style("stroke", (d, i) => cfg.color(i))
                .style("fill", "none");
        }
    }
    blobWrapperpath = g.selectAll(".radarWrapper").selectAll(".radarStroke");
    // if (cfg.bin) {
    //     var listhost = [];
    //     data.forEach(d=>{
    //         d.bin.name.forEach(n=>{listhost.push(n)});
    //     });
    //     blobWrapperpath.on("mouseenter",mouseenterfunctionbold );
    // }


    //Update the circles
    // blobWrapper = g.selectAll(".radarWrapper");
    //Append the circles
    // var circleWrapper = blobWrapper.selectAll(".radarCircle")
    //     .data(function(d,i) {
    //         d.forEach(function(d2){
    //             d2.index=i;
    //         });
    //         return d;
    //     })
    //     .attr("r", function(d){
    //         if (cfg.radiuschange)
    //             return 1+Math.pow((d.index+2),0.3);
    //         return cfg.dotRadius;
    //     });
    // circleWrapper.transition()
    //     .attr("cx", function(d,i){ return rScale(d.value) * Math.cos(angleSlice[i] - Math.PI/2); })
    //     .attr("cy", function(d,i){ return rScale(d.value) * Math.sin(angleSlice[i] - Math.PI/2); })
    //     // .style("fill", function(d,i,j) {  return cfg.color(d.index); })
    //     .style("fill", function(d){
    //         return colorTemperature(d.value);
    //     })
    //     .style("fill-opacity", 0.5)
    //     .style("stroke", "#000")
    //     .style("stroke-width", 0.2)
    //     .style("visibility", (d, i) => (cfg.bin ) ? "hidden" : "visible");
    // circleWrapper.exit().remove();
    // circleWrapper
    //     .enter().append("circle")
    //     .attr("class", "radarCircle")
    //     .attr("r", function(d){
    //         if (cfg.radiuschange)
    //             return 1+Math.pow((d.index+2),0.3);
    //         return cfg.dotRadius;
    //     })
    //     .attr("cx", function(d,i){ return rScale(d.value) * Math.cos(angleSlice[i] - Math.PI/2); })
    //     .attr("cy", function(d,i){ return rScale(d.value) * Math.sin(angleSlice[i] - Math.PI/2); })
    //     // .style("fill", function(d,i,j) {  return cfg.color(d.index); })
    //     .style("fill", function(d){
    //         return colorTemperature(d.value);
    //     })
    //     .style("fill-opacity", 0.5)
    //     .style("stroke", "#000")
    //     .style("stroke-width", 0.2)
    //     .style("visibility", (d, i) => (cfg.bin ) ? "hidden" : "visible");

    /////////////////////////////////////////////////////////
    //////// Append invisible circles for tooltip ///////////
    /////////////////////////////////////////////////////////

    //Wrapper for the invisible circles on top

    if (!cfg.bin&&!cfg.gradient&&cfg.showHelperPoint) {
        var blobCircleWrapperg = g.selectAll(".radarCircleWrapper")
            .data(data);
        blobCircleWrapperg.exit().remove();
        blobCircleWrapperg.enter().append("g")
            .attr("class", "radarCircleWrapper");
        var blobCircleWrapper = g.selectAll(".radarCircleWrapper");
        //Append a set of invisible circles on top for the mouseover pop-up
        var blobCircleWrappergg = blobCircleWrapper.selectAll(".radarInvisibleCircle")
            .data(function (d, i) {
                return d;
            })
            .attr("r", cfg.dotRadius * 1.5)
            .attr("cx", function (d, i) {
                return rScale(d.value) * Math.cos(getAngle(d,i) - Math.PI / 2);
            })
            .attr("cy", function (d, i) {
                return rScale(d.value) * Math.sin(getAngle(d,i) - Math.PI / 2);
            })
            .style("fill", "none")
            .style("pointer-events", "all")
            .on("mouseenter", function (d, i) {
                newX = parseFloat(d3.select(this).attr('cx')) - 10;
                newY = parseFloat(d3.select(this).attr('cy')) - 10;

                tooltip
                    .attr('x', newX)
                    .attr('y', newY)
                    .text(Format(d.value))
                    .transition().duration(200)
                    .style('opacity', 1);
            })
            .on("mouseleave", function () {
                tooltip.transition().duration(200)
                    .style("opacity", 0);
            });
        blobCircleWrappergg.exit().remove();
        blobCircleWrappergg
            .enter().append("circle")
            .attr("class", "radarInvisibleCircle")
            .attr("r", cfg.dotRadius * 1.5)
            .attr("cx", function (d, i) {
                return rScale(d.value) * Math.cos(getAngle(d,i) - Math.PI / 2);
            })
            .attr("cy", function (d, i) {
                return rScale(d.value) * Math.sin(getAngle(d,i) - Math.PI / 2);
            })
            .style("fill", "none")
            .style("pointer-events", "all")
            .on("mouseenter", function (d, i) {
                newX = parseFloat(d3.select(this).attr('cx')) - 10;
                newY = parseFloat(d3.select(this).attr('cy')) - 10;

                tooltip
                    .attr('x', newX)
                    .attr('y', newY)
                    .text(Format(d.value))
                    .transition().duration(200)
                    .style('opacity', 1);
            })
            .on("mouseleave", function () {
                tooltip.transition().duration(200)
                    .style("opacity", 0);
            });
    }

    //Set up the small tooltip for when you hover over a circle
    var tooltip = g.selectAll(".tooltip");
    if (first) {
        tooltip = g.append("text")
            .attr("class", "tooltip")
            .style("opacity", 0);
    }
    function getAngle(d,i){
        return (allAxis.find(a=>a.text===d.axis)||allAxis[i]).angle;
    }
    /////////////////////////////////////////////////////////
    /////////////////// Helper Function /////////////////////
    /////////////////////////////////////////////////////////

    //Taken from http://bl.ocks.org/mbostock/7555321
    //Wraps SVG text
    function wrap(text, width) {
        text.each(function() {
            var text = d3.select(this),
                words = text.text().trim().split(/\s+/).reverse(),
                word,
                line = [],
                lineNumber = 0,
                lineHeight = 1.4, // ems
                y = text.attr("y"),
                x = text.attr("x"),
                dy = parseFloat(text.attr("dy")),
                tspan = text.text(null).append("tspan").attr("x", x).attr("y", y).attr("dy", dy + "em");

            while (word = words.pop()) {
                line.push(word);
                tspan.text(line.join(" "));
                if (tspan.node().getComputedTextLength() > width) {
                    line.pop();
                    tspan.text(line.join(" "));
                    line = [word];
                    tspan = text.append("tspan").attr("x", x).attr("y", y).attr("dy", ++lineNumber * lineHeight + dy + "em").text(word);
                }
            }
        });
    }//wrap
    //Text indicating at what % each level is
    if (cfg.showText) {
        var axisLabel = axisGrid.selectAll(".axisLabel")
            .data(d3.range(1, (cfg.levels)).reverse())
            .attr("x", 4)
            .attr("y", function (d) {
                return -d * radius / cfg.levels;
            })
            .attr("dy", "0.4em")
            .attr("font-family", "sans-serif")
            .style("font-size", "12px")
            .attr("fill", "#111")
            .text(function (d, i) {
                var v = (maxValue - minValue) * d / cfg.levels + minValue;
                return Math.round(v).toFixed(2);
            });
        axisLabel.exit().remove();
        axisLabel.enter().append("text")
            .attr("class", "axisLabel")
            .attr("x", 4)
            .attr("y", function (d) {
                return -d * radius / cfg.levels;
            })
            .attr("dy", "0.2em")
            .attr("font-family", "sans-serif")
            .style("font-size", "12px")
            .attr("fill", "#111")
            .text(function (d, i) {
                var v = (maxValue - minValue) * d / cfg.levels + minValue;
                return Math.round(v).toFixed(2);
            });
        var legendg = cfg.legend.map(function (d, i) {
            return Object.keys(d).map(function (k) {
                return {key: k, value: d[k], index: i}
            })
        }).filter(d => d.length = 0);

        var subaxisg = axisGrid.selectAll(".axisLabelsub")
            .data(legendg);
        subaxisg.exit().remove();

        subaxisg.enter().append('g').attr('class', 'axisLabelsub');
        var subaxis = axisGrid.selectAll(".axisLabelsub");
        subaxis.selectAll('.axisLabelsubt')
            .data(d => d)
            .enter().append("text")
            .attr("class", "axisLabelsubt")
            .attr("x", function (d, i) {
                return d.key * radius / cfg.levels * Math.cos(angleSlice[d.index] - Math.PI / 2);
            })
            .attr("y", function (d, i) {
                return d.key * radius / cfg.levels * Math.sin(angleSlice[d.index] - Math.PI / 2);
            })
            // .attr("x", d => {4+d.key*radius/cfg.levels})
            // .attr("y", function(d){return -d.key*radius/cfg.levels;})
            .attr("dy", "0.2em")
            .attr("font-family", "sans-serif")
            .style("font-size", "12px")
            .attr("fill", "#111")
            .text(function (d) {
                return d.value;
            });
    }
    function correctId (id){
        if (typeof (id) === "string") {
            return id.replace(".", "");
        }else {
            return "Gen"
        }
    }
}//RadarChart