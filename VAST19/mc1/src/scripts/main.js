let width = 2000,
    height = 1000,
    controlTime,
    listopt = {
        limitRows: 20,
        limitColums: [0,10],
        limitTime: undefined, // change year limit in list ranking here
        time: {rate:1,unit:'Hour'},
        // limitYear: [1998,2001],
    },
    RadarMapopt  = {
        margin: {top: 0, right: 50, bottom: 0, left: 120},
        offset: {top: 0},
        width: width,
        height: height,
        scalezoom: 1,
        widthView: function(){return this.width*this.scalezoom},
        heightView: function(){return this.height*this.scalezoom},
        widthG: function(){return this.widthView()-this.margin.left-this.margin.right},
        heightG: function(){return this.heightView()-this.margin.top-this.margin.bottom},
        fixscreence: false,
        dotRadius: 3,
        group_mode: 'outlier',
        display:{
            symbol:{
                type: 'path',
                radius: 30,
            }
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
                        'fill': 'none'
                    }
                },
                clulster: {
                    attr: {
                        rx: 3,
                        ry: 3}
                    ,
                    style: {
                        stroke: 'white'
                    }
                }
            }
        },
        summary:{
            size: 30
        }
    },
    runopt ={
        zoom:60,
        simDuration: 1000,
    }, colorScaleList = {
        n: 10,
        rainbow: ["#110066", "#4400ff", "#00cccc", "#00dd00", "#ffcc44", "#ff0000", "#660000"],
        soil: ["#4A8FC2", "#76A5B1", "#9DBCA2", "#C3D392", "#E8EC83", "#F8E571", "#F2B659", "#EB8C47", "#EB8C47", "#D63128"],
        d3colorChosefunc: function(name){
            const n = this.n;
            if (d3[`scheme${name}`]) {
                if (typeof (d3[`scheme${name}`][0]) != 'string')
                    colors=  d3[`scheme${name}`][n].slice();
                else
                    colors=  d3[`scheme${name}`].slice();
                } else {
                    const interpolate = d3[`interpolate${name}`];
                    colors = [];
                    for (let i = 0; i < n; ++i) {
                        colors.push(d3.rgb(interpolate(i / (n - 1))).hex());
                    }
            }
            return colors;
        },
    },colorArr = {Radar: [
        {val: 'rainbow',type:'custom',label: 'Rainbow'},
        {val: 'RdBu',type:'d3',label: 'Blue2Red',invert:true},
            {val: 'soil',type:'custom',label: 'Custom 1'},],
        Cluster: [{val: 'Category10',type:'d3',label: 'D3'},{val: 'Paired',type:'d3',label: 'Blue2Red'}]};
let arrColor = colorScaleList.rainbow;
let formatTime = d3.timeFormat("%b %Y");
let simDuration =1000, timestep=0,maxtimestep,interval2,playing=true;
let dataRaw,dataBytime,currentService =0;
let RadarMapplot  = d3.radarMap();
let MetricController = radarController();


const initialize = _.once(initDemo);
$(document).ready(function(){
    //scatterConfig.scaleView = $('#mainPlot').width()/scatterConfig.width;
    $( "#map" ).draggable();
    $("#controlPanel").draggable();
    $('.sidenav').sidenav();
    $('.collapsible').collapsible();
    $('.modal').modal();
    var elem = document.querySelector('.collapsible.expandable');
    var instance = M.Collapsible.init(elem, {
        accordion: false
    });
    $('.tabs').tabs({'onShow':function(){

            if (this.$activeTabLink.text()==='Demo') {
                $('#videoIn').each(function(index) {
                    $(this).attr('src', $(this).attr('src'));
                    return false;
                });
                initialize();
            }else{
                try{
                    playchange();
                }catch(e){

                }
            }
    }});
    if (d3.select('#demoTab a').classed('active')){
        $('#videoIn').each(function(index) {
            $(this).attr('src', $(this).attr('src'));
            return false;
        });
        initialize();
    }
        // $('#zoomInit').on('change', function () {
        //     runopt.zoom = this.value;
        //     RadarMapplot.runopt(runopt);
        // });
        // $('#zoomInit')[0].value = runopt.zoom;
    //     $('#detailLevel_Perplexity').on('change', function () {
    //         TsneConfig.perplexity = this.value;
    //         RadarMapplot.option(TsneConfig);
    //         resetRequest();
    //     });
    //     // $('#detailLevel_Perplexity')[0].value = TsneConfig.perplexity;
    //
    // $('#detailLevel_Epsilon').on('change', function () {
    //     TsneConfig.epsilon = this.value;
    //     RadarMapplot.option(TsneConfig);
    //     resetRequest();
    // });
    // $('#detailLevel_Epsilon')[0].value = TsneConfig.epsilon;

        // $('#simDurationUI').on('change', function () {
        //     simDuration = this.value;
        //     runopt.simDuration = simDuration;
        //     RadarMapplot.runopt(runopt);
        //     interval2.pause(simDuration);
        //     if (playing)
        //         interval2.resume(simDuration);
        // });
        // $('#simDurationUI')[0].value = simDuration;
        // fixRangeTime();

        d3.select('#datacom').on("change", function () {
            d3.select('.cover').classed('hidden', false);
            const choice = this.value;
            const choicetext = d3.select('#datacom').node().selectedOptions[0].text;
            d3.select('#currentData').text(choicetext);
            playchange();
            setTimeout(() => {
                readConf(choice+"_conf").then((conf)=> readData(choice).then((d) => {
                    d.YearsData.forEach(e => {
                        if (e.Scagnostics0) delete e.Scagnostics0
                        for (var key in e) {
                            e[key] = e[key].map(it => it === "NaN" ? 0 : it);
                        }
                    });
                    dataRaw = d;
                    d3.select(".currentData")
                        .text(choicetext);
                    maxtimestep = dataRaw.YearsData.length;
                    console.log(maxtimestep)
                    RadarMapplot.axis(d.Variables);
                    d3.select('.averageSUm').selectAll('*').remove();
                    //remove later
                    var duration = dataRaw.TimeMatch.filter(d=>(new Date(d)).getFullYear()>(listopt.limitYear[0]-1)&&(new Date(d)).getFullYear()<(listopt.limitYear[1]+1));
                    var lowlimit = dataRaw.TimeMatch.indexOf(duration.shift());
                    var highlimit = dataRaw.TimeMatch.indexOf(duration.pop());
                    listopt.limitColums = [lowlimit,highlimit];

                    handleOutlier (dataRaw,currentService);
                    resetRequest();
                    d3.select('.cover').classed('hidden', true);
                }));
            }, 0);
        });
        d3.select("#DarkTheme").on("click", switchTheme);
        changeRadarColor(colorArr.Radar[0]);
        changeClusterColor(colorArr.Cluster[0]);
        // color scale create
        creatContain(d3.select('#RadarColor').select('.collapsible-body>.pickercontain'), colorScaleList, colorArr.Radar, onClickRadarColor);
        creatContain(d3.select('#ClusterColor').select('.collapsible-body>.pickercontain'), colorScaleList, colorArr.Cluster, onClickClusterColor);
});
var profile={};
function changeRadarColor(d) {
    profile.radarcolor = d.val;
    d3.select('#RadarColor')
        .select('.collapsible-header .colorscale-block').datum(d)
        .call(createColorbox);
}
function changeClusterColor(d) {
    d3.select('#ClusterColor')
        .select('.collapsible-header .colorscale-block').datum(d)
        .call(createColorbox);
}
function onClickRadarColor (d){
    changeRadarColor(d);
    arrColor=d;
    RadarMapplot.RadarColor(d);
    MetricController.updatecolor(arrColor);
}
function onClickClusterColor (d){
    changeClusterColor(d);
    RadarMapplot.ClusterColor(d);
}
function RangechangeVal(val) {
    controlTime.el.value =val;
    root.style.setProperty('--sideVal', (val/(maxtimestep-1)*100)+'%' );
    if (!$(controlTime.thumb).hasClass('active')) {
        controlTime._showRangeBubble();
    }

    let offsetLeft = controlTime._calcRangeOffset();
    $(controlTime.thumb)
        .addClass('active')
        .css('left', offsetLeft + 'px');
    if (dataRaw.TimeMatch)
        $(controlTime.value).html(dataRaw.TimeMatch[controlTime.$el.val()]);
    else
        $(controlTime.value).html(controlTime.$el.val());
}
function _handleRangeMousedownTouchstart(t) {
    if ($(this.value).html(dataRaw.TimeMatch[this.$el.val()])||$(this.value).html(this.$el.val()))
        this._mousedown = !0;
        this.$el.addClass("active");
    $(this.thumb).hasClass("active") || this._showRangeBubble();
    if ("input" !== t.type) {
        var e = this._calcRangeOffset();
        $(this.thumb).addClass("active").css("left", e + "px")
    }
}
function _handleRangeInputMousemoveTouchmove() {
    if (this._mousedown) {
        $(this.thumb).hasClass("active") || this._showRangeBubble();
        var t = this._calcRangeOffset();
        $(this.thumb).addClass("active").css("left", t + "px");
        root.style.setProperty('--sideVal', (this.$el.val()/(maxtimestep-1)*100)+'%' );
        if (dataRaw.TimeMatch)
            $(this.value).html(dataRaw.TimeMatch[this.$el.val()]);
        else
            $(this.value).html(this.$el.val());
    }
}

function rangeMove(t) {
    if (s(this.value).html(this.$el.val()),
        this._mousedown = !0,
        this.$el.addClass("active"),
    s(this.thumb).hasClass("active") || this._showRangeBubble(),
    "input" !== t.type) {
        // root.style.setProperty('--sideVal', (val / (maxtimestep - 1) * 100) + '%');
        var e = this._calcRangeOffset();
        s(this.thumb).addClass("active").css("left", e + "px");
        if (dataRaw.TimeMatch)
            $(controlTime.value).html(dataRaw.TimeMatch[controlTime.$el.val()]);
        else
            $(controlTime.value).html(controlTime.$el.val());
    }
}

function initDemo(){
    width = $('#tSNE').width();
    height = d3.max([Math.max( window.innerHeight, document.body.clientHeight )-180, 300]);
    // scatterConfig.width = $('#mainPlot').width();
    // netConfig.width = widthSvg;
    init();
}

function init() {
    initRadarMap();
    const choice = d3.select('#datacom').node().value;
    const choicetext = d3.select('#datacom').node().selectedOptions[0].text;
    d3.select('#currentData').text(choicetext);
    Promise.all([
        readConf(choice+"_conf"),
        readConf(choice+"_prof"),
        readData(choice,'csv'),
    ]).then(([locs,init_profile,d])=>{

        conf = init_profile;
        variablesNames.forEach(d=>{ window[d] = conf[d]});
        d3.select('#RadarColor').selectAll('.colorscale-block').filter(c=>c.val===conf.profile.radarcolor).dispatch('click');
        d.sort((a,b)=>a.time-b.time); // sort time
        dataRaw = d;
        timestep = 0;
        dataRaw.location = locs;

        dataRaw.location[Object.keys(locs).length+1]="Total";

        dataBytime = d3.nest()
            .key(function(d) { return d.time; })
            .key(function(d) { return d.location; })
            .entries(dataRaw);

        dataRaw.TimeMatch = dataBytime.map(d=>d.key);
        maxtimestep = dataBytime.length;
        selectedVariable = _.without(d3.keys(dataRaw[0]),'time','location');

        // initSchema(selectedVariable);
        MetricController.graphicopt({width:317,height:317,arrColor: arrColor})
            .div(d3.select('#RadarController'))
            .tablediv(d3.select('#RadarController_Table'))
            .axisSchema(serviceFullList)
            .onChangeValue(onSchemaUpdate)
            .onChangeFilterFunc(onfilterdata);
        schema = MetricController.schema();
        listopt.limitColums = [0,10];
        formatTime =getformattime (listopt.time.rate,listopt.time.unit);
        listopt.limitTime = d3.extent(dataRaw,d=>d.time);
        data = handleDatabyKey(dataRaw,listopt.limitTime,formatTime,['location','time']);
        databyTime = handleDatabyKey(dataRaw,listopt.limitTime,formatTime,['time']);
        let dataSumAll = handleDatabyKey(dataRaw,listopt.limitTime,formatTime,[]);

        databyLoc = handleDatabyKey(dataRaw,listopt.limitTime,formatTime,['location']);
        databyLoc.push({'key':(data.length+1)+'',values:dataSumAll});
        handleDataIcon (databyLoc);

        MetricController.data(handleDataSumAll(dataSumAll))
            .init();

        data.push({'key':(data.length+1)+'',values:databyTime})
        // Loadtostore();
        RadarMapplot.rowMap(dataRaw.location).schema(serviceFullList).timeFormat(formatTime).onmouseover(onmouseoverRadar).onmouseleave(onmouseleaveRadar);
        handleOutlier (data,currentService);
        // request();
        d3.select('.cover').classed('hidden',true);
    });



}
function onfilterdata(schema) {

    data_filtered = dataRaw.filter(d=>schema.axisList.map(s=> s.filter!=null?(d[s.data.text]>=s.filter[0])&&(d[s.data.text]<=s.filter[1]):true).reduce((p,c)=>c&&p))
    dataBytime = d3.nest()
        .key(function(d) { return d.time; })
        .key(function(d) { return d.location; })
        .entries(data_filtered);

    data = handleDatabyKey(data_filtered,listopt.limitTime,formatTime,['location','time']);
    databyTime = handleDatabyKey(data_filtered,listopt.limitTime,formatTime,['time']);
    let dataSumAll = handleDatabyKey(data_filtered,listopt.limitTime,formatTime,[]);

    databyLoc = handleDatabyKey(data_filtered,listopt.limitTime,formatTime,['location']);
    databyLoc.push({'key':(data.length+1)+'',values:dataSumAll});
    handleDataIcon (databyLoc);

    MetricController.data(handleDataSumAll(dataSumAll));

    data.push({'key':(data.length+1)+'',values:databyTime})
    // Loadtostore();
    handleOutlier (data,currentService);
    // request();
    d3.select('.cover').classed('hidden',true);
}
function onSchemaUpdate(schema_new){
    serviceFullList.forEach(ser=>{
        ser.angle = schema_new.axis[ser.text].angle();
        ser.enable = schema_new.axis[ser.text].data.enable;
    });
    schema = schema_new;
    RadarMapplot.schema(serviceFullList).draw();
    // Radarplot.schema(serviceFullList);
    // updateSummaryChartAll();
    // // }
    //
    SaveStore();
}
function initSchema(){
    let angle = Math.PI*2/ selectedVariable.length;
    serviceFullList = selectedVariable.map ((s,i)=> {return {
        angle: angle*i,
        enable: true,
        id: i,
        idroot: 0,
        range: [0, 10],
        text: s,
    }})
}
function getformattime (rate,unit){
    return d3["time"+unit].every(rate);
}
function handleDatabyKey (data,range,formatTime,listkey) {
    let data_filtered;
    if (range===undefined){
        data_filtered = data;
    }else {
        const tempTimescale = d3.scaleTime().domain(range).range([0,1]);
        data_filtered = data.filter(d=> (tempTimescale(d.time)> 0 || tempTimescale(d.time)=== 0) && (tempTimescale(d.time)< 1 || tempTimescale(d.time)=== 1));
    }
    let nestFunc = d3.nest();
    listkey.forEach(k=> nestFunc = (k!=="time")?nestFunc.key(function(d){return d[k]}):nestFunc.key(function(d){return formatTime(d.time)}))
    return nestFunc
        .rollup(d=>{return {num: d.length,val: onStatictis(d),minval: onStatictis(d,'min'),maxval: onStatictis(d,'max'),q1: onStatictis(d,'quantile',0.25),q3: onStatictis(d,'quantile',0.75),data:d }})
        .entries(data_filtered);
}
let selectedVariable=[];
function onStatictis (data,skey,extra){ //array objects
    skey = skey||'mean';
    let temp ={};
    selectedVariable.forEach(k=>temp[k] = ss[skey](data.map(e=>e[k]).filter(e=>e).sort((a,b)=>a-b),extra));
    // temp.time = data[0].time;
    return temp;
}
function initTime (max){
    controlTime.el.min = 0;
    controlTime.el.max = max-1;
    d3.select('.range-labels').selectAll('li')
        .data(dataRaw.TimeMatch)
        .enter()
        .append('li')
        .append('span')
        .text(d=>d.split(' ')[1]);
    // root.style.setProperty('--steptime',(600/(max-1))+'px')
}
function initRadarMap () {
 RadarMapopt.width = width;
 RadarMapopt.height = height;
 RadarMapopt.svg = d3.select('#RadarMapcontent').attr("class", "T_sneSvg");
 RadarMapopt.svg.call(tool_tip);
 RadarMapplot.graphicopt(RadarMapopt);
 RadarMapplot.svg(RadarMapopt.svg).dispatch(dispatch).init();

}

function step (index){
    let arr = _.zip.apply(_, (d3.values(dataRaw.YearsData[index])));
    arr.forEach((d,i)=>{
        d.name = dataRaw.Countries[i]});
    RadarMapplot.data(arr).draw(index);
}



function request(){
    interval2 = new IntervalTimer(function () {
        if ((timestep<maxtimestep)&&!isBusy){
            RangechangeVal(timestep);
            step(timestep);
            isBusy = true
            timestep++;
            // RadarMapplot.getTop10();
        }else{
            if (isBusy)
                interval2.pause();
        }
    },simDuration);
}
function resetRequest (){
    // pausechange();
    playchange();
    interval2.stop();
    RadarMapplot.remove();
    RadarMapplot.reset(true);
    timestep = 0;
    pausechange();
    // request();
}

function pauseRequest(){
    // clearInterval(interval2);
    var e = d3.select('.pause').node();
    if (e.value==="false"){
        playchange();
    }else {
        pausechange();
    }

}
let isBusy = false;
let dispatch = d3.dispatch("calDone");
dispatch.on("calDone",function (tst){
    isBusy = false;
    console.log('index return:: '+tst);
    if (playing)
        interval2.resume();
});
function playchange(){
    var e = d3.select('.pause').node();
    interval2.pause();
    RadarMapplot.pause();
    playing = false;
    e.value = "true";
    $(e).addClass('active');
    $(e.querySelector('i')).text('play_arrow');
}

function changeShape(d){
    if (d.checked) {
        RadarMapopt.display.symbol.type ="path";
        RadarMapopt.display.symbol.radius =30;
    }else {
        RadarMapopt.display.symbol.type ="circle";
        RadarMapopt.display.symbol.radius =3;
    }
    RadarMapplot.displaystyle(RadarMapopt.display)
    changeGroup_mode(d)
}

function changeMinMax(d){
    let old = RadarMapplot.radaropt().summary;
    old.minmax = d.checked;
    RadarMapplot.radaropt({summary: old}).draw();
}
function changeQuantile(d){
    let old = RadarMapplot.radaropt().summary;
    old.quantile = d.checked;
    RadarMapplot.radaropt({summary: old}).draw();

}
function changeMean(d){
    let old = RadarMapplot.radaropt().summary;
    old.mean = d.checked;
    RadarMapplot.radaropt({summary: old}).draw();
}

function changeFitscreen(d){
    RadarMapplot.fitscreen(d.checked);
}

function changeTimeunit(d){
    if (d.checked) {
        listopt.time.unit = "Minute";
        listopt.time.rate = 5;
    }else {
        listopt.time.unit = "Hour";
        listopt.time.rate = 1;
    }
    let formatTime =getformattime (listopt.time.rate,listopt.time.unit);
    listopt.limitTime = d3.extent(dataRaw,d=>d.time);
    data = handleDatabyKey(dataRaw,listopt.limitTime,formatTime,['location','time']);
    databyTime = handleDatabyKey(dataRaw,listopt.limitTime,formatTime,['time']);
    data.push({'key':(data.length+1)+'',values:databyTime})
    // Loadtostore();
    RadarMapplot.rowMap(dataRaw.location).schema(serviceFullList).timeFormat(formatTime);
    handleOutlier (data,currentService);
}

function changeGroup_mode(d){
    if (d.checked) {
        RadarMapopt.group_mode ="jLouvain";
    }else {
        RadarMapopt.group_mode ="outlier";
    }
    RadarMapplot.group_mode(RadarMapopt.group_mode);
    resetRequest();
}

function pausechange(){
    var e = d3.select('.pause').node();
    if (interval2) interval2.resume();
    RadarMapplot.resume();
    playing = true;
    e.value = "false";
    $(e).removeClass('active');
    $(e.querySelector('i')).text('pause');
}

function fixRangeTime (){
    controlTime = $('#timespan')[0].M_Range;
    controlTime.el.removeEventListener("input", controlTime._handleRangeInputMousemoveTouchmoveBound);
    controlTime.el.removeEventListener("mousemove", controlTime._handleRangeInputMousemoveTouchmoveBound);
    controlTime.el.removeEventListener("touchmove", controlTime._handleRangeInputMousemoveTouchmoveBound);
    controlTime.el.removeEventListener("mousedown", controlTime._handleRangeMousedownTouchstartBound);
    controlTime.el.removeEventListener("touchstart", controlTime._handleRangeMousedownTouchstartBound);
    controlTime._handleRangeInputMousemoveTouchmoveBound = _handleRangeInputMousemoveTouchmove.bind(controlTime) ;
    controlTime._handleRangeMousedownTouchstartBound = _handleRangeMousedownTouchstart.bind(controlTime) ;
    controlTime.el.addEventListener("input", controlTime._handleRangeInputMousemoveTouchmoveBound);
    controlTime.el.addEventListener("mousemove",  controlTime._handleRangeInputMousemoveTouchmoveBound);
    controlTime.el.addEventListener("touchmove",  controlTime._handleRangeInputMousemoveTouchmoveBound);
    controlTime.el.addEventListener("mousedown", controlTime._handleRangeMousedownTouchstartBound);
    controlTime.el.addEventListener("touchstart", controlTime._handleRangeMousedownTouchstartBound);
    $('#timespan').on('change',function(){
        timestep = this.value;
    });
}
function handleDataSumAll (data){ // nest data
    let arr = objecttoArrayRadar(data);
    arr.density = data.num;
    arr.loc = data.key;
    arr.id = fixstr(data.key+'_all');
    return arr;
}
function handleDataIcon (data){ // nest data
    data.sort((a,b)=>(+a.key)-(+b.key));
    // if (serviceid===-1)
    //     listopt.limitColums =[0,dataRaw.TimeMatch.length];

    data.forEach(t=> {
        t.arr = objecttoArrayRadar(t.value||t.values);
        t.arr.density = (t.value||t.values).num;
        t.arr.loc = t.key;
        t.arr.id = fixstr(t.key+'_all');
    });

    RadarMapplot.dataIcon(data);
}
function handleOutlier (data){ // nest data
    data.sort((a,b)=>(+a.key)-(+b.key));
    // if (serviceid===-1)
    //     listopt.limitColums =[0,dataRaw.TimeMatch.length];

    data.forEach(loc=>loc.values.forEach(t=> {
        t.arr = objecttoArrayRadar(t.value||t.values);
        t.arr.time = new Date(t.key);
        t.arr.density = (t.value||t.values).num;
        t.arr.loc = loc.key;
        t.arr.id = fixstr(loc.key+'_'+(+t.arr.time));
    }));

    RadarMapplot.data(data).draw();
}

let schema;
function objecttoArrayRadar(o){
    return schema.axisList.map(s=>{return {
        axis: s.data.text,
        value: s.scale(o.val[s.data.text]),
        minval: s.scale(o.minval[s.data.text]),
        maxval: s.scale(o.maxval[s.data.text]),
        q1: s.scale(o.q1[s.data.text]),
        q3: s.scale(o.q3[s.data.text])
    }});
}
// list html

function onmouseoverRadar (d) {
    d3.selectAll('.geoPath:not(#'+removeWhitespace(dataRaw.location[d.loc])+')').classed('nothover',true);
    d3.selectAll(".linkLineg:not(.disable)").filter(e=> (e.loc !==d.loc)&&(formatTime(e.time).toString() !==formatTime(d.time).toString())).style('opacity',0.2);
    tool_tip.show();
    RadarChart('.radarChart_tip',[d],{width:300,height:300,schema:serviceFullList,showText:true,levels:6,summary:{mean:true, minmax:true, quantile:true},gradient:true,strokeWidth:0.5,arrColor:arrColor})
}
function onmouseleaveRadar (d) {
    d3.selectAll('.geoPath:not(#'+removeWhitespace(dataRaw.location[d.loc])+')').classed('nothover',false);
    d3.selectAll(".linkLineg:not(.disable)").filter(e=> (e.loc !==d.loc)&&(formatTime(e.time).toString() !==formatTime(d.time).toString())).style('opacity',1);
    tool_tip.hide();
}