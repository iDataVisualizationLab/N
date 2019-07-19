let sensorlist = [9,10,13,21,22,24,25,27,28,29,32,45];
let  TimeLineopt  = {
    margin: {top: 10, right: 50, bottom: 50, left: 120},
    offset: {top: 0},
    width: 0,
    height: 0,
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
};
let TimeLine  = d3.eventTimeLine();

/* Code below relevant for annotations */
let annotations = [
    {
        className: "gap",
        note: {
            title: "Major Earthquake",
            lineType: "none",
            align: "middle",
            wrap: 150 //custom text wrapping
        },
        type: d3.annotationCalloutRect,
        disable: ["connector"], // doesn't draw the connector
        data: { x1: 'Wed Apr 08 2020 08:00:00 GMT-0500', x2:'Wed Apr 08 2020 12:00:00 GMT-0500'}
    },{
        className: "gap",
        note: {
            title: "1st Earthquake",
            lineType: "none",
            align: "middle",
            wrap: 150 //custom text wrapping
        },
        type: d3.annotationCalloutRect,
        disable: ["connector"], // doesn't draw the connector
        data: { x1: 'Wed Apr 06 2020 14:00:00 GMT-0500', x2:'Wed Apr 06 2020 18:00:00 GMT-0500'}
    },{
        className: "gap",
        note: {
            title: "3rd Earth quake",
            lineType: "none",
            align: "middle",
            wrap: 150 //custom text wrapping
        },
        type: d3.annotationCalloutRect,
        disable: ["connector"], // doesn't draw the connector
        data: { x1: 'Wed Apr 09 2020 15:00:00 GMT-0500', x2:'Wed Apr 09 2020 23:00:00 GMT-0500'}
    },
    // {
    //     note: { label: "Above $100", wrap: 100, },
    //     className: "above",
    //     disable: ["connector"],
    //     subject: {
    //         x1: x( new Date('10/1/1999')),
    //         x2: x( new Date('8/1/2000'))
    //     },
    //     x: x( new Date('10/1/1999')),
    //     dx: -30,
    //     data: { y: 100}
    // }

];
function initTimeLine () {
    TimeLineopt.width = width;
    TimeLineopt.height = height;
    TimeLineopt.svg = d3.select('#RadarMapcontent').attr("class", "T_sneSvg");
    TimeLineopt.svg.call(tool_tip);
    TimeLine.graphicopt(TimeLineopt);
    TimeLine.svg(TimeLineopt.svg).init();

}

function onmouseovermap(d){

}

function onmouseoutmap(d){

}