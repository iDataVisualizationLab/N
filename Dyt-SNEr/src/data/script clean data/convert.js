Promise.all([
    d3.json("../raw/LabolForce.json"),
    d3.json("../raw/StateAndAreaEmployment.json"),
]).then(function(files) {
    // files[0] will contain file1.csv
    // files[1] will contain file2.csv
    console.log(files[0])
    var data ={};
    data["Variables"] = [];
    data["Countries"] = []
    data["YearsData"] = [];
    data["TimeMatch"] =[];
    var nests = d3.nest()
        .key(d=>d.state)
        .key(d=>d.industry).entries(files[1]);

    // var nestsLaborAll = d3.nest()
    //     .key(d=>d.state)
    //     .key(d=>d.Measure)
    //     .rollup(d=>d[0]).entries(files[0]);

    var nestsLabor =  d3.nest()
        .key(d=>d.state)
        .rollup(d=>d[0]).entries(files[0].filter(d=>d.Measure ==="labor force"));

    var nestsUnemploymentrate =  d3.nest()
        .key(d=>d.state)
        .rollup(d=>d[0]).entries(files[0].filter(d=>d.Measure ==="unemployment rate"));

    data["Countries"] = _.intersection(nests.map(d=>d.key) , nestsLabor.map(d=>d.key));
    data["Countries"] = _.without(data["Countries"],'District of Columbia')
    data["Variables"] = nests[0].values.map(d=>d.key);

    nests.forEach(n=>{
        data["Variables"] = _.intersection(data["Variables"],n.values.map(d=>d.key));
    });
    data["Variables"] = _.without(data["Variables"],'Total Nonfarm','Total Private','Service-Providing','Private Service Providing')
    data["Variables"] = ["Mining, Logging and Construction","Manufacturing","Information","Financial Activities","Professional and Business Services","Education and Health Services","Leisure and Hospitality","Other Services"];
    var limitTime = nests[0].values[0].values[0].data.indexOf(1);
    data["TimeMatch"] = nests[0].values[0].values[0].time.slice(0,limitTime);

    var nestsByIn = d3.nest()
        .key(d=>d.industry)
        .key(d=>d.state).entries(files[1]);

    var min = Infinity;
    var max = -Infinity;
    data["Countries"].forEach((c,ci)=>{
        var instance = nests.find(n=>n.key===c).values;
        var instanceLabor = nestsLabor.find(n=>n.key===c).value.data;
        data["TimeMatch"].forEach((t,ti)=> {
            data["Variables"].forEach((s, si) => {
                if (data["YearsData"][ti]===undefined)
                    data["YearsData"][ti]={};
                if (data["YearsData"][ti]['s'+si]===undefined)
                    data["YearsData"][ti]['s'+si]=[];
                var v = instance.find(d => d.key === s);
                if (v) {
                    v =v.values[0].data[ti] / instanceLabor[ti] * 1000;
                    if (instanceLabor[ti] !== 1 && v !== 1) {
                        min = v < min ? v : min;
                        // if(v>1)
                        //    console.log(s+': '+v+' '+t+' '+c)
                        max = v > max ? v : max;
                    } else {
                        v = 0;
                        console.log(v);
                        console.log(instance.find(d => d.key === s).values[0].data[ti]);
                        console.log('0_0')
                    }
                }else{
                    v=0;
                }
                data["YearsData"][ti]['s'+si][ci] = v;
            });
            console.log(c+' '+ti)
            var nextVar = data["Variables"].length;
            if (data["YearsData"][ti]===undefined)
                data["YearsData"][ti]={};
            if (data["YearsData"][ti]['s'+nextVar]===undefined)
                data["YearsData"][ti]['s'+nextVar]=[];
            var v = nestsUnemploymentrate.find(d=>d.key===c);
            if (v) {
                v =v.value.data[ti]/100;
                if (instanceLabor[ti] !== 1 && v !== 1) {
                    min = v < min ? v : min;
                    // if(v>1)
                    //    console.log(s+': '+v+' '+t+' '+c)
                    max = v > max ? v : max;
                } else {
                    console.log(v);
                    console.log(instance.find(d => d.key === s).values[0].data[ti]);
                    console.log('0_0')
                }
            }else{
                v=0;
            }
            data["YearsData"][ti]['s'+nextVar][ci] = v;

        });
    });
    data["Variables"].push("Unemployment rate")


    // normalize
    data["YearsData"].forEach(y=>{
        Object.keys(y).forEach(s=>{
            y[s] = y[s].map(d=>(d)/(max));
        })
    });


    console.log(JSON.stringify(data))
    // normalize





}).catch(function(err) {
    // handle error here
})

var tables = $('table.regular-data');
var nests = [];
var months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
for (var i=0;i<tables.length;i++){
    var nestitem ={}
    var titles = tables[i].querySelector('pre').innerText.split('\n');
    var state = titles[2].split(':')[1].trim();
    var type = titles[5].split(':')[1].trim();
    var type_label = titles[5].split(':')[0].trim();
    var arr = tables[i].querySelectorAll('tbody tr');
    nestitem.data =[];
    nestitem.time =[];
    for (var j=0;j<arr.length;j++) {
        var year = arr[j].querySelector('th').textContent;
        var numbers = arr[j].querySelectorAll('td');
        for (var z=0;z<numbers.length;z++) {
            nestitem.data.push(++numbers[z].textContent.split('(')[0]);
            nestitem.time.push(months[z]+' '+year);
        }
    }
    nestitem.state = state;
    nestitem[type_label] = type;

    nests.push(nestitem);
}