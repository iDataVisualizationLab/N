/**
 * Created by vinhtngu on 5/27/17.
 */
async function getNet_cancer(){
    var globalProtein;
    await d3.json("data/kegg.json").then(function ( graph) {
        globalProtein = JSON.parse(JSON.stringify(graph));
        globalProtein.nodes.forEach(function (d) {
            d.pie.forEach(function (e) {
                e.radius =7;
            })
        })
    });
    var netdata = {
            "name": "Cancer studies",
            "children": [{
                "id": "AMLE","index":0,
                "size": 33,
                "name": "Acute Myeloid Leukemia",
                "genes": [90, 91, 92, 93, 94, 95, 96, 97, 98, 99, 100, 101, 102, 103, 104, 105, 130, 144, 148, 149, 150, 152, 153, 154, 157, 158, 159, 166, 167, 170, 182, 183, 190],
                "protein": ["EIF4EBP1", "KIT", "RPS6KB1", "PIM2", "PIM1", "PML", "CCNA1", "JUP", "STAT3", "PPARD", "RUNX1", "CEBPA", "SPI1", "FLT3", "KRAS", "RARA", "NRAS", "MYC", "ARAF", "MAP2K1", "MAPK1", "PIK3R5", "AKT3", "MTOR", "C05981", "GRB2", "SOS1", "BAD", "CHUK", "HRAS", "LEF1", "CCND1", "NFKB1"]
            }, {
                "id": "BASA","index":1,
                "size": 14,
                "name": "Basal Cell Carcinoma",
                "genes": [131, 132, 133, 134, 135, 136, 137, 138, 139, 140, 156, 169, 172, 182],
                "protein": ["HHIP", "FZD10", "DVL1", "AXIN1", "APC2", "SHH", "WNT16", "BMP2", "PTCH1", "GLI1", "GSK3B", "TP53", "CTNNB1", "LEF1"]
            }, {
                "id": "BLAD","index":2,
                "size": 22,
                "name": "Bladder Cancer",
                "genes": [122, 123, 124, 125, 126, 127, 128, 129, 143, 144, 148, 149, 150, 161, 162, 168, 169, 170, 171, 175, 176, 183],
                "protein": ["RPS6KA5", "FGFR3", "DAPK1", "RASSF1", "ERBB2", "VEGFA", "CDKN2A", "CDK4", "CDH1", "MYC", "ARAF", "MAP2K1", "MAPK1", "RB1", "EGF", "EGFR", "TP53", "HRAS", "E2F1", "CDKN1A", "MDM2", "CCND1"]
            }, {
                "id": "BRCA","index":3,
                "size": 55,
                "name": "Breast Cancer",
                "genes": [23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 91, 92, 110, 126, 129, 132, 133, 134, 135, 137, 144, 148, 149, 150, 152, 153, 154, 156, 157, 158, 159, 161, 162, 168, 169, 170, 171, 172, 175, 182, 183, 187],
                "protein": ["FLT4", "HEY1", "HES1", "FGF1", "BRCA2", "TNFSF11", "WNT4", "FGFR1", "NFKB2", "LRP6", "FRAT1", "CSNK1A1L", "PGR", "C00410", "DLL3", "FOS", "IGF1R", "IGF1", "NOTCH1", "JAG1", "NCOA3", "C00951", "ESR1", "KIT", "RPS6KB1", "SHC2", "ERBB2", "CDK4", "FZD10", "DVL1", "AXIN1", "APC2", "WNT16", "MYC", "ARAF", "MAP2K1", "MAPK1", "PIK3R5", "AKT3", "MTOR", "GSK3B", "C05981", "GRB2", "SOS1", "RB1", "EGF", "EGFR", "TP53", "HRAS", "E2F1", "CTNNB1", "CDKN1A", "LEF1", "CCND1", "PTEN"]
            }, {
                "id": "CMLE","index":4,
                "size": 39,
                "name": "Chronic Myeloid Leukemia",
                "genes": [106, 107, 108, 109, 110, 111, 112, 113, 114, 115, 116, 117, 118, 119, 120, 121, 128, 129, 144, 148, 149, 150, 152, 153, 157, 158, 159, 161, 166, 167, 169, 170, 171, 175, 176, 183, 188, 189, 190],
                "protein": ["SMAD3", "CBLC", "CRK", "GAB2", "SHC2", "SMAD4", "STAT5A", "TGFBR1", "TGFBR2", "CTBP1", "HDAC1", "TGFB1", "ABL1", "PTPN11", "BCL2L1", "MECOM", "CDKN2A", "CDK4", "MYC", "ARAF", "MAP2K1", "MAPK1", "PIK3R5", "AKT3", "C05981", "GRB2", "SOS1", "RB1", "BAD", "CHUK", "TP53", "HRAS", "E2F1", "CDKN1A", "MDM2", "CCND1", "CDKN1B", "NFKBIA", "NFKB1"]
            }, {
                "id": "COLO","index":5,
                "size": 33,
                "name": "Colorectal Cancer",
                "genes": [6, 7, 8, 9, 10, 11, 14, 17, 21, 38, 47, 80, 104, 111, 113, 114, 117, 134, 135, 144, 148, 149, 150, 152, 153, 156, 165, 166, 169, 172, 182, 183, 184],
                "protein": ["BAX", "BIRC5", "RHOA", "APPL1", "CASP3", "DCC", "SMAD2", "MAPK8", "RALGDS", "FOS", "JUN", "CYCS", "KRAS", "SMAD4", "TGFBR1", "TGFBR2", "TGFB1", "AXIN1", "APC2", "MYC", "ARAF", "MAP2K1", "MAPK1", "PIK3R5", "AKT3", "GSK3B", "CASP9", "BAD", "TP53", "CTNNB1", "LEF1", "CCND1", "BCL2"]
            }, {
                "id": "ENDO","index":6,
                "size": 29,
                "name": "Endometrial Cancer",
                "genes": [4, 5, 68, 104, 126, 134, 135, 143, 144, 148, 149, 150, 152, 153, 156, 157, 158, 159, 160, 162, 165, 166, 168, 169, 170, 172, 182, 183, 187],
                "protein": ["ELK1", "ILK", "FOXO3", "KRAS", "ERBB2", "AXIN1", "APC2", "CDH1", "MYC", "ARAF", "MAP2K1", "MAPK1", "PIK3R5", "AKT3", "GSK3B", "C05981", "GRB2", "SOS1", "PDPK1", "EGF", "CASP9", "BAD", "EGFR", "TP53", "HRAS", "CTNNB1", "LEF1", "CCND1", "PTEN"]
            }, {
                "id": "GLIO","index":7,
                "size": 34,
                "name": "Glioma",
                "genes": [0, 1, 2, 3, 39, 40, 66, 67, 69, 70, 71, 72, 110, 128, 129, 148, 149, 150, 152, 153, 154, 157, 158, 159, 161, 162, 168, 169, 170, 171, 175, 176, 183, 187],
                "protein": ["CAMK2A", "CALML6", "PDGFRA", "PDGFA", "IGF1R", "IGF1", "TGFA", "PLCG1", "C01245", "C00165", "C00076", "PRKCA", "SHC2", "CDKN2A", "CDK4", "ARAF", "MAP2K1", "MAPK1", "PIK3R5", "AKT3", "MTOR", "C05981", "GRB2", "SOS1", "RB1", "EGF", "EGFR", "TP53", "HRAS", "E2F1", "CDKN1A", "MDM2", "CCND1", "PTEN"]
            }, {
                "id": "MELA","index":8,
                "size": 22,
                "name": "Melanoma",
                "genes": [128, 129, 130, 143, 146, 148, 149, 150, 152, 153, 157, 161, 162, 166, 168, 169, 170, 171, 175, 176, 183, 187],
                "protein": ["CDKN2A", "CDK4", "NRAS", "CDH1", "BRAF", "ARAF", "MAP2K1", "MAPK1", "PIK3R5", "AKT3", "C05981", "RB1", "EGF", "BAD", "EGFR", "TP53", "HRAS", "E2F1", "CDKN1A", "MDM2", "CCND1", "PTEN"]
            }, {
                "id": "nSCLC","index":9,
                "size": 37,
                "name": "Non-Small Cell Lung Cancer",
                "genes": [62, 63, 64, 65, 66, 67, 68, 69, 70, 71, 72, 85, 86, 104, 125, 126, 128, 129, 145, 148, 149, 150, 152, 153, 157, 158, 159, 160, 161, 162, 165, 166, 168, 169, 170, 171, 183],
                "protein": ["ALK", "PIK3CA", "RASSF5", "STK4", "TGFA", "PLCG1", "FOXO3", "C01245", "C00165", "C00076", "PRKCA", "RARB", "C00777", "KRAS", "RASSF1", "ERBB2", "CDKN2A", "CDK4", "RXRA", "ARAF", "MAP2K1", "MAPK1", "PIK3R5", "AKT3", "C05981", "GRB2", "SOS1", "PDPK1", "RB1", "EGF", "CASP9", "BAD", "EGFR", "TP53", "HRAS", "E2F1", "CCND1"]
            }, {
                "id": "PROS","index":10,
                "size": 44,
                "name": "Prostate Cancer",
                "genes": [148, 149, 150, 151, 152, 153, 154, 155, 156, 157, 158, 159, 160, 161, 162, 163, 164, 165, 166, 167, 168, 169, 170, 171, 172, 173, 174, 175, 176, 177, 178, 179, 180, 181, 182, 183, 184, 185, 186, 187, 188, 189, 190, 191],
                "protein": ["ARAF", "MAP2K1", "MAPK1", "GSTP1", "PIK3R5", "AKT3", "MTOR", "HSP90AA1", "GSK3B", "C05981", "GRB2", "SOS1", "PDPK1", "RB1", "EGF", "CCNE1", "CREB3", "CASP9", "BAD", "CHUK", "EGFR", "TP53", "HRAS", "E2F1", "CTNNB1", "CDK2", "FOXO1", "CDKN1A", "MDM2", "C16038", "C00535", "C03917", "C00951", "CREBBP", "LEF1", "CCND1", "BCL2", "KLK3", "NKX3-1", "PTEN", "CDKN1B", "NFKBIA", "NFKB1", "AR"]
            }, {
                "id": "PANC","index":11,
                "size": 41,
                "name": "Pancreatic Cancer",
                "genes": [12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 27, 55, 66, 98, 104, 111, 113, 114, 117, 120, 126, 127, 128, 129, 148, 149, 150, 152, 153, 157, 161, 162, 165, 166, 167, 168, 169, 171, 183, 190],
                "protein": ["C00416", "RAD51", "SMAD2", "STAT1", "JAK1", "MAPK8", "PLD1", "RALBP1", "RALA", "RALGDS", "ARHGEF6", "BRCA2", "RAC1", "TGFA", "STAT3", "KRAS", "SMAD4", "TGFBR1", "TGFBR2", "TGFB1", "BCL2L1", "ERBB2", "VEGFA", "CDKN2A", "CDK4", "ARAF", "MAP2K1", "MAPK1", "PIK3R5", "AKT3", "C05981", "RB1", "EGF", "CASP9", "BAD", "CHUK", "EGFR", "TP53", "E2F1", "CCND1", "NFKB1"]
            }, {
                "id": "RENA","index":12,
                "size": 30,
                "name": "Renal Cell Carcinoma",
                "genes": [46, 47, 48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 58, 59, 60, 61, 66, 108, 117, 119, 127, 148, 149, 150, 152, 153, 158, 159, 170, 181],
                "protein": ["HGF", "JUN", "ETS1", "CDC42", "RAP1A", "PAK4", "GAB1", "MET", "RAPGEF1", "RAC1", "PDGFB", "C00122", "EPAS1", "EGLN2", "ARNT", "SLC2A1", "TGFA", "CRK", "TGFB1", "PTPN11", "VEGFA", "ARAF", "MAP2K1", "MAPK1", "PIK3R5", "AKT3", "GRB2", "SOS1", "HRAS", "CREBBP"]
            }, {
                "id": "SCLC","index":13,
                "size": 37,
                "name": "Small Cell Lung Cancer",
                "genes": [73, 74, 75, 76, 77, 78, 79, 80, 81, 82, 83, 84, 85, 86, 87, 88, 89, 120, 129, 144, 145, 152, 153, 157, 161, 163, 165, 167, 169, 171, 173, 183, 184, 187, 188, 189, 190],
                "protein": ["CDKN2B", "SKP2", "TRAF1", "PTGS2", "NOS2", "BIRC8", "LAMC3", "CYCS", "PTK2", "MAX", "APAF1", "CKS1B", "RARB", "C00777", "PIAS2", "ITGA6", "ITGB1", "BCL2L1", "CDK4", "MYC", "RXRA", "PIK3R5", "AKT3", "C05981", "RB1", "CCNE1", "CASP9", "CHUK", "TP53", "E2F1", "CDK2", "CCND1", "BCL2", "PTEN", "CDKN1B", "NFKBIA", "NFKB1"]
            }, {
                "id": "THYR","index":14,
                "size": 14,
                "name": "Thyroid Cancer",
                "genes": [141, 142, 143, 144, 145, 146, 147, 149, 150, 169, 170, 172, 182, 183],
                "protein": ["TFG", "RET", "CDH1", "MYC", "RXRA", "BRAF", "PPARG", "MAP2K1", "MAPK1", "TP53", "HRAS", "CTNNB1", "LEF1", "CCND1"]
            }]


        },
        proteinarr=["camk2a","calml6","pdgfra","pdgfa","elk1","ilk","bax","birc5","rhoa","appl1","casp3","dcc","c00416","rad51","smad2","stat1","jak1","mapk8","pld1","ralbp1","rala","ralgds","arhgef6","flt4","hey1","hes1","fgf1","brca2","tnfsf11","wnt4","fgfr1","nfkb2","lrp6","frat1","csnk1a1l","pgr","c00410","dll3","fos","igf1r","igf1","notch1","jag1","ncoa3","c00951","esr1","hgf","jun","ets1","cdc42","rap1a","pak4","gab1","met","rapgef1","rac1","pdgfb","c00122","epas1","egln2","arnt","slc2a1","alk","pik3ca","rassf5","stk4","tgfa","plcg1","foxo3","c01245","c00165","c00076","prkca","cdkn2b","skp2","traf1","ptgs2","nos2","birc8","lamc3","cycs","ptk2","max","apaf1","cks1b","rarb","c00777","pias2","itga6","itgb1","eif4ebp1","kit","rps6kb1","pim2","pim1","pml","ccna1","jup","stat3","ppard","runx1","cebpa","spi1","flt3","kras","rara","smad3","cblc","crk","gab2","shc2","smad4","stat5a","tgfbr1","tgfbr2","ctbp1","hdac1","tgfb1","abl1","ptpn11","bcl2l1","mecom","rps6ka5","fgfr3","dapk1","rassf1","erbb2","vegfa","cdkn2a","cdk4","nras","hhip","fzd10","dvl1","axin1","apc2","shh","wnt16","bmp2","ptch1","gli1","tfg","ret","cdh1","myc","rxra","braf","pparg","araf","map2k1","mapk1","gstp1","pik3r5","akt3","mtor","hsp90aa1","gsk3b","c05981","grb2","sos1","pdpk1","rb1","egf","ccne1","creb3","casp9","bad","chuk","egfr","tp53","hras","e2f1","ctnnb1","cdk2","foxo1","cdkn1a","mdm2","c16038","c00535","c03917","crebbp","lef1","ccnd1","bcl2","klk3","nkx3-1","pten","cdkn1b","nfkbia","nfkb1","ar"] ,color = d3.scaleOrdinal(d3.schemeCategory20);
    return {globalProtein,netdata,proteinarr};
}

function getColor(code) {
    if (code == 0)
        return "rgb(31, 119, 180)";
    else if (code == 1)
        return "rgb(174, 199, 232)";
    else if (code == 2)
        return "rgb(255, 127, 14)";
    else if (code == 3)
        return "rgb(255, 187, 120)";
    else if (code == 4)
        return "rgb(44, 160, 44)";
    else if (code == 5)
        return "rgb(152, 223, 138)";

    else if (code == 6)
        return "rgb(214, 39, 40)";

    else if (code == 7)
        return "rgb(255, 152, 150)";

    else if (code == 8)
        return "rgb(148, 103, 189)";
    else if (code == 9)
        return "rgb(197, 176, 213)";
    else if (code == 10)
        return "rgb(140, 86, 75)";
    else if (code == 11)
        return "rgb(196, 156, 148)";
    else if (code == 12)
        return "rgb(227, 119, 194)";
    else if (code == 13)
        return "rgb(247, 182, 210)";
    else if (code == 14)
        return "rgb(127, 127, 127)";
    else if (code == 15)
        return "rgb(199, 199, 199)";

    else {
        return "black";
    }
}
function BubbleChart() {
    var diameter = 400;
    var bubble = d3.pack()
        .size([diameter, diameter])
        .padding(1);
    var svg = d3.select("#bubble").append("svg")
        .attr("id","svgbubble")
        .attr("width", 300)
        .attr("height", 300)
        .attr('viewBox',`0 0 ${diameter} ${diameter}`)
        .style("background", "#fff")
        .attr("class", "bubble");
    var root = d3.hierarchy(classes(netdata))
        .sum(function (d) {
            return d.value;
        })
        .sort(function (a, b) {
            return b.value - a.value;
        });

    bubble(root);
    var node = svg.selectAll(".node")
        .data(root.children)
        .enter().append("g")
        .attr("id", function (d) {
            return d.data.id;
        })
        .attr("class", "gnode")
        .attr("transform", function (d) {
            return "translate(" + d.x + "," + d.y + ")";
        });
    node.append("title")
        .text(function (d) {
            return d.data.className + ": " + d.value;
        });

    node.append("circle")
        .attr("r", function (d) {
            return d.r;
        })
        .style("fill", function (d, i) {
            return getColor(d.data.index);
        });

    node.append("text")
        .attr("dy", ".3em")
        .style("text-anchor", "middle")
        .text(function (d) {
            return d.data.className.substring(0, d.r / 3);
        });

}
function classes(root) {
    var classes = [];

    function recurse(name, node) {
        if (node.children) node.children.forEach(function (child) {
            recurse(node.name, child);
        });
        else classes.push({index: node.index,packageName: name, className: node.name, value: node.size,id:node.id, protein:node.protein});
    }

    recurse(null, root);
    return {children: classes};
}

function ProteinForceDirectedGraph({onChoose,onRelease}) {
    debugger
    d3.select("#svgprotein").remove();
    var width = 650,
        height = 650;
    var radius=2;
    var svg = d3.select("#protein").append("svg").attr("id","svgprotein")
        .attr("width", '100%').attr("height", '100%')
        .attr('viewBox',`0 0 ${width} ${height}`)
        .style("background", "#fff");
    var simulation = d3.forceSimulation()
        .force("link", d3.forceLink().id(function (d) {
            return d.id;
        }))
        .force("charge", d3.forceManyBody())
        .force("collide", d3.forceCollide(15).iterations(12))
        .force("center", d3.forceCenter(width / 2, height / 2));
    var arc = d3.arc()
        .outerRadius(radius)
        .innerRadius(0);
    var pie = d3.pie()
        .sort(null)
        .value(function (d) {
            return d.value;
        });
    var link = svg.append("g")
        .attr("class", "links")
        .selectAll("line")
        .data(globalProtein.links)
        .enter().append("line")
        .attr("stroke-width", 0.25)
        .attr("stroke","black")
        .attr("stroke-opacity",0.5);

    var node = svg.selectAll(".nodes")
        .data(globalProtein.nodes)
        .enter().append("g")
        .attr("class","nodes")
        .attr("r", 13)
        .attr("id",function (d) {
            return d.label;
        })
        .call(d3.drag()
            .on("start", dragstarted)
            .on("drag", dragged)
            .on("end", dragended));

    node.selectAll("path").data(function (d) {
        return pie(d.pie);
    }).enter().append("svg:path")
        .attr("d", function(d) {
            arc.outerRadius(d.data.radius);
            return arc(d);
        })
        .style("fill", function (d) {
            return getColor(d.data.study);
        });
    node.on("click",function (d) {
        var bubble= d3.select("#svgbubble").selectAll("g");
        bubble.style("opacity",function (e) {
            if(e.data.protein.indexOf(d.label)>=0) return 1;
            else return 0.05;
        });
        // var bars1 = d3.select("#svg1").selectAll("rect");
        // bars1.style("fill-opacity",function (bar) {
        //     if(bar.symbol.toUpperCase()==d.label) return 1;
        //     else return 0.05;
        //
        // });
        // var bars2 = d3.select("#svg2").selectAll("rect");
        // bars2.style("fill-opacity",function (bar) {
        //     if(bar.symbol.toUpperCase()==d.label) return 1;
        //     else return 0.05;
        //
        // });
        // var bars3 = d3.select("#svg3").selectAll("rect");
        // bars3.style("fill-opacity",function (bar) {
        //     if(bar.symbol.toUpperCase()==d.label) return 1;
        //     else return 0.05;
        //
        // });
        // var bars4 = d3.select("#svg4").selectAll("rect");
        // bars4.style("fill-opacity",function (bar) {
        //     if(bar.symbol.toUpperCase()==d.label) return 1;
        //     else return 0.05;
        //
        // });
    })
    node.append("text")
        .attr("class","texts")
        .attr("dx", 8)
        .attr("dy", ".35em")
        .attr("font-family", "sans-serif")
        .attr("font-size", "10px")
        .text(function (d) {
            return d.label
        });


    simulation
        .nodes(globalProtein.nodes)
        .on("tick", ticked);

    simulation.force("link")
        .links(globalProtein.links);

    function ticked() {
        link
            .attr("x1", function (d) {
                return d.source.x;
            })
            .attr("y1", function (d) {
                return d.source.y;
            })
            .attr("x2", function (d) {
                return d.target.x;
            })
            .attr("y2", function (d) {
                return d.target.y;
            });

        node.attr("transform", function (d) {
            return "translate(" + d.x + "," + d.y + ")";
        });
        node.attr("cx", function(d) { return d.x = Math.max(20*radius, Math.min(width - 20*radius, d.x)); })
            .attr("cy", function(d) { return d.y = Math.max(20*radius, Math.min(height - 20*radius, d.y)); });
    }


    var bubble= d3.select("#svgbubble").selectAll("g");
    bubble.on("click",function (b) {
        var e = d3.event,
            isSelected = d3.select(this).classed("selected");

        if (!e.ctrlKey && !e.metaKey) {
            d3.select("#svgbubble").selectAll("g").classed("selected", false);
        }
        d3.select(this).classed("selected", !isSelected);
        // to do release
        d3.select("#svgbubble").selectAll("g").style("opacity",0.1)
        let selectedItems = d3.select("#svgbubble").selectAll(".selected").style("opacity",1);
        let nodesList = [];
        if (!selectedItems.empty())
        {
            node.style("opacity",function (d) {
                if(b.data.protein.indexOf(d.label)>=0){
                    nodesList.push(d.referenceName)
                    return 1;
                }
                else return 0.05;
            });
            link.style("opacity",function (d) {
                if(b.data.protein.indexOf(d.source.label)>=0&&b.data.protein.indexOf(d.target.label)>=0) return 1;
                else return 0.05;
            });
        }else{
            d3.select("#svgbubble").selectAll("g").style("opacity",1);
            node.style("opacity",1);
            link.style("opacity",1);
        }
        if (onChoose)
            onChoose(nodesList)
        // var bars1 = d3.select("#svg1").selectAll("rect");
        // bars1.style("fill-opacity",function (bar) {
        //     if(b.data.protein.indexOf(bar.symbol.toUpperCase())>=0) return 1;
        //     else return 0.05;
        //
        // });
        //
        // var bars2 = d3.select("#svg2").selectAll("rect");
        // bars2.style("fill-opacity",function (bar) {
        //     if(b.data.protein.indexOf(bar.symbol.toUpperCase())>=0) return 1;
        //     else return 0.05;
        //
        // });
        // var bars3 = d3.select("#svg3").selectAll("rect");
        // bars3.style("fill-opacity",function (bar) {
        //     if(b.data.protein.indexOf(bar.symbol.toUpperCase())>=0) return 1;
        //     else return 0.05;
        //
        // });
        // var bars4 = d3.select("#svg4").selectAll("rect");
        // bars4.style("fill-opacity",function (bar) {
        //     if(b.data.protein.indexOf(bar.symbol.toUpperCase())>=0) return 1;
        //     else return 0.05;
        //
        // });

    });

    function dragstarted(d) {
        if (!d3.event.active) simulation.alphaTarget(0.3).restart();
        d.fx = d.x;
        d.fy = d.y;
    }

    function dragged(d) {
        d.fx = d3.event.x;
        d.fy = d3.event.y;
    }

    function dragended(d) {
        if (!d3.event.active) simulation.alphaTarget(0);
        d.fx = null;
        d.fy = null;
    }

}
function updateProteinTransparent(graph) {
    Array.prototype.diff = function(a) {
        return this.filter(function(i) {return a.indexOf(i) < 0;});
    };
    //Find different object
    var firstarry=[] ;
    graph.forEach(function (d) {
        firstarry.push(d.symbol.toLowerCase())
    })
    var finallist=  proteinarr.diff(firstarry);
    var nodes = d3.select("#svgprotein").selectAll(".nodes");
    nodes.selectAll(".texts").style("opacity",function (d) {
        if(finallist.indexOf(d.label.toLowerCase())==-1)
            return 1;
        else return 0.1;
    })

}
