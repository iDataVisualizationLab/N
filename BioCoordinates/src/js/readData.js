var query_time
let globalFilter ={};
let keyLeader //= "TF_DE";
function initApp(){
    // load filter file
    preloader(true,undefined,'Read filter file...');
    d3.json(srcpath+'data/STOP1_targets.json').then(function(d){
        globalFilter = d;
        // init read file
        preloader(true,undefined,'Read data file...');
        readFilecsv(d3.select('#datacom').node().value);
    });
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
function readFilecsv(filename) {
    dataInformation.filename = filename+'.csv';
    let filePath = srcpath+`data/${filename}.csv`;
    exit_warp();
    preloader(true);
    d3.csv(filePath)
    //     .on("progress", function(evt) {
    //     if (evt.total) {
    //         preloader(true, 0, "File loaded: " + Math.round(evt.loaded/evt.total*100)+'%');
    //         dataInformation.size = evt.total;
    //     }else{
    //         preloader(true, 0, "File loaded: " +bytesToString(evt.loaded));
    //         dataInformation.size = evt.loaded;
    //     }
    //     // console.log("Amount loaded: " + Math.round(evt.loaded/evt.total*100)+'%')
    // })
        .then(function (data) {

            db = "csv";
            newdatatoFormat(data);

            inithostResults();
            serviceListattrnest = serviceLists.map(d=>({
                key:d.text,sub:d.sub.map(e=>e.text)
            }));
            selectedService = serviceLists[0].text;
            formatService(true);
            processResult = processResult_csv;

            // draw Metric summary on left panel


            updateDatainformation(sampleS['timespan']);

            d3.select(".currentDate")
            // .text("" + (sampleS['timespan'][0]).toDateString());
                .text(dataInformation.filename);

            // if (!init)
            //     resetRequest();
            // else
                init();

            preloader(false);
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