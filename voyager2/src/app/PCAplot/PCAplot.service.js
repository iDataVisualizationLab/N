'use strict';

angular.module('pcagnosticsviz')
// TODO: rename to Query once it's compvare independent from Polestar
    .factory('PCAplot', function(ANY,Dataset,_, vg, vl, cql, ZSchema, consts,FilterManager ,Pills,NotifyingService,Alternatives,Chart,Config,Schema,util,GuidePill) {
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
            dataencde: null,
            alternatives: [],
            autoGroupBy: null,
            spec: null,
            firstrun:true,
            chart:null,
            charts:[],
            mainfield: null,
            prop:null,
            dim: 0,
            dataref:[],
            limit: 10,
            mspec:null,
        };
        PCAplot.mark2plot = mark2plot;
        var support =[{
            types : ['PCA1','PCA2', 'skewness', 'outlier'],
        marks : ['tick','area','bar','boxplot'],
        }, {
            types : ['outlyingScore','skewedScore','sparseScore','clumpyScore','striatedScore','convexScore','skinnyScore','stringyScore','monotonicScore'],
            marks :['point','hexagon','leader','contour'],
        }, {
            types : ['com'],
            marks :['scatter3D','radar'],
        }];
        //PCAplot.updateplot = function (data){};
        PCAplot.plot =function(dataor,dimension) {
            if (!Object.keys(Config.data).length){return PCAplot;}
            if (!PCAplot.firstrun && (Dataset.currentDataset[Object.keys(Config.data)[0]]==Config.data[Object.keys(Config.data)[0]])) {return PCAplot;}
            //console.log("PLOT!!!!");
            PCAplot.firstrun = false;
            // d3.select('#bi-plot').selectAll('g').remove();

            // Biplot.data;
            //var data = Dataset.data);
            if (typeof dataor !=='undefined' ) {
                PCAplot.data = [Dataset.schema.fieldSchemas, PCAplot.dataref];
                //d3.selectAll('.biplot').append("g");
                var data = _.cloneDeep(dataor);
                var margin = {top: 20, right: 20, bottom: 20, left: 20};
                var width = $('.biplot').width() - margin.left - margin.right;
                var height = $('.biplot').width() - margin.top - margin.bottom;
                var angle = Math.PI * 0;
//var color = d3.scaleOrdinal(d3.schemeCategory10);
                var color = d3.scale.category10();
                var x = d3.scale.linear().range([0, width]); // switch to match how R biplot shows it
                var y = d3.scale.linear().range([height, 0]);
                var rdot = 3;
                // sub space
                var submarign = {top: 5, right: 5, bottom: 5, left: 5};
                var subgSize = {
                    w: (40 - submarign.left - submarign.right),
                    h: (40 - submarign.top - submarign.bottom),
                };
                var subx = d3.scale.linear().range([submarign.left, subgSize.w + submarign.left]).domain([0, 1]); // switch to match how R biplot shows it
                var suby = d3.scale.linear().range([submarign.top + subgSize.h, submarign.top]).domain([0, 1]);

                var svg_main = d3.select("#bi-plot")
                    .attr("width", width + margin.left + margin.right)
                    .attr("height", height + margin.top + margin.bottom);
                var svg = svg_main.select("#bi-plot-g")
                    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
                var g_axis = svg.select("#bi-plot-axis");
                var g_point = svg.select("#bi-plot-point");
                var idlabel = [],
                    brand_names = [],
                    matrix = [],
                    outlier = [];
                var dataref = null;
                if (dimension === 0) {
                    brand_names = Object.keys(data[0]);
                    matrix = data2Num(data);

                    var outlier = brand_names.map(function (d, i) {
                        var outlier = 0,
                            row = matrix.map(function (r) {
                                return r[i]
                            }),
                            q1 = ss.quantile(row, 0.25),
                            q3 = ss.quantile(row, 0.75),
                            iqr = (q3 - q1) * 3;
                        //iqr = Dataset.schema.fieldSchema(d).stats.stdev*1.35;
                        Dataset.schema.fieldSchema(d).stats.q1 = q1;
                        Dataset.schema.fieldSchema(d).stats.q3 = q3;
                        Dataset.schema.fieldSchema(d).stats.q1iqr = Math.max(q1 - iqr, ss.min(row));
                        Dataset.schema.fieldSchema(d).stats.q3iqr = Math.min(q3 + iqr, ss.max(row));
                        Dataset.schema.fieldSchema(d).stats.iqr = iqr;
                        //console.log(Dataset.schema.fieldSchema(d).stats);
                        row.forEach(function (e) {
                            if ((e < q1 - 2 * iqr) || (e > q3 + 2 * iqr))
                                outlier += 10;
                            else if ((e < q1 - iqr) || (e > q3 + iqr))
                                outlier = outlier + 1;
                        });
                        return outlier;
                    });
                }
                else {
                    var newdata = [];
                    data.forEach(function (d) {
                        for (var e in d[d.field]) {
                            if (d[d.field][e].invalid != 1) {
                                idlabel.push([d.field, e]);
                                newdata.push(d[d.field][e]);
                            }
                        }
                    });
                    data = newdata.filter(function (d) {
                        return !d.invalid
                    }); // for overview 2D
                    // idlabel = Object.keys(data);
                    //brand_names = Object.keys(data[idlabel[0]]);
                    brand_names = Object.keys(data[0]).filter(function (d) {
                        return d != "label";
                    });
                    // data = d3.values(data);
                    matrix = data.map(function (d) {
                        return d3.values(d)
                    });
                    //console.log(data);
                    if (brand_names < 9) {
                        data.forEach(function (d, i) {
                            d.label = idlabel[i];
                            d.pc1 = 0;
                            d.pc2 = 0;
                        });
                        dataref = _.cloneDeep(data);
                        var brands = brand_names
                            .map(function (key, i) {
                                return {brand: key, pc1: 0, pc2: 0}
                            });
                        PCAplot.estimate(brands, dimension, dataref);
                    }

                }
                try{
                var pca = new PCA();
                // console.log(brand_names);
                matrix = pca.scale(matrix, true, true);

                var pc = pca.pca(matrix, 2);

                var A = pc[0];  // this is the U matrix from SVD
                var B = pc[1];  // this is the dV matrix from SVD
                var chosenPC = pc[2];   // this is the most value of PCA
                data.forEach(function (d, i) {
                    d.pc1 = A[i][chosenPC[0]];
                    d.pc2 = A[i][chosenPC[1]];
                });
                if (dimension == 1) {
                    data.forEach(function (d, i) {
                        d.label = idlabel[i]
                    });
                    dataref = _.cloneDeep(data);
                    data = brand_names.map(function (d) {
                        var top = data.sort(function (a, b) {
                            return a[d] < b[d] ? 1 : -1;
                        })[0];
                        if (top[d] > 0.65) {
                            top.feature = d;
                            return top;
                        }
                    }).filter(function (d) {
                        return d != undefined;
                    });
                }
                var maxxy = [-Infinity, -Infinity];
                var minxy = [Infinity, Infinity];
                //A.forEach(function(d){maxxy=Math.max(maxxy,Math.abs(d[0]),Math.abs(d[1]));});
                maxxy = maxxy.map(function (d, i) {
                    return d3.max(data.map(function (e) {
                        return e['pc' + (i + 1)];
                    }));
                });
                minxy = minxy.map(function (d, i) {
                    return d3.min(data.map(function (e) {
                        return e['pc' + (i + 1)];
                    }));
                });
                var maxxyall = [0, 0];
                maxxyall = maxxyall.map(function (d, i) {
                    return Math.max(Math.abs(minxy[i]), Math.abs(maxxy[i]));
                });
                // x.domain([-maxxyall]).nice();
                // y.domain([minxy[1],maxxy[1]]).nice();
                x.domain([-maxxyall[0], maxxyall[0]]).nice();
                y.domain([-maxxyall[1], maxxyall[1]]).nice();
                var scale_axis = 0;
                B.forEach(function (i) {
                    scale_axis = Math.max(scale_axis, Math.sqrt(i[0] * i[0] + i[1] * i[1]))
                });
                var scale_axisx = maxxyall[0] / scale_axis;
                var scale_axisy = maxxyall[1] / scale_axis;
                var brands = brand_names
                    .map(function (key, i) {
                        return {
                            brand: key,
                            pc1: B[i][chosenPC[0]] * scale_axisx,
                            pc2: B[i][chosenPC[1]] * scale_axisy,
                        }
                    });
                // console.log(brands);


                data.map(function (d, i) {
                    var xy = rotate(d.pc1, d.pc2, angle);
                    d.pc1 = xy.x;
                    d.pc2 = xy.y;
                    d.vector = matrix[i];
                });

                brands.map(function (d, i) {
                    var xy = rotate(d.pc1, d.pc2, angle);
                    d.pc1 = xy.x;
                    d.pc2 = xy.y;
                    if (dimension === 0) {
                        d.outlier = outlier[i];
                        d.skew = Dataset.schema.fieldSchema(d.brand).stats.modeskew;
                    }
                });
                //update to calculate
                PCAplot.estimate(brands, dimension, dataref);
                // draw
                var onMouseOverAttribute = function (a, j) {
                    brands.forEach(function (b, idx) {
                        var A = {x: 0, y: 0};
                        var B = {x: b.pc1, y: b.pc2};
                        var C = {x: a.pc1, y: a.pc2};
                        //var C = { x: a.vector[idx],  y: a.vector[idx] };

                        b.D = getSpPoint(A, B, C);
                    });

                    svg.selectAll('.tracer')
                        .data(brands)
                        .enter()
                        .append('line')
                        .attr('class', 'tracer tips')
                        .attr('x1', function (b, i) {
                            return x(a.pc1);
                            return x1;
                        })
                        .attr('y1', function (b, i) {
                            return y(a.pc2);
                            return y1;
                        })
                        .attr('x2', function (b, i) {
                            return x(b.D.x);
                            return x2;
                        })
                        .attr('y2', function (b, i) {
                            return y(b.D.y);
                            return y2;
                        })
                        .style("stroke", function (d) {
                            return "#ff6f2b"
                        });

                    delete a.D;
                    var ca = _.cloneDeep(a);
                    delete ca.pc1;
                    delete ca.pc2;
                    delete ca.vector;
                    var tipText = d3.entries(ca);
                    // console.log(a);
                    tip.show(tipText, "");
                };

// draw line from the brand axis a perpendicular to each attribute b
                var legendtop = svg.selectAll('.legendtop').data([''])
                    .enter().append('text')
                    .text(function (d) {
                        return d
                    })
                    .attr('text-anchor', 'end')
                    .attr('y', height + margin.bottom / 2)
                    .attr('x', width);
                var onMouseOverBrand = function (b, j) {

                    data.forEach(function (a, idx) {
                        var A = {x: 0, y: 0};
                        var B = {x: b.pc1, y: b.pc2};
                        var C = {x: a.pc1, y: a.pc2};
                        // var C = { x: a.vector[j],  y: a.vector[j] };

                        a.D = getSpPoint(A, B, C);
                    });

                    var tracer = svg.selectAll('.tracer')
                        .data(data)
                        .enter();
                    tracer
                        .append('line')
                        .attr('class', 'tracer tips')
                        .attr('x1', function (a, i) {
                            return x(a.D.x);
                        })
                        .attr('y1', function (a, i) {
                            return y(a.D.y);
                        })
                        .attr('x2', function (a, i) {
                            return x(a.pc1);
                        })
                        .attr('y2', function (a, i) {
                            return y(a.pc2);
                        })
                        .style("stroke", function (d) {
                            return "#aaa"
                        });

                    tracer
                        .append('circle')
                        .attr('class', 'tracer-c tips')
                        .attr('cx', function (a, i) {
                            return x(a.D.x);
                        })
                        .attr('cy', function (a, i) {
                            return y(a.D.y);
                        })
                        .attr('r', 5)
                        .style("fill", function (d) {
                            return "#ff6f2b"
                        })
                        .style("fill-opacity", 0.1);
                    legendtop.data([b.brand]).text(function (d) {
                        return d;
                    });
                    /*var tipText = data.map(function(d) {
                        return {key: d[brand_names[0]], value: d[b['brand']] }
                    });*/

                    // call tip
                    /*var tipText ="";
                    tip.show(tipText, b.brand);*/

                    //add tip to head
                };

                var onMouseLeave = function (b, j) {
                    svg.selectAll('.tracer').remove();
                    svg.selectAll('.tracer-c').remove();
                    tip.hide();
                    legendtop.data(['']).text(function (d) {
                        return d;
                    });
                };
                if (dimension === 0) {
                    g_point.selectAll(".subgraph").remove();
                    var point = g_point.selectAll(".dot")
                        .data(data)
                        .attr("cx", function (d) {
                            return x(d.pc1);
                        })
                        .attr("cy", function (d) {
                            return y(d.pc2);
                        })
                        .style("fill", function (d) {
                            return '#161616';
                        })
                        .style("fill-opacity", 0.4)
                        .on('mouseover', onMouseOverAttribute)
                        .on('mouseleave', onMouseLeave);
                    point.exit().remove();
                    point
                        .enter().append("circle")
                        .attr("class", "dot")
                        .attr("r", rdot)
                        .attr("cx", function (d) {
                            return x(d.pc1);
                        })
                        .attr("cy", function (d) {
                            return y(d.pc2);
                        })
                        .style("fill", function (d) {
                            return '#161616';
                        })
                        .style("fill-opacity", 0.4)
                        .on('mouseover', onMouseOverAttribute)
                        .on('mouseleave', onMouseLeave);
                } else {
                    g_point.selectAll(".dot").remove();
                    var subplot = g_point.selectAll(".subgraph")
                        .data(data)
                        .attr("class", "subgraph")
                        .attr('transform', function (d) {
                            return "translate(" + (x(d.pc1) - (subgSize.w + submarign.left + submarign.right) / 2) + "," + (y(d.pc2) - (subgSize.h + submarign.top + submarign.bottom) / 2) + ")"
                        })
                        .on('mouseover', onMouseOverAttribute)
                        .on('mouseleave', onMouseLeave);
                    subplot.exit().remove();
                    var subinside = subplot
                        .enter().append("g")
                        .attr("class", "subgraph")
                        .attr('transform', function (d) {
                            return "translate(" + (x(d.pc1) - (subgSize.w + submarign.left + submarign.right) / 2) + "," + (y(d.pc2) - (subgSize.h + submarign.top + submarign.bottom) / 2) + ")"
                        })
                        .on('mouseover', onMouseOverAttribute)
                        .on('mouseleave', onMouseLeave);
                    subinside.append("rect")
                        .attr("class", "backgroundSub")
                        .attr("width", subgSize.w + submarign.left + submarign.right)
                        .attr("height", subgSize.h + submarign.top + submarign.bottom)
                        .attr("x", 0)
                        .attr("y", 0);
                    var subpoint = subplot.selectAll(".point")
                        .data(function (d) {
                            //var datapoint = Dataset.data.map(function(it){return [it[PCAplot.mainfield],it[d.label]]});
                            var datapoint = Dataset.data.map(function (it) {
                                return [it[d.label[0]], it[d.label[1]]]
                            });
                            var datax = datapoint.map(function (d) {
                                return d[0]
                            });
                            var datay = datapoint.map(function (d) {
                                return d[1]
                            });
                            var maxx = d3.max(datax);
                            var minx = d3.min(datax);
                            var maxy = d3.max(datay);
                            var miny = d3.min(datay);
                            datapoint.forEach(function (d) {
                                d[0] = (d[0] - minx) / (maxx - minx);
                                d[1] = (d[1] - miny) / (maxy - miny);
                            });
                            return datapoint;
                        })
                        .attr("cx", function (d) {
                            return subx(d[0]);
                        })
                        .attr("cy", function (d) {
                            return suby(d[1]);
                        });
                    subpoint.exit().remove();
                    subpoint.enter()
                        .append("circle")
                        .attr("class", "point")
                        .attr("r", 1)
                        .attr("cx", function (d) {
                            return subx(d[0]);
                        })
                        .attr("cy", function (d) {
                            return suby(d[1]);
                        })
                        .style("fill", function (d) {
                            return '#161616';
                        })

                        .style('opacity', 0.5);
                }

                var circlebrand = g_axis.selectAll(".circle_brand")
                    .data(brands)
                    .attr("x", function (d) {
                        return x(d.pc1) - 2.5;
                    })
                    .attr("y", function (d) {
                        return y(d.pc2) - 2.5;
                    })
                    .style("fill", function (d) {
                        return color(d['brand']);
                    });
                circlebrand.exit().remove();
                circlebrand
                    .enter().append("rect")
                    .attr("class", "circle_brand")
                    .attr("width", 5)
                    .attr('height', 5)
                    .attr("x", function (d) {
                        return x(d.pc1) - 2.5;
                    })
                    .attr("y", function (d) {
                        return y(d.pc2) - 2.5;
                    })
                    .style("fill", function (d) {
                        return color(d['brand']);
                    });


                /*g_axis.selectAll("text.brand")
                    .data(brands)
                    .enter().append("text")
                    .attr("class", "label-brand")
                    .attr("x", function(d) { return x(d.pc1) + 10; })
                    .attr("y", function(d) { return y(d.pc2) + 0; })
                    .attr("visibility","hidden")
                    .text(function(d) { return d['brand']});*/
                //var deltaX, deltaY;

                //var bi = d3.selectAll(".biplot");
                var temp_drag;
                var current_field;

                var dragHandler = d3.behavior.drag()
                    .on("dragstart", function (d) {

                        current_field = Dataset.schema.fieldSchema(d.brand);
                        var proIwant = d3.selectAll($("[id='" + d.brand + "']")).select('div')
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
                        temp_drag.attr("class", 'pill draggable full-width no-right-margin field-info ng-pristine ng-untouched ng-valid ng-isolate-scope ui-draggable ui-draggable-handle ng-empty ui-draggable-dragging')
                            .style("position", "absolute")
                            .style("z-index", '9999')
                            .style("left", function () {
                                return ((d3.event.x || d3.event.pageX)) + "px"
                            })
                            .style("top", function () {
                                var con = (d3.event.y || d3.event.pageY) + 100;
                                return con + "px"
                            });
                        d3.selectAll('.field-drop')
                            .attr("class", "field-drop ng-pristine ng-untouched ng-valid ui-droppable ng-not-empty ui-dropable-active drop-active ");
                        NotifyingService.notify();
                        // NotifyingService.notify();
                        //console.log($(proIwant[0]));
                        //$(proIwant[0]).trigger("mousedown");
                        //$(proIwant[0]).trigger('DOMContentLoaded');
                        //$(proIwant[0]).trigger('blur');
                    })
                    .on("drag", function (d) {
                        temp_drag
                            .style("left", function () {
                                return d3.event.x + "px"
                            })
                            .style("top", function () {
                                return (d3.event.y + 100) + "px"
                            });

                    })
                    .on("dragend", function (d) {
                        var proIwant = d3.selectAll("schema-list-item")
                            .data(Dataset.schema.fieldSchemas)
                            .filter(function (it) {
                                return it.field == d.brand;
                            })
                            .select('div')
                            .attr('class', 'schema-list-item ng-pristine ng-untouched ng-valid ui-droppable ui-droppable-disabled ng-empty');

                        Pills.dragStop;
                        Pills.dragStop;

                        var pos = temp_drag.node().getBoundingClientRect();
                        temp_drag.remove();
                        var tem_group = d3.selectAll(".shelf-group");
                        tem_group = tem_group[0];
                        var tem_group = tem_group.filter(function (d, i) {
                            var pos_g = d.getBoundingClientRect();
                            return (pos_g.top < pos.top && pos_g.bottom > pos.top && pos_g.left < pos.left && pos_g.right > pos.left)
                        });

                        try {
                            var chan = $(tem_group[0]).attr('channel-id').replace(/'/g, "");
                            // console.log(chan);
                            if (chan != null) {
                                Pills.set(chan, current_field);
                                Pills.listener.dragDrop(chan);
                                //.update(Spec.spec);
                            }
                        } catch (e) {
                        }
                        NotifyingService.notify();
                        d3.selectAll("div [d3-over='true']")
                            .attr('d3-over', 'false');


                        //var event = new Event('submit');  // (*)
                        //$(d3.select('.schema')[0]).dispatchEvent(event);
                        d3.selectAll('.field-drop')
                            .attr("class", "field-drop ng-pristine ng-untouched ng-valid ui-droppable ng-not-empty");
                    });

                var listitem = g_axis.selectAll(".line")
                    .data(brands)
                    .attr('x1', function (d) {
                        return x(0)
                    })//x(-d.pc1);})
                    .attr('y1', function (d) {
                        return x(0)
                    })//y(-d.pc2); })
                    .attr("x2", function (d) {
                        return x(d.pc1);
                    })
                    .attr("y2", function (d) {
                        return y(d.pc2);
                    })
                    .style("stroke", function (d) {
                        return color(d['brand']);
                    })
                    .style("stroke-width", '1px')
                    .on('mouseover', onMouseOverBrand)
                    .on('mouseleave', onMouseLeave);
                if (dimension == 0) {
                    listitem
                        .on("dblclick", function (d) {
                            var proIwant = d3.selectAll($("[id='" + d.brand + "']"))
                                .select('div').select('span');
                            $(proIwant[0]).trigger("dblclick");
                        })
                        .call(dragHandler);
                } else {
                    listitem
                        .on("dblclick", function (d) {
                            // to do
                        })
                        .on("dragstart", null)
                        .on("drag", null)
                        .on("dragend", null);
                }
                listitem.exit().remove();
                listitem
                    .enter().append("line")
                    .attr("class", "line square draggable")
                    .attr('x1', function (d) {
                        return x(0)
                    })//x(-d.pc1);})
                    .attr('y1', function (d) {
                        return x(0)
                    })//y(-d.pc2); })
                    .attr("x2", function (d) {
                        return x(d.pc1);
                    })
                    .attr("y2", function (d) {
                        return y(d.pc2);
                    })
                    .style("stroke", function (d) {
                        return color(d['brand']);
                    })
                    .style("stroke-width", '1px')
                    .on('mouseover', onMouseOverBrand)
                    .on('mouseleave', onMouseLeave);
                if (dimension == 0) {
                    listitem.on("dblclick", function (d) {
                        var proIwant = d3.selectAll($("[id='" + d.brand + "']"))
                            .select('div').select('span');
                        $(proIwant[0]).trigger("dblclick");
                    })
                        .call(dragHandler);
                } else {
                    listitem
                        .on("dblclick", function (d) {
                            // to do
                        })
                        .on("dragstart", null)
                        .on("drag", null)
                        .on("dragend", null);
                }
                var tip = d3.tip()
                    .attr('class', 'd3-tip tips ')
                    .offset([10, 20])
                    .direction('e')
                    .html(function (values, title) {
                        var str = ''
                        str += '<h3>' + (title.length == 1 ? 'Brand ' : '') + title + '</h3>'
                        str += "<table>";
                        for (var i = 0; i < values.length; i++) {
                            if (values[i].key != 'pc1' && values[i].key != 'pc2') {
                                str += "<tr>";
                                str += "<td>" + values[i].key + "</td>";
                                str += "<td class=pct>" + values[i].value + "</td>";
                                str + "</tr>";
                            }
                        }
                        str += "</table>";

                        return str;
                    });
                svg.call(tip);
                g_axis.selectAll('.place-label').remove();
                if (PCAplot.dim) {
                    var axis = g_axis.node();
                    axis.parentNode.appendChild(axis);

                    var arrangeLabels = function () {
                        var move = 1;
                        while (move > 0) {
                            move = 0;
                            g_axis.selectAll(".place-label")
                                .each(function () {
                                    var that = this,
                                        a = this.getBoundingClientRect();
                                    g_axis.selectAll(".place-label")
                                        .each(function () {
                                            if (this != that) {
                                                var b = this.getBoundingClientRect();
                                                if ((Math.abs(a.left - b.left) * 2 < (a.width + b.width)) &&
                                                    (Math.abs(a.top - b.top) * 2 < (a.height + b.height))) {
                                                    // overlap, move labels
                                                    var dx = (Math.max(0, a.right - b.left) +
                                                        Math.min(0, a.left - b.right)) * 0.01,
                                                        dy = (Math.max(0, a.bottom - b.top) +
                                                            Math.min(0, a.top - b.bottom)) * 0.02,
                                                        tt = d3.transform(d3.select(this).attr("transform")),
                                                        to = d3.transform(d3.select(that).attr("transform"));
                                                    move += Math.abs(dx) + Math.abs(dy);

                                                    to.translate = [to.translate[0] + dx, to.translate[1] + dy];
                                                    tt.translate = [tt.translate[0] - dx, tt.translate[1] - dy];
                                                    d3.select(this).attr("transform", "translate(" + tt.translate + ")");
                                                    d3.select(that).attr("transform", "translate(" + to.translate + ")");
                                                    a = this.getBoundingClientRect();
                                                }
                                            }
                                        });
                                });
                        }
                    }

                    var foci = [],
                        labels = [];

                    // Store the projected coordinates of the places for the foci and the labels
                    brands.forEach(function (d, i) {
                        var shifty = y(d.pc2);
                        shifty += (d.pc2 < 0) ? 15 : -5;
                        // foci.push({x: x(d.pc1), y: shifty});
                        labels.push({x: x(d.pc1), y: shifty, label: d.brand, anchor: (d.pc1 < 0 ? 'end' : 'start')});
                    });

                    var placeLabels = g_axis.selectAll('.place-label')
                        .data(labels)
                        .enter()
                        .append('text')
                        .attr('class', 'place-label')
                        .attr('text-anchor', function (d) {
                            return d.anchor
                        })
                        .attr('x', function (d) {
                            return d.x;
                        })
                        .attr('y', function (d) {
                            return d.y;
                        })
                        .text(function (d) {
                            return d.label.replace("Score", "");
                        })
                        .style("fill", function (d) {
                            return color(d.label);
                        })
                        .style("font-weight", "bold");

                    /*force.on("tick", function(e) {
                         var k = .1 * e.alpha;
                         labels.forEach(function(o, j) {
                             // The change in the position is proportional to the distance
                             // between the label and the corresponding place (foci)
                             o.y += (foci[j].y - o.y) * k;
                             o.x += (foci[j].x - o.x) * k;
                         });

                         // Update the position of the text element
                         g_axis.selectAll("text.place-label")
                             .attr("x", function(d) { return d.x; })
                             .attr("y", function(d) { return d.y; });
                     });

                     force.start();*/
                    arrangeLabels();
                }
                PCAplot.dataencde = data;
            }catch(e){console.log('Not enough dimension');}
            }
            return PCAplot};
        function getSpPoint(A,B,C){
            var x1=A.x, y1=A.y, x2=B.x, y2=B.y, x3=C.x, y3=C.y;
            var px = x2-x1, py = y2-y1, dAB = px*px + py*py;
            var u = ((x3 - x1) * px + (y3 - y1) * py) / dAB;
            var x = x1 + u * px, y = y1 + u * py;
            // var u = x3*scale_axis/dAB;
            var x = x1 + u * px, y = y1 + u * py;
            return {x:x, y:y}; //this is D
        }
        function rotate(x,y, dtheta) {

            var r = Math.sqrt(x*x + y*y);
            var theta = Math.atan(y/x);
            if (x<0) theta += Math.PI;

            return {
                x: r * Math.cos(theta + dtheta),
                y: r * Math.sin(theta + dtheta)
            }
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

        PCAplot.estimate = function(PCAresult,dim,dataref) {
            // choose main axis
            if (dim==0) {
                PCAplot.charts.length=0;
                Dataset.schema.fieldSchemas.forEach(function (d) {
                    var pca = PCAresult.find(function (it) {
                        return (it['brand'] == d.field)
                    });
                    d.extrastat = {
                        pc1: pca.pc1,
                        pc2: pca.pc2,
                        outlier: pca.outlier,
                    };
                });

                var recomen = [];
                var pca1_max = PCAresult.sort(function (a, b) {
                    return Math.abs(a.pc1) < Math.abs(b.pc1) ? 1 : -1
                })[0]['brand'];
                PCAresult.sort(function (a, b) {
                    return Math.abs(a.pc2) < Math.abs(b.pc2) ? 1 : -1
                });
                var pca2_max = PCAresult[0]['brand'] != pca1_max ? PCAresult[0]['brand'] : PCAresult[1]['brand'];
                recomen.push(pca1_max);
                recomen.push(pca2_max);
                Dataset.schema.fieldSchemas.sort(function (a, b) {
                    Math.abs(a.stats.modeskew) > Math.abs(b.stats.modeskew) ? -1 : 1});
                var mostskew = Dataset.schema.fieldSchemas.filter(function(d)  {
                    var r = false;
                    recomen.forEach(function(e)  {
                        r |= (e != d)
                    });
                    return r;
                })[0];
                Dataset.schema.fieldSchemas.sort(function(a, b) {
                    return ((a.extrastat.outlier) <(b.extrastat.outlier)) ? 1 : -1});
                // console.log(Dataset.schema.fieldSchemas);
                var mostoutlie = Dataset.schema.fieldSchemas.filter(function(d)  {
                    var r = false;
                    recomen.forEach(function(e)  {
                        r |= (e != d);
                    });
                    return r;
                })[0];
                var object1 = Dataset.schema.fieldSchema(pca1_max);
                var object2 = Dataset.schema.fieldSchema(pca2_max);

                drawGuideplot(object1, 'PCA1');
                drawGuideplot(object2, 'PCA2');
                drawGuideplot(mostskew, 'skewness');
                drawGuideplot(mostoutlie, 'outlier');
            }
            else {
                PCAplot.charts.length=0;


                PCAplot.dataref = dataref.map(function(d){
                    return {fieldDefs: [Dataset.schema.fieldSchema(d.label[0]),Dataset.schema.fieldSchema(d.label[1])],
                        scag: d,};
                    });
                var objects = {};
                var tops = PCAresult.map(function(brand){
                    var type = brand.brand;
                    var topitem = dataref.sort(function (a,b){
                        return a[type]<b[type]?1:-1;
                    })[0].label;
                    if (objects[topitem[0]] === undefined || objects[topitem[0]][topitem[1]]=== undefined){
                        objects[topitem[0]] = {}||objects[topitem[0]];
                        var newobs =  {
                            type: type,
                            fieldDefs:[Dataset.schema.fieldSchema(topitem[0]),Dataset.schema.fieldSchema(topitem[1])],};
                        objects[topitem[0]][topitem[1]] = newobs;
                        return {fields: newobs.fieldDefs,
                            type: type,
                            dataref: PCAplot.dataref,
                        score: dataref[0][type]};
                    }
                });
                tops.sort(function(a,b){
                    return a.score<b.score?1:-1;
                });
                //console.log(tops.length>4?4:tops.length);
                for (var d = 0; d < (tops.length>4?4:tops.length); d++)
                    drawGuideplot(tops[d].fields, tops[d].type,PCAplot.dataref);


            }
        };
        function mark2plot (mark,spec,object){
            switch (mark) {
                case 'bar': barplot(spec, object); break;
                case 'tick': dashplot(spec, object); break;
                case 'area': areaplot(spec, object); break;
                case 'boxplot': boxplot(spec, object); break;
                case 'point': pointplot(spec, object); break; // 2D
                case 'hexagon': pointplot(spec, object,'hexagon'); break;
                case 'leader': pointplot(spec, object,'leader'); break;
                case 'contour': pointplot(spec, object,'contour'); break;
                case 'scatter3D': scatterplot(spec,object); break;
                case 'radar': radarplot(spec,object); break;
            }
        }

        var guideon = function(prop,mspec){
            //console.log(prop);
            //prop.charts = Dataset.schema.fieldSchemas.sort(prop.ranking)
            PCAplot.types =  support[prop.dim].types;
            PCAplot.marks = support[prop.dim].marks;
            // PCAplot.spec = mspec;
            prop.charts = PCAplot.data[prop.dim].sort(prop.ranking)
                .map(function(d){return prop.plot((d.fieldDefs||d ),prop.mark,prop.mspec) });
            prop.previewcharts = prop.charts.map(function (d) {
                var thum =_.cloneDeep(d);
                // console.log(d);
                thum.vlSpec.config = {
                    cell: {
                        width: 100,
                        height: prop.dim?100:30
                    },
                    axis: {
                        grid: false,
                        //ticks: false,
                        labels: false,
                        titleOffset: 20
                    },
                    overlay: {line: true},
                    scale: {useRawDomain: true},
                    displayModeBar: false,
                    colorbar: false
                };
                if (d.fieldSet[0].type!="temporal"){
                    thum.vlSpec.config.axis.ticks = false;
                }
                return thum;});
            var pos = 0;
            if(prop.dim!=PCAplot.dim){
                var axis = prop.mspec.config.typer.fieldDefs;
                pos = PCAplot.data[prop.dim].findIndex(function(d){
                    var f= true;
                    var ff=false;
                    d.fieldDefs.forEach(function(i){
                        axis.forEach(function(fi){ff=ff||(fi.field==i.field)});
                        f = f&&ff;});
                    return f; });
                console.log(pos+': '+axis);
            }
            PCAplot.mspec = prop.charts[pos];
            prop.pos = [pos];
            PCAplot.limit = pos>10?pos:10;


            PCAplot.updateguide(prop);
        };
        function drawGuideplot (object,type,dataref) {
            if (dataref == undefined)
                dataref = Dataset.schema.fieldSchemas;
            var spec = spec = _.cloneDeep(instantiate() || PCAplot.spec);
            //spec.data = Dataset.dataset;
            spec.config = {
                cell: {
                    width: PCAplot.dim?100:200,
                    height: PCAplot.dim?100:30,
                },
                axis: {
                    grid: false,
                    ticks: false,
                    titleOffset: 20
                },
                overlay: {line: true},
                scale: {useRawDomain: true}
            };
            mark2plot (type2mark(type),spec,object);
            var query = getQuery(spec);
            var output = cql.query(query, Dataset.schema);
            PCAplot.query = output.query;
            var topItem = output.result.getTopSpecQueryModel();
            PCAplot.chart = Chart.getChart(topItem);
            PCAplot.chart.vlSpec.config.displayModeBar = false;
            PCAplot.chart.vlSpec.config.colorbar = false;
            PCAplot.chart.vlSpec.config.staticPlot= true;
            PCAplot.chart.prop = {
                mspec:spec,
                type: type,
                mark: spec.mark,
                ranking: getranking(type),
                plot: drawGuideexplore,
                dim: PCAplot.dim};

            PCAplot.chart.guideon = guideon;
                PCAplot.charts.push(PCAplot.chart);
        };

        PCAplot.madeprop = function (spec){
            var type = spec.config.typer.type;
            var dim = spec.config.typer.dim;
            var mark = spec.config.typer.mark;
            var prop = {
                mspec:spec,
                type: type,
                mark: mark,
                ranking: getranking(type),
                plot: drawGuideexplore,
                dim: dim};
            guideon(prop);
            PCAplot.updateguide(prop);
        };

        PCAplot.alternativeupdate = function(mspec){
            mspec = _.cloneDeep(mspec || PCAplot.mspec);
            if (PCAplot.dataref.length ==0|| PCAplot.dataref== null){
                var data = [];
                var datarefn = [];
                var idlabel=[];
                data = PCAplot.data[0].map(function(d){
                    var tem = {field: d.field};
                    tem[d.field] = d.scag;
                    return tem;});
                var newdata=[];
                data.forEach(function(d){
                    for (var e in d[d.field]) {
                        if (d[d.field][e].invalid!=1){
                            idlabel.push([d.field,e]);
                            newdata.push(d[d.field][e]);}
                    }
                });
                data = newdata.filter(function(d){return !d.invalid});
                data.forEach(function(d,i){d.label = idlabel[i]});
                datarefn = _.cloneDeep(data);
                PCAplot.dataref = datarefn.map(function(d){
                    return {fieldDefs: [Dataset.schema.fieldSchema(d.label[0]),Dataset.schema.fieldSchema(d.label[1])],
                        scag: d,};
                });
                PCAplot.data[1] =PCAplot.dataref;
            }
            //var fieldsets = mspec.fieldSet.map(function(d){return d.field}).filter(function(d){return d!="count"&&d!="*"});
            var fieldsets = mspec.fieldSet.map(function(d){return d.field}).filter(function(d){return d!="count"&&d!="*"});
            if (fieldsets.length<2) {
                var possible = PCAplot.dataref.filter(function (d) {
                    var ff = true;
                    var f = false;
                    fieldsets.forEach(function (it) {
                        d.fieldDefs.forEach(function (m) {
                            f = (f || (m.field == it));
                        })
                        ff = ff && f;
                    })
                    return ff;
                });
                if (possible.length != 0) {
                    var topitem = support[PCAplot.dim + 1].types.map(function (d) {
                        return possible.sort(function (a, b) {
                            return (a.scag[d] < b.scag[d]) ? 1 : -1;
                        })[0];
                    });
                    var unique = [];
                    var uniquetype = [];
                    topitem.forEach(function (d, i) {
                        if (unique.filter(function (u) {
                                return u == d;
                            }).length == 0) {
                            unique.push(d);
                            uniquetype.push(support[PCAplot.dim + 1].types[i]);
                        }
                    });
                    var charts = uniquetype.map(function (d, i) {
                        return {v: unique[i], type: d}
                    })
                        .map(function (d) {
                            var spec = {};
                            //spec.data = Dataset.dataset;
                            spec.config = {
                                /*cell: {
                                    width: PCAplot.dim?100:200,
                                    height: PCAplot.dim?100:30,
                                },*/
                                axis: {
                                    grid: false,
                                    ticks: false,
                                    titleOffset: 20
                                },
                                overlay: {line: true},
                                scale: {useRawDomain: true}
                            };
                            //mark2plot (type2mark(d.type),spec,d.v.fieldDefs);
                            mark2plot(mark2mark(mspec.vlSpec.mark, PCAplot.dim), spec, d.v.fieldDefs);
                            var query = getQuery(spec);
                            var output = cql.query(query, Dataset.schema);
                            PCAplot.query = output.query;
                            var topItem = output.result.getTopSpecQueryModel();
                            var temc = Chart.getChart(topItem);
                            temc.vlSpec.config.typer = {type: d.type,mark: mark2mark(mspec.vlSpec.mark, PCAplot.dim)
                                ,dim: d.v.fieldDefs.length-1, fieldDefs:d.v.fieldDefs};
                            return temc;

                        });
                    PCAplot.alternatives = [{'charts': charts}];
                }
                else {
                    PCAplot.alternatives.length = 0;
                }
            }
            else if (fieldsets.length>1) {
            var possible = PCAplot.dataref.filter(function (d){
                var ff= false;
                var f=false;
                fieldsets.forEach(function(it){
                    d.fieldDefs.forEach(function(m){f=(f||(m.field==it)); })
                    ff=ff||f;});
                return ff;});
            possible = possible.filter(function (d){
                var ff= true;
                var f=false;
                fieldsets.forEach(function(it){
                    d.fieldDefs.forEach(function(m){f=(f||(m.field==it)); })
                    ff=ff&&f;});
                return !ff;});
            var topitem = support[1].types.map(function (d) {
                return possible.sort(function (a, b) {
                    return (a[d] < b[d]) ? 1 : -1;
                })[0];
            });
            var unique = [];
            var uniquetype = [];
            topitem.forEach(function (d, i) {
                if (unique.filter(function (u) {
                        return u == d;
                    }).length == 0) {
                    unique.push(d);
                    uniquetype.push(support[fieldsets.length].types[0]);
                }
            });
            unique.forEach(function(d){
                var newf = fieldsets.map(function(f){
                    return Dataset.schema.fieldSchema(f);});
                Array.prototype.push.apply(newf,d.fieldDefs.filter(function(fe){
                    var ff = true;
                    fieldsets.forEach(function(fs){ff=ff&&fs!=fe.field});
                    return ff;
                }));
                d.fieldDefs=newf});
            var charts = uniquetype.map(function (d, i) {
                return {v: unique[i], type: d}
            })
                .map(function (d) {
                    var spec = {};

                    spec.config = {

                        axis: {
                            grid: false,
                            ticks: false,
                            titleOffset: 20
                        },
                        overlay: {line: true},
                        scale: {useRawDomain: true}
                    };
                    //mark2plot (type2mark(d.type),spec,d.v.fieldDefs);
                    mark2plot(mark2mark(mspec.vlSpec.mark, PCAplot.dim), spec, d.v.fieldDefs);
                    var query = getQuery(spec);
                    var output = cql.query(query, Dataset.schema);
                    PCAplot.query = output.query;
                    var topItem = output.result.getTopSpecQueryModel();
                    return Chart.getChart(topItem);

                });
            PCAplot.alternatives = [{'charts': charts}];
            }else{
                PCAplot.alternatives.length=0;}

        };

        PCAplot.updateSpec = function(prop){
            PCAplot.types =  support[prop.dim].types;
            PCAplot.marks = support[prop.dim].marks;
            var nprop = _.cloneDeep(prop);
            nprop.ranking = getranking(prop.type);
            mark2plot (prop.mark,nprop.mspec,Dataset.schema.fieldSchemas.slice(0,prop.dim+1));
            nprop.charts.length = 0;
            var dataref = nprop.dim?PCAplot.dataref:Dataset.schema.fieldSchemas;
            nprop.charts = dataref.sort(nprop.ranking)
                .map(function(d) {return drawGuideexplore((d.fieldDefs||d),nprop.mark,nprop.mspec) });
            //while (nprop[nprop.length-1])
            nprop.previewcharts = nprop.charts.map(function(d) {
                var thum =_.cloneDeep(d);
                thum.vlSpec.config = {
                    cell: {
                        width: 100,
                        height: nprop.dim?100:30
                    },
                    axis: {
                        grid: false,
                        // ticks: false,
                        labels: false,
                        titleOffset: 20
                    },
                    overlay: {line: true},
                    scale: {useRawDomain: true},
                    displayModeBar: false,
                    colorbar: false,
                };
                if (d.fieldSet[0].type!="temporal"){
                    thum.vlSpec.config.axis.ticks = false;
                }
                return thum;});
            nprop.pos = 0;
            PCAplot.updateguide(nprop);
        };
        var ran = 0;
        function mark2mark(oldmark,dim){
            var pos = 0;
            support[dim].marks.forEach(function(d,i){
                if (d==oldmark){
                    pos= i; return ;}});
            return support[dim+1].marks[pos>support[dim+1].marks.length-1?0:pos];
        }
        function type2mark (type){
            switch (type) {
                case 'PCA1': return 'tick';
                case 'outlier': return 'boxplot';
                case 'PCA2': return 'area';
                case 'skewness': return 'bar';

                case 'outlyingScore':
                case 'spaseScore':
                case 'convexScore':
                case 'skewedScore':
                case 'clumpyScore':
                case 'striatedScore':
                case 'skinnyScore':
                case 'stringyScore':
                case 'monotonicScore':
                    var mark = support[1].marks[ran];
                    ran = ran>2?0:(ran+1);
                    return mark;
                //case 'outlying SC'
                case 'com':
                    return 'scatter3D'

                default: return 'point';
            }
        }

        function getranking(type){
            switch (type) {
                case 'PCA1': return function (a,b){return Math.abs(a.extrastat.pc1) < Math.abs(b.extrastat.pc1) ? 1:-1};
                    break;
                case'skewness': return function (a,b){return Math.abs(a.stats.modeskew) < Math.abs(b.stats.modeskew) ? 1:-1};
                    break;
                case'PCA2': return function (a,b){return Math.abs(a.extrastat.pc2) < Math.abs(b.extrastat.pc2) ? 1:-1};
                    break;
                case'outlier': return function (a,b){return a.extrastat.outlier < b.extrastat.outlier? 1:-1};
                    break;
                default: return function (a,b){return (a.scag[type] < b.scag[type]) ? 1:-1};
                    break;
            }
        }
        var drawGuideexplore = function (object,type,mspec) {
            var spec = _.cloneDeep(mspec);
            //spec.data = Dataset.dataset;
            spec.config = {
                overlay: {line: true},
                scale: {useRawDomain: true}
            };

            mark2plot(type,spec,object);
            /*switch (type) {
                case 'bar': barplot(spec, object); break;
                case 'tick': dashplot(spec, object); break;
                case 'area': areaplot(spec, object); break;
                case 'boxplot': boxplot(spec, object); break;
            }*/

            var query = getQuery(spec);
            var output = cql.query(query, Dataset.schema);
            var topItem = output.result.getTopSpecQueryModel();
            return Chart.getChart(topItem);
        };
        // PCAplot.alternatives = Alternatives.getHistograms(null, PCAplot.chart, null);

        function barplot(spec,object) {
            spec.mark = "bar";
            spec.encoding = {
                x: {field: object.field, type: object.type},
                y: {aggregate: "count", field: "*"}
            };
            if (object.type==="quantitative"){
                spec.encoding.x.bin ={};
                spec.encoding.y.type = object.type;
            }else if(object.primitiveType ==="string"){
                spec.encoding.y.type = "quantitative";
            }else if (object.type==="temporal"){
                spec.encoding.x.bin ={};
                //spec.encoding.x.type = "ordinal";
                spec.encoding.x.timeUnit = "year";
                spec.encoding.y.type = "quantitative";
            }
            //console.log(spec);
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
                x: {field: object.field, type: object.type},
                y: {aggregate: "count", field: "*"}
            };
            if (object.type==="quantitative"){
                spec.encoding.x.bin ={};
                spec.encoding.y.type = object.type;
            }else if(object.primitiveType ==="string"||object.type==="temporal"||object.primitiveType ==="integer"){
                spec.encoding.y.type = "quantitative";
            }
        }
        function boxplot(spec,object) {
            spec.mark = "boxplot";
            spec.encoding = {
                x: { field: object.field, type: object.type}
            };
        }

        function pointplot(spec,objects,extramark) {
            spec.mark = extramark||"point";
            spec.encoding = {
                x: { field: objects[0].field, type: objects[0].type},
                y: { field: objects[1].field, type: objects[1].type},
            };
            spec.config.mark= {"filled": true, "opacity":1};
        }

        function scatterplot(spec,objects){
            spec.mark = "scatter3D";

            spec.encoding = {
                x: { field: objects[0].field, type: objects[0].type},
                y: { field: objects[1].field, type: objects[1].type},
                x2: { field: objects[2].field, type: objects[2].type},
            };
        }
        function radarplot(spec,objects){
            spec.mark = "radar";
            spec.encoding = {
                x: { field: objects[0].field, type: objects[0].type},
                y: { field: objects[1].field, type: objects[1].type},
                x2: { field: objects[2].field, type: objects[2].type},
            };
            //spec.layer = objects.map(function(o){return {encoding:{x: { field: o.field, type: o.type}}}});
        }


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

        PCAplot.updateguide= function(prop) {
            prop = _.cloneDeep(prop || PCAplot.prop);
            prop.mspec.config={};
            // delete prop.mspec.model;
            PCAplot.prop = prop;
        };

        function scagnoticscore (field1,field2){
            var matrix = Dataset.data.map(function(d){return [d[field1],d[field2]]});
            try {
                var scag = scagnostics(matrix,'leader',40);
                if (!isNaN(scag.skinnyScore))
                    return {
                        'outlyingScore': scag.outlyingScore,
                        'skewedScore': scag.skewedScore,
                        'sparseScore':scag.sparseScore,
                        'clumpyScore':scag.clumpyScore,
                        'striatedScore':scag.striatedScore,
                        'convexScore':scag.convexScore,
                        'skinnyScore':scag.skinnyScore,
                        'stringyScore':scag.stringyScore,
                        'monotonicScore':scag.monotonicScore,};
                else return {
                    'outlyingScore': 0,
                    'skewedScore': 0,
                    'sparseScore':0,
                    'clumpyScore':0,
                    'striatedScore':0,
                    'convexScore':0,
                    'skinnyScore':0,
                    'stringyScore':0,
                    'monotonicScore':0,
                    invalid:1,
                };

            }catch(e){
                return {
                    'outlyingScore': 0,
                    'skewedScore': 0,
                    'sparseScore':0,
                    'clumpyScore':0,
                    'striatedScore':0,
                    'convexScore':0,
                    'skinnyScore':0,
                    'stringyScore':0,
                    'monotonicScore':0,
                    invalid:1,
                };
            }
        }

        PCAplot.calscagnotic = function (primfield){
            primfield.forEach(function(selectedfield) {
                Dataset.schema.fieldSchemas.forEach(function(d){
                    if ((d.field!==selectedfield) && (Dataset.schema._fieldSchemaIndex[selectedfield].scag==undefined||Dataset.schema._fieldSchemaIndex[selectedfield].scag[d.field] ===undefined) && (d.scag ===undefined ||(d.scag[selectedfield]===undefined))){
                        var scag = scagnoticscore(selectedfield,d.field);
                        /*if (d.scag === undefined)
                            d.scag = {};
                        d.scag[selectedfield] = scag;*/
                        if (Dataset.schema.fieldSchema(selectedfield).scag === undefined)
                            Dataset.schema.fieldSchema(selectedfield).scag ={};
                        Dataset.schema.fieldSchema(selectedfield).scag[d.field] = scag;
                        // console.log(selectedfield+" "+d.field);
                    }
                })});
            //console.log (Dataset.schema.fieldSchema(primfield[0]));
        };

        PCAplot.updateAlternative= function (prop,dataref){


        };
        PCAplot.reset = function(hard) {
            var spec = instantiate();
            spec.transform.filter = FilterManager.reset(null, hard);
            PCAplot.spec = spec;
            PCAplot.firstrun =true;
            PCAplot.charts.length = 0;
            PCAplot.chart=null;
            PCAplot.prop=null;
            PCAplot.alternatives=[];
            PCAplot.dataref = [];
            PCAplot.mspec = null;

            //PCAplot.plot(Dataset.data);
        };
        PCAplot.reset();
        Dataset.onUpdate.push(function() {
            PCAplot.reset(true);
            //PCAplot.plot(Dataset.data);
        });
        return PCAplot;
    });