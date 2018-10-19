// var categories = ["PRODUCT","ORG","PERSON","MONEY","PERCENT"];//["ORG","GPE","NORP","LOC","PERSON","PRODUCT","EVENT","FAC","MONEY","PERCENT"];
var categoriesgroup ={  "PRODUCT":["PRODUCT","LAW","EVENT"],
                        "PERSON":["PERSON"],
                        "NATION":["LOC","GPE"], // ORG merge GPE
                        "ORG":["ORG"],
                        "NUMBER": ["MONEY","PERCENT","ORDINAL"]};
var categories=[];
var outputFormat = d3.timeFormat('%b %d %Y');
var parseTime = (d => Date.parse(d));
var TermwDay,
    ArticleDay,
    svg;
var lineColor = d3.scaleLinear()
    .domain([0,120])
    .range(['#558', '#000']);
var x = d3.scalePoint();
var wscale = 0.1;
var timeline;
var svgHeight = 2000;
var mainconfig = {
    renderpic: false,
    wstep: 10,
};
var wordTip = d3.tip()
    .attr('class', 'd3-tip')
    .offset([-10, 0])
    .html(function (d) {
        var str = '';
        str += "<table>";
        str += "<tr>";
        str += '<th colspan="2">' + (d.text||d.key) + ' : ' + (d.frequency||d.value.articlenum) + "-" + outputFormat(d.data[0].time) +'</th>';
        // if(d.key==undefined)
        //     str += '<h4>' + outputFormat(d.data[0].time) + '</h4>';
        str + "</tr>";
        (d.data||d.value.data).forEach(t => {
            var ar = (t.source==undefined)?ArticleDay.filter(f=> f.key == outputFormat(t.time))[0].value.data.find(f=> f.title == t.title):t;
            str += "<tr>";
            str += "<td>" + ar.source + "</td>";
            str += "<td class=pct>" + ar.title + "</td>";
            str + "</tr>";
        });

        str += "</table>";

        return str;
    });
var opts = {
    lines: 9, // The number of lines to draw
    length: 9, // The length of each line
    width: 5, // The line thickness
    radius: 14, // The radius of the inner circle
    color: '#EE3124', // #rgb or #rrggbb or array of colors
    speed: 1.9, // Rounds per second
    trail: 40, // Afterglow percentage
    className: 'spinner', // The CSS class to assign to the spinner
};
var spinner ;
$(document).ready(function () {
    var target = document.getElementById('timelinewImg');
    spinner = new Spinner(opts).spin(target);
    d3.queue()
        .defer(d3.json,"src/data/dataout.json")
        .await(ready);

});
function wordCloud(selector,config) {
    function draw(data) {
        d3.select(selector).select('svg').selectAll('g').remove();
        var dataWidth;
        var width;
        // document.getElementById("mainsvg").setAttribute("width",width);
        var font = "Impact";
        var interpolation = d3.curveCardinal;
        var bias = 200;
        var offsetLegend = 50;
        var axisPadding = 10;
        var margins = {top: 0, right: 0, bottom: 0, left: 0};
        var min = 10;
        var max = 25;
        lineColor.domain([min, max]);
        width = config.width;
        var height = config.height;
        height = height - margins.top - margins.bottom;

        //set svg data.
        svg.attrs({
            width: width,
            height: height
        });
        svg.call(wordTip);
        var area = d3.area()
            .curve(interpolation)
            .x(function (d) {
                return (d.x);
            })
            .y0(function (d) {
                return d.y0;
            })
            .y1(function (d) {
                return (d.y0 + d.y);
            });

        //Draw the word cloud

        var mainGroup = svg.append('g').attr('transform', 'translate(' + margins.left + ',' + (margins.top) + ')');
        var wordStreamG = mainGroup.append('g');
        var k = 0;
        // if (pop) {
        //     dataWidth = data.length * 20
        // }
        // else {
        //     dataWidth = data.length * 100;
        // }

        //Layout data
        var ws = d3.wordStream()
            .size([width - margins.left - margins.right, height])
            .interpolate(interpolation)
            .fontScale(d3.scaleLinear())
            .minFontSize(min)
            .maxFontSize(max)
            .data(data)
            .font(font);
        var boxes = ws.boxes(),
            minFreq = ws.minFreq(),
            maxFreq = ws.maxFreq();

        //Display data

        var color = d3.scaleOrdinal(d3.schemeCategory10);
        //Display time axes
        var dates = [];
        boxes.data.forEach(row => {
            dates.push(row.date);
        });

        x.domain(dates);
        var xrange = x.range();
        var boxwidth = width/data.length;
        // x.range([xrange[0] + boxwidth, width - boxwidth])
        mainGroup.attr('transform', 'translate(' + margins.left + ',' + margins.top + ')');

        var legend = boxes.layers.map(d=> {return {'key' : d.key, 'pos': d.offset }});

        var legendg = timeline.append("g")
            .attr("class", "legend")
            .attr("transform", "translate("+ (-20) +"," + 0 + ")")
            .append("g")
            .attr("class","sublegend")
            .selectAll(".lengendtext")
            .data(legend)
            .enter()
                .append("text")
                .attr("class","lengendtext")
                .style("text-anchor", "middle")
                .attr("transform", d=> "translate(0,"+d.pos+") rotate(-90)")
                .text(d=>d.key);

        // =============== Get BOUNDARY and LAYERPATH ===============
        var lineCardinal = d3.line()
            .x(function(d) { return d.x; })
            .y(function(d) { return d.y; })
            .curve(interpolation);

        var boundary = [];
        for (var i = 0; i < boxes.layers[0].length; i ++){
            var tempPoint = Object.assign({}, boxes.layers[0][i]);
            tempPoint.y = tempPoint.y0;
            boundary.push(tempPoint);
        }

        for (var i = boxes.layers[boxes.layers.length-1].length-1; i >= 0; i --){
            var tempPoint2 = Object.assign({}, boxes.layers[boxes.layers.length-1][i]);
            tempPoint2.y = tempPoint2.y + tempPoint2.y0;
            boundary.push(tempPoint2);
        }       // Add next (8) elements

        var lenb = boundary.length;

        // Get the string for path

        var combined = lineCardinal( boundary.slice(0,lenb/2))
            + "L"
            + lineCardinal( boundary.slice(lenb/2, lenb))
                .substring(1,lineCardinal( boundary.slice(lenb/2, lenb)).length)
            + "Z";


        // ============== DRAW CURVES =================
        var topics = boxes.topics;
        var stokepath = mainGroup.selectAll('.stokepath')
            .data(boxes.layers)
            .attr('d', area)
            .style('fill', function (d, i) {
                return color(i);
            })

            .attrs({
                'fill-opacity': 0.1,      // = 1 if full color
                // stroke: 'black',
                'stroke-width': 0.3,
                topic: function(d, i){return topics[i];}
            });
        stokepath.exit().remove();
        stokepath
            .enter()
            .append('path')
            .attr('class','stokepath')
            .attr('d', area)
            .style('fill', function (d, i) {
                return color(i);
            })
            .attrs({
                'fill-opacity': 0.1,      // = 1 if full color
                // stroke: 'black',
                'stroke-width': 0.3,
                topic: function(d, i){return topics[i];}
            });
        // ARRAY OF ALL WORDS
        var allWords = [];
        d3.map(boxes.data, function(row){
            boxes.topics.forEach(topic=>{
                allWords = allWords.concat(row.words[topic]);
            });
        });
        //Color based on term
        var terms = [];
        for(i=0; i< allWords.length; i++){
            terms.concat(allWords[i].text);
        }

        // Unique term de to mau cho cac chu  cung noi dung co cung mau


        var opacity = d3.scaleLog()
            .domain([minFreq, maxFreq])
            .range([0.4,1]);

        // Add moi chu la 1 element <g>, xoay g dung d.rotate
        var placed = true; // = false de hien thi nhung tu ko dc dien

        var gtext = mainGroup.selectAll('.gtext')
            .data(allWords)
            .attrs({transform: function(d){return 'translate('+d.x+', '+d.y+')rotate('+d.rotate+')';}});

        gtext.selectAll('.stext')
            .text(function(d){return d.text;})
            .transition().attr('font-size', function(d){return d.fontSize + "px";} )// add text vao g
            .attrs({
                topic: function(d){return d.topic;},
                visibility: function(d){ return d.placed ? (placed? "visible": "hidden"): (placed? "hidden": "visible");}
            })
            .styles({
                'font-family': font,
                'font-size': function(d){return d.fontSize + "px";},
                'fill': function(d){return color(d.topicIndex)},//function(d){return color(d.topicIndex);},
                'fill-opacity': function(d){return opacity(d.frequency)},
                'text-anchor': 'middle',
                'alignment-baseline': 'middle'
            });
        gtext.exit().remove();
        gtext.enter()
            .append('g')
            .attr('class','gtext')
            .attrs({transform: function(d){return 'translate('+d.x+', '+d.y+')rotate('+d.rotate+')';}})
            .append('text')
            .attr("class",'stext')
            .text(function(d){return d.text;})
            .transition().attr('font-size', function(d){return d.fontSize + "px";} )// add text vao g
            .attrs({
                topic: function(d){return d.topic;},
                visibility: function(d){ return d.placed ? (placed? "visible": "hidden"): (placed? "hidden": "visible");}
            })
            .styles({
                'font-family': font,
                'font-size': function(d){return d.fontSize + "px";},
                'fill': function(d){return color(d.topicIndex)},
                'fill-opacity': function(d){return opacity(d.frequency)},
                'text-anchor': 'middle',
                'alignment-baseline': 'middle'
            });
        gtext.exit().selectAll('*').remove();
        gtext.exit().remove();
        // When click a term
        //Try
        var prevColor;
        //Highlight
        mainGroup.selectAll('.stext').on('mouseenter', function(d){
            var thisText = d3.select(this);
            thisText.style('cursor', 'pointer');
            prevColor = thisText.attr('fill')||thisText.style('fill');

            var text = thisText.text();
            var topic = thisText.attr('topic');
            mainGroup.selectAll('.stext').style('fill-opacity', 0.2);
            var allTexts = mainGroup.selectAll('.stext').filter(t =>{
                var sameTerm = t && t.text === text &&  t.topic === topic;
                var sameArticle = false;
                t.data.forEach(tt=>(sameArticle = sameArticle || (d.data.find(e=>e.title==tt.title)!=undefined)));
                return sameTerm || sameArticle;
            });
            allTexts.style('fill-opacity', 1);
            // var allSubjects = allTexts.filter(t=> t && t.text === text &&  t.topic === topic);
            // allSubjects.attrs({
            //     stroke: prevColor,
            //     'stroke-width': 1.5
            // });

            wordTip.show(d);
        });

        mainGroup.selectAll('.stext').on('mouseout', function(d){
            var thisText = d3.select(this);
            thisText.style('cursor', 'default');
            var text = thisText.text();
            var topic = thisText.attr('topic');
            var allTexts = mainGroup.selectAll('.stext').filter(t =>
                t && !t.cloned
            );

            allTexts
                .style('fill-opacity', function(d){return opacity(d.frequency)})
                .attrs({
                    stroke: 'none',
                    'stroke-width': '0'
                });
            wordTip.hide();
        });
        //Click
        mainGroup.selectAll('.stext').style("fill", function (d, i) {

        });
        mainGroup.selectAll('.stext').on('click', function(d){

            var thisText = d3.select(this);
            var text = thisText.text();
            var topic = thisText.attr('topic');
            var allTexts = mainGroup.selectAll('.stext').filter(t =>{
                var sameTerm = t && t.text === text &&  t.topic === topic;
                var sameArticle = false;
                t.data.forEach(tt=>(sameArticle = sameArticle || (d.data.find(e=>e.title==tt.title)!=undefined)));
                return sameTerm || sameArticle;
            });
            d3.selectAll(".article")
                .filter(a=>  allTexts._groups[0].find(d=> outputFormat(d.__data__.data[0].time)==a.key) != undefined)
                .style("fill","#ffc62a")
                .style("filter","url(#glow)");
            //Select the data for the stream layers
            var streamLayer = d3.select("path[topic='"+ topic+"']" ).datum();
            //Push all points
            var points = Array();

            streamLayer.forEach((elm,i) => {
                var item = elm.data.words[topic].filter(f=>f.text==text)[0];
                if (item == undefined)
                    item =[];
                else
                    item = item.data.map(t=>ArticleDay.filter(f=> f.key == outputFormat(t.time))[0].value.data.find(f=> f.title == t.title))
                points.push({
                    x: elm.x,
                    y: boxwidth/3*item.length,
                    data: item,
                    n:0,
                });
            });
            allTexts._groups[0].forEach(t => {
                let data = t.__data__;
                let fontSize = data.fontSize;
                let thePoint = points[data.timeStep+1];//+1 since we added 1 to the first point and 1 to the last point.
                let delta = 0;
                if (data.text !== text)
                    delta = thePoint.n;
                points[data.timeStep+1].n = points[data.timeStep+1].n  + (fontSize+5);
                //Set it to visible.
                //Clone the nodes.
                let clonedNode = t.cloneNode(true);
                d3.select(clonedNode).attrs({
                    visibility: "visible",
                    stroke: 'none',
                    'stroke-size': 0,
                });
                let clonedParentNode = t.parentNode.cloneNode(false);
                clonedParentNode.appendChild(clonedNode);

                t.parentNode.parentNode.appendChild(clonedParentNode);
                var cloner = d3.select(clonedParentNode).attrs({
                    cloned: true,
                    topic: topic
                });
                cloner.transition().duration(300).attrs({
                    transform: function(){return 'translate('+thePoint.x+','+(thePoint.y+height/2+delta+fontSize/2)+')';},
                });
            });


            // points[0].y = points[1].y;//First point
            // points[points.length-1].y = points[points.length-2].y;//Last point
            var wimg = wordStreamG
                .append('g')
                .attr('class','stackg')
                .attr('transform','translate(0,'+height/2+')')
                .selectAll('.stackimgg')
                .data(points.slice(1, points.length-1))
                .enter()
                    .append('g')
                    .attr('class','stackimgg')
                    .attr('transform',d=>'translate('+d.x+',0)');
            // var max = 0;
            // var min = 0;
            var img = wimg.selectAll('.stackimg')
                .data(d=>d.data)
                    .enter()
                    .append('rect')
                    .attr('class','stackimg')
                    // .attr('d', area)
                    //.style('fill', prevColor)
                    .attr("fill",d => "url(#"+d.time+")")
                    .attr('y',(d,i)=>{
                        var y = i*boxwidth*2/3;
                        // max = max< y? y:max;
                        // min = min> y? y:min;
                        return y;})
                    .attrs({
                        'fill-opacity': 1,
                        topic: topic,
                        wordStream: true,
                        x: 0,
                        width: boxwidth,
                        height: boxwidth*2/3

                    });
                // .attr('xlink:href',d=>d.url);

            wimg.transition().duration(600)
                .attr('transform', (d, i)=> 'translate('+d.x+',-'+d.data.length*boxwidth*2/3/2+')');
            wordStreamG.select('.stackg');
            //Hide all other texts
            var allOtherTexts = mainGroup.selectAll('.stext').filter(t =>{
                return t && !t.cloned ;
            });
            allOtherTexts.attr('visibility', 'hidden');

        });



        topics.forEach(topic=>{
            d3.select("path[topic='"+ topic+"']" ).on('click', function(){
                wordStreamG.selectAll('.stackg').remove();
                mainGroup.selectAll('.stext').filter(t=>{
                    return t && !t.cloned && t.placed;
                }).attrs({
                    visibility: 'visible'
                });
                //Remove the cloned element
                document.querySelectorAll("g[cloned='true']").forEach(node=>{
                    node.parentNode.removeChild(node);
                });
                //Remove the added path for it
                document.querySelectorAll("path[wordStream='true']").forEach(node=>{
                    node.parentNode.removeChild(node);
                });
                d3.selectAll(".article")
                    .style("fill","lightblue")
                    .style("filter","");
            });

        });
    }
    return {
        update: function (words) {
            draw(words);
        }
    }
}
function ready (error, data){
    var margin = {top: 20, right: 100, bottom: 100, left: 100};
    var width = $("#timelinewImg").width() - margin.left - margin.right;
    width = Math.max(width,mainconfig.wstep*);
    var height = svgHeight - margin.bottom - margin.top;

    // parse the date / time


    timeline = d3.select("#timelinewImg")
        .append('svg')
        .attr("width", width + margin.left + margin.right)
        .attr("height", svgHeight)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
    var rc = 1;
// set the ranges
    //var x = d3.scaleTime().range([0, width]);
    x.range([0, width]);
    var y = d3.scaleLinear().range([height/2, 0]);
    var simulation = d3.forceSimulation()
        .force("y", d3.forceY(height*wscale/2).strength(0.05));
    svg = timeline.append("g")
        .attr("transform", "translate(" + 0 + "," + height*wscale + ")")
        .attr("id","tagCloud")
        .append("svg")
        .attr("width", width)
        .attr("height", height*(1-wscale));
    var configwc = {width: width,height: height*(1-wscale)};
    myWordCloud = wordCloud('#tagCloud',configwc);
    if (error) throw error;
    // format the data
    //data =data.filter(d=>d.source=="reuters");
    data.forEach(function(d) {
        if(d.source !== "reuters")
            d.time = parseTime(d.time);
    });
    handledata(data);
    myWordCloud.update(TermwDay);
    // Scale the range of the data
    //x.domain(d3.extent(data, function(d) { return d.time; }));
    //y.domain([0, d3.max(data, function(d) { return d.close; })]);
    // simulation.force("x", d3.forceX(d => x(outputFormat(d.time))).strength(0.05));

    simulation.force("x", d3.forceX(d => x(d.key)).strength(0.05))
        .force("collide", d3.forceCollide(d=>rcscale(d.value.articlenum)));
    //bubbles
    var defs = d3.select("#timelinewImg").select('g').append("defs");
    var filter = defs.append("filter")
        .attr("id","glow");
    filter.append("feGaussianBlur")
        .attr("stdDeviation","3.5")
        .attr("result","coloredBlur");
    var feMerge = filter.append("feMerge");
    feMerge.append("feMergeNode")
        .attr("in","coloredBlur");
    feMerge.append("feMergeNode")
        .attr("in","SourceGraphic");
    var pic = defs.selectAll(".circle-pattern")
        .data(data).enter().append("pattern")
        .attr("id", function (d) {
            return d.time;
        })
        .attr("height", "100%")
        .attr("width", "100%")
        .attr("class","circle-pattern")
        .attr("patternContentUnits", "objectBoundingBox")
            .append("image")
            .attr("height", 1).attr("width", 1)
            .attr("preserveAspectRatio", "none")
            .attr("xmlns:xlink", "http://www.w3.org/1999/xlink")
            .attr("xlink:href", function (d) {
                return mainconfig.renderpic? d.urlToImage:"";
            });

    pic.on("error", function(){
        let el = d3.select(this);
        el.attr("xlink:href", "src/img/bb.jpg");
        el.on("error", null);
    })
    // var circles = timeline.selectAll(".img")
    //     .data(data)
    //     .enter().append("circle")
    //     .attr("class", "img")
    //     .attr("r",rc)
    //     .attr("fill","lightblue");
    // //.attr("fill",d => "url(#"+d.time+")");
    // simulation.nodes(data)
    //     .on('tick',ticked);
    var rcscale = d3.scaleLinear().domain(d3.extent(ArticleDay,(d=> d.value.articlenum))).range([2,20]);
    var circles = timeline.selectAll(".article")
        .data(ArticleDay)
        .enter().append("circle")
        .attr("class", "article")
        .attr("r",d=> rcscale(d.value.articlenum))
        .attr("fill","lightblue");
    circles.on("mouseover", d=>wordTip.show(d))
        .on("mouseout", ()=>wordTip.hide());
    //.attr("fill",d => "url(#"+d.time+")");
    simulation.nodes(ArticleDay);
        //.on('tick',ticked);
    // Add the X Axis
    timeline.append("g")
        .attr("class", "axis")
        .attr("transform", "translate(0," + height*wscale + ")")
        .call(d3.axisBottom(x)
        .tickValues(x.domain().filter(function(d,i){ return !(i%10)})))
            //.tickFormat(d3.timeFormat("%B %d, %Y")))
        .selectAll("text")
        .style("text-anchor", "end")
        .attr("dx", "-.8em")
        .attr("dy", ".15em")
        .attr("transform", "rotate(-65)");
    timeline.select('.sublegend')
        .attr("transform", "translate(" + 0 + "," + height*wscale + ")");
    timeline.select('.legend')
        .append("text")
        .style("text-anchor", "middle")
        .attr("transform", "translate(0,"+height*wscale/2+") rotate(-90)")
        .text('NEWS');
    // Add the Y Axis
    // svg.append("g")
    //     .attr("class", "axis")
    //     .call(d3.axisLeft(y));
    function ticked(){
        circles.attr("cx",d=> d.x)
            .attr("cy",d=> d.y);
    }
    spinner.stop();

}
function handledata(data){
    data.sort((a,b)=> a.time-b.time);
    var termscollection = blacklist(data);

    //sort out term for 1 article

    var nested_data = d3.nest()
        .key(function(d) { return d.title; })
        .key(function(d) { return d.term; })
        .rollup(function(words) { return {frequency: words.length,data:words[0]}; })
        .entries(termscollection);
    termscollection.length = 0;
    nested_data.forEach(d=> d.values.forEach(e=> termscollection.push(e.value.data)))
    // done -sort
    nested_data = d3.nest()
        .key(function(d) { return outputFormat(d.time); })
        .key(function(d) { return d.category; })
        .key(function(d) { return d.term; })
        .rollup(function(words) { return {frequency: words.length,data:words}; })
        .entries(termscollection);

    nested_data = nested_data.slice(1,nested_data.length-1);
    nested_data = nested_data.filter(d=> parseTime(d.key)> parseTime('Apr 1 2018'));
    ArticleDay = d3.nest()
        .key(function(d) { return outputFormat(d.time); })
        .rollup(function(words) { return {articlenum: words.length,data:words}; })
        .entries(data);
    ArticleDay=ArticleDay.filter(d=> nested_data.find(e=> e.key==d.key));
    TermwDay = nested_data.map(d=>{
        var words = {};
        categories.forEach( topic =>
        {
            var w = d.values.filter(wf => wf.key == topic)[0];
            if (w != undefined) {
                words[w.key] = w.values.map(
                    text => {
                        return {
                            text: text.key,
                            sudden: 0,
                            topic: w.key,
                            frequency: text.value.frequency,
                            data: text.value.data,
                        };
                    })
            }else{
                words[topic] =[];
            }
        });
        return {'date': d.key,
         'words': words};});
    startDate = TermwDay[0].date;
    endDate = TermwDay[TermwDay.length-1].date;
    fillData(endDate, startDate)


}

function fillData(endDate, startDate) {
    var d = [],
        dd = [],
        len = TermwDay.length,
        now = new Date(startDate),
        last = new Date(endDate),
        iterator = 0;

    while (now <= last) {
        var y = 0;
        var yy = 0;
        try {
            var presenttime = new Date(TermwDay[iterator].date);
            if (iterator < len && (now.getTime() == presenttime.getTime())) {
                y = TermwDay[iterator].words;
                yy = ArticleDay[iterator].value;
                ++iterator;
            }
        }
        catch (exc) {
            // console.log(iterator);
            // debugger;
        }
        if (y==0) {
            y={};
            categories.forEach(c => y[c]=[]);
            yy = {articlenum: 0, data:[]};
        }
        dd.push({"key": outputFormat(new Date(now)), "value": yy});
        d.push({"date": outputFormat(new Date(now)), "words": y});
        now["setDate"](now.getDate() + 1);
    }
    ArticleDay = dd;
    TermwDay = d;
}

function blacklist(data){
    categories = Object.keys(categoriesgroup);
    var categoriesmap = {};
    for ( k in categoriesgroup)
        categoriesgroup[k].forEach(kk=> categoriesmap[kk]= k);
    var blackw =["cnbc","CNBC","U.S.","reuters","Reuters","CNBC.com","EU"];
    var termscollection = [];
    data.forEach(d=>{
        d.keywords.filter(w => {
            var key = false;
            //categories.forEach(c=> key = key || ((w.category==c)&&(blackw.find(d=>d==w.term)== undefined)));
            key = key || ((blackw.find(d=>d==w.term)== undefined));
            return key;}).forEach( w => {
                w.maincategory = w.category;
                w.category = categoriesmap[w.category]||w.category;
                var e = w;
                e.time = d.time;
                e.title = d.title;
                termscollection.push(w)});
    });

    return termscollection;
}