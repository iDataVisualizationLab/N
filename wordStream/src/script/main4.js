// var categories = ["PRODUCT","ORG","PERSON","MONEY","PERCENT"];//["ORG","GPE","NORP","LOC","PERSON","PRODUCT","EVENT","FAC","MONEY","PERCENT"];
var sidenav;
var stopWordList = ["brazo","we're","it's","can't","we’re","thk","it’","chk","you're","you'll","us","thx","the","a","an","republicans","republican","democrats","democratic","and","democrat","americans","american","america","hey","ok","wanna","lmao","lot","ur","im","thank","you?","&amp;","dm","just","dont","lol","lil","gonna","rt","...","..","--","about","above","according","accordingly","across","actually","adj","adv","after","afterwards","again","against","ago","ah","aint","al","albeit","all","almost","alone","along","already","also","alt","although","always","am","among","amongst","an","and","another","any","anybody","anyhow","anyone","anything","anyway","anyways","anywhere","apparently","appear","apply","are","area","areas","arent","around","as","aside","ask","asked","asking","asks","at","available","ave","away","aye","ba","back","backed","backing","backs","basic","basis","be","became","because","become","becomes","becoming","been","before","beforehand","began","begin","behind","being","beings","below","beside","besides","best","better","between","beyond","bi","big","both","brief","but","by","call","called","came","can","cannot","cant","certain","certainly","cf","clear","clearly","cm","co","come","comes","concerning","consequently","considering","contain","containing","contains","contrariwise","corresponding","could","couldnt","course","currently","date","dc","de","definitely","describe","described","describes","despite","determine","determined","di","did","didnt","differ","different","differently","do","does","doesnt","doing","done","dont","double","down","downed","downing","downs","downwards","dr","dual","during","each","early","ed","eg","eight","either","eleven","else","elsewhere","empty","end","ended","ending","ends","enough","entirely","especially","est","et","etc","even","evenly","ever","every","everybody","everyone","everything","everywhere","everywhere","exactly","example","except","excepted","excepting","exception","exclude","excluding","exclusive","face","faces","fact","facts","far","felt","few","fifteen","fifth","find","finds","first","five","for","forth","forty","forward","found","four","fr","free","from","front","ft","full","fully","further","furthered","furthering","furthermore","furthers","furthest","gave","general","generally","get","gets","getting","give","given","gives","go","goes","going","gone","good","goods","got","gotten","great","greater","greatest","group","grouped","grouping","groups","had","hadnt","half","halves","happens","hardly","has","hasnt","hast","hath","have","having","he","hear","heard","hed","hello","help","hence","henceforth","her","here","hereabouts","hereafter","hereby","herein","hereto","hereupon","hers","herself","hes","high","higher","highest","him","himself","hindmost","his","hither","hitherto","hopefully","how","howbeit","however","howsoever","hr","hundred","hyper","id","ie","if","ii","iii","im","immediate","important","in","inasmuch","inc","including","indeed","indicate","indicated","indicates","insofar","insomuch","instead","int","interest","interested","interesting","interests","into","intra","intro","inward","inwards","is","isnt","it","itd","item","itll","its","itself","iv","ive","ix","just","keep","keeps","kept","kg","km","knew","know","known","knows","large","largely","last","lat","lately","later","latest","latter","latterly","least","left","less","lest","let","lets","like","likely","little","ll","lon","long","longer","longest","look","looks","ltd","lt","made","made","mainly","make","making","man","many","may","maybe","md","me","mean","means","meant","meantime","meanwhile","merely","micro","might","mine","mm","more","moreover","morning","most","mostly","move","mph","mr","mrs","ms","mt","much","multi","must","mustnt","my","myself","name","namely","near","nearly","necessary","need","needed","needing","neednt","needs","neither","never","nevertheless","new","newer","newest","news","next","nine","no","nobody","non","none","nonetheless","noone","nope","nor","normally","not","nothing","notwithstanding","novel","now","nowadays","nowhere","nt","number","obs","obviously","of","off","often","oh","okay","old","older","oldest","on","once","one","ones","only","onto","op","open","opened","opening","opens","or","other","others","otherwise","ought","our","ours","ourselves","out","outside","over","overall","own","oz","page","part","parted","particular","particularly","parting","parts","per","perhaps","phr","pl","please","plus","pm","possible","pre","presumably","pro","probably","provided","pt","put","puts","quite","rather","re","really","reasonably","regarding","regardless","regards","related","relatively","required","respectively","results","right","said","saith","same","saw","say","saying","says","sec","second","secondly","seconds","see","seeing","seem","seemed","seeming","seems","seen","sees","seldom","self","selves","semi","seven","several","shall","shalt","she","shes","should","shouldnt","show","showed","showing","shown","shows","side","sides","since","sir","sixty","so","some","somebody","somehow","someone","something","sometime","sometimes","somewhat","somewhere","st","still","such","supposing","sure","take","tell","tends","th","than","thank","thanks","thanx","that","thatd","thatll","thats","the","thee","their","theirs","them","themselves","then","thence","thenceforth","there","thereabout","thereabouts","thereafter","thereby","thered","therefore","therein","thereof","thereon","theres","thereto","thereupon","therll","these","they","theyve","thine","thing","things","think","thinks","third","this","thorough","thoroughly","those","thou","though","three","thrice","through","throughout","thru","thus","thy","thyself","till","time","tm","to","today","together","told","too","took","toward","towards","trans","tried","tries","truly","trying","turn","turned","turning","turns","twelve","twenty","twice","two","under","unless","unlike","unlikely","until","unto","up","upon","upward","upwards","us","use","used","useful","uses","using","usually","various","ve","very","vi","vii","viii","via","viz","vs","was","wasnt","way","ways","we","well","wells","went","were","werent","weve","what","whatever","whatsoever","when","whence","whenever","whensoever","where","whereabouts","whereafter","whereas","whereat","whereby","wherefore","wherefrom","wherein","whereinto","whereof","whereon","wheresoever","whereto","whereunto","whereupon","wherever","wherewith","whether","whew","which","whichever","whichsoever","while","whilst","whither","who","whoa","whoever","whole","whom","whomever","whomsoever","whose","whosoever","why","will","willing","wilt","wish","with","within","without","wonder","wont","work","worked","working","works","worse","worst","would","wouldnt","wt","xi","xii","xiii","xiv","xv","xvi","xvii","xviii","xix","xx","yd","ye","year","years","yes","yet","yippee","you","youd","youll","young","younger","youngest","your","youre","yours","yourself","yourselves","youve","yup","zero","Lymphatic"];
let self = null;
// var categoriesgroup ={
//     "NUMBER": ["MONEY","PERCENT"],
//     "EVENT":["PRODUCT","EVENT","LAW","DATE"],
//     "PERSON":["PERSON"],
//     "ORG":["ORG"],
//     "NATION":["GPE","LOC","FAC"]};
var categoriesgroup ={
    "usgs": ["usgs"],
    "twitter":["twitter"]};
var color = d3.scaleOrdinal(d3.schemeCategory10);
var categories=[];
var outputFormat = d3.timeFormat('%b %d %Y');
var parseTime = (d => Date.parse(d));
var TermwDay,
    termscollection_org,
    ArticleDay,
    data,
    svg;
var lineColor = d3.scaleLinear()
    .domain([0,120])
    .range(['#558', '#000']);
// var x = d3.scalePoint();
var x = d3.scaleTime();
var wscale = 0.01;
var timeline;
var svgHeight = 1500, svgWidth;
var nodes2,links2;
var mainconfig = {
    renderpic: false,
    wstep: 50,
    numberOfTopics: 30,
    rateOfTopics: 0.5,
    Isweekly: false,
    seperate: false,
    minfreq: 5,
    minlink: 5,
};
var daystep = 3;
var startDate;
var endDate;
var wordTip = d3.tip()
    .attr('class', 'd3-tip')
    .style('pointer-events','none')
    .offset([-10, 10]).direction('s')
    .html(function (d) {
        var str = '';
        str += "<div class = headertip>"
        str += "<h6 class ='headerterm'>Term: </h6>";
        str += "<h5 class ='information' >";
        str +=  (d.text||d.key)+'</h5>';
        str += "<h6 class ='headerterm'>Frequency:</h6>";
        str += "<h5 class ='information'>";
        str += (d.frequency||d.value.articlenum)+'</h4>';
        str += "<h6 class ='headerterm'>Date:</h6>";
        str += "<h5 class ='information'>";
        str += outputFormat(d.data[0].time);
        if (daystep-1) {
            var eDatedis = new Date (outputFormat(d.data[0].time));
            eDatedis["setMonth"](eDatedis.getMonth() + daystep-1);
            str += " - ";
            str += d3.timeFormat('%b %Y')(eDatedis);
        }
        str += '</h5>';
        str += "</div>"
        str += "<table>";
        str += "<tr>";
        str += '<th >Source(s)</th>';
        str += '<th >Title</th>';
        str + "</tr>";

        (d.data||d.value.data).forEach(t => {
            var ar = (t.source==undefined)?ArticleDay.filter(f=> f.key == outputFormat(t.time))[0].value.data.find(f=> f.title == t.title):t;
            str += "<tr>";
            str += "<td>" + ar.source + "</td>";
            str += "<td class=pct>" + (ar.body||ar.title) + "</td>";
            str + "</tr>";
        });

        str += "</table>";

        return str;
    }).style('pointer-events','none');

var opts = {
    lines: 7, // The number of lines to draw
    length: 10, // The length of each line
    width: 17, // The line thickness
    radius: 3, // The radius of the inner circle
    scale: 0.55, // Scales overall size of the spinner
    corners: 1, // Corner roundness (0..1)
    color: '#1687ff', // CSS color or array of colors
    fadeColor: 'transparent', // CSS color or array of colors
    speed: 1, // Rounds per second
    rotate: 62, // The rotation offset
    animation: 'spinner-line-fade-quick', // The CSS animation name for the lines
    direction: 1, // 1: clockwise, -1: counterclockwise
    zIndex: 2e9, // The z-index (defaults to 2000000000)
    className: 'spinner', // The CSS class to assign to the spinner
    top: '48%', // Top position relative to parent
    left: '50%', // Left position relative to parent
    position: 'absolute' // Element positioning
};
var navbar;

// Get the offset position of the navbar
var sticky;

var target;
var spinner ;
$(document).ready(function () {
    navbar = document.getElementById("navbar");
// Get the offset position of the navbar
    sticky = navbar.offsetTop;

    target = document.getElementById('timelinewImg');
    spinner = new Spinner(opts);
    spinner.spin(document.body);
    d3.queue()
        // .defer(d3.json,"src/data/twittwaterv2.json")
        // .defer(d3.json,"src/data/collectionwatviz.json")
        .defer(d3.json,"src/data/twittwaterv3.json")
        .await(ready);
    d3.select("#IsWeekly").on("click",()=> {
        mainconfig.IsWeekly = !mainconfig.IsWeekly;
        if ( $("#IsWeekly").hasClass('active') ) {
            $("#IsWeekly").removeClass('active');
        } else {
            $("#IsWeekly").addClass('active');
        }
        update();
    });
    d3.select("#IsSeperate").on("click",()=> {
        mainconfig.seperate = !mainconfig.seperate;
        if ( $("#IsSeperate").hasClass('active') ) {
            $("#IsSeperate").removeClass('active');
        } else {
            $("#IsSeperate").addClass('active');
        }
        update();
    });
    //$('.sidenav').sidenav();

});
function update(){
    pinner = new Spinner(opts);
    spinner.spin(document.getElementById("loading"));
    setTimeout(function () {
        // do calculations
        // update graph
        // clear spinner
        render();
    }, 0);
    document.body.scrollTop = 0;
    document.body.scrollLeft = 0;
    document.documentElement.scrollTop = 0;
    document.documentElement.scrollLeft = 0;
}
function drawWordCloud(words){
    var font ="Arial";
    var word_count = {};
    words.forEach(date=> {
        categories.forEach((c,i) =>{
            date.words[c].slice(0,25).forEach(w=> word_count[w.text] = {frequency: w.frequency, category: [c,i]})})
    });
    var margin = {top: 0, right: 0, bottom: 0, left: 0};
    var width = svgWidth-mainconfig.wstep;
    var height = svgHeight;
    d3.select("#WordcloudImg").select('svg').remove();
    d3.select("#WordcloudImg")
        .append('svg')
        .attr("width", width)
        .attr("height", height)
        .append("g")
        .attr("id","wordchart")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
    var svg_location = "#wordchart";


    var fill = color;

    var word_entries = d3.entries(word_count);

    var xScale = d3.scaleLinear()
        .domain([0, d3.max(word_entries, function(d) {
            return d.value.frequency;
        })
        ])
        .range([12,40]);

    d3.layout.cloud().size([width, height])
        .timeInterval(20)
        .words(word_entries)
        .fontSize(function(d) { return xScale(+d.value.frequency); })
        .text(function(d) { return d.key; })
        // .rotate(function() { return ~~(Math.random() * 2) * 90; })
        .rotate(0)
        .font(font)
        .on("end", draw)
        .start();

    function draw(words) {
        d3.select(svg_location).append("svg")
            .attr("width", width)
            .attr("height", height)
            .append("g")
            .attr("transform", "translate(" + [width >> 1, height >> 1] + ")")
            .selectAll("text")
            .data(words)
            .enter().append("text")
            .style("font-size", function(d) { return xScale(d.value.frequency) + "px"; })
            .style("font-family", font)
            .style("fill", function(d, i) { return fill(d.value.category[1]); })
            .attr("text-anchor", "middle")
            .attr("transform", function(d) {
                return "translate(" + [d.x, d.y] + ")rotate(" + d.rotate + ")";
            })
            .text(function(d) { return d.key; });
    }

    d3.layout.cloud().stop();
}
function wordCloud(selector,config) {
    function draw(data) {
        //d3.select(selector).select('svg').selectAll('.cloud').remove();
        var dataWidth;
        var width;
        // document.getElementById("mainsvg").setAttribute("width",width);
        var font = "Arial";
        var interpolation = d3.curveMonotoneX;
        var bias = 200;
        var offsetLegend = 50;
        var axisPadding = 10;
        var margins = {top: 0, right: 0, bottom: 0, left: 0};
        var min = 12;
        var max = 40;
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

        var mainGroup = svg.append('g')
            .attr('class','cloud')
            .attr('transform', 'translate(' + margins.left + ',' + (margins.top) + ')');
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
            .frequencyScale(d3.scaleLinear())
            .minFontSize(min)
            .maxFontSize(max)
            .data(data)
            .font(font)
            .suddenmode(true)
            .seperate(mainconfig.seperate);
        var boxes = ws.boxes(),
            minFreq = ws.minFreq(),
            maxFreq = ws.maxFreq();

        //Display data

        //var color = d3.scaleOrdinal(d3.schemeCategory10);
        //Display time axes
        // var dates = [];
        // boxes.data.forEach(row => {
        //     dates.push(row.date);
        // });


        // var xrange = x.range();
        var boxwidth = ~~(width/data.length);
        // x.range([xrange[0] + boxwidth, width - boxwidth])
        mainGroup.attr('transform', 'translate(' + margins.left + ',' + margins.top + ')');
        var overclick = wordStreamG.append('rect')
            .attr('class','wsoverlay').attrs({width:width, height:height})
            .style("fill", "none")
            .style("pointer-events", "all");

        if (mainconfig.seperate) {
            var legend = boxes.layers.map(d => {
                return {'key': d.key, 'pos': d.offset}
            });

            var legendg = timeline.append("g")
                .attr("class", "legend")
                .attr("transform", "translate(" + (-10) + "," + 0 + ")")
                .append("g")
                .attr("class", "sublegend")
                .selectAll(".lengendtext")
                .data(legend)
                .enter()
                .append("text")
                .attr("class", "lengendtext")
                .style("text-anchor", "middle")
                .attr("transform", d => "translate(0," + d.pos + ") rotate(-90)")
                .text(d => d.key);
        }
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
        // var terms = [];
        // for(i=0; i< allWords.length; i++){
        //     terms.concat(allWords[i].text);
        // }

        // Unique term de to mau cho cac chu  cung noi dung co cung mau


        var opacity = d3.scaleLog()
            .domain([minFreq, maxFreq])
            .range([0.4,1]);

        // Add moi chu la 1 element <g>, xoay g dung d.rotate
        var placed = true; // = false de hien thi nhung tu ko dc dien

        var gtext = mainGroup.selectAll('.gtext')
            .data(allWords)
            .attrs({transform: function(d){return 'translate('+d.x+', '+d.y+')rotate('+d.rotate+')';}});

        var stext = gtext.selectAll('.stext')
            .transition()
            .duration(600)
            .text(function(d){return d.text;})
            .attr('font-size', function(d){return d.fontSize + "px";} )// add text vao g
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
            })
            .duration(1000);
        gtext.exit().remove();
        gtext.enter()
            .append('g')
            .attr('class','gtext')
            .attrs({transform: function(d){return 'translate('+d.x+', '+d.y+') rotate('+d.rotate+')';}})
            .append('text')
            .attr("class",'stext')
            .transition().duration(600).styleTween('font-size', function(d){return d.fontSize + "px";} )// add text vao g
            .text(function(d){return d.text;})
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
                t.data.forEach(tt=>(sameArticle = sameArticle || (d.data.find(e=>e.title===tt.title)!==undefined)));
                return sameTerm || sameArticle;
            });
            allTexts.style('fill-opacity', 1);
            // var allSubjects = allTexts.filter(t=> t && t.text === text &&  t.topic === topic);
            // allSubjects.attrs({
            //     stroke: prevColor,
            //     'stroke-width': 1.5
            // });

            wordTip.show(d).style('pointer-events','none');
        });

        mainGroup.selectAll('.stext').on('mouseleave', function(d){
            var thisText = d3.select(this);
            thisText.style('cursor', 'default');
            var text = thisText.text();
            var topic = thisText.attr('topic');
            var allTexts = mainGroup.selectAll('.stext').filter(t =>
                t && !t.cloned
            );

            allTexts
                .style('fill-opacity', function(d){return opacity(d.frequency)});
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
            // d3.selectAll(".article")
            //     .filter(a=>  allTexts._groups[0].find(d=> outputFormat(d.__data__.data[0].time)==a.key) != undefined)
            //     .style("fill","#ffc62a")
            //     .style("filter","url(#glow)");
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
                cloner.transition().duration(1000).attrs({
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
                .data(d => d.data)
                .enter()
                .append('a')
                .attr("xmlns:xlink", "http://www.w3.org/1999/xlink")
                .attrs({"xlink:href": (d => d.url||d.link),
                    'target':"_blank"})
                .attr('class','stackimg')
                .append('rect')
                //.attr('class','stackimg')
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
            mainGroup.selectAll('.stokepath').attr('visibility', 'hidden');
            d3.select('.sublegend').attr('visibility', 'hidden');
        });

        overclick.on('click',()=>{
            d3.select('.sublegend').attr('visibility', 'visible');
            mainGroup.selectAll('.stokepath').attr('visibility', 'visible');
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

        });

        // topics.forEach(topic=>{
        //     d3.select("path[topic='"+ topic+"']" ).on('click', function(){
        //         wordStreamG.selectAll('.stackg').remove();
        //         mainGroup.selectAll('.stext').filter(t=>{
        //             return t && !t.cloned && t.placed;
        //         }).attrs({
        //             visibility: 'visible'
        //         });
        //         //Remove the cloned element
        //         document.querySelectorAll("g[cloned='true']").forEach(node=>{
        //             node.parentNode.removeChild(node);
        //         });
        //         //Remove the added path for it
        //         document.querySelectorAll("path[wordStream='true']").forEach(node=>{
        //             node.parentNode.removeChild(node);
        //         });
        //         d3.selectAll(".article")
        //             .style("fill","lightblue")
        //             .style("filter","");
        //     });
        //
        // });
    }
    return {
        update: function (words) {
            draw(words);
        }
    }
}
function ready (error, dataf){
    //spinner = new Spinner(opts).spin(document.getElementById('timelinewImg'));
    if (error) throw error;
    data = dataf;
    // format the data
    //data =data.filter(d=>d.source=="reuters");

    data.forEach(function(d) {
        d.time = d.source=="usgs"?new Date (parseTime(d.time))["setMonth"](Math.random()*11):~~d.time*1000;
        d.keywords =[];
        //console.log(d.hashTag.length);
        d.keywords = (d.source=="twitter")?d.keywords.concat(d.hashTag.map(e=>{return {term: e.toLowerCase().replace(/\.|\,|\(|\)|\;|\:|\!|\?|\#/gi,'').replace(/s$/g,''),category:"TERM"}})):d.keywords;

        (d.body||(d.abstract.concat(" "+d.title))).toLowerCase().split(" ").forEach(w=> {
            w = w.trim().replace(/\.|\,|\(|\)|\;|\:|\!|\?|\#|\"|\'/gi,'').replace(/s$/g,'');
            if (stopWordList.find(wm=>wm==w)==undefined&& w.match(/\(\b(19|20)\d{2}\b\)|\b(19|20)\d{2}\b|http|twdb/g)==null && w.length>2)
                d.keywords.push({term: w, category:d.source})})
        // d.keywords.forEach(key => {
        //     if (key.term.toLowerCase().match("ogallala")!==null)
        //         data.push(d);
        // });
    });
    var limit = ["October 2012","December 2016"];
    data.sort((a,b)=> a.time-b.time);
    data  = data.filter(d=> (d.time>=parseTime(limit[0])&&d.time<=parseTime(limit[1])));
    console.log("Num usgs: "+data.filter(d=>d.source =="usgs").length);
    //data = data.filter(d=> d.time> parseTime('Apr 15 2018'));
    termscollection_org = blacklist(data);
    forcegraph("#slide-out","#autocomplete-input");
    var listjson = {};
    d3.map(termscollection_org, function(d){return d.term;}).keys().forEach(d=>listjson[d]=null);
    $('#autocomplete-input').autocomplete( {
        data: listjson,
        limit: 100,
        minLength: 2,
    });
    // autocomplete(document.getElementById("theWord"), d3.map(termscollection_org, function(d){return d.term;}).keys());
    // document.getElementById("theWord").autocompleter({ source: data });
    setTimeout(function () {
        // do calculations
        // update graph
        // clear spinner
        render();
    }, 0);
}

function render (){
    d3.selectAll("toogle").property("disabled",true);
    d3.selectAll("#timelinewImg").selectAll('svg').remove();
    handledata(data);

    var margin = {top: 20, right: 100, bottom: 5, left: 100};
    var width = $("#timelinewImg").width() - margin.left - margin.right;
    var numDays = Math.floor((new Date(endDate).getMonth() - new Date(startDate).getMonth()));
    var width = Math.max(width,mainconfig.wstep*(numDays+daystep));
    svgWidth = width+ margin.left + margin.right;
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
    var startDatedis = new Date (startDate);
    startDatedis["setDate"](startDatedis.getDate() - daystep/2);
    var endDatedis = new Date (endDate);
    endDatedis["setDate"](endDatedis.getDate() + daystep/2);
    x.range([0, width])
        .domain([new Date (startDatedis),new Date (endDatedis)]);
    let gridlineNodes = d3.axisTop()
        .ticks(d3.timeMonth.every(daystep))
        .tickFormat(d3.timeFormat("%B"))
        .tickSize(-height)
        .scale(x);
    var y = d3.scaleLinear().range([height/2, 0]);
    var simulation = d3.forceSimulation()
        .force("y", d3.forceY(height*wscale/2).strength(0.05));
    svg = timeline.append("g")
        .attr("transform", "translate(" + 0 + "," + height*wscale + ")")
        .attr("id","tagCloud")
        .append("svg")
        .attr("width", width)
        .attr("height", height*(1-wscale));
    svg.append("g")
        .attr("class", "grid")
        .call(gridlineNodes);
    var configwc = {width: width,height: height*(1-wscale)};
    myWordCloud = wordCloud('#tagCloud',configwc);

    myWordCloud.update(TermwDay);
    timeline.append("g")
        .attr("class", "axis")
        .attr("transform", "translate(0," + height*wscale + ")")
        .call(d3.axisTop(x)
            .ticks(d3.timeMonth.every(daystep))
            .tickFormat(d3.timeFormat("%B, %Y")))
        .selectAll("text")
        .style("text-anchor", "start")
        .attr("dx", ".8em")
        .attr("dy", "-.15em");
    // Scale the range of the data
    //x.domain(d3.extent(data, function(d) { return d.time; }));
    //y.domain([0, d3.max(data, function(d) { return d.close; })]);
    // simulation.force("x", d3.forceX(d => x(outputFormat(d.time))).strength(0.05));

    // simulation.force("x", d3.forceX(d => x(d.key)).strength(0.05))
    //     .force("collide", d3.forceCollide(d=>rcscale(d.value.articlenum)));
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
        el.attr("xlink:href","src/img/bb.jpg"
            );
        el.on("error", null);
    })

    var rcscale = d3.scaleLinear().domain(d3.extent(ArticleDay,(d=> d.value.articlenum))).range([2,20]);

    timeline.select('.sublegend')
        .attr("transform", "translate(" + 0 + "," + height*wscale + ")");

    drawWordCloud(TermwDay);
    spinner.stop();
    d3.selectAll("toogle").property("disabled",false);
}
function handledata(data){
    var termscollection = [];
    //sort out term for 1 article

    if (mainconfig.IsWeekly) {
        outputFormat =  d3.timeFormat('%b %Y');
        daystep = 1;
        svgHeight = 510;
        mainconfig.wstep = 50;
    }else {
        outputFormat =  (d) => {
            return d3.timeFormat('%b %Y')(d3.timeMonth.every(daystep)(d));
        };
        daystep = 3;
        svgHeight = 510;
        mainconfig.wstep = 25;
    }
    var nested_data;
    // let word = document.getElementById("theWord").value;
    startDate = termscollection_org[0].date;
    endDate = termscollection_org[termscollection_org.length-1].date;

    let word = $('#autocomplete-input').val();
    if (word !== "") {
        var collection = termscollection_org.filter(d=>d.term.match(word)!=null);
        var title = d3.map(collection,d=>d.title);
        termscollection = termscollection_org.filter(d=> title.has(d.title));
        nested_data = d3.nest()
            .key(function (d) {
                return d.title;
            })
            .key(function (d) {
                return d.term;
            })
            .rollup(function (words) {
                return {frequency: words.length, data: words[0]};
            })
            .entries(termscollection);
        // data = data.filter(d=> d.type!=="story" || d.title.toLowerCase().indexOf(word.toLowerCase())>=0)
    }else {
        nested_data = d3.nest()
            .key(function (d) {
                return d.title;
            })
            .key(function (d) {
                return d.term;
            })
            .rollup(function (words) {
                return {frequency: words.length, data: words[0]};
            })
            .entries(termscollection_org);

    }

    termscollection.length = 0;
    nested_data.forEach(d=> d.values.forEach(e=> termscollection.push(e.value.data)));
    //sudden
    var nestedByTerm = d3.nest()
        .key(function(d) { return d.category; })
        .key(function(d) { return d.term; })
        .key(function(d) { return outputFormat(d.time); })
        .entries(termscollection);
    nestedByTerm.forEach(c=>
        c.values.forEach(term=> {
                var pre = 0;
                var preday = new Date(term.values[0].key);
                term.values.forEach(day => {
                    preday["setMonth"](preday.getMonth() + daystep*2);
                    if (preday.getMonth() < new Date(day.key).getMonth())
                        pre = 0;
                    var sudden  = (day.values.length+1)/(pre+1);
                    day.values.forEach(e=> e.sudden = sudden);
                    pre = day.values.length;
                    preday = new Date(day.key);
                })
            }
        )
    );
    termscollection.length = 0;
    nestedByTerm.forEach(c=>
        c.values.forEach(term=> {
                term.values.forEach(day => {
                    day.values.forEach(e=> termscollection.push(e))
                })
            }
        )
    );
    nestedByTerm = d3.nest()
        .key(function(d) { return d.category; })
        .key(function(d) { return outputFormat(d.time); })
        .key(function(d) { return d.term; })
        .entries(termscollection);
    nestedByTerm.forEach(c=> c.values.forEach( day=>
        day.values.sort((a,b)=>b.values[0].sudden-a.values[0].sudden)));
    nestedByTerm.forEach(c=> {
        if (c.key =="twitter")
            c.values.forEach( day=>{
            var numtake =mainconfig.numberOfTopics;
            day.values = day.values.slice(0,numtake)})
    });

    termscollection.length = 0;
    nestedByTerm.forEach(c=>
        c.values.forEach(term=> {
                term.values.forEach(day => {
                    day.values.forEach(e=> termscollection.push(e))
                })
            }
        )
    );
    console.log('cut by sudden: '+ termscollection.length);
    // done -sort
    termscollection.sort((a,b)=>a.time-b.time);
    nested_data = d3.nest()
        .key(function(d) { return outputFormat(d.time); })
        .key(function(d) { return d.category; })
        .key(function(d) { return d.term; })
        .rollup(function(words) { return {frequency: words.length,sudden: words[0].sudden,data:words}; })
        .entries(termscollection);

    //nested_data = nested_data.slice(1,nested_data.length-1);
    //slice data
    //nested_data = nested_data.filter(d=> parseTime(d.key)> parseTime('Apr 15 2018'));

    // ArticleByDay
    ArticleDay = d3.nest()
        .key(function(d) { return outputFormat(d.time); })
        .rollup(function(words) { return {articlenum: words.length,data:words}; })
        .entries(data);
    ArticleDay=ArticleDay.filter(d=> nested_data.find(e=> e.key === d.key));
    TermwDay = nested_data.map(d=>{
        var words = {};
        categories.forEach( topic =>
        {
            var w = d.values.filter(wf => wf.key === topic)[0];
            if (w !== undefined) {
                words[w.key] = w.values.map(
                    text => {
                        return {
                            text: text.key,
                            sudden: text.value.sudden,
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
    console.log(startDate +" - "+endDate);
    //fillData(endDate, startDate);
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
            if (iterator < len && (now.getMonth() == presenttime.getMonth())) {
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
        now["setMonth"](now.getMonth() + daystep);
    }
    ArticleDay = dd;
    TermwDay = d;
}

function blacklist(data){
    var numterm =0;
    categories = Object.keys(categoriesgroup);
    var categoriesmap = {};
    for ( k in categoriesgroup)
        categoriesgroup[k].forEach(kk=> categoriesmap[kk]= k);
    var blackw =["where'","there'","wxsusie","101516880552290731073741860124458454072type=1…","wsiconfexpo","1qevuey","you’re","agwt","grt","click","tamest_","a4we'","it'","sept","asr","rgv","a4we","wkly","txwri","wtr","gues","taken","wednesday","photo","reminder","board","TX","TWDB","thi","&","&nbsp; ","drewdarby4tx","h2o4texa","abt","2o4texa","toddahunter"," ","today","txwater","Texa","twdb","texa","(usgs)","1)","collected","study","data","water","visit"];
    termscollection_org =[];
    data.forEach(d=>{
        d.keywords.filter(w => {
            numterm++;
            var key = false;
            //categories.forEach(c=> key = key || ((w.category==c)&&(blackw.find(d=>d==w.term)== undefined)));
            key = key || ((blackw.find(d=>d===w.term)== undefined)) && categoriesmap[w.category]!= undefined ;
            return key;}).forEach( w => {
            w.maincategory = w.category;
            w.term = w.term.trim();
            w.category = categoriesmap[w.category]||w.category;
            var e = w;
            e.time = d.time;
            e.title = d.title;
            if (e.term!="")
            termscollection_org.push(e)});
    });
    console.log("#org terms: " +numterm);
    console.log("#terms: " +termscollection_org.length);
    return termscollection_org;
}

function searchWord() {
    update();
}

// When the user scrolls the page, execute myFunction
// window.onscroll = function() {scrollfire()};

// Add the sticky class to the navbar when you reach its scroll position. Remove "sticky" when you leave the scroll position
// function scrollfire() {
//     if (window.pageYOffset >= sticky) {
//         navbar.classList.add("sticky")
//     } else {
//         navbar.classList.remove("sticky");
//     }
// }

document.addEventListener('DOMContentLoaded', function() {
    var options = {
        edge: 'right',
        draggable: true,
        inDuration: 250,
        preventScrolling: false
    };
    var elems = document.querySelectorAll('.sidenav');
    sidenav = M.Sidenav.init(elems, options);
});