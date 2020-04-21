d3.csv("src/data/raw/metadata.csv").then(function(data){
    data = data.filter(e=>e.publish_time!==""&&!_.isNaN(+new Date(e.publish_time))&&filterYear(e));
    data.forEach(d=>delete d['cord_uid'])
    key = Object.keys(data[0]);
    csv =Object.keys(data[0]).join(',');
    data = data.filter(d=>d3.values(d).length===key.length);

    csv+= '\n'+data.map(e=>d3.values(e).map(f=>`"${f.replace(/"/gi,'')}"`).join(',')).join('\n');
    console.log(csv)
});


d3.csv('src/data/raw/covid19_processed_short.csv').then(d=>{
    d=d.filter(e=>e.term!==""&&e.publish_time!==""&&!_.isNaN(+new Date(e.publish_time))&&filterYear(e));
    csv = d3.keys(d[0]).join(',');
    csv+= '\n'+d.map(e=>d3.values(e).map(f=>`"${f.replace(/"/gi,'')}"`).join(',')).join('\n');
    console.log(csv)
})



// generate data for word stream

let ws=[];
for (var m = 1; m < totalTimeSteps; m++) {
    let tempDate ={
        date: timeScaleIndex.invert(m).toString(),
        words: {}
    }
    catergogryList.forEach(c=>{
        let w=[];
        let cname = c.value.text||c.key;
        for (var att in terms) {
            if (terms[att].category===c.key && terms[att][m]!==undefined){
                w.push({
                    sudden: terms[att].sudden[m],
                    text: att,
                    frequency: terms[att][m],
                    topic: cname,
                    id: str2id(att)+'_'+str2id(cname)+'_'+m
                })
            }
        }
        tempDate.words[cname] = w
    })
    ws.push(tempDate)
    function str2id(s) {
        return 'a'+s.replace(/ |-|#/gi,'_'); // avoid number
    }
}
console.log(JSON.stringify(ws))
// generate data for space phaser

let ws=[];
for (var m = 1; m < totalTimeSteps; m++) {
    let tempDate ={
        date: timeScaleIndex.invert(0).toString(),
        words: {}
    }
    catergogryList.forEach(c=>{
        let w=[];
        let cname = c.value.text||c.key;
        for (var att in terms) {
            if (terms[att].category===c.key && terms[att][m]!==undefined){
                w.push({
                    sudden: terms[att].sudden[m],
                    text: att,
                    frequency: terms[att][m],
                    topic: cname,
                    id: str2id(att)+'_'+str2id(cname)+'_'+m
                })
            }
        }
        tempDate.words[cname] = w
    })
    ws.push(tempDate)
    function str2id(s) {
        return 'a'+s.replace(/ |-|#/gi,'_'); // avoid number
    }
}

// generate data for finaviz
let jsonD = TimeArc.data().map(d=>{
    let termsC = [];
    d3.entries(d.category).forEach(t=>{
        d3.keys(t.value).forEach(w=>{
            termsC.push({"term":w,"category": catergogryObject[t.key].text||t.key})
        })
    })
    return {"title":d.title,
        "source":d.source,
        "keywords":termsC,
        "body":d.abstract,
        "time":+d.date,
        "url":d.doi,
        "urlToImage":""
    };
})
console.log(JSON.stringify(jsonD ))
