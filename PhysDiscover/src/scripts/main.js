let widthSvg = 800;
let heightSvg = 600;




let mainsvg = d3.select("content");
let data = [];

mainsvg.attrs({
    width: widthSvg,
    height: heightSvg,
});

let maing = mainsvg. append('g');

init();

function init(){
    data = object2Data(readData());
    console.log(data);
}