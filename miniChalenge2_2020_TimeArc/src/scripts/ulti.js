let root = document.documentElement;
// read data
// function readData(choice,type) {
//     type = type||"json";
//     return d3[type]("src/data/" + choice + "."+type, function (data) {
//         data.time = new Date(data.Timestamp);
//         delete data.Timestamp;
//         _.without(Object.keys(data),'time',' User-id','User-id','Units','Sensor-id').forEach(k=>data[k] = (data[k]==="")?undefined:(+data[k]));
//         return data;
//     });
// }
function readMobileData(choice) {
    return d3.csv("src/data/mobileSensor/m" + choice + ".csv", function (data) {
        data.time = new Date(data.time);
        _.without(Object.keys(data),'4','5','6','time',' User-id','User-id','Units','Sensor-id','regions').forEach(k=>data[k] = (data[k]==="")?undefined:(+data[k]));
        return data;
    });
}

function readDatacsv(choice,type) {
    type = type||"json";
    return d3[type]("src/data/" + choice + "."+type);
}
function readData(choice) {
    return d3.csv("src/data/" + choice + ".csv", function (t) {
        t.date = new Date(t.time);
        t.category = {};
        catergogryList.forEach(c => {
            let temp = c.value.extractFunc(t);
            if (!_.isEmpty(temp))
                t.category[c.key] = c.value.extractFunc(t);
        });
        return t;
    });
}
function readConf(choice) {
    return d3.json("src/data/" + choice + ".json", function (data) {
        return data;
    });
}
// d3
function fixstr(s) {
    return 'a'+s.replace(/ |-|#/gi,''); // avoid number
}

function removeWhitespace(str) {
    return str.replace(/\s+|>|</g, '');
}

function getTransformation(transform) {
    // Create a dummy g for calculation purposes only. This will never
    // be appended to the DOM and will be discarded once this function
    // returns.
    var g = document.createElementNS("http://www.w3.org/2000/svg", "g");

    // Set the transform attribute to the provided string value.
    g.setAttributeNS(null, "transform", transform);

    // consolidate the SVGTransformList containing all transformations
    // to a single SVGTransform of type SVG_TRANSFORM_MATRIX and get
    // its SVGMatrix.
    var matrix = g.transform.baseVal.consolidate().matrix;

    // Below calculations are taken and adapted from the private function
    // transform/decompose.js of D3's module d3-interpolate.
    var {a, b, c, d, e, f} = matrix;   // ES6, if this doesn't work, use below assignment
    // var a=matrix.a, b=matrix.b, c=matrix.c, d=matrix.d, e=matrix.e, f=matrix.f; // ES5
    var scaleX, scaleY, skewX;
    if (scaleX = Math.sqrt(a * a + b * b)) a /= scaleX, b /= scaleX;
    if (skewX = a * c + b * d) c -= a * skewX, d -= b * skewX;
    if (scaleY = Math.sqrt(c * c + d * d)) c /= scaleY, d /= scaleY, skewX /= scaleY;
    if (a * d < b * c) a = -a, b = -b, skewX = -skewX, scaleX = -scaleX;
    return {
        translateX: e,
        translateY: f,
        rotate: Math.atan2(b, a) * 180 / Math.PI,
        skewX: Math.atan(skewX) * 180 / Math.PI,
        scaleX: scaleX,
        scaleY: scaleY
    };
}

// ui part


function openNav() {
    d3.select("#mySidenav").classed("sideIn",true);
    d3.select("#Maincontent").classed("sideIn",true);
    // _.delay(resetSize, 500);
}

function closeNav() {
    d3.select("#mySidenav").classed("sideIn",false);
    d3.select("#Maincontent").classed("sideIn",false);
    // _.delay(resetSize, 500);
}

function switchTheme(){
    if (this.getAttribute('value')==="light"){
        this.setAttribute('value', "dark");
        this.text = "Light";
        d3.select('body').classed('light',false);
        return;
    }
    this.setAttribute('value',"light");
    this.text = "Dark";
    d3.select('body').classed('light',true);
    return
}

function creatContain(contain,colorScaleList,colorArr,callback){
    const  n = colorScaleList.n;
    const ul = contain.append('ul').style('width','100%');
    const colorListitems = ul.selectAll('li').data(colorArr)
        .enter().append('li')
        .attr('class','colorScale div row s12 valign-wrapper');
    colorListitems.append('div')
        .attr('class','col s4 colorscale-label')
        // .attr('class','colorscale-label')
        .text(d=>d.label)
    const colorpalette = colorListitems.append('div')
        .attr('class','col s7 colorscale-palette-container')
        // .attr('class','colorscale-palette-container')
        .append('div')
        .attr('class','colorscale-block')
        .on('click',callback)
        .call(createColorbox);

}
function createColorbox(g) {
    const boxs = g.selectAll('div.colorscale-swatch').data(function(d)
    {
        const name = d.val;
        let colors;
        if (d.type==='d3') {
            colors = colorScaleList.d3colorChosefunc(name)
        }else{
            colors = colorScaleList[name];
        }

        if (d.invert)
            colors = colors.reverse();
        (this.parentNode.__data__||this.__data__).arrColor = colors;
        return colors;
    });
    boxs.exit().remove();
    boxs.enter().append('div')
        .attr('class','colorscale-swatch')
        .merge(boxs)
        .styles(function (d,i){
            const n = (this.parentNode.__data__||this.__data__).arrColor.length;
            return {
                'background-color': d,
                'width': `${(1/n)*100}%`
            }})
}


function createGradient(rg,limitcolor,arrColor) {
    rg.selectAll('stop').remove();
    const legntharrColor = arrColor.length - 1;
    rg.append("stop")
        .attr("offset", "0%")
        .attr("stop-opacity", 0.3);
    rg.append("stop")
        .attr("offset", (limitcolor - 1) / legntharrColor * 100 + "%")
        .attr("stop-color", arrColor[limitcolor])
        .attr("stop-opacity", 0.3);
    arrColor.forEach((d, i) => {
        if (i > (limitcolor - 1)) {
            rg.append("stop")
                .attr("offset", i / legntharrColor * 100 + "%")
                .attr("stop-color", d)
                .attr("stop-opacity", i / legntharrColor);
            if (i != legntharrColor)
                rg.append("stop")
                    .attr("offset", (i + 1) / legntharrColor * 100 + "%")
                    .attr("stop-color", arrColor[i + 1])
                    .attr("stop-opacity", i / legntharrColor);
        }
    });
}
function UpdateGradient(svg) { // using global arrcolor
    let rdef = svg.select('defs.gradient');
    let rg,rg2;
    if (rdef.empty()){
        rdef = svg.append("defs").attr('class','gradient')
        rg = rdef
            .append("radialGradient")
            .attr("id", "rGradient");
        rg2 = rdef.append("radialGradient")
            .attr("id", "rGradient2");
    }
    else {
        rg = rdef.select('#rGradient');
        rg2 = rdef.select('#rGradient2');
    }
    createGradient(rg,0,arrColor);
    createGradient(rg2,1,arrColor);
}


function downloadProfile(event){
    $('#savename_profile').val("profile"+d3.timeFormat("%a%d%b_%H%M")(new Date()));
}
function onSaveProfile (){
    var filename = $('#savename_profile').val()+".json";
    var type = "json";
    var str = JSON.stringify(conf);
    var file = new Blob([str], {type: type});
    if (window.navigator.msSaveOrOpenBlob) // IE10+
        window.navigator.msSaveOrOpenBlob(file, filename);
    else { // Others
        var a = document.createElement("a"),
            url = URL.createObjectURL(file);
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        setTimeout(function() {
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
        }, 0);
    }
}
function uploadProfile(){
    $('#profile_input_file').trigger( "click" );
    $('#profile_input_file').on('change', (evt) => {
        var f = evt.target.files[0];
        var reader = new FileReader();
        reader.onload = (function(theFile) {
            return function(e) {
                // Render thumbnail.
                d3.json(e.target.result).then(function (data) {
                        if (data.serviceFullList[0].angle ===undefined)
                            throw "wrong file";
                        conf = data;
                        variablesNames.forEach(d=>{ window[d] = conf[d]});
                        // relink object
                        // serviceFullList = serviceLists2serviceFullList(serviceLists);
                        MetricController.axisSchema(serviceFullList).update();
                })
                // span.innerHTML = ['<img class="thumb" src="', e.target.result,
                //     '" title="', escape(theFile.name), '"/>'].join('');
                // document.getElementById('list').insertBefore(span, null);
            };
        })(f);

        // Read in the image file as a data URL.
        reader.readAsDataURL(f);
    })
}


var formatTimeUlti ={Millisecond : d3.timeFormat(".%L"),
    Second : d3.timeFormat(":%S"),
    Minute : d3.timeFormat("%I:%M"),
    Hour : d3.timeFormat("%I %p"),
    Day : d3.timeFormat("%a %d"),
    Week : d3.timeFormat("%b %d"),
    Month : d3.timeFormat("%B"),
    Year : d3.timeFormat("%Y")};
function multiFormatUnit(date) {
    return (d3.timeSecond(date) < date ? 'Millisecond'
        : d3.timeMinute(date) < date ? 'Second'
            : d3.timeHour(date) < date ? 'Minute'
                : d3.timeDay(date) < date ? 'Hour'
                    : d3.timeMonth(date) < date ? (d3.timeWeek(date) < date ? 'Day' : 'Week')
                        : d3.timeYear(date) < date ? 'Month'
                            : 'Year');
}
function multiFormat(date) {
    return formatTimeUlti[multiFormatUnit(date)](date);
}