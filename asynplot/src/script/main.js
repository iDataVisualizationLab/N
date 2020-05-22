
let container="#vis";
$(document).ready(function(){
    // canvasContainer.addEventListener('measure', ({ detail }) => {
        if (worker == null) {
            // worker = new Worker(`src/worker/canvas.js#${Number(location.search.substring(1))}`);
            worker = new Worker(`src/script/worker/chart.js`);
            worker.addEventListener('message', ({ data }) => {
                if (_.isArray(data)) {
                    d3.select('#variableChoice').data(data).join('option').attr('value',d=>d.text).text(d=>d.text)
                }else if (!_.isObject(data)) {
                    // document.querySelector('#loading>p').innerText = data;
                } else {

                    view = new vega.View(data.spec, {
                        renderer:  'canvas',  // renderer (canvas or svg)
                        container: container,   // parent DOM container
                        hover:     true       // enable hover processing
                    });
                    // document.querySelector('#loading').style.display = 'none';
                    worker.terminate();
                    view.runAsync();
                }
            });
        }
        // const { width, height } = detail;
        // worker.postMessage({ width, height });
    // });
});

function renderPlotLine(){

}