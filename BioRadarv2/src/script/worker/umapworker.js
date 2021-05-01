let window = self
importScripts("../../lib/d3.v4.js");
importScripts("../../lib/umap-js.js");
importScripts("../../lib/lodash.min.js");
importScripts("https://unpkg.com/simple-statistics@2.2.0/dist/simple-statistics.min.js");

let canvasopt,totalTime_marker,dataIn,count,timeCalculation;
let umap,nEpochs,t0;
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
            t0 = performance.now();


            umap = new UMAP(data.opt);
            if (data.opt.supervisor)
                umap.setSupervisedProjection(labels);
            console.log('---init data UMAP-----')
            nEpochs = umap.initializeFit(dataIn);
            console.log('---initializeFit-----',performance.now()-totalTime_marker);
            nEpochs = Math.min(nEpochs,1000)
            for (let i = 0; i < nEpochs; i++) {
                // for (let i = 0; i < (data.opt.nEpochs|| nEpochs); i++) {
                count++;
                t0 = performance.now();
                umap.step();
                timeCalculation = performance.now()-t0;
                // if(timeCalculation>1000/30)
                //     render(umap.getEmbedding());
                if (i % 5 === 0)render(umap.getEmbedding());
            }

            // // Running without render
            // t0 = performance.now();
            // umap.fit(dataIn)
            // timeCalculation = performance.now()-t0;
            render(umap.getEmbedding(),true);


            break;
        case "initPartofData":
            totalTime_marker = performance.now();
            dataIn = data.value;
            leaderIndex = data.leaderIndex;
            labels = data.labels;
            count = 0;
            data.opt.nComponents = data.opt.dim;
            t0 = performance.now();
            let testingData = [];
            let traningData = dataIn.filter((d,i)=>{
                if (d.timestep===0)
                    return true;
                testingData.push(d);
                return false;
            });
            // data.opt.transformQueueSize = traningData.length;

            umap = new UMAP(data.opt);
            umap.setSupervisedProjection(labels);
            console.log('---init data UMAP-----')
            nEpochs = umap.initializeFit(traningData);
            console.log('---initializeFit-----',performance.now()-totalTime_marker);
            nEpochs = Math.min(nEpochs,1000);
            for (let i = 0; i < nEpochs; i++) {
                // for (let i = 0; i < (data.opt.nEpochs|| nEpochs); i++) {
                count++;
                t0 = performance.now();
                umap.step();
                timeCalculation = performance.now()-t0;
                // if(timeCalculation>1000/30) {
                    render(umap.getEmbedding());
                // }
            }
            let embeded = _.cloneDeep(umap.getEmbedding());
            render( _.concat(embeded,umap.transform(testingData)),true );


            break;
        case "initLeader":
            totalTime_marker = performance.now();
            dataIn = data.value;
            leaderIndex = data.leaderIndex;
            labels = data.labels;
            count = 0;
            data.opt.nComponents = data.opt.dim;
            t0 = performance.now();

            let leaderIn = dataIn.filter((d,i)=>leaderIndex.indexOf(i))
            // data leader

            umap = new UMAP(data.opt);
            console.log('---init data UMAP-----')
            nEpochs = umap.initializeFit(dataIn);
            console.log('---initializeFit-----',performance.now()-totalTime_marker);
            nEpochs = Math.min(nEpochs,1000);
            for (let i = 0; i < nEpochs; i++) {
                // for (let i = 0; i < (data.opt.nEpochs|| nEpochs); i++) {
                count++;
                t0 = performance.now();
                umap.step();
                timeCalculation = performance.now()-t0;
                if(timeCalculation>1000/30)
                    render(umap.getEmbedding(),true);
            }
            //
            render(umap.transform(dataIn) );
            postMessage({action:'stable', status:"done"});
            break;
    }
});

function render(sol,isEnd,isleader){
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
    postMessage({action:isEnd?'stable':(isleader?'renderLeader':'render'),value:{iteration: count,time: timeCalculation,totalTime:performance.now()-totalTime_marker},xscale:{domain:xscale.domain()}, yscale:{domain:yscale.domain()}, sol:sol});
    // solution = sol;
}

