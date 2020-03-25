csv = d3.keys(d[0]).join(',')
csv+= '\n'+d.map(e=>d3.values(e).map(f=>`"${f}"`)).join('\n')
console.log(csv)