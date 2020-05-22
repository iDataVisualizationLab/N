

// process data
let serviceFullList= [{"text":"CPU1 Temp","id":0,"enable":true,"idroot":0,"angle":5.585053606381854,"range":[3,98]},{"text":"CPU2 Temp","id":1,"enable":true,"idroot":0,"angle":0,"range":[3,98]},{"text":"Inlet Temp","id":2,"enable":true,"idroot":0,"angle":0.6981317007977318,"range":[3,98]},{"text":"Memory usage","id":0,"enable":true,"idroot":1,"angle":1.5707963267948966,"range":[0,99]},{"text":"Fan1 speed","id":0,"enable":true,"idroot":2,"angle":2.4870941840919194,"range":[1050,17850]},{"text":"Fan2 speed","id":1,"enable":true,"idroot":2,"angle":2.923426497090502,"range":[1050,17850]},{"text":"Fan3 speed","id":2,"enable":true,"idroot":2,"angle":3.3597588100890845,"range":[1050,17850]},{"text":"Fan4 speed","id":3,"enable":true,"idroot":2,"angle":3.796091123087667,"range":[1050,17850]},{"text":"Power consumption","id":0,"enable":true,"idroot":3,"angle":4.71238898038469,"range":[0,200]}]
let serviceLists =[{"text":"Temperature","id":0,"enable":true,"sub":[{"text":"CPU1 Temp","id":0,"enable":true,"idroot":0,"angle":5.585053606381854,"range":[3,98]},{"text":"CPU2 Temp","id":1,"enable":true,"idroot":0,"angle":0,"range":[3,98]},{"text":"Inlet Temp","id":2,"enable":true,"idroot":0,"angle":0.6981317007977318,"range":[3,98]}]},{"text":"Memory_usage","id":1,"enable":true,"sub":[{"text":"Memory usage","id":0,"enable":true,"idroot":1,"angle":1.5707963267948966,"range":[0,99]}]},{"text":"Fans_speed","id":2,"enable":true,"sub":[{"text":"Fan1 speed","id":0,"enable":true,"idroot":2,"angle":2.4870941840919194,"range":[1050,17850]},{"text":"Fan2 speed","id":1,"enable":true,"idroot":2,"angle":2.923426497090502,"range":[1050,17850]},{"text":"Fan3 speed","id":2,"enable":true,"idroot":2,"angle":3.3597588100890845,"range":[1050,17850]},{"text":"Fan4 speed","id":3,"enable":true,"idroot":2,"angle":3.796091123087667,"range":[1050,17850]}]},{"text":"Power_consum","id":3,"enable":true,"sub":[{"text":"Power consumption","id":0,"enable":true,"idroot":3,"angle":4.71238898038469,"range":[0,200]}]}];
let serviceListattr = ["arrTemperature","arrMemory_usage","arrFans_health","arrPower_usage","arrJob_scheduling"];
let selectedService = "Memory usage";

let hostfilter = ["compute-1-11","compute-1-20","compute-2-21","compute-2-37","compute-3-17",
    "compute-4-8","compute-4-9","compute-4-18","compute-4-25","compute-4-42","compute-5-2","compute-6-2","compute-8-46","compute-9-23","compute-9-31","compute-10-30"]

d3.json("data/influxdb0424-0427.json").then(dataRaw=> {
    let hosts = _.without(d3.keys(dataRaw), 'timespan');
    dataRaw.timespan = dataRaw.timespan.map(d => new Date(d));
    let timeScale = d3.scaleTime().domain(d3.extent(dataRaw.timespan));
    let data = [];
    hosts.forEach((hname, hi) => {
        let hostdata = dataRaw[hname]
        dataRaw.timespan.forEach((t, ti) => {
            let values = {}
            serviceLists.forEach((s, si) => {
                s.sub.forEach((sub, subi) => {
                    values[sub.text] = hostdata[serviceListattr[si]][ti][subi];
                })
            });
            values.timestep = dataRaw.timespan[ti];
            values.compute = hname;
            data.push(values)
        })
    });


    // build scheme
    const hpcc_heat_map = new HeatMap().graphicopt({width:800,height:600,margin:{top: 0, right: 100, bottom: 0, left: 0},contain:'#heatmap_canvas'});
    let scheme = {
        data:{value:data},
        x: {key:'timestep',type:'Band'},
        y: {key:'compute',type:'Band',visible:false},
        mark:{type:"rect"},
        color:{key:selectedService,type:"Linear"}
    };
    hpcc_heat_map.scheme(scheme).draw();

    // build scheme
    const hpcc_ridgeline_plot = new HeatMap().graphicopt({width:800,height:600,margin:{top: 100, right: 100, bottom: 50, left: 0},contain:'#ridgeline_plot_canvas'});
    let scheme_2 = {
        data:{value:data.filter(d=>hostfilter.find(h=>d.compute===h))},
        x: {key:'timestep',type:'Time'},
        y: {key:'compute',type:'Band'},
        mark:{type:"area",key:"y",value:selectedService},
        color:{key:"key",type:"Category",opacity:0.7}
    }
    hpcc_ridgeline_plot.scheme(scheme_2).draw();
})