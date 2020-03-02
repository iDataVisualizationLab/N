let window = self
importScripts("../../lib/d3.v4.js");
importScripts("../../lib/umap-js.js");
importScripts("../../lib/underscore-min.js");
importScripts("https://unpkg.com/simple-statistics@2.2.0/dist/simple-statistics.min.js");

let canvasopt,totalTime_marker,dataIn,count,timeCalculation;
addEventListener('message',function ({data}){
    switch (data.action) {
        case "initcanvas":
            // canvas = data.canvas;
            canvasopt = data.canvasopt;
            // gl = canvas.getContext("2d");
            break;

        case "initDataRaw":
            totalTime_marker = performance.now();
            dataIn = data.value;
            labels = data.labels;
            count = 0;
            data.opt.nComponents = data.opt.dim;
            let t0 = performance.now();
            d3.json(`../../../data/processed_gene_data_normalized_category_umap_${data.opt.nNeighbors}_${data.opt.nComponents}_${data.opt.minDist}.json`,function(error,projection){
                if (error){
                    const umap = new UMAP(data.opt);
                    umap.setSupervisedProjection(labels);
                    console.log('---init data UMAP-----')
                    let nEpochs = umap.initializeFit(dataIn);
                    console.log('---initializeFit-----',performance.now()-totalTime_marker);
                    nEpochs = Math.min(nEpochs,1000)
                    for (let i = 0; i < nEpochs; i++) {
                        // for (let i = 0; i < (data.opt.nEpochs|| nEpochs); i++) {
                        count++;
                        t0 = performance.now();
                        umap.step();
                        timeCalculation = performance.now()-t0;
                        if (i % 5 === 0)render(umap.getEmbedding());
                    }
                    render(umap.getEmbedding());
                    postMessage({action:'stable', status:"done"});
                }else{
                    timeCalculation = performance.now()-t0;
                    render(projection);
                    postMessage({action:'stable', status:"done"});
                }
            })

            break;

        case "transform":
            const transformed = umap.transform(additionalData);
    }
});

function render(sol){
    let xrange = d3.extent(sol, d => d[0]);
    let yrange = d3.extent(sol, d => d[1]);
    let xscale = d3.scaleLinear().range([0, canvasopt.width]);
    let yscale = d3.scaleLinear().range([0, canvasopt.height]);
    const ratio = canvasopt.height / canvasopt.width;
    if ((yrange[1] - yrange[0]) / (xrange[1] - xrange[0]) > canvasopt.height / canvasopt.width) {
        yscale.domain(yrange);
        let delta = ((yrange[1] - yrange[0]) / ratio - (xrange[1] - xrange[0])) / 2;
        xscale.domain([xrange[0] - delta, xrange[1] + delta])
    } else {
        xscale.domain(xrange);
        let delta = ((xrange[1] - xrange[0]) * ratio - (yrange[1] - yrange[0])) / 2;
        yscale.domain([yrange[0] - delta, yrange[1] + delta])
    }
    postMessage({action:'render',value:{iteration: count,time: timeCalculation,totalTime:performance.now()-totalTime_marker},xscale:{domain:xscale.domain()}, yscale:{domain:yscale.domain()}, sol:sol});
    solution = sol;
}