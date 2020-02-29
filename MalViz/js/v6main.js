function applicationManager(globalData) {
    console.log("applicationManager");
    var arcSelect;
    var [minStep, maxStep] = d3.extent(globalData, d => d.Step);
    var svgActionWidth;
    //var initStamp, maxStamp;
    var leftBound, rightBound;

    var lensingMultiple = 10, granularity = 500;
    var initTimeStamp = d3.min(globalData, function (d) {
        return d.currenttimestamp;
    });
    var minTimeStamp = ~~(initTimeStamp / 100000) * 100000;

    var maxTimeStamp = d3.max(globalData, function (d) {
        return d.currenttimestamp;
    });

    var globalmatrix, globalib, globalgroupbyprocessname, global_links;
    var getData = DataRetrieval(globalData);
    // console.log(globalData)

    // var global_links = ExtractGraph(globalData).links;
    function DataRetrieval(inputData) {
        var groupbyOperation = d3.nest().key(function (d) {
            return d.Operation;
        }).entries(inputData);

        var group_by_process_name = d3.nest().key(function (d) {
            return d.Process_Name;
        }).entries(inputData);

        var group_by_process = d3.nest().key(function (d) {
            return d.Process;
        }).entries(inputData);

        var getdatabydomain = (function () {
            var domains = {};
            inputData.forEach(function (t) {
                if (t.hasOwnProperty('Domain')) {
                    if (!domains.hasOwnProperty(t.Domain)) {
                        domains[t.Domain] = t;
                    }
                }
            });
            return domains;
        })();

        return {
            getdatabyOperation: groupbyOperation,
            getdatabyProcessName: group_by_process_name,
            getdatabyProcess: group_by_process,
            getdatabyDomain: getdatabydomain
        }
    }

    return {
        // data stats - overview
        drawStats: function (position) {
            var margin_left = settings.ProcessArea.left;
            var bar_height = settings.ProcessArea.bar_height;
            var group_by_process = getData.getdatabyProcess;
            var group_by_operation = getData.getdatabyOperation;

            operationShown = group_by_operation.map(d => d.key);
            var thisClass;

            var padding = 10;

            d3.select(position).selectAll("*").remove();
            // d3.select(position).html(function () {
            //     return '<input type="checkbox" id="opSelection" onclick="selectAll()" checked> Select all'
            // });

            svgStats = d3.select(position).append('svg')
                .attr("id", "overview").attr('width', '100%')
                .attr('height', 20 + bar_height * group_by_process.length)
                .attr("y", 0);

            var overviewWidth = document.getElementById("overview").getBoundingClientRect().width;

            var xScale = d3.scaleLinear()
                .domain([1, d3.max(group_by_process, function (d) {
                    return d.values.length;
                })])
                // .range([settings.ProcessArea.scale_xMin, settings.ProcessArea.scale_xMax]);
                .range([1, Math.min(overviewWidth - margin_left - 50, settings.ProcessArea.scale_xMax)]);

            var countID = 0;
            group_by_process.forEach(function (process, index) {
                var group = svgStats.append('g')
                    .attr("transform", "translate(0," + (padding + index * bar_height) + ")");
                var child_process = d3.nest().key(function (d) {
                    return d.Operation
                }).entries(process.values);

                child_process = child_process.sort(function (a, b) {
                    return b.values.length - a.values.length;
                });
                var xpos = margin_left;

                child_process.forEach(function (child) {
                    group.append('rect')
                        .attr("id", "ovRect" + child.key.replace(" ", ""))
                        .attr('x', xpos)
                        .attr('width', function () {
                            return xScale(child.values.length)
                        })
                        .attr('height', 30)
                        .attr('fill', function () {
                            return colorPicker(child.key);
                        })
                        .classed("g" + child.key.replace(" ", ""), true)
                        .classed("op0", child.key === "Process Profiling")
                        .classed("op1", !(child.key === "Process Profiling"))

                        .on('mouseover', function () {
                            thisClass = d3.select(this).attr("class");
                            d3.select(this)
                                .classed("op2", true)
                                .classed("op0 op1", false);

                            divOperation.transition()
                                .duration(200)
                                .style("opacity", .9);
                            divOperation.html('Operation: ' + child.key +
                                "<br/> Total calls: " +
                                child.values.length.toLocaleString() + "<br/>")
                                .style("left", (d3.event.pageX) + 5 + "px")
                                .style("top", (d3.event.pageY - 28) + "px")
                                .style("pointer-events", "none")
                                .style("background-color", "#cccccc")
                                .style("padding", "5px");
                        })
                        .on('mouseleave', function (d) {
                            divOperation.style("opacity", 0);
                            d3.select(this)
                                .classed("op0 op1 op2", false)
                                .classed(thisClass, true)
                        })

                        .on("click", function () {
                            document.getElementById("opSelection").checked = false;
                            if (firstClick === undefined) {
                                firstClick = true;
                                var key1 = child.key.replace(" ", "");
                                // if profiling
                                // the only difference is: not disable all others
                                if (child.key.replace(" ", "") === "ProcessProfiling") {
                                    console.log("bingo");
                                    // show rect
                                    d3.select("#heatmap").selectAll('rect.' + key1)
                                        .style('visibility', "visible")
                                        .raise();

                                    // show arc
                                    arcSelect = d3.selectAll("[class*=o" + key1 + "]");
                                    arcSelect
                                        .classed("visible", !active[key1])
                                        .classed("hidden", !!active[key1])
                                        .raise();
                                    thisClass = d3.select(this).attr("class").split(" ")[0] + " op1";
                                }
                                else {
                                    // first, hide all
                                    // hide rect
                                    d3.select("#heatmap").selectAll('rect[group=detail]')
                                        .style('visibility', "hidden");

                                    // hide arc
                                    d3.selectAll(".arc")
                                        .classed("hidden", true);

                                    // unselect group
                                    svgStats.selectAll("rect")
                                        .classed("op0", true)
                                        .classed("op1 op2", false);

                                    // then, visible selection
                                    //show rect
                                    d3.select("#heatmap").selectAll('rect.' + key1)
                                        .style('visibility', "visible")
                                        .raise();

                                    //show arc
                                    arcSelect = d3.selectAll("[class*=o" + key1 + "]");
                                    arcSelect
                                        .classed("visible", !active[key1])
                                        .classed("hidden", !!active[key1])
                                        .raise();

                                    d3.select(this)
                                        .classed("op1", true)
                                        .classed("op0 op2", false);
                                }
                                // change status
                                active[key1] = !active[key1];
                            }
                            else {
                                var key2 = child.key.replace(" ", "");

                                // show group
                                d3.select(this)
                                    .classed("op1", () => {
                                        let option = active[key2] ? " op0" : " op1";
                                        thisClass = d3.select(this).attr("class").split(" ")[0] + option;
                                        return !active[key2];
                                    })
                                    .classed("op2", false)
                                    .classed("op0", !!active[key2]);

                                // show arc
                                d3.selectAll("[class*=o" + key2 + "]")
                                    .classed("visible", !active[key2])
                                    .classed("hidden", !!active[key2])
                                    .raise();

                                // show rect
                                d3.select("#heatmap").selectAll('rect.' + key2)
                                    .style('visibility', active[key2] ? "hidden" : "visible")
                                    .raise();

                                active[key2] = !active[key2];
                            }
                        });

                    group.append("clipPath")
                        .attr("id", "clip-" + countID)
                        .append("use")
                        .attr("xlink:href", "#" + "ovRect" + child.key.replace(" ", ""));

                    // clip path
                    group.append("text")
                        .attr("clip-path", function (d) {
                            return "url(#clip-" + countID + ")";
                        })
                        .selectAll("tspan")
                        .data([child.key])
                        .enter().append("tspan")
                        .classed("unselectable", true)
                        .attr('x', xpos + 1)
                        .attr("y", 18)
                        .text(function (d) {
                            return d;
                        })
                        .attr("fill", "white")
                        .attr("font-size", "11px")
                        .attr("font-family", "sans-serif");

                    xpos += xScale(child.values.length) + 2;
                    countID++;
                });
                group.append('text')
                    .text(process.key + " (" + process.values.length + ")")
                    .attr('x', 0).attr('y', 18);
            });

            // document.getElementById("opSelection").checked = operationShown.indexOf("Process Profiling") < 0;
        },

        // List of Operations (legend)
        drawStats2: function (position) {
            d3.select(position).selectAll("*").remove();
            var svgStats = d3.select(position).append('svg').attr('width', '100%').attr('height', 1190);
            var group_O = svgStats.append('g');

            var group_by_operation = d3.keys(list);
            group_by_operation.forEach(function (operation, index) {
                var rect = group_O.append('g').attr('transform', 'translate(0,' + index * 15 + ')');
                rect.append('rect').attr('width', '20px').attr('height', '12px').attr('fill', function (d) {
                    return colorPicker(operation);
                });
                rect.append('text').text(operation).attr('x', '30px').style('color', 'black').style('font-size', '12px').attr('y', '10px')
            })
        },
        loadMatrix: function () {
            return loadMatrix(global_links);
        },

        drawMain: function (position) {
            d3.select(position).selectAll("*").remove();
            var lines = [];
            var group_by_process_name = getData.getdatabyProcessName;
            var haveChild = [];
            var operationKeys = group_by_process_name.map(d => d.key);

            globalData.forEach(d => {
                for (var i = 0; i < operationKeys.length; i++) {
                    if (d.targetProcessName) {
                        haveChild.push(d);
                    }
                }
            });

            // mutual
            var updated_data = UpdateProcessNameWithChild(group_by_process_name, haveChild);

            for (var i = 0; i < updated_data.length; i++) {
                updated_data[i].children = [];
                for (var j = 0; j < updated_data[i].childs.length; j++) {
                    updated_data[i].children.push(updated_data[updated_data[i].childs[j]]);
                }

                // sort children
                updated_data[i].children.sort(function (a, b) {
                    if (a.childs.length < b.childs.length) {
                        return -1;
                    }
                    else if (a.childs.length > b.childs.length) {
                        return 1;
                    }
                    else {
                        if (a.values[0].Step < b.values[0].Step) {
                            return 1;
                        }
                        else if (a.values[0].Step > b.values[0].Step) {
                            return -1;
                        }
                        else
                            return 0;
                    }
                });
            }

            updated_data.sort(function (a, b) {
                if (getSuccessors(a, []).length < getSuccessors(b, []).length) {
                    return 1;
                }
                else if (getSuccessors(a, []).length > getSuccessors(b, []).length) {
                    return -1;
                }
                else {
                    if (a.values[0].Step < b.values[0].Step) {
                        return -1;
                    }
                    else if (a.values[0].Step > b.values[0].Step) {
                        return 1;
                    }
                    else
                        return 0;
                }
            });

            orderedArray = [];

            for (var i = 0; i < updated_data.length; i++) {
                dfs(updated_data[i], orderedArray);
            }

            // DFS - convert tree to array using DFS
            function dfs(o, array) {
                if (o.isDone == undefined) {
                    array.push(o);
                    o.isDone = true;
                    if (o.children != undefined) {
                        for (var i = 0; i < o.children.length; i++) {
                            dfs(o.children[i], array);
                        }
                    }
                }
            }

            // DFS
            function getSuccessors(o, array) {
                if (o.children != undefined) {
                    for (var i = 0; i < o.children.length; i++) {
                        array.push(o.children[i]);
                    }
                    for (var i = 0; i < o.children.length; i++) {
                        getSuccessors(o.children[i], array)
                    }
                }
                return array;
            }

            var margin_left = 30;  // min margin = 30
            var rect_height = 30, rect_margin_top = 5, group_rect_height = rect_height;
            var rect_normal_height = rect_height - 8;
            var rectSpacing = 2.5;

            group_by_process_name.forEach(function (d) {
                d.position = getProcessNameIndex(orderedArray, d.key);
            });

            group_by_process_name = group_by_process_name.sort(function (a, b) {
                return a.position - b.position;
            });
            // orderedArray is the topological ordering
            //  debugger;

            var svgheight = group_by_process_name.length * (group_rect_height);

            var library = d3.nest().key(function (d) {
                return d.library
            }).entries(globalData);

            library = library.filter(function (value) {
                if (value.key != 'undefined' && value.values.length > 10) return value
            })
            var libarr = [];
            library.forEach(function (d) {
                libarr.push(d.key);
            })
            library = library.sort(function (a, b) {
                return b.values.length - a.values.length
            })
            var matrix = make2Darray(group_by_process_name.length, library.length);

            // ✿ ✿ ✿ ✿ ✿ ✿ ✿ ✿ ✿ ✿ ✿ ✿ ✿ ✿ ✿ ✿ ✿ ✿ ✿ ✿ ✿ ✿ ✿ ✿ ✿ ✿ ✿ ✿ ✿ ✿ ✿
            // ✿ ✿ ✿ ✿ ✿ ✿ ✿ ✿ ✿ ✿ ✿ ✿ Huyen 2018-19 ✿ ✿ ✿ ✿ ✿ ✿ ✿ ✿ ✿ ✿ ✿ ✿ ✿ ✿

            globalData.sort(function (a, b) {
                return a.currenttimestamp - b.currenttimestamp;
            });

            // Variables
            var timeInterval = maxTimeStamp - minTimeStamp;
            var numSecond = timeInterval / 100000;
            var each = numSecond / granularity;
            var rect_width = 1;
            var numTimeStep = 10;

            var timeGap = timeInterval / (numTimeStep * 100000);
            var roundedSecond = ~~timeGap;
            var roundedStep = roundedSecond * 100000; // to add to each step
            var timeData = [];
            var initStepData = [];

            var lensRadius = 20;
            var pointer = -1000;


            // functions here ====================================================

            function convert(time) {     // convert time to string, if time < 10 => 0+time
                if (time < 10) {
                    return "0" + time;
                }
                else return time.toString();
            }

            function getTimeBoxData() {
                for (let i = 0; i < numTimeStep + 1; i++) {
                    // display 1+numTimeStep

                    let currentTime = (minTimeStamp + i * roundedStep) / 100000;
                    let t_hour = ~~(currentTime / 3600);
                    let t_minute = ~~((currentTime - t_hour * 3600) / 60);
                    let t_second = ~~(currentTime - t_hour * 3600 - t_minute * 60);

                    let stamp = {
                        hour: t_hour,
                        minute: t_minute,
                        second: t_second
                    };
                    let timeString = stamp.hour.toString() + ":" + convert(stamp.minute) + ":" + convert(stamp.second);

                    let step = (stamp.hour * 3600 + stamp.minute * 60 + stamp.second) * 100000 - minTimeStamp;
                    initStepData.push(step);
                    timeData.push({
                        time: timeString,
                        stamp: stamp,
                        step: step

                    })

                }
            }

            var reverseStepScale = function (x) {
                return x * timeInterval / maxProcessLength;
            };

            d3.select('#loading').remove();

            // SVG declarations =======================================================
            // Slider -----------------------------------------------------------------

            // granularity ------------------------------------------------------------------
            // var graContainer = d3.select("#heatmap")
            //     .append("svg").attr("id", "magContainer")
            //     .attr("x", "50")
            //     .attr("y", "100")
            //     .attr("width", "400")
            //     .attr("height", "70");

            // graContainer.append("svg:text").attr("display", "block")
            // // .append("svg:tspan").attr("id", "graValue").attr('x', 0).attr('dy', 25).text("Mouse over timeline for magnification. ").attr("font-weight", "bold")
            //     .append("svg:tspan").attr("id", "graValue")
            //     .attr("y", 30)
            //     .text(" Granularity: " + granularity + ". Each magnified gap equals to " + each.toFixed(2) + " seconds.").attr("font-weight", "normal")
            // // .attr("font-family", "sans-serif")
            //     .attr("font-size", "15px")
            // ;
            // SVG =======================================================================
            // Outline -----------------------------------------------------------
            // legend
            d3.select("#legend").selectAll("*").remove();
            var legend = d3.select("#legend")
                .append("svg")
                // .attr("x", 100)
                // .attr("y", 100)
                .attr("width", 170)
                .attr("height", 120)
                .append("g")
                .attr("id", "legend")
                .attr("transform", "translate(20,0)");

            legend.selectAll("circle")
                .data(stackColor)
                .enter()
                .append("circle")
                .attr("cx", 0)
                .attr("cy", (d, i) => 10 + i * 20)
                .attr("r", 6)
                .attr("fill", d => d);


            legend.selectAll(".textLegend")
                .data(categories)
                .enter()
                .append("text")
                .attr("class", "textLegend")
                .text(d => {
                    return (d === "Network")? "Network Address" : d
                })
                .attr("font-size", "15px")
                // .attr("font-family", "sans-serif")
                .attr("x", 20)
                .attr("y", (d, i) => 15 + i * 20);

            getTimeBoxData();

            var timeBoxHeight = 30;
            var dashHeight = svgheight + timeBoxHeight;

            var width1 = document.getElementById("heatmap").getBoundingClientRect().width;
            var outline = d3.select('#heatmap').append('svg')
                .attr("class", "outline")
                .attr("height", dashHeight)
                .attr("width", width1 - 35)
                .attr("id", "outline");

            var bbox = document.getElementById("outline");
            svgActionWidth = bbox.getBoundingClientRect().width;
            var namespace = 120;
            var maxProcessLength = svgActionWidth - namespace;   // for dislaying name of virus

            // Draw grids
            var stepData = [];
            var dashStepSpace = initStepData[1] - initStepData[0];
            var numNewSpace = granularity / numTimeStep;
            var newDashStepSpace = dashStepSpace / numNewSpace;
            for (let i = 0; i < initStepData.length; i++) {
                for (let j = 0; j < numNewSpace; j++) {
                    let temp = initStepData[i] + j * newDashStepSpace;
                    let mainIndex = (j === 0) ? true : false;
                    stepData.push({
                        step: temp,
                        main: mainIndex
                    });
                }
            }

            var norm = maxProcessLength / timeInterval;
            var gra = granularity / numTimeStep;        // granularity
            var addTime2 = timeInterval / (numTimeStep * 100000);
            var roundedSecond2 = ~~addTime2;
            var roundedStep2 = roundedSecond2 * 100000 / gra; // to add to each step

            function StepScale(xStep, isLensing) {     // output position to display
                if (isLensing) {
                    var stepPosition = ~~(pointer / roundedStep2);
                    leftBound = Math.max(0, roundedStep2 * (stepPosition - lensRadius));
                    rightBound = Math.min(timeInterval, roundedStep2 * (stepPosition));

                    var lensingStep = rightBound - leftBound;
                    var expoInLens = lensingMultiple * norm;
                    var remainProcessLength = maxProcessLength - lensingStep * expoInLens;
                    var expoOutLens = remainProcessLength / (timeInterval - (rightBound - leftBound));

                    var newxStep = xStep;
                    var posLeftLens = newxStep * expoOutLens;
                    var posInLens = leftBound * expoOutLens + (newxStep - leftBound) * expoInLens;
                    var posRightLens = leftBound * expoOutLens + lensingStep * expoInLens + (newxStep - rightBound) * expoOutLens;

                    if (xStep < leftBound) {
                        return posLeftLens;
                    }
                    else if (xStep > rightBound) {
                        return posRightLens;
                    }
                    else // lensing area
                        return posInLens;
                }
                else {
                    return xStep * norm;
                }
            };
            outline.selectAll(".verticalBars").remove();
            outline
                .append("g")
                .attr("id", "verticalGroup")
                .selectAll(".verticalBars")
                .data(stepData).enter()
                .append("line")
                .attr('class', "verticalBars")
                .attr("id", (d, i) => "timestep" + i)
                .attr("x1", d => StepScale(d.step) + margin_left)
                .attr("x2", d => StepScale(d.step) + margin_left)
                .attr("y1", 0)
                .attr("y2", dashHeight)
                .style("stroke", "black")
                .style("stroke-opacity", function (d, i) {
                    if (d.main) {
                        return 0.4
                    }
                    else {
                        return 0
                    }
                })
                .style("stroke-width", 1)
                .style("stroke-dasharray", function (d, i) {
                    if (d.main) {
                        return "3,2"
                    }
                    else {
                        return "1,3"
                    }
                });

            d3.select("#verticalGroup")
                .append("line")
                .attr("id", "endStep")
                .attr("x1", svgActionWidth)
                .attr("x2", svgActionWidth)
                .attr("y1", 0)
                .attr("y2", dashHeight)
                .style("stroke", "black")
                .style("stroke-opacity", "0.4")
                .style("stroke-width", 1)
                .style("stroke-dasharray", "3, 2");

            var svg_process = outline.append('svg')
                .attr("id", "processes").attr('margin-left', '20px')
                .attr('width', svgActionWidth).attr('height', svgheight).attr("border", 1)
                .attr("y", "40");

            var timeBox = outline.append('svg').attr("class", "timeBox")
                .attr("height", timeBoxHeight)
                .attr("width", svgActionWidth)
                .attr("id", "svgTimeBox");

            timeBox.append("rect")
                .style("fill", "#ffffff")
                .style("fill-opacity", 0.8)
                .attr("height", 30)
                .attr("width", svgActionWidth)

            timeBox.selectAll("text").data(timeData).enter()
                .append("text")
                .attr("id", (d, i) => "timestep" + i)
                .attr("y", 20)
                .attr("x", (d, i) => {
                    return StepScale(d.step) + margin_left;
                })
                .text(d => d.time)
                .attr("fill", "black")
                .attr("font-family", "sans-serif")
                .attr("font-size", "13px")
                .attr("text-anchor", "start");

// MOUSEMOVE =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
            var t = 50;
            timeBox.append("rect")
                .style("fill", "#aaa")
                .style("fill-opacity", 0.3)
                .attr("height", 30)
                .attr("width", svgActionWidth)
                .on("mousemove", function () {
                    if (lensingStatus) {
                        var coordinates = [0, 0];
                        coordinates = d3.mouse(this);
                        var x = coordinates[0];
                        pointer = reverseStepScale(Math.max(0, x));

                        // console.log("x in v4: " + d3.event.clientX);
                        //
                        // console.log("x = "+x);
                        // console.log("time step (pointer): " + pointer);

                        // change lensing

                        svg_process.selectAll("rect")
                        // .transition().duration(t)
                            .attr("x", d => (StepScale(d.Step, true)) * rect_width + margin_left);

                        timeBox.selectAll("text")
                        // .transition().duration(t)
                            .attr("x", (d, i) => {
                                return StepScale(d.step, true) + margin_left;
                            });

                        orderedArray.forEach((parentProcess, pIndex) => {
                            if (parentProcess.children.length > 0) {
                                parentProcess.children.forEach((childProcess, cIndex) => {
                                    parentProcess.childInfo[childProcess.key].forEach((child, i) => {
                                        svg_process.selectAll('.path_' + pIndex + "_" + cIndex + "_" + i)
                                        // .transition().duration(t)
                                            .attr('transform', function () {
                                                var posX = (StepScale(child.step, true)) * rect_width + margin_left;
                                                var posY = (getProcessNameIndex(updated_data, childProcess.key) + pIndex) * group_rect_height / 2 + group_rect_height / 2;
                                                return 'translate(' + posX + ',' + posY + ')';
                                            });
                                    })
                                })
                            }
                            if (parentProcess.selfCalls.length > 0) {
                                parentProcess.selfCalls.forEach((self, i) => {
                                    svg_process.selectAll('.path_' + pIndex + "_" + pIndex + "_" + i)
                                    // .transition().duration(t)
                                        .attr('transform', function () {

                                            var posX = (StepScale(self.step, true)) * rect_width + margin_left - 9;
                                            var posY = (getProcessNameIndex(updated_data, parentProcess.key) + pIndex) * group_rect_height / 2 + group_rect_height / 2;

                                            return 'translate(' + posX + ',' + posY + ')';
                                        })
                                })
                            }
                        });

                        if (streamEvent) {
                            svg_process.selectAll(".stream")
                            // .transition().duration(t)
                                .attr("d", area.x(function (d, i) {
                                    return StepScale(xScale(i), true) + margin_left;
                                }));
                        }
                        group_by_process_name.forEach(function (row, index) {
                            svg_process.selectAll(".malName" + index)
                            // .transition().duration(t)
                                .attr('x', () => {
                                    return (StepScale(row.values[row.values.length - 1].Step, true) * rect_width + margin_left + 5)
                                })
                                .attr('y', group_rect_height / 2)
                        });

                        outline.selectAll(".verticalBars")
                        // .transition().duration(t)
                            .attr("x1", d => StepScale(d.step, true) + margin_left)
                            .attr("x2", d => StepScale(d.step, true) + margin_left)
                            .style("stroke-opacity", function (d, i) {
                                if (d.main) {
                                    return 0.4
                                }    // main ticks
                                else if (d.step < leftBound) {
                                    return 0;
                                }
                                else if (d.step > rightBound) {
                                    return 0;
                                }
                                else {
                                    return 0.2;
                                }
                            })
                            .style("stroke-width", 1)
                            .style("stroke-dasharray", function (d, i) {
                                if (d.main) {
                                    return "3,2"
                                }
                                else {
                                    return "1,3"
                                }
                            });
                    }

                })
            ;


            // stream calculation ～ ～ ～ ～ ～ ～ ～ ～ ～ ～ ～ ～ ～ ～ ～ ～ ～ ～

            var streamGroup = [];
            function stream(group_by_process_name, globalData) {
                var group = group_by_process_name;
                var global_data = globalData;
                var ref = {};
                var defaultValue = {
                    Registry: 0,
                    Network: 0,
                    File: 0,
                    exe: 0,
                    dll: 0,
                };
                var binSize = 20000;
                global_data.forEach(d => {
                    d.binStep = Math.round(d.Step / binSize);
                });
                maxBin = d3.max(global_data, d => d.binStep);

                var a = group.map(process => {

                    process.values.forEach(d => {
                        d.binStep = Math.round(d.Step / binSize);
                    });
                    process.values.forEach(d => {
                        if (d.Path.length > 0) {
                            ref[d.Path] = 1;
                        }
                    });

                    var binData = d3.nest()
                        .key(d => d.binStep)
                        // .rollup(v => v.length)
                        .entries(process.values
                            .filter(d => d.Path.length > 0)
                        );

                    binData.forEach(bin => {
                        bin.group = {
                            Registry: 0,
                            Network: 0,
                            File: 0,
                            exe: 0,
                            dll: 0,
                        };
                        let nest = d3.nest().key(d => d.Process)
                            .rollup(v => v.length)
                            .entries(bin.values);

                        bin.group["Registry"] = nest.find(d => d.key === "Registry") ? nest.find(d => d.key === "Registry").value : 0;
                        bin.group["Network"] = nest.find(d => d.key === "Network") ? nest.find(d => d.key === "Network").value : 0;

                        let rest = bin.values.filter(d => (d.Process !== "Registry") && (d.Process !== "Network"));
                        rest.forEach(rec => {
                            if (rec.Path.endsWith(".exe")) {
                                bin.group.exe += 1;
                            }
                            else if (rec.Path.endsWith(".dll")) {
                                bin.group.dll += 1;
                            }
                            else {
                                bin.group.File += 1;
                            }
                        });
                        categories.forEach(d => {
                            if (bin.group[d] > maxCall) {
                                maxCall = bin.group[d]
                            }
                            if (bin.group[d] < minCall) {
                                minCall = bin.group[d]
                            }

                        })
                    });
                    // add dummy points
                    process.calls = [];
                    for (var i = 0; i < maxBin + 1; i++) {
                        process.calls.push(binData.find(d => d.key == i) ?
                            binData.find(d => d.key == i).group : defaultValue)
                    }
                    return {
                        process: process.key,
                        calls: process.calls
                    }
                });
                return a;
            }

            function streamToggle() {
                if (!streamEvent){
                    var streamData = stream(group_by_process_name, globalData);

                    xScale = d3.scaleLinear()
                        .domain([0, maxBin])
                        .range([0, maxStep]);

                    yScale = d3.scalePoint()
                        .domain(d3.range(streamData.length))
                        .range([0, svgheight]);

                    streamHeightScale =
                        d3.scaleSqrt()
                            .domain([minCall, maxCall])
                            .range([-rect_normal_height / 2, rect_normal_height / 2]);

                    area = d3.area()
                        .x(function (d, i) {
                            return StepScale(xScale(i)) + margin_left;
                        })
                        .y0(function (d) {
                            return streamHeightScale(d[0])
                        })
                        .y1(function (d) {
                            return streamHeightScale(d[1])
                        })
                        .curve(d3.curveCatmullRom);
                    group_by_process_name.forEach(function (row, index) {
                        var stacks = stack(streamData[index].calls);
                        streamGroup[index].selectAll("path")
                            .data(stacks)
                            .enter().append("path")
                            .attr("transform", "translate(0" + "," + (rectSpacing + rect_normal_height) + ")")
                            .attr("class", "stream")
                            .attr("d", area)
                            .attr("fill", (d, i) => stackColor[i])
                        ;
                    });
                    console.log(undefined);
                    streamEvent = 1;
                    document.getElementById("streamCheck").checked = true;
                    return true;
                }
                else if (streamEvent === 1){
                    d3.selectAll(".stream")
                        .attr("visibility", "hidden");
                    streamEvent = 2;
                    return false;
                }
                else if (streamEvent === 2){
                    d3.selectAll(".stream")
                        .attr("visibility", "visible");
                    streamEvent = 1;
                    return true;
                }


            }
            d3.select("#streamCheck").on("click", streamToggle);

            group_by_process_name.forEach(function (row, index) {
                var group = svg_process.append('g')
                    .attr("transform", "translate(0," + index * group_rect_height + ")");

                group.append('line').attr('stroke-dasharray', '2, 5').attr('stroke', 'black').attr('stroke-width', 0.5)
                    .attr('x1', (StepScale(minStep) * rect_width + margin_left + 10))
                    .attr('y1', rect_height / 2)
                    .attr('x2', (((StepScale(maxStep)) * rect_width + margin_left) + 10))
                    .attr('y2', rect_height / 2);

                var processes = row.values.filter(function (filter) {
                    if (filter.hasOwnProperty('library') && libarr.includes(filter.library) == true) return filter;
                });
                var filtered_library = d3.nest().key(function (d) {
                    return d.library
                }).entries(processes);

                filtered_library.forEach(function (d) {
                    var obj = {};
                    obj.source = index;
                    obj.target = libarr.indexOf(d.key);
                    obj.value = d.values;

                    lines.push(obj);
                });

                // streamDraw =========================

                streamGroup[index] = group.append("g")
                    .attr("id", "streamGroup" + index)


                // streamDraw =========================
                // textDraw
                var arcActive, firstClick;
                group.append('text')
                    .attr("class", "malName" + index)
                    .text(row.key.slice(0, 30))
                    .attr('x', () => {
                        return StepScale(row.values[row.values.length - 1].Step) * rect_width + margin_left + 5
                    })
                    .attr('y', group_rect_height / 2)
                    .attr('text-anchor', 'start')
                    .classed("linkText", true)
                    .on("mouseover", () => {
                        d3.select(d3.event.target)
                            .classed("op1", true)
                    })
                    .on("mouseout", () => {
                        d3.select(d3.event.target)
                            .classed("op1", false);
                    })
                    .on("click", function () {

                        d3.selectAll(".arc")
                            .classed("hidden", !arcActive)
                            .classed("visible", !!arcActive);

                        //show arc
                        d3.selectAll("[class*=a" + row.key.split(".").join("") + "]")
                            .classed("visible", !arcActive)
                            .classed("hidden", false)
                            .raise();

                        arcActive = !arcActive;
                    });

                //================== rectDraw for process here =================
                var rect = group.selectAll('rect')
                    .data(row.values
                        // .filter(d => d["Process"] !== "Profiling")
                    ).enter().append('rect')
                    .attr('class', function (d, i) {
                        return d.Operation.replace(" ", "");
                    })
                    .attr('x', function (d, i) {
                        return (StepScale(d.Step)) * rect_width + margin_left;
                    })
                    .attr('group', 'detail')
                    .attr('id', function (d) {
                        return d.Step;
                    }).attr('y', function (d) {
                        if (d.hasOwnProperty('VirusTotal')) {
                            if (d.VirusTotal.malicious > 0)
                                return 0;
                        }
                        else {
                            return rectSpacing;
                        }
                    })
                    .attr('width', rect_width)
                    .attr('height', function (d) {
                        if (d.hasOwnProperty('VirusTotal')) {
                            console.log("VirusTotal")
                            if (d.VirusTotal.malicious > 0){
                                return rect_height;
                            }

                        }
                        else {
                            return rect_normal_height;
                        }
                    })
                    .style('fill-opacity', 0.4)
                    .attr('fill', function (d) {
                        return colorPicker(d.Operation);
                    })
                    .style("visibility", d => {
                        if (d["Process"] !== "Profiling") {
                            return "visible"
                        }
                        else return "hidden"
                    })
                    // .style("display", "none")
                    .on('mouseover', function (d) {
                        if (d.Operation == 'UDP Send' && d.hasOwnProperty('VirusTotal')) {

                            div.transition()
                                .duration(200)
                                .style("opacity", 1).style('width', '250px');
                            div.html('<table><tr><td colspan="4">Source: https://www.virustotal.com</td></tr><tr><td><img src="images/clean.png" width="20" height="20"/></td><td> Clean (' + d.VirusTotal.harmless + ')</td>' +
                                '<td><img src="images/malicious.png" width="20" height="20"/></td><td><font color="red"><b>Malicious (' + d.VirusTotal.malicious + ')</b> </font></td></tr>' +
                                '<tr><td><img src="images/suspicious.png" width="20" height="20"/></td><td> Suspicious (' + d.VirusTotal.suspicious + ')</td>' +
                                '<td><img src="images/question.png" width="20" height="20"/></td><td> Undetected (' + d.VirusTotal.undetected + ')</td></tr><tr><td colspan="4">Target domain: ' + d.Domain + '</td></tr>' +
                                '<td colspan="4">Connecting time: ' + d.Timestamp + '</td></tr></table>')
                                .style("left", (d3.event.pageX) + "px")
                                .style("top", (d3.event.pageY - 28) + "px");
                        }
                        else {
                            // Tooltip for processes
                            div2.transition()
                                .duration(100)
                                .style("opacity", 1);
                            div2
                                .html(
                                    "<table>"
                                    + "<col width='80'>"

                                    + "<tr>"
                                    + "<td>Program</td>"
                                    + "<td class ='bold'>" + d.Process_Name + "</td>"
                                    + "</tr>"
                                    + "<tr>"
                                    + "<td>Operation</td>"
                                    + "<td class ='bold' style='color: " + colorPicker(d.Operation) + ";'>" + d.Operation + "</td>"
                                    + "</tr>"
                                    + "<tr>"
                                    + "<td>Event type</td>"
                                    + "<td>" + d.Process + "</td>"
                                    + "</tr>"
                                    + "<tr>"
                                    + "<td>Timestamp</td>"
                                    + "<td >" + d.Timestamp + "</td>"
                                    + "</tr>"
                                    + "<tr>"
                                    + "<td>Path</td>"
                                    + "<td>" + d.Path + "</td>"
                                    + "</tr>"


                                    + "<tr>"
                                    + "<td>Detail</td>"
                                    + "<td>" + d.Detail + "</td>"
                                    + "</tr>"


                                    + "<tr>"
                                    + "<td>PID</td>"
                                    + "<td>" + d.PID + "</td>"
                                    + "</tr>"
                                    + "</table>")
                                .style("left", (d3.event.pageX) + 20 + "px")
                                .style("top", (d3.event.pageY + 20) + "px")
                                .style("pointer-events", "none");
                        }
                    })
                    .on('click', function (d) {
                        var paths = d3.selectAll('path.detail_path').style('opacity', 0);
                        d3.selectAll('path[source="' + (getProcessNameIndex(updated_data, d.Process_Name)) + '"]').style('opacity', 1)
                        ;

                    })
                    .on('mouseout', d => {
                        div2.transition()
                            .duration(100)
                            .style("opacity", 0);
                    });
            });

            // MOUSELEAVE =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=

            outline.on("mouseleave", function () {
                outline.selectAll(".verticalBars")
                // .transition().duration(200)
                    .attr("x1", d => StepScale(d.step) + margin_left)
                    .attr("x2", d => StepScale(d.step) + margin_left)
                    .style("stroke-opacity", function (d, i) {
                        if (d.main) {
                            return 0.4
                        }
                        else {
                            return 0
                        }
                    })

                    .style("stroke-width", 1)
                    .style("stroke-dasharray", function (d, i) {
                        if (d.main) {
                            return "3,2"
                        }
                        else {
                            return "1,3"
                        }
                    });

                svg_process.selectAll("rect")
                // .transition().duration(200)
                    .attr("x", d => (StepScale(d.Step)) * rect_width + margin_left);

                timeBox.selectAll("text")
                // .transition().duration(200)
                    .attr("x", (d, i) => {
                        return StepScale(d.step) + margin_left;
                    });

                orderedArray.forEach((parentProcess, pIndex) => {
                    if (parentProcess.children.length > 0) {
                        parentProcess.children.forEach((childProcess, cIndex) => {
                            parentProcess.childInfo[childProcess.key].forEach((child, i) => {
                                svg_process.selectAll('.path_' + pIndex + "_" + cIndex + "_" + i)
                                // .transition().duration(200)
                                    .attr('transform', function () {
                                        var posX = (StepScale(child.step)) * rect_width + margin_left;
                                        var posY = (getProcessNameIndex(updated_data, childProcess.key) + pIndex) * group_rect_height / 2 + group_rect_height / 2;
                                        return 'translate(' + posX + ',' + posY + ')';
                                    });
                            })
                        })
                    }
                    if (parentProcess.selfCalls.length > 0) {
                        parentProcess.selfCalls.forEach((self, i) => {
                            svg_process.selectAll('.path_' + pIndex + "_" + pIndex + "_" + i)
                            // .transition().duration(200)
                                .attr('transform', function () {

                                    var posX = (StepScale(self.step)) * rect_width + margin_left - 9;
                                    var posY = (getProcessNameIndex(updated_data, parentProcess.key) + pIndex) * group_rect_height / 2 + group_rect_height / 2;

                                    return 'translate(' + posX + ',' + posY + ')';
                                })
                        })
                    }
                });
                if (streamEvent) {
                    svg_process.selectAll(".stream")
                    // .transition().duration(200)
                        .attr("d", area.x(function (d, i) {
                            return StepScale(xScale(i)) + margin_left;
                        }));
                }
                group_by_process_name.forEach(function (row, index) {
                    svg_process.selectAll(".malName" + index)
                    // .transition().duration(200)
                        .attr('x', (StepScale(row.values[row.values.length - 1].Step) * rect_width + margin_left + 5))
                        .attr('y', group_rect_height / 2)
                });

            });

            // END MOUSELEAVE -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=

            orderedArray.forEach((parentProcess, pIndex) => {
                if (parentProcess.children.length > 0) {
                    parentProcess.children.forEach((childProcess, cIndex) => {
                        // define arrow
                        svg_process
                            .append("svg:defs")
                            .selectAll(".arrow")
                            .data(parentProcess.childInfo[childProcess.key])
                            .enter()
                            .append("svg:marker")
                            .attr("id", (d, i) => {
                                return "arrow_" + pIndex + "_" + cIndex + "_" + i
                            })
                            .attr("class", "arrow")
                            .attr("refX", 6)
                            .attr("refY", 4)
                            .attr("markerWidth", 8)
                            .attr("markerHeight", 8)
                            .style("fill", d => colorPicker(d.event))
                            .attr("orient", 0)
                            .append('path')
                            .attr('d', 'M0,0 L0,8 L8,4 z');

                        // arcDraw
                        var signedOrienation = getProcessNameIndex(updated_data, childProcess.key) - pIndex;
                        parentProcess.childInfo[childProcess.key].forEach((child, i) => {
                            svg_process
                                .append('path').attr("class", () => {
                                return 'arc'
                                    + ' a' + parentProcess.key.split(".").join("") + "_a" + childProcess.key.split(".").join("")
                                    + ' path_' + pIndex + "_" + cIndex + "_" + i
                                    + " o" + child.event.replace(" ", "");
                            })
                                .attr("id", 'path_' + pIndex + "_" + cIndex + "_" + i)
                                .attr('d', d3.arc()
                                    .innerRadius(Math.abs(signedOrienation) * group_rect_height / 2 - 1)
                                    .outerRadius(Math.abs(signedOrienation) * group_rect_height / 2)
                                    .startAngle(signedOrienation > 0 ? -Math.PI : Math.PI / 90) //converting from degs to radians
                                    .endAngle(signedOrienation > 0 ? Math.PI / 90 : -Math.PI))
                                .attr('fill', colorPicker(child.event))
                                .attr('source', pIndex)
                                .attr('target', getProcessNameIndex(updated_data, childProcess.key))
                                .attr('transform', function () {

                                    var posX = (StepScale(child.step)) * rect_width + margin_left;
                                    var posY = (getProcessNameIndex(updated_data, childProcess.key) + pIndex) * group_rect_height / 2 + group_rect_height / 2;

                                    return 'translate(' + posX + ',' + posY + ')';
                                })
                                .attr("marker-end", "url(#arrow_" + pIndex + "_" + cIndex + "_" + i + ")")
                                // .style("display", "none")
                                .on("mouseover", function () {
                                    if (arcSelect) {
                                    }
                                    else {
                                        d3.selectAll(".arc")
                                            .classed("visible", false)
                                            .classed("hidden", true);

                                        d3.select('.path_' + pIndex + "_" + cIndex + "_" + i)
                                            .classed("visible", true)
                                            .classed("hidden", false);
                                    }

                                    div3.transition()
                                    // .duration(200)
                                        .style("opacity", 1);

                                    div3.html('Source: ' +
                                        '<text class = "bold">' + parentProcess.key + "</text>" +
                                        "<br/> Operation: " +
                                        '<text class = "bold">' + child.event + "</text>" +
                                        "<br/> Target: " + '' +
                                        '<text class = "bold">' + childProcess.key + "</text>"
                                    )
                                        .style("left", (d3.event.pageX) + 20 + "px")
                                        .style("top", (d3.event.pageY - 30) + "px")
                                        .style("pointer-events", "none")
                                        .style("background-color", () => {
                                                // return colorPicker(child.event).replace("(", "a(").replace(")", ", 0.8)");
                                                return "#dddddd"
                                            }
                                        )
                                })
                                .on("mouseout", function () {
                                    if (arcSelect) {
                                        d3.selectAll(".arc.visible")
                                            .classed("visible", true)
                                            .classed("hidden", false);
                                    }
                                    else {
                                        d3.selectAll(".arc")
                                            .classed("visible", true)
                                            .classed("hidden", false);
                                    }

                                    div3.style("opacity", 0);
                                })

                        })

                    })
                }
                if (parentProcess.selfCalls.length > 0) {
                    parentProcess.selfCalls.forEach((self, i) => {
                        svg_process
                            .append("svg:defs")
                            .selectAll(".arrow")
                            .data([self])
                            .enter()
                            .append("svg:marker")
                            .attr("id", () => {
                                return "arrow_" + pIndex + "_" + pIndex + "_" + i
                            })
                            .attr("class", "arrow")
                            .attr("refX", 4)
                            .attr("refY", 6)
                            .attr("markerWidth", 8)
                            .attr("markerHeight", 8)
                            .style("fill", d => colorPicker(d.event))
                            .attr("orient", -150)
                            .append('path')
                            .attr('d', 'M0,0 L8,0 L4,8 z');

                        svg_process
                            .append('path').attr("class", () => {
                            return 'arc'
                                + ' a' + parentProcess.key.split(".").join("")
                                + ' path_' + pIndex + "_" + pIndex + "_" + i
                                + " o" + self.event.replace(" ", "");
                        })
                            .attr("id", 'path_' + pIndex + "_" + pIndex + "_" + i)
                            .attr("d", d3.arc()
                                .innerRadius(group_rect_height / 2 - 1)
                                .outerRadius(group_rect_height / 2)
                                .startAngle(100 * (Math.PI / 180)) //converting from degs to radians
                                .endAngle(7))
                            .attr("marker-end", "url(#arrow_" + pIndex + "_" + pIndex + "_" + i + ")")
                            .attr('fill', colorPicker(self.event))
                            .attr('source', pIndex)
                            .attr('target', pIndex)
                            .attr('transform', function () {

                                var posX = (StepScale(self.step)) * rect_width + margin_left - 9;
                                var posY = (getProcessNameIndex(updated_data, parentProcess.key) + pIndex) * group_rect_height / 2 + group_rect_height / 2;

                                return 'translate(' + posX + ',' + posY + ')';
                            })
                            .on("mouseover", function () {
                                if (arcSelect) {
                                }
                                else {
                                    d3.selectAll(".arc")
                                        .classed("visible", false)
                                        .classed("hidden", true);

                                    d3.select('.path_' + pIndex + "_" + pIndex + "_" + i)
                                        .classed("visible", true)
                                        .classed("hidden", false);
                                }

                                div3.transition()
                                // .duration(200)
                                    .style("opacity", 1);

                                div3.html('Self-called: ' +
                                    '<text class = "bold">' + parentProcess.key + "</text>" +
                                    "<br/> Operation: " +
                                    '<text class = "bold">' + self.event + "</text>"
                                )
                                    .style("left", (d3.event.pageX) + 20 + "px")
                                    .style("top", (d3.event.pageY - 30) + "px")
                                    .style("pointer-events", "none")
                                    .style("background-color", () => {
                                            // return colorPicker(child.event).replace("(", "a(").replace(")", ", 0.8)");
                                            return "#dddddd"
                                        }
                                    )
                            })
                            .on("mouseout", function () {
                                if (arcSelect) {
                                    d3.selectAll(".arc.visible")
                                        .classed("visible", true)
                                        .classed("hidden", false);
                                }
                                else {
                                    d3.selectAll(".arc")
                                        .classed("visible", true)
                                        .classed("hidden", false);
                                }

                                div3.style("opacity", 0);
                            })


                    })
                }
            });

            function hexToRgb(hex) {
                var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
                return result ? {
                    r: parseInt(result[1], 16),
                    g: parseInt(result[2], 16),
                    b: parseInt(result[3], 16)
                } : null;
            }

            for (var i = 0; i < lines.length; i++) {
                var obj = new Object();
                obj.source = lines[i].source;
                obj.target = lines[i].target;
                obj.value = lines[i].value;
                matrix[lines[i].source][lines[i].target] = obj;
                // dllLines.append('line').attr('stroke-width', ddlLineScale(lines[i].value)).attr('class', 'dllline')
                //     .attr('x1', max_scale+60).attr('source', lines[i].source).attr('target', lines[i].target).attr('y1', lines[i].source * group_rect_height + rect_height / 2)
                //     .attr('x2', window.innerWidth-210).attr('y2', lines[i].target * ((dll_height + padding)) + (dll_height + padding) / 4)
            }
            globalmatrix = matrix;
            globalib = libarr;
            globalgroupbyprocessname = group_by_process_name;

            //drawMatrixOld(matrix, libarr, group_by_process_name);

            // Mag and lensing

            var outlineHeight = dashHeight;

            var lensingGroup = d3.select("#outline")
                .append("g")
                .attr("transform", "translate(40,0)")
                .attr("id", "lensingGroup")
                .on("click", setLensing);

            lensingGroup.append("rect")
                .attr("id", "lensingBtn")
                .attr("class", "textClick")
                .attr("transform", "translate(0," + (outlineHeight - 32) + ")");

            lensingGroup
                .append("text")
                .text("Lensing")
                .classed("unselectable", true)
                .classed("linkText", true)
                .attr("font-size", "14px")
                .attr("transform", "translate(7," + (outlineHeight - 14) + ")")
            ;

            var magContainer = lensingGroup
                .append("g")
                .attr("id", "magContainer")
                .attr("transform", "translate(90," + (outlineHeight - 43) + ")")
                .style("display", "none");

            var magwidth = 200;

            magContainer.append("svg:text").attr("display", "inline-block")
                .append("svg:tspan").attr('x', 0).attr('dy', 28)
                .text("Magnification: ")
                .attr("font-size", "14px")
                .append("svg:tspan").attr("id", "sliderValue").attr('x', 100).attr('dy', 0)
                .text("x" + lensingMultiple)
                // .attr("font-family", "sans-serif")
                .attr("font-size", "14px")
            ;

            var magSlider = magContainer
                .append("g").attr("display", "inline-block")
                .attr("class", "slider")
                .attr("transform", "translate(140, 20)");

            var x = d3.scaleLinear()
                .domain([5, 30])
                .range([0, magwidth])
                .clamp(true);

            magSlider.append("line")
                .attr("class", "track")
                .attr("x1", x.range()[0])
                .attr("x2", x.range()[1])
                .select(function () {
                    return this.parentNode.appendChild(this.cloneNode(true));
                })
                .attr("class", "track-inset")
                .select(function () {
                    return this.parentNode.appendChild(this.cloneNode(true));
                })
                .attr("class", "track-overlay")
                .call(d3.drag()
                    .on("start.interrupt", function () {
                        magSlider.interrupt();
                    })
                    .on("start drag", function () {
                        mag(x.invert(d3.event.x));
                    }));

            magSlider.insert("g", ".track-overlay")
                .attr("class", "ticks")
                .attr("transform", "translate(0," + 17 + ")")
                .selectAll("text")
                .data(x.ticks(6))
                .enter().append("text")
                .attr("x", x)
                .attr("text-anchor", "middle")
                .text(function (d) {
                    return d
                });

            var handle = magSlider.insert("circle", ".track-overlay")
                .attr("class", "handle")
                .attr("r", 7)
                .attr("cx", x(lensingMultiple));      // default = 3

            function mag(h) {
                handle.attr("cx", x(h));
                lensingMultiple = h;
                d3.select("#sliderValue").text(h.toFixed(0));
            }


        },
        malist: function (position) {
            // OPERATION ============================================================

            var opList = getData.getdatabyOperation.map(d => d.key);
            availableCommon = [];
            var malist = ["CreateFile", "CreateFileMapping", "DeviceIoControl", "FileSystemControl", "InternalDeviceIoControl", "RegOpenKey", "System Statistics", "SystemControl", "TCP Accept", "TCP Connect", "TCP Send", "UDP Accept", "UDP Connect", "UDP Send"];
            opList.forEach(o => {
                malist.forEach(m => {
                    if (o === m) {
                        availableCommon.push(o);
                    }
                })
            });
            d3.select(position).selectAll("*").remove();

            var active = {};
            var svg0 = d3.select("#commonOp").append('svg')
                .attr('width', '100%')
                .attr('height', 30 + availableCommon.length * 30);

            var title = svg0.append('g')
                .append("text")
                .style("font-style", "italic")
                .style('font-size', '12px')
            ;

            title
                .append("tspan")
                .text("Reference: ")
                .attr('fill', 'black')
                .attr('y', 10);

            title.append("tspan")
                .text("Infosec Institute.")
                .attr('fill', 'blue')
                .attr("class", "linkText")
                .on("click", function () {
                    window.open("https://resources.infosecinstitute.com/windows-functions-in-malware-analysis-cheat-sheet-part-1/");
                });

            availableCommon.forEach(function (rawOperation, index) {
                var keyOperation = rawOperation.replace(" ", "")
                var ops = svg0.append('g')
                    .attr("id", "cg" + keyOperation)
                    .attr('transform', 'translate(10,' + (30 + index * 28) + ')')
                    .attr("class", "linkText commonAll op1");

                ops.append("rect")
                    .attr("x", 2)
                    .attr("width", "16")
                    .attr("height", "16")
                    .attr("fill", colorPicker(rawOperation));

                ops.append('text').text(rawOperation)
                    .attr('dx', '25px')
                    .attr('y', '13px')
                    .style('color', 'black')
                    .style('font-size', '14px')
                    .classed("linkText", true);

                ops
                    .on("click", function () {
                        var operation = rawOperation.replace(" ", "");
                        if (!active[operation]) {
                            document.getElementById("opSelection").checked = false;
                            document.getElementById("commonSelection").checked = false;
                            d3.select("#heatmap").selectAll('rect[group=detail]')
                                .style('visibility', "hidden");

                            // hide arc
                            d3.selectAll(".arc")
                                .classed("hidden", true);

                            // unselect group
                            svgStats.selectAll("rect")
                                .classed("op0", true)
                                .classed("op1 op2", false)
                                .classed("greyFill", true);

                            d3.selectAll(".commonAll")
                                .classed("op1", false)
                                .classed("greyFill", true);

                            // then, visible selection
                            //show rect
                            d3.select("#heatmap").selectAll('rect.' + operation)
                                .style('visibility', "visible")
                                .raise();

                            //show arc
                            arcSelect = d3.selectAll("[class*=o" + operation + "]");
                            arcSelect
                                .classed("visible", !active[operation])
                                .classed("hidden", !!active[operation])
                                .raise();

                            // show in svgStat
                            d3.select("#ovRect" + operation)
                                .classed("op1", true)
                                .classed("op2", false)
                                .classed("greyFill", false)
                                .classed("op0", !!active[operation]);

                            d3.select(this)
                                .classed("op1", true)
                                .classed("greyFill", false);

                            d3.select("[class*=g" + operation + "]")
                                .classed("op1", true);


                        } else {
                            // back to normal
                            document.getElementById("opSelection").checked = true;
                            d3.select("#heatmap").selectAll('rect[group=detail]')
                                .style('visibility', "visible");

                            // hide arc
                            d3.selectAll(".arc")
                                .classed("visible", true)
                                .classed("hidden", false);

                            // unselect group
                            svgStats.selectAll("rect")
                                .classed("op1", true)
                                .classed("op0 op2", false)
                                .classed("greyFill", false);

                            d3.selectAll(".commonAll")
                                .classed("op1", false)
                            ;

                            d3.select(this)
                                .classed("op1", false);

                            d3.selectAll(".commonAll")
                                .classed("greyFill", false)
                        }

                        active[operation] = !active[operation];
                    })
            });

        },
        highlight: function (position) {

            d3.select(position).selectAll("*").remove();
            // FORCE-DIRECTED GRAPH ==========================================

            var list = globalgroupbyprocessname.map(d => d.key.toLowerCase());
            var len = list.length;
            var nodesb4group = {};
            var links = {};
            var nodes = {};
            var extra = {};
            var secondaryNodes = {};
            var nodeObjTotal = {};

            // var idGenerator = new Int8Array(list.length);
            globalgroupbyprocessname.forEach((process, i) => {
                var keyName = process.key.toLowerCase();
                nodeObjTotal[keyName] = {};
                var nodeObj = nodeObjTotal[keyName];    // use object to hcek multiple occurences, then to compute links
                var secondNodeObj = {};
                nodesb4group[keyName] = [];
                links[keyName] = [];
                secondaryNodes[keyName] = [];

                // first level
                process.values.forEach(ref => {
                    //add node
                    if (ref.Path.length > 0) {   // exist path
                        if (ref.Process === "Registry") {   // registry -------------
                            computeNodes(nodeObj, nodesb4group[keyName], "Registry", ref.Path, i, len);
                        }
                        else if (ref.Process === "Network") {
                            computeNodes(nodeObj, nodesb4group[keyName], "Network", ref.Path, i, len);
                        }
                        else if (ref.Path.toLowerCase().endsWith(".dll")) {
                            computeNodes(nodeObj, nodesb4group[keyName], "dll", ref.Path, i, len);
                        }
                        else if (ref.Path.toLowerCase().endsWith(".exe")) {
                            let linkExe = ref.Path.split(/\\/);
                            let exeName = linkExe[linkExe.length - 1];

                            computeNodes(nodeObj, nodesb4group[keyName], "exe", exeName, i, len);

                            list.forEach(d => {
                                if ((d.toLowerCase() !== keyName) &&  // second != primary
                                    (!secondNodeObj[d]) &&  // havent met
                                    (exeName.toLowerCase() === d.toLowerCase())) {
                                    secondaryNodes[keyName].push(d);
                                    secondNodeObj[d] = true;
                                }
                            })
                        }
                        else {
                            computeNodes(nodeObj, nodesb4group[keyName], "File", ref.Path, i, len);
                        }
                    }
                });

                // draw the node of main process, if it doesnt have self call !!!
                // again, count to the node set, but not node obj (cuz node obj is used for getting links)

                if (!nodeObj[keyName]) {
                    nodesb4group[keyName].push({
                        id: keyName,
                        type: "exe",
                        connect: new Array(len + 1).join("0")
                    })
                }

                // compute links
                d3.keys(nodeObj).forEach(target => {
                    links[keyName].push({
                        source: keyName,
                        target: target,
                        value: nodeObj[target]
                    });
                })
            });

            // half level
            list.forEach(host => {
                if (secondaryNodes[host].length > 0) {
                    secondaryNodes[host].forEach(guest => {
                        d3.keys(nodeObjTotal[host]).forEach(refer => {
                            if (nodeObjTotal[guest][refer]) {
                                // add level
                                let guestPos = getIndex(list, guest);
                                let currentConRef = nodesb4group[host].find(d => d.id === refer).connect;
                                let currentConHost = nodesb4group[host].find(d => d.id === host).connect;
                                // update refer connect
                                nodesb4group[host].find(d => d.id === refer).connect =
                                    currentConRef.slice(0, guestPos) + "1" + currentConRef.slice(guestPos + 1);

                                // update host connect
                                nodesb4group[host].find(d => d.id === host).connect =
                                    currentConHost.slice(0, guestPos) + "1" + currentConHost.slice(guestPos + 1);

                                links[host].push({
                                    source: guest,
                                    target: refer,
                                    value: links[guest].find(d => d.target === refer).value
                                })
                            }
                        })
                    })
                }
            });


            // DONE computing nodes and links
            // sort processes based on number of links
            var dr = 4,      // default point radius
                off = 6,    // cluster hull offset
                lenImg = 15;

            var sortedList = list
                .sort((a, b) => (links[b].length - links[a].length));

            var strokeScaling = d3.scaleSqrt()
                .domain([1, 5000])
                .range([1, 10]);

            var radiusScaling = d3.scaleSqrt()
                .domain([dr, 1200])
                .range([dr, 50]);

            function radiusScale(x) {
                return Math.min(radiusScaling(x), 60)
            }

            function strokeScale(x) {
                return Math.min(strokeScaling(x), 20)
            }

            d3.select("#ranked").selectAll("*").remove();

            // LOOP
            sortedList.forEach((item, index) => {
                nodes[item] = [];
                var height = scaleHeight(links[item].length);
                var wPosition = sideWidth / 2;
                var hPosition = height / 2;
                var groupName = {};

                // define group | main exe dont group
                var grouped = nodesb4group[item].groupBy(['type', 'connect']);
                grouped.forEach((g, i) => {
                    groupName[i + 1] = 0;
                    g.values.forEach(d => {
                        // modify each node HERE
                        groupName[i + 1] += 1;
                        d.group = i + 1;
                        delete d.connect;
                        nodes[item].push(d);
                    });
                });
                // current last group
                var clg = grouped.length;
                nodes[item].forEach(node => {
                    let nodegroupnumber = node.group;
                    if ((list.indexOf(node.id) >= 0) && // exist processes
                        (groupName[node.group] > 1)) {  // share group w/ someone else
                        clg += 1;
                        node.group = clg;
                        //     delete instance in old group
                        grouped[nodegroupnumber - 1].values =
                            grouped[nodegroupnumber - 1].values.filter(d => d.id !== node.id);
                    }
                });
                grouped.forEach((g, i) => {
                    let len = g.values.length;
                    // add imaginary links
                    for (let i = 0; i < len; i++) {
                        let node1 = g.values[i];
                        for (let j = i + 1; j < len;
                             j += Math.min(scaleLimit(len), Math.round(len / 3))) {
                            let node2 = g.values[j];
                            links[item].push({
                                source: node1.id,
                                target: node2.id,
                                value: 1,
                                img: true
                            })
                        }
                    }
                });

                // Var and parameter
                var expand = {}, // expanded clusters
                    data = {},
                    net, simulation,
                    hullg, hull,
                    linkg, link,
                    nodeg, node,
                    pathg, path;
                var curve = d3.line()
                    .curve(d3.curveBasis);

                let svg = d3.select("#ranked")
                    .append("svg")
                    .attr("id", "svg" + item.replace(/[.]/g, ""))
                    .attr("width", "100%")
                    .attr("height", height);

                svg.append("rect")
                    .attr("width", "100%")
                    .attr("height", "100%")
                    .attr("stroke", "grey")
                    .attr("fill", "white")
                ;

                svg.append("text")
                    .text((index + 1) + ". " + item)
                    .attr("x", 15)
                    .attr("y", 23)
                    .style("font-weight", "bold")
                    .append("tspan")
                    .attr("dy", 25)
                    .attr("x", index > 8 ? 35 : 30)
                    .style("font-size", "14px")
                    .text("Self-call(s): " + orderedArray.find(d => d.key === item).selfCalls.length)
                    .style("font-weight", "normal");

                // connect link to node
                extra[item] = [];
                links[item].forEach(link => {
                    var s = link.source = nodes[item].find(d => d.id === link.source),
                        t = link.target = nodes[item].find(d => d.id === link.target);
                    if (t.id === s.id) {
                        var i = {}, j = {}; // intermediate node

                        clg += 1;
                        i["id"] = "dummy1" + t.id;
                        i["dummy"] = true;
                        i["group"] = clg;

                        clg += 1;
                        j["id"] = "dummy2" + t.id;
                        j["dummy"] = true;
                        j["group"] = clg;

                        nodes[item].push(i, j);

                        links[item].push({source: s, target: i, self: 1, value: 1},
                            {source: i, target: j, self: 2, value: 1},
                            {source: j, target: t, self: 1, value: 1});

                        extra[item].push({
                            source: s,
                            dummy1: i,
                            dummy2: j,
                            target: t,
                            value: link.value
                        });
                    }
                });

                data.nodes = nodes[item];
                data.links = links[item];
                data.extra = extra[item];

                let numLinks;
                let content = svg.append("g");
                hullg = content.append("g");
                linkg = content.append("g");
                pathg = content.append("g");
                nodeg = content.append("g");

                var zoom_handler = d3.zoom()
                    .on("zoom", zoom_actions);

                var initfirst = false;
                // zoom_handler(svg); // zoom by scrolling onto svg
                zoom_handler(content); // zoom by scrolling onto elements

                let initX = wPosition, initY = hPosition;
                let removePosX = initX, removePosY = initY;
                var lineGenerator = d3.line()
                    .curve(d3.curveNatural);
                init();
                svg.attr("opacity", 1e-6)
                    .transition()
                    .duration(1000)
                    .attr("opacity", 1);

                function zoom_actions() {
                    content.attr("transform", d3.event.transform)
                }

                function drawCluster(d) {
                    return curve(d.path); // 0.8
                }

                function init() {
                    if (simulation) simulation.stop();
                    net = network(data, net, getGroup, expand);

                    numLinks = net.links.filter(d => !d.img).length;

                    height = scaleHeight(numLinks);
                    hPosition = height / 2;

                    if (!initfirst) {
                        d3.select("#svg" + item.replace(/[.]/g, ""))
                            .attr("height", height);
                        initfirst = true;
                    }
                    else {
                        d3.select("#svg" + item.replace(/[.]/g, ""))
                            .transition()
                            .duration(200)
                            .attr("height", height);
                    }

                    // force
                    simulation = d3.forceSimulation()
                        .force("link", d3.forceLink()
                            .distance(function (l) {
                                let n1 = l.source, n2 = l.target;
                                let defaultValue = 50
                                    + Math.min(20 * Math.min((n1.size || (n1.group != n2.group ? n1.group_data.size : 0)),
                                        (n2.size || (n1.group != n2.group ? n2.group_data.size : 0))),
                                        -30 +
                                        30 * Math.min((n1.link_count || (n1.group != n2.group ? n1.group_data.link_count : 0)),
                                        (n2.link_count || (n1.group != n2.group ? n2.group_data.link_count : 0))),
                                        100);
                                var procValue = 100;
                                // distance between processes
                                if (l.self) {
                                    return lenImg;
                                }
                                else if ((n1.size) && (n2.size)) {
                                    if ((list.indexOf(n1.nodes[0].id) >= 0) && (list.indexOf(n2.nodes[0].id) >= 0)) {
                                        return procValue;
                                    }
                                    else return defaultValue;
                                }
                                else return defaultValue;
                            })
                            .strength(function (l) {
                                let n1 = l.source, n2 = l.target;
                                let defaultValue = 0.9, procValue = 0.4;
                                // distance between processes are loose
                                if (l.self) {
                                    return 1;
                                }
                                else if ((n1.size) && (n2.size)) {
                                    if ((list.indexOf(n1.nodes[0].id) >= 0) && (list.indexOf(n2.nodes[0].id) >= 0)) {
                                        return procValue;
                                    }
                                    else return defaultValue;
                                }
                                else return defaultValue;
                            })
                        )
                        .force("center", d3.forceCenter(wPosition, hPosition))

                        .force("charge", d3.forceManyBody()
                            .strength(d => d.dummy ? -30 : -100)
                        )
                        .force("collide", d3.forceCollide()
                            .radius(10)
                            .strength(0.6)
                        )
                        .velocityDecay(0.5)     // friction
                        .on("tick", ticked)
                    ;
                    simulation.nodes(net.nodes);

                    simulation
                        .force("link")
                        .links(net.links);

                    // ::::::::::::: H U L L ::::::::::::
                    hullg.selectAll("path.hull")
                        .remove();
                    hull = hullg.selectAll("path.hull")
                        .data(convexHulls(net.nodes, getGroup, off))
                        .enter().append("path")
                        .attr("class", "hull")
                        .attr("d", drawCluster)
                        .style("fill", function (d) {
                            return getColor(d.type);
                        })
                        .style("fill-opacity", 0)
                        .on("click", function (d) {
                            console.log("hull click",
                                d, arguments, this, expand[d.group]
                            );
                            // middle of cluster
                            [removePosX, removePosY] =
                                getCentroidFromHull(net.nodes.filter(v => v.group == d.group));

                            expand[d.group] = false;
                            init();
                        })
                        .transition()
                        .duration(200)
                        .style("fill-opacity", 0.3);

                    hull = hullg.selectAll("path.hull");

                    // ::::::::::::: P A T H ::::::::::::
                    path = pathg.selectAll("path.curve").data(net.extra, d => d.pathid);
                    path.exit()
                        .remove();
                    path.enter().append("path")
                        .attr("class", "curve link")
                        .style("stroke-width", function (d) {
                            return d.img ? 0 : strokeScale(d.size);
                        })
                        .attr("fill", "none");

                    path = pathg.selectAll("path.curve");

                    // ::::::::::::: L I N K ::::::::::::
                    link = linkg.selectAll("line.link").data(net.links, linkid);
                    link.exit()
                        .remove();

                    link.enter().append("line")
                        .attr("class", "link")
                        .attr("x1", initX)
                        .attr("y1", initY)
                        .attr("x2", initX)
                        .attr("y2", initY)
                        .style("stroke-width", function (d) {
                            return d.img ? 0 : strokeScale(d.size);
                        });
                    link = linkg.selectAll("line.link");

                    // ::::::::::::: N O D E ::::::::::::
                    node = nodeg.selectAll("circle.node").data(net.nodes, nodeid);

                    node.exit()
                        .transition()
                        .duration(200)
                        .attr("r", 1e-6)
                        .attr("cx", removePosX)
                        .attr("cy", removePosY)
                        .remove();

                    node
                        .transition()
                        .duration(600)
                        .attr("fill", function (d) {
                            return d.size ? getColor(d.nodes[0].type) : getColor(d.type);
                        })
                        .attr("r", function (d) {
                            // bare nodes dont have size
                            return d.size ? radiusScale(d.size + dr) : radiusScale(1 + dr);
                        });

                    node.enter().append("circle")
                    // if (d.size) -- d.size > 0 when d is a group node.
                        .attr("class", function (d) {
                            if (d.size) {
                                if (d.size === 1) {
                                    if (d.nodes[0].id === item) {
                                        return "node main"
                                    }
                                    else return "node leaf";
                                }
                                else return "node"
                            }
                            else {
                                if (d.id === item) {
                                    return "node main"
                                }
                                return "node leaf";
                            }
                        })
                        .attr("r", function (d) {
                            // bare nodes dont have size
                            return d.size ? radiusScale(d.size + dr) : radiusScale(1 + dr);
                        })
                        .attr("fill", function (d) {
                            return d.size ? getColor(d.nodes[0].type) : getColor(d.type);
                        })
                        .attr("cx", initX)
                        .attr("cy", initY)
                        .attr("opacity", 1)
                        .attr("visibility",
                            d => d.dummy ? "hidden" :
                                "visible")
                        .merge(node)
                        .on("click", function (d) {
                            console.log("node click",
                                d, arguments, this, expand[d.group]
                            );
                            let selection = d3.select(this);
                            if (selection.attr("class") === "node") {
                                initX = selection.attr("cx");
                                initY = selection.attr("cy");
                                expand[d.group] = !expand[d.group];
                                init();
                            }
                            else if (d.id) {
                                // middle of cluster
                                [removePosX, removePosY] =
                                    getCentroidFromHull(net.nodes.filter(v => v.group == d.group));
                                expand[d.group] = !expand[d.group];
                                init();
                            }
                        })
                        .on("mouseover", function (d) {
                            console.log(d);
                            if (d.id) {
                                div5.transition()
                                    .style("opacity", 1);

                                div5.html('Node: ' +
                                    '<text class = "bold"> ' + d.id + "</text>" +
                                    "<br/> Type: " +
                                    '<text class = "bold">' + d.type + "</text>"
                                )
                                    .style("left", (d3.event.pageX) + 10 + "px")
                                    .style("top", (d3.event.pageY - 20) + "px")
                                    .style("pointer-events", "none")
                                    .style("color", () => {
                                            return getColor(d.type)
                                        }
                                    )
                            }
                            else if (d.size == 1) {
                                div5.transition()
                                    .style("opacity", 1);

                                div5.html('Node: ' +
                                    '<text class = "bold"> ' + d.nodes[0].id + "</text>" +
                                    "<br/> Type: " +
                                    '<text class = "bold">' + d.nodes[0].type + "</text>"
                                )
                                    .style("left", (d3.event.pageX) + 10 + "px")
                                    .style("top", (d3.event.pageY - 20) + "px")
                                    .style("pointer-events", "none")
                                    .style("color", () => {
                                            return getColor(d.nodes[0].type)
                                        }
                                    )
                            }
                            else {
                                div5.transition()
                                    .style("opacity", 1);

                                div5.html('Type: ' +
                                    '<text class = "bold"> ' + d.nodes[0].type + "</text>" +
                                    "<br/> Size: " +
                                    '<text class = "bold">' + d.size + "</text>"
                                )
                                    .style("left", (d3.event.pageX) + 10 + "px")
                                    .style("top", (d3.event.pageY - 20) + "px")
                                    .style("pointer-events", "none")
                                    .style("color", () => {
                                            return getColor(d.nodes[0].type)
                                        }
                                    )
                            }
                        })

                        .on("mouseout", function () {
                            div5
                                .style("opacity", 0);
                        })
                    ;

                    node = nodeg.selectAll("circle.node");
                    node.call(d3.drag()
                        .on("start", dragstarted)
                        .on("drag", dragged)
                        .on("end", dragended));

                    function dragstarted(d) {
                        if (!d3.event.active) simulation.alphaTarget(0.4).restart();
                        d.fx = d.x;
                        d.fy = d.y;
                    }

                    function dragged(d) {
                        d.fx = d3.event.x;
                        d.fy = d3.event.y;
                    }

                    function dragended(d) {
                        if (!d3.event.active) simulation.alphaTarget(0);
                        d.fx = null;
                        d.fy = null;
                    }

                    // Tick function
                    function ticked() {
                        if (!hull.empty()) {
                            hull.data(convexHulls(net.nodes, getGroup, off))
                                .attr("opacity", 1)
                                .attr("d", drawCluster);
                        }
                        link
                            .attr("x1", function (d) {
                                return d.source.x;
                            })
                            .attr("y1", function (d) {
                                return d.source.y;
                            })
                            .attr("x2", function (d) {
                                return d.target.x;
                            })
                            .attr("y2", function (d) {
                                return d.target.y;
                            });

                        node
                            .attr("cx", function (d) {
                                return d.x;
                            })
                            .attr("cy", function (d) {
                                return d.y;
                            });

                        path.attr("d", d => {
                            return lineGenerator([
                                [d.source.x, d.source.y],
                                [d.dummy1.x, d.dummy1.y],
                                [d.dummy2.x, d.dummy2.y],
                                [d.target.x, d.target.y]
                            ]);
                        });
                    }
                }

            });

        },

        connectedDomain: function () {
            var domainList = getData.getdatabyDomain;

            if (d3.keys(domainList).length === 0) {
                d3.select("#domainBox").style("display", "none");
            }
            else if (d3.keys(domainList).length === 1) {
                d3.select("#domainBox").selectAll("span").remove();
                d3.select("#domainBox").style("display", "block");
                document.getElementById("domainList").style.visibility = "hidden";
                document.getElementById("titleDomain").innerHTML = "Connecting Domain: ";
                let newSpan = document.createElement("span");
                newSpan.textContent = d3.keys(domainList)[0];

                document.getElementById("firstCell").appendChild(newSpan);
                document.getElementById("downArrow").style.display = "none";

            }
            else {
                d3.select("#domainBox").style("display", "block");
                d3.select("#domainBox").selectAll("span").remove();
                var box = document.getElementById("domainList");
                document.getElementById("titleDomain").innerHTML = "Connecting Domains: "
                box.style.visibility = "visible";
                var newcount = 1;
                for (let key in domainList) {
                    let newSpan;

                    if (newcount === 1) {
                        newSpan = document.createElement("span");
                        newSpan.textContent = d3.keys(domainList)[0];

                        document.getElementById("firstCell").appendChild(newSpan);
                        document.getElementById("downArrow").style.display = "block";
                        newcount += 1;
                        continue;
                    }
                    newSpan = document.createElement("span");
                    newSpan.classList.add("w3-bar-item");
                    newSpan.textContent = key;
                    newSpan.style.width = "200px";

                    box.appendChild(newSpan);
                    newcount += 1;
                }
            }


        }

    }

}

var orderedArray;

function getColor(type) {
    return stackColor[categories.indexOf(type)];
}

function setLensing() {
    if (!lensingStatus) {
        document.getElementById("lensingBtn").classList.add('selected');
        d3.select("#magContainer")
            .style("display", "block");
        lensingStatus = !lensingStatus;
        return true;
    } else {
        document.getElementById("lensingBtn").classList.remove('selected');
        d3.select("#magContainer")
            .style("display", "none");
        lensingStatus = !lensingStatus;
        return false;
    }
}

function selectAll() {
    var selectAll = document.getElementById("opSelection").checked;
    firstClick = true;
    if (selectAll) {
        document.getElementById("commonSelection").checked = false;
        // show all rect
        d3.select("#heatmap").selectAll('rect[group=detail]')
            .style("display", "block")
            .style('visibility', "visible");

        // show all arc
        d3.selectAll(".arc")
        // .style("display", "block")
            .classed("hidden", false)
            .classed("visible", true);

        // select all group
        d3.select("#overview").selectAll("rect")
            .classed("op1", true)
            .classed("op0 op2", false);

        // grey
        svgStats.selectAll("rect")
            .classed("greyFill", false);

        d3.selectAll(".commonAll")
            .classed("op1", true)
            .classed("greyFill", false);

        operationShown.forEach(d => {
            active[d] = true;
        })
    }
    else {
        d3.select("#heatmap").selectAll('rect[group=detail]')
            .style('visibility', "hidden");

        // hide all arc
        d3.selectAll(".arc")
            .classed("hidden", true)
            .classed("visible", false);

        // hide all group
        d3.select("#overview").selectAll("rect")
            .classed("op0", true)
            .classed("op1 op2", false);

        d3.selectAll(".commonAll")
            .classed("op1", false)
            .classed("greyFill", true);

        operationShown.forEach(d => {
            active[d] = false;
        })
    }
}

var prevStatus;

function selectCommon() {
    var selectCommon = document.getElementById("commonSelection").checked;
    if (selectCommon) {
        prevStatus = JSON.parse(JSON.stringify(active));
        document.getElementById("opSelection").checked = false;
        // first, hide all
        d3.select("#heatmap").selectAll('rect[group=detail]')
            .style('visibility', "hidden");

        // hide arc
        d3.selectAll(".arc")
            .classed("hidden", true);

        // unselect group
        svgStats.selectAll("rect")
            .classed("op0", true)
            .classed("op1 op2", false)
            .classed("greyFill", true);

        availableCommon.forEach(name => {
            let key = name.replace(" ", "");
            // show group
            d3.select("#ovRect" + key)
                .classed("op1", true)
                .classed("op2", false)
                .classed("greyFill", false)
                .classed("op0", !!active[key]);

            // show arc
            d3.selectAll("[class*=o" + key + "]")
                .classed("visible", true)
                .classed("hidden", false);

            // show rect
            d3.select("#heatmap").selectAll('rect.' + key)
                .style('visibility', active[key] ? "hidden" : "visible");

            active[key] = !active[key];
        })
    }
    else {
        // select All
        document.getElementById("opSelection").checked = true;
        selectAll()
    }
}

function computeNodes(nodeObj, miniNode, type, rawPath, pos, len) {
    let path = rawPath.toLowerCase();
    let connectArray = new Array(len + 1).join("0");
    if (!nodeObj[path]) {
        // if havent existed
        nodeObj[path] = 1;
        miniNode.push({
            id: path,
            type: type,
            connect: connectArray.slice(0, pos) + "1" + connectArray.slice(pos + 1)
        });

    } else {
        nodeObj[path] += 1;
    }
}

function getIndex(list, item) {
    return list.indexOf(item);
}

function nodeid(n) {
    return n.size ? "_g_" + n.group : n.id;
}

function linkid(l) {
    var u = nodeid(l.source),
        v = nodeid(l.target);
    return u < v ? u + "|" + v : v + "|" + u;
}

function getGroup(n) {
    return n.group;
}

function convexHulls(nodes, index, offset) {
    var hulls = {};
    var groupType = {};
    // create point sets
    for (var k = 0; k < nodes.length; ++k) {
        var n = nodes[k];
        if (n.size) continue;
        // if nodes are grouped, continue !!!

        var i = index(n),
            l = hulls[i] || (hulls[i] = []);

        groupType[i] = n.type;

        // each node -> 4 nodes including offset
        l.push([n.x - offset, n.y - offset]);
        l.push([n.x - offset, n.y + offset]);
        l.push([n.x + offset, n.y - offset]);
        l.push([n.x + offset, n.y + offset]);
    }

    // create convex hulls
    var hullset = [];
    for (i in hulls) {
        hullset.push({
            group: i,
            path: d3.polygonHull(hulls[i]),
            type: groupType[i]
        })
    }
    return hullset;
}

function getCentroidFromHull(array) {
    let sumX = 0, sumY = 0;
    let len = array.length;
    array.forEach(d => {
        sumX += d.x;
        sumY += d.y;
    });
    return [sumX / len, sumY / len]
}

// constructs the network to visualize
// var gcen = {};
function network(data, prev, getGroup, expand) {
    expand = expand || {};
    var groupMap = {},    // group map
        nodeMap = {},    // node map
        linkMap = {},    // link map
        prevGroupNode = {},    // previous group nodes
        prevGroupCentroid = {},    // previous group centroids
        nodes = [], // output nodes
        links = [], // output links
        extra = [];

    // process previous nodes for reuse or centroid calculation
    if (prev) {
        prev.nodes.forEach(function (n) {
            let i = getGroup(n), o;
            if (n.size > 0) {
                prevGroupNode[i] = n;
                n.size = 0;
            } else {
                o = prevGroupCentroid[i] || (prevGroupCentroid[i] = {x: 0, y: 0, count: 0});
                o.x += n.x;
                o.y += n.y;
                o.count += 1;
            }
        });
    }
    // determine nodes
    for (var k = 0; k < data.nodes.length; ++k) {
        var n = data.nodes[k],
            i = getGroup(n),    // i is the freaking group
            g = groupMap[i] ||
                (groupMap[i] = prevGroupNode[i]) ||
                (groupMap[i] = {group: i, size: 0, nodes: []});
        if (n.dummy) {
            g.dummy = true;
        }

        if (expand[i]) {
            // the node should be directly visible
            nodeMap[n.id] = nodes.length;
            nodes.push(n);
            if (prevGroupNode[i]) {
                // place new nodes at cluster location (plus jitter)
                n.x = prevGroupNode[i].x + 3 * Math.random();
                n.y = prevGroupNode[i].y + 3 * Math.random();
            }

        } else {
            // the node is part of a collapsed cluster
            if (g.size == 0) {
                // if new cluster, add to set and position at centroid of leaf nodes
                nodeMap[i] = nodes.length;
                nodes.push(g);
                if (prevGroupCentroid[i]) {
                    // gcen.x = prevGroupCentroid[i].x / prevGroupCentroid[i].count;
                    // gcen.y = prevGroupCentroid[i].y / prevGroupCentroid[i].count;
                    g.x = prevGroupCentroid[i].x / prevGroupCentroid[i].count + 3 * Math.random();
                    g.y = prevGroupCentroid[i].y / prevGroupCentroid[i].count + 3 * Math.random();
                }
            }
            g.nodes.push(n);
        }
        // always count group size as w e also use it to tweak the force graph strengths/distances
        g.size += 1;
        n.group_data = g;       // circular data
    }
    for (i in groupMap) {
        groupMap[i].link_count = 0;
    }

    // determine loop
    data.extra.forEach((path, pIndex) => {
        extra.push({
            source: nodes.find(d => {
                return ((d.size == 1) && (d.nodes[0].id === path.source.id))
            }),
            target: nodes.find(d => {
                return ((d.size == 1) && (d.nodes[0].id === path.target.id))
            }),
            dummy1: nodes.find(d => {
                return ((d.size == 1) && (d.nodes[0].id === path.dummy1.id))
            }),
            dummy2: nodes.find(d => {
                return ((d.size == 1) && (d.nodes[0].id === path.dummy2.id))
            }),
            size: path.value,
            pathid: pIndex
        });
    });

    // determine links
    for (k = 0; k < data.links.length; ++k) {
        var e, u, v;        // u, v are group names
        e = data.links[k];
        if (e.source.group) {
            u = getGroup(e.source);
        }
        else continue;
        if (e.target.group) {
            v = getGroup(e.target);
        }
        else continue;
        if (u != v) {
            // link_count is the number of links to that node
            groupMap[u].link_count += e.value;
            groupMap[v].link_count += e.value;
        }

        u = expand[u] ? nodeMap[e.source.id] : nodeMap[u];
        v = expand[v] ? nodeMap[e.target.id] : nodeMap[v];
        var index = (u < v ? u + "|" + v : v + "|" + u),
            l = linkMap[index] || (linkMap[index] = {source: u, target: v, size: 0});

        if ((e.img) || (e.self)) {
            l.img = true;
        }

        if (e.self) {
            l.self = true;
        }
        l.size += e.value;

    }
    for (i in linkMap) {
        // tranh thu tinh maxLink
        if (maxLink < linkMap[i].size) {
            maxLink = linkMap[i].size;
        }

        links.push(linkMap[i]);
    }
    return {
        nodes: nodes,
        links: links,
        extra: extra,
        // gcen: gcen
    };
}