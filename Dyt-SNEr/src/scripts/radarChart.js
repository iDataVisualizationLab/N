/////////////////////////////////////////////////////////
/////////////// The Radar Chart Function ////////////////
/////////////// Written by Nadieh Bremer ////////////////
////////////////// VisualCinnamon.com ///////////////////
/////////// Inspired by the code of alangrafu ///////////
/////////////////////////////////////////////////////////

function RadarChart(id, data, options) {
    var cfg = {
        w: 300,				//Width of the circle
        h: 300,				//Height of the circle
        margin: {top: 20, right: 20, bottom: 20, left: 20}, //The margins of the SVG
        levels: 3,				//How many levels or inner circles should there be drawn
        maxValue: 1, 			//What is the value that the biggest circle will represent
        labelFactor: 1.25, 	//How much farther than the radius of the outer circle should the labels be placed
        wrapWidth: 60, 		//The number of pixels after which a label needs to be given a new line
        opacityArea: 0.35, 	//The opacity of the area of the blob
        dotRadius: 4, 			//The size of the colored circles of each blog
        opacityCircles: 0.1, 	//The opacity of the circles of each blob
        strokeWidth: 2, 		//The width of the stroke around each blob
        roundStrokes: false,	//If true the area and stroke will follow a round path (cardinal-closed)
        color: function(){return 'black'},	//Color function
        arrColor: ["#110066", "#4400ff", "#00cccc", "#00dd00", "#ffcc44", "#ff0000", "#660000"],
    };

    //Put all of the options into a variable called cfg
    if('undefined' !== typeof options){
        for(var i in options){
            if('undefined' !== typeof options[i]){ cfg[i] = options[i]; }
        }//for i
    }//if



    //If the supplied maxValue is smaller than the actual one, replace by the max in the data
    var maxValue = Math.max(cfg.maxValue, d3.max(data, function(i){return d3.max(i.map(function(o){return o.value;}))}));
    var minValue = 0;
    var colorLength = arrColor.length-1;
    var arrThresholds = arrColor.map((d,i)=>i/colorLength);
    var colorTemperature = d3.scaleLinear()
        .domain(arrThresholds)
        .range(arrColor)
        .interpolate(d3.interpolateHcl); //interpolateHsl interpolateHcl interpolateRgb

    var allAxis = (data[0].map(function(i, j){return i.axis})),	//Names of each axis
        total = allAxis.length,					//The number of different axes
        radius = Math.min(cfg.w/2, cfg.h/2), 	//Radius of the outermost circle
        Format = d3.format('%'),			 	//Percentage formatting
        angle1 = Math.PI * 2 / total,		//The width in radians of each "slice"
    angleSlice = [];
    for (var i=0;i<total;i++){
        angleSlice.push(angle1*i);
    }

    //Scale for the radius
    var rScale = d3.scaleLinear()
        .range([0, radius])
        .domain([minValue, maxValue]);

    /////////////////////////////////////////////////////////
    //////////// Create the container SVG and g /////////////
    /////////////////////////////////////////////////////////

    //Remove whatever chart with the same id/class was present before
    d3.select(id).selectAll("svg").nodes().forEach(d=>{
        if (d3.select(d).attr("class")!==("radar"+id.replace(".","")))
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
            .attr("class", "radar" + id.replace(".",""));
        //Append a g element
        g = svg.append("g")
            .attr("id","radarGroup")
            .attr("transform", "translate(" + (cfg.w/2 + cfg.margin.left) + "," + (cfg.h/2 + cfg.margin.top) + ")");
    }


    /////////////////////////////////////////////////////////
    ////////// Glow filter for some extra pizzazz ///////////
    /////////////////////////////////////////////////////////

    //Filter for the outside glow
    if (first) {
        const rg = svg.append("defs").append("radialGradient")
            .attr("id", "rGradient");
        const limitcolor = 0;
        const legntharrColor = arrColor.length-1;
        rg.append("stop")
            .attr("offset","0%")
            .attr("stop-opacity", 0);
        rg.append("stop")
            .attr("offset", (limitcolor-1) / legntharrColor * 100 + "%")
            .attr("stop-color", arrColor[limitcolor])
            .attr("stop-opacity", 0);
        arrColor.forEach((d,i)=> {
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
            .style("stroke", function (d,i) {
                var v = (maxValue - minValue) * d / cfg.levels + minValue;
                return colorTemperature(v);
            }).style("stroke-width", 0.3)
            .style("stroke-opacity", 1)
            .style("fill-opacity", cfg.opacityCircles)
            .style("filter", "url(#glow)");

        //Text indicating at what % each level is
        axisGrid.selectAll(".axisLabel")
            .data(d3.range(1, (cfg.levels + 1)).reverse())
            .enter().append("text")
            .attr("class", "axisLabel")
            .attr("x", 4)
            .attr("y", function (d) {
                return -d * radius / cfg.levels;
            })
            .attr("dy", "0.4em")
            .style("font-size", "10px")
            .attr("fill", "#737373")
            .text(function (d, i) {
                return Format(maxValue * d / cfg.levels);
            });

        /////////////////////////////////////////////////////////
        //////////////////// Draw the axes //////////////////////
        /////////////////////////////////////////////////////////

        //Create the straight lines radiating outward from the center
        var axis = axisGrid.selectAll(".axis")
            .data(allAxis)
            .enter()
            .append("g")
            .attr("class", "axis");
        //Append the lines
        axis.append("line")
            .attr("x1", 0)
            .attr("y1", 0)
            .attr("x2", function (d, i) {
                return rScale(maxValue * 1.1) * Math.cos(angleSlice[i] - Math.PI/2);
            })
            .attr("y2", function (d, i) {
                return rScale(maxValue * 1.1) * Math.sin(angleSlice[i] - Math.PI/2);
            })
            .attr("class", "line")
            .style("stroke", "white")
            .style("stroke-width", "2px");

        //Append the labels at each axis
        axis.append("text")
            .attr("class", "legend")
            .style("font-size", "11px")
            .attr("text-anchor", "middle")
            .attr("dy", "0.35em")
            .attr("x", function (d, i) {
                return rScale(maxValue * cfg.labelFactor) * Math.cos(angleSlice[i] - Math.PI/2);
            })
            .attr("y", function (d, i) {
                return rScale(maxValue * cfg.labelFactor) * Math.sin(angleSlice[i] - Math.PI/2);
            })
            .text(function (d) {
                return d
            })
            .call(wrap, cfg.wrapWidth);
    }

    /////////////////////////////////////////////////////////
    ///////////// Draw the radar chart blobs ////////////////
    /////////////////////////////////////////////////////////

    //The radial line function
    //The radial line function
    var radarLine = d3.radialLine()
        .curve(d3.curveCardinalClosed.tension(0))
        .radius(function(d) { return rScale(d.value); })
        .angle(function(d,i) {  return angleSlice[i]; });


    //Create a wrapper for the blobs
    var blobWrapperg = g.selectAll(".radarWrapper")
        .data(data);
    blobWrapperg.exit().remove();
    var blobWrapper = blobWrapperg
        .enter().append("g")
        .attr("class", "radarWrapper");


    //Create the outlines
    //update the outlines
    var blobWrapperpath = blobWrapperg.select(".radarStroke");
    blobWrapperpath.attr("d", d =>
        radarLine(d)).transition()
        .style("stroke-width", () => cfg.strokeWidth + "px")
        .style("stroke-opacity", d => cfg.bin ? densityscale(d.bin.val.length) : 0.5)
        .style("stroke", (d, i) => cfg.color(i))
        .style("fill", "none");
    //Create the outlines
    blobWrapper.append("path")
        .attr("class", "radarStroke")
        .attr("d", d =>
            radarLine(d)).transition()
        .style("stroke-width", () => cfg.strokeWidth + "px")
        .style("stroke-opacity", d => cfg.bin ? densityscale(d.bin.val.length) : 0.5)
        .style("stroke", (d, i) => cfg.color(i))
        .style("fill", "none");


    //Update the circles
    blobWrapper = g.selectAll(".radarWrapper");
    //Append the circles
    var circleWrapper = blobWrapper.selectAll(".radarCircle")
        .data(function(d,i) {
            d.forEach(function(d2){
                d2.index=i;
            });
            return d;
        })
        .attr("r", function(d){
            if (cfg.radiuschange)
                return 1+Math.pow((d.index+2),0.3);
            return cfg.dotRadius;
        })
        .attr("cx", function(d,i){ return rScale(d.value) * Math.cos(angleSlice[i] - Math.PI/2); })
        .attr("cy", function(d,i){ return rScale(d.value) * Math.sin(angleSlice[i] - Math.PI/2); })
        // .style("fill", function(d,i,j) {  return cfg.color(d.index); })
        .style("fill", function(d){
            return colorTemperature(d.value);
        })
        .style("fill-opacity", 0.5)
        .style("stroke", "#000")
        .style("stroke-width", 0.2)
        .style("visibility", (d, i) => (cfg.bin ) ? "hidden" : "visible");
    circleWrapper.exit().remove();
    circleWrapper
        .enter().append("circle")
        .attr("class", "radarCircle")
        .attr("r", function(d){
            if (cfg.radiuschange)
                return 1+Math.pow((d.index+2),0.3);
            return cfg.dotRadius;
        })
        .attr("cx", function(d,i){ return rScale(d.value) * Math.cos(angleSlice[i] - Math.PI/2); })
        .attr("cy", function(d,i){ return rScale(d.value) * Math.sin(angleSlice[i] - Math.PI/2); })
        // .style("fill", function(d,i,j) {  return cfg.color(d.index); })
        .style("fill", function(d){
            return colorTemperature(d.value);
        })
        .style("fill-opacity", 0.5)
        .style("stroke", "#000")
        .style("stroke-width", 0.2)
        .style("visibility", (d, i) => (cfg.bin ) ? "hidden" : "visible");

    /////////////////////////////////////////////////////////
    //////// Append invisible circles for tooltip ///////////
    /////////////////////////////////////////////////////////

    //Wrapper for the invisible circles on top
    var blobCircleWrapper = g.selectAll(".radarCircleWrapper")
        .data(data)
        .enter().append("g")
        .attr("class", "radarCircleWrapper");

    //Append a set of invisible circles on top for the mouseover pop-up
    //Wrapper for the invisible circles on top
    var blobCircleWrapperg = g.selectAll(".radarCircleWrapper")
        .data(data);
    blobCircleWrapperg.exit().remove();
    blobCircleWrapperg.enter().append("g")
        .attr("class", "radarCircleWrapper");
    var blobCircleWrapper = g.selectAll(".radarCircleWrapper");
    //Append a set of invisible circles on top for the mouseover pop-up
    var blobCircleWrappergg = blobCircleWrapper.selectAll(".radarInvisibleCircle")
        .data(function(d,i) { return d; })
        .attr("r", cfg.dotRadius*1.5)
        .attr("cx", function(d,i){ return rScale(d.value) * Math.cos(angleSlice[i] - Math.PI/2); })
        .attr("cy", function(d,i){ return rScale(d.value) * Math.sin(angleSlice[i] - Math.PI/2); })
        .style("fill", "none")
        .style("pointer-events", "all")
        .on("mouseenter", function(d,i) {
            newX =  parseFloat(d3.select(this).attr('cx')) - 10;
            newY =  parseFloat(d3.select(this).attr('cy')) - 10;

            tooltip
                .attr('x', newX)
                .attr('y', newY)
                .text(Format(d.value))
                .transition().duration(200)
                .style('opacity', 1);
        })
        .on("mouseleave", function(){
            tooltip.transition().duration(200)
                .style("opacity", 0);
        });
    blobCircleWrappergg.exit().remove();
    blobCircleWrappergg
        .enter().append("circle")
        .attr("class", "radarInvisibleCircle")
        .attr("r", cfg.dotRadius*1.5)
        .attr("cx", function(d,i){ return rScale(d.value) * Math.cos(angleSlice[i] - Math.PI/2); })
        .attr("cy", function(d,i){ return rScale(d.value) * Math.sin(angleSlice[i] - Math.PI/2); })
        .style("fill", "none")
        .style("pointer-events", "all")
        .on("mouseenter", function(d,i) {
            newX =  parseFloat(d3.select(this).attr('cx')) - 10;
            newY =  parseFloat(d3.select(this).attr('cy')) - 10;

            tooltip
                .attr('x', newX)
                .attr('y', newY)
                .text(Format(d.value))
                .transition().duration(200)
                .style('opacity', 1);
        })
        .on("mouseleave", function(){
            tooltip.transition().duration(200)
                .style("opacity", 0);
        });

    //Set up the small tooltip for when you hover over a circle
    var tooltip = g.selectAll(".tooltip");
    if (first) {
        tooltip = g.append("text")
            .attr("class", "tooltip")
            .style("opacity", 0);
    }

    /////////////////////////////////////////////////////////
    /////////////////// Helper Function /////////////////////
    /////////////////////////////////////////////////////////

    //Taken from http://bl.ocks.org/mbostock/7555321
    //Wraps SVG text
    function wrap(text, width) {
        text.each(function() {
            var text = d3.select(this),
                words = text.text().split(/\s+/).reverse(),
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
            .attr("dy", "0.4em")
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
            .attr("dy", "0.4em")
            .attr("font-family", "sans-serif")
            .style("font-size", "12px")
            .attr("fill", "#111")
            .text(function (d) {
                return d.value;
            });
    }

}//RadarChart