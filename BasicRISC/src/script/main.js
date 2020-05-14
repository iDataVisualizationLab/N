// data
const lookup = {
    'Registers':'RegName',
    'ISAs':'ISAName',
    'InstFormats':'InstFormatName' ,
    'Insts':'Inst',
    'Caches':'Cache',
    'Cores':'Core'
};

function handle_data(data) {
    console.log(data);
    let nodes = [];
    let links = [];
// top to botom
    const current_ISA = data['ISAs'][0][lookup['ISAs']];
    nodes.push({
        id: current_ISA,
        level:'ISA',
        detail: data['ISAs'][0]
    });
    data['Cores'].filter(d => d['ISA'] === current_ISA).forEach(d => {
        const current_core = d['Core'];
        nodes.push({
            id: current_core,
            level:'Core',
            detail: d
        });
        links.push({source: current_ISA, target: current_core});
        // cache
        links.push({source: current_core, target: d['Cache']})
        d['RegisterClasses'].forEach(r => {
            links.push({source: current_core, target: r['RegClass']});
        });
    });
    data['Caches'].forEach(c => {
        const current = c['Cache'];
        nodes.push({
            id: current,
            level:'Cache',
            detail: c
        });
    });
    data['Registers'].forEach(r => {
        nodes.push({id: r['RegName'], level:'Register',detail: r});
        let currentName = `${r['RegName']}:${r['Index']}`;
        nodes.push({
            id: currentName,
            level:'Value',
            detail: r
        });
        links.push({source: r['RegName'], target: currentName, detail: r});
    });
    data['RegClasses'].forEach(rc => {
        const current = rc['RegisterClassName'];
        nodes.push({
            id: current,
            level:'RegClass',
            detail: rc
        });
        rc['Registers'].forEach(r => {
            links.push({source: current, target: r});
        })
    });
    data['PseudoInsts'].forEach(d => {
        const current = d['PseudoInst'];
        nodes.push({
            id: current,
            level:'PseudoInst',
            detail: d
        });
        links.push({source: current, target: d['Inst']});
        d['Encodings'].forEach(r => {
            let currentName = `${current}:${r['EncodingField']}`;
            nodes.push({
                id: currentName,
                level:'EncodingField',
                detail: r
            });
            links.push({source: current, target: currentName, detail: r});
            nodes.push({
                id: `${current}:${r['EncodingField']}:${r['EncodingValue']}`,
                text:`Enc=${r['EncodingValue']}`,
                level:'Value',
                detail: r
            });
            links.push({source: currentName, target: `${current}:${r['EncodingField']}:${r['EncodingValue']}`, detail: r});
        })
    });
    data['Insts'].forEach(d => {
        const current = d['Inst'];
        nodes.push({
            id: current,
            level:'Insts',
            detail: d
        });
        links.push({source: current, target: d['InstFormat']});
        d['Encodings'].forEach(r => {
            let currentName = `${current}:${r['EncodingField']}`;
            nodes.push({
                id: currentName,
                level:'EncodingField',
                detail: r
            });
            links.push({source: current, target: currentName, detail: r});
            nodes.push({
                id: `${current}:${r['EncodingField']}:${r['EncodingValue']}`,
                text:`Enc=${r['EncodingValue']}`,
                level:'Value',
                detail: r
            });
            links.push({source: currentName, target: `${current}:${r['EncodingField']}:${r['EncodingValue']}`, detail: r});
        })

    });
    data['InstFormats'].forEach(d => {
        const current = d['InstFormatName'];
        nodes.push({
            id: current,
            level:'InstFormatName',
            detail: d
        });
        links.push({source: d['ISA'], target: current});
        d['Fields'].forEach(r => {
            let currentName = `${current}:${r['FieldName']}`;
            nodes.push({
                id: currentName,
                level:'FieldName',
                detail: r
            });
            links.push({source: current, target: currentName, detail: r});
            if (r['RegClass']) {
                links.push({source: current, target: r['RegClass'], detail: r});
            }
        })
    });
    let nodes_ob = {};
    nodes.forEach(n => nodes_ob[n.id] = 1);
    links.forEach(l => {
        if (!nodes_ob[l.source]) {
            nodes.push({id: l.source, level:'Unknown',detail: {}});
            nodes_ob[l.source] = 1;
        }
        if (!nodes_ob[l.target]) {
            nodes.push({id: l.target, level:'Unknown',detail: {}});
            nodes_ob[l.target] = 1;
        }
    });
    return {nodes, links};
}

function draw(links, nodes) {
    var svg = d3.select("svg"),
        width = +svg.attr("width"),
        height = +svg.attr("height");
    var color = d3.scaleOrdinal(d3.schemeCategory10);
    var link = svg.append("g")
        .attr("class", "links")
        .selectAll("line")
        .data(links)
        .enter().append("line").style('stroke-width', 1).style('stroke', '#ddd');

    var node = svg.append("g")
        .attr("class", "nodes")
        .selectAll("circle")
        .data(nodes)
        .enter().append("circle")
        .attr("r", 2.5)
        .style('fill',d=>color(d.level))
        .call(d3.drag()
            .on("start", dragstarted)
            .on("drag", dragged)
            .on("end", dragended));

    node.append("title")
        .text(function (d) {
            return d.id;
        });

    var legend_g = svg.append('g').attr('class','legendG');
    var legend = legend_g.selectAll('.legend').data(color.domain())
        .enter().append('g').attr('class','legend');
    legend.append('circle')
        .attr("cx", 100)
        .attr("cy", function(d,i){ return 100 + i*25}) // 100 is where the first dot appears. 25 is the distance between dots
        .attr("r", 7)
        .style("fill", function(d){ return color(d)});
    legend.append("text")
        .attr("x", 120)
        .attr("y", function(d,i){ return 100 + i*25}) // 100 is where the first dot appears. 25 is the distance between dots
        .style("fill", function(d){ return color(d)})
        .text(function(d){ return d})
        .attr("text-anchor", "left")
        .style("alignment-baseline", "middle");

    var simulation = d3.forceSimulation()
        .force("link", d3.forceLink().id(function (d) {
            return d.id;
        }))
        .force("charge", d3.forceManyBody())
        .force("x", d3.forceX())
        .force("y", d3.forceY())
        .force("center", d3.forceCenter(width / 2, height / 2));
    simulation
        .nodes(nodes)
        .on("tick", ticked);

    simulation.force("link")
        .links(links);
    simulation.on('end',function(){
        console.log('end');

    })
    function ticked() {
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
    }

    function dragstarted(d) {
        if (!d3.event.active) simulation.alphaTarget(0.3).restart();
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
}

d3.json('src/data/BasicRISC.json').then(function(data){

    let {nodes, links} = handle_data(data);
    console.log(`Nodes  = ${nodes.length}`);
    console.log(`Links  = ${links.length}`);
    // draw
    draw(links, nodes);
});
