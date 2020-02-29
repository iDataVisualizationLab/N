var global_links;
function libManager(globalData) {
    function getIndexByName(inputData, name) {
        var index;
        for (var i = 0; i < inputData.length; i++) {
            if (inputData[i].name == name) {
                index = i;
                break;
            }
        }
        return index;
    }

    function sortArrayByName (inputData) {
        return inputData.sort(function (a, b) {
            return d3.ascending(a.name, b.name)
        })
    }

    function sortArrayByValue (inputData, property) {
        return inputData.sort(function (a, b) {
            return b[property] - a[property];
        })
    }

    function sortArrayBySimilarity (source, target, inputData) {

        d3.select("#matrix2D").selectAll("*").remove();
        var processes1 = [];
        var processes2 = [];
        var processes3 = [];
        for (var i = 0; i < globalgroupbyprocessname.length; i++) {
            var obj = {};
            var obj2 = {};
            var obj3 = {};
            obj.name = globalgroupbyprocessname[i].key;
            obj.index = i;
            obj2.index = i;
            obj3.index = i;
            obj.refs = globalmatrix[i];
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
            if (globalmatrix[i][j].value != 0) {
                return globalmatrix[i][j].value.length;
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

            var startIndex = firstProcessIndex;
            var count = 1;
            while (count < processArray.length) {
                var minDif = 100000000;
                var minIndex = -1;
                for (var i = 0; i < processArray.length; i++) {
                    if (processArray[i].isUsed == undefined) { // process is not ordered
                        // compute processes difference
                        var dif = 0;
                        for (var j = 0; j < globalib.length; j++) {
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

        var libs = [];
        var libs2 = [];
        for (var l = 0; l < globalib.length; l++) {
            var obj = {};
            var obj2 = {};
            obj.name = globalib[l];
            obj.index = l;
            obj2.index = l;
            var sumRefs = 0;
            for (var i = 0; i < processes1.length; i++) {
                if (globalmatrix[i][l].value != 0) {
                    sumRefs += globalmatrix[i][l].value.length;
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

    }

    function sortArrayByLinkSize (inputData) {
        return inputData.sort(function (a, b) {
            return b.links.length - a.links.length;
        })
    }

    function sortArrayByCountSize (inputData) {
        return inputData.sort(function (a, b) {
            var first_value = d3.max(a.links, function (d) {
                return d.values.length;
            });
            var second_value = d3.max(b.links, function (d) {
                return d.values.length;
            });
            return second_value - first_value;
        })
    }

    function create2DMatrix (rows, cols, links) {
        //Initialize 2D matrix with size rows x columns
        var matrix = new Array(rows);
        for (var i = 0; i < rows; i++) {
            matrix[i] = new Array(cols);
            //  matrix[i].fill(new Array(0));
        }
        links.forEach(function (link) {
            matrix[link.source][link.target] = link.value;
        });
        return matrix;
    }

    function drawMatrix (rowLabel, colLabel, inputData, position) {
        d3.select(position).selectAll("*").remove();
        var margintop = 10;
        var ColorScale = d3.scaleLinear()
            .domain([0, Math.sqrt(250)])
            .range([0, 1]);
        var svg_height = rowLabel.length * (settings.MatrixArea.rect_height + settings.MatrixArea.padding) + 360;
        var svg_width = colLabel.length * (settings.MatrixArea.rect_width + settings.MatrixArea.padding) + settings.MatrixArea.row_text_width + 20;
        var svgMatrix = d3.select(position)
            .append('svg')
            .attr('height', svg_height)
            .attr('width', svg_width);
        var svg_g = svgMatrix.append('g').attr('transform', 'translate(0,10)');

        //Draw x labels
        var textGroup = svg_g.append('g').attr('transform', 'translate(' + (settings.MatrixArea.row_text_width + 10) + ',' + (rowLabel.length * (settings.MatrixArea.rect_height + settings.MatrixArea.padding) + 5) + ')')
        var cols = textGroup.selectAll('text').data(colLabel)
            .enter()
            .append('text')
            .attr('x', function (d, i) {
                return (i) * (settings.MatrixArea.rect_width + settings.MatrixArea.padding);
            })
            .text(function (d) {
                return d.name;
            })
            .attr("class", function (d, i) {
                return "colLabel mono c" + i;
            })
            .attr('transform', function (d, i) {
                return 'rotate(90 ' + i * (settings.MatrixArea.rect_width + settings.MatrixArea.padding) + ',0)';
            });

        //Draw y labels

        var rows = svg_g.append('g');
        var horitext = rows.selectAll('text')
            .data(rowLabel).enter().append('text')
            .text(function (d) {
                return d.name + " (" + d.links.length + ")";
            })
            .attr("class", function (d, i) {
                return "rowLabel mono r" + i;
            })
            .attr('x', settings.MatrixArea.row_text_width)
            .attr('y', function (d, i) {
                return i * (settings.MatrixArea.rect_height + settings.MatrixArea.padding) + settings.MatrixArea.rect_height / 2;
            }).attr('text-anchor', 'end');

        //Draw matrix
        inputData.forEach(function (row, index) {
            var group = svg_g.append('g') //draw container for cells
                .attr('class', 'row')
                .attr('height', settings.MatrixArea.rect_height + settings.MatrixArea.padding)
                .attr('transform', 'translate(' + (settings.MatrixArea.row_text_width + 10) + ',' + (index * (settings.MatrixArea.rect_height + settings.MatrixArea.padding)) + ')')
            //Draw cells

            var ttMatrix = d3.select("#ttMatrix");

            var cells = group.selectAll('rect')
                .data(row)
                .enter()
                .append('rect')
                .attr("class", 'mat_rect')
                .attr('width', settings.MatrixArea.rect_width)
                .attr('height', settings.MatrixArea.rect_height)
                .attr('x', function (d, i) {
                    return i * (settings.MatrixArea.rect_width + settings.MatrixArea.padding);
                })
                .attr('fill', function (d) {
                    if (d == undefined) return 'white';
                    else return d3.interpolateGreys(ColorScale(Math.sqrt(d.length)))
                    // return d.length==0 ? 'white' : d3.interpolateGreys(ColorScale(Math.sqrt(d.length)));
                }).on('mouseenter', function (d, i) {
                    if (d == undefined) return;
                    d3.selectAll('text.rowLabel').attr('opacity', 0.2);
                    d3.selectAll('text.colLabel').attr('opacity', 0.2);
                    d3.select('text.r' + index).attr('opacity', 1);
                    d3.select('text.c' + i).attr('opacity', 1);

                    ttMatrix.transition()
                        .duration(200)
                        .style("visibility", "visible");
                    var text = "";
                    d.forEach(function (value) {
                        text += "Time: " + value.Timestamp + "&nbsp; Lib: " + value.library + "<br>"
                    });

                    ttMatrix.html("<b>Number of calls: " + d.length + "</b><p>" + text)
                        .style("width", "300px")
                        .style("left", (d3.event.pageX) + 20 + "px")
                        .style("top", (d3.event.pageY) + "px");
                })
                .on('mouseleave', function () {
                    d3.selectAll('text.rowLabel').attr('opacity', 1);
                    d3.selectAll('text.colLabel').attr('opacity', 1);
                    ttMatrix.transition()
                        .duration(200)
                        .style("visibility", "hidden");
                });
        })
    }

    function createNodesFromLinks (links) {
        var nodes = {sources: [], targets: []};
        links.forEach(function (link) {
            var sourceFlag = false, targetFlag = false;
            nodes.sources.forEach(function (source) {
                if (source.name == link.source) {
                    sourceFlag = true; //Found
                    source.links.push({target: link.target, values: link.value})
                }

            });
            nodes.targets.forEach(function (target) {
                if (target.name == link.target) {
                    targetFlag = true;
                    target.links.push({target: link.source, values: link.value});
                }

            })


            if (!sourceFlag) {
                var obj = {};
                obj.name = link.source;
                obj.links = [];
                obj.links.push({target: link.target, values: link.value})
                obj.default = nodes.sources.length;
                nodes.sources.push(obj);
            }
            if (!targetFlag) {
                var obj = {};
                obj.name = link.target;
                obj.links = [];
                obj.links.push({target: link.source, values: link.value})
                obj.default = nodes.targets.length;
                nodes.targets.push(obj);
            }
        });
        return nodes;
    }

    function loadMatrix (input_links) {

        var ColorScale = d3.scaleLinear()
            .domain([0, Math.sqrt(250)])
            .range([0, 1]);


        var local_links = JSON.parse(JSON.stringify(input_links));
        var nodes = createNodesFromLinks(local_links);
        local_links.forEach(function (link) {
            link.source = getIndexByName(nodes.sources, link.source);
            link.target = getIndexByName(nodes.targets, link.target);
        });

        // var matrix = create2DMatrix(nodes.sources.length, nodes.targets.length, local_links);
        var margin = {
            top: 400,
            right: 0,
            bottom: 0,
            left: 250
        };

        var height = 250;
        var width = sideWidth - 100;
        var matrix = [];
        var x_length = nodes.targets.length;
        var y_length = nodes.sources.length;
        var x_scale = d3.scaleBand().range([0, width - margin.left]).domain(d3.range(x_length));
        var y_scale = d3.scaleBand().range([0, height]).domain(d3.range(y_length));

        var svg = d3.select("#matrix2D").append("svg")
        // .attr("width", width + margin.left + margin.right)
            .attr("width", "100%")
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");


        nodes.targets.forEach(function (node) {
            node.linkDiff = node.links.length;
            node.linkSize = d3.max(node.links, function (d) {
                return d.values.length;
            })
        });
        nodes.sources.forEach(function (node, i) {
            node.linkDiff = node.links.length;
            node.linkSize = d3.max(node.links, function (d) {
                return d.values.length;
            })
            matrix[i] = d3.range(x_length).map(function (j) {
                return {x: j, y: i, z: []};
            });
        });


        local_links.forEach(function (link) {
            matrix[link.source][link.target].z = link.value;
        });


        //Tommy's code
        var processes1 = [];
        var processes2 = [];
        var processes3 = [];
        for (var i = 0; i < y_length; i++) {
            var obj = {};
            var obj2 = {};
            var obj3 = {};
            obj.name = nodes.sources[i].name;
            obj.index = i;
            obj2.index = i;
            obj3.index = i;
            obj.refs = matrix[i];
            var sumRefs = 0;
            var sumLibs = 0;
            for (var j = 0; j < obj.refs.length; j++) {
                if (obj.refs[j].z.length != 0) {
                    sumRefs += obj.refs[j].z.length;
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
                return matrix[i][j].z.length;
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
                        for (var j = 0; j < nodes.targets.length; j++) {
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
                    // console.log(minIndex + " " + processArray[minIndex].name);
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
        for (var l = 0; l < nodes.targets.length; l++) {
            var obj = {};
            var obj2 = {};
            obj.name = nodes.targets[l];
            obj.index = l;
            obj2.index = l;
            var sumRefs = 0;
            for (var i = 0; i < processes1.length; i++) {
                if (matrix[i][l].value != 0) {
                    sumRefs += matrix[i][l].z.length;
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

        nodes.sources.forEach(function (node, i) {
            node.similarity = processes1[i].indexSimilarity;
        });
        nodes.targets.forEach(function (node, i) {
            node.similarity = libs[i].indexSimilarity;
        });

        var orders = {
            process: d3.range(y_length).sort(function (a, b) {
                return d3.ascending(nodes.sources[a].name, nodes.sources[b].name);
            }),
            library: d3.range(x_length).sort(function (a, b) {
                return d3.ascending(nodes.targets[a].name, nodes.targets[b].name);
            }),
            y_count: d3.range(y_length).sort(function (a, b) {
                return d3.descending(nodes.sources[a].linkSize, nodes.sources[b].linkSize);
            }),
            x_count: d3.range(x_length).sort(function (a, b) {
                return d3.descending(nodes.targets[a].linkSize, nodes.targets[b].linkSize);
            }),
            y_diff: d3.range(y_length).sort(function (a, b) {
                return d3.descending(nodes.sources[a].linkDiff, nodes.sources[b].linkDiff);
            }),
            x_diff: d3.range(x_length).sort(function (a, b) {
                return d3.descending(nodes.targets[a].linkDiff, nodes.targets[b].linkDiff);
            }),
            y_similarity: d3.range(y_length).sort(function (a, b) {
                return d3.descending(nodes.sources[a].similarity, nodes.sources[b].similarity);
            }),
            x_similarity: d3.range(x_length).sort(function (a, b) {
                return d3.descending(nodes.targets[a].similarity, nodes.targets[b].similarity);
            })
        };

        x_scale.domain(orders.x_similarity);
        y_scale.domain(orders.y_similarity);
        var rows = svg.selectAll(".row")
            .data(matrix)
            .enter().append("g")
            .attr("class", "row")
            .attr("transform", function (d, i) {
                return "translate(0," + y_scale(i) + ")";
            })
            .each(row);
        // rows.append("line")
        //     .attr("x2", width);
        rows.append("text")
            .attr("class", "penguin")
            .attr("x", -6)
            .attr("y", y_scale.bandwidth() / 2)
            .attr("dy", ".32em")
            .attr("text-anchor", "end")
            .text(function (d, i) {
                return capitalize_Words(nodes.sources[i].name);
            });
        var column = svg.selectAll(".column")
            .data(matrix[0])
            .enter().append("g")
            .attr("class", "column")
            .attr("transform", function (d, i) {
                return "translate(" + x_scale(i) + ")rotate(-90)";
            });
        // column.append("line")
        //     .attr("x1", -width);
        column.append("text")
            .attr("x", 6)
            .attr("y", x_scale.bandwidth() / 2)
            .attr("dy", ".32em")
            .attr("text-anchor", "start")
            .text(function (d, i) {
                return capitalize_Words(nodes.targets[i].name);
            });
        //drawMatrix(nodes.sources, nodes.targets, matrix, '#matrix2D');
        d3.select("#order").on("change", function () {
            clearTimeout(timeout);
            order(this.value);
        });
        var timeout = setTimeout(function () {
            order("group");
            d3.select("#order").property("selectedIndex", 0).node();
        }, 2000);

        function order(value) {
            if (value == "name") {
                x_scale.domain(orders["library"]);
                y_scale.domain(orders["process"]);
            } else if (value == "frequency") {
                x_scale.domain(orders["x_count"]);
                y_scale.domain(orders["y_count"]);
            }
            else if (value == "linkDiff") {
                x_scale.domain(orders["x_diff"]);
                y_scale.domain(orders["y_diff"]);
            }
            else if (value == "similarity") {
                x_scale.domain(orders["x_similarity"]);
                y_scale.domain(orders["y_similarity"]);
            }


            // y_scale.domain(nodes.sources.sort(function (a, b) { return a.name -b.name }));
            var t = svg.transition().duration(2500);

            t.selectAll(".row")
                .delay(function (d, i) {
                    return y_scale(i) * 4;
                })
                .attr("transform", function (d, i) {
                    return "translate(0," + y_scale(i) + ")";
                })
                .selectAll(".cell")
                .delay(function (d) {
                    return x_scale(d.x) * 4;
                })
                .attr("x", function (d) {
                    return x_scale(d.x);
                });


            t.selectAll(".column")
                .delay(function (d, i) {
                    return x_scale(i) * 4;
                })
                .attr("transform", function (d, i) {
                    return "translate(" + x_scale(i) + ")rotate(-90)";
                });
        }

        function row(row) {
            var cell = d3.select(this).selectAll(".cell")
                .data(row.filter(function (d) {
                    return d.z;
                }))
                .enter().append("rect")
                .attr("class", "cell")
                .attr("x", function (d) {
                    return x_scale(d.x);
                })
                .attr("width", x_scale.bandwidth())
                .attr("height", y_scale.bandwidth())
                //.style("fill-opacity", function(d) { return z(d.z); })
                .style("fill", function (d) {
                    if (d == undefined) return 'white';
                    else return d3.interpolateGreys(ColorScale(Math.sqrt(d.z.length)))
                })
                .on("mouseover", mouseover)
                .on("mouseout", mouseout);
        }

        function capitalize_Words(str) {
            return str.replace(/\w\S*/g, function (txt) {
                return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
            });
        }

        function mouseover(p) {
            d3.selectAll(".row text").classed("active", function (d, i) {
                return i == p.y;
            });
            d3.selectAll(".column text").classed("active", function (d, i) {
                return i == p.x;
            });
            div4.transition().duration(200).style("opacity", .9);
            var text = "";
            p.z.forEach(function (value) {
                text += "Time: " + value.Timestamp + "&nbsp; Lib: " + value.library + "<br>"
            });
            div4.html("<b>Number of calls: " + p.z.length + "</b><p>" + text)
                .style("width", "300px")
                .style("left", (d3.event.pageX) + 20 + "px")
                .style("top", (d3.event.pageY) + "px");
        }

        function mouseout() {
            d3.selectAll("text").classed("active", false);
            div4.transition()
                .duration(200)
                .style("opacity", 0);
        }
    }

    function ExtractGraph(globalData) {
        var graphs = {
            links: [],
            sources: [],
            targets: []
        };
        //Update links
        globalData.forEach(function (object) {
            if (object.hasOwnProperty('library')) {
                //Check if source and target are in nodes
                var flag = false;
                graphs.links.forEach(function (link) {
                    if (link.source == object.Process_Name.toUpperCase() && link.target == object.library.toUpperCase()) {
                        flag = true;
                        //Update existing link
                        link.value.push(object);
                    }
                });
                if (!flag) {
                    var obj = new Object();
                    obj.source = object.Process_Name.toUpperCase();
                    obj.target = object.library.toUpperCase();
                    obj.value = [];
                    obj.value.push(object)
                    graphs.links.push(obj);
                }
            }
        });

        //Update node
        graphs.links.forEach(function (link) {
            var sourceFlag = false, targetFlag = false;
            graphs.sources.forEach(function (source) {
                if (source.name == link.source) {
                    sourceFlag = true; //Found
                    source.links.push(link.target)
                }

            });
            graphs.targets.forEach(function (target) {
                if (target.name == link.target) {
                    targetFlag = true;
                    target.links.push(link.source);
                }

            })

            if (!sourceFlag) {
                var obj = {};
                obj.name = link.source;
                obj.links = [];
                obj.links.push(link.target)
                obj.default = graphs.sources.length;
                graphs.sources.push(obj);
            }
            if (!targetFlag) {
                var obj = {};
                obj.name = link.target;
                obj.links = [];
                obj.links.push(link.source)
                obj.default = graphs.targets.length;
                graphs.targets.push(obj);
            }
        })
        return graphs;
    }

    return {
        draw2DMatrix: function (position) {
            var graphs = ExtractGraph(globalData);
            graphs.links = graphs.links.filter(function (link) {
                return link.value.length > settings.MatrixArea.minValue;
            });
            graphs.indexLinks = [];
            var rect_width = (settings.MatrixArea.matrix_width - settings.MatrixArea.padding * (graphs.targets.length - 1)) / graphs.targets.length;
            var svgMatrix = d3.select(position).append('svg').attr('height', settings.MatrixArea.svg_height).attr('width', settings.MatrixArea.svg_width).attr('margin-top', "15px");
            var matrix = make2Darray(graphs.sources.length, graphs.targets.length);

        },
        sort2DMatrix: function (type) {
            var nodes = createNodesFromLinks(global_links);
            var sourcename = JSON.parse(JSON.stringify(nodes.sources));
            var targetname = JSON.parse(JSON.stringify(nodes.targets));
            var local_links = JSON.parse(JSON.stringify(global_links));
            switch (type) {
                case "name":
                    sourcename = sortArrayByName(sourcename);
                    targetname = sortArrayByName(targetname);
                    break;
                case "numlinks":
                    sourcename = sortArrayByLinkSize(sourcename);
                    targetname = sortArrayByLinkSize(targetname);
                    break;
                case "numcount":
                    sourcename = sortArrayByCountSize(sourcename);
                    targetname = sortArrayByCountSize(targetname);
                    break;
                case "similarity":
                    sortArrayBySimilarity(sourcename, targetname, local_links);
                    break;
                default:
                    break;
            }
            //convert link by name to link by id
            local_links.forEach(function (link) {
                link.source = getIndexByName(sourcename, link.source);
                link.target = getIndexByName(targetname, link.target);
            });
            var matrix = create2DMatrix(sourcename.length, targetname.length, local_links);
            drawMatrix(sourcename, targetname, matrix, '#matrix2D')

        },
        getCallRange: function () {
            var graphs = ExtractGraph(globalData);//Extract Graph to get all data.
            var min = d3.min(graphs.links, function (d) {
                return d.value.length;
            });
            var max = d3.max(graphs.links, function (d) {
                return d.value.length;
            });
            return {mincall: min, maxcall: max}
        },
        updateRangeFilter: function (min, max) {
            global_links = ExtractGraph(globalData).links.filter(function (link) {
                return link.value.length > min;
            });
            d3.select("#matrix2D").selectAll("*").remove();
            loadMatrix(global_links);

        },
    }
}
