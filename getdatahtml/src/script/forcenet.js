function forcegraph(selector) {
    var minfreq = 3;
    var svg2 = d3.select(selector).select('svg');
    var width = $(selector).width();
    var height = $(selector).height();
    svg2.attrs({width: width, height: height});
    var force2 = d3.forceSimulation()
        .force("charge", -180)
        .force("linkDistance", 80)
        .force("gravity", 0.15)
        .force("alpha", 0.1)
        .force("center", d3.forceCenter(width / 2, height / 2));
    var nodes2,links2;
    computeNodes(nodes2,links2);

/// The second force directed layout ***********


    force2.nodes(nodes2)
        .links(links2)
        .start();


    var link2 = svg2.selectAll(".link2")
        .data(links2)
        .enter().append("line")
        .attr("class", "link2")
        .style("stroke", "#777")
        .style("stroke-width", function (d) {
            return 0.2 + linkScale(d.count);
        });

    var node2 = svg2.selectAll(".nodeText2")
        .data(nodes2)
        .enter().append("text")
        .attr("class", ".nodeText2")
        .text(function (d) {
            return d.name
        })
        .attr("dy", ".35em")
        .style("fill", function (d) {
            return getColor(d.group, d.max);
        })
        .style("text-anchor", "middle")
        .style("text-shadow", "1px 1px 0 rgba(55, 55, 55, 0.6")
        .style("font-weight", function (d) {
            return d.isSearchTerm ? "bold" : "";
        })
        .attr("dy", ".21em")
        .attr("font-family", "sans-serif")
        .attr("font-size", "12px");

    force2.on("tick", function () {
        link2.attr("x1", function (d) {
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


        node2.attr("x", function (d) {
            return d.x;
        })
            .attr("y", function (d) {
                return d.y;
            });
    });

}

function computeNodes(nodes2,links2) {
    var termArray = termscollection_org;
    var nested_data = d3.nest()
        .key(function (d) {
            return d.term;
        })
        .key(function (d) {
            return d.title;
        })
        .rollup(function (words) {
            return words[0];
        })
        .entries(termscollection_org);
    nested_data.sort((a,b)=> b.values.length - a.values.length);
    var numNode = Math.min(180, nested_data.length);
    var numNode2 = Math.min(numNode*3, nested_data.length);
    nested_data = nested_data.slice(0,numNode2);
    console.log("nested_data.length = "+nested_data.length);





    // check substrings of 100 first terms
    console.log("termArray.length = "+termArray.length);



}