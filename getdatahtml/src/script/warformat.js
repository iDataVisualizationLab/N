var data=[];
$(document).ready(function () {
    // d3.queue()
    //     .defer(d3.json,"src/data/dataout.json")
    //     .await(ready);

    d3.queue()
        .defer(d3.json,"src/data/war/dataWar_OR_out.json")
        .defer(d3.json,"src/data/war/dataWarout.json")
        .awaitAll((error,dd)=>{
            ordata = dd[0];
            data =dd[1];
            var keywordscollection =[];
            data.forEach (d=> keywordscollection=d3.merge([keywordscollection,d.keywords]));
            ordata.forEach (d=> keywordscollection=d3.merge([keywordscollection,d.keywords]));
            keywordscollection = d3.nest().key(e=>e.term).entries(keywordscollection).map(e=>e.values[0]);

            data.forEach((d,i)=>{
                d.keywords = [];
                keywordscollection.forEach((term)=>{
                    collect = ordata[i].text.match(new RegExp(' '+term.term+' ','g'));
                    if (collect)
                    {
                        var term_frequency = collect.length;
                        d.keywords.push({
                            term: term.term,
                            category: term.category,
                            frequency: term_frequency
                        });

                    }
                });
                d.timestep = new Date(d.time);
                d.title = ordata[i].filename;
            });

            // d3.queue()
            //     .defer(d3.json,"src/data/dataout14.json")
            //     .await((error, d)=>{
            //         console.log(d.length);
            //         d.forEach(e=>{
            //             if (data.find(a=> a.title == e.title)== undefined)
            //                 data.push(e);
            //         });
            //         console.log(data.length);
            //         console.log(JSON.stringify(data));
            //         console.log("done");});
            //     });
            data.forEach(t=>{
                var list =[];
                t.keywords.forEach((k,i)=>{
                    //console.log("Before: "+k.term);
                    k.term = k.term.trim();
                    k.term = k.term.replace(/approximately |\|\||up |'s|between |—| »|~|a |well over |\$|00:\d\d|\"|\.$|\" | \(|\(|'|' | '|@|& $|$&|close to |roughly |nearly |more than |less than |around /gi,"");
                    k.term = k.term.replace(/ percent/gi,"%");
                    //console.log(" After: "+k.term);
                    if(k.term =="")
                        list.push(i);
                });
                list.sort((a,b)=>b-a);
                list.forEach(i=>t.keywords.splice(i,1));
            });
            console.log(JSON.stringify(data));
            console.log("done");
        })
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