var application_name ='Joblist';

var sampleS,outlyingList = [];
outlyingList.pointObject = {};

var jobList=[];
var cluster_info,clusterDescription,clusterGroup={};
var hostList;
var serviceList = ["Temperature","Memory_usage","Fans_speed","Power_consum","Job_scheduling"];
var serviceList_selected = [{"text":"Temperature","index":0},{"text":"Memory_usage","index":1},{"text":"Fans_speed","index":2},{"text":"Power_consum","index":3}];

var serviceListattr = ["arrTemperature","arrMemory_usage","arrFans_health","arrPower_usage","arrJob_scheduling"];
var serviceLists = [{"text":"Temperature","id":0,"enable":true,"sub":[{"text":"CPU1 Temp","id":0,"enable":true,"idroot":0,"angle":5.585053606381854,"range":[3,98]},{"text":"CPU2 Temp","id":1,"enable":true,"idroot":0,"angle":0,"range":[3,98]},{"text":"Inlet Temp","id":2,"enable":true,"idroot":0,"angle":0.6981317007977318,"range":[3,98]}]},{"text":"Memory_usage","id":1,"enable":true,"sub":[{"text":"Memory usage","id":0,"enable":true,"idroot":1,"angle":1.5707963267948966,"range":[0,99]}]},{"text":"Fans_speed","id":2,"enable":true,"sub":[{"text":"Fan1 speed","id":0,"enable":true,"idroot":2,"angle":2.4870941840919194,"range":[1050,17850]},{"text":"Fan2 speed","id":1,"enable":true,"idroot":2,"angle":2.923426497090502,"range":[1050,17850]},{"text":"Fan3 speed","id":2,"enable":true,"idroot":2,"angle":3.3597588100890845,"range":[1050,17850]},{"text":"Fan4 speed","id":3,"enable":true,"idroot":2,"angle":3.796091123087667,"range":[1050,17850]}]},{"text":"Power_consum","id":3,"enable":true,"sub":[{"text":"Power consumption","id":0,"enable":true,"idroot":3,"angle":4.71238898038469,"range":[0,200]}]}];
var serviceLists_or = [{"text":"Temperature","id":0,"enable":true,"sub":[{"text":"CPU1 Temp","id":0,"enable":true,"idroot":0,"angle":5.585053606381854,"range":[3,98]},{"text":"CPU2 Temp","id":1,"enable":true,"idroot":0,"angle":0,"range":[3,98]},{"text":"Inlet Temp","id":2,"enable":true,"idroot":0,"angle":0.6981317007977318,"range":[3,98]}]},{"text":"Memory_usage","id":1,"enable":true,"sub":[{"text":"Memory usage","id":0,"enable":true,"idroot":1,"angle":1.5707963267948966,"range":[0,99]}]},{"text":"Fans_speed","id":2,"enable":true,"sub":[{"text":"Fan1 speed","id":0,"enable":true,"idroot":2,"angle":2.4870941840919194,"range":[1050,17850]},{"text":"Fan2 speed","id":1,"enable":true,"idroot":2,"angle":2.923426497090502,"range":[1050,17850]},{"text":"Fan3 speed","id":2,"enable":true,"idroot":2,"angle":3.3597588100890845,"range":[1050,17850]},{"text":"Fan4 speed","id":3,"enable":true,"idroot":2,"angle":3.796091123087667,"range":[1050,17850]}]},{"text":"Power_consum","id":3,"enable":true,"sub":[{"text":"Power consumption","id":0,"enable":true,"idroot":3,"angle":4.71238898038469,"range":[0,200]}]}];
var serviceFullList = serviceLists2serviceFullList(serviceLists);

var serviceFullList_Fullrange = serviceLists2serviceFullList(serviceLists);

srcpath = '';


const IDkey = 'atID';
const SUBJECTS = ['wt','stop1'];

let jobMap_opt = {
    margin:{top:90,bottom:20,left:20,right:20},
    width: 1000,
    height:500,
    node:{
        r: 5,
    },
    job: {
        r: 10,
        r_inside: 2,
    },user:{
        r: 10,
    },
    radaropt : {
        // summary:{quantile:true},
        mini:true,
        levels:6,
        gradient:true,
        w:40,
        h:40,
        showText:false,
        margin: {top: 0, right: 0, bottom: 0, left: 0},
    },
}
let jobMap_runopt = {
    compute:{type:'radar',clusterJobID:true,clusterJobID_info:{groupBy:1800000},clusterNode:true,},
    graphic:{colorBy:'group'},
    histodram:{resolution:11},
    mouse:{auto:true, lensing: false}
}
function zoomtoogle(event) {
    let oldvval = d3.select(event).classed('lock');
    jobMap.zoomtoogle(!oldvval);
    d3.select(event).classed('lock',!oldvval);
}
function distanceL2(a, b){
    let dsum = 0;
    a.forEach((d,i)=> {dsum +=(d-b[i])*(d-b[i])});
    return Math.round(Math.sqrt(dsum)*Math.pow(10, 10))/Math.pow(10, 10);
}
function distanceL1(a,b) {
    let dsum = 0;
    a.forEach((d,i)=> {dsum +=Math.abs(d-b[i])}); //modified
    return Math.round(dsum*Math.pow(10, 10))/Math.pow(10, 10);
}
function getClusterName (name,index){
    return (sampleS[name].arrcluster||[])[index];
}
function islastimestep(index){
    if(isRealtime)
        return false;
    else
        return index>sampleS.timespan.length-1;
}

// overide getjoblist
function getJoblist (iteration,reset){
    try {
        iteration = iteration||lastIndex
        if (reset===true || reset===undefined)
            jobList = [];
        jobList = sampleJobdata.filter(s=>new Date(s.startTime)<sampleS.timespan[iteration]&&(s.endTime?new Date(s.endTime)>sampleS.timespan[iteration]:true));
        //draw userlist data
        TSneplot.drawUserlist(query_time);
    }catch(e){}
}
function current_userData () {
    let jobByuser = d3.nest().key(function(uD){return uD.user}).entries( jobList);
    jobByuser.forEach(d=>d.unqinode= _.chain(d.values).map(d=>d.nodes).flatten().uniq().value());
    return jobByuser;
}
function systemFormat() {
    jobList=[];
    serviceList = ["Temperature","Memory_usage","Fans_speed","Power_consum","Job_scheduling"];
    serviceList_selected = [{"text":"Temperature","index":0},{"text":"Memory_usage","index":1},{"text":"Fans_speed","index":2},{"text":"Power_consum","index":3}];

    serviceListattr = ["arrTemperature","arrMemory_usage","arrFans_health","arrPower_usage","arrJob_scheduling"];
    serviceLists = [{"text":"Temperature","id":0,"enable":true,"sub":[{"text":"CPU1 Temp","id":0,"enable":true,"idroot":0,"angle":5.585053606381854,"range":[3,98]},{"text":"CPU2 Temp","id":1,"enable":true,"idroot":0,"angle":0,"range":[3,98]},{"text":"Inlet Temp","id":2,"enable":true,"idroot":0,"angle":0.6981317007977318,"range":[3,98]}]},{"text":"Memory_usage","id":1,"enable":true,"sub":[{"text":"Memory usage","id":0,"enable":true,"idroot":1,"angle":1.5707963267948966,"range":[0,99]}]},{"text":"Fans_speed","id":2,"enable":true,"sub":[{"text":"Fan1 speed","id":0,"enable":true,"idroot":2,"angle":2.4870941840919194,"range":[1050,17850]},{"text":"Fan2 speed","id":1,"enable":true,"idroot":2,"angle":2.923426497090502,"range":[1050,17850]},{"text":"Fan3 speed","id":2,"enable":true,"idroot":2,"angle":3.3597588100890845,"range":[1050,17850]},{"text":"Fan4 speed","id":3,"enable":true,"idroot":2,"angle":3.796091123087667,"range":[1050,17850]}]},{"text":"Power_consum","id":3,"enable":true,"sub":[{"text":"Power consumption","id":0,"enable":true,"idroot":3,"angle":4.71238898038469,"range":[0,200]}]}];
    serviceFullList = serviceLists2serviceFullList(serviceLists);
    serviceListattrnest = [
        {key:"arrTemperature", sub:["CPU1 Temp","CPU2 Temp","Inlet Temp"]},
        {key:"arrMemory_usage", sub:["Memory usage"]},
        {key:"arrFans_health", sub:["Fan1 speed","Fan2 speed","Fan3 speed","Fan4 speed"]},
        {key:"arrPower_usage", sub:["Power consumption"]}];
    serviceAttr = {arrTemperature: {key: "Temperature", val: ["arrTemperatureCPU1","arrTemperatureCPU2"]},
        arrMemory_usage: {key: "Memory_usage", val: ["arrMemory_usage"]},
        arrFans_health: {key: "Fans_speed", val: ["arrFans_speed1","arrFans_speed2"]},
        arrPower_usage:{key: "Power_consumption", val: ["arrPower_usage"]}};
    thresholds = [[3,98], [0,99], [1050,17850],[0,200] ];
    serviceFullList_Fullrange = _.cloneDeep(serviceFullList);
}

function newdatatoFormat (data){
    preloader(true, 0, 'reading file...');
    serviceList = [];
    serviceLists = [];
    serviceListattr = [];
    serviceAttr={};
    hosts =[];

    const variables = _.without(Object.keys(data[0]),'atID');
    // TODO remove this function
    serviceQuery["csv"]= serviceQuery["csv"]||{};
    variables.forEach((k,i)=>{
        serviceQuery["csv"][k]={};
        serviceQuery["csv"][k][k]={
            type : 'number',
            format : () =>k,
            numberOfEntries: 1};
        serviceAttr[k] = {
            key: k,
            val:[k]
        };
        serviceList.push(k);
        serviceListattr.push(k);

        const temp = {"text":k,"id":i,"enable":true,"sub":[{"text":k,"id":0,"enable":true,"idroot":i,"angle":i*2*Math.PI/(variables.length),"range":[0,1]}]};
        thresholds.push([0,1]);
        serviceLists.push(temp);
    });
    serviceList_selected = serviceList.map((d,i)=>{return{text:d,index:i}});
    serviceFullList = serviceLists2serviceFullList(serviceLists);
    scaleService = serviceFullList.map(d=>d3.scaleLinear().domain(d.range));
    sampleS = {};
    tsnedata = {};
    sampleS['timespan'] = [new Date()];

    data.forEach(d=>{
        variables.forEach(k=>d[k] = d[k]===""?null:(+d[k]))// format number
        const name = d[IDkey];
        const fixname = name.replace('|','__');
        const category = name.split('|')[1]==='wt'?0:1;
        hosts.push({
            name: fixname,
            category:category,
            index : hosts.length,
        });
        serviceListattr.forEach((attr,i) => {
            if (sampleS[fixname]===undefined) {
                sampleS[fixname] = {};
                tsnedata[fixname] = [[]];
                tsnedata[fixname][0].name = fixname;
                tsnedata[fixname][0].timestep =0;
                tsnedata[fixname][0].category =category;
            }
            const value = d[variables[i]];
            sampleS[fixname][attr]=[[value]];
            tsnedata[fixname][0].push(value===null?0:scaleService[i](value)||0);
        });
    }); // format number

    // find outliers
    preloader(true, 0, 'Detect outliers...');
    // outlyingList = outlier();
}
// summary metrics
let histodram = {
    resolution:20,
    outlierMultiply: 3
};

function getHistdata(d, name, marker) {
    d = d.filter(e => e !== undefined).sort((a, b) => a - b);
    let r;
    if (d.length) {
        var x = d3.scaleLinear()
            .domain(d3.extent(d));
        var histogram = d3.histogram()
            .domain(x.domain())
            .thresholds(x.ticks(histodram.resolution))    // Important: how many bins approx are going to be made? It is the 'resolution' of the violin plot
            .value(d => d);
        let hisdata = histogram(d);

        let sumstat = hisdata.map(d => [d.x0 + (d.x1 - d.x0) / 2, (d || []).length]);
        r = {
            axis: name,
            q1: ss.quantileSorted(d, 0.25),
            q3: ss.quantileSorted(d, 0.75),
            median: ss.medianSorted(d),
            // outlier: ,
            arr: sumstat
        };
        if (d.length > 4) {
            const iqr = r.q3 - r.q1;
            const lowLimit = r.q3 + histodram.outlierMultiply * iqr;
            const upLimit = r.q1 - histodram.outlierMultiply * iqr;
            r.outlier = _.uniq(d.filter(e => e > lowLimit || e < upLimit));
            if (marker&&d.length>marker){
                
            }
        } else {
            r.outlier = _.uniq(d);
        }
    } else {
        r = {
            axis: name,
            q1: undefined,
            q3: undefined,
            median: undefined,
            outlier: [],
            arr: []
        };
    }
    return r;
}

function getsummaryservice(){
    // let dataf = _.reduce(_.chunk(_.unzip(data),serviceFull_selected.length),function(memo, num){ return memo.map((d,i)=>{d.push(num[i]); return _.flatten(d); })});
    let dataf = _.unzip(_.flatten(_.values(tsnedata),1));
    let ob = {};
    dataf.forEach((d,i)=>{
        let r = getHistdata(d, serviceList_selected[i].text);
        ob[r.axis] = r;

    });
    return ob;
}
function getsummaryRadar(){
    return _.flatten(_.values(tsnedata))//_.flatten(tsnedata[name].slice(startIndex,lastIndex+1));
}