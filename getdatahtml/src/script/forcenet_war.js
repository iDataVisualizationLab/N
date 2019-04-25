let calforce = new Worker ('src/script/force_cal_worker.js');
calforce.addEventListener('message',({data})=> {
    switch (data.action) {
        case 'computeNodes':
            var svg2main = d3.select(selector).select('svg');
            var margin = { top: -5, right: -5, bottom: -5, left: -5 },
                width = $(selector).width() - margin.left - margin.right,
                height = $(selector).height() - margin.top - margin.bottom;

            svg2main.attrs({width: width, height: height});
            svg2main.select('g').remove();
            var svg2 = svg2main.append('g')
                .attr("class", "focus")
                .attr("transform", "translate(" + margin.left + "," + margin.right + ")");
            var rect = svg2.append("rect")
                .attr("width", width)
                .attr("height", height)
                .style("fill", "none")
                .style("pointer-events", "all");
            var collisionForce = rectCollide()
                .size(function (d) {
                    return [d.size.w, d.size.h] }).strength(0.8);

            // computeNodes();
            var linkScale = d3.scaleLinear()
                .range([0.1, 3])
                .domain([Math.round(mainconfig.minlink)-0.4, Math.max(d3.max(links2,d=>d.count),10)]);
            var drag = d3.drag()
                .subject(function (d) { return d; })
                .on("start", dragstarted)
                .on("drag", dragged)
                .on("end", dragended);

            var zoom = d3.zoom()
                .scaleExtent([0, 10])
                .on("zoom", zoomed);

            svg2.call(zoom);


/// The second force directed layout ***********

            var container = svg2.append("g");



            var link2 = container.selectAll(".link2")
                .data(links2)
                .enter().append("line")
                .attr("class", "link2")
                .style("stroke", "black")
                .style("stroke-opacity", 0.3)
                .style("stroke-width", function (d) {
                    return 0.3 + linkScale(d.count);
                });
            var scalefomtsize = d3.scaleLinear().domain(d3.extent(nodes2,d=>d.frequency)).range([12,25]);
            var node2 = container.selectAll(".nodeText2")
                .data(nodes2)
                .enter().append("g");

            node2.append("text")
                .attr("class", "nodeText2")
                .text(function (d) {
                    return d.key;
                })
                .attr("dy", ".35em")
                .style("fill", function (d) {
                    return color(categories.indexOf(d.group));
                })
                .style("text-anchor", "middle")
                .style("font-weight", function (d) {
                    return d.isSearchTerm ? "bold" : "";
                })
                .attr("dy", ".21em")
                .attr("font-family", "sans-serif")
                .attr("font-size", d=> scalefomtsize(d.frequency))
                .on('contextmenu', function(d){
                    d3.event.preventDefault();
                    $(searchbox).val(d.key);
                    M.Sidenav.getInstance($(selector)).close();
                    setTimeout(function () {
                        // do calculations
                        // update graph
                        // clear spinner
                        searchWord();
                    }, 0);
                });
            node2.call(drag);
            node2.nodes().forEach(d=>{
                let e= d3.select(d).node().getBoundingClientRect();
                d.__data__.size = {w: e.width,h: e.height*2};
            });
            var force2 = d3.forceSimulation()
                .force("charge", d3.forceManyBody().strength(-20 ))
                .force("gravity", d3.forceManyBody(0.15))
                .force('collision',collisionForce)
                .alpha(1)
                .force("center", d3.forceCenter(width / 2, height / 2))
                .force("link", d3.forceLink().id(function(d) { return d.key }).distance(70));
            force2.nodes(nodes2);
            force2.force("link").links(links2);
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


                node2
                    .attr('transform', d => `translate(${d.x},${d.y})`);
            });
            zoom.scaleTo(svg2, 0.5);
        function zoomed() {
            const currentTransform = d3.event.transform;
            container.attr("transform", currentTransform);
            //slider.property("value", currentTransform.k);
        }

        function dragstarted(d) {
            d3.select(this).classed("dragging", true);
            if (!d3.event.active) force2.alphaTarget(0.3).restart();
            d.fx = d.x;
            d.fy = d.y;
        }

        function dragged(d) {
            d.fx = d3.event.x;
            d.fy = d3.event.y;
            // d3.select(this).attr('transform', d => {
            //     d.x = d3.event.x;
            //     d.y = d3.event.y;
            //     return 'translate('+ d.x+','+d.y+')'});
        }

        function dragended(d) {
            d3.select(this).classed("dragging", false);
            if (!d3.event.active) force2.alphaTarget(0);
            d.fx = null;
            d.fy = null;
        }
            break;
    }
});
function forcegraph(selector,searchbox) {
    calforce.postMessage({action: 'computeNodes',input: {term: termscollection_org, config: mainconfig}});
}
function computeNodes(termscollection_org) {
    var nested_data = d3.nest()
        .key(function (d) {
            return d.category;
        })
        .key(function (d) {
            return d.term;
        })
        .rollup(function (words) {
            return {
                term: words[0].term,
                category: words[0].category,
                frequency: d3.sum(words,d=>d.frequency),
                articleMap: d3.nest().key(d=>d.title).entries(words).map(d=>d.key)
            };
        })
        .entries(termscollection_org);
    var unquieTerm = d3.sum(nested_data,d=>d.values.length);
    var numNode = Math.min(15, unquieTerm);
    var numNode2 = Math.min(numNode*2, unquieTerm);
    nested_data.forEach(c=> {
        c.values = c.values.sort((a, b) => b.value.frequency - a.value.frequency)
            .slice(0, c.key==="NUMBER"? numNode2*2:numNode2)
            .filter(d => d.value.frequency > mainconfig.minfreq)
    });

    console.log("net node = "+d3.sum(nested_data,d=>d.values.length));

    var collection = [];
    nested_data.forEach(d=> d.values.forEach(t=>collection.push({titles:t.value.articleMap,term:{key: t.key,category: t.value.category, frequency: t.value.frequency}})));


    nodes2 = [];
    collection.forEach(d=> { nodes2.push({key: d.term.key, frequency: d.term.frequency,group: d.term.category})});
    console.log("nodes2.length = "+nodes2.length);
    var linkmap={};
    collection.forEach((t,i)=>{
        for (var j=i+1;j<collection.length;j++){
            const sameArticle = _.intersection(t.titles,collection[j].titles);
            if (sameArticle) {
                var temp = linkmap[collection[i].term.key + "___" + collection[j].term.key] || linkmap[collection[j].term.key + "___" + collection[i].term.key];
                if (temp === undefined) {
                    linkmap[collection[i].term.key + "___" + collection[j].term.key] = {
                        sourcedata: collection[i].term,
                        source: collection[i].term.key,
                        target: collection[j].term.key,
                        targetdata: collection[j].term,
                        count: sameArticle.length
                    };
                }
                else
                    temp.count += sameArticle.length;
            }
        }
    });


    links2 = Object.keys(linkmap).map(d=> linkmap[d]);
    links2.sort((a,b)=>b.count-a.count);
    function cutbyIQRv3(multi,maxlink) {
        // nodenLink.links.sort((a, b) => a.value - b.value);
        let templarray = links2.map(d => d.count);
        const q1 = d3.quantile(templarray, 0.25);
        const q3 = d3.quantile(templarray, 0.75);
        const qmean = d3.median(templarray);
        const iqr = q1 - q3;
        let filtered= links2.filter(d=> (d.count<(q1+iqr*multi)));
        let tempLinks=[];
        let tempc =d3.nest()
            .key(d=>d.source)
            .rollup(d=>{
                // if (d[0].sourcedata.category==="NUMBER")
                //     return d.slice(0,maxlink*2);
                return d.slice(0,maxlink);})
            .entries(filtered);
        tempc.forEach(d=>{tempLinks = d3.merge([tempLinks,d.value])});
        return tempLinks;
    }
    links2 = cutbyIQRv3(1.5, 4);
    links2 = links2.filter(d=> d.count>mainconfig.minlink);
    nodes2 = nodes2.filter(d=>links2.find(e=>d.key == e.source || d.key == e.target));
    console.log("link2.length = "+links2.length);
    console.log("nodes2.length = "+nodes2.length);

}

function rectCollide() {
    var nodes, sizes, masses
    var size = constant([0, 0])
    var strength = 1
    var iterations = 1

    function force() {
        var node, size, mass, xi, yi
        var i = -1
        while (++i < iterations) { iterate() }

        function iterate() {
            var j = -1
            var tree = d3.quadtree(nodes, xCenter, yCenter).visitAfter(prepare)

            while (++j < nodes.length) {
                node = nodes[j]
                size = sizes[j]
                mass = masses[j]
                xi = xCenter(node)
                yi = yCenter(node)

                tree.visit(apply)
            }
        }

        function apply(quad, x0, y0, x1, y1) {
            var data = quad.data
            var xSize = (size[0] + quad.size[0]) / 2
            var ySize = (size[1] + quad.size[1]) / 2
            if (data) {
                if (data.index <= node.index) { return }

                var x = xi - xCenter(data)
                var y = yi - yCenter(data)
                var xd = Math.abs(x) - xSize
                var yd = Math.abs(y) - ySize

                if (xd < 0 && yd < 0) {
                    var l = Math.sqrt(x * x + y * y)
                    var m = masses[data.index] / (mass + masses[data.index])

                    if (Math.abs(xd) < Math.abs(yd)) {
                        node.vx -= (x *= xd / l * strength) * m
                        data.vx += x * (1 - m)
                    } else {
                        node.vy -= (y *= yd / l * strength) * m
                        data.vy += y * (1 - m)
                    }
                }
            }

            return x0 > xi + xSize || y0 > yi + ySize ||
                x1 < xi - xSize || y1 < yi - ySize
        }

        function prepare(quad) {
            if (quad.data) {
                quad.size = sizes[quad.data.index]
            } else {
                quad.size = [0, 0]
                var i = -1
                while (++i < 4) {
                    if (quad[i] && quad[i].size) {
                        quad.size[0] = Math.max(quad.size[0], quad[i].size[0])
                        quad.size[1] = Math.max(quad.size[1], quad[i].size[1])
                    }
                }
            }
        }
    }

    function xCenter(d) { return d.x + d.vx + sizes[d.index][0] / 2 }
    function yCenter(d) { return d.y + d.vy + sizes[d.index][1] / 2 }

    force.initialize = function (_) {
        sizes = (nodes = _).map(size)
        masses = sizes.map(function (d) { return d[0] * d[1] })
    }

    force.size = function (_) {
        return (arguments.length
            ? (size = typeof _ === 'function' ? _ : constant(_), force)
            : size)
    }

    force.strength = function (_) {
        return (arguments.length ? (strength = +_, force) : strength)
    }

    force.iterations = function (_) {
        return (arguments.length ? (iterations = +_, force) : iterations)
    }

    return force
}
function constant(_) {
    return function () { return _ }
}