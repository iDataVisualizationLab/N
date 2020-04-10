var query_time
let globalFilter ={};
let keyLeader //=
let data_second=[],data_second_service={};
let dataRaw;
let vocanoData;
let isinit = true
let disablelist = ['PValue','FDR','abs(logFC)','abs(logCPM)'];

blackGenes = ["AT3G09260"]
function initApp(file,isSplit,preloadFile){
    // load filter file
    preloader(true,undefined,'Read filter file...');
    globalFilter={}

    loadGlobalFilter(preloadFile).then(()=>{
        preloader(true,undefined,'Read data file...');
        readFilecsv(file,isSplit);
    });
}
function loadGlobalFilter(preloadFile){
    return preloadFile? d3.json(`${srcpath}data/${preloadFile}.json`).then(function(d){globalFilter = d;}) : new Promise(function(resolve, reject){
        resolve(true);})
}
function loadCPMData(file){
    data_second=[],data_second_service={};
    return d3.csv(`${srcpath}data/${file}_cpm.csv`).then(data=>{
        preloader(true,undefined, 'reading cpm file...');
        let variables = Object.keys(data[0]);
        variables.shift();
        // if(blackGenes)
        //     data = data.filter(d=>!blackGenes.find(b=>new RegExp(b).test(d[IDkey])));
        data_second_service = {};
        global_range = [0,0];
        variables.forEach((k,i)=>{
            data_second_service[k] = {text:k,range:d3.extent(data,d=>(d[k]=+d[k],d[k]))};
            if(global_range[1]<data_second_service[k].range[1])
                global_range[1] = data_second_service[k].range[1];
        });
        variables.forEach(s=>{
            data_second_service[s].range = global_range;
        });
        scaleService = d3.keys(data_second_service).map(k=>d3.scaleLinear().domain(data_second_service[k].range));
        data_second = {};

        data.forEach(d=>{
            variables.forEach(k=>d[k] = d[k]===""?null:(+d[k]))// format number
            const name = d[IDkey];
            const fixname = name.replace('|','__');
            data_second[fixname] = {};
            variables.forEach((attr, i) => {
                data_second[fixname][attr] =  d[variables[i]];
            });
        }); // format number
        preloader(false);
    })
}
function loadVocano(file,data){
    return d3.csv(`${srcpath}data/${file}_FDR.csv`).then(d=>{
        let keyInput = Object.keys(d[0]);
        keyInput.shift();
        d.sort((a,b)=>a[""]-b[""]).forEach(e=>(d3.keys(e).forEach(f=>e[f]=+e[f]),e.name = hosts[e[""]-1].name));
        console.log(d)
        let logKey = Object.keys(d[0]).filter(k=>k.includes('log'))
        logKey.forEach(k=>keyInput.push(`abs(${k})`))
        d.forEach((e,i)=>{
            logKey.forEach(k=>e[`abs(${k})`]=Math.abs(e[k]));
            keyInput.forEach(k=>data[i][k]=e[k])
        });
        vocanoData = d
    })
}
function formatService(init){
    // if (runopt.minMax)
    //     calculateServiceRange();
    // else
    serviceLists.forEach(s=>{
        if(s.text.split('vs.').length>1) {
            s.enable = false;
            s.sub[0].enable = false;
        }
    })
    serviceFullList_Fullrange = _.cloneDeep(serviceFullList);
    conf.serviceList = serviceList;
    conf.serviceLists = serviceLists;
    conf.serviceListattr = serviceListattr;
    conf.serviceListattrnest = serviceListattrnest;
    drawFiltertable();
}
let primaxis =[];
function readFilecsv(filename,notSplit) {
    dataInformation.filename = filename+'.csv';
    let filePath = srcpath+`data/${filename}.csv`;
    exit_warp();
    preloader(true);
    $('#enableCPM_control')[0].checked = true;
    d3.csv(filePath)
        .then(function (data) {

            db = "csv";
            newdatatoFormat(data, notSplit);
            primaxis =serviceFullList.map(d=>d.text);
            loadVocano(filename, data).then(() => {
                newdatatoFormat(data, notSplit);

                inithostResults();
                serviceListattrnest = serviceLists.map(d => ({
                    key: d.text, sub: d.sub.map(e => e.text)
                }));

                serviceFullList.forEach(s=>disablelist.find(d=>d===s.text)?s.enable=false:null)
                selectedService = serviceLists[0].text;
                formatService(true);
                processResult = processResult_csv;

                // draw Metric summary on left panel


                updateDatainformation(sampleS['timespan']);

                d3.select(".currentDate")
                    // .text("" + (sampleS['timespan'][0]).toDateString());
                    .text(dataInformation.filename);
                dataRaw = object2DataPrallel(sampleS);
                loadCPMData(filename).then(()=> {
                    d3.select('#enableCPM_control').classed('hide',false);
                    if (!isinit)
                        resetRequest();
                    else
                        init();
                    d3.select('#enableCPM_control').dispatch('change');
                }).catch(()=>{
                    d3.select('#enableCPM_control').classed('hide',true);
                    if (!isinit)
                        resetRequest();
                    else
                        init();
                })

                preloader(false);
            }).catch(e => {
                vocanoData = undefined;
                inithostResults();
                serviceListattrnest = serviceLists.map(d => ({
                    key: d.text, sub: d.sub.map(e => e.text)
                }));
                selectedService = serviceLists[0].text;
                formatService(true);
                processResult = processResult_csv;

                // draw Metric summary on left panel


                updateDatainformation(sampleS['timespan']);

                d3.select(".currentDate")
                    // .text("" + (sampleS['timespan'][0]).toDateString());
                    .text(dataInformation.filename);
                dataRaw = object2DataPrallel(sampleS);
                loadCPMData(filename).then(()=> {
                    d3.select('#enableCPM_control').classed('hide',false);
                    if (!isinit)
                        resetRequest();
                    else
                        init();
                    d3.select('#enableCPM_control').dispatch('change');
                }).catch(()=>{
                    d3.select('#enableCPM_control').classed('hide',true);
                    if (!isinit)
                        resetRequest();
                    else
                        init();
                })

                preloader(false);
            })
        })
}
function readData() {
    let hostResults = {}, hosts=[];
    let hostsList = _.without(d3.keys(sampleS),'timespan');
    let count = 0;
    let comphost;
    let lengthData = sampleS.timespan.length;
    let iterationstep =lengthData-1;
    sampleS.timespan = sampleS.timespan.map(d=>new Date(d));
    hostsList.forEach(att => {
        var h = {};
        h.name = att;
        h.hpcc_rack = +att.split("-")[1];
        h.hpcc_node = +att.split("-")[2].split(".")[0];
        h.index = hosts.length;

        // to contain the historical query results
        hostResults[h.name] = {};
        hostResults[h.name].index = h.index;
        hostResults[h.name].arrTemperature = [];
        hostResults[h.name].arrCPU_load = [];
        hostResults[h.name].arrMemory_usage = [];
        hostResults[h.name].arrFans_health = [];
        hostResults[h.name].arrPower_usage = [];
        hostResults[h.name].arrTime = [];
        hosts.push(h);
        readDataList(count,0);
        count++;

        function readDataList(count,iteration) {
            var name= hosts[count].name;
            for (i = 0; i < iterationstep; i++) {
                query_time = undefined;

                serviceListattr.forEach((sv, si)=> {
                    var result = simulateResults2(hosts[count].name, iteration, serviceList[si]);
                    // query_time = result.result.query_time||query_time;
                    // name = result.data.service.host_name||name;
                    result = result.map(d=>d!==null?d:undefined)
                    hostResults[name][sv].push(result);
                });
                iteration++;
            }
            hostResults[name]['arrTime']=sampleS.timespan;
            return iteration;
        }

    })
    return hostResults;

}

function object2Data(ob){
    return d3.entries(ob).filter(d=>d.key!=='timespan');
}

function object2DataPrallel(ob){
    var temp = object2Data(ob);
    var count = 0;
    var newdata =[];
    temp.forEach(com=>{
        var comlength = com.value[serviceListattrnest[0].key].length;
        var namet = com.key.split('_');
        var rack;
        var host;
        if (namet.length>1) {
            rack = namet[1];
            host = namet[0];
        }else{
            rack = com.key;
            host = com.key;
        }
        for (i = 0; i<comlength; i++){
            var eachIn = {};
            var validkey =true;
            serviceListattrnest.forEach(s=>{
                s.sub.forEach((sub,sj)=>{
                    eachIn[sub] = com.value[s.key][i][sj];
                    // validkey = validkey&&(eachIn[sub]!==undefined)
                });
            });

            if (validkey) {
                // eachIn.Time = new Date(d3.timeFormat("%B %d %Y %H:%M")(com.value['arrTime'][i]));
                eachIn.Category = rack;
                eachIn.rack = namet.length>1?(rack==='wt'?'Wild type':'Stop 1'):'Genes';
                eachIn.compute = host;
                eachIn.group =  eachIn.rack;
                eachIn.name = com.key;
                eachIn.id = com.key + "-" + count;
                count++;
                newdata.push(eachIn);
            }
        }

    });
    // return newdata.filter(d=>d.Time< new Date('Thu Mar 21 2019 16:20:00 GMT-0500 (Central Daylight Time)'))
    return newdata;
}

function colorbyCategory(data,key) {
    var listKey = _(data).unique(key).map(d=>d[key]).naturalSort();
    var listcolor= listKey.map(colorscale);
    colors.domain(listKey).range(listcolor);
    color = colors;
}
function colorbyValue(order) {
    var listcolor= order.map(d=>color(d.value));
    colors.domain(order.map(d=>d.text)).range(listcolor);
}