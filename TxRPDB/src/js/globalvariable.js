// data variable
let basearr=[],basedata={},dp,mediaQuery,
    COL_LAT = 'lat',
    COL_LONG = 'lng',
    filter={};

let variable_collection ={
    CCSJ:{
        text: 'CCSJ',
        id: 'CCSJ'
    },
    ConcreteCAT:{
        text: 'Concrete CAT',
        id: 'ConcreteCAT'
    },
    ConstYear:{
        text: 'Construction Year',
        id: 'ConstYear'
    },
    County:{
        text: 'County',
        id: 'County'
    },
    DataType:{
        text: 'Project',
        id: 'DataType'
    },
    Direction:{
        text: 'Direction',
        id: 'Direction'
    },
    District:{
        text: 'District',
        id: 'District'
    },
    Drainage:{
        text: 'Drainage',
        id: 'Drainage'
    },
    GPSEnd:{
        type:'gps',
        text: 'GPS (End)',
        id: 'GPSEnd'
    },
    GPSStart:{
        type:'gps',
        text: 'GPS Start',
        id: 'GPSStart'
    },
    Highway:{
        text: 'Highway',
        id: 'Highway'
    },
    HorizontalAlign:{
        text: 'Horizontal Alignment',
        id: 'HorizontalAlign'
    },
    NoOFLanes:{
        text: 'No. of Lanes (Both Directions)',
        id: 'NoOFLanes'
    },
    PavementType:{
        text: 'Pavement Type',
        id: 'PavementType'
    },
    RefMarker:{
        text: 'Reference Marker',
        id: 'RefMarker'
    },
    ShoulderType:{
        text: 'Shoulder Type',
        id: 'ShoulderType'
    },
    SlabThickness:{
        text: 'Slab Thickness (in.)',
        id: 'SlabThickness'
    },
    Surfacetexture:{
        text: 'Surface Texture',
        id: 'Surfacetexture'
    },
    VerticalAlign:{
        text: 'Vertical Alignment',
        id: 'VerticalAlign'
    }
};
let project_collection ={
    CRCP: {
        text:"CRCP",
        id:"CRCP",
        sub: ["Level 1 Sections","General Sections"]
    },
    CPCD: {
        text:"CPCD",
        id:"CPCD",
        sub: []
    },
    ExperimentalSections: {
        text:"Experimental Sections",
        id:"ExperimentalSections",
        sub: ["Coarse Aggregate Effects","LTPP Sections","Steel Percentage Effects","Construction Season Effects"]
    },
    SpecialSections: {
        text:"Special Sections",
        id:"Special Sections",
        sub: ["Fast Track Pavement","Bonded Overlay","Unbonded Overlay","Whitetopping","Precast Pavement","Cast-in-Place Prestressed","Recycled Concrete Pavement","RCC Pavement"]
    }
};
let project_feature = {
    "Level 1 Sections": ["Deflections","LTE","Cracks","Pictures"],
    "all":["Plans","Reports","Pictures"]
}
let project_feature_collection = {
    Deflections:{
        text: "Deflections",
        id: "Deflections",
        show: queryfromsource
    },
    LTE:{
        text: "Load Transfer Efficiency",
        id: "LTE",
        show: queryfromsource
    },
    Cracks:{
        text: "Crack Information",
        id: "Cracks",
        show: queryfromsource
    },
    Pictures:{
        text: "Pictures",
        id: "Pictures",
        show: queryfromsource
    },
    Plans:{
        text: "Plans",
        id: "Plans",
        show: queryfromsource
    },
    Reports:{
        text: "Reports",
        id: "Reports",
        show: queryfromsource
    }
}

let filters =[];
// map

let us,us_dis;
let map_conf ={
    margin: {top: 0, right: 0, bottom: 0, left: 0},
    width: window.innerWidth,
    height: window.innerHeight,
    scalezoom: 1,
    widthView: function(){return this.width*this.scalezoom},
    heightView: function(){return this.height*this.scalezoom},
    widthG: function(){return this.widthView()-this.margin.left-this.margin.right},
    heightG: function(){return this.heightView()-this.margin.top-this.margin.bottom},
    },
    plotCountyOption = true
// menu