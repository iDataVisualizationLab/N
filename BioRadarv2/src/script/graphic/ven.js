let idAll = 'ALL';
let keyGenes_rename = "STOP1"
let venn_opt = {
    margin: {top: 0, right: 0, bottom: 0, left: 0},
    width: 300,
    height: 300,
    scalezoom: 1,
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
};
async function read_data_for_venn() {

    let tick = new Date;

    let set_data = {};

    set_data["STOP1"] = [keyGenes];


    await d3.csv("data/Targets_differentially_expressed.csv").then(data => {
        const id_set_data = "UpDown";
        set_data[id_set_data] = [];
        data.forEach(d=>{
            Object.keys(d).forEach(k=>{if (d[k]) set_data[id_set_data].push(d[k])})
        });
    });


    await d3.csv("data/STOP1_targets_EckerLab_filter.csv").then(data => {
        const id_set_data = "Ecker";
        set_data[id_set_data] = [];
        data.forEach(d=>{
            Object.keys(d).forEach(k=>{if (d[k]) set_data[id_set_data].push(d[k])})
        });
    });

    await d3.csv("data/Transcription_factors.csv").then(data => {
        let id_set_data = "EXP";
        set_data[id_set_data] = [];
        data.forEach(d=>{
            if (d["TF_EXP"])
                set_data[id_set_data].push(d["TF_EXP"]);
        });

        id_set_data = "DE";
        set_data[id_set_data] = [];
        data.forEach(d=>{
            if (d["TF_DE"])
                set_data[id_set_data].push(d["TF_DE"]);
        });
    });

    await d3.csv("data/filter_nonexpressed.csv").then(data => {
        let id_set_data = "LowCPM";
        set_data[id_set_data] = [];
        data.forEach(d=>{
            if (d["filter_low_cpm"]==="0")
                set_data[id_set_data].push(d["atID"]);
        });
        id_set_data = "LowLog2Fold";
        set_data[id_set_data] = [];
        data.forEach(d=>{
            if (d["wt_low_log2fold"]==="1")
                set_data[id_set_data].push(d["atID"]);
        });
    });


    console.log("time running = ", (new Date - tick) / 1000);
    return set_data;
}





async function read_data_for_venn_with_upload_file() {
    let set_data = {};
    await d3.csv("data/mice_pseudocounts_LOW.csv").then(data => {
        let id_set_data = "LowCPM";
        set_data[id_set_data] = [];
        data.forEach(d=>{
            if (d["low_cpm"]==="1")
                set_data[id_set_data].push(d["symbol"]);
        });

        id_set_data = "LowLog2Fold";
        set_data[id_set_data] = [];
        data.forEach(d=>{
            if (d["low_log2fold"]==="1")
                set_data[id_set_data].push(d["symbol"]);
        });
    });

    return set_data;

}

function update_data_for_venn() {

    if (typeof globalFilter != 'undefined') {
        globalFilter[id_set_data]["data"] = _cur_df.distinct(_atID).toArray().flat();
        globalFilter[id_set_data]["name"] = _cur_df.count().toString() + " genes";

        // globalFilter[id_set_data - 1]["data"] = _cur_filter_set;
    }
};


function calc_overlapping_number_for_venn(set_venn, sub_set_id, set_data) {
    let res = {}, tmp;

    res["sets"] = sub_set_id;

    if (sub_set_id.length === 1) {
        res["label"] = sub_set_id[0];
        res["size"] = globalFilter[sub_set_id[0]].length;
        res["data_list"] = globalFilter[sub_set_id[0]];
        return res;
    } else {
        if (sub_set_id.includes(idAll)) {
            tmp = calc_overlapping_number_for_venn(set_venn, sub_set_id.filter(x => x !== idAll), set_data);
            res["size"] = tmp["size"];
            res["data_list"] = tmp["data_list"];
        }
        else {
            if (sub_set_id.length===2){
                let intersection = _.intersection(set_data[sub_set_id[0]],set_data[sub_set_id[1]]);
                res["size"] = intersection.length;
                res["data_list"] = intersection;
            }else{
                let previous_res = set_venn.find(set => JSON.stringify(set["sets"]) === JSON.stringify(sub_set_id.slice(0, sub_set_id.length - 1)));
                let intersection=[];
                if (previous_res) {
                    intersection = _.intersection(previous_res, set_data[_.last(sub_set_id)]);
                }
                res["size"] = intersection.length;
                res["data_list"] = intersection;
            }
        }
        return res;
    }

}

function create_sets_obj_for_venn(globalFilter) {

    let sets_venn = [];
    let all_set_ids = get_all_subsets_id(Object.keys(globalFilter));

    for (let i = 0; i < all_set_ids.length; i++) {

        let tmp = calc_overlapping_number_for_venn(sets_venn, all_set_ids[i], globalFilter);
        sets_venn.push(tmp);
    }
    sets_venn = sets_venn.filter(s=>s.size)
    return sets_venn;
}

function get_all_subsets_id(arr) {
    return _.flatMap(arr, (v, i, a) => _.combinations(a, i + 1));

}

function draw_venn(sets_venn) {

    let _cur_venn_div = d3.select("#vennChart");
    if (_cur_venn_div.empty()) {
        return false;
    }
    _cur_venn_div.attrs({
        width: venn_opt.width,
        height: venn_opt.height,
    })
    _cur_venn_div.selectAll("*").remove();
    console.log("removed venn");

    _cur_venn_div.datum(sets_venn.filter(s=>s.size)).call(venn.VennDiagram()
        .width(venn_opt.widthG())
        .height(venn_opt.heightG()));


    var tooltip = d3.select("body").append("div")
        .attr("class", "venntooltip");

    _cur_venn_div.selectAll("path")
        .style("stroke-opacity", 0)
        .style("stroke", "lightblue")
        .style("stroke-width", 3);
    _cur_venn_div.selectAll(".venn-area.venn-circle")
        .filter(d=>d.sets[0] === keyGenes_rename && d.sets.length===1)
        .select('path')
        .classed('main_target',true)
        .style("stroke-opacity", 1)
        .style("stroke", "black")
        .style("stroke-width", 10);
    _cur_venn_div.selectAll(".venn-area.venn-circle").filter(d=>d.sets[0]==="ALL")
        .select('text.label tspan').text(d=>`${d.size} genes`);

    _cur_venn_div.selectAll("g")
        .on("mouseover", function (d, i) {
            // sort all the areas relative to the current item
            venn.sortAreas(_cur_venn_div, d);

            // Display a tooltip with the current size
            tooltip.transition().duration(1).style("opacity", .9);


            if (d.sets[0]==="ALL"&&d.sets.length===1) {
                tooltip.text(d.size + ` from ${totalgenes} genes`);
            } else if (d.sets.includes(0) && globalFilter[0]["name"] === keyGenes_rename) { //include s1's set
                tooltip.text(keyGenes_rename);
            } else {
                tooltip.text(d.size + " genes");
            }

            // highlight the current path
            var selection = d3.select(this).transition("tooltip").duration(1);
            selection.select("path")
                .style("fill-opacity", d.sets.length === 1 ? .4 : .1)
                .style("stroke-opacity", 1);
        })

        .on("mousemove", function () {
            tooltip.style("left", (d3.event.pageX) + "px")
                .style("top", (d3.event.pageY - 28) + "px");
        })

        .on("mouseout", function (d, i) {
            tooltip.transition().duration(1).style("opacity", 0);
            var selection = d3.select(this).transition("tooltip").duration(1);
            selection.select("path")
                .style("fill-opacity", d.sets.length === 1 ? .25 : .0)
                .style("stroke-opacity", d.sets[0] === keyGenes_rename && d.sets.length===1 ? 1:0);
        })
        .on("click", (d) => {

            // trivial code.
            if (d.sets[0]==="ALL"&&d.sets.length===1) {
                console.log("it's the current Data => return, nothing change!");
                mainviz.filter([]);

            }else{
                mainviz.filter(d.data_list);
            }

            //filter
            // let data = _total_df.filter(row => d.data_list.includes(row.get(_atID)));
            // _cur_df = data;
            //
            // reset_DisplayIndex_and_DisplayDF();
            // updateDataForSVGCharts();
            // print_paging_sms_for_chart();
            // updateCharts();
            //
            // updateTAbleWithColor();
            // add_events_for_dataTable();


        });




}

