importScripts("../../lib/d3.v4.js");
importScripts("../../lib/PCA.js");
importScripts("../../lib/underscore-min.js");
importScripts("../../lib/simple-statistics.min.js");

let canvasopt,totalTime_marker,dataIn;
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

            // pca - compute cluster position
            let pca = new PCA();
            // console.log(brand_names);
            let matrix = pca.scale(dataIn, true, true);

            let pc = pca.pca(matrix, data.opt.dim);

            let A = pc[0];  // this is the U matrix from SVD
            let B = pc[1];  // this is the dV matrix from SVD
            let chosenPC = pc[2];   // this is the most value of PCA
            console.log('----------------------------',data.opt.dim)
            console.log(A[0])
            let solution = dataIn.map((d,i)=>d3.range(0,data.opt.dim).map(dim=>A[i][chosenPC[dim]]));

            const axis=[];
            data.feature.map(function (key, i) {
                let brand = d3.range(0,data.opt.dim).map(dim=>B[i][chosenPC[dim]]);
                axis.push({x1:0,y1:0,z1:0,x2:brand[0],y2:brand[1],z2:brand[2]??0,name:key.text,scale:10})
            });
            render(solution,axis,data.opt.dim);
            postMessage({action:'stable',axis, status:"done"});
            break;
    }
});

function render(sol,axis,dim){
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
    // xaxis
    if (dim<3){
        axis.push({x1:xrange[0],y1:yrange[0],z1:0,x2: xrange[1],y2:yrange[0],z2:0,name:'PC1',scale:1});
        axis.push({x1:xrange[0],y1:yrange[0],z1:0,x2: xrange[0],y2:yrange[1],z2:0,name:'PC2',scale:1});
    }else{
        axis.push({x1:0,y1:0,z1:0,x2: (xrange[1]-xrange[0])/2,y2:0,z2:0,name:'PC1',scale:1});
        axis.push({x1:0,y1:0,z1:0,x2: 0,y2:(xrange[1]-xrange[0])/2,z2:0,name:'PC2',scale:1});
        axis.push({x1:0,y1:0,z1:0,x2: 0,y2:0,z2:(xrange[1]-xrange[0])/2,name:'PC3',scale:1});
    }
    postMessage({action:'render',value:{totalTime:performance.now()-totalTime_marker},xscale:{domain:xscale.domain()}, yscale:{domain:yscale.domain()}, sol:sol});
    solution = sol;
}
