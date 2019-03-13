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
        epsilon : 50, // epsilon is learning rate (10 = default)
        perplexity : 30, // roughly how many neighbors each point influences (30 = default)
        dim : 2, // dimensionality of the embedding (2 = default)
        maxtries: 1000
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
            }
        }
    }
};
let simDuration =2000, timestep=0,maxtimestep=100,interval2;
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
    d3.select('#datacom').on("change", function () {
        d3.select('.cover').classed('hidden', false);
        const choice = this.value;
        const choicetext = d3.select('#datacom').node().selectedOptions[0].text;
        setTimeout(() => {
            readData(choice).then((d)=>{
                maxtimestep = d.YearsData.length;
                dataRaw = d;
                d3.select(".currentData")
                    .text(choicetext);
                resetRequest();
                d3.select('.cover').classed('hidden', true);});
        },0);
    });
    d3.select("#DarkTheme").on("click",switchTheme);
});

function initDemo(){
    width = $('#tSNE').width();
    height = 1000;
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
        resetRequest();
        d3.select('.cover').classed('hidden',true);
    });
}

function initTsne () {
 TsnePlotopt.width = width;
 TsnePlotopt.height = height;
 TsnePlotopt.svg =svg.attr("class", "T_sneSvg");
 TSneplot.graphicopt(TsnePlotopt);
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
            step(timestep);
            timestep++;
            TSneplot.getTop10();
        }
    },simDuration);
}
function resetRequest (){
    pausechange();
    if (interval2) interval2.stop();
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
    $(e.querySelector('i')).removeClass('fa-pause pauseicon').addClass('fa-play pauseicon');
    svg.selectAll(".connectTimeline").style("stroke-opacity", 0.1);
}

function pausechange(){
    var e = d3.select('.pause').node();
    if (interval2) interval2.resume();
    e.value = "false";
    $(e).removeClass('active');
    $(e.querySelector('i')).removeClass('fa-play pauseicon').addClass('fa-pause pauseicon');
    svg.selectAll(".connectTimeline").style("stroke-opacity", 1);
}