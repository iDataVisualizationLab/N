var width, height;

var m = [40, 0, 10, 0],
    w,
    h,
    xscale,
    yscale = {},
    dragging = {},
    line =  d3.line(),
    axis,
    data,
    foreground,
    background,
    highlighted,
    dimensions,
    legend,
    render_speed = 50,
    brush_count = 0,
    excluded_groups = [],
    svg,g,listMetric;
var dataTableFiltered;

//legend prt
var arrColor = ['#000066','#0000ff', '#1a9850', '#ddee00','#ffcc44', '#ff0000', '#660000'];
var levelStep = 4;
var arrThresholds;
var selectedService = "hp6";
var orderLegend;
var svgLengend;
//read file
var serviceList = ["Temperature","Job_load","Memory_usage","Fans_speed","Power_consum"];
var serviceLists = [{text: "Temperature", id: 0, enable:true,
    sub:[{text: 'CPU1 Temp', id: 0, enable:true},{text: 'CPU2 Temp', id: 1, enable:true},{text: 'Inlet Temp', id: 2, enable:true}]},
    {text: "Job_load", id: 1, enable:true ,sub:[{text: 'Job load', id: 0, enable:true}]},
    {text: "Memory_usage", id: 2 , enable:true ,sub:[{text: 'Memory usage', id: 0, enable:true}]},
    {text: "Fans_speed", id: 3 , enable:true ,sub:[{text: 'Fan1 speed', id: 0, enable:true},{text: 'Fan2 speed', id: 1, enable:true},{text: 'Fan3 speed', id: 2, enable:true},{text: 'Fan4 speed', id: 3, enable:true}]},
    {text: "Power_consum", id: 4 , enable:true ,sub:[{text: 'Power consumption', id: 0, enable:true}]}];
var serviceListattr = ["arrTemperature","arrCPU_load","arrMemory_usage","arrFans_health","arrPower_usage"];
var serviceListattrnest = [
    {key:"arrTemperature", sub:["CPU1 Temp","CPU2 Temp","Inlet Temp"]},
    {key:"arrCPU_load", sub:["Job load"]},
    {key:"arrMemory_usage", sub:["Memory usage"]},
    {key:"arrFans_health", sub:["Fan1 speed","Fan2 speed","Fan3 speed","Fan4 speed"]},
    {key:"arrPower_usage", sub:["Power consumption"]}];
var thresholds = [[3,98], [0,10], [0,99], [1050,17850],[0,200] ];
var chosenService = 0;
var conf={};
conf.serviceList = serviceList;
conf.serviceLists = serviceLists;
conf.serviceListattr = serviceListattr;
conf.serviceListattrnest = serviceListattrnest;
let dataInformation={filename:'',metric:0,datanum:0};
srcpath = '../BioRadar/';
function Loadtostore() {
    // checkConf('serviceList');
    // checkConf('serviceLists');
    // checkConf('serviceListattr');
    // checkConf('serviceListattrnest');
}
// color
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


//var arrColor = ['#00c', '#1a9850','#fee08b', '#d73027'];
// var arrColor = ['#110066','#4400ff', '#00cccc', '#00dd00','#ffcc44', '#ff0000', '#660000'];
// let arrColor = colorScaleList.customFunc('rainbow');
// let arrColor = colorScaleList.d3colorChosefunc('Greys');
var arrColor = ['#000066','#0000ff', '#1a9850', '#ddee00','#ffcc44', '#ff0000', '#660000'];
let colorCluster  = d3.scaleOrdinal().range(d3.schemeCategory10);

var service_custom_added = [];
var serviceFullList_withExtra =[];
// let processData = processData_old;

//***********************
// Loadtostore();
//***********************
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
var  spinner = new Spinner(opts).spin(target);
// END: loader spinner settings ****************************

var undefinedValue = undefined;
var undefinedColor = "#666";
var colorscale = d3.scaleOrdinal(d3.schemeCategory10);
var colors = d3.scaleOrdinal();
var color,opa;
/// drawLegend *****************************************************************
let legendw= 80;
let legendh= 20;
let barw = 300;
let barScale = d3.scaleLinear();
let db = 'nagios';
let numScale = "scaleLinear";
// let animationtime = false ;
const collator = new Intl.Collator(undefined, {numeric: true, sensitivity: 'base'});

// // volcanoPlot
// let volcanoPlot = d3.VolcanoPlot();
Array.prototype.naturalSort= function(_){
    if (arguments.length) {
        return this.sort(function (as, bs) {
            return collator.compare(as[_],bs[_]);
        });
    }else {
        return this.sort(collator.compare);
    }
};

let group_opt = {
    clusterMethod: 'leaderbin',
    bin:{
        startBinGridSize: 5,
        range: [9,10]
    }
};

function filterAxisbyDom(d) {
    const pdata = d3.select(this.parentElement.parentElement).datum();
    if(d.value.enable !== this.checked) {
        d.value.enable = this.checked;
        if (this.checked) {
            add_axis(pdata.arr, g);
            d3.select(this.parentElement.parentElement).classed('disable', false);
        }
        else {
            remove_axis(pdata.arr, g);
            d3.select(this.parentElement.parentElement).classed('disable', true);
        }
        // TODO required to avoid a bug
        var extent = d3.brushSelection(svg.selectAll(".dimension").filter(d => d == pdata.arr));
        if (extent)
            extent = extent.map(yscale[d].invert).sort((a, b) => a - b);
        update_ticks(pdata.arr, extent);
    }
}
let listOption=[];
function drawFiltertable() {
    listOption = serviceFullList_withExtra.map((e,ei) => {
        return {service: e.text, arr: e.text,order:ei,id:e.id, text: e.text, enable: e.enable,hide:e.hide}
    });

    let table = d3.select("#axisSetting").select('tbody');
    table
        .selectAll('tr').data(listOption)
        .join(enter => {
            const tr = enter.append("tr");
            tr.attr('data-id', d => d.arr);
            tr.classed('hide', d => d.hide);
            tr.each(function(d){d.tableObj = d3.select(this);})
            const alltr = tr.selectAll('td')
                .data(d => [{key: 'enable', value: d, type: "checkbox"}, {
                    key: 'colorBy',
                    value: false,
                    type: "radio"
                },{key:"logScale",value:d,type:"checkbox"}, {key: 'text', value: d.text}]).enter()
                .append("td");
            alltr.filter(d => d.type === "radio")
                .append("input")
                .attrs(function (d, i) {
                    const pdata = d3.select(this.parentElement.parentElement).datum();
                    return {
                        type: "radio",
                        name: "colorby",
                        value: pdata.service
                    }
                }).on('change', function (d) {
                d3.select('tr.axisActive').classed('axisActive', false);
                d3.select(this.parentElement.parentElement).classed('axisActive', true);
                changeVar(d3.select(this.parentElement.parentElement).datum());
                brush();
            });
            alltr.filter(d => d.key === "enable")
                .append("input")
                .attrs(function (d, i) {
                    return {
                        type: "checkbox",
                        checked: serviceFullList_withExtra[d.value.order].enable ? "checked" : null
                    }
                }).on('adjustValue',function(d){
                    d3.select(this).attr('checked',serviceFullList_withExtra[d.value.order].enable ? "checked" : null)
            }).on('change', function (d) {
                filterAxisbyDom.call(this, d);
                xscale.domain(dimensions);
                d3.select("#foreground").style("opacity", null);
                brush();
            });

            alltr.filter(d => d.key === "logScale")
                .append("input")
                .classed('hide',function(d){return !serviceFullList_withExtra[d.value.order].primaxis})
                .attrs(function (d, i) {
                    return {
                        type: "checkbox",
                        checked: serviceFullList_withExtra[d.value.order].islogScale ? "checked" : null
                    }
                }).on('adjustValue',function(d){
                    this.checked = serviceFullList_withExtra[d.value.order].islogScale;
                }).on('change', function (d) {
                    serviceFullList_withExtra[d.value.order].islogScale = this.checked;
                    adjustdata([{key:d.value.service,value:this.checked}]);
                    d3.select('#ToggeleLog').dispatch('adjustValue')
                    rescale(true);
                    updateColorsAndThresholds(d.value.text);
                    if (selectedService===d.value.service){
                        setColorsAndThresholds(d.value.service);
                    }
                    brush();
                });
            alltr.filter(d => d.type === undefined)
                .text(d => d.value);
        }, update =>{
            const tr = update;
            tr.classed('hide', d => d.hide);
            tr.each(function(d){d.tableObj = d3.select(this);})
            tr.attr('data-id', d => d.arr);
            const alltr = tr.selectAll('td')
                .data(d => [{key: 'enable', value: d, type: "checkbox"}, {
                    key: 'colorBy',
                    value: false,
                    type: "radio"
                },{key:"logScale",value:d,type:"checkbox"}, {key: 'text', value: d.text}]);
            alltr.filter(d => d.type === undefined)
                .text(d => d.value);
            alltr.filter(d => d.key === "enable")
                .select("input")
                .each(function(d){this.checked = serviceFullList_withExtra[d.value.order].enable});
            alltr.filter(d => d.key === "logScale")
                .select("input")
                .classed('hide',function(d){return !serviceFullList_withExtra[d.value.order].primaxis})
                .dispatch('adjustValue');
            }
        );
    listMetric = Sortable.create($('tbody')[0], {
        animation: 150,
        sort: true,
        dataIdAttr: 'data-id',
        filter: ".disable",
        onStart: function (/**Event*/evt) {
            evt.oldIndex;  // element index within parent
            const currentAxis = d3.select(evt.item).datum();
            const chosenAxis = svg.selectAll(".dimension").filter(d => d == currentAxis.arr);
            _.bind(dragstart, chosenAxis.node(), chosenAxis.datum())();
        },
        onEnd: function (/**Event*/evt) {
            var itemEl = evt.item;  // dragged HTMLElement
            evt.to;    // target list
            evt.from;  // previous list
            evt.oldIndex;  // element's old index within old parent
            evt.newIndex;  // element's new index within new parent
            evt.clone // the clone element
            evt.pullMode;  // when item is in another sortable: `"clone"` if cloning, `true` if moving
            const currentAxis = d3.select(itemEl).datum();
            const chosenAxis = svg.selectAll(".dimension").filter(d => d == currentAxis.arr);
            _.bind(dragend, chosenAxis.node(), chosenAxis.datum())();
        },
        onMove: function (/**Event*/evt, /**Event*/originalEvent) {

            // Example: https://jsbin.com/nawahef/edit?js,output
            evt.dragged; // dragged HTMLElement
            evt.draggedRect; // DOMRect {left, top, right, bottom}
            evt.related; // HTMLElement on which have guided
            evt.relatedRect; // DOMRect
            evt.willInsertAfter; // Boolean that is true if Sortable will insert drag element after target by default
            originalEvent.clientY; // mouse position
            // return false; — for cancel
            // return -1; — insert before target
            // return 1; — insert after target
            // console.log(originalEvent);
            // console.log(d3.event);
            const currentAxis = d3.select(evt.dragged).datum();
            const relatedtAxis = d3.select(evt.related).datum();
            const chosenAxis = svg.selectAll(".dimension").filter(d => d === currentAxis.arr);


            d3.event = {};
            // d3.event.dx = originalEvent.clientY - this.pre; // simulate the drag behavior
            d3.event.dx = position(relatedtAxis.arr) - position(currentAxis.arr); // simulate the drag behavior
            d3.event.dx = d3.event.dx + ((d3.event.dx > 0) ? 1 : -1);
            if (!isNaN(d3.event.dx))
                _.bind(dragged, chosenAxis.node(), chosenAxis.datum())();

        }
    });
}
let shuffled_data = [];
let isdatachange = false;
$( document ).ready(function() {
    console.log('ready');
    try {
        let dataName = window.location.search.substring(1).split("app=")[1].split('&')[0].replace(/%20/g,' '); // get data name after app=
        // set the dataset which has been choose, datacom is DOM component which load for data
        let inittarget = d3.selectAll(`#datacom option[value="${dataName}"]`);
        if (!inittarget.empty()){
            $('#datacom').val(dataName)
        }
    }catch(e){}
    $('.tabs').tabs();
    $('.modal').modal();
    $('.dropdown-trigger').dropdown();
    $('.sidenav').sidenav();
    $('#leftpanel.collapsible').collapsible({onOpenStart: function(evt){
        console.log(evt)
            if(d3.select(evt).classed('searchPanel')&&complex_data_table_render){
                complex_data_table(shuffled_data,true)
            }
        }});
    discovery('#sideNavbtn');
    d3.select("#DarkTheme").on("click",switchTheme);

    // data
    d3.select('#datacom').on("change", function () {
        preloader(true);
        exit_warp();
        const choice = this.value;
        const choicesplit = d3.select(d3.select('#datacom').node().selectedOptions[0]).attr('data-split')==="none";
        const choicepreload = d3.select(d3.select('#datacom').node().selectedOptions[0]).attr('data-preload');
        setTimeout(() => {
                initApp(choice,choicesplit,choicepreload);
        },0);
    });
    spinner = new Spinner(opts).spin(target);
    d3.select('#enableCPM_control').on('change',function(){
        isdatachange = $(this)[0].checked;
        onChangeValue($(this)[0].checked)
    })

    d3.select('#datacom').dispatch('change')

    // Spinner Stop ********************************************************************

    d3.select('#enableVariableCorrelation').on('click',function(){
        getcorrelation();
    });
    d3.select('#majorGroupDisplay_control').on('change',function() {
        switch ($(this).val()) {
            case "0":
                radarChartclusteropt.boxplot = false;
                d3.selectAll('#clusterDisplay .radarPlot').style('opacity',null);
                cluster_map(cluster_info);
                break;
            case "1":
                radarChartclusteropt.boxplot = true;
                d3.selectAll('#clusterDisplay .radarPlot').style('opacity',null);
                cluster_map(cluster_info);
                break;
            case "2":
                d3.selectAll('#clusterDisplay .radarPlot').style('opacity',0.2);
                onClusterHistogram();
                break;
        }
    });
    d3.select('#ToggeleLog').on('adjustValue',function(){
        let logaxisTotal = serviceFullList_withExtra.filter(s=>s.islogScale).length;
        if (logaxisTotal === primaxis.length)
            this.checked = true;
        else if (logaxisTotal===0)
            this.checked = false;
        else {
            this.checked = false;
            this.indeterminate = true;
        }
    })
    // init();
});

function realTimesetting (option,db,init){
    isRealtime = option;
    // getDataWorker.postMessage({action:'isRealtime',value:option,db: db});
    if (option){
        processData = eval('processData_'+db);
    }else{
        processData = db?eval('processData_'+db):processData_old;
    }
    // if(!init)
    //     resetRequest();
}

function getBrush(d) {
    return d3.brushY(yscale[d])
        .extent([[-10, 0], [10, h]])
        .on("brush", ()=>brush(true))
        .on("end", ()=>brush());
}
function dragstart (d) {
    dragging[d] = this.__origin__ = xscale(d);
    this.__dragged__ = false;
    d3.select("#foreground").style("opacity", "0.35");
}
function dragged (d) {
    dragging[d] = Math.min(w, Math.max(0, this.__origin__ += d3.event.dx));

    dimensions.sort(function (a, b) {

        return position(a) - position(b);
    });
    xscale.domain(dimensions);
    reorderDimlist();
    svg.selectAll(".dimension").attr("transform", function (d) {
        return "translate(" + position(d) + ")";
    });
    this.__dragged__ = true;
    //brush();
    // Feedback for axis deletion if dropped
    if (dragging[d] < 12 || dragging[d] > w - 12) {
        d3.select(this).select(".background").style("fill", "#b00");
    } else {
        d3.select(this).select(".background").style("fill", null);
    }
}

function reorderDimlist() {
// reorder list
    let pre = 0;
    let next = 0;
    dimensions.find(dim => {
        const pos = _.indexOf(listMetric.toArray(), dim);
        next = pos != -1 ? pos : next;
        if (next < pre)
            return true;
        else
            pre = next;
        return false;
    });
    if (next < pre) {
        let order_list = listMetric.toArray();
        swap(order_list, pre, next);
        listMetric.sort(order_list);
    }
}

function dragend(d) {
    if (!this.__dragged__) {
        // no movement, invert axis
        var extent = invert_axis(d, this);
    } else {
        // reorder axes
        d3.select(this).transition().attr("transform", "translate(" + xscale(d) + ")");

        // var extent = yscale[d].brush.extent();
        var extent = d3.brushSelection(this);
        if (extent)
            extent = extent.map(yscale[d].invert).sort((a,b)=>a-b);
    }

    // remove axis if dragged all the way left
    if (dragging[d] < 12 || dragging[d] > w - 12) {
        remove_axis(d, g);
    }

    // TODO required to avoid a bug
    xscale.domain(dimensions);
    update_ticks(d, extent);

    reorderDimlist();
    // rerender
    d3.select("#foreground").style("opacity", null);
    brush();
    delete this.__dragged__;
    delete this.__origin__;
    delete dragging[d];
}
function swap (a,indexa,indexb){
    const temp = a[indexa];
    a[indexa] = a[indexb];
    a[indexb] = temp;
}
// Establish the desired formatting options using locale.format():
// https://github.com/d3/d3-time-format/blob/master/README.md#locale_format
var formatMillisecond = d3.timeFormat(".%L"),
    formatSecond = d3.timeFormat(":%S"),
    formatMinute = d3.timeFormat("%I:%M"),
    formatHour = d3.timeFormat("%I %p"),
    formatDay = d3.timeFormat("%a %d"),
    formatWeek = d3.timeFormat("%b %d"),
    formatMonth = d3.timeFormat("%B"),
    formatYear = d3.timeFormat("%Y");

// Define filter conditions
function multiFormat(date) {
    return (d3.timeSecond(date) < date ? formatMillisecond
        : d3.timeMinute(date) < date ? formatSecond
            : d3.timeHour(date) < date ? formatMinute
                : d3.timeDay(date) < date ? formatHour
                    : d3.timeMonth(date) < date ? (d3.timeWeek(date) < date ? formatDay : formatWeek)
                        : d3.timeYear(date) < date ? formatMonth
                            : formatYear)(date);
}

function updateDimension() {
    g = svg.selectAll(".dimension")
        .data(dimensions,d=>d).join(enter => {
                const new_dim = enter.append("svg:g")
                    .attr("class", "dimension")
                    .attr("transform", function (d) {
                        return "translate(" + xscale(d) + ")";
                    })
                    .call(d3.drag()
                        .on("start", dragstart)
                        .on("drag", dragged)
                        .on("end", dragend));
                // Add an axis and title.
                new_dim.append("svg:g")
                    .attr("class", "axis")
                    .attr("transform", "translate(0,0)")
                    .each(function (d) {
                        return d3.select(this).call(axis.scale(yscale[d]));
                    })
                    .append("svg:text")
                    .attr("text-anchor", "middle")
                    .attr("y", -14)
                    .attr("x", 0)
                    .attr("class", "label")
                    .text(String)
                    .append("title")
                    .text("Click to invert. Drag to reorder");
                // Add violinplot holder
                new_dim.append("svg:g")
                    .attr("class", "plotHolder")
                    .attr("transform", "translate(0,0)")
                    .style('opacity',0.8);
                // Add and store a brush for each axis.
                new_dim.append("svg:g")
                    .attr("class", "brush")
                    .each(function (d) {
                        d3.select(this).call(yscale[d].brush = getBrush(d));
                    })
                    .selectAll("rect")
                    .style("visibility", null)
                    .attr("x", -23)
                    .attr("width", 36)
                    .append("title")
                    .text("Drag up or down to brush along this axis");

                new_dim.selectAll(".extent")
                    .append("title")
                    .text("Drag or resize this filter");
                return new_dim;
            },
            update =>{
                isChangeData = true;
                // Add an axis and title.
                update.select(".axis")
                    .attr("transform", "translate(0,0)")
                    .each(function (d) {
                        return d3.select(this).call(axis.scale(yscale[d]));
                    });
                return  update.attr("transform", function (d) {
                    return "translate(" + xscale(d) + ")";});
            },exit => exit.remove());
}

function init() {
    if(timel)
        timel.stop();
    console.log('init')
    // volcanoPlot.graphicopt({width:380,height:370,margin:{top:0,left:30,right:0,bottom:20}});
    width = $("#Maincontent").width()-10;
    height = d3.max([document.body.clientHeight-150, 300]);
    w = width - m[1] - m[3];
    h = height - m[0] - m[2];
    xscale = d3.scalePoint().range([0, w]).padding(0.3);
    axis = d3.axisLeft().ticks(1+height/50);
    // Scale chart and canvas height
    let chart = d3.select("#chart")
        .style("height", (h + m[0] + m[2]) + "px");

    chart.selectAll("canvas")
        .attr("width", w)
        .attr("height", h)
        .style("padding", m.join("px ") + "px");


// Foreground canvas for primary view
    foreground = document.getElementById('foreground').getContext('2d');
    foreground.globalCompositeOperation = "destination-over";
    foreground.strokeStyle = "rgba(0,100,160,0.1)";
    foreground.lineWidth = 1.7;
    foreground.fillText("Loading...",w/2,h/2);

// Highlight canvas for temporary interactions
    highlighted = document.getElementById('highlight').getContext('2d');
    highlighted.strokeStyle = "rgba(0,100,160,1)";
    highlighted.lineWidth = 4;

// Background canvas
    background = document.getElementById('background').getContext('2d');
    background.strokeStyle = "rgba(0,100,160,0.1)";
    background.lineWidth = 1.7;

    // svgLengend = d3.select('#colorContinuos').append('div').append('svg')
    //     .attr("class", "legendView")
    //     .attr("width", 0)
    //     .attr("height", 0)
    //     .style('display','none');
// SVG for ticks, labels, and interactions
    svg = d3.select("#chart").select("svg")
        .attr("width", width)
        .attr("height", height)
        .append("svg:g")
        .attr("transform", "translate(" + m[3] + "," + m[0] + ")");
    svg.selectAll('*').remove()
    // Load the data and visualization
    isinit = false;
    // Convert quantitative scales to floats
    // dataRaw = object2DataPrallel(sampleS);
    // loadCPMData();
    data = dataRaw;

    // Extract the list of numerical dimensions and create a scale for each.
    xscale.domain(dimensions = serviceFullList.filter(function (s) {
        let k = s.text;
        let xtempscale = (((_.isDate(data[0][k])) && (yscale[k] = d3.scaleTime()
            .domain(d3.extent(data, function (d) {
                return d[k];
            }))
            .range([h, 0])) || (_.isNumber(data[0][k])) && (yscale[k] = d3.scaleLinear()
            .domain(serviceFullList.find(d=>d.text===k).range)
            .range([h, 0]))));
        return s.enable?xtempscale:false;
    }).map(s=>s.text));
    // Add a group element for each dimension.
    setColorsAndThresholds_full();
    updateDimension();

    makeDataTableFiltered ();
    // legend = create_legend(colors, brush);
    if (!serviceFullList.find(d=>d.text===selectedService))
        selectedService = serviceFullList[0].text;
    const selecteds = d3.select("#axisSetting")
        .select('tbody')
        .selectAll('tr')
        .filter(d=>d.arr===selectedService).select('input[type="radio"]').property("checked", true);
    _.bind(selecteds.on("change"),selecteds.node())();
    // changeVar(d3.select("#axisSetting").selectAll('tr').data().find(d=>d.arr==selectedService));
    // Render full foreground

    // disable volcano plot
    // if (vocanoData)
    //     handle_data_volcanoplot(tsnedata);
    // else
    //     volcanoPlot.stop().hide();
    brush();


}

function resetRequest() {
    // Convert quantitative scales to floats
    // animationtime = false;
    console.log('requestreset');
    unhighlight()
    // dataRaw = object2DataPrallel(sampleS);
    data = dataRaw;
    yscale = {};
    xscale.domain(dimensions = serviceFullList.filter(function (s) {
        let k = s.text;
        let xtempscale = (((_.isDate(data[0][k])) && (yscale[k] = d3.scaleTime()
            .domain(d3.extent(data, function (d) {
                return d[k];
            }))
            .range([h, 0])) || (_.isNumber(data[0][k])) && (yscale[k] = d3.scaleLinear()
            // .domain(d3.extent(data, function (d) {
            //     return +d[k];
            // }))
            .domain(serviceFullList.find(d=>d.text===k).range)
            .range([h, 0]))));
        return s.enable?xtempscale:false;
    }).map(s=>s.text));
    d3.select('#search').attr('placeholder',`Search host e.g ${data[0].compute}`);
    // Add a group element for each dimension.
    updateDimension();
    setColorsAndThresholds_full();
    makeDataTableFiltered ();
    if (!serviceFullList.find(d=>d.text===selectedService))
        selectedService = serviceFullList[0].text();
    const selecteds = d3.select("#axisSetting")
        .select('tbody')
        .selectAll('tr')
        .filter(d=>d.arr==selectedService).select('input[type="radio"]').property("checked", true);
    _.bind(selecteds.on("change"),selecteds.node())();
    d3.select('#ToggeleLog').dispatch('adjustValue')
    // if (vocanoData)
    //     handle_data_volcanoplot(tsnedata);
    // else
    //     volcanoPlot.stop().hide();
    // brush();
}
let coloraxis ={};
let opaaxis ={};
function setColorsAndThresholds_full() {
    coloraxis ={};
    opaaxis ={};
    serviceFullList.forEach(s=> {
        const dif = (s.range[1] - s.range[0]) / levelStep;
        const mid = s.range[0] + (s.range[1] - s.range[0]) / 2;
        let left = s.range[0] - dif;
        arrThresholds = [left, s.range[0], s.range[0] + dif, s.range[0] + 2 * dif, s.range[0] + 3 * dif, s.range[1], s.range[1] + dif];
        coloraxis[s.text] = d3.scaleLinear()
            .domain(arrThresholds)
            .range(arrColor)
            .interpolate(d3.interpolateHcl); //interpolateHsl interpolateHcl interpolateRgb
        opaaxis[s.text] = d3.scaleLinear()
            .domain([left, s.range[0], mid, s.range[1], s.range[1] + dif])
            .range([1, 1, 0.1, 1, 1]);
    })
}
function updateColorsAndThresholds(sin){
    let s = serviceFullList.find(d=>d.text===sin);
    const dif = (s.range[1]-s.range[0])/levelStep;
    const mid = s.range[0]+(s.range[1]-s.range[0])/2;
    let left = s.range[0]-dif;
    let arrThresholds = [left,s.range[0], s.range[0]+dif, s.range[0]+2*dif, s.range[0]+3*dif, s.range[1], s.range[1]+dif];
    coloraxis[sin] = d3.scaleLinear()
        .domain(arrThresholds)
        .range(arrColor)
        .interpolate(d3.interpolateHcl); //interpolateHsl interpolateHcl interpolateRgb
    opaaxis[sin] = d3.scaleLinear()
        .domain([left,s.range[0],mid, s.range[1], s.range[1]+dif])
        .range([1,1,0.1,1,1]);
}
function setColorsAndThresholds(sin) {
    color = coloraxis[sin];
    opa = opaaxis[sin];
}

// copy one canvas to another, grayscale
function gray_copy(source, target) {
    var pixels = source.getImageData(0,0,w,h);
    target.putImageData(grayscale(pixels),0,0);
}

// http://www.html5rocks.com/en/tutorials/canvas/imagefilters/
function grayscale(pixels, args) {
    var d = pixels.data;
    for (var i=0; i<d.length; i+=4) {
        var r = d[i];
        var g = d[i+1];
        var b = d[i+2];
        // CIE luminance for the RGB
        // The human eye is bad at seeing red and blue, so we de-emphasize them.
        var v = 0.2126*r + 0.7152*g + 0.0722*b;
        d[i] = d[i+1] = d[i+2] = v
    }
    return pixels;
};

function create_legend(colors,brush) {
    if (selectedService) {
        colorbyValue(orderLegend);
    }else{
        colorbyCategory(data,"group");
    }
    barScale.range([0,Math.max(svgLengend.node().parentElement.offsetWidth,400)]);
    // create legend
    var legend_data = d3.select("#legend")
        .html("")
        .selectAll(".row")
        .data( colors.domain() );
    var legendAll = legend_data.join(
        enter=>{
            let legend = enter.append("div")
                .attr("title", "Hide group");
            legend
                .append("span")
                .attr("class","col s3")
                .text(function(d,i) { return " " + d});
            legend
                .append("span")
                .style("opacity",0.85)
                .attr("class", "color-bar");

            legend
                .append("span")
                .attr("class", "tally")
                .text(function(d,i) { return 0});

            return legend;
        }
    ).on("click", function(d) {
        // toggle food group
        if (_.contains(excluded_groups, d)) {
            d3.select(this).attr("title", "Hide group")
            excluded_groups = _.difference(excluded_groups,[d]);
            brush();
        } else {
            d3.select(this).attr("title", "Show group")
            excluded_groups.push(d);
            brush();
        }
    });
    legendAll.selectAll(".color-bar").style("background", function(d,i) { return colors(d)});
    return legendAll;
}

// render polylines i to i+render_speed
function render_range(selection, i, max, opacity) {
    selection.slice(i,max).forEach(function(d) {
        path(d, foreground, colorCanvas(selectedService==null?d.group:d[selectedService],opacity));
        // if (animationtime){
        //     timel.stop();
        //     animationtime = false;
        //     return true
        // }
    });
};

// simple data table
// function data_table(sample) {
//     // sort by first column
//     // var sample = sample.sort(function(a,b) {
//     //     var col = d3.keys(a)[0];
//     //     return a[col] < b[col] ? -1 : 1;
//     // });
//     // sort by Name
//     var sample = sample.naturalSort("name");
//
//     var table = d3.select("#compute-list")
//         .html("")
//         .selectAll("li")
//         .data(sample)
//         .enter().append("li")
//         .on("mouseover", highlight)
//         .on("mouseout", unhighlight);
//
//     table
//         .append("span")
//         .attr("class", "color-block")
//         .style("background", function(d) { return color(selectedService==null?d.group:d[selectedService]) })
//         .style("opacity",0.85);
//
//     table
//         .append("span")
//         .text(function(d) { return d.name; })
// }
// complex data table
// let filteredData = undefined;

let presetdatatable = [];
// complex data table
let complex_data_table_render = false;
function complex_data_table(sample,render) {
    if(complex_data_table_render && (render||!d3.select('.searchPanel.active').empty())) {
        console.time('nest data')
        var samplenest = d3.nest()
            .key(d => d.rack).sortKeys(collator.compare)
            .entries(sample);
        Object.keys(globalFilter).forEach(gf => {
            let values = [];
            globalFilter[gf].forEach(g=>{
                const s = sample.find(s=>s.compute===g);
                if(s)
                    values.push(s)
            });
            samplenest.push({
                key: gf,
                ordiginal: globalFilter[gf].length,
                values: values
            });
        });
        console.timeEnd('nest data');
        let instance = M.Collapsible.getInstance('#compute-list');
        if (instance)
            instance.destroy();
        console.time('render')
        d3.select("#compute-list").selectAll('*').remove();
        var table = d3.select("#compute-list")
            .attr('class', 'collapsible expandable rack')
            .selectAll("li")
            .data(samplenest, d => d.value);
        var ulAll = table.join(
            enter => {
                let lir = enter.append("li").attr('class', 'rack').classed('active', d => _.includes(presetdatatable, d.key));
                lir.append('div')
                    .attr('class', 'collapsible-header')
                    .html(d => `${d.key} (${d.values.length}${d.ordiginal !== undefined ? `<span style="font-size: x-small">/${d.ordiginal}</span>` : ''})`);
                const lic = lir.append('div')
                    .attr('class', 'collapsible-body')
                    .append('div')
                    .attr('class', 'row marginBottom0')
                    .append('div')
                    .attr('class', 'col s12 m12')
                    .styles({'overflow-y': 'auto', 'max-height': '400px'})
                    .append('ul')
                    .attr('class', 'collapsible compute expandable')
                    .datum(d => d.values);
                return lir;
            }
        );
        d3.select("#compute-list").selectAll('.rack.active .collapsible.compute.expandable').call(updateComtime);
        function updateComtime(p){
            let lic = p.selectAll('li').data(d => d,e=>e.compute)
                .enter()
                .append('li').attr('class', 'comtime')
                .on("mouseover", highlight)
                    .on("mouseout", unhighlight);

            lic.append("span")
                .attr("class", "color-block")
                .style("background", function (d) {
                    return color(selectedService == null ? d.group : d[selectedService])
                })
                .style("opacity", 0.85);
            lic.append("span")
                .text(function (d) {
                    return d.compute;
                });
            return p;
        }

        $('#compute-list.collapsible').collapsible({
            accordion: false,
            onOpenEnd: function (evt) {
                const datum = d3.select(evt).datum();
                if (datum.key !== "Genes") {
                    presetdatatable.push(datum.key);
                    data = _.intersectionWith(dataRaw, _.intersection(...presetdatatable.map(gf => globalFilter[gf])), function (a, b) {
                        return a.compute === b
                    });
                    brush();
                } else {
                    if (presetdatatable.length !== 0) {
                        presetdatatable = [];
                        data = dataRaw;
                        brush();
                    }else{
                        d3.select("#compute-list").selectAll('.rack.active .collapsible.compute.expandable').call(updateComtime);
                    }
                }

            },
            onCloseEnd: function (evt) {
                const datum = d3.select(evt).datum();
                if (datum.key !== "Genes") {
                    _.pull(presetdatatable, datum.key);
                    if (!presetdatatable.length)
                        data = dataRaw;
                    else {
                        data = _.intersectionWith(dataRaw, _.intersection(...presetdatatable.map(gf => globalFilter[gf])), function (a, b) {
                            return a.compute === b
                        });
                    }
                    brush();
                }
            }
        });
        table.selectAll('.rack').classed('active', d => _.includes(presetdatatable, d.key));
        complex_data_table_render = false;
        console.timeEnd('render')
    }
}
// Adjusts rendering speed
function optimize(timer) {
    var delta = (new Date()).getTime() - timer;
    render_speed = Math.max(Math.ceil(render_speed * 30 / delta), 8);
    render_speed = Math.min(render_speed, 300);
    return (new Date()).getTime();
}

// Feedback on rendering progress
function render_stats(i,n,render_speed) {
    d3.select("#rendered-count").text(i);
    d3.select("#rendered-bar")
        .style("width", (100*i/n) + "%");
    d3.select("#render-speed").text(render_speed);
}

// Feedback on selection
function selection_stats(opacity, n, total) {
    d3.select("#data-count").text(total);
    d3.select("#selected-count").text(n);
    d3.select("#selected-bar").style("width", (100*n/total) + "%");
    d3.select("#opacity").text((""+(opacity*100)).slice(0,4) + "%");
}

// Highlight single polyline
function highlight(d) {
    d3.select("#foreground").style("opacity", "0.25");
    if (selectedService){
        const val = d[selectedService];
        const gourpBeloing = orderLegend.find(dv=>val>=dv.minvalue && val<dv.value)||{text:undefined};

        d3.select("#colorContinuos").selectAll(".row").style("opacity", function(p) { return (gourpBeloing.text === p) ? null : "0.3" });
    }else {
        d3.select("#legend").selectAll(".row").style("opacity", function (p) {
            return (d.group == p) ? null : "0.3"
        });
    }
    path(d, highlighted, colorCanvas(selectedService==null?d.group:d[selectedService],1));
}

// Remove highlight
function unhighlight() {
    d3.select("#foreground").style("opacity", null);
    d3.select("#legend").selectAll(".row").style("opacity", null);
    if (selectedService){
        d3.select("#colorContinuos").selectAll(".row").style("opacity", null);
    }else {
        d3.select("#legend").selectAll(".row").style("opacity", null);
    }
    highlighted.clearRect(0,0,w,h);
}

function invert_axis(d) {
    // save extent before inverting
    var extent;
    svg.selectAll(".brush")
        .filter(ds=>ds===d)
        .filter(function(ds) {
            yscale[ds].brushSelectionValue = d3.brushSelection(this);
            return d3.brushSelection(this);
        })
        .each(function(d) {
            // Get extents of brush along each active selection axis (the Y axes)
            extent = d3.brushSelection(this).map(yscale[d].invert);
        });


    if (yscale[d].inverted == true) {
        yscale[d].range([h, 0]);
        d3.selectAll('.label')
            .filter(function(p) { return p == d; })
            .style("text-decoration", null);
        yscale[d].inverted = false;
    } else {
        yscale[d].range([0, h]);
        d3.selectAll('.label')
            .filter(function(p) { return p == d; })
            .style("text-decoration", "underline");
        yscale[d].inverted = true;
    }
    return extent;
}

// Draw a single polyline
/*
function path(d, ctx, color) {
  if (color) ctx.strokeStyle = color;
  var x = xscale(0)-15;
      y = yscale[dimensions[0]](d[dimensions[0]]);   // left edge
  ctx.beginPath();
  ctx.moveTo(x,y);
  dimensions.map(function(p,i) {
    x = xscale(p),
    y = yscale[p](d[p]);
    ctx.lineTo(x, y);
  });
  ctx.lineTo(x+15, y);                               // right edge
  ctx.stroke();
}
*/

function path(d, ctx, color) {
    if (color) ctx.strokeStyle = color;
    ctx.beginPath();
    ctx.setLineDash([]);
    var x0 = xscale(dimensions[0])-15,
        y0 = yscale[dimensions[0]](d[dimensions[0]]);   // left edge
    ctx.moveTo(x0,y0);
    let valid = true;
    dimensions.map(function(p,i) {
        var x = xscale(p),
            y = yscale[p](d[p]);
        if (y===undefined) {
            if (valid) {
                ctx.stroke();
                ctx.beginPath();
                ctx.moveTo(x0,y0);
                ctx.setLineDash([5, 15]);
            }
            valid = false;
        }else if (valid) {
            var cp1x = x - 0.5 * (x - x0);
            var cp1y = y0;
            var cp2x = x - 0.5 * (x - x0);
            var cp2y = y;
            ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, x, y);
            x0 = x;
            y0 = y;
        }else {
            var cp1x = x - 0.5 * (x - x0);
            var cp1y = y0;
            var cp2x = x - 0.5 * (x - x0);
            var cp2y = y;
            ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, x, y);
            ctx.stroke();
            ctx.beginPath();
            ctx.setLineDash([]);
            ctx.moveTo(x,y);
            valid = true;
            x0 = x;
            y0 = y;
        }
    });
    ctx.lineTo(x0+15, y0);                               // right edge
    ctx.stroke();
};

function colorCanvas(d,a) {
    var c = d3.hsl(color(d));
    c.opacity=a;
    return c;
}
function changeGroupTarget(key) {
    if (key === 'rack' )
        data.forEach(d=>d.group = d.rack)
    else {
        var thresholdScale = function(scale,d) {
            if(d) return d3.bisector(function(d) { return d; }).right(scale,d);
            return undefined};
        let nameLegend = rangeToString(arrThresholds);
        let arrmidle = arrThresholds.slice(1);
        orderLegend = d3.merge([nameLegend.map((d,i)=>{
            return{text: d, value: arrmidle[i], minvalue: arrThresholds[i]}}).reverse(),[{text: undefined, value: arrThresholds[1]+arrmidle[0]-arrmidle[1], minvalue: -Infinity}]]);
        data.forEach(d => d.group = nameLegend[thresholdScale(arrmidle,d[key])]);
    }
}
function rangeToString(arr){
    let midleRange = arr.slice(1,this.length-1);
    let mapRangeName = ["(<"+midleRange[0]+")"];
    midleRange.slice(1).forEach((d,i)=>mapRangeName.push("("+midleRange[i]+'-'+d+")"));
    mapRangeName.push("(>"+midleRange[midleRange.length-1]+")");
    return mapRangeName;
}
function position(d) {
    var v = dragging[d];
    return v == null ? xscale(d) : v;
}

// Handles a brush event, toggling the display of foreground lines.
function redraw(selected) {
    if (selected.length < data.length && selected.length > 0) {
        d3.select("#keep-data").attr("disabled", null);
        d3.select("#exclude-data").attr("disabled", null);
    } else {
        d3.select("#keep-data").attr("disabled", "disabled");
        d3.select("#exclude-data").attr("disabled", "disabled");
    };

    // total by food group
    var tallies = _(selected)
        .groupBy(function (d) {
            return d.group;
        });

    // include empty groups
    _(colors.domain()).each(function (v, k) {
        tallies[v] = tallies[v] || [];
    });


    // Render selected lines
    paths(selected, foreground, brush_count, true);
}

// TODO refactor
function brush(isreview) {
    var actives = [],
        extents = [];

    svg.selectAll(".brush")
        .filter(function(d) {
            yscale[d].brushSelectionValue = d3.brushSelection(this);
            return d3.brushSelection(this);
        })
        .each(function(d) {
            // Get extents of brush along each active selection axis (the Y axes)
            actives.push(d);
            extents.push(d3.brushSelection(this).map(yscale[d].invert).sort((a,b)=>a-b));
        });
    // hack to hide ticks beyond extent
    var b = d3.selectAll('.dimension').nodes()
        .forEach(function(element, i) {
            var dimension = d3.select(element).data()[0];
            if (_.includes(actives, dimension)) {
                var extent = extents[actives.indexOf(dimension)];
                d3.select(element)
                    .selectAll('text')
                    .style('font-weight', 'bold')
                    .style('font-size', '13px')
                    .style('display', function() {
                        var value = d3.select(this).data()[0];
                        return extent[0] <= value && value <= extent[1] ? null : "none"
                    });
            } else {
                d3.select(element)
                    .selectAll('text')
                    .style('font-size', null)
                    .style('font-weight', null)
                    .style('display', null);
            }
            d3.select(element)
                .selectAll('.label')
                .style('display', null);
        });
    ;

    // bold dimensions with label
    d3.selectAll('.label')
        .style("font-weight", function(dimension) {
            if (_.includes(actives, dimension)) return "bold";
            return null;
        });

    // Get lines within extents
    var selected = [];
    data
        .forEach(function(d) {
            if(!excluded_groups.find(e=>e===d.group))
                !actives.find(function(p, dimension) {
                    return extents[dimension][0] > d[p] || d[p] > extents[dimension][1];
                }) ? selected.push(d) : null;
        });
    // free text search
    var query = d3.select("#search").node().value;
    if (query.length > 0) {
        selected = search(selected, query);
    }

    if (selected.length < data.length && selected.length > 0) {
        d3.select("#keep-data").attr("disabled", null);
        d3.select("#exclude-data").attr("disabled", null);
    } else {
        d3.select("#keep-data").attr("disabled", "disabled");
        d3.select("#exclude-data").attr("disabled", "disabled");
    };
    console.time('tallies')
    // total by food group
    var tallies = _(selected)
        .groupBy(function(d) { return d.group; });
    console.timeEnd('tallies')
    // include empty groups
    _(colors.domain()).each(function(v,k) {tallies[v] = tallies[v] || []; });
    if(!isreview) {
        complex_data_table_render = true;
        complex_data_table(selected);
        updateDataTableFiltered(selected)
    }
    redraw(selected);
    // Loadtostore();
}
function plotViolin() {
    selected = shuffled_data;
    let violin_w = Math.min(w/dimensions.length/(cluster_info.length||1),50);
    violiin_chart.graphicopt({width:violin_w*(cluster_info.length||1),height:h, single_w:violin_w});
    setTimeout(() => {
        let dimGlobal = [0, 0];
        let dimensiondata = {};
        dimensions.forEach(d => {
            let s = serviceFullList.find(s => s.text === d);
            let color = () => "#ffffff";
            if (s) {
                let value = [];
                if (cluster_info.length) {
                    let cs = {};
                    cluster_info.forEach((c, ci) => cs[ci] = []);
                    selected.forEach(e => cs[e.Cluster].push(e[d]));
                    value = cluster_info.map((c, ci) => axisHistogram(c.name, s.range, cs[ci],s.islogScale));
                    vMax = d3.max(value, d => d[1]);
                    dimGlobal[1] = Math.max(vMax, dimGlobal[1]);
                    color = colorCluster;
                } else {
                    value = [axisHistogram(s.text, s.range, selected.map(e => e[d]),s.islogScale)];
                    vMax = d3.max(value[0], d => d[1]);
                    dimGlobal[1] = Math.max(vMax, dimGlobal[1]);
                }
                dimensiondata[d] = {key: s, value: value, color: color};

            }
        });
        d3.selectAll('.dimension').select('.plotHolder')
            .each(function (d) {
                if (dimensiondata[d]) {
                    let s = dimensiondata[d].key;
                    violiin_chart.graphicopt({
                        customrange: s.range,
                        rangeY: dimGlobal,
                        color: dimensiondata[d].color
                    }).data(dimensiondata[d].value).draw(d3.select(this))
                }
            })
    }, 0)
}
// render a set of polylines on a canvas
let isChangeData=false;

function paths(selected, ctx, count) {
    var n = selected.length,
        i = 0,
        opacity = d3.min([2/Math.pow(n,0.3),1]),
        timer = (new Date()).getTime();

    selection_stats(opacity, n, data.length);

    //shuffled_data = _.shuffle(selected);

    // complex_data_table(shuffled_data.slice(0,20));
    shuffled_data = selected;
    complex_data_table_render = true;
    ctx.clearRect(0,0,w+1,h+1);

    // render all lines until finished or a new brush event
    function animloop(){
        if (i >= n || count < brush_count) {
            timel.stop();
            return true;
        }
        var max = d3.min([i+render_speed, n]);
        render_range(shuffled_data, i, max, opacity);
        render_stats(max,n,render_speed);
        i = max;
        timer = optimize(timer);  // adjusts render_speed
    };
    if (timel)
        timel.stop();
    timel = d3.timer(animloop);
    if(isChangeData)
        axisPlot.dispatch('plot',selected);
}
let axisPlot =  d3.select('#overlayPlot').on('change',function(){
    switch ($(this).val()){
        case 'none':
            d3.selectAll('.dimension .plotHolder').selectAll('*').remove();
            d3.select(this).on('plot',()=>{});
            hide_ticks();
            break;
        case 'tick':
            d3.selectAll('.dimension .plotHolder').selectAll('*').remove();
            d3.select(this).on('plot',()=>{});
            show_ticks();
            break;
        case 'violin':
            d3.select(this).on('plot',plotViolin);
            hide_ticks();
            break;
        case 'violin+tick':
            d3.select(this).on('plot',plotViolin);
            show_ticks();
            break;
    }
    d3.select(this).dispatch('plot')
});
let timel
// transition ticks for reordering, rescaling and inverting
function update_ticks(d, extent) {
    // update brushes
    if (d) {
        var brush_el = d3.selectAll(".brush")
            .filter(function(key) { return key == d; });
        // single tick
        if (extent) {
            // restore previous extent
            console.log(extent);
            brush_el.call(yscale[d].brush = getBrush(d)).call(yscale[d].brush.move, extent.map(yscale[d]).sort((a,b)=>a-b));
        } else {
            brush_el.call(yscale[d].brush = getBrush(d));
        }
    } else {
        // all ticks
        d3.selectAll(".brush")
            .each(function(d) { d3.select(this).call(yscale[d].brush = getBrush(d)); })
    }

    show_ticks();

    // update axes
    d3.selectAll(".dimension .axis")
        .each(function(d,i) {
            // hide lines for better performance
            d3.select(this).selectAll('line').style("display", "none");

            // transition axis numbers
            d3.select(this)
                .transition()
                .duration(720)
                .call(getScale(d));

            // bring lines back
            d3.select(this).selectAll('line').transition().delay(800).style("display", null);

            d3.select(this)
                .selectAll('text')
                .style('font-weight', null)
                .style('font-size', null)
                .style('display', null);
        });
}
function getScale(d) {
    let axisrender =  axis.scale(yscale[d]);
    if(yscale[d].axisCustom) {
        if (yscale[d].axisCustom.ticks)
            axisrender = axisrender.ticks(yscale[d].axisCustom.ticks);
        if (yscale[d].axisCustom.tickFormat)
            axisrender = axisrender.tickFormat(yscale[d].axisCustom.tickFormat)
    }else{
        axisrender = axisrender.ticks(1 + height / 50);
        if (yscale[d].islogScale)
            axisrender = axisrender.tickFormat(d=>d%1?'':d3.format("~s")(Math.pow(10,d)));
        else
            axisrender = axisrender.tickFormat(undefined);
    }
    return axisrender;
}

// Rescale to new dataset domain
function adjustdata(sers){
    dataRaw.forEach(d=>{
        sers.forEach(ser=>{
            s = ser.key;
            islog = ser.value;
            d[s] = (isdatachange&&data_second_service[s])? data_second[d.name][s]:sampleS[d.name][s][0][0];
            if (islog){
                d[s] = d3.scaleLog()(d[s]);
                d[s]=d[s]!==-Infinity?d[s]:null;
            }
        })
    })
}
function rescale(skipRender) {
    adjustRange(data);
    xscale.domain(dimensions = serviceFullList.filter(function (s) {
        let k = s.text;
        let xtempscale = (((_.isDate(data[0][k])) && (yscale[k] = d3.scaleTime()
            .domain(d3.extent(data, function (d) {
                return d[k];
            }))
            .range([h, 0])) || (_.isNumber(data[0][k])||_.isNull(data[0][k])) && (yscale[k] = d3.scaleLinear()
            .domain(serviceFullList.find(d=>d.text===k).range)
            .range([h, 0]),yscale[k].islogScale=s.islogScale,yscale[k])));
        return s.enable?xtempscale:false;
    }).map(s=>s.text));
    update_ticks();
    // Render selected data
    if(!skipRender)
        paths(data, foreground, brush_count);
}

// Get polylines within extents
function actives() {
    var actives = [],
        extents = [];
    svg.selectAll(".brush")
        .filter(function(d) {
            yscale[d].brushSelectionValue = d3.brushSelection(this);
            return d3.brushSelection(this);
        })
        .each(function(d) {
            // Get extents of brush along each active selection axis (the Y axes)
            actives.push(d);
            extents.push(d3.brushSelection(this).map(yscale[d].invert).sort((a,b)=>a-b));
        });
    // filter extents and excluded groups
    var selected = [];
    data
        .forEach(function(d) {
            if(!excluded_groups.find(e=>e===d.group))
                !actives.find(function(p, dimension) {
                    return extents[dimension][0] > d[p] || d[p] > extents[dimension][1];
                }) ? selected.push(d) : null;
        });

    // free text search
    var query = d3.select("#search").node().value;
    if (query > 0) {
        selected = search(selected, query);
    }

    return selected;
}

// Export data
function export_csv() {
    var keys = _.flatten([['id'],serviceFullList.map(s=>s.text)]);
    var rows = actives().map(function(row) {
        return keys.map(function(k) { return row[k]; })
    });
    keys[0]=IDkey;
    var csv = [keys].concat(rows).join('\n');
    download_csv($('#exportname').val(),csv)
}

function resetSize() {
    width = $("#Maincontent").width();
    height = d3.max([document.body.clientHeight-150, 300]);
    w = width - m[1] - m[3];
    h = height - m[0] - m[2];
    let chart = d3.select("#chart")
        .style("height", (h + m[0] + m[2]) + "px")

    chart.selectAll("canvas")
        .attr("width", w)
        .attr("height", h)
        .style("padding", m.join("px ") + "px");

    chart.select("svg")
        .attr("width", w + m[1] + m[3])
        .attr("height", h + m[0] + m[2])
        .select("g")
        .attr("transform", "translate(" + m[3] + "," + m[0] + ")");
    // Foreground canvas for primary view
    foreground.lineWidth = 1.7;
// Highlight canvas for temporary interactions
    highlighted.lineWidth = 4;

// Background canvas
    background.lineWidth = 1.7;

    xscale = d3.scalePoint().range([0, w]).padding(0.3).domain(dimensions);
    dimensions.forEach(function (d) {
        yscale[d].range([h, 0]);
    });

    d3.selectAll(".dimension")
        .attr("transform", function (d) {
            return "translate(" + xscale(d) + ")";
        });
    // update brush placement
    d3.selectAll(".brush")
        .each(function (d) {
            d3.select(this).call(yscale[d].brush = d3.brushY(yscale[d])
                .extent([[-10, 0], [10, h]])
                .on("brush", function(){isChangeData = true; brush(true);})
                .on("end", function(){isChangeData = true; brush();})
            );
        });

    // update axis placement
    axis = axis.ticks(1 + height / 50),
        d3.selectAll(".dimension .axis")
            .each(function (d) {
                d3.select(this).call(getScale(d));
            });

    // render data
    brush();
}

// scale to window size
window.onresize = function() {
    // animationtime = false;
    try {
        resetSize();
    }catch(e){}
};

// Remove all but selected from the dataset
function keep_data() {
    new_data = actives();
    if (new_data.length == 0) {
        alert("I don't mean to be rude, but I can't let you remove all the data.\n\nTry removing some brushes to get your data back. Then click 'Keep' when you've selected data you want to look closer at.");
        return false;
    }
    data = new_data;
    rescale();
}

// Exclude selected from the dataset
function exclude_data() {
    let new_data = _.difference(data, actives());
    if (new_data.length == 0) {
        alert("I don't mean to be rude, but I can't let you remove all the data.\n\nTry selecting just a few data points then clicking 'Exclude'.");
        return false;
    }
    data = new_data;
    rescale();
}
function adjustRange(data){
    let globalRange = [0,1];
    let minLog = Infinity;
    primaxis.forEach(p=>{
        let islog = serviceFullList.find(s=>s.text===p).islogScale;
        let range;
        if (islog) {
            min= d3.min(data,d=>d[p]);
            if(minLog>min)
                minLog = min;
            range = d3.extent(data, d => d3.scaleLog().invert(d[p]));
        }else
            range = d3.extent(data,d=>d[p]);
        if (range[0]>=0 && range[1]>1&&range[1]>globalRange[1])
            globalRange[1]=range[1];
    });
    minLog = minLog<1?0:minLog;
    primaxis.forEach((p,pi)=>{
       if (serviceFullList[pi].range[0]>=0 && serviceFullList[pi].range[1]) {
           if(serviceFullList[pi].islogScale){
               serviceFullList[pi].range = [minLog,d3.scaleLog()(globalRange[1])];
           }else
                serviceFullList[pi].range = globalRange;
       }
    })
}
function add_axis(d,g) {
    const target = serviceFullList_withExtra.find(e=>e.text===d)
    if(target) {
        // dimensions.splice(dimensions.length-1, 0, d);
        target.enable = true;
        dimensions.push(d);
        dimensions = _.intersection(listMetric.toArray(), dimensions);
        xscale.domain(dimensions);
        // g.attr("transform", function(p) { return "translate(" + position(p) + ")"; });
        updateDimension();
        update_ticks();
    }
}

function remove_axis(d,g) {
    const target = serviceFullList_withExtra.find(e=>e.text===d)

    target.enable = false;
    dimensions = _.difference(dimensions, [d]);
    xscale.domain(dimensions);
    g = g.data(dimensions,d=>d);
    g.attr("transform", function(p) { return "translate(" + position(p) + ")"; });
    g.exit().remove();
    update_ticks();
}

d3.select("#keep-data").on("click", keep_data);
d3.select("#exclude-data").on("click", exclude_data);
// d3.select("#export-data").on("click", export_csv);
d3.select("#search").on("keyup", brush);




function hide_ticks() {
    d3.selectAll(".dimension .axis g").style("display", "none");
    //d3.selectAll(".axis path").style("display", "none");
    d3.selectAll(".background").style("visibility", "hidden");
};

function show_ticks() {
    d3.selectAll(".dimension .axis g").style("display", null);
    //d3.selectAll(".axis path").style("display", null);
    d3.selectAll(".background").style("visibility", null);
};

function search(selection,str) {
    const pattern = new RegExp(str,"i")
    return _(selection).filter(function(d) { return pattern.exec(d.name); });
}

function changeVar(d){
    // $('#groupName').text(d.text);
    if (d.arr==='rack'){
        selectedService = null;
        // svgLengend.style('display','none');
        d3.selectAll('.dimension.axisActive').classed('axisActive',false);
        changeGroupTarget(d.arr);
        //legend = create_legend(colors,brush);
    }else {
        try {
            legend.remove();
        }catch(e){}
        selectedService = d.arr;
        setColorsAndThresholds(d.service);
        changeGroupTarget(d.arr);
        //legend = drawLegend(d.service, arrThresholds, arrColor, dif);
        // svgLengend.style('display',null);
        d3.selectAll('.dimension.axisActive').classed('axisActive',false);
        d3.selectAll('.dimension').filter(e=>e===selectedService).classed('axisActive',true);
    }
}
function exit_warp () {
    vocanoData = undefined
    if(timel){
        timel.stop();
        cluster_info = [];
        d3.select('#clusterDisplay').selectAll('*').remove();
    }
}

let clustercalWorker;
function recalculateCluster (option,calback,customCluster) {
    preloader(true,10,'Process grouping...','#clusterLoading');
    group_opt = option;
    distance = group_opt.normMethod==='l1'?distanceL1:distanceL2;
    if (clustercalWorker)
        clustercalWorker.terminate();
    clustercalWorker = new Worker ('../BioRadar/src/script/worker/clustercal.js');
    clustercalWorker.postMessage({
        binopt:group_opt,
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
            try {
                M.Toast.dismissAll();
            }catch(e){}
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
                cluster_map(cluster_info);
                handle_clusterinfo();
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

function onchangeCluster() {
    unhighlight();
    cluster_info.forEach(d => (d.total=0,d.__metrics.forEach(e => (e.minval = undefined, e.maxval = undefined))));
    // tsnedata = {};
    hosts.forEach(h => {
        // tsnedata[h.name] = [];
        sampleS[h.name].arrcluster = sampleS.timespan.map((t, i) => {
            let nullkey = false;
            let axis_arr = tsnedata[h.name][i];
            // axis_arr.name = h.name;
            // axis_arr.timestep = i;
            // reduce time step
            if(axis_arr.outlier) {
                let outlierinstance = outlyingList.pointObject[h.name + '_' + i];
                if (outlierinstance) {
                    return outlierinstance.cluster;
                }
            }

            let index = 0;
            let minval = Infinity;
            cluster_info.forEach((c, i) => {
                const val = distance(c.__metrics.normalize, axis_arr);
                if (minval > val) {
                    index = i;
                    minval = val;
                }
            });
            cluster_info[index].total = 1 + cluster_info[index].total || 0;
            cluster_info[index].__metrics.forEach((m, i) => {
                if (m.minval === undefined || m.minval > axis_arr[i])
                    m.minval = axis_arr[i];
                if (m.maxval === undefined || m.maxval < axis_arr[i])
                    m.maxval = axis_arr[i];
            });
            // axis_arr.cluster = index;

            // timeline precalculate
            tsnedata[h.name][i].cluster = index;
            return index;
            // return cluster_info.findIndex(c=>distance(c.__metrics.normalize,axis_arr)<=c.radius);
        })
    });
    cluster_info.forEach(c => c.mse = ss.sum(c.__metrics.map(e => (e.maxval - e.minval) * (e.maxval - e.minval))));
    data = object2DataPrallel(sampleS);
    cluster_map(cluster_info);
    handle_clusterinfo();
    axisPlot.dispatch('plot',selected);
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
    ringStroke_width: 0.15,
    ringColor:'black',
    fillin:0.5,
    boxplot:true,
    animationDuration:1000,
    events:{
        axis: {
            mouseover: function(){
                try {
                    const d = d3.select(d3.event.detail || this).datum();
                    d3.selectAll('#clusterDisplay .axis' + d.idroot + '_' + d.id).classed('highlight', true);
                    d3.selectAll('#clusterDisplay .axisText').remove();
                    if (d3.select(this.parentNode).select('.axisText').empty())
                        d3.select(this.parentNode).append('text').attr('class','axisText').attr('transform','rotate(-90) translate(5,-5)');
                    d3.select(this.parentNode).select('.axisText').text(d.text);
                    $('.tablesvg').scrollTop($('table .axis' + d.idroot + '_' + d.id)[0].offsetTop);
                }catch(e){}
            },
            mouseleave: function(){
                const d = d3.select(d3.event.detail||this).datum();
                d3.selectAll('#clusterDisplay .axis'+d.idroot+'_'+d.id).classed('highlight',false);
                d3.selectAll('#clusterDisplay .axisText').remove();
            },
        },
    },
    showText: false};
function cluster_map (dataRaw) {
    radarChartclusteropt.schema = serviceFullList;
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
                // if (!jobMap.runopt().mouse.disable) {
                //     mainviz.highlight(d.id);
                // }
                d3.select(this).classed('focus',true);
            }).on('mouseleave',function(d){
                // if (!jobMap.runopt().mouse.disable) {
                //     mainviz.unhighlight(d.id);
                // }
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
            d3.select(this).classed('clicked',active);
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
            .style('position','relative')
            .each(function(d,i){
                radarChartclusteropt.color = function(){return colorCluster(d.id)};
                RadarChart(".radarh"+d.id, d, radarChartclusteropt,"").classed('no-absolute',true).select('.axisWrapper .gridCircle').classed('hide',true);
            });
        d3.selectAll('.radarCluster').classed('first',(d,i)=>!i);
        d3.selectAll('.radarCluster').select('span.clusterlabel').attr('data-order',d=>d.order+1).text(d=>d[0].text);
        d3.selectAll('.radarCluster').select('input.clusterlabel').attr('value',d=>d[0].text).each(function(d){$(this).val(d[0].text)});
        d3.selectAll('.radarCluster').select('span.clusternum').text(d=>(d[0].total||0).toLocaleString());
        d3.selectAll('.radarCluster').select('span.clusterMSE').classed('hide',!radarChartclusteropt.boxplot).text(d=>d3.format(".2")(d[0].mse||0));

        listOption.find(d=>d.text==='Cluster').tableObj.classed('hide',false);
        yscale["Cluster"].domain([0,cluster_info.length-1]);
        yscale["Cluster"].axisCustom.ticks = cluster_info.length;
    }, 0);
    // outlier_map(outlyingList)
}
function onChangeValue(condition) {
    unhighlight();
    if (condition){ // CPM
        data = dataRaw;
        d3.keys(data_second_service).forEach(k=>{
            serviceFullList.find(d=>d.text===k).range =data_second_service[k].range;
            data.forEach((d,i)=>d[k]=data_second[d.name][k]);
            if(_.isDate(data[0][k]))
                yscale[k] = d3.scaleTime()
                .domain(d3.extent(data, function (d) {
                    return d[k];
                }))
                .range([h, 0])
            else if(_.isNumber(data[0][k]))
                yscale[k] = d3.scaleLinear()
            .domain(data_second_service[k].range)
            .range([h, 0])
        });
    }else{ // normalize
        // dataRaw = object2DataPrallel(sampleS);
        data = dataRaw;

        d3.keys(data_second_service).forEach(k=>{
            let si = serviceFullList.findIndex(d=>d.text===k);
            serviceFullList[si].range =serviceFullList_Fullrange[si].range;
            data.forEach((d,i)=>d[k]=sampleS[d.name][k][0][0])
            if(_.isDate(data[0][k]))
                yscale[k] = d3.scaleTime()
                    .domain(d3.extent(data, function (d) {
                        return d[k];
                    }))
                    .range([h, 0])
            else if(_.isNumber(data[0][k]))
                yscale[k] = d3.scaleLinear()
                    .domain(serviceFullList[si].range)
                    .range([h, 0])
        });
    }
    updateDimension();
    adjustdata(serviceFullList.filter(d=>d.primaxis).map(d=>({key:d.text,value:d.islogScale})));
    rescale(true);
    setColorsAndThresholds_full();
    d3.select('tr.axisActive').selectAll('td input[name=colorby]').dispatch('change')
}

// violin
let violiin_chart = d3.viiolinChart().graphicopt({width:160,height:25,opt:{dataformated:true},stroke:null,tick:false,showOutlier:false,direction:'v',margin: {top: 0, right: 0, bottom: 0, left: 0},middleAxis:{'stroke-width':0.5},ticks:{'stroke-width':0.5},tick:{visibile:false}});;

function makeDataTableFiltered () {
    if ($.fn.DataTable.isDataTable('#filterTable')) {
        $('#filterTable').DataTable().destroy();
        d3.select('#filterTable').selectAll('*').remove();
    }

    const columns = [{title: IDkey,data:'name',className:'id'}];
    SUBJECTS.forEach(s=>{
        serviceFullList.forEach(d => {
            columns.push({title: s + d.text,data:d.text, render: renderData,className: fixName2Class(d.text)})
        });
    });
    let heatmaponTable = d3.scaleQuantize().domain(d3.range(0,10))
        .range(['#ffffff','#fff7ec','#fee8c8','#fdd49e','#fdbb84','#fc8d59','#ef6548','#d7301f','#b30000','#7f0000']);
    let textcolor = heatmaponTable.copy();
    textcolor.range(['#000000','#000000','#000000','#000000','#000000','#000000','#000000','#000000','#ffffff','#ffffff']);

    dataTableFiltered = $('#filterTable').DataTable({
        data: [],
        "deferRender": true,
        "pageLength": 50,
        // scrollY:        '50vh',
        // scrollCollapse: true,
        columns: columns,
        "dom": '<"top"f<"clear">>rt<"bottom"ip>B',
        buttons: [
            {
                extend: 'copyHtml5',
                exportOptions: {orthogonal: 'export'}
            },
            {
                extend: 'excelHtml5',
                exportOptions: {orthogonal: 'export'}
            },
            {
                extend: 'pdfHtml5',
                exportOptions: {orthogonal: 'export'}
            }
        ],
        rowCallback: function(row, data, index){
            serviceFullList.forEach((s,i)=>{
                d=data[s.text];
                if (s.islogScale) {
                    d = d3.scaleLog()(d);
                    d = d!== -Infinity ? d:null
                }
                let currentColor = d3.color(coloraxis[s.text](d)||'white');
                currentColor.opacity = opaaxis[s.text];
                $(row).find(`td.${fixName2Class(s.text)}`)
                    .css('background-color',currentColor+'')
                    .css('color', 'black');
            })
        }
    });
    $.fn.DataTable.ext.pager.numbers_length = 4;

    $('#filterTable tbody').on('mouseover', 'tr', function () {
        var tr = $(this).closest('tr');
        var row = dataTableFiltered.row( tr );
        var d = row.data();
        highlight(d.__index!==undefined?shuffled_data[d.__index]:d);
    });
    $('#filterTable tbody').on('mouseleave', 'tr', function () {
        unhighlight();
    });

    $('#search').on('input', searchHandler); // register for oninput
    $('#search').on('propertychange', searchHandler); // for IE8

    // d3.select('#modelSampling').on('mouseover',()=>{
    //     let data = _.sampleSize(datain, 500);
    //     console.log(data)
    //     // drawRadar({data: data,pos:})
    // });
    function renderData(data, type, row) {
        if (type === 'display') {
            if (data%1===0)
                return `${data}<span style="opacity: 0">.00</span>`;
            if (_.isNaN(d3.format('.2f')(data)))
            console.log(data,row.data(),d3.format('.2f')(data))
            return d3.format('.2f')(data);
        }
        else if(type === 'export'){
            return data;
        }
        return data%1===0?data:d3.format('.2f')(data);
    }
}
function searchHandler (e){
    if (e.target.value!=="") {
        let results = shuffled_data.filter(h=>h.name.includes(e.target.value));
        highlight(results[0]);
    }else{
        unhighlight()
    }
}
function updateDataTableFiltered(data){
    // let newDataArray = data.map(n=>{
    //     return _.flatten([n.name,_.flatten(serviceFullList.map(s=>n[s.text]))]);
    // });
    setTimeout(()=>{
        let newDataArray = _.cloneDeep(data).slice(0,1000);
        serviceFullList.forEach((s,si)=>{
            if(s.islogScale)
                newDataArray.forEach((d,i)=>{
                    newDataArray[i].__index = i;
                    // newDataArray[i][s.text] = sampleS[d.name][s.text][0];
                    newDataArray[i][s.text] = (isdatachange&&data_second_service[s.text])? data_second[d.name][s.text]:sampleS[d.name][s.text][0][0];
                })
        });
        dataTableFiltered.clear();
        dataTableFiltered.rows.add(newDataArray);
        dataTableFiltered.draw();
    },0);
}
function triggerLogScale(isenable){
    serviceFullList.forEach(d=>{
        if (d.primaxis)
            d.islogScale = isenable;
    });
    d3.select('#axisSetting tbody').selectAll('tr td').filter(d => d.key === "logScale").select('input').each(function(d){
        let target = d3.select(this)
        if(!target.classed('hide'))
        {
            target.dispatch('adjustValue')
        }
    });
    adjustdata(serviceFullList.filter(d=>d.primaxis).map(d=>({key:d.text,value:d.islogScale})));
    rescale(true);
    serviceFullList.forEach(d=>{
        if (d.primaxis) {
            updateColorsAndThresholds(d.text);
        }
    });
    setColorsAndThresholds(selectedService);
    brush();
}
function onToggeleLog(evt) {
    if(evt.checked){
        triggerLogScale(true);
        d3.select(evt).attr('value','full');
    }else{
        triggerLogScale(false);
        d3.select(evt).attr('value','empty')
    }
}