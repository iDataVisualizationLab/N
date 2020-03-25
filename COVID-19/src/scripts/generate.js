d3.csv('src/data/raw/covid19_processed_short.csv').then(d=>{
    d=d.filter(e=>e.term!==""&&e.publish_time!==""&&!_.isNaN(+new Date(e.publish_time))&&filterYear(e));
    csv = d3.keys(d[0]).join(',');
    csv+= '\n'+d.map(e=>d3.values(e).map(f=>`"${f.replace(/"/gi,'')}"`).join(',')).join('\n');
    console.log(csv)
})