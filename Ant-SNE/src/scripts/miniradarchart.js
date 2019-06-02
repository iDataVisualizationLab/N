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
    var angleSlice, radarcreate ;
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
    initradar(data[0].length);
    drawEmbedding(data);

    // var context = canvas.node().getContext("2d");
    // svg2canvas()
    function svg2canvas(){
        // Convert SVG to Canvas
        // see: https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API/Drawing_DOM_objects_into_a_canvas
        var DOMURL = window.URL || window.webkitURL || window;

        var svgString = domNodeToString(svg.node());

        var image = new Image();
        var svgBlob = new Blob([svgString], { type: "image/svg+xml;charset=utf-8" });
        var url = DOMURL.createObjectURL(svgBlob);

        image.onload = function() {
            context.drawImage(image, 0, 0);
            DOMURL.revokeObjectURL(url);
        }

        image.src = url;
    }
    // Get the string representation of a DOM node (removes the node)
    function domNodeToString(domNode) {
        var element = document.createElement("div");
        element.appendChild(domNode);
        return element.innerHTML;
    }
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
            .text(function(d,i) {return d.key })

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
            .range([0,cfg.radraradius])
            .domain([0, 1]);
        radarcreate = d3.radialLine()
            .curve(d3.curveCatmullRomClosed.alpha(0.5))
            .radius(function(d) {
                return rScale(d); })
            .angle(function(d,i) {  return angleSlice[i]; });
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