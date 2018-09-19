'use strict';

angular.module('voyager2')
// TODO: rename to Query once it's complete independent from Polestar
    .factory('PCAplot', function(ANY,Dataset,_, vg, vl, cql, ZSchema, consts,FilterManager ,Pills,NotifyingService,Alternatives,Chart,Config,Schema,util) {
        var keys =  _.keys(Schema.schema.definitions.Encoding.properties).concat([ANY+0]);
        function instantiate() {
            return {
                data: Config.data,
                transform: {
                },
                mark: 'bar',
                encoding: keys.reduce(function(e, c) {
                    e[c] = {};
                    return e;
                }, {}),
                config: Config.config,
                groupBy: 'auto',
                autoAddCount: false
            };
        }

        var PCAplot = {
            axismain: [],
            dataencde: null,
            alternatives: [],
            autoGroupBy: null,
            spec: null,
            firstrun:true,
            chart:null,
            charts:[],

        };
        PCAplot.axismain = [];
        PCAplot.plot =function(data) {
            if (!Object.keys(Config.data).length){return PCAplot;}
            if (!PCAplot.firstrun && (Dataset.currentDataset[Object.keys(Config.data)[0]]==Config.data[Object.keys(Config.data)[0]])) {return PCAplot;}
            PCAplot.firstrun = false;
            d3.select('#bi-plot').selectAll('g').remove();

            // Biplot.data;
            //var data = Dataset.data);
            if (typeof data !=='undefined' ) {
                //d3.selectAll('.biplot').append("g");
                var margin = {top: 5, right: 5, bottom: 5, left: 5};
                var width = $('.biplot').width() - margin.left - margin.right;
                var height = $('.biplot').width() - margin.top - margin.bottom;
                var angle = Math.PI * 0;
//var color = d3.scaleOrdinal(d3.schemeCategory10);
                var color = d3.scale.category10();
                var x = d3.scale.linear().range([width, 0]); // switch to match how R biplot shows it
                var y = d3.scale.linear().range([height, 0]);
                var rdot = 3;


                var svg_main = d3.select("#bi-plot")
                    .attr("width", width + margin.left + margin.right)
                    .attr("height", height + margin.top + margin.bottom);
                var svg = svg_main.append("g")
                    .attr("id","bi-plot-g")
                    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
                var g_axis = svg.append("g")
                    .attr("id","bi-plot-axis");
                var g_point = svg.append("g")
                    .attr("id","bi-plot-point");
                var brand_names = Object.keys(data[0]);  // first row of data file ["ATTRIBUTE", "BRAND A", "BRAND B", "BRAND C", ...]

                var inputdata = Array.from(data);
                var matrix = data2Num(inputdata);

                var pca = new PCA();
                // console.log(brand_names);
                matrix = pca.scale(matrix,true,true);

                var pc = pca.pca(matrix,2);

                var A = pc[0];  // this is the U matrix from SVD
                var B = pc[1];  // this is the dV matrix from SVD
                var chosenPC = pc[2];   // this is the most value of PCA
                var maxxy = 0;
                A.forEach(function(d){maxxy=Math.max(maxxy,Math.abs(d[0]),Math.abs(d[1]));});
                x.domain([-maxxy,maxxy]).nice();
                y.domain([-maxxy,maxxy]).nice();
                var scale_axis = 0;
                B.forEach(function(i){scale_axis = Math.max(scale_axis,Math.sqrt(i[0]*i[0] + i[1]*i[1]))});
                scale_axis = maxxy/scale_axis;
                data.map(function(d,i){
                    label: d[brand_names[0]],
                        d.pc1 = A[i][chosenPC[0]];
                    d.pc2 = A[i][chosenPC[1]];
                });
                var brands = brand_names
                    .map(function(key, i) {
                        return {
                            brand: key,
                            pc1: B[i][chosenPC[0]]*scale_axis,
                            pc2: B[i][chosenPC[1]]*scale_axis
                        }
                    });
                // console.log(brands);
                function rotate(x,y, dtheta) {

                    var r = Math.sqrt(x*x + y*y);
                    var theta = Math.atan(y/x);
                    if (x<0) theta += Math.PI;

                    return {
                        x: r * Math.cos(theta + dtheta),
                        y: r * Math.sin(theta + dtheta)
                    }
                }


                data.map(function(d,i) {
                    var xy = rotate(d.pc1, d.pc2, angle);
                    d.pc1 = xy.x;
                    d.pc2 = xy.y;
                    d.vector = matrix[i];
                });

                brands.map(function(d) {
                    var xy = rotate(d.pc1, d.pc2, angle);
                    d.pc1 = xy.x;
                    d.pc2 = xy.y;
                });
                //update to calculate
                PCAplot.estimate(brands);
                // draw
                g_point.selectAll(".dot")
                    .data(data)
                    .enter().append("circle")
                    .attr("class", "dot")
                    .attr("r", rdot)
                    .attr("cx", function(d) { return x(d.pc1); })
                    .attr("cy", function(d) { return y(d.pc2); })
                    .style("fill", function(d) {
                        return '#161616'; })
                    .style("fill-opacity",0.4)
                    .on('mouseover', onMouseOverAttribute)
                    .on('mouseleave', onMouseLeave);

                g_axis.selectAll("circle.brand")
                    .data(brands)
                    .enter().append("rect")
                    .attr("class", "square")
                    .attr("width", 5)
                    .attr('height',5)
                    .attr("x", function(d) { return x(d.pc1)-2.5; })
                    .attr("y", function(d) { return y(d.pc2)-2.5; })
                    .style("fill", function(d) {
                        return color(d['brand']); })
                    .on('mouseover', onMouseOverBrand)
                    .on('mouseleave', onMouseLeave);


                g_axis.selectAll("text.brand")
                    .data(brands)
                    .enter().append("text")
                    .attr("class", "label-brand")
                    .attr("x", function(d) { return x(d.pc1) + 10; })
                    .attr("y", function(d) { return y(d.pc2) + 0; })
                    .attr("visibility","hidden")
                    .text(function(d) { return d['brand']});
                var deltaX, deltaY;

                var bi = d3.selectAll(".biplot");
                var temp_drag;
                var current_field;


                var dragHandler = d3.behavior.drag()
                    .on("dragstart", function (d) {

                        var proIwant = d3.selectAll("schema-list-item")
                            .data(Dataset.schema.fieldSchemas)
                            .filter(function(it){
                                if (it.field == d.brand){
                                    current_field = it;
                                    return true;}
                                else
                                    return false})
                            .select('div');
                        //.attr ('class','schema-list-item ng-pristine ng-untouched ng-valid ui-droppable ui-droppable-disabled ng-empty ui-droppable-active drop-active');
                        var pill = {
                            field: current_field.field,
                            title: current_field.title,
                            type: current_field.type,
                            aggregate: current_field.aggregate
                        };
                        Pills.dragStart(pill, null);
                        // NotifyingService.notify();
                        var ori = proIwant.select('span').html();
                        //console.log(ori);
                        /* temp_drag = proIwant.select('span').select(function() {
                             return this.parentNode.insertBefore(this.cloneNode(true), this.nextSibling);
                         });*/
                        temp_drag = d3.select('bi-plot').append('span').html(ori);
                        temp_drag.attr("class",'pill draggable full-width no-right-margin field-info ng-pristine ng-untouched ng-valid ng-isolate-scope ui-draggable ui-draggable-handle ng-empty ui-draggable-dragging')
                            .style("position","absolute")
                            .style("z-index",'9999')
                            .style("left",function(){return ((d3.event.x||d3.event.pageX)) + "px"})
                            .style("top",function(){var con = (d3.event.y||d3.event.pageY) +100;
                                return con + "px"});
                        d3.selectAll('.field-drop')
                            .attr("class","field-drop ng-pristine ng-untouched ng-valid ui-droppable ng-not-empty ui-dropable-active drop-active ");
                        NotifyingService.notify();
                        // NotifyingService.notify();
                        //console.log($(proIwant[0]));
                        //$(proIwant[0]).trigger("mousedown");
                        //$(proIwant[0]).trigger('DOMContentLoaded');
                        //$(proIwant[0]).trigger('blur');
                    })
                    .on("drag", function (d) {
                        temp_drag
                            .style("left",function(){return d3.event.x + "px"})
                            .style("top",function(){return (d3.event.y+100) + "px"});

                    })
                    .on("dragend", function (d) {
                        var proIwant = d3.selectAll("schema-list-item")
                            .data(Dataset.schema.fieldSchemas)
                            .filter(function(it){return it.field == d.brand;})
                            .select('div')
                            .attr ('class','schema-list-item ng-pristine ng-untouched ng-valid ui-droppable ui-droppable-disabled ng-empty');

                        Pills.dragStop;

                        var pos = temp_drag.node().getBoundingClientRect();
                        temp_drag.remove();
                        var tem_group = d3.selectAll(".shelf-group");
                        tem_group = tem_group[0];
                        var tem_group = tem_group.filter(function(d,i){var pos_g = d.getBoundingClientRect();
                            return (pos_g.top<pos.top&&pos_g.bottom>pos.top&&pos_g.left<pos.left&&pos_g.right>pos.left)});

                        try{
                            var chan = $(tem_group[0]).attr('channel-id').replace(/'/g,"");
                            console.log(chan);
                            if (chan!=null){
                                Pills.set(chan, current_field);
                                Pills.listener.dragDrop(chan);
                                //.update(Spec.spec);
                            }}catch(e){}
                        NotifyingService.notify();
                        d3.selectAll("div [d3-over='true']")
                            .attr('d3-over','false');


                        //var event = new Event('submit');  // (*)
                        //$(d3.select('.schema')[0]).dispatchEvent(event);
                        d3.selectAll('.field-drop')
                            .attr("class","field-drop ng-pristine ng-untouched ng-valid ui-droppable ng-not-empty");
                    });

                var listitem = g_axis.selectAll(".line")
                    .data(brands)
                    .enter().append("line")
                    .attr("class", "line square draggable")
                    .attr('x1', function(d) { return x(0)})//x(-d.pc1);})
                    .attr('y1', function(d) { return x(0)})//y(-d.pc2); })
                    .attr("x2", function(d) { return x(d.pc1); })
                    .attr("y2", function(d) { return y(d.pc2); })
                    .style("stroke", function(d) { return color(d['brand']); })
                    .style("stroke-width", '1px')
                    .on('mouseover', onMouseOverBrand)
                    .on('mouseleave', onMouseLeave)
                    .on("dblclick", function(d) {
                        var proIwant = d3.selectAll("schema-list-item")
                            .data(Dataset.schema.fieldSchemas)
                            .filter(function(it){return it.field == d.brand})
                            .select('div')
                            .select('span');
                        $(proIwant[0]).trigger("dblclick");
                    })
                    .call(dragHandler);
                var tip = d3.tip()
                    .attr('class', 'd3-tip')
                    .offset([10, 20])
                    .direction('e')
                    .html(function(values,title) {
                        var str =''
                        str += '<h3>' + (title.length==1 ? 'Brand ' : '' )+ title  + '</h3>'
                        str += "<table>";
                        for (var i=0; i<values.length; i++) {
                            if ( values[i].key != 'pc1' && values[i].key != 'pc2') {
                                str += "<tr>";
                                str += "<td>" + values[i].key + "</td>";
                                str += "<td class=pct>" + values[i].value + "</td>";
                                str + "</tr>";
                            }
                        }
                        str += "</table>";

                        return str;
                    });
                //dragHandler(svg.selectAll(".line"));
                svg.call(tip);
                // draw line from the attribute a perpendicular to each brand b
                function onMouseOverAttribute(a,j) {
                    brands.forEach(function(b, idx) {
                        var A = { x: 0, y:0 };
                        var B = { x: b.pc1,  y: b.pc2 };
                        //var C = { x: a.pc1,  y: a.pc2 };
                        var C = { x: a.vector[idx],  y: a.vector[idx] };

                        b.D = getSpPoint(A,B,C);
                    });

                    svg.selectAll('.tracer')
                        .data(brands)
                        .enter()
                        .append('line')
                        .attr('class', 'tracer')
                        .attr('x1', function(b,i) { return x(a.pc1); return x1; })
                        .attr('y1', function(b,i) { return y(a.pc2); return y1; })
                        .attr('x2', function(b,i) { return x(b.D.x); return x2; })
                        .attr('y2', function(b,i) { return y(b.D.y); return y2; })
                        .style("stroke", function(d) { return "#ff6f2b"});

                    delete a.D;
                    var tipText = d3.entries(a);
                    tip.show(tipText, "");
                }

// draw line from the brand axis a perpendicular to each attribute b
                function onMouseOverBrand(b,j) {

                    data.forEach(function(a, idx) {
                        var A = { x: 0, y:0 };
                        var B = { x: b.pc1,  y: b.pc2 };
                        //var C = { x: a.pc1,  y: a.pc2 };
                        var C = { x: a.vector[j],  y: a.vector[j] };

                        a.D = getSpPoint(A,B,C);
                    });

                    var tracer = svg.selectAll('.tracer')
                        .data(data)
                        .enter();
                    tracer
                        .append('line')
                        .attr('class', 'tracer')
                        .attr('x1', function(a,i) { return x(a.D.x);  })
                        .attr('y1', function(a,i) { return y(a.D.y);  })
                        .attr('x2', function(a,i) { return x(a.pc1);  })
                        .attr('y2', function(a,i) { return y(a.pc2); })
                        .style("stroke", function(d) { return "#aaa"});

                    tracer
                        .append('circle')
                        .attr('class', 'tracer-c')
                        .attr('cx', function(a,i) { return x(a.D.x);  })
                        .attr('cy', function(a,i) { return y(a.D.y);  })
                        .attr('r',5)
                        .style("fill", function(d) { return "#ff6f2b"})
                        .style("fill-opacity", 0.1);

                    /*var tipText = data.map(function(d) {
                        return {key: d[brand_names[0]], value: d[b['brand']] }
                    });*/
                    var tipText ="";
                    tip.show(tipText, b.brand);
                }

                function onMouseLeave(b,j) {
                    svg.selectAll('.tracer').remove();
                    svg.selectAll('.tracer-c').remove();
                    tip.hide();
                }






                /*svg.selectAll("text.attr")
                    .data(data)
                    .enter().append("text")
                    .attr("class", "label-attr")
                    .attr("x", function(d,i ) { return x(d.pc1)+4 ; })
                    .attr("y", function(d ,i) { return y(d.pc2) + (label_offset[d.type]||0); })
                    .text(function(d,i) { return d.type})*/


                function getSpPoint(A,B,C){
                    var x1=A.x, y1=A.y, x2=B.x, y2=B.y, x3=C.x, y3=C.y;
                    var px = x2-x1, py = y2-y1, dAB = px*px + py*py;
                    // var u = ((x3 - x1) * px + (y3 - y1) * py) / dAB;
                    //var x = x1 + u * px, y = y1 + u * py;
                    var u = x3*scale_axis/dAB;
                    var x = x1 + u * px, y = y1 + u * py;
                    return {x:x, y:y}; //this is D
                }

                function data2Num (input){
                    var clone = {};
                    for ( var key in  input[0]){
                        clone[key] = [];
                    }
                    var output=  Array.from(input);
                    input.forEach(function (d){
                        for ( var key in d){
                            if (clone[key].find(function(it){return it.key == [d[key]];}) == undefined){
                                clone[key].push({'key': d[key]});
                            }
                        }
                    });


                    for (var key in clone){
                        clone[key].sort(function(a,b){
                            if (a.key < b.key)
                                return -1;
                            else
                                return 1;});


                        clone[key].forEach(function(d,i){
                            if (d.key == null)
                                d.newindex = 0;
                            else if (isNaN(parseFloat(d.key) )){
                                d.newindex = i;
                            }else{
                                d.newindex = parseFloat(d.key);
                            }
                        });
                    }


// output with replaced number
                    /*output.forEach(function (d,i){
                        for ( var k in d){
                            output[i][k] = clone[k].find(function(it){return it.key == output[i][k]}).newindex;
                        }
                    });*/

                    var matrix = input.map(function (d,i){
                        return Object.keys(d).map(function(k){
                            return clone[k].find(function(it){return it.key == output[i][k]}).newindex;
                        });
                    });
                    return matrix;
                    //return output.map(function(d){return Object.keys(d).map(function(i){return d[i]})});
                }

                PCAplot.dataencde = data;
            }
        return PCAplot};
        PCAplot.estimate = function(PCAresult) {
            // choose main axis
            var pca1_max = PCAresult.sort(function(a,b){
                return Math.abs(a.pc1)<Math.abs(b.pc1)?1:-1})[0]['brand'];
            PCAresult.sort(function(a,b){
                return Math.abs(a.pc2)<Math.abs(b.pc2)?1:-1});
            var pca2_max = PCAresult[0]['brand']!=pca1_max?PCAresult[0]['brand']:PCAresult[1]['brand'];

            var object1 = Dataset.schema.fieldSchemas.filter(function(d){return d.field == pca1_max})[0];
            var object2 = Dataset.schema.fieldSchemas.filter(function(d){return d.field == pca2_max})[0];
            //var pca1_maxd = [pca1_max, 'bar'];
            //var pca2_maxd = [pca1_max, 'box'];
            // update to guideplot
          //PCAplot.axismain =  [pca1_maxd,pca2_maxd];
            drawGuideplot(object1,'area');
            drawGuideplot(object2,'dash');
            drawGuideplot(object2,'bar');
            drawGuideplot(object2,'boxplot');
        };

        function drawGuideplot (object,type) {
            var spec = spec = _.cloneDeep(instantiate() || PCAplot.spec);
            //spec.data = Dataset.dataset;
            spec.config = {
                cell: {
                    width: 200,
                    height: 100,
                },
                facet: {
                    cell: {
                        width: 150,
                        height: 150
                    }
                },
                overlay: {line: false},
                scale: {useRawDomain: true}
            };
            switch (type) {
                case 'bar': barplot(spec, object); break;
                case 'dash': dashplot(spec, object); break;
                case 'area': areaplot(spec, object); break;
                case 'boxplot': boxplot(spec, object); break;
            }
            var query = getQuery(spec);
            var output = cql.query(query, Dataset.schema);
            PCAplot.query = output.query;
            var topItem = output.result.getTopSpecQueryModel();
            PCAplot.chart = Chart.getChart(topItem);
            PCAplot.charts.push(PCAplot.chart);
        }
        // PCAplot.alternatives = Alternatives.getHistograms(null, PCAplot.chart, null);
        function barplot(spec,object) {
            spec.mark = "bar";
            spec.encoding = {
                y: {bin: {}, field: object.field, type: object.type},
                x: {aggregate: "count", field: "*", type: object.type}
            };
        }

        function dashplot(spec,object) {
            spec.mark = "tick";
            spec.encoding = {
                x: {field: object.field, type: object.type}
            };
        }

        function areaplot(spec,object) {
            spec.mark = "area";
            spec.encoding = {
                x: {bin: {}, field: object.field, type: object.type},
                y: {aggregate: "count", field: "*", type: object.type}
            };
        }
        function boxplot(spec,object) {
            spec.mark = "boxplot";
            spec.encoding = {
                x: { field: object.field, type: object.type}
            };
        }

        PCAplot.plotguide = function (svg,fieldname,type){
            svg.selectAll('g').remove();
            var brands = Object.keys(this.dataencde[0]);
            var index = 0;
            for ( var i in brands){
                if (brands[i] == fieldname) {
                    index = i;
                    break;
                }
            }
            var data = this.dataencde.map(function(d){
                return d.vector[index];
            });

            // init for all

            var margin = {top: 20, right: 5, bottom: 20, left: 30};
            var width =$(svg[0]).width() - margin.left - margin.right;
            var height = $(svg[0]).height() - margin.top - margin.bottom;


            var g = svg.append('g')
                .attr("transform", "translate(" + margin.left + "," + margin.top + ")");;
            var axis_g = g.append('g')
                .attr('class','axis');
            var plot_g = g.append('g')
                .attr('class','plot');

            switch (type) {
                case 'bar':
                    // bar
                    var formatCount = d3.format(",.0f");
                    var max = d3.max(data);
                    var min = d3.min(data);
                    var x = d3.scale.linear()
                        .domain([min, max])
                        .range([0, width]); // switch to match how R biplot shows it

                    // Generate a histogram using twenty uniformly-spaced bins.
                    var databin = d3.layout.histogram()(data);

                    var xAxis = d3.svg.axis()
                        .scale(x)
                        .orient("bottom")
                        .ticks(databin.length);

                    var yMax = d3.max(databin, function (d) {
                        return d.length
                    });
                    var yMin = d3.min(databin, function (d) {
                        return d.length
                    });
                    var y = d3.scale.linear()
                        .domain([yMin, yMax])
                        .range([height, 0]);
                    var yAxis = d3.svg.axis()
                        .scale(y)
                        .orient("left");
                    var yAxis_grid = d3.svg.axis()
                        .scale(y)
                        .orient("right")
                        .tickSize(width);


                    var bar = plot_g.selectAll(".bar")
                        .data(databin)
                        .enter().append("g")
                        .attr("class", "bar")
                        .attr("transform", function (d) {
                            return "translate(" + x(d.x) + "," + y(d.y) + ")";
                        });

                    bar.append("rect")
                        .attr("x", 1)
                        .attr("width", (x(databin[0].dx) - x(0)) - 1)
                        .attr("height", function (d) {
                            return height - y(d.y);
                        })
                        .attr("fill", function (d) {
                            return "steelblue"
                        });

                    /*bar.append("text")
                        .attr("dy", ".75em")
                        .attr("y", -12)
                        .attr("x", (x(data[0].dx) - x(0)) / 2)
                        .attr("text-anchor", "middle")
                        .text(function(d) { return formatCount(d.y); });*/

                    axis_g.append("g")
                        .attr("class", "x axis")
                        .attr("transform", "translate(0," + height + ")")
                        .call(xAxis);


                    var g_y = axis_g.append("g")
                        .attr("class", "y axis")
                        //.attr("transform", "translate("+margin.left+",0)")
                        .call(yAxis);
                    var g_y_grid = axis_g.append("g")
                        .attr("class", "y axis_grid")
                        //.attr("transform", "translate("+margin.left+",0)")
                        .call(yAxis_grid);
                    g_y_grid.selectAll('.tick text').remove();
                    g_y_grid.selectAll('path').remove();
                case 'box':

                case 'area':
                case 'dash':
            }

        };



        function getQuery(spec, convertFilter /*HACK */) {
            var specQuery = getSpecQuery(spec, convertFilter);

            var hasAnyField = false, hasAnyFn = false, hasAnyChannel = false;

            for (var i = 0; i < specQuery.encodings.length; i++) {
                var encQ = specQuery.encodings[i];
                if (encQ.autoCount === false) continue;

                if (cql.enumSpec.isEnumSpec(encQ.field)) {
                    hasAnyField = true;
                }

                if (cql.enumSpec.isEnumSpec(encQ.aggregate) ||
                    cql.enumSpec.isEnumSpec(encQ.bin) ||
                    cql.enumSpec.isEnumSpec(encQ.timeUnit)) {
                    hasAnyFn = true;
                }

                if (cql.enumSpec.isEnumSpec(encQ.channel)) {
                    hasAnyChannel = true;
                }
            }

            /* jshint ignore:start */
            var groupBy = spec.groupBy;

            if (spec.groupBy === 'auto') {
                groupBy = PCAplot.autoGroupBy = hasAnyField ?
                    (hasAnyFn ? 'fieldTransform' : 'field') :
                    'encoding';
            }

            return {
                spec: specQuery,
                groupBy: groupBy,
                orderBy: ['fieldOrder', 'aggregationQuality', 'effectiveness'],
                chooseBy: ['aggregationQuality', 'effectiveness'],
                config: {
                    omitTableWithOcclusion: false,
                    autoAddCount: (hasAnyField || hasAnyFn || hasAnyChannel) && spec.autoAddCount
                }
            };
            /* jshint ignore:end */
        }

        function getSpecQuery(spec, convertFilter /*HACK*/) {
            if (convertFilter) {
                spec = util.duplicate(spec);


                // HACK convert filter manager to proper filter spec
                if (spec.transform && spec.transform.filter) {
                    delete spec.transform.filter;
                }

                var filter = FilterManager.getVlFilter();
                if (filter) {
                    spec.transform = spec.transform || {};
                    spec.transform.filter = filter;
                }
            }

            return {
                data: Config.data,
                mark: spec.mark === ANY ? '?' : spec.mark,

                // TODO: support transform enumeration
                transform: spec.transform,
                encodings: vg.util.keys(spec.encoding).reduce(function(encodings, channelId) {
                    var encQ = vg.util.extend(
                        // Add channel
                        { channel: Pills.isAnyChannel(channelId) ? '?' : channelId },
                        // Field Def
                        spec.encoding[channelId],
                        // Remove Title
                        {title: undefined}
                    );

                    if (cql.enumSpec.isEnumSpec(encQ.field)) {
                        // replace the name so we should it's the field from this channelId
                        encQ.field = {
                            name: 'f' + channelId,
                            enum: encQ.field.enum
                        };
                    }

                    encodings.push(encQ);
                    return encodings;
                }, []),
                config: spec.config
            };
        }
        PCAplot.parseSpec = function(newSpec) {
            // TODO: revise this
            PCAplot.spec = parse(newSpec);
        };
        function parse(spec) {
            var oldSpec = util.duplicate(spec);
            var oldFilter = null;

            if (oldSpec) {
                // Store oldFilter, copy oldSpec that exclude transform.filter
                oldFilter = (oldSpec.transform || {}).filter;
                var transform = _.omit(oldSpec.transform || {}, 'filter');
                oldSpec = _.omit(oldSpec, 'transform');
                if (transform) {
                    oldSpec.transform = transform;
                }
            }

            var newSpec = vl.util.mergeDeep(instantiate(), oldSpec);

            // This is not Vega-Lite filter object, but rather our FilterModel
            newSpec.transform.filter = FilterManager.reset(oldFilter);

            return newSpec;
        }
        PCAplot.reset = function(hard) {
            var spec = instantiate();
            spec.transform.filter = FilterManager.reset(null, hard);
            PCAplot.spec = spec;
            PCAplot.firstrun =true;
            PCAplot.charts.length = 0;
            //PCAplot.plot(Dataset.data);
        };
        PCAplot.reset();
        Dataset.onUpdate.push(function() {
            PCAplot.reset(true);
            //PCAplot.plot(Dataset.data);
        });
        return PCAplot;
    });