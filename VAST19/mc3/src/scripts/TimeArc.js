

d3.TimeArc = function () {
//Constants for the SVG
    let timeArc = {};
    let graphicopt = {
        margin: {top: 15, right: 0, bottom: 5, left: 5},
        width: 1000,
        height: 600,
        scalezoom: 10,
        widthView: function(){return this.width*this.scalezoom},
        heightView: function(){return this.height*this.scalezoom},
        widthG: function(){return this.widthView()-this.margin.left-this.margin.right},
        heightG: function(){return this.heightView()-this.margin.top-this.margin.bottom},
        dotRadius: 2,
        summary: {size:30}
    };
    let arr;
    let runopt = {
        limitTime:[],
        time: {rate:1,unit:'Hour'},
        timeformat: d3.timeHour.every(1)
    };
    let svg,force;
    let UnitArray = ['Minute','Hour','Day','Month','Year'];
    var node_drag = d3.drag()
        .on("start", dragstart)
        .on("drag", dragmove)
        .on("end", dragend);

    function dragstart(d, i) {
        force.stop() // stops the force auto positioning before you start dragging
    }

    function dragmove(d, i) {
        d.px += d3.event.dx;
        d.py += d3.event.dy;
        d.x += d3.event.dx;
        d.y += d3.event.dy;
    }

    function dragend(d, i) {
        d.fixed = true; // of course set the node to fixed so the force doesn't include the node in its auto positioning stuff
        force.resume();
    }

    function releasenode(d) {
        d.fixed = false; // of course set the node to fixed so the force doesn't include the node in its auto positioning stuff
        //force.resume();
    }


    var data, data2;
    let timeHigherUnit;
    // var firstDate = Date.parse("2005-01-01T00:00:00");
    var numSecondADay = 24 * 60 * 60;
    var numSecondAMonth = 30 * numSecondADay;
    var minYear = 2006;
    var maxYear = 2015;
    var timeScaleIndex
    function updateTimeScale() {
        timeHigherUnit = UnitArray[UnitArray.indexOf(runopt.time.unit)+1];
        console.log('hiegher level: '+timeHigherUnit)
        runopt.timeformat = d3['time'+runopt.time.unit].every(runopt.time.rate);
        timeScaleIndex = d3.scaleTime().domain(runopt.limitTime);
        totalTimeSteps = timeScaleIndex.ticks(runopt.timeformat).length;
        timeScaleIndex.range([0, totalTimeSteps-1]);
    }

    var totalTimeSteps = 12 * (maxYear - minYear);

    var sourceList = {};
    var numSource = {};
    var maxCount = {}; // contain the max frequency for 4 categories

    var nodes;
    var numNode, numNode2;

    var link;
    var links;
    var linkArcs;
    var termArray, termArray2, termArray3;
    var relationship;
    var termMaxMax, termMaxMax2;
    var terms;
    var NodeG;
    var xStep = 100;
//var xScale = d3.time.scale().range([0, (width-xStep-100)/totalTimeSteps]);
    var yScale;
    var linkScale;
    var searchTerm = "";

    var nodeY_byName = {};

    var isLensing = false;
    var lensingMul = 5;
    var lMonth = -lensingMul * 2;
    var coordinate = [0, 0];
    var XGAP_ = 15; // gap between months on xAxis

    function xScale(m) {
        if (isLensing) {
            var numLens = 5;
            var maxM = Math.max(0, lMonth - numLens - 1);
            var numMonthInLense = (lMonth + numLens - maxM + 1);

            //compute the new xGap
            var total = totalTimeSteps + numMonthInLense * (lensingMul - 1);
            var xGap = (XGAP_ * totalTimeSteps) / total;

            if (m < lMonth - numLens)
                return m * xGap;
            else if (m > lMonth + numLens) {
                return maxM * xGap + numMonthInLense * xGap * lensingMul + (m - (lMonth + numLens + 1)) * xGap;
            }
            else {
                return maxM * xGap + (m - maxM) * xGap * lensingMul;
            }
        }
        else {
            return m * XGAP_;
        }
    }
    timeArc.init = function(){
//---End Insert------
//Append a SVG to the body of the html page. Assign this SVG as an object to svg
        svg.classed('timearc',true)
            .attrs({
            width: graphicopt.width,
            height: graphicopt.height,
            // overflow: "visible",

        });

//******************* Forced-directed layout

//Set up the force layout
        force = d3.forceSimulation()
            .force("charge", d3.forceManyBody().strength(-12))
            // .charge(-12)
            //.linkStrength(5)
            // .linkDistance(0)
            .force("link", d3.forceLink().distance(0))
            // .gravity(0.01)
            .force("center", d3.forceCenter(graphicopt.widthG() / 2, graphicopt.heightG() / 2))
            .force('x', d3.forceX(0).strength(0.015))
            .force('y',  d3.forceY(0).strength(0.015))
            //.friction(0.95)
            // .alphaTarget(0.9)
        force.stop();
        // .size([width, height]);
        colorCatergory.domain(catergogryList.map(d=>d.key));
//---Insert-------
    };

    var area = d3.area()
        .curve(d3.curveCardinalOpen)
        .x(function (d) {
            return xStep + xScale(d.monthId);
        })
        .y0(function (d) {
            return d.yNode - yScale(d.value);
        })
        .y1(function (d) {
            return d.yNode + yScale(d.value);
        });


    var numberInputTerms = 0;
    var listMonth;


    var nodes2 = [];
    var links2 = [];
    var nodes2List = {};
    var links2List = {};

    function handledata (arr) {
        updateTimeScale();
        terms = new Object();

        termMaxMax = 1;
        arr.forEach(function (d) {
            // Process date
            d.date = new Date(d["time"]);
            var m = Math.round(timeScaleIndex(runopt.timeformat(d.date)));
            d.__timestep__ = m;
            d.__terms__ = {};
            for (let c in d.category) {
                for (let term in d.category[c]) {
                    d.__terms__[term] = d.category[c][term];
                    if (!terms[term]) {
                        terms[term] = new Object();
                        terms[term].max = 0;
                        terms[term].maxTimeIndex = -100;   // initialized negative
                        terms[term].category = c;
                    }
                    if (!terms[term][m])
                        terms[term][m] = d.__terms__[term];
                    else {
                        terms[term][m] += d.__terms__[term];
                        if (terms[term][m] > terms[term].max) {
                            terms[term].max = terms[term][m];
                            terms[term].maxTimeIndex = m;
                            if (terms[term].max > termMaxMax)
                                termMaxMax = terms[term].max;
                        }
                    }
                }
            }

        });
        data = arr;
        console.log("DONE reading the input file = " + data.length);
    }

    timeArc.draw = function(){

        setupSliderScale(svg);

        readTermsAndRelationships();

        drawColorLegend();
        drawTimeLegend();
        drawTimeBox(); // This box is for brushing
        drawLensingButton();

        computeNodes();
        computeLinks();


        force.force('link').strength = (function (l) {
            if (l.value)
                return (8 + l.value * 2);
            else
                return 1;
        });

        force.force('link').distance = (function (l) {
            if (searchTerm != "") {
                if (l.source.name == searchTerm || l.target.name == searchTerm) {
                    var order = isContainedInteger(listMonth, l.__timestep__)
                    return (12 * order);
                }
                else
                    return 0;
            }
            else {
                if (l.value)
                    return 0;
                else
                    return 12;
            }
        });

        //Creates the graph data structure out of the json data
        force.nodes(nodes)
            .force('link').links(links);

        force.on("end", function () {
            detactTimeSeries();
        }).on("tick", timeArc.update);

        force.restart();

        $(function () {
            $("#search").autocomplete({
                data: Array2Object(termArray)
            });
        });
    };
    function Array2Object (arr){
        let temp={};
        arr.forEach(d=>temp[d.term]= null);
        return temp;
    }
    function recompute() {
        var bar = document.getElementById('progBar'),
            fallback = document.getElementById('downloadProgress'),
            loaded = 0;

        var load = function () {
            loaded += 1;
            bar.value = loaded;

            /* The below will be visible if the progress tag is not supported */
            $(fallback).empty().append("HTML5 progress tag not supported: ");
            $('#progUpdate').empty().append(loaded + "% loaded");

            if (loaded == 100) {
                clearInterval(beginLoad);
                $('#progUpdate').empty().append("Complete");
            }
        };

        var beginLoad = setInterval(function () {
            load();
        }, 10);
        setTimeout(alertFunc, 333);

        function alertFunc() {
            readTermsAndRelationships();
            computeNodes();
            computeLinks();
            force.nodes(nodes)
                .force('link').links(links);
            force.restart();
        }
    }

    function readTermsAndRelationships() {
        data2 = data.filter(function (d, i) {
            if (!searchTerm || searchTerm == "") {
                return d;
            }
            else if (d.__terms__[searchTerm])
                return d;
        });

        var selected = {};
        if (searchTerm && searchTerm != "") {
            data2.forEach(function (d) {
                for (var term1 in d.__terms__) {
                    if (!selected[term1])
                        selected[term1] = {};
                    else {
                        if (!selected[term1].isSelected)
                            selected[term1].isSelected = 1;
                        else
                            selected[term1].isSelected++;
                    }
                }
            });
        }

        var removeList = {};   // remove list **************
        // removeList["russia"] =1;
        // removeList["china"] =1;

        removeList["<Location with-held due to contract>"] = 1;
        catergogryObjectReject = {}
        catergogryList.filter(e=>e.disable).forEach(e=>{catergogryObjectReject[e.key]=1});
        // removeList["barack obama"] = 1;
        // removeList["john mccain"] = 1;
        // removeList["mitt romney"] = 1;
        // //  removeList["hillary clinton"] =1;
        // //  removeList["paul ryan"] =1;
        // removeList["sarah palin"] = 1;
        // removeList["israel"] = 1;
        //
        //
        // removeList["source"] = 1;
        // removeList["person"] = 1;
        // removeList["location"] = 1;
        // removeList["organization"] = 1;
        // removeList["miscellaneous"] = 1;
        //
        // removeList["muckreads weekly deadly force"] = 1
        // removeList["propublica"] = 1;
        // removeList["white this alabama judge has figured out how"] = 1;
        // removeList["dea ’s facebook impersonato"] = 1;
        // removeList["dismantle roe"] = 1;
        // removeList["huffington post"] = 1;


        termArray = [];
        for (var att in terms) {
            var e = {};
            e.term = att;
            if (catergogryObjectReject[terms[att].category]||removeList[e.term] || (searchTerm && searchTerm !== "" && !selected[e.term])) // remove list **************
                continue;

            var maxNet = 0;
            var maxTimeIndex = -1;
            for (var m = 1; m < totalTimeSteps; m++) {
                if (terms[att][m]) {
                    var previous = 0;
                    if (terms[att][m - 1])
                        previous = terms[att][m - 1];
                    var net = (terms[att][m] + 1) / (previous + 1);
                    if (net > maxNet) {
                        maxNet = net;
                        maxTimeIndex = m;
                    }
                }
            }
            e.max = maxNet;
            e.maxTimeIndex = maxTimeIndex;
            e.category = terms[att].category;

            if (e.term == searchTerm) {
                e.max = 10000;
                e.isSearchTerm = 1;
            }

            else if (searchTerm && searchTerm != "" && selected[e.term] && selected[e.term].isSelected) {
                e.max = 5000 + selected[e.term].isSelected;
                //   console.log("e.term = "+e.term+" e.max =" +e.max );
            }

            if (!e.max && e.max != 0)
                console.log("What the e.term = " + e.term + " e.max =" + e.max);

            termArray.push(e);
        }

        termArray.sort(function (a, b) {
            if (a.max < b.max) {
                return 1;
            }
            if (a.max > b.max) {
                return -1;
            }
            return 0;
        });

        //if (searchTerm)
        numberInputTerms = termArray.length;
        console.log("numberInputTerms=" + numberInputTerms);

        // Compute relationship **********************************************************
        numNode = Math.min(80, termArray.length);
        numNode2 = Math.min(numNode * 3, termArray.length);
        var selectedTerms = {};
        for (var i = 0; i < numNode2; i++) {
            selectedTerms[termArray[i].term] = termArray[i].max;
        }


        relationship = {};
        relationshipMaxMax = 0;
        data2.forEach(function (d) {
            var m = d.__timestep__;
            for (var term1 in d.__terms__) {
                if (selectedTerms[term1]) {   // if the term is in the selected 100 terms
                    for (var term2 in d.__terms__) {
                        if (selectedTerms[term2]) {   // if the term is in the selected 100 terms
                            if (!relationship[term1 + "__" + term2]) {
                                relationship[term1 + "__" + term2] = new Object();
                                relationship[term1 + "__" + term2].max = 1;
                                relationship[term1 + "__" + term2].maxTimeIndex = m;
                            }
                            if (!relationship[term1 + "__" + term2][m])
                                relationship[term1 + "__" + term2][m] = 1;
                            else {
                                relationship[term1 + "__" + term2][m]++;
                                if (relationship[term1 + "__" + term2][m] > relationship[term1 + "__" + term2].max) {
                                    relationship[term1 + "__" + term2].max = relationship[term1 + "__" + term2][m];
                                    relationship[term1 + "__" + term2].maxTimeIndex = m;

                                    if (relationship[term1 + "__" + term2].max > relationshipMaxMax) // max over time
                                        relationshipMaxMax = relationship[term1 + "__" + term2].max;
                                }
                            }
                        }
                    }
                }
            }
        });
        debugger;

        console.log("DONE computing realtionships relationshipMaxMax=" + relationshipMaxMax);
    }

    function computeConnectivity(a, num) {
        for (var i = 0; i < num; i++) {
            a[i].isConnected = -100;
            a[i].isConnectedmaxTimeIndex = a[i].maxTimeIndex;
        }

        for (var i = 0; i < num; i++) {
            var term1 = a[i].term;
            for (var j = i + 1; j < num; j++) {
                var term2 = a[j].term;
                if (relationship[term1 + "__" + term2] && relationship[term1 + "__" + term2].max >= valueSlider) {
                    if (relationship[term1 + "__" + term2].max > a[i].isConnected) {
                        a[i].isConnected = relationship[term1 + "__" + term2].max;
                        a[i].isConnectedmaxTimeIndex = relationship[term1 + "__" + term2].maxTimeIndex;
                    }
                    if (relationship[term1 + "__" + term2].max > a[j].isConnected) {
                        a[j].isConnected = relationship[term1 + "__" + term2].max;
                        a[j].isConnectedmaxTimeIndex = relationship[term1 + "__" + term2].maxTimeIndex;
                    }
                }
                else if (relationship[term2 + "__" + term1] && relationship[term2 + "__" + term1].max >= valueSlider) {
                    if (relationship[term2 + "__" + term1].max > a[i].isConnected) {
                        a[i].isConnected = relationship[term2 + "__" + term1].max;
                        a[i].isConnectedmaxTimeIndex = relationship[term1 + "__" + term2].maxTimeIndex;
                    }
                    if (relationship[term2 + "__" + term1].max > a[j].isConnected) {
                        a[j].isConnected = relationship[term2 + "__" + term1].max;
                        a[j].isConnectedmaxTimeIndex = relationship[term1 + "__" + term2].maxTimeIndex;
                    }
                }
                //if (term2=="beijing")
                //   console.log(term2+" "+a[j].isConnectedmaxTimeIndex);
            }

        }

    }

    function computeNodes() {

        // check substrings of 100 first terms
        console.log("termArray.length = " + termArray.length);

        for (var i = 0; i < numNode2; i++) {
            for (var j = 0; j < numNode2; j++) {
                if (i == j) continue;
                if (termArray[j].term.indexOf(termArray[i].term) > -1)
                    termArray[i].isSubtring = 1;
            }
        }

        termArray2 = [];
        for (var i = 0; i < numNode2; i++) {
            if (termArray.length < numberInputTerms / 3 || !termArray[i].isSubtring)  // only remove substring when there are too many of them
                termArray2.push(termArray[i])
        }
        console.log("termArray2.length = " + termArray2.length);


        computeConnectivity(termArray2, termArray2.length);


        termArray3 = [];
        for (var i = 0; i < termArray2.length; i++) {
            if (termArray2[i].isSearchTerm || termArray2[i].isConnected > 0)
                termArray3.push(termArray2[i]);
        }
        console.log("termArray3.length = " + termArray3.length);


        termArray3.sort(function (a, b) {
            if (a.isConnected < b.isConnected) {
                return 1;
            }
            else if (a.isConnected > b.isConnected) {
                return -1;
            }
            else {
                if (a.max < b.max) {
                    return 1;
                }
                if (a.max > b.max) {
                    return -1;
                }
                return 0;
            }
        });


        computeConnectivity(termArray3, termArray3.length);

        nodes = [];
        for (var i = 0; i < termArray3.length; i++) {
            var nod = new Object();
            nod.id = i;
            nod.group = termArray3[i].category;
            nod.name = termArray3[i].term;
            nod.max = termArray3[i].max;
            var maxTimeIndexRelationship = termArray3[i].maxTimeIndex;
            nod.isConnectedmaxTimeIndex = termArray3[i].isConnectedmaxTimeIndex;
            nod.maxTimeIndex = termArray3[i].isConnectedmaxTimeIndex;
            nod.month = termArray3[i].isConnectedmaxTimeIndex;
            nod.x = xStep + xScale(nod.month);   // 2016 initialize x position
            nod.y = graphicopt.heightG() / 2;
            if (nodeY_byName[nod.name] != undefined)
                nod.y = nodeY_byName[nod.name];

            if (termArray3[i].isSearchTerm) {
                nod.isSearchTerm = 1;
                if (!nod.month)
                    nod.month = termArray3[i].maxTimeIndex;
                if (!nod.isConnectedmaxTimeIndex)
                    nod.isConnectedmaxTimeIndex = termArray3[i].maxTimeIndex;
            }

            if (!maxCount[nod.group] || nod.max > maxCount[nod.group])
                maxCount[nod.group] = nod.max;

            if (termArray3[i].isConnected > 0)  // Only allow connected items
                nodes.push(nod);
            if (i > numNode)
                break;
        }
        numNode = nodes.length;

        console.log("numNode=" + numNode);


        // compute the monthly data      
        termMaxMax2 = 0;
        for (var i = 0; i < numNode; i++) {
            nodes[i].monthly = [];
            for (var m = 0; m < totalTimeSteps; m++) {
                var mon = new Object();
                if (terms[nodes[i].name][m]) {
                    mon.value = terms[nodes[i].name][m];
                    if (mon.value > termMaxMax2)
                        termMaxMax2 = mon.value;
                    mon.monthId = m;
                    mon.yNode = nodes[i].y;
                    nodes[i].monthly.push(mon);
                }
            }
            // Add another item to first
            if (nodes[i].monthly.length > 0) {
                var firstObj = nodes[i].monthly[0];
                if (firstObj.monthId > 0) {
                    var mon = new Object();
                    mon.value = 0;
                    mon.monthId = firstObj.monthId - 1;
                    mon.yNode = firstObj.yNode;
                    nodes[i].monthly.unshift(mon);
                }

                // Add another item
                var lastObj = nodes[i].monthly[nodes[i].monthly.length - 1];
                if (lastObj.monthId < totalTimeSteps - 1) {
                    var mon = new Object();
                    mon.value = 0;
                    mon.monthId = lastObj.monthId + 1;
                    mon.yNode = lastObj.yNode;
                    nodes[i].monthly.push(mon);
                }
            }
        }


        // Construct an array of only parent nodes
        pNodes = new Array(numNode); //nodes;
        for (var i = 0; i < numNode; i++) {
            pNodes[i] = nodes[i];
        }

        //   drawStreamTerm(svg, pNodes, 100, 600) ;

        svg.selectAll(".layer").remove();
        svg.selectAll(".layer")
            .data(pNodes)
            .enter().append("path")
            .attr("class", "layer")
            .style("stroke", function (d) {
                return d.isSearchTerm ? "#000" : "#000";
            })
            .style("stroke-width", 0.05)
            .style("stroke-opacity", 0.5)
            .style("fill-opacity", 1)
            .style("fill", function (d, i) {
                return getColor(d.group, d.max);
            });

    }

    function computeLinks() {
        links = [];
        relationshipMaxMax2 = 1;

        for (var i = 0; i < numNode; i++) {
            var term1 = nodes[i].name;
            for (var j = i + 1; j < numNode; j++) {
                var term2 = nodes[j].name;
                if (relationship[term1 + "__" + term2] && relationship[term1 + "__" + term2].max >= valueSlider) {
                    for (var m = 1; m < totalTimeSteps; m++) {
                        if (relationship[term1 + "__" + term2][m] && relationship[term1 + "__" + term2][m] >= valueSlider) {
                            var sourceNodeId = i;
                            var targetNodeId = j;

                            if (!nodes[i].connect)
                                nodes[i].connect = new Array();
                            nodes[i].connect.push(j)
                            if (!nodes[j].connect)
                                nodes[j].connect = new Array();
                            nodes[j].connect.push(i)

                            if (m != nodes[i].maxTimeIndex) {
                                if (isContainedChild(nodes[i].childNodes, m) >= 0) {  // already have the child node for that month
                                    sourceNodeId = nodes[i].childNodes[isContainedChild(nodes[i].childNodes, m)];
                                }
                                else {
                                    var nod = new Object();
                                    nod.id = nodes.length;
                                    nod.group = nodes[i].group;
                                    nod.name = nodes[i].name;
                                    nod.max = nodes[i].max;
                                    nod.maxTimeIndex = nodes[i].maxTimeIndex;
                                    nod.month = m;

                                    nod.parentNode = i;   // this is the new property to define the parent node
                                    if (!nodes[i].childNodes)
                                        nodes[i].childNodes = new Array();
                                    nodes[i].childNodes.push(nod.id);

                                    sourceNodeId = nod.id;
                                    nodes.push(nod);
                                }
                            }
                            if (m != nodes[j].maxTimeIndex) {
                                if (isContainedChild(nodes[j].childNodes, m) >= 0) {
                                    targetNodeId = nodes[j].childNodes[isContainedChild(nodes[j].childNodes, m)];
                                }
                                else {
                                    var nod = new Object();
                                    nod.id = nodes.length;
                                    nod.group = nodes[j].group;
                                    nod.name = nodes[j].name;
                                    nod.max = nodes[j].max;
                                    nod.maxTimeIndex = nodes[j].maxTimeIndex;
                                    nod.month = m;

                                    nod.parentNode = j;   // this is the new property to define the parent node
                                    if (!nodes[j].childNodes)
                                        nodes[j].childNodes = new Array();
                                    nodes[j].childNodes.push(nod.id);

                                    targetNodeId = nod.id;
                                    nodes.push(nod);
                                }
                            }

                            var l = new Object();
                            l.source = sourceNodeId;
                            l.target = targetNodeId;
                            l.__timestep__ = m;
                            //l.value = linkScale(relationship[term1+"__"+term2][m]); 
                            links.push(l);
                            if (relationship[term1 + "__" + term2][m] > relationshipMaxMax2)
                                relationshipMaxMax2 = relationship[term1 + "__" + term2][m];
                        }
                    }
                }
            }
        }

        // var linear = (150+numNode)/200;
        var hhh = Math.min(graphicopt.heightG() / numNode, 20);

        yScale = d3.scaleLinear()
            .range([0, hhh * 1.25])
            .domain([0, termMaxMax2]);
        linkScale = d3.scaleLinear()
            .range([0.5, 2])
            .domain([Math.round(valueSlider) - 0.4, Math.max(relationshipMaxMax2, 10)]);

        links.forEach(function (l) {
            var term1 = nodes[l.source].name;
            var term2 = nodes[l.target].name;
            var month = l.__timestep__;
            l.value = linkScale(relationship[term1 + "__" + term2][month]);
            l.message = data2.filter(d=>d.__terms__[term1]&&d.__terms__[term2]);
        });

        console.log("DONE links relationshipMaxMax2=" + relationshipMaxMax2);

        //Create all the line svgs but without locations yet
        svg.selectAll(".linkArc").remove();
        linkArcs = svg.append("g").selectAll("path")
            .data(links)
            .enter().append("path")
            .attr("class", "linkArc")
            .style("stroke-width", function (d) {
                return d.value;
            });

        svg.selectAll(".nodeG").remove();
        nodeG = svg.selectAll(".nodeG")
            .data(pNodes).enter().append("g")
            .attr("class", "nodeG")
            .attr("transform", function (d) {
                return "translate(" + d.x + "," + d.y + ")"
            })
        /*
       nodeG.append("circle")
           .attr("class", "node")
           .attr("r", function(d) { return Math.sqrt(d.max) })
           .style("fill", function (d) {return getColor(d.group, d.max);})
           .on('dblclick', releasenode)
           .call(node_drag); //Added
       */
        // console.log("  nodes.length="+nodes.length) ;

        svg.selectAll(".nodeText").remove();
        nodeG.append("text")
            .attr("class", ".nodeText")
            .attr("dy", ".35em")
            .style("fill", "#000000")
            .style("text-anchor", "end")
            .style("text-shadow", "1px 1px 0 rgba(255, 255, 255, 0.6")
            .style("font-weight", function (d) {
                return d.isSearchTerm ? "bold" : "";
            })
            .attr("dy", ".21em")
            .attr("font-family", "sans-serif")
            .attr("font-size", function (d) {
                return d.isSearchTerm ? "12px" : "11px";
            })
            .text(function (d) {
                return d.name
            });
        nodeG.on('mouseover', mouseovered)
            .on("mouseout", mouseouted);

        // console.log("gggg**************************"+searchTerm);
        listMonth = [];
        links.forEach(function (l) {
            if (searchTerm != "") {
                if (nodes[l.source].name == searchTerm || nodes[l.target].name == searchTerm) {
                    if (isContainedInteger(listMonth, l.__timestep__) < 0)
                        listMonth.push(l.__timestep__);
                }
            }
        });
        listMonth.sort(function (a, b) {
            if (a > b) {
                return 1;
            }
            else if (a < b) {
                return -1;
            }
            else
                return 0;
        });

    }



    function mouseovered(d) {
        if (force.alpha() == 0) {
            var list = new Object();
            list[d.name] = new Object();
            d.messagearr = [];
            svg.selectAll(".linkArc")
                .style("stroke-opacity", function (l) {
                    let name;
                    if ((name=l.target.name,l.source.name == d.name) || (name=l.source.name,l.target.name == d.name)) {
                        if (!list[name]) {
                            list[name] = new Object();
                            list[name].count = 1;
                            list[name].year = l.__timestep__;
                            list[name].linkcount = l.count;
                            d.messagearr =_.unique(_.flatten([ d.messagearr,l.message]));
                        }
                        else {
                            list[name].count++;
                            if (l.count > list[name].linkcount) {
                                list[name].linkcount = l.count;
                                list[name].year = l.__timestep__;
                                d.messagearr =_.unique(_.flatten( [d.messagearr,l.message]));
                            }
                        }
                        return 1;
                    }
                    else
                        return 0.01;
                });
            mouseoverTerm([d,d3.keys(list).map(l=>{
                let cat = termArray3.find(t=>t.term===l).category;
                return{color:colorCatergory(cat), text:l, group:cat}})]);
            nodeG.style("fill-opacity", function (n) {
                if (list[n.name])
                    return 1;
                else
                    return 0.1;
            })
                .style("font-weight", function (n) {
                    return d.name == n.name ? "bold" : "";
                })
            ;

            nodeG.transition().duration(500).attr("transform", function (n) {
                if (list[n.name] && n.name != d.name) {
                    var newX = xStep + xScale(list[n.name].year);
                    return "translate(" + newX + "," + n.y + ")"
                }
                else {
                    return "translate(" + n.xConnected + "," + n.y + ")"
                }
            })
            svg.selectAll(".layer")
                .style("fill-opacity", function (n) {
                    if (list[n.name])
                        return 1;
                    else
                        return 0.1;
                })
                .style("stroke-opacity", function (n) {
                    if (list[n.name])
                        return 1;
                    else
                        return 0;
                });
        }
    }

    function mouseouted(d) {
        if (force.alpha() == 0) {
            nodeG.style("fill-opacity", 1);
            svg.selectAll(".layer")
                .style("fill-opacity", 1)
                .style("stroke-opacity", 0.5);
            svg.selectAll(".linkArc")
                .style("stroke-opacity", 1);
            nodeG.transition().duration(500).attr("transform", function (n) {
                return "translate(" + n.xConnected + "," + n.y + ")"
            })
        }
        mouseoutTerm(d);
    }


    function searchNode(value) {
        searchTerm = value;
        valueSlider = 2;
        slider.call(brush.move, [0, valueSlider].map(xScaleSlider));
        recompute();
    }


    // check if a node for a month m already exist.
    function isContainedChild(a, m) {
        if (a) {
            for (var i = 0; i < a.length; i++) {
                var index = a[i];
                if (nodes[index].month == m)
                    return i;
            }
        }
        return -1;
    }

    // check if a node for a month m already exist.
    function isContainedInteger(a, m) {
        if (a) {
            for (var i = 0; i < a.length; i++) {
                if (a[i] == m)
                    return i;
            }
        }
        return -1;
    }

    function linkArc(d) {
        var dx = d.target.x - d.source.x,
            dy = d.target.y - d.source.y,
            dr = Math.sqrt(dx * dx + dy * dy) / 2;
        if (d.source.y < d.target.y)
            return "M" + d.source.x + "," + d.source.y + "A" + dr + "," + dr + " 0 0,1 " + d.target.x + "," + d.target.y;
        else
            return "M" + d.target.x + "," + d.target.y + "A" + dr + "," + dr + " 0 0,1 " + d.source.x + "," + d.source.y;
    }

    timeArc.update = ()=> {
        nodes.forEach(function (d) {
            // if (searchTerm!="")
            //    d.x += (xScale(d.month)-d.x)*0.1;
            //else
            //     d.x += (xScale(d.month)-d.x)*0.005;
            d.x += (graphicopt.widthG() / 2 - d.x) * 0.005;

            if (d.parentNode >= 0) {
                d.y += (nodes[d.parentNode].y - d.y) * 0.5;
                // d.y = nodes[d.parentNode].y;
            }
            else if (d.childNodes) {
                var yy = 0;
                for (var i = 0; i < d.childNodes.length; i++) {
                    var child = d.childNodes[i];
                    yy += nodes[child].y;
                }
                if (d.childNodes.length > 0) {
                    yy = yy / d.childNodes.length; // average y coordinate
                    d.y += (yy - d.y) * 0.2;
                }
            }
        });

        if (document.getElementById("checkbox1").checked) {
            linkArcs.style("stroke-width", 0);

            nodeG.transition().duration(500).attr("transform", function (d) {
                return "translate(" + 200 + "," + d.y + ")"
            })
            svg.selectAll(".nodeText").style("text-anchor", "start")

        }
        else {
            nodeG.attr("transform", function (d) {
                return "translate(" + d.x + "," + d.y + ")"
            })
            linkArcs.style("stroke-width", function (d) {
                return d.value;
            });
        }

        svg.selectAll(".layer")
            .attr("d", function (d) {
                for (var i = 0; i < d.monthly.length; i++) {
                    d.monthly[i].yNode = d.y;     // Copy node y coordinate
                }
                return area(d.monthly);
            });
        linkArcs.attr("d", linkArc);
        // if (force.alpha()<0.03)
        //     force.stop();

        updateTimeLegend();
    }

    function updateTransition(durationTime) {
        nodes.forEach(function (d) {
            d.x = xStep + xScale(d.month);
            if (d.parentNode >= 0) {
                d.y = nodes[d.parentNode].y;
            }
            nodeY_byName[d.name] = d.y;
        });


        nodeG.transition().duration(durationTime).attr("transform", function (d) {
            d.xConnected = xStep + xScale(d.isConnectedmaxTimeIndex);
            return "translate(" + d.xConnected + "," + d.y + ")"
        })

        /*
        nodeG.style("fill" , function(d) {  
            var color = nodes.forEach(function(node) {
                if (d.name == node.name && d.month!=node.month ){
                    console.log("d.name="+d.name +" node.name="+node.name);
                    console.log("d.month="+d.month +" node.month="+node.month);
                    return "#f0f";
                }      
                else
                    return "#000";
            }); 
            return "#00f";  
        });*/

        /*nodeG.forEach(function(d) {
           d.xConnected=xStep+xScale(d.isConnectedmaxTimeIndex);
        });*/

        /*
        nodeG.attr("transform", function(d) {
            var step = 0;
            d.step=0;
            nodes.forEach(function(node) {
                if (d.name == node.name && d.month!=node.month && node.x<d.x && d.x<node.x+100){
                    d.step=-5000;
                }
            });       
            return "translate(" + (d.x+d.step) + "," + d.y + ")";
        });*/

        svg.selectAll(".layer").transition().duration(durationTime)
            .attr("d", function (d) {
                for (var i = 0; i < d.monthly.length; i++) {
                    d.monthly[i].yNode = d.y;     // Copy node y coordinate
                }
                return area(d.monthly);
            });
        linkArcs.transition().duration(250).attr("d", linkArc);
        updateTimeLegend();
        updateTimeBox(durationTime);
    }

    function detactTimeSeries() {
        // console.log("DetactTimeSeries ************************************" +data);
        var termArray = [];
        for (var i = 0; i < numNode; i++) {
            var e = {};
            e.y = nodes[i].y;
            e.nodeId = i;
            termArray.push(e);
        }

        termArray.sort(function (a, b) {
            if (a.y > b.y) {
                return 1;
            }
            if (a.y < b.y) {
                return -1;
            }
            return 0;
        });

        // var step = Math.min((graphicopt.heightG() - 25) / (numNode + 1), 15);
        if (graphicopt.fixscreence)
            var step = (graphicopt.heightG() - 25) / (numNode + 1);
        else
            var step = Math.min((graphicopt.heightG() - 25) / (numNode + 1), 15);
        //var totalH = termArray.length*step;
        for (var i = 0; i < termArray.length; i++) {
            nodes[termArray[i].nodeId].y = 12 + i * step;
        }
        force.alpha(0);
        force.stop();

        updateTransition(1000);
    }

    timeArc.searchNode = searchNode;

    timeArc.svg = function (_) {
        return arguments.length ? (svg = _, timeArc) : svg;

    };
    timeArc.data = function (_) {
        return arguments.length ? (handledata(_), timeArc) : arr;

    };
    timeArc.runopt = function (_) {
        if (arguments.length) {
            for(var i in _){
                if('undefined' !== typeof _[i]){ runopt[i] = _[i]; }
            }
            updateTimeScale();
            return timeArc
        }else
            return runopt;

    };
    timeArc.dispatch = function (_) {
        return arguments.length ? (returnEvent = _, timeArc) : returnEvent;
    };
    timeArc.mouseoverTerm = function (_) {
        return arguments.length ? (mouseoverTerm = _, timeArc) : mouseoverTerm;
    };
    timeArc.mouseoutTerm = function (_) {
        return arguments.length ? (mouseoutTerm = _, timeArc) : mouseoutTerm;
    };
    timeArc.catergogryList = function (_) {
        return arguments.length ? (catergogryList = _, timeArc) : catergogryList;
    };
    timeArc.graphicopt = function (_) {
        if (arguments.length) {
            for(var i in _){
                if('undefined' !== typeof _[i]){ graphicopt[i] = _[i]; }
            }
            return timeArc
        }else
            return graphicopt;
    };


    //<editor-fold decs = funcs>
    var diameter = 1000,
        radius = diameter / 2,
        innerRadius = radius - 120;
    var months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    // Add color legend
    function drawColorLegend() {
        var xx = 6;
        // var y1 = 20;
        // var y2 = 34;
        // var y3 = 48;
        // var y4 = 62;
        var rr = 6;
        let yscale = d3.scaleLinear().range([20,34]);
        let legendg = svg.selectAll('g.nodeLegend')
            .data(catergogryList)
            .enter()
            .append('g')
            .attr('class','nodeLegend')
            .attr('transform',(d,i)=>'translate('+xx+','+yscale(i)+')')
            .on('click',onclickcategory);

        legendg.append("circle")
            .attr("cx", 0)
            .attr("cy", 0)
            .attr("r", rr)
            .style("fill",d=>colorCatergory(d.key));

        legendg.append("text")
            .attr("x", xx+10)
            .attr("y", 0)
            .attr("dy", ".21em")
            .attr("font-family", "sans-serif")
            .attr("font-size", "11px")
            .style("text-anchor", "left")
            .style("fill",d=>colorCatergory(d.key))
            .text(d=>d.key);
    }
    function onclickcategory(d) {
        if(d.disable){
            d.disable = false;
        }else{
            d.disable = true;
        }
        d3.select(this).classed('fade',d.disable);
        recompute();
    }
    function removeColorLegend() {
        svg.selectAll(".nodeLegend").remove();
    }

    function drawTimeLegend() {
        listX = timeScaleIndex.ticks(runopt.timeformat).map( (t,i)=>{
                return {
                    x: xStep + xScale(i),
                    year: t
                }
            }
        );

        svg.selectAll(".timeLegendLine").data(listX)
            .enter().append("line")
            .attr("class", "timeLegendLine")
            .style("stroke", "000")
            .style("stroke-dasharray", "1, 2")
            .style("stroke-opacity", 1)
            .style("stroke-width", 0.2)
            .attr("x1", function(d){ return d.x; })
            .attr("x2", function(d){ return d.x; })
            .attr("y1", function(d){ return 0; })
            .attr("y2", function(d){ return graphicopt.heightG(); });
        svg.selectAll(".timeLegendText").data(listX)
            .enter().append("text")
            .attr("class", "timeLegendText")
            .style("fill", "#000000")
            .style("text-anchor","start")
            .style("text-shadow", "1px 1px 0 rgba(255, 255, 255, 0.6")
            .attr("x", function(d){ return d.x; })
            .attr("y", function(d,i) {
                if (multiFormat(d.year)!==formatTimeUlti[runopt.time.unit](d.year))
                    return graphicopt.heightG()-7;
                else
                    return graphicopt.heightG()-15;
            })
            .attr("dy", ".21em")
            .attr("font-family", "sans-serif")
            .attr("font-size", "12px")
            .text(function(d,i) {
                if (multiFormat(d.year)!==formatTimeUlti[runopt.time.unit](d.year))
                    return multiFormat(d.year);
                else
                    return formatTimeUlti[runopt.time.unit](d.year);
            });
    }
    let listX;
    function updateTimeLegend() {
        console.log("updateTimeLegend");
        listX = timeScaleIndex.ticks(runopt.timeformat).map( (t,i)=>{
                return {
                    x: xStep + xScale(i),
                    year: t
                }
            }
        );

        svg.selectAll(".timeLegendLine").data(listX).transition().duration(250)
            .style("stroke-dasharray",  function(d,i){
                if (!isLensing)
                    return "1, 2";
                else
                    return (formatTimeUlti[runopt.time.unit](d.year)<d.year) ? "2, 1" : "1, 3"})
            .style("stroke-opacity", function(d,i){
                if (multiFormat(d.year)!==formatTimeUlti[runopt.time.unit](d.year))
                    return 1;
                else {
                    if (isLensing && lMonth-lensingMul<=i && i<=lMonth+lensingMul)
                        return 1;
                    else
                        return 0;
                }
            })
            .attr("x1", function(d){return d.x; })
            .attr("x2", function(d){ return d.x; });
        svg.selectAll(".timeLegendText").data(listX).transition().duration(250)
            .style("fill-opacity", function(d,i){
                if (multiFormat(d.year)!==formatTimeUlti[runopt.time.unit](d.year))
                    return 1;
                else {
                    if (isLensing && lMonth-lensingMul<=i && i<=lMonth+lensingMul)
                        return 1;
                    else
                        return 0;
                }
            })
            .attr("x", function(d,i){
                return d.x; });
    }

    function drawTimeBox(){
        svg.append("rect")
            .attr("class", "timeBox")
            .style("fill", "#aaa")
            .style("fill-opacity", 0.2)
            .attr("x", xStep)
            .attr("y", graphicopt.heightG()-25)
            .attr("width", XGAP_* listX.length)
            .attr("height", 16)
            .on("mouseout", function(){
                isLensing = false;
                coordinate = d3.mouse(this);
                lMonth = Math.floor((coordinate[0]-xStep)/XGAP_);
                updateTransition(250);
            })
            .on("mousemove", function(){
                isLensing = true;
                coordinate = d3.mouse(this);
                lMonth = Math.floor((coordinate[0]-xStep)/XGAP_);
                updateTransition(250);
            });
    }

    function updateTimeBox(durationTime){
        var maxY=0;
        for (var i=0; i< nodes.length; i++) {
            if (nodes[i].y>maxY)
                maxY = nodes[i].y;
        }
        svg.selectAll(".timeBox").transition().duration(durationTime)
            .attr("y", maxY+12);
        svg.selectAll(".timeLegendText").transition().duration(durationTime)
            .style("fill-opacity", function(d,i){
                if (i%12==0)
                    return 1;
                else {
                    if (isLensing && lMonth-lensingMul<=i && i<=lMonth+lensingMul)
                        return 1;
                    else
                        return 0;
                }
            })
            .attr("y", function(d,i) {
                if (i%12==0)
                    return maxY+21;
                else
                    return maxY+21;
            })
            .attr("x", function(d,i){
                return d.x; });
    }

    var buttonLensingWidth =80;
    var buttonheight =15;
    var roundConner = 4;
    var colorHighlight = "#fc8";
    var buttonColor = "#ddd";

    function drawLensingButton(){
        svg.append('rect')
            .attr("class", "lensingRect")
            .attr("x", 1)
            .attr("y", 170)
            .attr("rx", roundConner)
            .attr("ry", roundConner)
            .attr("width", buttonLensingWidth)
            .attr("height", buttonheight)
            .style("stroke", "#000")
            .style("stroke-width", 0.1)
            .style("fill", buttonColor)
            .on('mouseover', function(d2){
                svg.selectAll(".lensingRect")
                    .style("fill", colorHighlight);
            })
            .on('mouseout', function(d2){
                svg.selectAll(".lensingRect")
                    .style("fill", buttonColor);
            })
            .on('click', turnLensing);
        svg.append('text')
            .attr("class", "lensingText")
            .attr("font-family", "sans-serif")
            .attr("font-size", "11px")
            .attr("x", buttonLensingWidth/2)
            .attr("y", 181)
            .text("Lensing")
            .style("text-anchor", "middle")
            .style("fill", "#000")
            .on('mouseover', function(d2){
                svg.selectAll(".lensingRect")
                    .style("fill", colorHighlight);
            })
            .on('mouseout', function(d2){
                svg.selectAll(".lensingRect")
                    .style("fill", buttonColor);
            })
            .on('click', turnLensing);
    }
    function turnLensing() {
        isLensing = !isLensing;
        svg.selectAll('.lensingRect')
            .style("stroke-width", function(){
                return isLensing ? 1 : 0.1;
            });
        svg.selectAll('.lensingText')
            .style("font-weight", function() {
                return isLensing ? "bold" : "";
            });
        svg.append('rect')
            .attr("class", "lensingRect")
            .style("fill-opacity", 0)
            .attr("x", xStep)
            .attr("y", 0)
            .attr("width", graphicopt.widthG())
            .attr("height", graphicopt.heightG())
            .on('mousemove', function(){
                coordinate = d3.mouse(this);
                lMonth = Math.floor((coordinate[0]-xStep)/XGAP_);
                updateTransition(250);
                updateTimeLegend();
            });
        updateTransition(250);
        updateTimeLegend();
    }
    let colorCatergory = d3.scaleOrdinal(d3.schemeCategory10);
    function getColor(category, count) {
        var minSat = 80;
        var maxSat = 180;
        var percent = count/maxCount[category];
        var sat = minSat+Math.round(percent*(maxSat-minSat));

        return colorCatergory(category)
        // if (category=="person")
        //     return "rgb("+sat+", "+255+", "+sat+")" ; // leaf node
        // else if (category=="location")
        //     return "rgb("+255+", "+sat+", "+sat+")" ; // leaf node
        // else if (category=="organization")
        //     return "rgb("+sat+", "+sat+", "+255+")" ; // leaf node
        // else if (category=="miscellaneous")
        //     return "rgb("+(215)+", "+(215)+", "+(sat)+")" ; // leaf node
        // else
        //     return "#000000";

    }

    function colorFaded(d) {
        var minSat = 80;
        var maxSat = 230;
        var step = (maxSat-minSat)/maxDepth;
        var sat = Math.round(maxSat-d.depth*step);

        //console.log("maxDepth = "+maxDepth+"  sat="+sat+" d.depth = "+d.depth+" step="+step);
        return d._children ? "rgb("+sat+", "+sat+", "+sat+")"  // collapsed package
            : d.children ? "rgb("+sat+", "+sat+", "+sat+")" // expanded package
                : "#aaaacc"; // leaf node
    }


    function getBranchingAngle1(radius3, numChild) {
        if (numChild<=2){
            return Math.pow(radius3,2);
        }
        else
            return Math.pow(radius3,1);
    }

    function getRadius(d) {
        // console.log("scaleCircle = "+scaleCircle +" scaleRadius="+scaleRadius);
        return d._children ? scaleCircle*Math.pow(d.childCount1, scaleRadius)// collapsed package
            : d.children ? scaleCircle*Math.pow(d.childCount1, scaleRadius) // expanded package
                : scaleCircle;
        // : 1; // leaf node
    }


    function childCount1(level, n) {
        count = 0;
        if(n.children && n.children.length > 0) {
            count += n.children.length;
            n.children.forEach(function(d) {
                count += childCount1(level + 1, d);
            });
            n.childCount1 = count;
        }
        else{
            n.childCount1 = 0;
        }
        return count;
    };

    function childCount2(level, n) {
        var arr = [];
        if(n.children && n.children.length > 0) {
            n.children.forEach(function(d) {
                arr.push(d);
            });
        }
        arr.sort(function(a,b) { return parseFloat(a.childCount1) - parseFloat(b.childCount1) } );
        var arr2 = [];
        arr.forEach(function(d, i) {
            d.order1 = i;
            arr2.splice(arr2.length/2,0, d);
        });
        arr2.forEach(function(d, i) {
            d.order2 = i;
            childCount2(level + 1, d);
            d.idDFS = nodeDFSCount++;   // this set DFS id for nodes
        });

    };

    d3.select(self.frameElement).style("height", diameter + "px");

    /*
    function tick(event) {
      link_selection.attr("x1", function(d) { return d.source.x; })
        .attr("y1", function(d) { return d.source.y; })
        .attr("x2", function(d) { return d.target.x; })
        .attr("y2", function(d) { return d.target.y; });
      var force_influence = 0.9;
      node_selection
        .each(function(d) {
          d.x += (d.treeX - d.x) * (force_influence); //*event.alpha;
          d.y += (d.treeY - d.y) * (force_influence); //*event.alpha;
        });
     // circles.attr("cx", function(d) { return d.x; })
      //    .attr("cy", function(d) { return d.y; });

    }*/


// Toggle children on click.
    function click(d) {

    }

    /*
    function collide(alpha) {
      var quadtree = d3.geom.quadtree(tree_nodes);
      return function(d) {
        quadtree.visit(function(quad, x1, y1, x2, y2) {
        if (quad.point && (quad.point !== d) && (quad.point !== d.parent) && (quad.point.parent !== d)) {
             var rb = getRadius(d) + getRadius(quad.point),
            nx1 = d.x - rb,
            nx2 = d.x + rb,
            ny1 = d.y - rb,
            ny2 = d.y + rb;

            var x = d.x - quad.point.x,
                y = d.y - quad.point.y,
                l = Math.sqrt(x * x + y * y);
              if (l < rb) {
              l = (l - rb) / l * alpha;
              d.x -= x *= l;
              d.y -= y *= l;
              quad.point.x += x;
              quad.point.y += y;
            }
          }
          return x1 > nx2 || x2 < nx1 || y1 > ny2 || y2 < ny1;
        });
      };
    }
    */
    // /===============================================
    var brush;
    var slider;
    var handle;
    var xScaleSlider;
    var xSlider = 3;
    var ySlider = 125;
    var valueSlider = 30;
    var valueMax = 30;
    function setupSliderScale(svg) {
        xScaleSlider = d3.scaleLinear()
            .domain([0, valueMax])
            .range([xSlider, 120]);

        brush = d3.brushX(xScaleSlider)
            .extent([[xSlider,-5],[120, 5]])
            .on("brush", brushed)
            .on("end", brushend);

        svg.append("g")
            .attr("class", "x axis")
            .attr("transform", "translate(0," + ySlider + ")")
            .attr("font-family", "sans-serif")
            .attr("font-size", "10px")
            .call(d3.axisBottom()
                .scale(xScaleSlider)
                .ticks(5)
                .tickFormat(function(d) { return d; })
                .tickSize(0)
                .tickPadding(5))
            .select(".domain")
            .select(function() { return this.parentNode.appendChild(this.cloneNode(true)); })
            .attr("class", "halo");

        svg.append("text")
            .attr("class", "sliderText")
            .attr("x", xSlider)
            .attr("y", ySlider-12)
            .attr("dy", ".21em")
            .attr("font-family", "sans-serif")
            .attr("font-size", "10px")
            .text("Mentioned together")
            .style("text-anchor","start");

        slider = svg.append("g")
            .attr("class", "slider")
            .attr("transform", "translate(0," + ySlider + ")")
            .call(brush);

        slider.selectAll(".extent,.resize")
            .remove();

        slider.select(".background")
            .attr("y",ySlider-5)
            .attr("height", 10);

        handle = slider.selectAll(".handle--custom")
            .data([{type: "e"}])
            .enter().append("circle")
            .attr("class", "handle--custom")
            .attr("stroke", "#000")
            .attr("cursor", "ew-resize")
            .attr("r", 5)
            .attr("cx", xScaleSlider(valueSlider));
        slider.call(brush.move, [0, valueSlider].map(xScaleSlider));
    }

    function brushed() {
        if(d3.event.selection){
            handle.attr("cx", xScaleSlider(valueSlider));
        }
        if (!d3.event.sourceEvent) return;
        //console.log("Slider brushed ************** valueSlider="+valueSlider);
        if (d3.event.sourceEvent) { // not a programmatic event
            if (xScaleSlider.invert(d3.event.selection[1])===valueSlider && xScaleSlider.invert(d3.event.selection[0])===0) return;
            valueSlider = d3.max(d3.event.selection.map(xScaleSlider.invert));
            valueSlider = Math.min(valueSlider, valueMax);
            handle.attr("cx", xScaleSlider(valueSlider));
            d3.select(this).call(d3.event.target.move, [0,valueSlider].map(xScaleSlider));
        }
    }
    function brushend() {
        // console.log("Slider brushed ************** valueSlider="+valueSlider);
        recompute();
    }
    //</funcs>
    return timeArc;
};


