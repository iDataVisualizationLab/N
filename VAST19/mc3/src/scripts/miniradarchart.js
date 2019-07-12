function miniRadarChart(div, data, subfix, options) {
    var cfg = {
        radraradius: 100,
        margin: {top: 20, right: 55, bottom: 10, left: 55}, //The margins of the SVG
        levels: 3,				//How many levels or inner circles should there be drawn
        maxValue: 1, 			//What is the value that the biggest circle will represent
        labelFactor: 1.25, 	//How much farther than the radius of the outer circle should the labels be placed
        wrapWidth: 60, 		//The number of pixels after which a label needs to be given a new line
        opacityArea: 0.35, 	//The opacity of the area of the blob
        dotRadius: 4, 			//The size of the colored circles of each blog
        opacityCircles: 0.1, 	//The opacity of the circles of each blob
        strokeWidth: 1, 		//The width of the stroke around each blob
        roundStrokes: false,	//If true the area and stroke will follow a round path (cardinal-closed)
        color: function () {
            return 'black'
        },	//Color function
        schema: undefined,
        arrColor: ["#110066", "#4400ff", "#00cccc", "#00dd00", "#ffcc44", "#ff0000", "#660000"],
    };

    //Put all of the options into a variable called cfg
    if ('undefined' !== typeof options) {
        for (var i in options) {
            if ('undefined' !== typeof options[i]) {
                cfg[i] = options[i];
            }
        }//for i
    }//if
    var angleSlice, radarLine, radialAreaGenerator, radialAreaQuantile ;
    div.select('svg').remove();
    div.select('canvas').remove();
    // var canvas = div.append("canvas")
    //     .attr("width", cfg.radraradius*2)
    //     .attr("height", cfg.radraradius*2);
    var svg =  div.append('svg').attrs({
        width: cfg.radraradius*2,
        height: cfg.radraradius*2,
    });
    g = svg.append("g")
        .attr('class','radarmin')
        .attr('transform','translate('+cfg.radraradius+','+cfg.radraradius+')')
        .attr("clip-path", "url(#clip)");

    UpdateGradient();
    initradar();
    drawEmbedding(data);

    // var context = canvas.node().getContext("2d");

    function drawEmbedding(data) {

        let datapoint = g.selectAll(".linkLineg")
            .data(data);
        let datapointN = datapoint
            .enter().append("g")
            .attr("class", d=>"linkLineg "+fixstr(d.key));


        datapointN.append("clipPath")
            .attr("id",d=>fixstr("radra"+d.key+subfix))
            .append("path")
            .attr("d", d =>
                radarcreate(d));
        datapointN
            .append("rect")
            .style('fill', 'url(#minrGradient)')
            .attr("clip-path", d=>"url(#"+fixstr("radra"+d.key+subfix)+")")
            .attr("x",-cfg.radraradius)
            .attr("y",-cfg.radraradius)
            .attr("width",cfg.radraradius*2)
            .attr("height",cfg.radraradius*2);

        datapointN
            .append("path")
            .attr("class","Radarborder")
            .attr("d", d => radarcreate(d))
            .style("fill",'none')
            .style("stroke", "black")//'currentColor')
            .style("stroke-width", 0.5)
            .style("stroke-opacity", 0.5);


        datapoint.exit().remove();


        // TODO: need fix here
        g.selectAll(".linkLineg").selectAll('text')
            .text(function(d,i) {return d.key });



        //Create a wrapper for the blobs
        var blobWrapperg = g.selectAll(".linkLineg")
            .data(data);
        //Create the outlines
        blobWrapperg.exit().remove();
        var blobWrapper = blobWrapperg
            .enter().append("g")
            .attr("class", "linkLineg "+fixstr(d.key));

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
        var blobWrapperpath = blobWrapperg.select(".linkLineg");

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
        }else if (cfg.gradient){
            function drawMeanLine(paths){
                return paths
                    .attr("d", d =>radarLine(d))
                    .styles({"fill":'none',
                        'stroke':'black',
                        'stroke-width':0.5,
                        'stroke-dasharray': '1 2'});
            }
            function drawQuantileArea(paths){
                return paths
                    .attr("d", d =>radialAreaQuantile(d))
                    .styles({"fill":'none',
                        'stroke':'black',
                        'stroke-width':0.2});
            }
            //update the outlines
            blobWrapperg.select('.radarLine').transition().call(drawMeanLine);
            blobWrapperg.select('.radarQuantile').transition().call(drawQuantileArea);
            blobWrapperpath.style("fill", "none").transition()
                .attr("d", d => radialAreaGenerator(d))
                .style("stroke-width", () => cfg.strokeWidth + "px")
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
                .style("stroke-width", () => cfg.strokeWidth + "px")
                //.style("stroke-opacity", d => cfg.bin ? densityscale(d.bin.val.length) : 0.5)
                .style("stroke", (d, i) => cfg.color(i));
            blobWrapper
                .append("path").classed('radarLine',true).style("fill", "none").call(drawMeanLine);

            blobWrapper
                .append("path").classed('radarQuantile',true).style("fill", "none").call(drawQuantileArea);
        }
        else {
            blobWrapperpath.transition().attr("d", d => radarLine(d))
                .style("fill", "none")
                .style("stroke-width", () => cfg.strokeWidth + "px")
                .style("stroke-opacity", d => cfg.bin ? densityscale(d.bin.val.length) : 0.5)
                .style("stroke", (d, i) => cfg.color(i));
            //Create the outlines
            blobWrapper.append("path")
                .attr("class", "radarStroke")
                .attr("d", d => radarLine(d))
                .style("stroke-width", () => cfg.strokeWidth + "px")
                .style("stroke-opacity", d => cfg.bin ? densityscale(d.bin.val.length) : 0.5)
                .style("stroke", (d, i) => cfg.color(i))
                .style("fill", "none");
        }

    }
    function initradar (){
        var minValue, maxValue,range;
        // radar
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

        var allAxis = (data[0].map(function(i, j){return i.axis})),	//Names of each axis
            radius = Math.min(cfg.w/2, cfg.h/2), 	//Radius of the outermost circle
            Format = d3.format('.0%');			 	//Percentage formatting

        data = data.map(ditem=>{
            if (ditem.bin)
                ditem.bin.val = ditem.bin.val.map(v=>v.filter((d,i)=>allAxis.find(e=>e.text===ditem[i].axis)));

            const ditem_filtered = ditem.filter(d=>allAxis.find(e=>e.text===d.axis));
            let temp = _.sortBy(ditem_filtered,d=>allAxis.find(e=>e.text===d.axis).angle);
            temp.type = ditem.type;
            temp.bin = ditem.bin; return temp;});

        var rScale = d3.scaleLinear()
            .range([0, cfg.radraradius])
            .domain([minValue, maxValue]);

        radarLine = d3.radialLine()
        // .interpolate("linear-closed")
            .curve(d3.curveCatmullRom.alpha(0.5))
            .radius(function(d) { return rScale(d.value||d); })
            .angle(function(d,i) {  return getAngle(d,i); });

        radialAreaGenerator = d3.radialArea()
            .angle(function(d,i) {  return getAngle(d,i); })
            .innerRadius(function(d,i) {
                return rScale(d.minval);
            })
            .outerRadius(function(d,i) {
                return rScale(d.maxval);
            });

        radialAreaQuantile = d3.radialArea()
            .angle(function(d,i) {  return getAngle(d,i); })
            .innerRadius(function(d,i) {
                return rScale(d.q1);
            })
            .outerRadius(function(d,i) {
                return rScale(d.q3);
            });

        if(cfg.roundStrokes) {
            radarLine.curve(d3.curveCardinalClosed.tension(0.5));
            radialAreaGenerator.curve(d3.curveCardinalClosed.tension(0.5));
            radialAreaQuantile.curve(d3.curveCardinalClosed.tension(0.5));
        }

    }
    function fixstr(s) {
        return s.replace(/ |-|#/gi,'');
    }
    function UpdateGradient() {
        let rdef = svg.select('defs.gradient');
        let rg,rg2;
        if (rdef.empty()){
            rdef = svg.append("defs").attr('class','gradient')
            rg = rdef
                .append("radialGradient")
                .attr("id", "minrGradient");
        }
        else {
            rg = rdef.select('#minrGradient');
        }
        createGradient(rg,0);
        function createGradient(rg,limitcolor) {
            rg.selectAll('stop').remove();
            const legntharrColor = cfg.arrColor.length - 1;
            rg.append("stop")
                .attr("offset", "0%")
                .attr("stop-opacity", 0);
            rg.append("stop")
                .attr("offset", (limitcolor - 1) / legntharrColor * 100 + "%")
                .attr("stop-color", cfg.arrColor[limitcolor])
                .attr("stop-opacity", 0);
            cfg.arrColor.forEach((d, i) => {
                if (i > (limitcolor - 1)) {
                    rg.append("stop")
                        .attr("offset", i / legntharrColor * 100 + "%")
                        .attr("stop-color", d)
                        .attr("stop-opacity", i / legntharrColor);
                    if (i != legntharrColor)
                        rg.append("stop")
                            .attr("offset", (i + 1) / legntharrColor * 100 + "%")
                            .attr("stop-color", cfg.arrColor[i + 1])
                            .attr("stop-opacity", i / legntharrColor);
                }
            });
        }
    }
}