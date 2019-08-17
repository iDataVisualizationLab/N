// data variable
let basearr=[],basedata={},dp,
    COL_LAT = 'lat',
    COL_LONG = 'lng',
    filter={};

let variablecollection ={
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
// map

let us;
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