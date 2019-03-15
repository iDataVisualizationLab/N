let width = 2000,
    height = 1000,
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
        opt:{
            epsilon : 30, // epsilon is learning rate (10 = default)
            perplexity : 30, // roughly how many neighbors each point influences (30 = default)
            dim : 2, // dimensionality of the embedding (2 = default)
            maxtries: 1000
        },
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
        }
},controlTime,
    runopt ={
        zoom:60,
        simDuration: 1000,
    };
let arrColor = ["#110066", "#4400ff", "#00cccc", "#00dd00", "#ffcc44", "#ff0000", "#660000"];
let formatTime = d3.timeFormat("%b %Y");
let simDuration =1000, timestep=0,maxtimestep,interval2;
let dataRaw;
let TSneplot = d3.Tsneplot();

const svg = d3.select('#tSNEcontent');


const initialize = _.once(initDemo);
$(document).ready(function(){
    //scatterConfig.scaleView = $('#mainPlot').width()/scatterConfig.width;
    $('.sidenav').sidenav();
    $('.collapsible').collapsible();
    $('.tabs').tabs({'onShow':function(){
            if ($('#demo').css('display')!=="none")
                initialize()}});
    $('#zoomInit').on('change',function(){
        runopt.zoom = this.value;
        TSneplot.runopt(runopt);
    });
    $('#zoomInit')[0].value = runopt.zoom;
    $('#simDurationUI').on('change',function(){
        simDuration = this.value;
        runopt.simDuration = simDuration;
        TSneplot.runopt(runopt);
        interval2.stop();
        request();
    });
    $('#simDurationUI')[0].value = simDuration;
    controlTime = $('#timespan')[0].M_Range;
    d3.select('#datacom').on("change", function () {
        d3.select('.cover').classed('hidden', false);
        const choice = this.value;
        const choicetext = d3.select('#datacom').node().selectedOptions[0].text;
        setTimeout(() => {
            readData(choice).then((d)=>{
                dataRaw = d;
                d3.select(".currentData")
                    .text(choicetext);
                maxtimestep = dataRaw.YearsData.length;
                resetRequest();
                d3.select('.cover').classed('hidden', true);});
        },0);
    });
    d3.select("#DarkTheme").on("click",switchTheme);
});
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
function initDemo(){
    width = $('#tSNE').width();
    height = d3.max([document.body.clientHeight-280, 300]);
    // scatterConfig.width = $('#mainPlot').width();
    // netConfig.width = widthSvg;
    init();
}

function init() {
    initTsne ();

    readData('EmploymentRate').then((d)=>{
        dataRaw = d;
        d3.select("#currentData")
            .text('Employment Rate');
        timestep = 0;
        maxtimestep = dataRaw.YearsData.length;
        initTime (maxtimestep);
        RangechangeVal(0);
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
 TSneplot.runopt(runopt).graphicopt(TsnePlotopt);
 TSneplot.svg(TsnePlotopt.svg).init();
}

function step (index){
    let arr = _.zip.apply(_, (d3.values(dataRaw.YearsData[index])));
    arr.forEach((d,i)=>d.name = dataRaw.Countries[i]);
    TSneplot.data(arr).draw();
}

function request(){
    interval2 = new IntervalTimer(function () {
        if (timestep<maxtimestep){
            // d3.select('.range-labels').selectAll('li').classed("active selected",false);
            // d3.select('.range-labels').selectAll('li')
            //     .filter((d,i)=>i===timestep)
            //     .classed("active selected",true);
            RangechangeVal(timestep);
            step(timestep);
            timestep++;
            TSneplot.getTop10();
        }
    },simDuration);
}
function resetRequest (){
    pausechange();
    interval2.stop();
    TSneplot.remove();
    TSneplot.reset(true);
    timestep = 0;
    request();
}

function pauseRequest(){
    // clearInterval(interval2);
    var e = d3.select('.pause').node();
    if (e.value=="false"){
        playchange();
    }else {
        pausechange();
    }

}

function playchange(){
    var e = d3.select('.pause').node();
    interval2.pause();
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
}

function pausechange(){
    var e = d3.select('.pause').node();
    if (interval2) interval2.resume();
    e.value = "false";
    $(e).removeClass('active');
    $(e.querySelector('i')).text('pause');
}