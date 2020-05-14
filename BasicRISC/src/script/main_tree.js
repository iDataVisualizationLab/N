// data
const lookup = {
    'Registers':'RegName',
    'ISAs':'ISAName',
    'InstFormats':'InstFormatName' ,
    'Insts':'Inst',
    'Caches':'Cache',
    'Cores':'Core'
};
var color = d3.scaleOrdinal(d3.schemeCategory10);
let radiusMultiply = 30

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

    let nodes_InstFormats = {};
    data['InstFormats'].forEach(d => {
        const current = d['InstFormatName'];
        links.push({source: d['ISA'], target: current});

        let children = d['Fields'].map(r => {
            let currentName = r['FieldName'];
            let node =  {
                name: currentName,
                level:'FieldName',
                detail: r,
            };
            if (r['RegClass']) {
                links.push({source: current, target: r['RegClass'], detail: r});
            }
            return node
        });
        nodes_InstFormats[current] = {
            name:current,
            level:'InstFormat',
            detail:d,
            children:children
        };
        nodes.push({
            id: current,
            level:'InstFormatName',
            detail: d,
            radius: children.length,
            tree: nodes_InstFormats[current],
        });
    });
    let nodes_Insts = {};
    data['Insts'].forEach(d => {
        const current = d['Inst'];
        let children = d['Encodings'].map(r => {
            let currentName = r['EncodingField'];
            let node = {name: currentName,level:'EncodingField', detail: r,children:[{
                    name: r['EncodingValue'],
                    level:'Value',
                    detail: r
                }]};
            return node;
        });
        nodes_Insts[current] = {'name':current,level:'Insts',children:children,detail: d};

        nodes_InstFormats[d['InstFormat']].children.push(nodes_Insts[current]);

    });
    let nodes_Regs = {};
    data['RegClasses'].forEach(rc => {
        const current = rc['RegisterClassName'];
        nodes.push({
            id: current,
            level:'RegClass',
            radius: 2,
            detail: rc,
            tree: {
                name:current,
                level:'RegClass',
                detail: rc,
                children:rc['Registers'].map(r => {
                    nodes_Regs[r] = {name: r,level:'Register',children:[]};
                    return nodes_Regs[r];
                })
            },
        });
    });
    data['Registers'].forEach(r => {
        nodes_Regs[r['RegName']].detail =  r;
        nodes_Regs[r['RegName']].children.push({
            name: r['Index'],
            level   :'Value',
            detail: r
        });
    });
    data['PseudoInsts'].forEach(d => {
        const current = d['PseudoInst'];
        children = d['Encodings'].map(r => {
            let currentName = r['EncodingField'];
            return {
                name: currentName,
                level:'EncodingField',
                detail: r,
                children:[{name:r['EncodingValue'],level:'Value',detail: r}]
            }
        })
        nodes_Insts[d['Inst']].children.push({
            name:current,
            level:'PseudoInst',
            children:children,
            detail: d
        })
    });
    nodes.forEach(n=>{
        if(n.tree){
            n.tree=d3.hierarchy(n.tree);
            n.radius = Math.sqrt(Math.sqrt(n.tree.children.length)*(n.tree.height)+n.tree.height);
        }
        n.r = (n.radius*radiusMultiply+20)||50;
    })
    return {nodes, links};
}

function draw(links, nodes) {
    var svg = d3.select("svg"),
        width = 1200,
        height = 800;

    var link = svg.append("g")
        .attr("class", "links")
        .selectAll("line")
        .data(links)
        .enter().append("line").style('stroke-width', 1).style('stroke', '#ddd');

    var node = svg.append("g")
        .attr("class", "nodes")
        .selectAll("g")
        .data(nodes)
        .enter().append("g")
        .style('fill',d=>color(d.level))
        .call(d3.drag()
            .on("start", dragstarted)
            .on("drag", dragged)
            .on("end", dragended));
    node.filter(d=>!d.tree).append("circle")
        .attr("r", 5);
    node.filter(d=>d.tree).each(function(d){
        draw_RadialTidy(d.tree,d3.select(this),{radius:d.radius*radiusMultiply})
    });
    node.append("title")
        .text(function (d) {
            return d.id;
        });

    var legend_g = svg.append('g').attr('class','legendG');
    var legend = legend_g.selectAll('.legend').data(color.domain())
        .enter().append('g').attr('class','legend');
    legend.append('circle')
        .attr("cx", 50)
        .attr("cy", function(d,i){ return 100 + i*15}) // 100 is where the first dot appears. 25 is the distance between dots
        .attr("r", 5)
        .style("fill", function(d){ return color(d)});
    legend.append("text")
        .attr("x", 70)
        .attr("y", function(d,i){ return 100 + i*15}) // 100 is where the first dot appears. 25 is the distance between dots
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
        .force('collision', d3.forceCollide().iterations(10).radius(function(d) {
            return d.r;
        }))
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
        node
            .attr("transform", d=>{
                d.x = Math.min(d.x+d.r,width)-d.r;
                d.y = Math.min(d.y+d.r,height)-d.r;
                return `translate(${d.x},${d.y})`
            });
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
function draw_RadialTidy(data,svg,option){
    const tree = d3.tree()
        .size([2 * Math.PI, option.radius])
        .separation((a, b) => (a.parent == b.parent ? 1 : 4) / a.depth);
    const transform_y = d3.scaleSqrt().domain([0,option.radius]).range([0,option.radius])
    const root = tree(data);
    svg.append("g")
        .attr("fill", "none")
        .attr("stroke", "#555")
        .attr("stroke-opacity", 0.4)
        .attr("stroke-width", 1.5)
        .selectAll("path")
        .data(root.links())
        .join("path")
        .attr("d", d3.linkRadial()
            .angle(d => d.x)
            .radius(d => transform_y(d.y)));

    svg.append("g")
        .selectAll("circle")
        .data(root.descendants())
        .join("circle")
        .attr("transform", d => `
        rotate(${d.x * 180 / Math.PI - 90})
        translate(${transform_y(d.y)},0)
      `)
        // .attr("fill", d => d.children ? "#555" : "#999")
        .attr("fill", d => color(d.data.level))
        .attr("r", 2.5);

    svg.append("g")
        .attr("font-family", "sans-serif")
        .attr("font-size", 10)
        .attr("stroke-linejoin", "round")
        .attr("stroke-width", 3)
        .selectAll("text")
        .data(root.descendants())
        .join("text")
        .attr("transform", d => `
        rotate(${d.x * 180 / Math.PI - 90}) 
        translate(${transform_y(d.y)},0) 
        rotate(${d.x >= Math.PI ? 180 : 0})
      `)
        .attr("dy", "0.31em")
        .attr("x", d => d.x < Math.PI === !d.children ? 6 : -6)
        .attr("text-anchor", d => d.x < Math.PI === !d.children ? "start" : "end")
        .style('fill',d=>color(d.data.level))
        .text(d => d.data.name)
        .clone(true).lower()
        .attr("stroke", "white");
    return svg;
}
d3.json('src/data/BasicRISC.json').then(function(data){

    let {nodes, links} = handle_data(data);
    console.log(`Nodes  = ${nodes.length}`);
    console.log(`Links  = ${links.length}`);
    console.log(nodes)
    // draw
    draw(links, nodes);
});