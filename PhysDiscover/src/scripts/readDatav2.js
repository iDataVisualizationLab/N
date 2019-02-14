var serviceList = ["Huff"];
var serviceLists = [{text: "Huff", id: 0,
    sub:[]}];
var serviceListattr = ["arr"];
var chosenService = 0;

function readData() {
     // return d3.json("src/data/Huffv2.json").then((data)=>{
    return d3.json("src/data/Huffv3.json").then((data)=>{
        // let timestep = d3.nest().key(d=>d.timestep).entries(data).length;
        let timestep = data[0].values[0].value.length;
        let timerange = d3.range(timestep).map(function(d) { return new Date(2007, d);});
        let dataRead = [];
        data.forEach(topics=>{
            topics.values.forEach(d=>d.value.forEach(it=>{
                dataRead.push({key: d.key.replace("'", ""),
                        topic: topics.key,
                        text: it.text,
                        f: it.frequency,
                        timestep: timerange[it.timestep],
                        df: it.sudden});
            }));
        });
        return dataRead;
        // return data.map(d=>{
        //     return {key: d.fam.replace("'", ""),
        //     topic: d.topic,
        //     text: d.text,
        //     f: ~~d.frequency,
        //     timestep: timerange[~~d.timestep],
        //     df: ~~d.sudden}
        // });
    });
}