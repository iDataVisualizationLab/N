var bigdata =[];
var filenamelist =  [
    {file:"Autonomousaccident.json",
        category:"Accident"},
    {file:"autopilotcrash.json",
        category: "Accident"},
    {file:"IoTcrash.json",
        category: "Accident"},
    {file:"IoTrisk.json",
        category: "Risk"},
    {file:"IoTsensorsrisk.json",
        category: "Accident"}];
$(document).ready(function () {
    // d3.queue()
    //     .defer(d3.json,"src/data/dataout.json")
    //     .await(ready);

    concatfiles (filenamelist,0,0);
});
function concatfiles (filenamelist,index,startindex){
    d3.queue()
        .defer(d3.json, "src/data/"+filenamelist[index].file)
        .await((error, d) => {
            data = d;
            console.log(data.length);
            var data2 = data.map((t,i )=> {
                var it = {};
                it.title = i;
                it.source = "twitter";
                it.keywords = t.hashTag.map(tt=> {return {term: tt, category:filenamelist[index].category}});
                it.body = t.plainText;
                it.time = t.time;
                it.url ="";
                it.urlToImage = "";
                return it;
            });
            console.log(bigdata.length);
            console.log("done");
            Array.prototype.push.apply(bigdata,data2);
            if (index<filenamelist.length-1)
                concatfiles (filenamelist,index+1,bigdata.length);
            console.log(JSON.stringify(bigdata));
        })
}