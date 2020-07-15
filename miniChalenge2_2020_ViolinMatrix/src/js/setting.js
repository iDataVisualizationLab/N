const filepath = 'data';
const filepath2 = 'data_manualCorrect';
const labelLimit =[]//= ['canadaPencil','rubiksCube','lavenderDie','blueSunglasses','metalKey','pinkEraser','miniCards','rainbowPens','noisemaker']


let graphicopt = {
    margin: {top: 0, right: 50, bottom: 20, left: 100},
    width: window.innerWidth,
    height: window.innerHeight,
    scalezoom: 1,
    zoom: d3.zoom(),
    widthView: function () {
        return this.width * this.scalezoom
    },
    heightView: function () {
        return this.height * this.scalezoom
    },
    widthG: function () {
        return this.widthView() - this.margin.left - this.margin.right
    },
    heightG: function () {
        return this.heightView() - this.margin.top - this.margin.bottom
    }
}
