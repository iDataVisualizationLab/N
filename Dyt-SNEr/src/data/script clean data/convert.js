// Promise.all([
//     d3.json("../raw/LabolForce.json"),
//     d3.json("../raw/StateAndAreaEmployment.json"),
// ]).then(function(files) {
//     // files[0] will contain file1.csv
//     // files[1] will contain file2.csv
//     console.log(files[0])
//     var data ={};
//     data["Variables"] = [];
//     data["Countries"] = []
//     data["YearsData"] = [];
//     data["TimeMatch"] =[];
//     var nests = d3.nest()
//         .key(d=>d.state)
//         .key(d=>d.industry).entries(files[1]);
//
//     // var nestsLaborAll = d3.nest()
//     //     .key(d=>d.state)
//     //     .key(d=>d.Measure)
//     //     .rollup(d=>d[0]).entries(files[0]);
//
//     var nestsLabor =  d3.nest()
//         .key(d=>d.state)
//         .rollup(d=>d[0]).entries(files[0].filter(d=>d.Measure ==="labor force"));
//
//     var nestsUnemploymentrate =  d3.nest()
//         .key(d=>d.state)
//         .rollup(d=>d[0]).entries(files[0].filter(d=>d.Measure ==="unemployment rate"));
//
//     data["Countries"] = _.intersection(nests.map(d=>d.key) , nestsLabor.map(d=>d.key));
//     data["Countries"] = _.without(data["Countries"],'District of Columbia')
//     data["Variables"] = nests[0].values.map(d=>d.key);
//
//     nests.forEach(n=>{
//         data["Variables"] = _.intersection(data["Variables"],n.values.map(d=>d.key));
//     });
//     data["Variables"] = _.without(data["Variables"],'Total Nonfarm','Total Private','Service-Providing','Private Service Providing')
//     data["Variables"] = ["Mining, Logging and Construction","Manufacturing","Information","Financial Activities","Professional and Business Services","Education and Health Services","Leisure and Hospitality","Other Services"];
//     var limitTime = nests[0].values[0].values[0].data.indexOf(1);
//     data["TimeMatch"] = nests[0].values[0].values[0].time.slice(0,limitTime);
//
//     var nestsByIn = d3.nest()
//         .key(d=>d.industry)
//         .key(d=>d.state).entries(files[1]);
//
//     var min = Infinity;
//     var max = -Infinity;
//     data["Countries"].forEach((c,ci)=>{
//         var instance = nests.find(n=>n.key===c).values;
//         var instanceLabor = nestsLabor.find(n=>n.key===c).value.data;
//         data["TimeMatch"].forEach((t,ti)=> {
//             data["Variables"].forEach((s, si) => {
//                 if (data["YearsData"][ti]===undefined)
//                     data["YearsData"][ti]={};
//                 if (data["YearsData"][ti]['s'+si]===undefined)
//                     data["YearsData"][ti]['s'+si]=[];
//                 var v = instance.find(d => d.key === s);
//                 if (v) {
//                     v =v.values[0].data[ti] / instanceLabor[ti] * 1000;
//                     if (instanceLabor[ti] !== 1 && v !== 1) {
//                         min = v < min ? v : min;
//                         // if(v>1)
//                         //    console.log(s+': '+v+' '+t+' '+c)
//                         max = v > max ? v : max;
//                     } else {
//                         v = 0;
//                         console.log(v);
//                         console.log(instance.find(d => d.key === s).values[0].data[ti]);
//                         console.log('0_0')
//                     }
//                 }else{
//                     v=0;
//                 }
//                 data["YearsData"][ti]['s'+si][ci] = v;
//             });
//             console.log(c+' '+ti)
//             var nextVar = data["Variables"].length;
//             if (data["YearsData"][ti]===undefined)
//                 data["YearsData"][ti]={};
//             if (data["YearsData"][ti]['s'+nextVar]===undefined)
//                 data["YearsData"][ti]['s'+nextVar]=[];
//             var v = nestsUnemploymentrate.find(d=>d.key===c);
//             if (v) {
//                 v =v.value.data[ti]/100;
//                 if (instanceLabor[ti] !== 1 && v !== 1) {
//                     min = v < min ? v : min;
//                     // if(v>1)
//                     //    console.log(s+': '+v+' '+t+' '+c)
//                     max = v > max ? v : max;
//                 } else {
//                     console.log(v);
//                     console.log(instance.find(d => d.key === s).values[0].data[ti]);
//                     console.log('0_0')
//                 }
//             }else{
//                 v=0;
//             }
//             data["YearsData"][ti]['s'+nextVar][ci] = v;
//
//         });
//     });
//     data["Variables"].push("Unemployment rate")
//
//
//     // normalize
//     data["YearsData"].forEach(y=>{
//         Object.keys(y).forEach(s=>{
//             y[s] = y[s].map(d=>(d)/(max));
//         })
//     });
//
//
//     console.log(JSON.stringify(data))
//     // normalize
//
//
//
//
//
// }).catch(function(err) {
//     // handle error here
// })
//
// var tables = $('table.regular-data');
// var nests = [];
// var months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
// for (var i=0;i<tables.length;i++){
//     var nestitem ={}
//     var titles = tables[i].querySelector('pre').innerText.split('\n');
//     var state = titles[2].split(':')[1].trim();
//     var type = titles[5].split(':')[1].trim();
//     var type_label = titles[5].split(':')[0].trim();
//     var arr = tables[i].querySelectorAll('tbody tr');
//     nestitem.data =[];
//     nestitem.time =[];
//     for (var j=0;j<arr.length;j++) {
//         var year = arr[j].querySelector('th').textContent;
//         var numbers = arr[j].querySelectorAll('td');
//         for (var z=0;z<numbers.length;z++) {
//             nestitem.data.push(++numbers[z].textContent.split('(')[0]);
//             nestitem.time.push(months[z]+' '+year);
//         }
//     }
//     nestitem.state = state;
//     nestitem[type_label] = type;
//
//     nests.push(nestitem);
// }

Promise.all([
    d3.text("../raw/state.txt"),
    d3.text("../raw/IndustryFiltered.txt"),
    d3.tsv("../raw/fullstatecode.txt"),
    d3.csv("../raw/employ1.txt"),
]).then(function(files) {
    // files[0] will contain file1.csv
    // files[1] will contain file2.csv
    var data ={};
    data["Variables"] = [];
    data["Countries"] = files[0].split('\n').filter(d=>d!=="").map(d=>d.trim());
    data["YearsData"] = [];
    data["TimeMatch"] =files[3].columns.filter(d=> d!=='Series ID' && d.match("Annual ")===null);
    data["TimeMatch"].shift();
    states = files[2];
    var industries = files[1].split('\n').filter(d=>d!="").map(d=> {return {code: d.split('\t')[0],value:d.split('\t')[1].trim()}});
    data["Variables"] = industries.map(d=>d.value);
    // data["Variables"].shift();
    function generatecode(pre,state,industry){
        const statecode = states.find(d=>d['state_name']===state)['state_code'];
        const inscode = industries.find(d=>d['value']===industry)['code'];
        return pre+statecode+'00000'+inscode+'01';
    }
    dataRaw = files[3]
    var min = Infinity;
    var max = -Infinity;
    var arALL =[]
    data["Countries"].forEach((c,ci)=>{
        data["TimeMatch"].forEach((t,ti)=> {
            data["Variables"].forEach((s, si) => {
                if (data["YearsData"][ti]===undefined)
                    data["YearsData"][ti]={};
                if (data["YearsData"][ti]['s'+si]===undefined)
                    data["YearsData"][ti]['s'+si]=[];
                var code = generatecode('SMS',c,s);
                instance = dataRaw.find(d=>d['Series ID']===code);
                var v = 0;
                if (instance) {
                    v = + instance[t].split('(')[0];
                    v = Math.abs(v);
                    min = v < min ? v : min;
                    max = v > max ? v : max;
                    arALL.push(v)
                }
                data["YearsData"][ti]['s'+si][ci] = v;
            });

        });
    });

    max = Math.min(20,max);
    invalidTime = Infinity;
    // normalize
    data["YearsData"].forEach((y,i)=>{
        let invalidKey = 0;
        Object.keys(y).forEach(s=>{
            y[s] = y[s].map(d=>{invalidKey+=d; return (Math.min(d,max))/(max)});
            invalidKey = (y[s].indexOf(0)!==-1)||invalidKey;
            // y[s] = y[s].map(d=>d/100);
        });
        if (invalidKey===0)
            invalidTime = i<invalidTime?i:invalidTime;
    });
    console.log(invalidTime);
    data["YearsData"] = data["YearsData"].slice(0,invalidTime);
    data["TimeMatch"] = data["TimeMatch"].slice(0,invalidTime);

    console.log(JSON.stringify(data))
    // normalize





}).catch(function(err) {
    // handle error here
})
//
// var tables = $('table.regular-data');
// var nests = [];
// var months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
// for (var i=0;i<tables.length;i++){
//     var nestitem ={}
//     var titles = tables[i].querySelector('pre').innerText.split('\n');
//     var state = titles[2].split(':')[1].trim();
//     var type = titles[5].split(':')[1].trim();
//     var type_label = titles[5].split(':')[0].trim();
//     var arr = tables[i].querySelectorAll('tbody tr');
//     nestitem.data =[];
//     nestitem.time =[];
//     for (var j=0;j<arr.length;j++) {
//         var year = arr[j].querySelector('th').textContent;
//         var numbers = arr[j].querySelectorAll('td');
//         for (var z=0;z<numbers.length;z++) {
//             nestitem.data.push(++numbers[z].textContent.split('(')[0]);
//             nestitem.time.push(months[z]+' '+year);
//         }
//     }
//     nestitem.state = state;
//     nestitem[type_label] = type;
//
//     nests.push(nestitem);
// }