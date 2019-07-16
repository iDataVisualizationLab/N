// some variables for later usage
const regionNameList =
    ['Palace Hills',
        'Northwest',
        'Old Town',
        'Safe Town',
        'Southwest',
        'Downtown',
        'Wilson Forest',
        'Scenic Vista',
        'Broadview',
        'Chapparal',
        'Terrapin Springs',
        'Pepper Mill',
        'Cheddarford',
        'Easton',
        'Weston',
        'Southton',
        'Oak Willow',
        'East Parton',
        'West Parton'];

const iconpath = "src/images/Icon/";
// load data for time series

let geocoder = d3.geoRasterCoder()
    .size(2048);
let projectionFunc;
d3.csv("src/data/allSensorReadings_minMax.csv").then(data=>{
    data.forEach(d=>{
        d.Timestamp = parse(d.Timestamp);
        d.Value = +d.Value;
        d["value_count"] = +d["value_count"];
        d["value_mean"] = +d["value_mean"];
        d["value_min"] = +d["value_min"];
        d.visible = true;
    })




    // Promise.all(filelist).then(files => {
    //     // d3.csv("../data/times.csv").then(d=>{d.time = parse(d.time)
    //     // Promise.all( tsfilelist ).then( tsfiles => {
    //     // Promise.all(mbfilelist).then( mbfiles=> {
    //     var index = 7;
    //     var alldata = [];
    //     for (let i = 0; i < files.length; i++) {
    //         files[i].forEach(d => {
    //             d.Timestamp = parse(d.Timestamp);
    //             d.Value = +d.Value;
    //             d["value_count"] = +d["value_count"];
    //             d["value_mean"] = +d["value_mean"];
    //             d["value_min"] = +d["value_min"];
    //         })
    //         alldata.push(files[i]);
    //     }

        // draw_heatmap(alldata[index - 1],7);

        const mapTip = d3.select("#map")
            .append("div")
            .style("opacity", 0)
            .attr("class", "tstooltip");

        d3.json('src/data/StHimark.geojson').then(geojson => {

            const width = 500, height = 500;
            var projection = d3.geoEquirectangular().scale(1).translate([0, 0]);

            const geoPath = d3.geoPath()
                .projection(projection);
            geocoder.features(geojson.features);
            //Scaling and translating.
            const b = geoPath.bounds(geojson),
                s = 1 / Math.max((b[1][0] - b[0][0]) / width, (b[1][1] - b[0][1]) / height),
                t = [(width - s * (b[1][0] + b[0][0])) / 2, (height - s * (b[1][1] + b[0][1])) / 2];

            projection.scale(s).translate(t);

            projectionFunc = projection;

            const hospitalLocation =
                [{Lat: 0.180960, Long: -119.959400},
                    {Lat: 0.153120, Long: -119.915900},
                    {Lat: 0.151090, Long: -119.909520},
                    {Lat: 0.121800, Long: -119.904300},
                    {Lat: 0.134560, Long: -119.883420},
                    {Lat: 0.182990, Long: -119.855580},
                    {Lat: 0.041470, Long: -119.828610},
                    {Lat: 0.065250, Long: -119.744800}];

            // long lat to region
            // console.log(hospitalLocation.map(e=>geocoder([e.Long,e.Lat]).properties.Nbrhood));
            const radiationStation = [{Lat: 0.162679, Long: -119.784825}];
            const mobileSensors = [];
            for (let i = 1; i < 51; i++) {
                mobileSensors.push(i);
            }

            // draw map
            function draw_map(geojson) {
                var mapSvg = d3.select('#map g#regMap')
                    .selectAll('path')
                    .data(geojson.features,d=>d.properties.Id);

                //append path to map
                mapSvg.enter()
                    .append('path')
                    .attr('d', geoPath)
                    .attr("class","geoPath")
                    .attr("id", d => removeWhitespace(d.properties.Nbrhood))
                    // // .attr("class", "regionPath")
                    // .classed("unselected", d => d.properties.Nbrhood !== "Palace Hills")
                    .on("mousemove", mousemove)
                    .on("mouseleave", mouseleave)
                    .on("click", d=>click(d));
                // $(".geoPath").click(()=>{
                // $(this).toggleClass("selected");
                // })
                //add region names to map
                mapSvg.enter()
                    .append("svg:text")
                    .text(d => d.properties.Id + " " + d.properties.Nbrhood)
                    .style("display", "block")
                    .attr("x", d => geoPath.centroid(d)[0])
                    .attr("y", d => geoPath.centroid(d)[1])
                    .attr("text-anchor", "middle")
                    .attr("font-size", "8pt");

                // load data for static sensors and plot them on to the map
                d3.csv("src/data/StaticSensorLocations.csv").then(location => {
                    mapSvg.enter()
                        .data(location)
                        .append("image")
                        .attr("class", "statIcon")
                        .attr("width", 10)
                        .attr("height", 10)
                        .attr('x',-5)
                        .attr('y',-5)
                        .attr("transform", d => {
                            return "translate(" + projection([d.Long, d.Lat]) + ")";
                        })
                        .attr("xlink:href", iconpath+"meter.svg");
                });


                mapSvg.enter()
                    .data(hospitalLocation)

                    .append("image")
                    .attr("class", "hospIcon")
                    .attr("width", 15)
                    .attr("height", 15)
                    .attr("xlink:href", iconpath+"hospital.svg")
                    .attr('x',-7.5)
                    .attr('y',-7.5)
                    .attr("transform", d => {
                        return "translate(" + projection([d.Long, d.Lat]) + ")";
                    });


                //plot radiation station on map
                mapSvg.enter()
                    .data(radiationStation)
                    .append("image")
                    .attr("class", "radIcon")
                    .attr("width", 15)
                    .attr("height", 15)
                    .attr('x',-7.5)
                    .attr('y',-7.5)
                    .attr("xlink:href", iconpath+"radiation.svg")
                    .attr("transform", d => {
                        return "translate(" + projection([d.Long, d.Lat]) + ")";
                    });


                // add map legend
                let iconFiles = [{"Nuclear plant": iconpath+"radiation.svg"}, {"Hospital": iconpath+"hospital.svg"}, {"Static sensor": iconpath+"meter.svg"}];
                // let iconFiles = [{"Nuclear plant": iconpath+"radiation.svg"}, {"Hospital": iconpath+"hospital.svg"}];
                let legendSvg = d3.select("#map g.legendGroup");
                legendSvg.selectAll("image")
                    .data(iconFiles)
                    .enter()
                    .append("image")
                    .attr("width", 13)
                    .attr("height", 13)
                    .attr("xlink:href", d => Object.values(d))
                    .attr("y", (d, i) => i * 15)
                    .attr("class", "mapLegend");
                legendSvg.selectAll("text")
                    .data(iconFiles)
                    .enter()
                    .append("text")
                    .text(d=>Object.keys(d))
                    .attr("font-size",10)
                    .attr("x", 15)
                    .attr("y",(d,i)=>10 + i*15);

            }

            draw_map(geojson);
            // drawTimeSeries(data.filter(d=>d.Value < 5000));
        })

        // where helper functions go

        function toggleHeatmap(region){
            let displayed = d3.select("#" + "heatmap" + (regionNameList.indexOf(region)+1))
            displayed.classed("displayed",!displayed.classed("displayed"));

        }


        function mouseover(d) {
            d3.selectAll('.geoPath').classed('nothover',true);
            d3.select(this).classed('nothover',false);
            // .style("stroke", "black")
            //     .style("opacity", 0.5);

            d3.selectAll(".radarlinkLineg:not(.disable)").filter(e=> e.regions ===undefined || !e.regions.find(f=>f===d.properties.Nbrhood)).transition(200).style('opacity',0.2);
        }



        function click(d) {

            // d3.selectAll("#regMap path").classed("selected",false).style("fill","lightgrey");
            const item = d3.select("#" + removeWhitespace(d.properties.Nbrhood));
            if (item.classed("selected")) {
                item.classed("selected", false);
                d3.selectAll(".linkLineg").filter(e => +e.loc === d.properties.Id).classed('disable', true).classed('selected', false);
            }else {
                item.classed("selected", true);
                d3.selectAll(".linkLineg").filter(e => +e.loc === d.properties.Id).classed('disable', false).classed('selected', true);
                d3.selectAll(".linkLineg:not(.disable):not(.selected)").filter(e => +e.loc !== d.properties.Id).classed('disable', true);
            }
            // toggleHeatmap("heatmap" + (index + 1));
            // for (let region of regionNameList) {
            //     let index = regionNameList.indexOf(region);
            //     if (d.properties.Nbrhood === region) {
            //         draw_heatmap(alldata[index],index+1);
            //         // d3.select("#" + "heatmap" + (regionNameList.indexOf(region)+1)).classed("displayed",true);
            //         // toggleHeatmap(d.properties.Nbrhood);
            //     }
            // }


        }

        function mousemove(d) {
            mapTip
                .html("Region: " + d.properties.Nbrhood + "<br>"
                    + "density  : " + d.density)
                .style("opacity", 1)
                .style("left", (d3.mouse(this)[0] + 30) + "px")
                .style("top", (d3.mouse(this)[1]) + 20 + "px")
        }

        function mouseleave(d) {
            mapTip
                .transition()
                .duration(200)
                .style("opacity", 0);
            d3.selectAll('.geoPath').classed('nothover',false);
            d3.selectAll(".radarlinkLineg:not(.disable)").filter(e=> e.regions ===undefined || !e.regions.find(f=>f===d.properties.Nbrhood)).transition(200).style('opacity',1);
        }

        // });
    // });
    // });
});