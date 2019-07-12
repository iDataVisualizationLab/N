var data=[];
$(document).ready(function () {
    // d3.queue()
    //     .defer(d3.json,"src/data/dataout.json")
    //     .await(ready);
    var outputFormat = d3.timeFormat('%b %Y');

    function readfile(dd,topic) {
        var fullset = [];
        dd.forEach((e, i) => {
            let hashTag = e.post.body.replace(/(https?:\/\/[^\s]+)/g, '').match(/#\w+/ig).map(d => d.replace('#', '').toLowerCase())
                .forEach(d => {
                    if (d !== topic) {
                        let newData = {};
                        newData.text = d;
                        newData.timestep = outputFormat(new Date(e.published_at));
                        newData.score = e.post.score;
                        newData.topic = 'crime';//topic;
                        newData.key = '_' + d + '-' + newData.topic; // avoid begin with number
                        newData.link = 'https://gab.com/' + e.actuser.username + '/posts/' + e.post.id;
                        fullset.push(newData);
                    }
                });
        });
        // var nestData = d3.nest().key(d => d.timestep).key(d => d.text).rollup(w => {
        //     return {
        //         f: w.length,
        //         s: d3.sum(w, e => e.score),
        //         ds: 0,
        //         df: 0,
        //         text: w[0].text,
        //         key: w[0].key,
        //         timestep: w[0].timestep,
        //         topic: 'crime'//w[0].topic
        //     }
        // }).entries(fullset);
        // fullset.length=0;
        // nestData.forEach(t=>t.values.forEach(w=>fullset.push(w.value)));
        return fullset;
    }
    var topics = ["shooting","bombing","burning","ramming","stabbing"];
    var queue = d3.queue();
    function readqueue(topic, callback){
        let tempdata = {topic: topic,value:[]};
        d3.queue().defer(d3.json,"src/data/GAB/"+topic+".json").await(function(error,dd) {
            if (error) throw error;
            tempdata.value = dd;
            callback(error, tempdata);
        });
    }
    topics.forEach(topic =>queue=queue.defer(readqueue,topic));
    queue.awaitAll((error, ddd)=>{
        var nestData=[],fullset=[];
        ddd.forEach((dd,i)=>{
            var fullsett = readfile(dd.value,dd.topic);
            fullset = d3.merge([fullset,fullsett]);
        });
        nestData = d3.nest().key(d => d.timestep).key(d => d.text).rollup(w => {
            let tempw = d3.nest().key(tw=>tw.link).entries(w);
            w = tempw.map(ww=>ww.values[0]);
            return {
                f: w.length,
                s: d3.sum(w, e => e.score),
                ds: 0,
                df: 0,
                text: w[0].text,
                key: w[0].key,
                timestep: w[0].timestep,
                topic: 'crime'//w[0].topic
            }
        }).entries(fullset);
        fullset.length=0;
        nestData.forEach(t=>t.values.forEach(w=>fullset.push(w.value)));

                var time_range = d3.extent(fullset,d=>new Date(d.timestep));
                var now = time_range[0],
                    last = time_range[1];
                var timespan = [];
                while (now <= last) {
                    timespan.push(outputFormat(now));
                    now["setMonth"](now.getMonth() + 1);
                }


                nestData = d3.nest().key(d=>d.text)
                    .key(d=>d.timestep)
                    .entries(fullset);
                fullset.length=0;
                nestData.forEach(k=>{
                    timespan.forEach(ts=> {
                        var index = k.values.find(t=>t.key===ts);
                        if(index)
                            fullset.push(index.values[0]);
                        else
                            fullset.push({
                                df: 0,
                                f: 0,
                                s: 0,
                                ds:0,
                                key: k.values[0].values[0].key,
                                text: k.values[0].values[0].text,
                                timestep: ts,
                                topic: k.values[0].values[0].topic
                            });
                    });
                });
                nestData = d3.nest().key(d=>d.text)
                    .key(d=>d.timestep)
                    .entries(fullset);
                nestData.forEach(term=> {
                            var pre = 0;
                            var preS = 0;
                            var preday = new Date(term.values[0].key);
                            term.values.forEach(day => {
                                preday["setMonth"](preday.getMonth() + 1);
                                if (preday.getMonth() < new Date(day.key).getMonth()){
                                    preS=0;
                                    pre = 0;
                                }
                                var sudden  = (day.values[0].f)/(pre+1);
                                // var suddenS  = (day.values[0].s)/(preS+1); //sudden
                                var suddenS  = (day.values[0].s) - preS;
                                day.values.forEach(e=> e.df = sudden);
                                // day.values.forEach(e=> e.ds = suddenS); //sudden
                                day.values.forEach(e=> e.ds = suddenS);
                                pre = day.values[0].f;
                                preS = day.values[0].s;
                                preday = new Date(day.key);
                            })
                        }
                );
            })


    // d3.queue()
    //     .defer(d3.json,"src/data/dataout.json")
    //     .await((error, d)=> {
    //         data = d.map(e=> {e.source = "cnbc"; return e;});
    //
    //     });


});