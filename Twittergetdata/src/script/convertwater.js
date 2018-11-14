var bigdata =[];
var filenamelist =  "waternews.json"
$(document).ready(function () {
    // d3.queue()
    //     .defer(d3.json,"src/data/dataout.json")
    //     .await(ready);

    concatfiles (filenamelist);
});
function concatfiles (filenamelist){
    d3.queue()
        .defer(d3.json, "src/data/"+filenamelist)
        .await((error, d) => {
            data = d;
            console.log(data.length);
            var data2 = data.map((t,i )=> {
                var it = {};
                it.title = i;
                it.source = "twitter";
                var body = t.body.replace(/#\D+|@|&|&nbsp;/gi,"").replace(/\u00A0/g,"").replace(/(&nbsp;)|(&ensp;)|(&emsp;)/g, '');
                it.body = body;
                it.hashTag= t.hashtag.map(e=>e.toLowerCase());
                it.time = t.time;
                it.url ="https://twitter.com"+t.link;
                it.urlToImage = t.img[0]||"";
                return it;
            });
            console.log(bigdata.length);
            console.log("done");
            Array.prototype.push.apply(bigdata,data2);

            console.log(JSON.stringify(bigdata).replace(/#\D+|@|&|&nbsp;/gi,"").replace(/\u00A0/g,"").replace(/(&nbsp;)|(&ensp;)|(&emsp;)/g, ''));
        })
}