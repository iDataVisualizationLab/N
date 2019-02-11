var serviceList = ["Huff"];
var serviceLists = [{text: "Huff", id: 0,
    sub:[]}];
var serviceListattr = ["arr"];
var chosenService = 0;

function readData() {
    return d3.json("src/data/Huffv2.json").then((data)=>{
        let timestep = d3.nest().key(d=>d.timestep).entries(data).length;
        let timerange = d3.range(timestep).map(function(d) { return new Date(2007, d);});

        return data.map(d=>{
            return {key: d.fam.replace("'", ""),
            topic: d.topic,
            text: d.text,
            f: ~~d.frequency,
            timestep: timerange[~~d.timestep],
            df: ~~d.sudden}
        });
    });
}