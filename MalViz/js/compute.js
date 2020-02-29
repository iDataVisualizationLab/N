function network(data, prev, getGroup, expand) {
    expand = expand || {};
    var groupMap = {},    // group map
        nodeMap = {},    // node map
        linkMap = {},    // link map
        prevGroupNode = {},    // previous group nodes
        prevGroupCentroid = {},    // previous group centroids
        nodes = [], // output nodes
        links = [], // output links
        extra = [];

    // process previous nodes for reuse or centroid calculation
    if (prev) {
        prev.nodes.forEach(function (n) {
            let i = getGroup(n), o;
            if (n.size > 0) {
                prevGroupNode[i] = n;
                n.size = 0;
            } else {
                o = prevGroupCentroid[i] || (prevGroupCentroid[i] = {x: 0, y: 0, count: 0});
                o.x += n.x;
                o.y += n.y;
                o.count += 1;
            }
        });
    }
    // determine nodes
    for (var k = 0; k < data.nodes.length; ++k) {
        var n = data.nodes[k],
            i = getGroup(n),    // i is the freaking group
            g = groupMap[i] ||
                (groupMap[i] = prevGroupNode[i]) ||
                (groupMap[i] = {group: i, size: 0, nodes: []});
        if (n.dummy){
            g.dummy = true;
        }

        if (expand[i]) {
            // the node should be directly visible
            nodeMap[n.id] = nodes.length;
            nodes.push(n);
            if (prevGroupNode[i]) {
                // place new nodes at cluster location (plus jitter)
                n.x = prevGroupNode[i].x + 3 * Math.random();
                n.y = prevGroupNode[i].y + 3 * Math.random();
            }

        } else {
            // the node is part of a collapsed cluster
            if (g.size == 0) {
                // if new cluster, add to set and position at centroid of leaf nodes
                nodeMap[i] = nodes.length;
                nodes.push(g);
                if (prevGroupCentroid[i]) {
                    // gcen.x = prevGroupCentroid[i].x / prevGroupCentroid[i].count;
                    // gcen.y = prevGroupCentroid[i].y / prevGroupCentroid[i].count;
                    g.x =  prevGroupCentroid[i].x / prevGroupCentroid[i].count + 3 * Math.random();
                    g.y = prevGroupCentroid[i].y / prevGroupCentroid[i].count + 3 * Math.random();
                }
            }
            g.nodes.push(n);
        }
        // always count group size as w e also use it to tweak the force graph strengths/distances
        g.size += 1;
        n.group_data = g;       // circular data
    }
    for (i in groupMap) {
        groupMap[i].link_count = 0;
    }

    // determine loop
    data.extra.forEach((path, pIndex) => {
        extra.push({
            source: nodes.find(d => {
                return ((d.size == 1) && (d.nodes[0].id === path.source.id))
            }),
            target: nodes.find(d => {
                return ((d.size == 1) && (d.nodes[0].id === path.target.id))
            }),
            dummy1: nodes.find(d => {
                return ((d.size == 1) && (d.nodes[0].id === path.dummy1.id))
            }),
            dummy2: nodes.find(d => {
                return ((d.size == 1) && (d.nodes[0].id === path.dummy2.id))
            }),
            size: path.value,
            pathid: pIndex
        });
    });

    // determine links
    for (k = 0; k < data.links.length; ++k) {
        var e, u, v;        // u, v are group names
        e = data.links[k];
        if (e.source.group) {
            u = getGroup(e.source);
        }
        else continue;
        if (e.target.group) {
            v = getGroup(e.target);
        }
        else continue;
        if (u != v) {
            // link_count is the number of links to that node
            groupMap[u].link_count += e.value;
            groupMap[v].link_count += e.value;
        }

        u = expand[u] ? nodeMap[e.source.id] : nodeMap[u];
        v = expand[v] ? nodeMap[e.target.id] : nodeMap[v];
        var index = (u < v ? u + "|" + v : v + "|" + u),
            l = linkMap[index] || (linkMap[index] = {source: u, target: v, size: 0});

        if ((e.img) || (e.self)) {
            l.img = true;
        }

        if (e.self){
            l.self = true;
        }
        l.size += e.value;

    }
    for (i in linkMap) {
        // tranh thu tinh maxLink
        if (maxLink < linkMap[i].size) {
            maxLink = linkMap[i].size;
        }

        links.push(linkMap[i]);
    }
    return {nodes: nodes,
        links: links,
        extra: extra,
        // gcen: gcen
    };
}