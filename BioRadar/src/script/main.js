/* MIT License
 *
 * Copyright (c) 2020 Tommy Dang, Ngan V.T. Nguyen
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 *     The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 *     THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 *     FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 *     OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */


// NEW: data obj

let data_info = {
    filename: '',
    timesteps: 0,
    totalStep: 0,
    totalHost: 0
};

// job parameter
let sampleJobdata =[];
let init = true;
// Set the dimensions of the canvas / graph
var margin = {top: 5, right: 0, bottom: 10, left: 0};

var svg = d3.select(".mainsvg"),
    width = +document.getElementById("mainBody").offsetWidth,
    height = window.innerHeight-(+$('.pushpin-demo-nav')[0].offsetHeight)-10,
    // height = +svg.attr("height")-margin.top-margin.bottom,
    heightdevice = window.innerHeight,

    svg = svg
        .attrs({
            width: width,
            height: height,
        })
        .append("g")
        .attr("transform",
            "translate(" + margin.left + "," + margin.top + ")");
d3.select('#modelWorkerScreen').attrs({
    width: width,
    height: height,
})
jobMap_opt.width = width;
jobMap_opt.height = height;


// other component setting
// summaryGroup
let summaryGroup_op ={
    margin : {top: 5, right: 0, bottom: 0, left: 0},
    height: 280,
}
let Radarplot_opt = {
    clusterMethod: 'leaderbin',
}
let group_opt = {
    clusterMethod: 'leaderbin',
    bin:{
        startBinGridSize: 5,
        range: [9,10]
    }
};
var svgStore={};
var svgsum;
//.call(d3.zoom()
//    .scaleExtent([1, 8])
//    .on("zoom", zoom));
//function zoom() {
//   svg.attr("transform", d3.event.transform);
//}


// Parse the date / time
var parseTime = d3.timeParse("%m/%d/%y");

// Set the ranges
var x = d3.scaleTime().range([0, width-margin.left*2]);
var xNew = d3.scaleTime().range([0, width/2-margin.left]);

var y = d3.scaleLinear().range([height, 0]);
var yAxis= d3.scaleLinear().range([height, 0]);

// HPCC
var hosts = [];
var hostResults = {};
var links =[];
var node,link;



// log variable
var timelog=[];

// START: loader spinner settings ****************************
var opts = {
    lines: 25, // The number of lines to draw
    length: 15, // The length of each line
    width: 5, // The line thickness
    radius: 25, // The radius of the inner circle
    color: '#f00', // #rgb or #rrggbb or array of colors
    speed: 2, // Rounds per second
    trail: 50, // Afterglow percentage
    className: 'spinner', // The CSS class to assign to the spinner
};
var target = document.getElementById('loadingSpinner');
var spinner = new Spinner(opts).spin(target);
// END: loader spinner settings ****************************

var simulation, link, node;
var dur = 400;  // animation duration
var startDate = new Date("4/1/2018");
var endtDate = new Date("1/1/2019");
var today = new Date();

var maxHostinRack= 30;//60;
var h_rack = 580;//980;
var w_rack = (width-23)/10-1;
var w_gap =0;
var node_size = 6;

var top_margin = summaryGroup_op.height+summaryGroup_op.margin.top+31;  // Start rack spiatial layout


var users = [];
var racks = [];
var racksnewor = [];

var xTimeScale;
var baseTemperature =60;

var interval2;
var simDuration =0;
var simDurationinit = 0;
// var simDuration =0;
// var simDurationinit = 0;
var numberOfMinutes = 26*60;

var iterationstep = 1;
var maxstack = 7;
var normalTs =0.6; //time sampling
// var timesteppixel = 0.1; // for 4
var timesteppixel = 0.1; // for 26

var isRealtime = false;
var db = 'nagios';
if (isRealtime){
    simDuration = 200;
    simDurationinit = 200;
    numberOfMinutes = 26*60;
}

var currentMiliseconds;
var query_time;
var lastIndex;
var currentHostname,currentMeasure;
var currentHostX = 0;
// var currentHosty = 0;
let layout = {
    VERTICAL : 0,
    HORIZONTAL : 1};

var graphicControl ={
    charType : "None",
    sumType : "None",
    mode : layout.HORIZONTAL
};

let globalTrend = false; // get data from index 0 current work with worker

//***********************

var initialService = "Temperature";
var selectedService;

let colorScaleList = {
    n: 7,
    rainbow: ["#000066", "#4400ff", "#00ddff", "#00ddaa", "#00dd00", "#aadd00", "#ffcc00", "#ff8800", "#ff0000", "#660000"],
    soil: ["#2244AA","#4A8FC2", "#76A5B1", "#9DBCA2", "#C3D392", "#F8E571", "#F2B659", "#eb6424", "#D63128", "#660000"],
    customschemeCategory:  ["#1f77b4", "#ff7f0e", "#2ca02c", "#d62728", "#9467bd", "#8c564b", "#e377c2", "#bcbd22", "#17becf"],
    customFunc: function(name,arr,num){
        const n= num||this.n;
        const arrColor = arr||this[name];
        let colorLength = arrColor.length;
        const arrThresholds=d3.range(0,colorLength).map(e=>e/(colorLength-1));
        let colorTemperature = d3.scaleLinear()
            .domain(arrThresholds)
            .range(arrColor)
            .interpolate(d3.interpolateHcl);

        return d3.range(0,n).map(e=>colorTemperature(e/(n-1)))
    },
    d3colorChosefunc: function(name,num){
        const n = num|| this.n;
        if (d3[`scheme${name}`]) {
            if (typeof (d3[`scheme${name}`][0]) !== 'string') {
                colors = (d3[`scheme${name}`][n]||d3[`scheme${name}`][d3[`scheme${name}`].length-1]).slice();
            }
            else
                colors=  d3[`scheme${name}`].slice();
        } else {
            const interpolate = d3[`interpolate${name}`];
            colors = [];
            for (let i = 0; i < n; ++i) {
                colors.push(d3.rgb(interpolate(i / (n - 1))).hex());
            }
        }
        colors = this.customFunc(undefined,colors,n);
        return colors;
    },
},colorArr = {Radar: [
        {val: 'rainbow',type:'custom',label: 'Rainbow'},
        {val: 'RdBu',type:'d3',label: 'Blue2Red',invert:true},
        {val: 'soil',type:'custom',label: 'RedYelBlu'},
        {val: 'Viridis',type:'d3',label: 'Viridis'},
        {val: 'Greys',type:'d3',label: 'Greys'}],
    Cluster: [{val: 'Category10',type:'d3',label: 'D3'},{val: 'Paired',type:'d3',label: 'Blue2Red'}]};

var arrThresholds;
var dif, mid,left;
var color,opa;
//var arrColor = ['#00c', '#1a9850','#fee08b', '#d73027'];
// var arrColor = ['#110066','#4400ff', '#00cccc', '#00dd00','#ffcc44', '#ff0000', '#660000'];
// let arrColor = colorScaleList.customFunc('rainbow');
let arrColor = colorScaleList.d3colorChosefunc('Greys');
let colorCluster  = d3.scaleOrdinal().range(d3.schemeCategory20);
setColorsAndThresholds(initialService);

//********tooltip***************
var niceOffset = true;
//***********************
var undefinedValue = undefined;
// var undefinedColor = "#666";
var undefinedColor = "#c6c6c6";
var undefinedResult = "timed out";
//*** scale
var xTimeSummaryScale;
var xLinearSummaryScale;

var filterhost;
var filterhost_user;

var TsnePlotopt  = {
    margin: {top: 0, right: 0, bottom: 0, left: 0},
    offset: {top: top_margin},
    width: width,
    height: height-top_margin,
    scalezoom: 1,
    widthView: function(){return this.width*this.scalezoom},
    heightView: function(){return this.height*this.scalezoom},
    widthG: function(){return this.widthView()-this.margin.left-this.margin.right},
    heightG: function(){return this.heightView()-this.margin.top-this.margin.bottom},
    dotRadius: 30,
    opt:{
        epsilon : 40, // epsilon is learning rate (10 = default)
        perplexity : 30, // roughly how many neighbors each point influences (30 = default)
        dim : 2, // dimensionality of the embedding (2 = default)
        maxtries: 50
    },
    eventpad: {
        size: 8,
    },
    display:{
        symbol:{
            type: 'path',
            radius: 30,
        }
    },
    radaropt : {
        // summary:{quantile:true},
        mini:true,
        levels:6,
        gradient:true,
        w:30,
        h:30,
        showText:false,
        margin: {top: 0, right: 0, bottom: 0, left: 0},
    },
    top10:{
        details :{
            circle: {
                attr: {
                    r : 2,
                },
                style: {
                    opacity: 0.2
                }
            },
            path: {
                style: {
                    'stroke': 'black',
                    'stroke-width': 0.5,
                }
            },
            clulster: {
                attr: {
                }
                ,
                style: {
                    stroke: 'white'
                }
            }
        }
    },
    runopt:{
        zoom:30,
        simDuration: 1000,
        clusterDisplay: 'alpha',
        clusterProject: 'bin',
        displayMode: 'tsne',

    }
},
    tooltip_opt={
        width: 650,
        height: 400,
        margin:{top:5,bottom:5,left:45,right:85}
    };
var TsneTSopt = {width:width,height:height};
var PCAopt = {width:width,height:height};
var umapopt = {width:width,height:height};
var vizMode = 0; // 0 timeradar, 1 tsne, 2 pca, 3 umap
var runopt ={ // run opt global
    suddenGroup:0,
    minMax: 0,
};


let jobMap = JobMap().svg(d3.select('#jobmap')).graphicopt(jobMap_opt).runopt(jobMap_runopt).init();
var distance = distanceL2;
let tooltip_lib = Tooltip_lib().primarysvg(svg).graphicopt(tooltip_opt).init();
let tooltip_layout = tooltip_lib.layout();
var MetricController = radarController();
let isbusy = false, imageRequest = false, isanimation=false;
let dataInformation={filename:'',metric:0,datanum:0};

let tsneTS = d3.tsneTimeSpace();
let pcaTS = d3.pcaTimeSpace();
let umapTS = d3.umapTimeSpace();

function setColorsAndThresholds(s) {
    for (var i=0; i<serviceList_selected.length;i++){
        let range = serviceLists[serviceList_selected[i].index].sub[0].range;
        if (s == serviceList_selected[i].text && serviceList_selected[i].text==='Job_load'){  // CPU_load
            dif = (range[1]-range[0])/4;
            mid = range[0]+(range[1]-range[0])/2;
            left=0;
            arrThresholds = [left,range[0], 0, range[0]+2*dif, 10, range[1], range[1]];
            color = d3.scaleLinear()
                .domain(arrThresholds)
                .range(arrColor)
                .interpolate(d3.interpolateHcl); //interpolateHsl interpolateHcl interpolateRgb
            opa = d3.scaleLinear()
                .domain([left,range[0],range[0]+dif, range[0]+2*dif, range[0]+3*dif, range[1], range[1]+dif])
                .range([1,1,0.3,0.06,0.3,1,1]);

        }
        else if (s == serviceList_selected[i].text && serviceList_selected[i].text==='Memory_usage'){  // Memory_usage
            dif = (range[1]-range[0])/4;
            mid = range[0]+(range[1]-range[0])/2;
            left=0;
            arrThresholds = [left,range[0], 0, range[0]+2*dif, 98, range[1], range[1]];
            color = d3.scaleLinear()
                .domain(arrThresholds)
                .range(arrColor)
                .interpolate(d3.interpolateHcl); //interpolateHsl interpolateHcl interpolateRgb
            opa = d3.scaleLinear()
                .domain([left,range[0],range[0]+dif, range[0]+2*dif, range[0]+3*dif, range[1], range[1]+dif])
                .range([1,1,0.3,0.06,0.3,1,1]);

        }
        else if (s == serviceList_selected[i].text){
            dif = (range[1]-range[0])/4;
            mid = range[0]+(range[1]-range[0])/2;
            left = range[0]-dif;
            if (left<0 && i!=0) // Temperature can be less than 0
                left=0;
            arrThresholds = [left,range[0], range[0]+dif, range[0]+2*dif, range[0]+3*dif, range[1], range[1]+dif];
            color = d3.scaleLinear()
                .domain(arrThresholds)
                .range(arrColor)
                .interpolate(d3.interpolateHcl); //interpolateHsl interpolateHcl interpolateRgb
            opa = d3.scaleLinear()
                .domain([left,range[0],range[0]+dif, range[0]+2*dif, range[0]+3*dif, range[1], range[1]+dif])
                .range([1,1,0.3,0.06,0.3,1,1]);
            break;
        }
    }
}
//***********************
var gaphost = 7;

function main() {

    let control_jobdisplay = d3.select('#compDisplay_control');
        control_jobdisplay.node().options.selectedIndex = 2;
        control_jobdisplay.dispatch('change');
    // MetricController.data(data.result.arr).drawSummary(data.result.hindex);
    init = false;
    firstTime = false;
    // request();
}
var currentlastIndex;
var speedup= 0;



function scaleThreshold(i){
    return i<maxstack?i:(maxstack-2);
}


function gaussianRand() {
    var rand = 0;
    for (var i = 0; i < 6; i += 1) {
        rand += Math.random();
    }
    return rand / 6;
}

function gaussianRandom(start, end) {
    return Math.floor(start + gaussianRand() * (end - start + 1));
}
var minTime,maxTime;
var hostfirst;
function getRackx(hpcc_rack,hpcc_node,isVertical){
    if (isVertical)
        return racksnewor[(hpcc_rack - 1)*2 + (hpcc_node%2?0:1)].x;
    return racksnewor[hpcc_rack - 1].x;
}

function initTime() {
// Check if we should reset the starting point
    if (firstTime) {
        currentMiliseconds = hostResults['timespan'][0];
        hostfirst = hosts[0].name;
        xTimeScale = d3.scaleLinear()
            .domain([0, maxstack - 1]);
        // get Time
        minTime = currentMiliseconds;  // some max number
    }
    firstTime = false;
}


function resetRequest(){
    console.log('reload');
    requestRedraw();
}



let expectedLength = 0;


// let timerange = ["2019-03-21T14:00:00Z","2019-03-21T17:30:00Z"]; // event 21 march 2019
let timerange = ["2019-04-26T00:00:00Z","2019-04-27T00:00:00Z"];
let timestep_query = "5m";
let formatRealtime = getformattime(+timestep_query.split(/[a-z]/)[0],timeshortconvert(timestep_query.match(/[a-z]/)[0]));
function timeshortconvert(us){
    switch(us){
        case 'm': return 'Minute';
        case 'h': return 'Hour';
        case 'w': return 'Week';
    }
}


var recordonly = false;


d3.select("html").on("keydown", function() {
    switch(d3.event.keyCode){
        case 27:
            tool_tip.hide();
            break;
        case 13:
            // pauseRequest();
            break;
    }

});


let loadclusterInfo = false;

function onCalculateClusterAction() {
    recalculateCluster({
        clusterMethod: 'leaderbin',
        normMethod: 'l2',
        bin: {startBinGridSize: 2, range: [8, 9]}
    }, function () {
        updateClusterControlUI(cluster_info.length);
        handle_dataRaw();
        if (!init)
            requestRedraw();
        else
            setTimeout(main, 0);
        preloader(false);
    });
}

function readFilecsv(filename) {
    dataInformation.filename = filename+'.csv';
    let filePath = `data/${filename}.csv`;
    exit_warp();
    preloader(true);
    d3.csv(filePath).on("progress", function(evt) {
        if (evt.total) {
            preloader(true, 0, "File loaded: " + Math.round(evt.loaded/evt.total*100)+'%');
            dataInformation.size = evt.total;
        }else{
            preloader(true, 0, "File loaded: " +bytesToString(evt.loaded));
            dataInformation.size = evt.loaded;
        }
        // console.log("Amount loaded: " + Math.round(evt.loaded/evt.total*100)+'%')
    }).get(function (error, data) {
        if (error) {
        } else {
            db = "csv";
            newdatatoFormat(data);

            inithostResults();
            formatService(true);
            processResult = processResult_csv;

            // draw Metric summary on left panel
            MetricController.axisSchema(serviceFullList, true).update();
            MetricController.datasummary(getsummaryservice());
            MetricController.data(getsummaryRadar()).drawSummary(hosts.length);

            updateDatainformation(sampleS['timespan']);
            sampleJobdata = [{
                jobID: "1",
                name: "1",
                nodes: hosts.map(h=>h.name),
                startTime: new Date(_.last(sampleS.timespan)-100).toString(),
                submitTime: new Date(_.last(sampleS.timespan)-100).toString(),
                user: "dummyJob"
            }];

            d3.select(".currentDate")
                // .text("" + (sampleS['timespan'][0]).toDateString());
                .text(dataInformation.filename);
            preloader(true, 0, 'Calculate clusters...');
            loadPresetCluster(`${dataInformation.filename.replace('.csv','')}`,(status)=>{loadclusterInfo= status;

            // // debug
            //     loadclusterInfo = false;
                if(loadclusterInfo){
                    updateClusterControlUI(cluster_info.length)
                    handle_dataRaw();
                    if (!init)
                        resetRequest();
                    else
                        setTimeout(main,0);
                    preloader(false)
                }else {
                    onCalculateClusterAction();
                }

            })

        }
    })
}
// action when exit
function exit_warp () {

}
function onChangeMinMaxFunc(choice){
    preloader(true);
    exit_warp();

    // change the range of service here
    if (choice) {
        runopt.minMax = true;
        calculateServiceRange();
    }else{
        runopt.minMax = false;
        serviceFullList.forEach((s,si)=>s.range = serviceFullList_Fullrange[si].range.slice());
    }

    MetricController.axisSchema(serviceFullList, true).update();

    recalculateCluster(group_opt,function(){
        handle_dataRaw();
        // initDataWorker();
        if (!init)
            resetRequest();
        preloader(false)
    });
}
function formatService(init){
    if (runopt.minMax)
        calculateServiceRange();
    else if(!init)
        serviceFullList.forEach((s,si)=>s.range = serviceFullList_Fullrange[si].range.slice());
    if (init)
        serviceFullList_Fullrange = _.cloneDeep(serviceFullList);
}
function handle_dataRaw() {
    cluster_info.forEach(d => (d.arr = [],d.total=0, d.__metrics.forEach(e => (e.minval = undefined, e.maxval = undefined))));
    let clusterNullIndex =cluster_info.findIndex(c=>d3.sum(c.__metrics.normalize)===0);
    hosts.forEach(h => {
        sampleS[h.name].arrcluster = sampleS.timespan.map((t, i) => {
            let nullkey = false;
            let axis_arr = tsnedata[h.name][i];
            let outlierinstance = outlyingList.pointObject[h.name+'_'+i];
            if (outlierinstance){
                return outlierinstance.cluster;
            }
            // reduce time step

            let index = 0;
            let minval = Infinity;
            cluster_info.forEach((c, i) => {
                const val = distance(c.__metrics.normalize, axis_arr);
                if(val===0)
                    c.leadername = h.name;
                if (minval > val) {
                    if(i!==clusterNullIndex || (i===clusterNullIndex&&calculateMSE_numarray(c.__metrics.normalize, axis_arr)===0)) {
                        index = i;
                        minval = val;
                    }
                }
            });
            cluster_info[index].total = 1 + cluster_info[index].total || 0;
            cluster_info[index].__metrics.forEach((m, i) => {
                if (m.minval === undefined || m.minval > axis_arr[i])
                    m.minval = axis_arr[i];
                if (m.maxval === undefined || m.maxval < axis_arr[i])
                    m.maxval = axis_arr[i];
            });
            tsnedata[h.name][i].cluster = index;
            tsnedata[h.name][i].category = h.category;
            return index;
            // return cluster_info.findIndex(c=>distance(c.__metrics.normalize,axis_arr)<=c.radius);
        })
    });
    cluster_info.forEach(c => c.mse = ss.sum(c.__metrics.map(e => (e.maxval - e.minval) * (e.maxval - e.minval))));
    cluster_map(cluster_info);
    jobMap.clusterData(cluster_info).colorCluster(colorCluster);
    radarChartclusteropt.schema = serviceFullList;
    handle_clusterinfo();


    // handle_data_tsne(tsnedata);
    // jobMap.callback({
    //     mouseover: tsneTS.hightlight,
    //     mouseleave: tsneTS.unhightlight,
    // });
}

function requestRedraw() {
    if (!init) {
        onchangeVizType();
        if (!onchangeVizdata())
            jobMap.clusterData(cluster_info).colorCluster(colorCluster).data(undefined, undefined, undefined, true).draw().drawComp();
    }
}

function onchangeCluster() {
    cluster_info.forEach(d => (d.total=0,d.__metrics.forEach(e => (e.minval = undefined, e.maxval = undefined))));
    handle_dataRaw();
    requestRedraw();
}
let handle_data_TimeSpace;
let mainviz = jobMap;
function onchangeVizType(){
    tsneTS.stop();
    pcaTS.stop();
    umapTS.stop();
    switch (vizMode) {
        case 'tsne':
            tsneTS.generateTable();
            mainviz = tsneTS;
            return true;
        case 'pca':
            pcaTS.generateTable();
            mainviz = pcaTS;
            return true;
        case 'umap':
            umapTS.generateTable();
            mainviz = umapTS;
            return true
        default:
            mainviz = jobMap;
            return false;
    }
}
function onchangeVizdata(){
    switch (vizMode) {
        case 'tsne':
            handle_data_TimeSpace =handle_data_tsne;
            handle_data_TimeSpace(tsnedata);
            return true
        case 'pca':
            handle_data_TimeSpace = handle_data_pca;
            handle_data_TimeSpace(tsnedata);
            return true;
        case 'umap':
            handle_data_TimeSpace = handle_data_umap;
            handle_data_TimeSpace(tsnedata);
            return true;
        default:
            return false;
    }
}
function calculateServiceRange() {
    serviceFullList_Fullrange = _.cloneDeep(serviceFullList);
    serviceList_selected.forEach((s, si) => {
        const sa = serviceListattr[s.index]
        let min = +Infinity;
        let max = -Infinity;
        _.without(Object.keys(sampleS),'timespan').map(h => {
            let temp_range = d3.extent(_.flatten(sampleS[h][sa]));
            if (temp_range[0] < min)
                min = temp_range[0];
            if (temp_range[1] > max)
                max = temp_range[1];
        });
        serviceLists[si].sub.forEach(sub => sub.range = [min, max]);
    })
}

$( document ).ready(function() {
    console.log('ready');
    // customSelect('select');
    $( "#modelWorkerInformation" ).resizable({ handles: 'w' });
    // set tooltip
    let tipopt= {position: {
            x: 'right',
            y: 'center'
        },
        outside: 'x',
        adjustPosition: true,
        adjustTracker: true,
        theme: 'TooltipBorderThick',
        addClass:'informationDetail',
        getTitle:'data-title'
    };
    d3.selectAll('.information, .toolTip').each(function() {
        const hasTarget = d3.select(this).attr('data-target');
        const hasImage = d3.select(this).attr('data-image');
        let positiont = d3.select(this).attr('tooltip-pos');
        if (hasTarget||hasImage){
            tipopt.addClass ='informationDetail';
            tipopt.position = {
                x: 'right',
                y: 'center'
            }
            tipopt.outside= 'x';
            delete tipopt.offset;
        }else{
            tipopt.addClass = 'informationDetail mini';
            if (!positiont) {
                tipopt.offset = {y: -15};
                delete tipopt.position;
                tipopt.outside = "y";
            }else{
                tipopt.position = {
                    x: 'right',
                    y: 'center'
                }
                tipopt.outside= 'x';
                delete tipopt.offset;
            }
        }
        let tip = $(this).jBox('Tooltip',_.defaults({
            pointer: (hasTarget||hasImage)?"top:20":(positiont?false:"center")
        }, tipopt));
        if (hasTarget)
            tip.setContent($('#datainformation'));
        else if(hasImage)
            tip.setContent(`<img src="src/images/${hasImage}" width="100%"></img>`);

    });
    // set event for viz type
    $('input[type=radio][name=viztype]').change(function() {
        updateViztype(this.value);
    });

    d3.select('#majorGroupDisplay_control').on('change',function() {
        radarChartclusteropt.boxplot = $(this).prop('checked');
        cluster_map(cluster_info)
    });

    $('.fixed-action-btn').floatingActionButton({
        direction: 'left',
        hoverEnabled: false,
    });
    $('.collapsible').collapsible({
        inDuration:1000,
        outDuration:1000
    });
    $('.collapsible.expandable').collapsible({
        accordion: false,
        inDuration:1000,
        outDuration:1000,
    });
    $('.modal').modal();
    $('.dropdown-trigger').dropdown();
    $('.tabs').tabs({'onShow':function(){

            if (this.$activeTabLink.text()==='Video') {
                $('#videoIn')[0].play();
                d3.select('#timelineTool').classed('hide',true);
                d3.select('.overlaySide').classed('hide',true);
                closeNav();
            }else{
                $('#videoIn')[0].pause();
                d3.select('#timelineTool').classed('hide',false);
                d3.select('.overlaySide').classed('hide',false);
            }
        }});
    $('.sidenav').sidenav();
    discovery('#sideNavbtn');
    //$('.tap-target').tapTarget({onOpen: discovery});

    d3.select("#DarkTheme").on("click",switchTheme);
    changeRadarColor(colorArr.Radar[4]);
    // color scale create
    creatContain(d3.select('#RadarColor').select('.collapsible-body>.pickercontain'), colorScaleList, colorArr.Radar, onClickRadarColor);

    d3.select('#clusterDisplay').on('change',function(){
        TsnePlotopt.runopt.clusterDisplay = this.value;
        TSneplot.runopt(TsnePlotopt.runopt);
    });
    d3.select('#clusterProject').on('change',function(){
        TsnePlotopt.runopt.clusterProject = this.value;
        TSneplot.runopt(TsnePlotopt.runopt);
    });
    d3.select('#clusterMethod').on('change',function(){
        // Radarplot_opt.clusterMethod = this.value;
        // Radarplot.binopt(Radarplot_opt);
        // updateSummaryChartAll();
        d3.selectAll('.clusterProfile').classed('hide',true);
        d3.select(`#${this.value}profile`).classed('hide',false);
    });
    d3.select('#chartType_control').on("change", function () {
        var sect = document.getElementById("chartType_control");
        graphicControl.charType = sect.options[sect.selectedIndex].value;
    });
    d3.select('#summaryType_control').on("change", function () {
        var sect = document.getElementById("summaryType_control");
        graphicControl.sumType = sect.options[sect.selectedIndex].value;
        svg.select(".graphsum").remove();
        pannelselection(false);
        // updateSummaryChartAll();
    });
    d3.select('#compDisplay_control').on("change", function () {
        var sect = document.getElementById("compDisplay_control");

        vizMode = sect.options[sect.selectedIndex].getAttribute('value2');
        d3.select('#modelWorkerContent').classed('hide',false);
        d3.select('.mainsvg').classed('hide',true);
        d3.select("#jobControl").attr('disabled','disabled').selectAll('input').attr('disabled','disabled');
        d3.select(suddenGroup_control.parentNode.parentNode).attr('disabled',null);
        d3.select(suddenGroup_control).attr('disabled',null);
        onchangeVizType();
        onchangeVizdata();

    });
    d3.select('#jobIDCluster_control').on("change", function () {
        jobMap_runopt.compute.clusterJobID = $(this).prop('checked');
        jobMap.runopt(jobMap_runopt).data(undefined,undefined).draw();
    });
    d3.select('#compCluster_control').on("change", function () {
        jobMap_runopt.compute.clusterNode = $(this).prop('checked');
        jobMap.runopt(jobMap_runopt).draw();
    });
    let suddenGroupslider = document.getElementById('suddenGroup_control');
    noUiSlider.create(suddenGroupslider, {
        start: 0,
        connect: 'lower',
        step: 0.005,
        orientation: 'horizontal', // 'horizontal' or 'vertical'
        range: {
            'min': 0,
            'max': 1
        },
    });
    suddenGroupslider.noUiSlider.on("change", function () {
        runopt.suddenGroup = +this.get();
        if (!onchangeVizdata()){
            jobMap_runopt.suddenGroup = runopt.suddenGroup;
            jobMap.runopt(jobMap_runopt).data().draw();
        }
    });
    d3.select('#colorConnection_control').on("change", function () {
        var sect = this.checked;
        jobMap_runopt.graphic.colorBy = sect?'user':'group';
        jobMap.runopt(jobMap_runopt).draw();
    });
    d3.select('#datacom').on("change", function () {
        preloader(true);
        exit_warp();
        const choice = this.value;
        const choicetext = d3.select(d3.select('#datacom').node().selectedOptions[0]).attr('data-date');
        let loadclusterInfo = false;
        readFilecsv(choice)

    });
    $('#description_input_file').on('input',(evt)=>{
        let f = evt.target.files[0];
        var reader = new FileReader();
        reader.onload = (function (theFile) {
            return function (e) {
                d3.json(e.target.result, function (error, data) {
                    if (error) {
                    } else {
                        clusterDescription = data;
                        updateclusterDescription();
                    }
                });
            };
        })(f);

        reader.readAsDataURL(f);
    });
    $('#saveDescriptionbtn').on('click',()=>$('#description_input_file').trigger('click'));
    let oldchoose =$('#datacom').val();
    $('#data_input_file').on('click',()=>{preloader(false)})
    $('#data_input_file').on('input', (evt) => {
        $('#datacom').val('csv')
        var f = evt.target.files[0];
        var reader = new FileReader();
        reader.onload = (function(theFile) {
            return function(e) {
                // Render thumbnail.
                let file = e.target.result;
                readFilecsv(file);
                // span.innerHTML = ['<img class="thumb" src="', e.target.result,
                //     '" title="', escape(theFile.name), '"/>'].join('');
                // document.getElementById('list').insertBefore(span, null);
            };
        })(f);

        // Read in the image file as a data URL.
        reader.readAsDataURL(f);
    });

    // cluster init
    $('#clusterMethod').val(group_opt.clusterMethod);
    $('#startBinGridSize').val(group_opt.bin.startBinGridSize||10);
    $('#lowrange').val(group_opt.bin.range[0]||9);
    $('#highrange').val(group_opt.bin.range[1]||11);
    $('#knum').val(group_opt.bin.k||5);
    $('#kiteration').val(group_opt.bin.iterations||50);

    // outlier detection
    d3.select('#outlierDection').on('change',function(){
        if ($(this).prop('checked')){
            outlyingList = outlier();
            onCalculateClusterAction();
        }else{
            clusterGroup={};
            onCalculateClusterAction();
        }
    });
    // readFilecsv('data/transcriptome_averaged_test.csv');
    MetricController.graphicopt({width:365,height:365})
        .div(d3.select('#RadarController'))
        .tablediv(d3.select('#RadarController_Table'))
        .axisSchema(serviceFullList)
        .onChangeValue(onSchemaUpdate)
        .onChangeFilterFunc(onfilterdata)
        .onChangeMinMaxFunc(onChangeMinMaxFunc)
        .init();
    initApp()
});

let globalFilter ={};
let keyLeader //= "TF_DE";
function initApp(){
    // load filter file
    preloader(true,undefined,'Read filter file...');
    d3.json('data/STOP1_targets.json',function(d){
        globalFilter = d;
        // init read file
        readFilecsv(d3.select('#datacom').node().value);
    });
}
function loadPresetCluster(name,calback) {
    return d3.csv(srcpath + `data/cluster_${name}.csv`, function (cluster) {
        if (cluster==null) {
            M.toast({html: 'Do not have preset major group information. Recalculate major groups'});
            if (calback) {
                calback(false);// status
            }
        }else {
            updateClusterControlUI((cluster || []).length);
            cluster.forEach(d => {
                d.radius = +d.radius;
                d.mse = +d.mse;
                d.__metrics = serviceFullList.map(s => {
                    return {
                        axis: s.text,
                        value: d3.scaleLinear().domain(s.range)(d[s.text]) || 0,
                        // minval:d3.scaleLinear().domain(s.range)(d[s.text+'_min'])||0,
                        // maxval:d3.scaleLinear().domain(s.range)(d[s.text+'_max'])||0,
                    }
                });
                d.__metrics.normalize = d.__metrics.map((e, i) => e.value);
            });
            cluster_info = cluster;
            clusterDescription = {};
            recomendName(cluster_info);
            recomendColor(cluster_info);

            if (calback) {
                calback(true);// status
            }
        }
    });
}
function updateClusterControlUI(n) {
    if(n) {
        group_opt.bin.range[0] = n;
        group_opt.bin.k = n;
        group_opt.bin.range[1] = n + 1;
    }
    if (group_opt.bin.range) {
        $('#lowrange').val(group_opt.bin.range[0]);
        $('#highrange').val(group_opt.bin.range[1]);
    }
    if(group_opt.bin.k)
        $('#knum').val(group_opt.bin.k);

}
let profile = {};

function onfilterdata(schema) {
}
function onSchemaUpdate(schema){
    serviceFullList.forEach(ser=>{
        ser.angle = schema.axis[ser.text].angle();
        ser.enable = schema.axis[ser.text].data.enable;
    });
    radarChartOptions.schema = serviceFullList;
    if (cluster_info){
        radarChartclusteropt.schema = serviceFullList;}
    if (!firstTime) {
        MetricController.drawSummary();
        if (cluster_info) {
            cluster_map(cluster_info);
        }
    }
    // // }
    // if (db!=='csv')
    //     SaveStore();
}

function onFinishInterval(data) {
    //Process all the rSqared
    let similarityResults = [];
    let similarityParts = [];
    for (let i = 0; i < maxWorkers; i++) {
        similarityParts.push([]);
    }
    let similarityCounter = 0;
    for (let i = 0; i < hosts.length - 1; i++) {
        for (let j = i + 1; j < hosts.length; j++) {
            let keyI = hosts[i].name;
            let keyJ = hosts[j].name;
            let valuesI = data[keyI];
            let valuesJ = data[keyJ];
            let sd = {x1: valuesI, x2: valuesJ};
            similarityParts[similarityCounter % maxWorkers].push(sd);
            similarityCounter++;
        }
    }
    let similarityResultCounter = 0;
    //Now start a worker for each of the part
    VARIABLES = [selectedService];
    similarityParts.forEach((part, i) => {
        startWorker('myscripts/worker/similarity_worker.js', {
            variables: VARIABLES,
            data: part
        }, onSimilarityResult, i);
    })

    function onSimilarityResult(evt) {
        similarityResultCounter += 1;
        similarityResults = similarityResults.concat(evt);
        if (similarityResultCounter === similarityParts.length) {
            resetWorkers();
            onCompleteSimilarityCal(similarityResults);
        }
    }

    function onCompleteSimilarityCal(similarityResults) {
        let orderParts = VARIABLES.map((theVar) => {
            return similarityResults.map(similarity => {
                return {
                    source: similarity.source,
                    target: similarity.target,
                    weight: similarity.weights[theVar]
                }
            });
        });
        orderParts.forEach((part, i) => {
            //Build the best order.
            startWorker('myscripts/worker/similarityorder_worker.js', {
                theVar: VARIABLES[i],
                machines: hosts.map(h=>h.name),
                links: part
            }, onOrderResult, i);
        });
        let orderingResultCounter = 0;

        let totalDraws = VARIABLES.length;
        let drawingResultCounter = 0;

        function onOrderResult(orderResults) {

            orderingResultCounter += 1;
            if (orderingResultCounter === orderParts.length) {
                doneOrdering = new Date();
                resetWorkers();
            }
            processOrderResults(orderResults);
        }

        function processOrderResults(orderResults) {
            let theVar = orderResults.variable;
            let order = orderResults.order;
            console.log(order);
            order.forEach((name,i)=>{
                const rack = name.split('-')[1];
                racksnewor[rack-1].hosts.find(h=>h.name===name).y = i*gaphost;
                d3.selectAll('.hostID_'+name).transition().duration(500).attr('y',i*gaphost);
                d3.selectAll('.'+name).transition().duration(500).attr('y',i*gaphost);
                d3.selectAll('.measure_'+name).transition().duration(100).attr('y',i*gaphost);
            });
        }
    }

}

let radarChartclusteropt  = {
    margin: {top: 0, right: 0, bottom: 0, left: 0},
    w: 180,
    h: 180,
    radiuschange: false,
    levels:6,
    dotRadius:2,
    strokeWidth:1,
    maxValue: 0.5,
    isNormalize:true,
    showHelperPoint: false,
    roundStrokes: true,
    ringStroke_width: function(d){return d3.scaleLinear().range(serviceFullList[0].range)(d)===0?0.5:0.15},
    ringColor:'black',
    fillin:0.5,
    boxplot:false,
    animationDuration:1000,
    events:{
        axis: {
            mouseover: function(){
                try {
                    const d = d3.select(d3.event.detail || this).datum();
                    d3.selectAll('.clusterDisplay .axis' + d.idroot + '_' + d.id).classed('highlight', true);
                    d3.selectAll('.clusterDisplay .axisText').remove();
                    if (d3.select(this.parentNode).select('.axisText').empty())
                        d3.select(this.parentNode).append('text').attr('class','axisText').attr('transform','rotate(-90) translate(5,-5)');
                    d3.select(this.parentNode).select('.axisText').text(d.text);
                    $('.tablesvg').scrollTop($('table .axis' + d.idroot + '_' + d.id)[0].offsetTop);
                }catch(e){}
            },
            mouseleave: function(){
                const d = d3.select(d3.event.detail||this).datum();
                d3.selectAll('.clusterDisplay .axis'+d.idroot+'_'+d.id).classed('highlight',false);
                d3.selectAll('.clusterDisplay .axisText').remove();
            },
        },
    },
    showText: false};
function cluster_map (dataRaw) {
    let data = dataRaw.map((c,i)=>{
        let temp = c.__metrics.slice();
        temp.name = c.labels;
        temp.text = c.text;
        temp.total = c.total;
        temp.mse = c.mse;
        let temp_b = [temp];
        temp_b.id = c.name;
        temp_b.order = i;
        return temp_b;
    });
    let orderSimilarity = similarityCal(data);
    data.sort((a,b)=>( orderSimilarity.indexOf(a.order)-orderSimilarity.indexOf(b.order))).forEach((d,i)=>{
        d.order = i;
        dataRaw.find(c=>c.name===d.id).orderG = i;
    });
    //--shoudn't here
    dataRaw.forEach(c=>{
        let matchitem = data.find(d=>d.id===c.name);
        // c.text = c.text.replace(`Group ${c.index+1}`,`Group ${matchitem.order+1}`);
        matchitem[0].text =  c.text;
    });
    data.forEach(d=>d[0].name = dataRaw.find(c=>d.id===c.name).text);
    //--end
    let dir = d3.select('#clusterDisplay');
    setTimeout(()=>{
        let r_old = dir.selectAll('.radarCluster').data(data,d=>d.id).order();
        r_old.exit().remove();
        let r_new = r_old.enter().append('div').attr('class','radarCluster')
            .on('mouseover',function(d){
                if (!jobMap.runopt().mouse.disable) {
                    mainviz.highlight(d.id);
                }
                d3.select(this).classed('focus',true);
            }).on('mouseleave',function(d){
                if (!jobMap.runopt().mouse.disable) {
                    mainviz.unhighlight(d.id);
                }
                d3.select(this).classed('focus',false);
            })
            .append('div')
            .attr('class','label')
            .styles({'position':'absolute',
                'color':'black',
                'width': radarChartclusteropt.w+'px',
                height: '1rem',
                padding: '10px'
                // overflow: 'hidden',
            });
        // r_new.append('span').attr('class','clusterlabel truncate center-align col s12');
        r_new.append('i').attr('class','editbtn material-icons tiny col s1').style('cursor', 'Pointer').text('edit').on('click',function(){
            let active = d3.select(this).classed('clicked');
            active = !active;
            d3.select(this).classed('clicked',active)
            const parent = d3.select(this.parentNode);
            parent.select('span.clusterlabel').classed('hide',active);
            parent.select('input.clusterlabel').classed('hide',!active);
        });
        r_new.append('span').attrs({'class':'clusterlabel truncate left-align col s11','type':'text'});
        r_new.append('input').attrs({'class':'clusterlabel browser-default hide truncate center-align col s11','type':'text'}).on('change',function(d){
            clusterDescription[d.id].text = $(this).val();
            d3.select(this).classed('hide',true);
            const parent = d3.select(this.parentNode);
            parent.select('.editbtn').classed('clicked',false);
            parent.select('span.clusterlabel').text(clusterDescription[d.id].text).classed('hide',false);
            updateclusterDescription(d.id,clusterDescription[d.id].text);
        });
        r_new.append('span').attr('class','clusternum center-align col s12');
        r_new.append('span').attr('class','clusterMSE center-align col s12');
        dir.selectAll('.radarCluster')
            .attr('class',(d,i)=>'flex_col valign-wrapper radarCluster radarh'+d.id)
            .each(function(d,i){
                radarChartclusteropt.color = function(){return colorCluster(d.id)};
                RadarChart(".radarh"+d.id, d, radarChartclusteropt,"").select('.axisWrapper .gridCircle').classed('hide',true);
            });
        dir.selectAll('.radarCluster').classed('first',(d,i)=>!i);
        dir.selectAll('.radarCluster').select('span.clusterlabel').attr('data-order',d=>d.order+1).text(d=>d[0].text);
        dir.selectAll('.radarCluster').select('input.clusterlabel').attr('value',d=>d[0].text).each(function(d){$(this).val(d[0].text)});
        dir.selectAll('.radarCluster').select('span.clusternum').text(d=>(d[0].total||0).toLocaleString());
        dir.selectAll('.radarCluster').select('span.clusterMSE').classed('hide',!radarChartclusteropt.boxplot).text(d=>d3.format(".2")(d[0].mse||0));

    }, 0);
    outlier_map(outlyingList)
}
function outlier_map (data) {
    //--end
    let outlyingopt = _.cloneDeep(radarChartclusteropt);
    outlyingopt.fillin = 0;
    outlyingopt.boxplot = false;
    outlyingopt.schema = serviceFullList;
    let dir = d3.select('#outlierDisplay');
    setTimeout(()=>{
        let r_old = dir.selectAll('.radarCluster').data(data,d=>d.labels);
        r_old.exit().remove();
        let r_new = r_old.enter().append('div').attr('class','radarCluster')
            // .on('mouseover',function(d){
            //     if (!jobMap.runopt().mouse.disable) {
            //         mainviz.highlight(d.id);
            //     }
            //     d3.select(this).classed('focus',true);
            // }).on('mouseleave',function(d){
            //     if (!jobMap.runopt().mouse.disable) {
            //         mainviz.unhighlight(d.id);
            //     }
            //     d3.select(this).classed('focus',false);
            // })
            .append('div')
            .attr('class','label')
            .styles({'position':'absolute',
                'color':'black',
                'width': radarChartclusteropt.w+'px',
                height: '1rem',
                padding: '10px'
                // overflow: 'hidden',
            });
        // r_new.append('span').attr('class','clusterlabel truncate center-align col s12');
        // r_new.append('i').attr('class','editbtn material-icons tiny col s1').style('cursor', 'Pointer').text('edit').on('click',function(){
        //     let active = d3.select(this).classed('clicked');
        //     active = !active;
        //     d3.select(this).classed('clicked',active)
        //     const parent = d3.select(this.parentNode);
        //     parent.select('span.clusterlabel').classed('hide',active);
        //     parent.select('input.clusterlabel').classed('hide',!active);
        // });
        r_new.append('span').attrs({'class':'outlierLabel truncate left-align col s11','type':'text'});
        r_new.append('span').attr('class','clusternum center-align col s12');
        // r_new.append('input').attrs({'class':'clusterlabel browser-default hide truncate center-align col s11','type':'text'}).on('change',function(d){
        //     clusterDescription[d.id].text = $(this).val();
        //     d3.select(this).classed('hide',true);
        //     const parent = d3.select(this.parentNode);
        //     parent.select('.editbtn').classed('clicked',false);
        //     parent.select('span.clusterlabel').text(clusterDescription[d.id].text).classed('hide',false);
        //     updateclusterDescription(d.id,clusterDescription[d.id].text);
        // });
        dir.selectAll('.radarCluster')
            .attr('class',(d,i)=>
                'flex_col valign-wrapper radarCluster radarhoutlying'+(-d.labels))
            .each(function(d,i){
                outlyingopt.color = function(){return 'black'};
                RadarChart(".radarhoutlying"+(-d.labels), d.arr, outlyingopt,"").select('.axisWrapper .gridCircle').classed('hide',true);
            });
        dir.selectAll('.radarCluster').select('span.clusternum').text(d=>(d.arr.length).toLocaleString());
        dir.selectAll('.radarCluster').select('span.outlierLabel').text(d=>`Outlying group ${-d.labels}`);

    }, 0);
}
function updateclusterDescription (name,text){
    if (name)
        cluster_info.find(c=>c.name===name).text = text;
    else {
        cluster_info.forEach(c => c.text = clusterDescription[c.name].text);
        cluster_map(cluster_info)
    }
    jobMap.clusterDataLabel(cluster_info)
}

function updateViztype (viztype_in){
    viztype = viztype_in;
    $('#vizController span').text(`${viztype} Controller`);
    $('#mouseAction input[value="showseries"]+span').text(`Show ${viztype} series`)
    $('#vizController .icon').removeClass (function (index, className) {
        return (className.match (/(^|\s)icon-\S+/g) || []).join(' ');
    }).addClass(`icon-${viztype}Shape`);
    RadarChart = eval(`${viztype}Chart_func`);
    d3.selectAll('.radarPlot .radarWrapper').remove();
    if (!firstTime) {
        // updateSummaryChartAll();
        MetricController.charType(viztype).drawSummary();
        if (cluster_info) {
            cluster_map(cluster_info);
            jobMap.draw();
        }
    }
}

let clustercalWorker;
function recalculateCluster (option,calback,customCluster) {
    preloader(true,10,'Process grouping...','#clusterLoading');
    group_opt = option;
    distance = group_opt.normMethod==='l1'?distanceL1:distanceL2
    if (clustercalWorker)
        clustercalWorker.terminate();
    clustercalWorker = new Worker ('src/script/worker/clustercal.js');
    clustercalWorker.postMessage({
        binopt:group_opt,
        // tsnedata:tsnedata,
        sampleS:tsnedata,
        timeMax:sampleS.timespan.length,
        hosts:hosts,
        serviceFullList: serviceFullList,
        serviceLists:serviceLists,
        serviceList_selected:serviceList_selected,
        serviceListattr:serviceListattr,
        customCluster: customCluster // 1 25 2020 - Ngan
    });
    clustercalWorker.addEventListener('message',({data})=>{
        if (data.action==='done') {
            M.Toast.dismissAll();
            data.result.forEach(c=>c.arr = c.arr.slice(0,lastIndex));
            cluster_info = data.result;
            if (!customCluster) {
                clusterDescription = {};
                recomendName(cluster_info);
            }else{
                let new_clusterDescription = {};
                cluster_info.forEach((d,i)=>{
                    new_clusterDescription[`group_${i+1}`] = {id:`group_${i+1}`,text:clusterDescription[d.name].text};
                    d.index = i;
                    d.labels = ''+i;
                    d.name = `group_${i+1}`;
                });
                clusterDescription = new_clusterDescription;
                updateclusterDescription();
            }
            recomendColor (cluster_info);
            if (!calback) {
                handle_clusterinfo();
                cluster_map(cluster_info);
                handle_dataRaw();
                requestRedraw();
            }
            preloader(false, undefined, undefined, '#clusterLoading');
            clustercalWorker.terminate();
            if (calback)
                calback();
        }
        if (data.action==='returnData'){
            onloaddetermire({process:data.result.process,message:data.result.message},'#clusterLoading');
        }
    }, false);

}

function recomendName (clusterarr){
    clusterarr.forEach((c,i)=>{
        c.index = i;
        c.axis = [];
        c.labels = ''+i;
        c.name = `group_${i+1}`;
        let zero_el = c.__metrics.filter(f=>!f.value);
        let name='';
        if (zero_el.length && zero_el.length<c.__metrics.normalize.length){
            c.axis = zero_el.map(z=>{return{id:z.axis,description:'undefined'}});
            name += `${zero_el.length} metric(s) undefined `;
        }else if(zero_el.length===c.__metrics.normalize.length){
            c.text = `undefined`;
            if(!clusterDescription[c.name])
                clusterDescription[c.name] = {};
            clusterDescription[c.name].id = c.name;
            clusterDescription[c.name].text = c.text;
            return;
        }
        name += c.__metrics.filter(f=>f.value>0.75).map(f=>{
            c.axis.push({id:f.axis,description:'high'});
            return 'High '+f.axis;
        }).join(', ');
        name = name.trim();
        if (name==='')
            c.text = ``;
        else
            c.text = `${name}`;
        if(!clusterDescription[c.name])
            clusterDescription[c.name] = {};
        clusterDescription[c.name].id = c.name;
        clusterDescription[c.name].text = c.text;
    });
}

function recomendColor (clusterarr) {
    let colorCa = colorScaleList['customschemeCategory'].slice();
    if (clusterarr.length>10 && clusterarr.length<21)
        colorCa = d3.schemeCategory20;
    else if (clusterarr.length>20)
        colorCa = clusterarr.map((d,i)=>d3.interpolateTurbo(i/(clusterarr.length-1)));
    let colorcs = d3.scaleOrdinal().range(colorCa);
    let colorarray = [];
    let orderarray = [];
    // clusterarr.filter(c=>!c.text.match('undefined'))
    clusterarr.filter(c=>c.text!=='undefined')
        .forEach(c=>{
            colorarray.push(colorcs(c.name));
            orderarray.push(c.name);
        });
    clusterarr.filter(c=>c.text==='undefined').forEach(c=>{
        colorarray.push('gray');
        orderarray.push(c.name);
    });
    // clusterarr.filter(c=>c.text!=='undefined' && c.text.match('undefined')).forEach(c=>{
    //     colorarray.push('#7f7f7f');
    //     orderarray.push(c.name);
    // });
    colorCluster.range(colorarray).domain(orderarray)
}

function handle_clusterinfo () {
    let data_info = [['Grouping Method:',group_opt.clusterMethod]];
    d3.select(`#${group_opt.clusterMethod}profile`).selectAll('label').each(function(d,i) {
        data_info.push([d3.select(this).text(), group_opt.bin[Object.keys(group_opt.bin)[i]]])
    });
    data_info.push(['#group calculated:',cluster_info.length]);
    let table = d3.select('#clusterinformation').select('table tbody');
    let tr=table
        .selectAll('tr')
        .data(data_info);
    tr.exit().remove();
    let tr_new = tr.enter().append('tr');
    let td = table.selectAll('tr').selectAll('td').data(d=>d);
    td.exit().remove();
    td.enter().append('td')
        .merge(td)
        .text(d=>d);
}

function similarityCal(data){
    const n = data.length;
    let simMatrix = [];
    let mapIndex = [];
    for (let i = 0;i<n; i++){
        let temp_arr = [];
        temp_arr.total = 0;
        for (let j=i+1; j<n; j++){
            let tempval = similarity(data[i][0],data[j][0]);
            temp_arr.total += tempval;
            temp_arr.push(tempval)
        }
        for (let j=0;j<i;j++)
            temp_arr.total += simMatrix[j][i-1-j];
        temp_arr.name = data[i][0].name;
        temp_arr.index = i;
        mapIndex.push(i);
        simMatrix.push(temp_arr)
    }
    mapIndex.sort((a,b)=> simMatrix[a].total-simMatrix[b].total);

    let current_index = mapIndex.pop();
    let orderIndex = [simMatrix[current_index].index];

    do{
        let maxL = Infinity;
        let maxI = 0;
        mapIndex.forEach((d)=>{
            let temp;
            if (d>simMatrix[current_index].index ){
                temp = simMatrix[current_index][d-current_index-1];
            }else{
                temp = simMatrix[d][current_index-d-1]
            }
            if (maxL>temp){
                maxL = temp;
                maxI = d;
            }
        });
        orderIndex.push(simMatrix[maxI].index);
        current_index = maxI;
        mapIndex = mapIndex.filter(d=>d!=maxI);} while(mapIndex.length);
    return orderIndex;
    function similarity (a,b){
        return Math.sqrt(d3.sum(a,(d,i)=>(d.value-b[i].value)*(d.value-b[i].value)));
    }
}
