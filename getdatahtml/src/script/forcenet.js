function forcegraph(selector) {
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
    computeNodes();
    var linkScale = d3.scaleLinear()
            .range([0.5, 2])
            .domain([Math.round(mainconfig.minfreq)-0.4, Math.max(d3.max(links2,d=>d.count),10)]); 
    console.log("computed: "+links2.length);

/// The second force directed layout ***********


    force2.nodes(nodes2);
    force2.force("link",d3.forceLink(links2)
     .id(function(d,i) {
         return d.key;
     }));;


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
            return d.key
        })
        .attr("dy", ".35em")
        .style("fill", function (d) {
            return getColor(d.group, d.frequency);
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

function computeNodes() {
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
    
    var collection = [];
    nested_data.forEach(d=> d.values.forEach(t=>collection.push({title: t.key, term:{key: d.key, frequency: d.values.length}})));
    nodes2 = [];
    nested_data.forEach(d=> d.values.forEach(t=>nodes2.push({key: d.key, frequency: d.values.length,group: t.value.category})));
    console.log("nodes2.length = "+nodes2.length);
    nested_data = d3.nest()
        .key(function (d) {
            return d.title;
        })
        .entries(collection);
    var linkmap={};
    nested_data.forEach(d=>{
        var term = d.values;
        for (var i =0; i< term.length-1; i++){
            for (var j =i+1; j< term.length; j++){
                var temp =  linkmap[term[i].term.key+"___"+term[j].term.key]||linkmap[term[j].term.key+"___"+term[i].term.key];
                if (temp==undefined){
                    linkmap[term[i].term.key+"___"+term[j].term.key] = {source: term[i].term.key,target: term[j].term.key, count: 1};;
                }
                else
                    temp.count++;
            }    
        }
    });
    
    links2 = Object.keys(linkmap).map(d=> linkmap[d]);
    links2.sort((a,b)=>b.count-a.count);
    links2 = links2.filter(d=> d.count>mainconfig.minfreq);
    console.log("link2.length = "+links2.length);
    
}