function outlier(){
    let dataSpider3 = [];
    scaleService = serviceFullList.map(d=>d3.scaleLinear().domain(d.range));
    for (var i = 0; i < sampleS.timespan.length; i++) {
        for (var h = 0; h < hosts.length; h++) {
            var name = hosts[h].name;
            arrServices = tsnedata[name][i];
            arrServices.nameid = h;
            dataSpider3.push(arrServices);
        }
    }
    let estimateSize = Math.max(2, Math.pow(8, 1 / dataSpider3[0].length));
    let scagOptions ={
        isNormalized: true,
        startBinGridSize: estimateSize,
        minBins: 20,
        maxBins: 100,
        outlyingCoefficient: 1.5,
        incrementA:2,
        incrementB:0,
        decrementA:0.3,
        decrementB:0,
    };
    // scag = scagnosticsnd(handledata(index), scagOptions);
    let outlyingPoints = {};
    // remove outlying
    let scag = scagnosticsnd(dataSpider3.map((d, i) => {
        var dd = d.slice();
        dd.data = {name: d.name, nameid: d.nameid, timestep: d.timestep};
        return dd;
    }), scagOptions);

    console.log('Outlying detect: bin=' + scag.bins.length);
    console.log(scag.outlyingPoints.map(d => d.data));
    dataSpider3.forEach(d => {
        let temp2 = scag.outlyingPoints.filter(e => e.data.nameid === d.nameid && e.data.timestep === d.timestep );
        if (temp2.length) {
            let temp = {labels: d.name+'_'+d.timestep};
            d.forEach((s, i) => temp[serviceFullList[i].text] = scaleService[i](s));
            temp.index = -1;
            temp.__metrics = serviceFullList.map((s,si)=>({axis:s.text, value: d[si]}));
            temp.__metrics.normalize = d.slice();
            outlyingPoints[temp.labels] = temp;
            d.outlier = temp.index;
            d.cluster = -1;
        }else{
            d.outlier = 0;
            delete d.cluster
        }
    });
    return outlyingPoints;
}