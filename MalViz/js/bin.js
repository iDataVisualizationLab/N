function getObjectIndex(obj, property, value) {
    var index;
    obj.forEach(function (d, i) {
        if (d[property] == value) index = i;
    });
    return index;
}

function convertToMilis(row) {
    var time = row.Timestamp.split(':');
    var hour = +time[0];
    var minute = +time[1];
    var second = +time[2].split('.')[0];
    var milisecond = +time[2].split('.')[1].split(' ')[0].slice(0, 5);
    var currentTimeStamp = (hour * 3600 + minute * 60 + second) * 100000 + milisecond;
    return currentTimeStamp;
}


function handleOperation(malist) {
    var array = [];
    malist.forEach(d => {
        array.push(d.Name);
    });
    return array;
}

function drawMatrixOld(matrix, lib, group_by_process_name) {
    var rect_width = 12,
        rect_height = 11,
        spacing = 2,
        svgheight = (rect_height + spacing) * matrix.length;
    var maxvalue = d3.max(matrix, function (d) {
        return d3.max(d, function (e) {
            return e.value.length;
        });
    });

    // Tommy 2018 ******************************************
    // Create a new array of process
    var processes1 = [];
    var processes2 = [];
    var processes3 = [];
    for (var i = 0; i < group_by_process_name.length; i++) {
        var obj = {};
        var obj2 = {};
        var obj3 = {};
        obj.name = group_by_process_name[i].key;
        obj.index = i;
        obj2.index = i;
        obj3.index = i;
        obj.refs = matrix[i];
        var sumRefs = 0;
        var sumLibs = 0;
        for (var j = 0; j < obj.refs.length; j++) {
            if (obj.refs[j].value != 0) {
                sumRefs += obj.refs[j].value.length;
                sumLibs++;
            }
        }
        obj.sumRefs = sumRefs;
        obj.sumLibs = sumLibs;
        obj2.sumRefs = sumRefs;
        obj3.sumLibs = sumLibs;
        processes1.push(obj);
        processes2.push(obj2);
        processes3.push(obj3);
    }

    // Order processes2 by the total of references
    processes2.sort(function (a, b) {
        if (a.sumRefs < b.sumRefs) {
            return 1;
        }
        else
            return -1;
    });
    // Order processes3 by the total of libs
    processes3.sort(function (a, b) {
        if (a.sumLibs < b.sumLibs) {
            return 1;
        }
        else
            return -1;
    });


    // Copy the order from processes2 to processes
    for (var i = 0; i < processes2.length; i++) {
        var index = processes2[i].index;
        processes1[index].indexSumRefs = i;
    }
    // Copy the order from processes3 to processes
    for (var i = 0; i < processes3.length; i++) {
        var index = processes3[i].index;
        processes1[index].indexSumLibs = i;
    }


    function getRefCount(i, j) {
        if (matrix[i][j].value != 0) {
            return matrix[i][j].value.length;
        }
        else {
            return 0;
        }

    }

    function getDif(count1, count2) { // penalty function
        if (count1 == 0 && count2 != 0)
            return 1000;
        else if (count1 != 0 && count2 == 0)
            return 1000;
        else
            return Math.abs(count1 - count2);
    }

    function processDif(processArray, firstProcessIndex) {
        processArray[firstProcessIndex].isUsed = true;
        processArray[firstProcessIndex].indexSimilarity = 0;

        var startIndex = firstProcessIndex
        var count = 1;
        while (count < processArray.length) {
            var minDif = 100000000;
            var minIndex = -1;
            for (var i = 0; i < processArray.length; i++) {
                if (processArray[i].isUsed == undefined) { // process is not ordered
                    // compute processes difference
                    var dif = 0;
                    for (var j = 0; j < lib.length; j++) {
                        var count1 = getRefCount(startIndex, j);
                        var count2 = getRefCount(i, j);
                        dif += getDif(count1, count2); // Differential function *************
                    }
                    if (dif < minDif) {
                        minDif = dif;
                        minIndex = i;
                    }
                }
            }
            if (minIndex >= 0) {
                processArray[minIndex].isUsed = true;
                processArray[minIndex].indexSimilarity = count;
                startIndex = minIndex;
            }
            count++;
        }
        return processArray;
    }

    function processLib(libArray, firstLibIndex) {
        libArray[firstLibIndex].isUsed = true;
        libArray[firstLibIndex].indexSimilarity = 0;

        var startIndex = firstLibIndex
        var count = 1;
        while (count < libArray.length) {
            var minDif = 100000000;
            var minIndex = -1;
            for (var l = 0; l < libArray.length; l++) {
                if (libArray[l].isUsed == undefined) { // process is not ordered
                    // compute libs difference
                    var dif = 0;
                    for (var i = 0; i < processes1.length; i++) {
                        var count1 = getRefCount(i, startIndex);
                        var count2 = getRefCount(i, l);
                        dif += getDif(count1, count2); // Differential function *************
                    }
                    if (dif < minDif) {
                        minDif = dif;
                        minIndex = l;
                    }
                }
            }
            if (minIndex >= 0) {
                libArray[minIndex].isUsed = true;
                libArray[minIndex].indexSimilarity = count;
                startIndex = minIndex;
            }
            count++;
        }
        return libArray;
    }


    // Create a new array of libs
    var libs = [];
    var libs2 = [];
    for (var l = 0; l < lib.length; l++) {
        var obj = {};
        var obj2 = {};
        obj.name = lib[l];
        obj.index = l;
        obj2.index = l;
        var sumRefs = 0;
        for (var i = 0; i < processes1.length; i++) {
            if (matrix[i][l].value != 0) {
                sumRefs += matrix[i][l].value.length;
            }
        }
        obj.sumRefs = sumRefs;
        obj2.sumRefs = sumRefs;
        libs.push(obj);
        libs2.push(obj2);
    }
    // Order libs2 by the total of references
    libs2.sort(function (a, b) {
        if (a.sumRefs < b.sumRefs) {
            return 1;
        }
        else
            return -1;
    });
    // Copy the order from libs2 to processes
    for (var i = 0; i < libs2.length; i++) {
        var index = libs2[i].index;
        libs[index].indexSumRefs = i;
    }
    //var processes1 = processDif(processes1,processes3[0].index);
    processes1 = processDif(processes1, 0);
    libs = processLib(libs, 0);

    // Order options
    var orderOption = 2;

    function getProcessIndex(index) {  // order of process in row of the matrix
        var newIndex;
        if (orderOption == 0) {// default order of processes
            newIndex = index;
        }
        else if (orderOption == 1) {// order by the total lib references
            newIndex = processes1[index].indexSumRefs;
        }
        else {
            newIndex = processes1[index].indexSimilarity;
        }
        return newIndex;
    }

    function getLibIndex(index) {  // order of process in column of the matrix
        var newIndex;
        if (orderOption == 0) {// default order of processes
            newIndex = index;
        }
        else if (orderOption == 1) {// order by the total lib references
            newIndex = libs[index].indexSumRefs;
        }
        else {
            newIndex = libs[index].indexSimilarity;
        }
        return newIndex;
    }

    var ColorScale = d3.scaleLinear()
        .domain([0, Math.sqrt(maxvalue)])
        .range([0, 1]);
    var svgMatrix = d3.select('#matrix').append('svg').attr('height', svgheight + 300).attr('width', "100%").attr('margin-top', "15px");
    matrix.forEach(function (row, index) {

        var group = svgMatrix.append('g')
            .attr('height', 12).attr('transform', 'translate(200,' + getProcessIndex(index) * (rect_height + spacing) + ')')
        var rect = group.selectAll('rect')
            .data(row)
            .enter()
            .append('rect')
            .attr("class", 'mat_rect')
            .attr('width', rect_width)
            .attr('height', rect_height)
            .attr('x', function (d, i) {
                return getLibIndex(i) * (rect_height + spacing);
            })
            .attr('fill', function (d) {
                return d.value == 0 ? 'white' : d3.interpolateOrRd(ColorScale(Math.sqrt(d.value.length)));
            }).on('mouseenter', function (d, i) {
                if (d.source == undefined) return;
                // d3.selectAll('.mat_rect').classed('cell-hover',false);
                d3.select(this).classed("cell-hover", true);

                for (var r = 0; r < processes1.length; r++) {
                    if (r == index)
                        d3.selectAll(".rowLabel.mono.r" + r).style("opacity", 1);
                    else
                        d3.selectAll(".rowLabel.mono.r" + r).style("opacity", 0.2);
                    //  d3.selectAll(".colLabel.mono.c"+i).style("opacity", 1);;
                }
                for (var c = 0; c < libs.length; c++) {
                    if (c == i)
                        d3.selectAll(".colLabel.mono.c" + c).style("opacity", 1);
                    else
                        d3.selectAll(".colLabel.mono.c" + c).style("opacity", 0.2);
                }


                div.transition()
                // .duration(200)
                    .style("opacity", 1);
                var text = "";
                d.value.forEach(function (value) {
                    text += "Time: " + value.Timestamp + "&nbsp; Lib: " + value.library + "<br>"
                })
                div.html("<b>Number of calls: " + d.value.length + "</b><p>" + text)
                    .style("width", "300px")
                    .style("left", (d3.event.pageX) + 20 + "px")
                    .style("top", (d3.event.pageY) + "px");

            })
            .on('mouseleave', function (d, i) {
                d3.select(this).classed("cell-hover", false);
                for (var r = 0; r < processes1.length; r++) {
                    d3.selectAll(".rowLabel.mono.r" + r).style("opacity", 1);
                }
                for (var c = 0; c < libs.length; c++) {
                    d3.selectAll(".colLabel.mono.c" + c).style("opacity", 1);
                }
            });

    })
    //Draw text
    var textGroup = svgMatrix.append('g').attr('transform', 'translate(200,' + matrix.length * (rect_height + spacing) + ')')
    var text = textGroup.selectAll('text').data(lib).enter().append('text').attr('x', function (d, i) {
        return (i) * (rect_height + spacing);
    }).text(function (d) {
        return d;
    }).attr("class", function (d, i) {
        return "colLabel mono c" + i;
    })
        .attr('transform', function (d, i) {
            return 'rotate(45 ' + i * (rect_height + spacing) + ',0)';
        })

    var horizontalText = svgMatrix.append('g').attr('width', 200);
    var horitext = horizontalText.selectAll('text')
        .data(group_by_process_name).enter().append('text').text(function (d) {
            return d.key;
        })
        .attr("class", function (d, i) {
            return "rowLabel mono r" + i;
        })
        .attr('x', 190)
        .attr('y', function (d, i) {
            return getProcessIndex(i) * (rect_height + spacing) + rect_height / 2;
        }).attr('text-anchor', 'end');
}

function adjustHeight(nodes, item, expand, height) {
    let existHull = false;
    let selection = d3.select("#svg" + item.replace(/[.]/g, ""));
    let prevHeight = selection.attr("height");

    console.log(nodes[item].length);

    var expandHeight = scaleHeightAfter(nodes[item].length);
    d3.keys(expand).some(d => {
        if (expand[d]) {
            existHull = true;
        }
        return expand[d];
    });
    if (!existHull) {
        selection
            .transition()
            .duration(200)
            .attr("height", height);
        return true;
    }
    else if (prevHeight == height) {
        selection
            .transition()
            .duration(200)
            .attr("height", expandHeight);
        return true;
    }
    else return false;
}

// get sum of distance of arcs
function calculateDistance(orderedArray) {
    var sum = 0;
    orderedArray.forEach((parentProcess, pIndex) => {
        d3.keys(parentProcess.childInfo).forEach(childProcess => {
            sum += parentProcess.childInfo[childProcess].length * Math.abs(getProcessNameIndex(orderedArray, childProcess) - pIndex)
        })
    });
    return sum;
}

if (d.dummy){
    return 100
}
else if ((d.size === 1) && (d.nodes[0].type === "exe")){
    return 100
}
else return -200;