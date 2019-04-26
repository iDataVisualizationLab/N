importScripts("https://d3js.org/d3.v4.min.js");
importScripts("../../lib/underscore-min.js");

let nodes2, link2,mainconfig;

addEventListener('message',function ({data}) {
    switch (data.action) {
        case "computeNodes":
            mainconfig = data.input.config;
            computeNodes(data.input.term);
            postMessage({action:'computeNodes', result: {nodes: nodes2, links: links2}});
            break;
    }
});


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