let width = 2000,
    height = 1000,
    controlTime,
    listopt = {
        limitRows: 20,
        limitColums: [0,10],
        // time: {rate:1,unit:'Year'},
        // timeformat: d3.timeYear.every(1),
        // time: {rate:1,unit:'Day'},
        // timeformat: d3.timeDay.every(1),
        time: {rate:1,unit:'Day'},
        timeLink: {rate:1,unit:'Week'},
        timeformat: d3.timeDay.every(1),
        limitYear: [2019,2020],
        limitTime: [new Date('12/20/2019'),new Date('4/21/2020')],
        termGroup:{'Beijing':-1,'Hubei':2,'Wuhan':1,'China':3,'COVID-19':4,'Coronavirus':5}
    },
    RadarMapopt  = {
        margin: {top: 10, right: 10, bottom: 0, left: 100},
        offset: {top: 0},
        width: width,
        height: height,
        min_height: height,
        scalezoom: 1,
        widthView: function(){return this.width*this.scalezoom},
        heightView: function(){return this.height*this.scalezoom},
        widthG: function(){return this.widthView()-this.margin.left-this.margin.right},
        heightG: function(){return this.heightView()-this.margin.top-this.margin.bottom},
        fixscreence: false,
        dotRadius: 3,
        group_mode: 'outlier',
        display:{
            stream:{
                yScale: d3.scaleLinear().domain([0,30]).range([0.1,10])
            },
            links:{
                'stroke-opacity':0.5
            },
            customTerms:{
                'COVID-19': {isConnectedmaxTimeIndex:d3.TimeArc().firstLink},
                'Hubei': {isConnectedmaxTimeIndex:d3.TimeArc().firstLink},
                'Wuhan': {isConnectedmaxTimeIndex:d3.TimeArc().firstLink},
                'China': {isConnectedmaxTimeIndex:d3.TimeArc().firstLink},
                'Coronavirus': {isConnectedmaxTimeIndex:d3.TimeArc().firstLink},
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
        soil: ["#4A8FC2", "#76A5B1", "#9DBCA2", "#C3D392", "#E8EC83", "#F8E571", "#F2B659", "#ebc05a", "#eb6424", "#D63128"],
        Oranges: ["#fff5eb","#fff5ea","#fff4e9","#fff4e8","#fff3e7","#fff3e6","#fff2e6","#fff2e5","#fff1e4","#fff1e3","#fff0e2","#fff0e1","#ffefe0","#ffefdf","#ffeede","#ffeedd","#feeddc","#feeddb","#feecda","#feecd9","#feebd8","#feebd7","#feead6","#feead5","#fee9d4","#fee9d3","#fee8d2","#fee8d1","#fee7d0","#fee6cf","#fee6ce","#fee5cc","#fee5cb","#fee4ca","#fee4c9","#fee3c8","#fee2c7","#fee2c5","#fee1c4","#fee1c3","#fee0c2","#fedfc0","#fedfbf","#fedebe","#feddbd","#feddbb","#fedcba","#fedbb9","#fedab7","#fddab6","#fdd9b4","#fdd8b3","#fdd8b2","#fdd7b0","#fdd6af","#fdd5ad","#fdd4ac","#fdd4aa","#fdd3a9","#fdd2a7","#fdd1a6","#fdd0a4","#fdd0a3","#fdcfa1","#fdcea0","#fdcd9e","#fdcc9d","#fdcb9b","#fdca99","#fdc998","#fdc896","#fdc795","#fdc693","#fdc591","#fdc490","#fdc38e","#fdc28d","#fdc18b","#fdc089","#fdbf88","#fdbe86","#fdbd84","#fdbc83","#fdbb81","#fdba7f","#fdb97e","#fdb87c","#fdb77a","#fdb679","#fdb577","#fdb475","#fdb374","#fdb272","#fdb171","#fdb06f","#fdaf6d","#fdae6c","#fdad6a","#fdac69","#fdab67","#fdaa65","#fda964","#fda762","#fda661","#fda55f","#fda45e","#fda35c","#fda25b","#fda159","#fda058","#fd9f56","#fd9e55","#fd9d53","#fd9c52","#fd9b50","#fd9a4f","#fc994d","#fc984c","#fc974a","#fc9649","#fc9548","#fc9346","#fc9245","#fc9143","#fc9042","#fb8f40","#fb8e3f","#fb8d3e","#fb8c3c","#fb8b3b","#fa8a3a","#fa8938","#fa8837","#fa8736","#fa8534","#f98433","#f98332","#f98230","#f8812f","#f8802e","#f87f2c","#f77e2b","#f77d2a","#f77b29","#f67a27","#f67926","#f57825","#f57724","#f57623","#f47522","#f47420","#f3731f","#f3721e","#f2701d","#f26f1c","#f16e1b","#f16d1a","#f06c19","#f06b18","#ef6a17","#ef6916","#ee6815","#ed6714","#ed6614","#ec6513","#ec6312","#eb6211","#ea6110","#ea6010","#e95f0f","#e85e0e","#e85d0e","#e75c0d","#e65b0c","#e55a0c","#e4590b","#e4580b","#e3570a","#e25609","#e15509","#e05408","#df5308","#de5208","#dd5207","#dc5107","#db5006","#da4f06","#d94e06","#d84d05","#d74c05","#d64c05","#d54b04","#d44a04","#d24904","#d14804","#d04804","#cf4703","#cd4603","#cc4503","#cb4503","#c94403","#c84303","#c74303","#c54203","#c44103","#c24102","#c14002","#bf3f02","#be3f02","#bd3e02","#bb3e02","#ba3d02","#b83d02","#b73c02","#b53b02","#b43b02","#b23a03","#b13a03","#af3903","#ae3903","#ac3803","#ab3803","#aa3703","#a83703","#a73603","#a53603","#a43503","#a33503","#a13403","#a03403","#9f3303","#9d3303","#9c3203","#9b3203","#993103","#983103","#973003","#953003","#942f03","#932f03","#922e04","#902e04","#8f2d04","#8e2d04","#8d2c04","#8b2c04","#8a2b04","#892b04","#882a04","#862a04","#852904","#842904","#832804","#812804","#802704","#7f2704"],
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
            {val: 'soil',type:'custom',label: 'RedYelBlu'},],
        Cluster: [{val: 'Category10',type:'d3',label: 'D3'},{val: 'Paired',type:'d3',label: 'Blue2Red'}]};
let arrColor = colorScaleList.rainbow;
let formatTime = d3.timeFormat("%b %Y");
let simDuration =1000, timestep=0,maxtimestep,interval2,playing=true;
let dataRaw,dataBytime,currentService =0;
let TimeArc  = d3.TimeArc();

// filter aka blacklist
let blackCategory = ["CARDINAL",'ORDINAL','DATE','LANGUAGE','PERCENT','QUANTITY','TIME','LAW','MONEY','FAC','PRODUCT',
    'WORK_OF_ART','NORP','EVENT'];
let blackTerms = {'CoV':'PERSON'}
let blacklist =['MATERIALS','Multivariate','METHODS','Method','View','Analysis','Herein','p<0.001','ANOVA','Chi-squared',
    'D68','RBD','ACE2','AST','LDH','Main Results','Markov','Monte Carlo','IgG','IgM','N95','IBV','Mtb','IVA','IVB','ILI',
    'MHC','HLA','EMBASE','IL6','TNF-α','IFN-β','Bayesian','African','GAD-7','PCT','ARDS','NHS','EEA','CK-MB','Nature','TCM',
    'Funding None','PEDV','NCP','AUC','Vero','IL-6','CFR','Cox','the General Population','RNA','RT-LAMP','ROC','Western',
    'Europe','Han','Asia','Africa','Outbreak','Parallel','PaO(2)/FiO(2','–0.3762','5‐year‐age‐group','DTR ≥','IPEC-J2',
    'e.g','BIG','Q176','PaO(2)/FiO(2','13·0','the RT-LAMP','n=7','83.8','BALB/','Gram','27·2–37·5','GI-27','GI-9','‐19',
    'FilmArray','mTLR9','‘CC’'];
let fixCategory = {
    Catalonia:'LOC',
    "Saharan Africa":'LOC',
    "Taiwan":'LOC',
    "Wenzhou":'LOC',
    "Chongqing":'LOC',
    "Zhejiang":'LOC',
    "Hong Kong":'LOC',
    "Angiotensin":'PERSON',
    'H5NX':'Virus',
    'Tonsillitis':'Virus',
    "Fujian":'LOC',
    "Guangdong":'LOC',
}
// change name of category

const initialize = _.once(initDemo);
$(document).ready(function(){
    //scatterConfig.scaleView = $('#mainPlot').width()/scatterConfig.width;
    $('.datepicker').datepicker();
    $( "#map" ).draggable();
    $(".dropdown-trigger").dropdown();
    $("#controlPanel").draggable();
    $('.sidenav').sidenav();
    $('.collapsible').collapsible();
    $('.modal').modal();
    var elem = document.querySelector('.collapsible.expandable');
    var instance = M.Collapsible.init(elem, {
        accordion: false
    });
    // $('.tabs').tabs({'onShow':function(){
    //
    //         if (this.$activeTabLink.text()==='Mini-Challenge 2') {
    //             $('#videoIn').each(function(index) {
    //                 $(this).attr('src', $(this).attr('src'));
    //                 return false;
    //             });
    //             initialize();
    //         }else{
    //             try{
    //                 // playchange();
    //             }catch(e){
    //
    //             }
    //         }
    // }});
    // if (d3.select('#demoTab a').classed('active')){
    //     $('#videoIn').each(function(index) {
    //         $(this).attr('src', $(this).attr('src'));
    //         return false;
    //     });
    //     initialize();
    // }
    initialize();
    $('#btnUpload').click(function () {
        var bar = document.getElementById('progBar'),
            fallback = document.getElementById('downloadProgress'),
            loaded = 0;

        var load = function () {
            loaded += 1;
            bar.value = loaded;

            /* The below will be visible if the progress tag is not supported */
            $(fallback).empty().append("HTML5 progress tag not supported: ");
            $('#progUpdate').empty().append(loaded + "% loaded");

            if (loaded == 100) {
                clearInterval(beginLoad);
                $('#progUpdate').empty().append("Upload Complete");
                console.log('Load was performed.');
            }
        };

        var beginLoad = setInterval(function () {
            load();
        }, 50);

    });

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
                CircleMapplot.axis(d.Variables);
                d3.select('.averageSUm').selectAll('*').remove();
                //remove later
                var duration = dataRaw.TimeMatch.filter(d=>(new Date(d)).getFullYear()>(listopt.limitYear[0]-1)&&(new Date(d)).getFullYear()<(listopt.limitYear[1]+1));
                var lowlimit = dataRaw.TimeMatch.indexOf(duration.shift());
                var highlimit = dataRaw.TimeMatch.indexOf(duration.pop());
                listopt.limitColums = [lowlimit,highlimit];

                data = handleDatabyKey(dataRaw,listopt.limitTime,formatTime,['location','time']);
                handleOutlier (data,currentService);
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
    CircleMapplot.RadarColor(d);
}
function onClickClusterColor (d){
    changeClusterColor(d);
    CircleMapplot.ClusterColor(d);
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
// let ssss;
function init() {
    catergogryList = [
        {
            "key":"COVID-19",
            "value":{
                "colororder":3
            },
            "order":0
        },
        {
            "key":"Virus",
            "value":{
                "colororder":1
            },
            "order":1
        },
        {
            "key":"ORG",
            "value":{
                "colororder":2,
                "text":"Organization"
            },
            "order":3
        },
        {
            "key":"GPE",
            "value":{
                "colororder":0,
                "text":"Nation"
            },
            "order":2
        },
        {
            "key":"LOC",
            "value":{
                "colororder":4,
                "text":"Location"
            },
            "order":4
        },
        {
            "key":"PERSON",
            "value":{
                "colororder":5,
                "customcolor":'#aeaeae',
                "text": "Other"
            },
            "order":5
        }
    ];
    const choice = d3.select('#datacom').node().value;
    const choicetext = d3.select('#datacom').node().selectedOptions[0].text;
    d3.select('#currentData').text(choicetext);
    Promise.all([
        readDatacsv(choice,'csv')
    ])
        .then(([d])=>{
            // ssss = statics.slice();
            //     var sentiment = new Sentimood();
            //     var analyze = sentiment.analyze;
            //     listopt.limitYear =
            console.log('Data raw size: ',d.length);
            d =d.filter(e=>e.term!==""&&e.publish_time!==""&&!_.isNaN(+new Date(e.publish_time))&&filterYear(e));
            console.log('Removed none date and no term result size: ',d.length);
            // d=d.filter(e=>e.account!=="Opportunities2").filter(e=>analyze(e.message).score<0);
            // d =d.filter(e=>!(new RegExp('^re: ')).test(e.message)).filter(e=>e.account!=="Opportunities2").filter(e=>analyze(e.message).score<0);
            let count=0;
            let totalcount = d.length;
            let updatecondition = 0.1;
            // catergogryList = [];
            let queueProcess = d.map((t,i)=> {
                return new Promise((resolve, reject) => {
                    setTimeout(() => {
                        t.date = new Date(t.publish_time);
                        let category = t.category.split('|');
                        let term = t.term.split('|');
                        t.category = {};
                        category.forEach((c,ci) => {
                            try {
                                const replaced = replaceTerm(term[ci]);
                                if (replaced) {
                                    c = replaced.category;
                                    term[ci] = replaced.term;
                                }
                                if (term[ci].length > 2 && !blackCategory.find(e => e === c) && blackTerms[term[ci]] !== c && !blacklist.find(e=>term[ci]==e)) { // filtering
                                    c = fixCategory[term[ci]]?fixCategory[term[ci]]:c;
                                    if (!catergogryList.find(e => e.key === c))
                                        catergogryList.push({key: c, value: {colororder: catergogryList.length}});
                                    if (!t.category[c])
                                        t.category[c] = {};
                                    t.category[c][term[ci]] = 1;
                                }
                            }catch (e) {
                                console.log(e,category,term,ci,term[ci])
                            }
                        });
                        count++;
                        if (count/totalcount>updatecondition){
                            updateProcessBar(updatecondition);
                            updatecondition+=0.1;
                        }
                        resolve(t);
                    },0);
                });
            });
            return Promise.all(queueProcess);
        })
        .then ((d)=>{
            // const locationfilter= 'Old Town';
            // dataRaw = d.filter(d=>(d.category['location (of the message)']&&d.category['location (of the message)'][locationfilter])||(d.category['location (in the message)']&&d.category['location (in the message)'][locationfilter]));
            dataRaw = d;
            timestep = 0;
            listopt.limitColums = [0,10];
            formatTime =getformattime (listopt.time.rate,listopt.time.unit);
            listopt.limitTime = d3.extent(dataRaw,d=>d.date);
            updateProcessBar(0.8);
            // TimeArc.runopt(listopt).data(dataRaw).stickyTerms(['earthquake']).draw();
            initTimeArc();
            TimeArc.runopt(listopt).data(dataRaw).draw();
            updateProcessBar(1);
            d3.select('.cover').classed('hidden',true);
        });
}
function filterYear(e){
    let inrangecondition = listopt.limitTime===undefined || (new Date(e.publish_time)-listopt.limitTime[0]>=0&&new Date(e.publish_time)-listopt.limitTime[1]<=0);
    let noneSingleYear = !(+e.publish_time);
    return inrangecondition&&noneSingleYear;
}
function updateProcessBar(rate){
    d3.select('#load_data').select('.determinate').style('width',rate*100+'%');
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
    CircleMapplot.schema(serviceFullList).draw();
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
function handleDatabyKey (data,range,formatTime,listkey,calstatics) {
    let data_filtered;
    if (range===undefined){
        data_filtered = data;
    }else {
        const tempTimescale = d3.scaleTime().domain(range).range([0,1]);
        data_filtered = data.filter(d=> (tempTimescale(d.time)> 0 || tempTimescale(d.time)=== 0) && (tempTimescale(d.time)< 1 || tempTimescale(d.time)=== 1));
    }
    let nestFunc = d3.nest();
    listkey.forEach(k=> nestFunc = (k!=="time")?nestFunc.key(function(d){return d[k]}):nestFunc.key(function(d){return formatTime(d.time)}))
    if (calstatics)
        nestFunc = nestFunc
            .rollup(d=>{return {num: d.length,val: onStatictis(d),minval: onStatictis(d,'min'),maxval: onStatictis(d,'max'),q1: onStatictis(d,'quantile',0.25),q3: onStatictis(d,'quantile',0.75),data:d }});
    else
        nestFunc = nestFunc
            .rollup(d=>{return d[0]});
    return nestFunc
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
function initTimeArc () {
    RadarMapopt.width = width;
    RadarMapopt.height = height;
    // RadarMapopt.margin.left = Math.max(width*2/12,400);
    RadarMapopt.margin.left = 310;
    RadarMapopt.min_height = 200//+$('#map')[0].getClientRects()[0].height;
    RadarMapopt.svg = d3.select('#RadarMapcontent').attr("class", "T_sneSvg");
    RadarMapopt.svg.call(tool_tip);
    TimeArc.graphicopt(RadarMapopt);
    TimeArc.svg(RadarMapopt.svg).mouseover(onmouseoverRadar).mouseout(onmouseleaveRadar).catergogryList(catergogryList).init();

}

function step (index){
    let arr = _.zip.apply(_, (d3.values(dataRaw.YearsData[index])));
    arr.forEach((d,i)=>{
        d.name = dataRaw.Countries[i]});
    CircleMapplot.data(arr).draw(index);
}



function request(){
    interval2 = new IntervalTimer(function () {
        if ((timestep<maxtimestep)&&!isBusy){
            RangechangeVal(timestep);
            step(timestep);
            isBusy = true
            timestep++;
            // CircleMapplot.getTop10();
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
    CircleMapplot.remove();
    CircleMapplot.reset(true);
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
    CircleMapplot.pause();
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
    CircleMapplot.displaystyle(RadarMapopt.display)
    changeGroup_mode(d)
}


function changeQuantile(d){
    let old = CircleMapplot.radaropt().summary;
    old.quantile = d.checked;
    CircleMapplot.radaropt({summary: old}).draw();

}
function changeMean(d){
    let old = CircleMapplot.radaropt().summary;
    old.mean = d.checked;
    CircleMapplot.radaropt({summary: old}).draw();
}

function changeFitscreen(d){
    // CircleMapplot.fitscreen(d.checked);
}

function changeTimeunit(d){
    if (d.checked) {
        listopt.time.unit = "Minute";
        listopt.time.rate = 10;
    }else {
        listopt.time.unit = "Hour";
        listopt.time.rate = 1;
    }
    let formatTime =getformattime (listopt.time.rate,listopt.time.unit);
    listopt.limitTime = d3.extent(dataRaw,d=>d.time);

    CircleMapplot.rowMap(dataRaw.location).schema(serviceFullList).timeFormat(formatTime);
    handleOutlier (data,currentService);
}

function changeGroup_mode(d){
    if (d.checked) {
        RadarMapopt.group_mode ="jLouvain";
    }else {
        RadarMapopt.group_mode ="outlier";
    }
    CircleMapplot.group_mode(RadarMapopt.group_mode);
    resetRequest();
}

function pausechange(){
    var e = d3.select('.pause').node();
    if (interval2) interval2.resume();
    CircleMapplot.resume();
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
    arr.users = data.users;
    arr.regions = data.regions;
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

    CircleMapplot.dataIcon(data);
}
function handleOutlier (data){ // nest data
    data.sort((a,b)=>(dataRaw.location[a.key])-(dataRaw.location[b.key]));
    // if (serviceid===-1)
    //     listopt.limitColums =[0,dataRaw.TimeMatch.length];

    data.forEach(loc=>loc.values.forEach(t=> {
        t.arr = objecttoArrayRadar(t.value||t.values) ;
        t.arr.time = new Date(t.key);
        t.arr.density = (t.value||t.values).num;
        t.arr.users = (t.value||t.values).users;
        t.arr.regions = (t.value||t.values).regions;
        t.arr.loc = loc.key;
        t.arr.id = fixstr(loc.key+'_'+(+t.arr.time));
    }));

    CircleMapplot.data(data).draw();
}

let schema;
let globalScale = d3.scaleLinear().range([0,1]);
function objecttoArrayRadar(o){
    return {value: globalScale(o.val),
        minval: globalScale(o.minval),
        maxval: globalScale(o.maxval),
        q1: globalScale(o.q1),
        q3: globalScale(o.q3)};
}
// list html
let tempStore ={};
let colorLegend_array = colorScaleList['Oranges'];
let colorLegend = d3.scaleLinear().domain([0,1]).interpolate(d3.interpolateHsl).range(colorLegend_array);
function onmouseoverRadar ([d,list]) {
    // d.messagearr.forEach(e=>e.htmlMessage = markWord(e.message,list.filter(l=>l.group!='location (of the message)')));
    // d.messagearr.forEach(e=>e.htmlUser = markWord(e.account,list.filter(f=>f.group==='user')));
    // d.messagearr.forEach(e=>e.htmlLocation = markWord(e.location,list.filter(f=>f.group==='location (of the message)')));
    let nestmap = d3.nest().key(e=>e.location).rollup(e=>e.length).entries(d.messagearr).filter(e=>e.key!=="<Location with-held due to contract>");
    // d3.selectAll('.geoPath:not(#'+_.unique(d.messagearr.map(e=>removeWhitespace(e.location))).join('):not(#')+')').classed('nothover',true).style('fill',colorLegend(0)).each(d=>d.density = 0);
    const step_val  = Math.max(30,d3.max(nestmap,e=>e.value))/colorLegend_array.length;
    colorLegend.domain(d3.range(0,colorLegend_array.length).map((d,i)=>i*step_val));
    // colormap(colorLegend);
    // nestmap.forEach(e=> d3.selectAll('.geoPath#'+removeWhitespace(e.key)).style('fill',colorLegend(e.value)).each(f=>f.density = e.value));
    updateTable (d.messagearr,list);
}

function onEnableCar (darr){
    // d3.select('#map g#regMap').select('.mobileSensor').remove();
    let cm = d3.select('#map g#regMap')
        .selectAll('.mobileSensor')
        .data([darr]);
    cm.exit().remove();
    cm.enter()
        .append("path")
        .attr("class", "mobileSensor")
        .attr("fill", 'none')
        .attr("stroke", 'black')
        .attr("stroke-width", 3)
        .attr('marker-end','url(#head)')
        .merge(cm)
        .style('opacity',1)
        .attr('d',d3.line()
            .x(function(d) { return projectionFunc([d.Long, d.Lat])[0]; })
            .y(function(d) { return projectionFunc([d.Long, d.Lat])[1]; }));
}

function animationShift(index,g){
    let instance = d3.active(g)
        .attr("transform", d => {
            return "translate(" + projectionFunc([d.Long, d.Lat]) + ")";
        });
    if (d3.select(g).datum()[index+1])
        instance.transition()
            .on('start',function(){animationShift(index+1,g);});
}

function onmouseleaveRadar (d) {
    // d3.select('#map g#regMap').selectAll('.mobileSensor').style('opacity',0);
    // d3.selectAll('.geoPath:not(#'+_.unique(d.messagearr.map(e=>removeWhitespace(e.location))).join('):not(#')+')').classed('nothover',false);
    // if (d.regions&&d.regions.length)
    //     d3.selectAll('.geoPath:not(#'+d.regions.map(e=>removeWhitespace(e)).join('):not(#')+')').classed('nothover',false);
    // d3.selectAll(".linkLineg:not(.disable)").filter(e=> (e.loc !==d.loc)&&(formatTime(e.time).toString() !==formatTime(d.time).toString())).style('opacity',1);
    // d3.selectAll('.statIcon').filter(e=>e['Sensor-id']===d.loc.replace('s','')).attr('width',10).attr('height',10);
    // tool_tip.hide();
}

function lineGraph(div,data,options){
    var opt = {
        w: 300,				//Width of the circle
        h: 100,				//Height of the circle
        margin: {top: 10, right: 0, bottom: 20, left: 50}, //The margins of the SVG
        levels: 3,				//How many levels or inner circles should there be drawn
        maxValue: 1, 			//What is the value that the biggest circle will represent
        minValue: 0, 			//What is the value that the biggest circle will represent
        labelFactor: 1.15, 	//How much farther than the radius of the outer circle should the labels be placed
        wrapWidth: 60, 		//The number of pixels after which a label needs to be given a new line
        opacityArea: 0.35, 	//The opacity of the area of the blob
        dotRadius: 4, 			//The size of the colored circles of each blog
        opacityCircles: 0.1, 	//The opacity of the circles of each blob
        strokeWidth: 1, 		//The width of the stroke around each blob
        roundStrokes: true,	//If true the area and stroke will follow a round path (cardinal-closed)
        isNormalize: true,
        mini:false, //mini mode
        schema: undefined,
        color: function(){return 'black'},	//Color function
        arrColor: ["#110066", "#4400ff", "#00cccc", "#00dd00", "#ffcc44", "#ff0000", "#660000"],
    };

    if('undefined' !== typeof options){
        for(var i in options){
            if('undefined' !== typeof options[i]){ opt[i] = options[i]; }
        }//for i
    }//if

    let g;
    let svg = d3.select(div).select('svg');
    if (svg.empty()) {
        svg = d3.select(div).append('svg')
            .attr('width',opt.w)
            .attr('height',opt.h);
        g = svg.append('g').attr('class','tipg').attr('transform','translate('+opt.margin.left+','+opt.margin.top+')');
        // 3. Call the x axis in a group tag
        g.append("g")
            .attr("class", "x axis");

        // 4. Call the y axis in a group tag
        g.append("g")
            .attr("class", "y axis");
    }else{
        g = svg.select('g.tipg');
    }
    var width = opt.w-opt.margin.left-opt.margin.right;
    var height = opt.h-opt.margin.top-opt.margin.bottom;
    // 5. X scale will use the index of our data
    var xScale = d3.scaleTime()
        .domain(d3.extent(data,d=>d.time)) // input
        .range([0, width]); // output

// 6. Y scale will use the randomly generate number
    var yScale = d3.scaleLinear()
        .domain(d3.extent(data,d=>d.Value)) // input
        .range([height, 0]); // output

// 7. d3's line generator
    var line = d3.line()
        .x(function(d) { return xScale(d.time); }) // set the x values for the line generator
        .y(function(d) { return yScale(d.Value); }) // set the y values for the line generator
        .curve(d3.curveMonotoneX) // apply smoothing to the line

    // 3. Call the x axis in a group tag
    g.select("g.x.axis")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(xScale)); // Create an axis component with d3.axisBottom

// 4. Call the y axis in a group tag
    g.select("g.y.axis")
        .call(d3.axisLeft(yScale).ticks(5)); // Create an axis component with d3.axisLeft

// 9. Append the path, bind the data, and call the line generator
    let pathg = g.select("path.line");
    if (pathg.empty())
        pathg = g.append('path').attr("class", "line");
    pathg.datum(data) // 10. Binds data to the line
        .attr("d", line)
        .style('stroke','black')
        .style('stroke-width',1)
        .style('fill','none')
    ; // 11. Calls the line generator

// 12. Appends a circle for each datapoint
    let dot = g.selectAll(".dot").data(data);
    dot.exit().remove();
    dot.enter().append("circle") // Uses the enter().append() method
        .attr("class", "dot") // Assign a class for styling
        .merge(dot)
        .attr("cx", function(d, i) { return xScale(d.time) })
        .attr("cy", function(d) { return yScale(d.Value) })
        .attr("r", 2)

}
// // calculate location
// if (tempStore.loc!==d.loc) {
//     readMobileData(d.loc).then(data =>{
//         tempStore.loc = d.loc;
//         tempStore.data=data;
//         tempStore.nest = d3.nest().key(e=>formatTime(e.time)).rollup(t=>_.unique(t.map(e=>geocoder([e.Long,e.Lat]))).filter(d=>d).map(e=>e.properties.Nbrhood)).object(data);
//         dataRaw.filter(e=>e["Sensor-id"]===d.loc).forEach(e=>e.regions = tempStore.nest[formatTime(e.time)+''].slice());
//         console.log('done')
//     });
// }

function enableIframe(){
    $('#iframeResult').addClass('active');
    $('#demo').removeClass('active');
}

function disableIframe(){
    $('#iframeResult').removeClass('active');
    $('#demo').addClass('active');
}


function areaChart(div,data,options){
    var opt = {
        w: 300,				//Width of the circle
        h: 100,				//Height of the circle
        margin: {top: 10, right: 0, bottom: 20, left: 50}, //The margins of the SVG
        levels: 3,				//How many levels or inner circles should there be drawn
        maxValue: 1, 			//What is the value that the biggest circle will represent
        minValue: 0, 			//What is the value that the biggest circle will represent
        labelFactor: 1.15, 	//How much farther than the radius of the outer circle should the labels be placed
        wrapWidth: 60, 		//The number of pixels after which a label needs to be given a new line
        opacityArea: 0.35, 	//The opacity of the area of the blob
        dotRadius: 4, 			//The size of the colored circles of each blog
        opacityCircles: 0.1, 	//The opacity of the circles of each blob
        strokeWidth: 1, 		//The width of the stroke around each blob
        roundStrokes: true,	//If true the area and stroke will follow a round path (cardinal-closed)
        isNormalize: true,
        mini:false, //mini mode
        schema: undefined,
        color: function(){return 'black'},	//Color function
        arrColor: ["#110066", "#4400ff", "#00cccc", "#00dd00", "#ffcc44", "#ff0000", "#660000"],
    };

    if('undefined' !== typeof options){
        for(var i in options){
            if('undefined' !== typeof options[i]){ opt[i] = options[i]; }
        }//for i
    }//if

    let g;
    let svg = d3.select(div).select('svg');
    if (svg.empty()) {
        svg = d3.select(div).append('svg')
            .attr('width',opt.w)
            .attr('height',opt.h);
        g = svg.append('g').attr('class','tipg').attr('transform','translate('+opt.margin.left+','+opt.margin.top+')');
        // 3. Call the x axis in a group tag
        g.append("g")
            .attr("class", "x axis");

        // 4. Call the y axis in a group tag
        g.append("g")
            .attr("class", "y axis");
    }else{
        g = svg.select('g.tipg');
    }
    var width = opt.w-opt.margin.left-opt.margin.right;
    var height = opt.h-opt.margin.top-opt.margin.bottom;
    // 5. X scale will use the index of our data
    var xScale = d3.scaleTime()
        .domain(d3.extent(data,d=>d.time)) // input
        .range([0, width]); // output

// 6. Y scale will use the randomly generate number
    var yScale = d3.scaleLinear()
        .domain(d3.extent(data,d=>d.value)) // input
        .range([height, 0]); // output

// 7. d3's line generator
    var area = d3.area()
        .curve(d3.curveMonotoneX)
        .x(function(d) { return xScale(d.time); })
        .y0(height)
        .y1(function(d) { return yScale(d.value); });

    var brush = d3.brushX()
        .extent([[0, 0], [width, height]])
        .on("brush end", brushed);
    // 3. Call the x axis in a group tag
    g.select("g.x.axis")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(xScale)); // Create an axis component with d3.axisBottom

// 4. Call the y axis in a group tag
    g.select("g.y.axis")
        .call(d3.axisLeft(yScale).ticks(5)); // Create an axis component with d3.axisLeft

// 9. Append the path, bind the data, and call the line generator
    let pathg = g.select("path.line");
    if (pathg.empty()) {
        pathg = g.append('path').attr("class", "line");
    }
    pathg.datum(data) // 10. Binds data to the line
        .attr("d", area)
        .style('fill',opt.color)
    ; // 11. Calls the line generator

// 12. Appends a circle for each datapoint
    let dot = g.selectAll(".dot").data(data);
    dot.exit().remove();
    dot.enter().append("circle") // Uses the enter().append() method
        .attr("class", "dot") // Assign a class for styling
        .merge(dot)
        .attr("cx", function(d, i) { return xScale(d.time) })
        .attr("cy", function(d) { return yScale(d.Value) })
        .attr("r", 2)

}
