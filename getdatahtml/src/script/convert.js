var data=[];
$(document).ready(function () {
    // d3.queue()
    //     .defer(d3.json,"src/data/dataout.json")
    //     .await(ready);

    d3.queue()
        .defer(d3.json,"src/data/dataout.json")
        .await((error, d)=>{data =d;
            console.log(data.length);
            d3.queue()
                .defer(d3.json,"src/data/dataout14.json")
                .await((error, d)=>{
                    console.log(d.length);
                    d.forEach(e=>{
                        if (data.find(a=> a.title == e.title)== undefined)
                            data.push(e);
                    });
                    console.log(data.length);
                    console.log(JSON.stringify(data));
                    console.log("done");});
                });

    // d3.queue()
    //     .defer(d3.json,"src/data/dataout.json")
    //     .await((error, d)=>{
    //
    //         d.forEach(e=>{
    //             if (e.source===undefined)
    //                 e.source = "cnbc";});
    //         d.forEach(e=> {
    //             if (data.find(f=>f.title===e.title) === undefined)
    //                 data.push(e);
    //         });
    //         console.log(data.length);
    //         console.log("");
    //
    //     });

    // d3.queue()
    //     .defer(d3.json,"src/data/dataout.json")
    //     .await((error, d)=> {
    //         data = d.map(e=> {e.source = "cnbc"; return e;});
    //
    //     });


});