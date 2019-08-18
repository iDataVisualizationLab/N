function maketooltip(info, properties) {
    if (!properties.NAME) {
        let variable_display = ["CCSJ", "ConcreteCAT", "ConstYear", "County", "Direction", "District", "Drainage", "GPSEnd", "GPSStart", "Highway", "HorizontalAlign", "NoOFLanes", "PavementType", "RefMarker", "ShoulderType", "SlabThickness", "Surfacetexture", "VerticalAlign"]
        let ta = d3.select(info).selectAll('.detail_div')
            .data([properties.data]);
        ta.exit().remove();
        let n_ta = ta.enter().append('div').attr('class', 'detail_div');
        n_ta.append('h5').attr('class','section_id');
        n_ta.append('table').append('tbody');
        n_ta.append('div').attr('class','tip_feature');

        let ta_tr = n_ta.merge(ta).select('tbody').selectAll('tr')
            .data(d => variable_display.map(e => [
                {class: 'align-right', val: variable_collection[e].text}, {
                class: 'align-left',
                val: variable_collection[e].type==='gps'?ol.coordinate.toStringHDMS([d[variable_collection[e].id][COL_LONG],d[variable_collection[e].id][COL_LAT]]):d[variable_collection[e].id]
            }]));
        ta_tr.exit().remove();
        let ta_tr_n = ta_tr.enter().append('tr');

        let ta_tr_td = ta_tr_n.merge(ta_tr).selectAll('td')
            .data(d => d);
        ta_tr_td.exit().remove();
        let ta_tr_td_n = ta_tr_td.enter().append('td');
        ta_tr_td_n.append('span');
        ta_tr_td_n
            .merge(ta_tr_td)
            .attr('class', d => d.class)
            .select('span').text(d => d.val);

        ta = n_ta.merge(ta);
        ta.select('.section_id').text(d=>d.sectionID);
        let fdiv = ta.select('.tip_feature').selectAll('.feature_div').data(d=>(project_feature[d.DataType]||project_feature["all"]).map(k=>{return{id:k,val:d.sectionID}}));
        fdiv.exit().remove();
        let fdiv_n = fdiv.enter().append('div')
            .attr('class','tip_feature');
        fdiv_n.append('h6').attr('class','tip_feature_label');
        fdiv_n.append('div').attr('class','tip_feature_content grid-x medium-up-3 large-up-4');

        fdiv = fdiv_n.merge(fdiv);
        fdiv.select('.tip_feature_label').text(d=>project_feature_collection[d.id].text);
        fdiv.select('.tip_feature_content').each(function(d){project_feature_collection[d.id].show(d.val,d3.select(this))});



    }
}

/**
 * To use this please add Google Maps API and D3
 * For instance:
 * <script src="//maps.google.com/maps/api/js?key=AIzaSyAA-YOLIVTWEZLS7316nJfEX3C9FedRkLg"></script>
 * <script src="//d3js.org/d3.v3.min.js"></script>
 * Need to implement the "draw" event which returns:
 * {"layer": layer, "transform": transform}
 * The layer is the div (that is overlay on the map)
 * The g element for the marker should have a class named .marker and position style is absolute
 * .marker {position: absolute;}
 */

class GoogleMap {
    /**
     * Create a new map and place it to the div id
     * @param theDivId
     */

    constructor(theDivId, layerType) {
        let self = this;
        self.view = new ol.View({
            center: [0, 0],
            zoom: 1
        });
        self.map = new ol.Map({
            target: theDivId,
            layers: [
                new ol.layer.Tile({
                    preload: 4,
                    source: new ol.source.OSM()
                }),
                // new ol.layer.Tile({
                //     source: new ol.source.Stamen({
                //         layer: 'terrain-labels'
                //     })
                // })
            ],
            view: self.view
        });
        self.map.addControl(new ol.control.ScaleLine({units: 'us'}));
        self.vectorSource = new ol.layer.Vector({});
        // self.draw = new ol.interaction.Draw({
        //     source: self.vectorSource,
        //     type: 'LineString'
        // });
        //Add the marker style with position as absolute
        // self.map.addInteraction(self.draw);

        self.dispatch = d3.dispatch("draw");

        if(!layerType) layerType = "svg";
        self.layerType = layerType;
        self.map.data=[];
        self.map.data.remove = ()=>{
            this.length = 0;
            self.map.removeOverlay(self.data.layer);
        };
        self.map.data.styles = {
            'Polygon':new ol.style.Style({
                stroke: new ol.style.Stroke({
                    color: 'black',
                    width: 1
                })})};
        self.map.data.styleFunction = function(feature) {
            return this.styles[feature.getGeometry().getType()];
        };
        self.map.data.setStyle = function(newstyle,single){
            if (single){
                this.styles = self.json2style(newstyle);
                this.styleFunction = this.styles;
            }else{
                for (let i in newstyle)
                    this.styles[i] = self.json2style(newstyle[i]);
                this.styleFunction = function(feature) {
                    return this.styles[feature.getGeometry().getType()];
                }
            }
        }
        self.map.data.addGeoJson = function (geoJsonObject){
            var vectorSource = new ol.source.Vector({
                features: new ol.format.GeoJSON().readFeatures(geoJsonObject,{featureProjection: 'EPSG:3857'})
            });
            let  vectorLayer = new ol.layer.Vector({
                source: vectorSource,
                style: this.styleFunction
            });
            this.layer = vectorLayer;
            this.layer.setMap(self.map);
        };

        self.createMarker();
        self.map.on('pointermove', showInfo);

        function showInfo(event) {
            var info = self.tooltip.getElement();
            var features = self.map.getFeaturesAtPixel(event.pixel);
            var coordinate = event.coordinate;
            // var hdms = ol.coordinate.toStringHDMS(ol.proj.toLonLat(coordinate));
            if (!features) {
                info.innerText = '';
                info.classList.add("hide");
                return;
            }
            self.tooltip.setPosition(coordinate)
            // d3.select(info).styles({
            //     top: coordinate[0]+'px',
            //     right: coordinate[1]+'px'
            // });
            var properties = features[0].getProperties();
            maketooltip(info, properties);
            info.classList.remove("hide");
        }

    }
    jsUcfirst(string)
    {
        return string.charAt(0).toUpperCase() + string.slice(1);
    }
    json2style(styleObject){
        let temp_style = {};
        Object.keys(styleObject).forEach(k=>{
            const key_arrr=  k.split('-');
            if (!temp_style[key_arrr[0]])
                temp_style[key_arrr[0]] = {};
            temp_style[key_arrr[0]][key_arrr[1]]=styleObject[k];

        });
        let temp_op ={};
        Object.keys(temp_style).forEach(k=>{
            temp_op[k] = new ol.style[this.jsUcfirst(k)](temp_style[k]);
        });
        return new ol.style.Style(temp_op);
    }
    /**
     * Fit the map with the list of long and lat inform of array of points.
     * @param longLat
     * @param longAccessor
     * @param latAccessor
     */
    fitBounds(longLat0, longAccessor, latAccessor) {
        let longLat = longLat0.slice();
        if (longAccessor && latAccessor) {
            longLat = longLat.map(d => [longAccessor(d), latAccessor(d)]);
        }
        longLat.forEach((d,i) => {
            let long = d[0];
            let lat = d[1];
            longLat[i] = ol.proj.transform([parseFloat(long), parseFloat(lat)], 'EPSG:4326', 'EPSG:3857');
        });
        //Fit

        var feature = new ol.Feature({
            geometry: new ol.geom.Polygon([longLat])
        })
        var polygon = (feature.getGeometry());
        this.view.fit(polygon);
    }
    latlong2ol(arr){
        return arr.map(d=>ol.proj.transform([parseFloat(d.lng), parseFloat(d.lat)], 'EPSG:4326', 'EPSG:3857'))
    }
    createMarker() {
        let self = this;
        self.tooltip = new ol.Overlay({
            element: document.getElementById('info'),
            stopEvent: false
        });
        self.map.addOverlay(self.tooltip);
        //Add the container when the overlay is added to the map
        // self.overlay.onAdd = function () {
        //     this.map.addOverlay()
        //     let overlayLayer = d3.select(this.getPanes().overlayLayer).append(self.layerType).style("overflow", "visible");
        //     overlayLayer.append("g").attr("id", "contoursGroup");
        //     let overlayMouseTarget = d3.select(this.getPanes().overlayMouseTarget).append(self.layerType).style("overflow", "visible");
        //     overlayMouseTarget.append("g").attr("id", "wellsGroup");
        //
        //     self.overlay.draw = function () {
        //         let projection = this.getProjection();
        //         self.dispatch.call("draw", null, {"overlayLayer": overlayLayer,"overlayMouseTarget": overlayMouseTarget, "transform": transform, "fromLatLngToDivPixel": fromLatLngToDivPixel});
        //         //Transform function
        //         function transform(longAccessor, latAccessor){
        //             return function transform(d) {
        //                 d = new google.maps.LatLng(latAccessor(d), longAccessor(d));
        //                 d = projection.fromLatLngToDivPixel(d);
        //                 return d3.select(this).attr("transform", `translate(${d.x}, ${d.y})`);
        //             }
        //         }
        //         function fromLatLngToDivPixel(lat, long){
        //             let d = new google.maps.LatLng(lat, long);
        //             d = projection.fromLatLngToDivPixel(d);
        //             return d;
        //         }
        //     };
        // };
        // //Bind our overlay to the map...
        // self.overlay.setMap(this.map);
    }
    updateMap() {
        this.overlay.draw();
    }
}