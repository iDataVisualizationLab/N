'use strict'
angular.module('voyager2')
    .component('biPlot', {
            //template: "<svg id =\'bi-plot\' width=\'100%\' class=\"\"></svg>",
        templateUrl: 'components/d3-biplot/bi-plot.html',
            controller: function ($scope, Dataset) {
                d3.selectAll('.background-biplot')
                    .style('fill','#ffffff')
                    .attr('width',$('.biplot').width())
                    .attr('height',$('.biplot').width());
                /*Dataset.update(Dataset.dataset).then(function(){
                d3.selectAll('g').delete;
            var data = Dataset.data;
            if (typeof data !=="undefined" ) {
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



                var svg = d3.select("svg")
                    .attr("width", width + margin.left + margin.right)
                    .attr("height", height + margin.top + margin.bottom)
                    .append("g")
                    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
                var brand_names = Object.keys(data[0]);  // first row of data file ["ATTRIBUTE", "BRAND A", "BRAND B", "BRAND C", ...]

                var inputdata = Array.from(data);
                var matrix = data2Num(inputdata);

                var pca = new PCA();
                 console.log(brand_names);
                matrix = pca.scale(matrix,true,true);

                var pc = pca.pca(matrix,2)

                var A = pc[0];  // this is the U matrix from SVD
                var B = pc[1];  // this is the dV matrix from SVD
                var maxxy=0;
                A.forEach(function(d){maxxy=Math.max(maxxy,Math.abs(d[0]),Math.abs(d[1]));});
                x.domain([-maxxy,maxxy]).nice();
                y.domain([-maxxy,maxxy]).nice();

                data.map(function(d,i){
                    label: d[brand_names[0]],
                        d.pc1 = A[i][0];
                    d.pc2 = A[i][1];
                });
                var brands = brand_names
                    .map(function(key, i) {
                        return {
                            brand: key,
                            pc1: B[i][0]*4,
                            pc2: B[i][1]*4
                        }
                    });

                function rotate(x,y, dtheta) {

                    var r = Math.sqrt(x*x + y*y);
                    var theta = Math.atan(y/x);
                    if (x<0) theta += Math.PI;

                    return {
                        x: r * Math.cos(theta + dtheta),
                        y: r * Math.sin(theta + dtheta)
                    }
                }


                data.map(function(d) {
                    var xy = rotate(d.pc1, d.pc2, angle);
                    d.pc1 = xy.x;
                    d.pc2 = xy.y;
                });

                brands.map(function(d) {
                    var xy = rotate(d.pc1, d.pc2, angle);
                    d.pc1 = xy.x;
                    d.pc2 = xy.y;
                });




                var legend = svg.selectAll(".legend")
                    .data(color.domain())
                    .enter().append("g")
                    .attr("class", "legend")
                    .attr("transform", function(d, i) { return "translate(0," + i * 20 + ")"; });

                legend.append("rect")
                    .attr("x", width - 18)
                    .attr("width", 18)
                    .attr("height", 18)
                    .style("fill", color);

                legend.append("text")
                    .attr("x", width - 24)
                    .attr("y", 9)
                    .attr("dy", ".35em")
                    .style("text-anchor", "end")
                    .text(function(d) { return d; });

                svg.selectAll(".dot")
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

                svg.selectAll("circle.brand")
                    .data(brands)
                    .enter().append("rect")
                    .attr("class", "square")
                    .attr("width", 7)
                    .attr('height',7)
                    .attr("x", function(d) { return x(d.pc1)-3.5; })
                    .attr("y", function(d) { return y(d.pc2)-3.5; })
                    .style("fill", function(d) {
                        return color(d['brand']); })
                    .on('mouseover', onMouseOverBrand)
                    .on('mouseleave', onMouseLeave);


                svg.selectAll("text.brand")
                    .data(brands)
                    .enter().append("text")
                    .attr("class", "label-brand")
                    .attr("x", function(d) { return x(d.pc1) + 10; })
                    .attr("y", function(d) { return y(d.pc2) + 0; })
                    .text(function(d) { return d['brand']})


                svg.selectAll(".line")
                    .data(brands)
                    .enter().append("line")
                    .attr("class", "square")
                    .attr('x1', function(d) { return x(-d.pc1);})
                    .attr('y1', function(d) { return y(-d.pc2); })
                    .attr("x2", function(d) { return x(d.pc1); })
                    .attr("y2", function(d) { return y(d.pc2); })
                    .style("stroke", function(d) { return color(d['brand']); })
                    .on('mouseover', onMouseOverBrand)
                    .on('mouseleave', onMouseLeave);
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

                svg.call(tip);
                // draw line from the attribute a perpendicular to each brand b
                function onMouseOverAttribute(a,j) {
                    brands.forEach(function(b, idx) {
                        var A = { x: 0, y:0 };
                        var B = { x: b.pc1,  y: b.pc2 };
                        var C = { x: a.pc1,  y: a.pc2 };

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
                        .style("stroke", function(d) { return "#ffffff"});

                    delete a.D;
                    var tipText = d3.entries(a);
                    tip.show(tipText, a);
                };

// draw line from the brand axis a perpendicular to each attribute b
                function onMouseOverBrand(b,j) {

                    data.forEach(function(a, idx) {
                        var A = { x: 0, y:0 };
                        var B = { x: b.pc1,  y: b.pc2 };
                        var C = { x: a.pc1,  y: a.pc2 };

                        a.D = getSpPoint(A,B,C);
                    });

                    svg.selectAll('.tracer')
                        .data(data)
                        .enter()
                        .append('line')
                        .attr('class', 'tracer')
                        .attr('x1', function(a,i) { return x(a.D.x);  })
                        .attr('y1', function(a,i) { return y(a.D.y);  })
                        .attr('x2', function(a,i) { return x(a.pc1);  })
                        .attr('y2', function(a,i) { return y(a.pc2); })
                        .style("stroke", function(d) { return "#aaa"});

                    var tipText = data.map(function(d) {
                        return {key: d[brand_names[0]], value: d[b['brand']] }
                    })
                    tip.show(tipText, b.brand);
                };

                function onMouseLeave(b,j) {
                    svg.selectAll('.tracer').remove()
                    tip.hide();
                };






            /*svg.selectAll("text.attr")
                .data(data)
                .enter().append("text")
                .attr("class", "label-attr")
                .attr("x", function(d,i ) { return x(d.pc1)+4 ; })
                .attr("y", function(d ,i) { return y(d.pc2) + (label_offset[d.type]||0); })
                .text(function(d,i) { return d.type})*/


           /* function getSpPoint(A,B,C){
                var x1=A.x, y1=A.y, x2=B.x, y2=B.y, x3=C.x, y3=C.y;
                var px = x2-x1, py = y2-y1, dAB = px*px + py*py;
                var u = ((x3 - x1) * px + (y3 - y1) * py) / dAB;
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

                    /*var matrix = input.map(function (d,i){
                        return Object.keys(d).map(function(k){
                            return clone[k].find(function(it){return it.key == output[i][k]}).newindex;
                        });
                    });
                    return matrix;
                    //return output.map(function(d){return Object.keys(d).map(function(i){return d[i]})});
                }
        }});
*/

}});
console.log("here");