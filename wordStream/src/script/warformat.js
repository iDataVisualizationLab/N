var data=[];
$(document).ready(function () {
    // d3.queue()
    //     .defer(d3.json,"src/data/dataout.json")
    //     .await(ready);

    // d3.queue()
    //     .defer(d3.json,"src/data/war/dataWar_OR_out.json")
    //     .defer(d3.json,"src/data/war/dataWarout.json")
    //     .awaitAll((error,dd)=>{
    //         ordata = dd[0];
    //         data =dd[1];
    //         var keywordscollection =[];
    //         data.forEach (d=> keywordscollection=d3.merge([keywordscollection,d.keywords]));
    //         ordata.forEach (d=> keywordscollection=d3.merge([keywordscollection,d.keywords]));
    //         keywordscollection = d3.nest().key(e=>e.term).entries(keywordscollection).map(e=>e.values[0]);
    //
    //         data.forEach((d,i)=>{
    //             d.keywords = [];
    //             keywordscollection.forEach((term)=>{
    //                 collect = ordata[i].text.match(new RegExp(' '+term.term+' ','g'));
    //                 if (collect)
    //                 {
    //                     var term_frequency = collect.length;
    //                     d.keywords.push({
    //                         term: term.term,
    //                         category: term.category,
    //                         frequency: term_frequency
    //                     });
    //
    //                 }
    //             });
    //             d.timestep = new Date(d.time);
    //             d.title = ordata[i].filename;
    //         });
    //
    //         data.forEach(t=>{
    //             var list =[];
    //             t.keywords.forEach((k,i)=>{
    //                 //console.log("Before: "+k.term);
    //                 k.term = k.term.trim();
    //                 k.term = k.term.replace(/approximately |\|\||up |'s|between |—| »|~|a |well over |\$|00:\d\d|\"|\.$|\" | \(|\(|'|' | '|@|& $|$&|close to |roughly |nearly |more than |less than |around /gi,"");
    //                 k.term = k.term.replace(/ percent/gi,"%");
    //                 //console.log(" After: "+k.term);
    //                 if(k.term =="")
    //                     list.push(i);
    //             });
    //             list.sort((a,b)=>b-a);
    //             list.forEach(i=>t.keywords.splice(i,1));
    //         });
    //         console.log(JSON.stringify(data));
    //         console.log("done");
    //     })

    // --------------- METHOD1 -------------------------------
    // d3.queue()
    //     .defer(d3.json,"src/data/war/summaryandcleanedfd1.json")
    //     .defer(d3.json,"src/data/war/summaryfd1_out.json")
    //     .awaitAll((error,dd)=>{
    //         ordata = dd[0];
    //         data =dd[1];
    //         var keywordscollection =[];
    //         data.forEach (d=> keywordscollection=d3.merge([keywordscollection,d.keywords]));
    //         // ordata.forEach (d=> keywordscollection=d3.merge([keywordscollection,d.keywords]));
    //         keywordscollection = d3.nest().key(e=>e.term).entries(keywordscollection).map(e=>e.values[0]).filter(d=>d.term.length>2);
    //
    //         data.forEach((d,i)=>{
    //             d.keywords = [];
    //             const textor = ordata.find(o=>o.fileName===d.filename).cleanedText;
    //             keywordscollection.forEach((term)=>{
    //                 collect = textor.match(new RegExp(' '+term.term+' ','g'));
    //                 if (collect)
    //                 {
    //                     var term_frequency = collect.length;
    //                     d.keywords.push({
    //                         term: term.term,
    //                         category: term.category,
    //                         frequency: term_frequency
    //                     });
    //
    //                 }
    //             });
    //             d.timestep = new Date(d.time);
    //             d.title = d.filename;
    //             console.log(i+' / '+data.length);
    //         });
    //
    //         data.forEach(t=>{
    //             var list =[];
    //             t.keywords.forEach((k,i)=>{
    //                 //console.log("Before: "+k.term);
    //                 k.term = k.term.trim();
    //                 k.term = k.term.replace(/approximately |\|\||up |'s|between |—| »|~|a |well over |\$|00:\d\d|\"|\.$|\" | \(|\(|'|' | '|@|& $|$&|close to |roughly |nearly |more than |less than |around /gi,"");
    //                 k.term = k.term.replace(/ percent/gi,"%");
    //                 //console.log(" After: "+k.term);
    //                 if(k.term =="")
    //                     list.push(i);
    //             });
    //             list.sort((a,b)=>b-a);
    //             list.forEach(i=>t.keywords.splice(i,1));
    //         });
    //         data = data.filter(t=> t.keywords.length);
    //         console.log("--backsup-----");
    //         console.log(JSON.stringify(data));
    //
    //         data = data.filter(t=> {
    //             let timespan = t.keywords.filter(w=>((w.category==="DATE")||(w.category==="TIME"))).filter(w=> w.time = handleDate(w.term));
    //             if (timespan.length!==0) {
    //                 let timenest = d3.nest().key(d=>d3.timeFormat('Jan %Y')(d.time)).rollup(d=>d3.sum(d,e=>e.frequency)).entries(timespan);
    //                 timenest = timenest.sort((a, b) => b.value - a.value).filter(d=>d.value===timenest[0].value);
    //                 timenest.sort((a, b) => new Date(a.key) - new Date(b.key));
    //                 t.timestep = new Date(timenest[0].key);
    //                 return true;
    //             }
    //             return false;
    //         });
    //
    //         console.log(JSON.stringify(data));
    //         console.log("done");
    //     })

    // --------------- METHOD2 -------------------------------
    d3.queue()
        .defer(d3.json,"src/data/war/summaryandcleanedfd1.json")
        .defer(d3.json,"src/data/war/summaryfd1_out.json")
        .awaitAll((error,dd)=>{
            ordata = dd[0];
            data =dd[1];
            var keywordscollection =[];
            data.forEach (d=> keywordscollection=d3.merge([keywordscollection,d.keywords]));
            // ordata.forEach (d=> keywordscollection=d3.merge([keywordscollection,d.keywords]));
            keywordscollection = d3.nest().key(e=>e.term).entries(keywordscollection).map(e=>e.values[0]).filter(d=>d.term.length>2);

            data.forEach((d,i)=>{
                d.keywords = [];
                const textor = ordata.find(o=>o.fileName===d.filename).summary;
                keywordscollection.forEach((term)=>{
                    collect = textor.match(new RegExp(' '+term.term+' ','g'));
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
                d.body = textor;
                d.timestep = new Date(d.time);
                d.title = d.filename;
                console.log(i+' / '+data.length);
            });

            data.forEach(t=>{
                var list =[];
                t.keywords.forEach((k,i)=>{
                    //console.log("Before: "+k.term);
                    k.term = k.term.trim();
                    k.term = k.term.replace(/approximately |\|\||up |'s|between |—| »|~|a |well over |\$|00:\d\d|\"|\.$|\" | \(|\(|'|' | '|@|& $|$&|close to |roughly |nearly |more than |less than |around /gi,"");
                    k.term = k.term.replace(/ percent/gi,"%");
                    //console.log(" After: "+k.term);
                    if(k.term ==="")
                        list.push(i);
                });
                list.sort((a,b)=>b-a);
                list.forEach(i=>t.keywords.splice(i,1));
            });
            data = data.filter(t=> t.keywords.length);
            console.log("--backup-----");
            console.log(JSON.stringify(data));

            data = data.filter(t=> {
                let timespan = t.keywords.filter(w=>((w.category==="DATE")||(w.category==="TIME"))).filter(w=> w.time = handleDate(w.term));
                if (timespan.length!==0) {
                    let timenest = d3.nest().key(d=>d3.timeFormat('Jan %Y')(d.time)).rollup(d=>d3.sum(d,e=>e.frequency)).entries(timespan);
                    timenest = timenest.sort((a, b) => b.value - a.value).filter(d=>d.value===timenest[0].value);
                    timenest.sort((a, b) => new Date(a.key) - new Date(b.key));
                    t.timestep = new Date(timenest[0].key);
                    return true;
                }
                return false;
            });

            console.log(JSON.stringify(data));
            console.log("done");
        })

});

function handleDate (d){

    if (d.trim().match(/^19[0-9][0-9]$/gi)!==null)
    {
        return new Date("Jan "+d);
    }
    const date = new Date(d);
    if (isNaN(date.getFullYear()))
        return false;
    return date;
}