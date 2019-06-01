let root = document.documentElement;
// read data
function readData(choice) {
    return d3.json("src/data/" + choice + ".json", function (error, data) {
        if (error) throw error;
        return data;
    });
}

// d3

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
    if (this.value==="light"){
        this.value = "dark";
        this.text = "Light";
        d3.select('body').classed('light',false);
        return;
    }
    this.value = "light";
    this.text = "Dark";
    d3.select('body').classed('light',true);
    return
}

function creatContain(contain,colorScaleList,colorArr,callback){
    const  n = colorScaleList.n;
    const ul = contain.append('ul').style('width','100%');
    const colorListitems = ul.selectAll('li').data(colorArr)
        .enter().append('li')
        .attr('class','colorScale div');
    colorListitems.append('div')
        .attr('class','colorscale-label')
        .text(d=>d.label)
    const colorpalette = colorListitems.append('div')
        .attr('class','colorscale-palette-container')
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
// var sheet = document.createElement('style'),
//     $rangeInput = $('.rangecustom input'),
//     prefs = ['webkit-slider-runnable-track', 'moz-range-track', 'ms-track'];
//
// document.body.appendChild(sheet);
//
// var getTrackStyle = function (el) {
//     var curVal = el.value,
//         style = '';
//     const number_item =$('.range-labels li').length
//     const widthl = $('.range-labels').width();
//     const val = (curVal)/number_item*100;
//     // Set active label
//     $('.range-labels li').removeClass('active selected');
//
//     var curLabel = $('.range-labels').find('li:nth-child(' + curVal + ')');
//
//     curLabel.addClass('active selected');
//     curLabel.prevAll().addClass('selected');
//
//     // Change background gradient
//     for (var i = 0; i < prefs.length; i++) {
//         style += '.range {background: linear-gradient(to right, #37adbf 0%, #37adbf ' + val + '%, #fff ' + val + '%, #fff 100%)}';
//         style += '.range input::-' + prefs[i] + '{background: linear-gradient(to right, #37adbf 0%, #37adbf ' + val + '%, #b2b2b2 ' + val + '%, #b2b2b2 100%)}';
//     }
//
//     return style;
// }
//
// // $rangeInput.on('input', function () {
// //     sheet.textContent = getTrackStyle(this);
// // });
//
// // Change input value on label click
// $('.range-labels li').on('click', function () {
//     var index = $(this).index();
//
//     $rangeInput.val(index + 1).trigger('input');
//
// });