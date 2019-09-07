let width = 2000,
    height = 1000,
    TsneConfig = {
            epsilon : 10, // epsilon is learning rate (10 = default)
            perplexity : 20, // roughly how many neighbors each point influences (30 = default)
            dim : 2, // dimensionality of the embedding (2 = default)
            maxtries: 1000
    },
    TsnePlotopt  = {
        margin: {top: 0, right: 0, bottom: 0, left: 0},
        offset: {top: 0},
        width: width,
        height: height,
        scalezoom: 1,
        widthView: function(){return this.width*this.scalezoom},
        heightView: function(){return this.height*this.scalezoom},
        widthG: function(){return this.widthView()-this.margin.left-this.margin.right},
        heightG: function(){return this.heightView()-this.margin.top-this.margin.bottom},
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
            size: 200
        }
},controlTime,
    listopt = {
        limitRows: 20,
        limitColums: [0,10],
        limitYear: [2000,2011], // change year limit in list ranking here
        // limitYear: [1998,2001],
    },
    runopt ={
        zoom:60,
        simDuration: 1000,
    }, colorScaleList = {
        n: 10,
        rainbow: ["#110066", "#4400ff", "#00cccc", "#00dd00", "#ffcc44", "#ff0000", "#660000"],
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
        {val: 'Viridis',type:'d3',label: 'Viridis'}],
        Cluster: [{val: 'Category10',type:'d3',label: 'D3'},{val: 'Paired',type:'d3',label: 'Blue2Red'}]};
let arrColor = colorScaleList.rainbow;
let formatTime = d3.timeFormat("%b %Y");
let simDuration =1000, timestep=0,maxtimestep,interval2,playing=true;
let dataRaw,currentService =0;
let TSneplot = d3.Tsneplot();

const svg = d3.select('#tSNEcontent');


const initialize = _.once(initDemo);
$(document).ready(function(){
    //scatterConfig.scaleView = $('#mainPlot').width()/scatterConfig.width;
    $('.sidenav').sidenav();
    $('.collapsible').collapsible();
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
        //     TSneplot.runopt(runopt);
        // });
        // $('#zoomInit')[0].value = runopt.zoom;
        $('#detailLevel_Perplexity').on('change', function () {
            TsneConfig.perplexity = this.value;
            TSneplot.option(TsneConfig);
            resetRequest();
        });
        $('#detailLevel_Perplexity')[0].value = TsneConfig.perplexity;

    $('#detailLevel_Epsilon').on('change', function () {
        TsneConfig.epsilon = this.value;
        TSneplot.option(TsneConfig);
        resetRequest();
    });
    $('#detailLevel_Epsilon')[0].value = TsneConfig.epsilon;

        $('#simDurationUI').on('change', function () {
            simDuration = this.value;
            runopt.simDuration = simDuration;
            TSneplot.runopt(runopt);
            interval2.pause(simDuration);
            if (playing)
                interval2.resume(simDuration);
        });
        $('#simDurationUI')[0].value = simDuration;
        fixRangeTime();

        d3.select('#datacom').on("change", function () {
            d3.select('.cover').classed('hidden', false);
            const choice = this.value;
            const choicetext = d3.select('#datacom').node().selectedOptions[0].text;
            d3.select('#currentData').text(choicetext);
            playchange();
            setTimeout(() => {
                readData(choice).then((d) => {
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
                    TSneplot.axis(d.Variables);
                    d3.select('.averageSUm').selectAll('*').remove();
                    //remove later
                    var duration = dataRaw.TimeMatch.filter(d=>(new Date(d)).getFullYear()>(listopt.limitYear[0]-1)&&(new Date(d)).getFullYear()<(listopt.limitYear[1]+1));
                    var lowlimit = dataRaw.TimeMatch.indexOf(duration.shift());
                    var highlimit = dataRaw.TimeMatch.indexOf(duration.pop());
                    listopt.limitColums = [lowlimit,highlimit];

                    handleOutlier (dataRaw,currentService);
                    resetRequest();
                    d3.select('.cover').classed('hidden', true);
                });
            }, 0);
        });
        d3.select("#DarkTheme").on("click", switchTheme);
        changeRadarColor(colorArr.Radar[2]);
        TSneplot.RadarColor(colorArr.Radar[2])
        changeClusterColor(colorArr.Cluster[0]);
        // color scale create
        creatContain(d3.select('#RadarColor').select('.collapsible-body>.pickercontain'), colorScaleList, colorArr.Radar, onClickRadarColor);
        creatContain(d3.select('#ClusterColor').select('.collapsible-body>.pickercontain'), colorScaleList, colorArr.Cluster, onClickClusterColor);

});

function changeRadarColor(d) {
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
    TSneplot.RadarColor(d);
}
function onClickClusterColor (d){
    changeClusterColor(d);
    TSneplot.ClusterColor(d);
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
    initTsne ();
    const choice = d3.select('#datacom').node().value;
    const choicetext = d3.select('#datacom').node().selectedOptions[0].text;
    d3.select('#currentData').text(choicetext);

    readData(choice).then((d)=>{
        dataRaw = d;
        timestep = 0;
        maxtimestep = dataRaw.YearsData.length;
        initTime (maxtimestep);
        RangechangeVal(0);
        TSneplot.axis(d.Variables);

        //remove later
        var duration = dataRaw.TimeMatch.filter(d=>(new Date(d)).getFullYear()>(listopt.limitYear[0]-1)&&(new Date(d)).getFullYear()<(listopt.limitYear[1]+1));
        var lowlimit = dataRaw.TimeMatch.indexOf(duration.shift());
        var highlimit = dataRaw.TimeMatch.indexOf(duration.pop());
        listopt.limitColums = [lowlimit,highlimit];
        handleOutlier (dataRaw,currentService);
        request();
        d3.select('.cover').classed('hidden',true);
    });



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
function initTsne () {
 TsnePlotopt.width = width;
 TsnePlotopt.height = height;
 TsnePlotopt.svg =svg.attr("class", "T_sneSvg");
 TSneplot.runopt(runopt).graphicopt(TsnePlotopt).option(TsneConfig);
 TSneplot.svg(TsnePlotopt.svg).dispatch(dispatch).init();

}

function step (index){
    let arr = _.zip.apply(_, (d3.values(dataRaw.YearsData[index])));
    arr.forEach((d,i)=>{
        d.name = dataRaw.Countries[i]});
    TSneplot.data(arr).draw(index);
}



function request(){
    interval2 = new IntervalTimer(function () {
        if ((timestep<maxtimestep)&&!isBusy){
            RangechangeVal(timestep);
            step(timestep);
            isBusy = true
            timestep++;
            // TSneplot.getTop10();
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
    TSneplot.remove();
    TSneplot.reset(true);
    timestep = 0;
    pausechange();
    request();
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
    TSneplot.pause();
    playing = false;
    e.value = "true";
    $(e).addClass('active');
    $(e.querySelector('i')).text('play_arrow');
}

function changeShape(d){
    if (d.checked) {
        TsnePlotopt.display.symbol.type ="circle";
        TsnePlotopt.display.symbol.radius =3;
    }else {
        TsnePlotopt.display.symbol.type ="path";
        TsnePlotopt.display.symbol.radius =30;
    }
    TSneplot.displaystyle(TsnePlotopt.display)
    changeGroup_mode(d)
}

function changeGroup_mode(d){
    if (d.checked) {
        TsnePlotopt.group_mode ="jLouvain";
    }else {
        TsnePlotopt.group_mode ="outlier";
    }
    TSneplot.group_mode(TsnePlotopt.group_mode);
    resetRequest();
}

function pausechange(){
    var e = d3.select('.pause').node();
    if (interval2) interval2.resume();
    TSneplot.resume();
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

function handleOutlier (dataRaw,serviceid){
    if (serviceid===-1)
        listopt.limitColums =[0,dataRaw.TimeMatch.length];
    let countiesOutlier = _.unzip(dataRaw.YearsDataScag.slice(listopt.limitColums[0],listopt.limitColums[1])).map((d,id)=>{
        var temp = {};
        temp.key = dataRaw.Countries[id];
        temp.id = id;
        temp.value = d3.sum(d);
        return temp});
    countiesOutlier.sort((a,b)=>b.value-a.value);
    var tables = [];
    tables[0] =  { table: 'Ranking by Outliers Top '+listopt.limitRows+' from '+dataRaw.TimeMatch[listopt.limitColums[0]]+' to '+dataRaw.TimeMatch[listopt.limitColums[1]-1], rows: []}
    tables[0].header = ["States"];
    dataRaw.TimeMatch.slice(listopt.limitColums[0],listopt.limitColums[1]).forEach(d=>tables[0].header.push(d));
    tables[0].rows = countiesOutlier.slice(0,listopt.limitRows).map(d=>
    {
        // d.arr = (dataRaw.YearsDataTrue||dataRaw.YearsData).map(y=>(y['v'+serviceid]||y['s'+serviceid])[d.id])
        d.arr = dataRaw.YearsData.slice(listopt.limitColums[0],listopt.limitColums[1]).map(y=>{
            var temp = dataRaw.Variables.map((s,si)=> y['s'+si][d.id]);
        temp.key = d.key; return temp})
        return d;})
    update(tables,d3.select('.tablelistContain'))
}

// list html
function update(data,tableDiv) {

    // Select all divs in the table div, and then apply new data
    const divs = tableDiv.selectAll('div')
    // After .data() is executed below, divs becomes a d3 update selection
        .data(data, d => d.table);

    // Use the exit method of the d3 update selection to remove any deleted table div and contents (which would be absent in the data array just applied)
    divs.exit().remove();

    // Use the enter metod of the d3 update selection to add new ('entering') items present in the
    // data array just applied
    const divsEnter = divs
        .enter().append('div')
        .attr('id', d => `${ d.table }-Div`)
        .attr('class', 'well');

    // Add title in new div(s)
    divsEnter.append('h6').text(d => d.table);

    divs.selectAll('h6').text(d => `${ d.table }`);

    // Add table in new div(s)
    const tableEnter = divsEnter.append('table')
        .attr('id', d => d.table)
        .attr('class', 'table table-condensed table-striped table-bordered');

    // Append table head in new table(s)
    tableEnter.append('thead')
        .append('tr')
        .selectAll('th')
        // Table column headers (here constant, but could be made dynamic)
        .data(d=>d.header)
        .enter().append('th')
        .text(d => d);

    // Append table body in new table(s)
    tableEnter.append('tbody');

    // Select all tr elements in the divs update selection
    let tr = divs.merge(divsEnter).select('table').select('tbody').selectAll('tr')
    // After the .data() is executed below, tr becomes a d3 update selection
        .data(
            d =>  d.rows, // Return inherited data item
            d => d.key    // 'key' function to disable default by-index evaluation
        );

    // Use the exit method of the update selection to remove table rows without associated data
    tr.exit().remove();

    // Use the enter method to add table rows corresponding to new data
    let trn = tr.enter().append('tr');
    tr = tr.merge(trn)
    // Bind data to table cells (td becomes update selection)
    const td = tr.selectAll('td')
    // After the .data() is executed below, the td becomes a d3 update selection
        .data(d => _.flatten([d.key,d.arr],true));   // return inherited data item

    // Use the enter method of the update selection to add td elements
    const tdAll =td.enter().append('td')
        .merge(td);
    tdAll.filter(d=>typeof d ==='string').text(d =>
    {try { return d.toFixed(2)}catch (e) {return d}});
    const opt = {
        radraradius: 20,
        levels:6,
        arrColor: arrColor,
    };
    tdAll.filter((d,i)=>(typeof d !=='string')).attr('class','radar').each(function(d,i) {
        miniRadarChart(d3.select(this),[d],i,opt);
    });
}