d3.TimeSpace = function () {
    let graphicopt = {
            margin: {top: 0, right: 0, bottom: 0, left: 0},
            width: 1500,
            height: 1000,
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
            },

            opt: {
                // dim: 2, // dimensionality of the embedding (2 = default)
                windowsSize: 1,
            },radaropt : {
                // summary:{quantile:true},
                mini:true,
                levels:6,
                gradient:true,
                w:40,
                h:40,
                showText:false,
                margin: {top: 0, right: 0, bottom: 0, left: 0},
            },
            radarTableopt : {
                // summary:{quantile:true},
                mini:true,
                levels:6,
                gradient:true,
                w:40,
                h:40,
                showText:false,
                margin: {top: 0, right: 0, bottom: 0, left: 0},
            },
            curveSegment: 10,
            linkConnect: false,
            isSelectionMode: false,
            isCurve: false,
            filter:{ distance:0.5},
            component:{
                dot:{size:5,opacity:0.9},
                link:{size:1,opacity:0.2, highlight:{opacity:3}},
            },
            serviceIndex: 0,
            tableLimit: 1500,
            iscompareMode: false
        },
        controlPanelGeneral = {
            // linkConnect: {text: "Link type", type: "selection", variable: 'linkConnect',labels:['--none--','Straight'],values:[false,'straight'],
            linkConnect: {text: "Link type", type: "selection", variable: 'linkConnect',labels:['--none--','Straight','Curve'],values:[false,'straight','curve'],
                width: '100px',
                callback:()=>{visiableLine(graphicopt.linkConnect); graphicopt.isCurve = graphicopt.linkConnect==='curve';toggleLine();render(!isBusy);isneedrender = true;}},
            linkOpacity:{text:"Link opacity", range:[0.1,1],id:'Link_opacity', type:"slider", variableRoot: graphicopt.component.link,variable: 'opacity',width:'100px',step:0.1,
                callback:onlinkopacity},
            dim: {text: "Dimension", type: "switch", variable: 'dim',labels:['2D','3D'],values:[2,2.5], width: '100px',callback:()=>{
                    preloader(true,10,'Change dimension projection...','#modelLoading');
                    obitTrigger=true;
                    setTimeout(()=>{
                        start(!needRecalculate || graphicopt.opt.dim===2.5);
                        preloader(false,undefined,undefined,'#modelLoading');
                    })
            }},
            // windowsSize: {
            //     text: "Windows size",
            //     range: [1, 21],
            //     type: "slider",
            //     variable: 'windowsSize',
            //     width: '100px',callback:()=>{master.stop(); windowsSize = graphicopt.opt.windowsSize; handle_data_TimeSpace(tsnedata);}
            // },
        },
        formatTable = {
            'opacity':function(d){return d3.format('.1f')(d)},
            'time': function(d){return millisecondsToStr(d)},
            'totalTime': function(d){return millisecondsToStr(d)},
            'iteration': function(d){return d},
            'stopCondition': function(d) {return '1e'+Math.round(d)}
        },tableWidth = 200
        ,
        renderQueue_link={line:false,curve:false},
        isneedCompute=true,
        runopt = {},
        isBusy = false,
        stop = false;
    let modelWorker,plotlyWorker,workerList=[],colorscale,reset;
    let master={},solution,datain=[],filterbyClustername=[],visibledata,table_info,path,cluster=[],scaleTime;
    let xscale=d3.scaleLinear(),yscale=d3.scaleLinear(), scaleNormalTimestep=d3.scaleLinear();
    // grahic
    let camera,isOrthographic=false,scene,axesHelper,axesTime,gridHelper,clusterAnnotation,controls,raycaster,INTERSECTED =[] ,mouse ,
        points,lines,linesGroup,curveLines,curveLinesGroup,straightLines,straightLinesGroup,curves,updateLine,
        scatterPlot,colorarr,renderer,view,zoom,background_canvas,background_ctx,front_canvas,front_ctx,svg,clusterMarker;
    let fov = 100,
    near = 0.1,
    far = 7000;
    //----------------------force----------------------
    let forceColider,animateTrigger=false;
    //----------------------color----------------------
    let colorLineScale = d3.scaleLinear().interpolate(d3.interpolateCubehelix);
    let createRadar,createRadarTable;
    //----------------------drag-----------------------
    let allSelected_Data;
    var lassoTool,mouseoverTrigger = true,iscameraMove = false;
    let drag = ()=>{
        function dragstarted(d) {
            isneedrender = true;
            // do something
            mouseoverTrigger = false;
            let coordinator = d3.mouse(this);
            mouse.x = (coordinator[0]/graphicopt.width)*2- 1;
            mouse.y = -(coordinator[1]/graphicopt.height)*2+ 1;
            lassoTool.lassoPolygon = [coordinator];
            lassoTool.start();
            lassoTool.isend = false;
            lassoTool.needRender = true;
        }

        function dragged(d) {
            let coordinator = d3.mouse(this);
            mouse.x = (coordinator[0]/graphicopt.width)*2- 1;
            mouse.y = -(coordinator[1]/graphicopt.height)*2+ 1;
            lassoTool.lassoPolygon.push(coordinator);
            lassoTool.needRender = true;
            isneedrender = true;

        }

        function dragended(d) {
            mouseoverTrigger = true;
            freezemouseoverTrigger = false;
            // showMetricsArr_plotly(allSelected_Data)
            lassoTool.end();
        }

        return d3.drag().touchable(navigator.maxTouchPoints)
            .on("start", dragstarted)
            .on("drag", dragged)
            .on("end", dragended);
    };
    function handle_selection_switch(trigger){
        controls.enabled = !trigger;
        if (trigger){
            if (reset)
                lassoTool = new THREE.LassoTool( camera, points, graphicopt ,svg.select('#modelWorkerScreen_lassotool'));
            reset= false;
            freezemouseoverTrigger =  true;
            d3.select('#modelWorkerScreen').call(drag());
            if (selection_radardata)
                renderRadarSummary(selection_radardata.dataRadar,selection_radardata.color,selection_radardata.boxplot)
            // d3.select('#modelSelectionInformation').classed('hide',false);
            // selection tool
        }else{
            if(lassoTool)
                lassoTool.reset();
            freezemouseoverTrigger = false;
            renderRadarSummary([]);
            d3.select('#modelWorkerScreen').on('mousedown.drag', null);
            d3.select('#modelWorkerScreen')
                .on('mouseover',()=>{isneedrender = true;mouseoverTrigger = true})
                .on('mousemove', function(){
                let coordinator = d3.mouse(this);
                mouse.x = (coordinator[0]/graphicopt.width)*2- 1;
                mouse.y = -(coordinator[1]/graphicopt.height)*2+ 1;
                    mouseoverTrigger = true;
                    isneedrender = true;
            }).on('mouseleave',()=>{mouseoverTrigger = false})
                .on('click');
            // d3.select('#modelSelectionInformation').classed('hide',true);
            // d3.select('#modelWorkerScreen').on('touchstart.drag', null);
        }
    }

    let obitTrigger= true;
    let linkConnect_old;
    function reduceRenderWeight(isResume){
        if (isResume){
            svg.select('#modelClusterLabel').classed('hide',false);
            graphicopt.linkConnect = linkConnect_old;
        }else{
            svg.select('#modelClusterLabel').classed('hide',true);
            linkConnect_old = graphicopt.linkConnect;
            graphicopt.linkConnect = false;
        }
        controlPanelGeneral.linkConnect.callback();
    }
    function resetFilter(){
        d3.select('#modelFilterBy').node().options.selectedIndex = 0;
        d3.select('#modelFilterBy').dispatch('change');
    }
    function start(skipRecalculate) {
        isneedCompute = true;
        renderQueue_link={line:false,curve:false}
        resetFilter();
        interuptAnimation();
        axesHelper.toggleDimension(graphicopt.opt.dim);
        gridHelper.parent.visible = (graphicopt.opt.dim==2.5);
        // handle_selection_switch(graphicopt.isSelectionMode);
        if (graphicopt.opt.dim===2) {
            controls.enableRotate = false;
            controls.screenSpacePanning  = true;

            controls.target.set( 0, 0, 0 );
            controls.enableZoom = true;
            controls.mouseButtons.LEFT = THREE.MOUSE.PAN;
            controls.touches.TWO = THREE.TOUCH.DOLLY_PAN;
        }else{
            controls.enableRotate = true;
            controls.screenSpacePanning  = false;
            controls.target.set( 0, 0, 0 );
            controls.enableZoom = true;
            controls.mouseButtons.LEFT = THREE.MOUSE.ROTATE;
            controls.touches.TWO = THREE.TOUCH.DOLLY_PAN;
        }
        if (obitTrigger) {
            setUpZoom();
            obitTrigger = false;
        }

        svg.select('#modelWorkerScreen_svg_g').selectAll('*').remove();
        if(skipRecalculate) {
            render(true);
            reduceRenderWeight(true);
            return;
        }
        reduceRenderWeight();
        mouseoverTrigger = false;
        terminateWorker();
        preloader(true,10,'Transfer data to projection function','#modelLoading');
        let firstReturn = true;

        let opt = JSON.parse(JSON.stringify(graphicopt.opt)); // clone option
        opt.dim = Math.floor(opt.dim);

        loadProjection(opt,function (data){
            if (!data) {
                modelWorker = new Worker(self.workerPath);
                workerList[0] = modelWorker;
                // modelWorker.postMessage({action:"initcanvas", canvas: offscreen, canvasopt: {width: graphicopt.widthG(), height: graphicopt.heightG()}}, [offscreen]);
                modelWorker.postMessage({
                    action: "initcanvas",
                    canvasopt: {width: graphicopt.widthG(), height: graphicopt.heightG()}
                });
                console.log(`----inint ${self.workerPath} with: `, graphicopt.opt)


                // modelWorker.postMessage({action: "colorscale", value: colorarr});
                // adjust dimension -------------

                // end - adjust dimension
                modelWorker.postMessage({
                    action: "initDataRaw",
                    opt: opt,
                    value: datain,
                    labels: datain.map(d => d.cluster),
                    clusterarr: cluster.map(d => d.__metrics.normalize)
                });
                // let labelsInput = [];initDataRawinitDataRaw
                // datain.forEach(d=>{if(d.timestep===0) labelsInput.push(d.cluster)});
                // modelWorker.postMessage({action: "initPartofData",opt:opt, value: datain,labels: labelsInput, clusterarr: cluster.map(d=>d.__metrics.normalize)});
                modelWorker.addEventListener('message', ({data}) => {
                    switch (data.action) {
                        case "render":
                            freezemouseoverTrigger = true;
                            if (firstReturn) {
                                preloader(false, undefined, undefined, '#modelLoading');
                                firstReturn = false;
                            }
                            if (!isBusy) {
                                isBusy = true;
                                xscale.domain(data.xscale.domain);
                                yscale.domain(data.yscale.domain);
                                solution = data.sol;
                                updateTableOutput(data.value);
                                isneedCompute = true;
                                render();
                                isBusy = false;
                            }
                            break;
                        case "stable":
                            if (firstReturn) {
                                preloader(false, undefined, undefined, '#modelLoading');
                                firstReturn = false;
                                if (data.value) {
                                    xscale.domain(data.xscale.domain);
                                    yscale.domain(data.yscale.domain);
                                    updateTableOutput(data.value);
                                }
                            }
                            modelWorker.terminate();
                            freezemouseoverTrigger = false;
                            solution = data.sol || solution;
                            isneedCompute = true;
                            render(true);
                            reduceRenderWeight(true);
                            break;
                        default:
                            break;
                    }
                })
            }else{
                if (firstReturn) {
                    preloader(false, undefined, undefined, '#modelLoading');
                    firstReturn = false;
                    if (data.value) {
                        xscale.domain(data.xscale.domain);
                        yscale.domain(data.yscale.domain);
                        updateTableOutput(data.value);
                    }
                }
                freezemouseoverTrigger = false;
                solution = data.sol || solution;
                isneedCompute = true;
                render(true);
                reduceRenderWeight(true);
            }
        })
    }

    let euclideandistanceHis=[];
    let umapdistanceHis=[];

    function makeArrowMarker() {
        let arrow = svg.select('defs').selectAll('marker.arrow').data(cluster_info);
        arrow.exit().remove();
        arrow.enter().append('marker').attrs({
            class:'arrow',
            markerWidth: "10",
            markerHeight: "10",
            refX: "18",
            refY: "3",
            orient: "auto",
            markerUnits: "strokeWidth"
        }).append('path').attr('d', "M0,0 L0,6 L9,3 z");
        svg.select('defs').selectAll('marker.arrow')
            .attr('id', d => "arrow" + d.name)
            .select('path')
            .style('fill', d => colorCluster(d.name));
    }

    master.init = function(arr,clusterin) {
        preloader(true,1,'Prepare rendering ...','#modelLoading');

        makeDataTableFiltered()

        // prepare data
        needRecalculate = true;
        reset = true;
        mouseoverTrigger = false;
        solution = [];
        datain = arr;
        datain.sort((a,b)=>a.timestep-b.timestep);
        mapIndex = [];
        datain.forEach((d,i)=>d.show?mapIndex.push(i):undefined);
        handle_cluster (clusterin, datain);
        handle_data(datain);
        updateTableInput();
        path = {};

        // make path object and compute euclideandistance
        let euclideandistance_range = [+Infinity,0];
        datain.forEach(function (target, i) {
            target.__metrics.position = [0,0,0];
            if ((target.name+'__'+(target.timestep?'stop1':'wt'))===cluster[target.cluster].leadername)
                cluster[target.cluster].__metrics.indexLeader = i;
            if (!path[target.name]) {
                path[target.name] = [];
                path[target.name].euclideandistance = 0;
            }else{
                path[target.name].euclideandistance += distance(datain[_.last(path[target.name]).index],target);
                euclideandistance_range[0] = Math.min(euclideandistance_range[0], path[target.name].euclideandistance);
                euclideandistance_range[1] = Math.max(euclideandistance_range[1], path[target.name].euclideandistance);
            }
            path[target.name].push({
                name: target.name,
                index:i,
                __timestep: target.__timestep,
                timestep: target.timestep,
                value: [0,0,0],
                cluster: target.cluster
            });
        });
        euclideandistancerange.domain(euclideandistance_range);
        euclideandistanceHis = getHistdata(Object.keys(path).map(kp=>path[kp].euclideandistance));
        drawHis('#modelDistanceFilter_euclidean_svg',euclideandistanceHis,'euclideandistance')
        // console.log(datain.filter(d=>d[0]===-1))
        xscale.range([-graphicopt.widthG()/2,graphicopt.widthG()/2]);
        yscale.range([-graphicopt.heightG()/2,graphicopt.heightG()/2]);
        scaleNormalTimestep.range([-graphicopt.widthG()/2,graphicopt.widthG()/2]);
        colorarr = colorscale.domain().map((d, i) => ({name: d, order: +d.split('_')[1], value: colorscale.range()[i]}))
        colorarr.sort((a, b) => a.order - b.order);
        //----------------------color----------------------
        createRadar = _.partialRight(createRadar_func,'timeSpace radar',graphicopt.radaropt,colorscale);
        createRadarTable = _.partialRight(createRadar_func,'timeSpace radar',graphicopt.radarTableopt,colorscale);

        // prepare force
        forceColider = d3.forceSimulation()
            .alphaDecay(0.005)
            .alpha(0.1)
            .force('charge', d3.forceManyBody())
            .force('collide', d3.forceCollide().radius(graphicopt.radarTableopt.w/2).iterations(10))
            .on('tick', function () {
                if (isdrawradar&&svgData&&animateTrigger){
                    animateTrigger=false;
                    drawRadar(svgData);
                }
            }).stop();
        // prepare screen
        setTimeout(function(){
            isneedrender = false;
            far = graphicopt.width/2 /Math.tan(fov/180*Math.PI/2)*10;
            camera = new THREE.PerspectiveCamera(fov, graphicopt.width/graphicopt.height, near, far + 1);
            // far = graphicopt.width/2*10;
            // camera = new THREE.OrthographicCamera(graphicopt.width / - 2, graphicopt.width / 2, graphicopt.height / 2, graphicopt.height / - 2, near, far + 1);
            scene = new THREE.Scene();
            axesHelper = createAxes( graphicopt.widthG()/4 );
            axesTime = createTimeaxis();
            scene.background = new THREE.Color(0xffffff);
            scatterPlot = new THREE.Object3D();
            scatterPlot.add( axesHelper );
            scatterPlot.rotation.y = 0;
            points = createpoints(scatterPlot);
            straightLinesGroup = new THREE.Object3D();
            curveLinesGroup = new THREE.Object3D();
            scatterPlot.add( straightLinesGroup );
            scatterPlot.add( curveLinesGroup );
            preloader(true,1,'Straight link create ...','#modelLoading');
            straightLines = createLines(straightLinesGroup);
            preloader(true,1,'Curve link create ...','#modelLoading');
            curveLines = createCurveLines(curveLinesGroup);
            lines = straightLines;
            linesGroup = straightLinesGroup;
            toggleLine();

            // clusterAnnotation = clustername();
            gridHelper = new THREE.GridHelper( graphicopt.heightG(), 10 );
            gridHelper.position.z = scaleNormalTimestep.range()[0];
            gridHelper.rotation.x = -Math.PI / 2;
            scene.add( new THREE.Object3D().add(gridHelper ));
            scene.add(scatterPlot);

            // Add canvas
            renderer = new THREE.WebGLRenderer({canvas: document.getElementById("modelWorkerScreen")});
            renderer.setSize(graphicopt.width, graphicopt.height);
            renderer.render(scene, camera);
            // zoom set up
            view = d3.select(renderer.domElement);
            axesHelper.toggleDimension(graphicopt.opt.dim);
            // zoom = d3.zoom()
            //     .scaleExtent([getScaleFromZ(far), getScaleFromZ(10)])
            //     .on('zoom', () =>  {
            //         let d3_transform = d3.event.transform;
            //         zoomHandler(d3_transform);
            //     });
            raycaster = new THREE.Raycaster();
            raycaster.params.Points.threshold = graphicopt.component.dot.size;
            mouse = new THREE.Vector2();

            controls = new THREE.OrbitControls(camera, renderer.domElement);
            // disable the tabIndex to avoid jump element
            d3.select(renderer.domElement).attr('tabindex',null);
            let mouseoverTrigger_time;
            controls.addEventListener("change", () => {
                isneedrender = true;
                freezemouseoverTrigger=true;
                iscameraMove = true;
                if (mouseoverTrigger_time)
                    clearTimeout(mouseoverTrigger_time);
                mouseoverTrigger_time= setTimeout(function(){freezemouseoverTrigger=false;},10)
            });
            setUpZoom();
            stop = false;

            svg = d3.select('#modelWorkerScreen_svg').attrs({width: graphicopt.width,height:graphicopt.height});
            clusterMarker = createClusterLabel();
            makeArrowMarker();

            d3.select('#modelWorkerInformation+.title').text(self.name);
            handle_selection_switch(graphicopt.isSelectionMode);

            d3.select('#modelSortBy').on("change", function () {handleTopSort(this.value)})
            d3.select('#modelFilterBy').on("change", function(){handleFilter(this.value)});
            // d3.select("p#filterList+.copybtn").on('click',()=>{
            //     var copyText = document.getElementById("filterList");
            //     var textArea = document.createElement("textarea");
            //     textArea.value = copyText.textContent;
            //     document.body.appendChild(textArea);
            //     textArea.select();
            //     document.execCommand("Copy");
            //     textArea.remove();
            //     M.toast({html: 'Copied to clipboard'})
            // });

        drawSummaryRadar([],[],'#ffffff');
        start();
            animate();
        needRecalculate = false;
        },1);
        return master;
    };
    function toggleLine(){
        if (!graphicopt.isCurve)
        {
            visiableLine(false);
            datain.forEach((d, i) => {
                straightLines[d.name].visible = curveLines[d.name].visible;
                if (curveLines[d.name].material)
                    straightLines[d.name].material.opacity = curveLines[d.name].material.opacity;
            });
            lines = straightLines;
            linesGroup = straightLinesGroup;
            updateLine = updateStraightLine;
            visiableLine(graphicopt.linkConnect);
            isneedCompute = (!renderQueue_link.line);
            renderQueue_link.line = true;
        }else{
            visiableLine(false);
            datain.forEach((d, i) => {
                curveLines[d.name].visible = straightLines[d.name].visible;
                if (straightLines[d.name].material)
                    curveLines[d.name].material.opacity = straightLines[d.name].material.opacity;
            });
            lines = curveLines;
            linesGroup = curveLinesGroup;
            updateLine = updateCurveLine;
            visiableLine(graphicopt.linkConnect);
            isneedCompute = (!renderQueue_link.curve);
            renderQueue_link.curve = true;
        }
    }
    function handleFilter(key){
        d3.select('#distanceFilterHolder').classed('hide',true);
        switch (key) {
            case 'groups':
                const lists = d3.keys(path).filter(d=>(path[d][0]||{cluster:undefined}).cluster!==(path[d][1]||{cluster:undefined}).cluster);
                highlightGroupNode(lists);
                break;
            case "wt":
                highlightGroupNode([],0);
                break;
            case "stop1":
                highlightGroupNode([],1);
                break;
            case "umapDistance":
                d3.selectAll('.modelDistanceFilter_svg').classed('hide',true);
                d3.select('#modelDistanceFilter_projection_svg').classed('hide',false);
                d3.select('#distanceFilterHolder').classed('hide',false); // reuse distance filter
                let filteredumap =d3.keys(path).filter(d=>distancerange(path[d].distance)>=graphicopt.filter.distance);
                d3.select('#distanceFilterHolder').select('span.num').text(filteredumap.length);
                highlightGroupNode(filteredumap);
                break;
            case "euclideanDistance":
                d3.selectAll('.modelDistanceFilter_svg').classed('hide',true);
                d3.select('#modelDistanceFilter_euclidean_svg').classed('hide',false);
                d3.select('#distanceFilterHolder').classed('hide',false); // reuse distance filter
                let filteredeuclidean =d3.keys(path).filter(d=>euclideandistancerange(path[d].euclideandistance)>=graphicopt.filter.distance);
                d3.select('#distanceFilterHolder').select('span.num').text(filteredeuclidean.length);
                highlightGroupNode(filteredeuclidean);
                break;
            default:
                if (globalFilter[key])
                    highlightGroupNode(_.flatten([globalFilter[key],keyGenes]));
                else
                    highlightGroupNode([]);
                break;
        }
    }
    let keyGenes = "AT1G34370";
    function drawHis(div,data,key){
        let height = 10;
        let width = 20;
        let svg = d3.select(div);
        var x = d3.scaleLinear()
            .domain(d3.extent(data.arr, function(d) { return d[0]; }))
            .range([ 0, width ]);

        // Add Y axis
        var y = d3.scaleSqrt()
            .domain([0, d3.max(data.arr, function(d) { return d[1]; })])
            .range([ height, 2 ]);

        let his = svg.select('path.his');
        let marker = svg.select('line.marker');
        if (his.empty()) {
            his = svg.append('path').attr('class', 'his');
            marker = svg.append('line')
                .attr('class','marker')
                .attrs({
                    x2: 0,
                    x1: 0,
                    y2: y.range()[0],
                    y1: y.range()[1],
                }).style('stroke-dasharray',2)
                .style('vector-effect','non-scaling-stroke')
                .style('stroke','black');
            ;
        }
        his
            .datum(data.arr).attr('d',d3.area()
            .x(function(d) { return x(d[0]) })
            .y0(y(0))
            .y1(function(d) { return y(d[1]) })
        ).style('fill','#dddddd');
        marker.datum(path[keyGenes][key])
            .attrs(d=>({
                x2: x(d),
                x1: x(d)
            }))
    }
    function handleTopSort(mode){
        let top =[];
        switch (mode) {
            case 'Distance Travel':
                for (let k in path){
                    if (path[k].distance)
                        top.push({key: path[k][0].name,value:path[k].distance});
                }

                break;
            case 'Change status':
                for (let k in path){
                    if (path[k].length>1)
                        top.push({key: path[k][0].name,value:path[k].length});
                }

                break;
            default:
                break
        }
        top.sort((a,b)=>b.value-a.value).forEach((d,i)=>d.order = i);
        top = top.slice(0,10);// get top 10
        updateTop10(top);
    }
    let overwrite ;
    function updateTop10(data){
        d3.select('#modelRank tbody').selectAll('tr.rankItem').remove();
        let old = d3.select('#modelRank tbody').selectAll('tr.rankItem')
            .data(data,d=>d.key);
        old.exit().remove();
        let newHolder = old.enter().append('tr')
            .attr('class','rankItem');
        newHolder.append('td').attr('class','rank');
        newHolder.append('td').attr('class','name');
        newHolder.append('td').attr('class','score toolTip');

        let all = d3.select('#modelRank').selectAll('tr.rankItem')
            .style('order',d=>d.order)
            .on('mouseover',d=>(overwrite=path[d.key],highlightNode(path[d.key])))
            .on('mouseout',d=>(overwrite=undefined));
        all.select('.rank').style('font-size',d=>d.order>2?'unset':`${1.5-d.order*0.2}rem`).html((d,i)=>`${d.order+1}<sup>${ordinal_suffix_of(d.order+1,true)}</sup>`)
        all.select('.name').text(d=>d.key)
        all.select('.score').attr('data-title',d=>d.value).text(d=>d.value%1?d3.format('.2s')(d.value):d.value)

    }

    function handle_cluster(clusterin,data){
        cluster = clusterin;
        cluster.forEach(d=>d.__metrics.projection = {x:0,y:0});
        let nesradar = d3.nest().key(d=>d.cluster).rollup(d=>d.length).entries(data);
            nesradar.forEach(d=> {cluster[d.key].total_radar = d.value});
    }
    // Three.js render loop
    function createAxes(length){
        var material = new THREE.LineBasicMaterial( { color: 0x000000 } );
        var geometry = new THREE.BufferGeometry().setFromPoints(  [
            new THREE.Vector3( 0, 0, 0), new THREE.Vector3( length, 0, 0),
            new THREE.Vector3( 0, 0, 0), new THREE.Vector3( 0, length, 0),
            new THREE.Vector3( 0, 0, 0), new THREE.Vector3( 0, 0, length)]);
        let axesHelper = new THREE.LineSegments( geometry, material );
        axesHelper.toggleDimension = function (dim){
            axesTime.visible = false;
            if (dim===2.5){
                axesHelper.visible = false;
                axesTime.visible = true;
            }else if (dim===3){
                axesHelper.visible = true;
                axesHelper.geometry.dispose();
                axesHelper.geometry = new THREE.BufferGeometry().setFromPoints( [
                    new THREE.Vector3( 0, 0, 0), new THREE.Vector3( length, 0, 0),
                    new THREE.Vector3( 0, 0, 0), new THREE.Vector3( 0, length, 0),
                    new THREE.Vector3( 0, 0, 0), new THREE.Vector3( 0, 0, length)]);
            }else if(dim===2){
                // axesHelper.geometry.dispose();
                axesHelper.visible = false;
                // axesHelper.geometry = new THREE.BufferGeometry().setFromPoints( [
                //     new THREE.Vector3( 0, 0, 0), new THREE.Vector3( length, 0, 0),
                //     new THREE.Vector3( 0, 0, 0), new THREE.Vector3( 0, length, 0)]);
            }
        };
        return axesHelper;
    }
    function createTimeaxis(){
        var dir = new THREE.Vector3( 0, 0, 1 );
        dir.normalize();
        var origin = new THREE.Vector3( 0, 0, scaleNormalTimestep.range()[0] );
        var length = scaleNormalTimestep.range()[1]-scaleNormalTimestep.range()[0];
        var hex = 0x000000;
        var arrowGroup = new THREE.Object3D();
        var arrowHelper = new THREE.ArrowHelper( dir, origin, length, hex, 30,10 );
        arrowHelper.line.material.linewidth = 4;
        arrowGroup.add(arrowHelper);
        var loader = new THREE.FontLoader();

        loader.load( 'src/fonts/optimer_regular.typeface.json', function ( font ) {

            var textGeo = new THREE.TextGeometry( 'Distance', {
                font: font,
                size: 30,
                height: 1,
                curveSegments: 12,
                bevelEnabled: false
            } );
            textGeo.computeBoundingBox();
            textGeo.computeVertexNormals();
            textGeo = new THREE.BufferGeometry().fromGeometry( textGeo );
            let textMesh1 = new THREE.Mesh( textGeo, new THREE.MeshPhongMaterial( { color: 0xffffff, flatShading: true } ) );
            textMesh1.name = 'TimeText';
            textMesh1.rotation.x = 0;
            textMesh1.rotation.y = Math.PI/2;
            textMesh1.lookAt( camera.position );
            arrowGroup.add(textMesh1)
        } );
        scene.add( arrowGroup );
        arrowGroup.visible = false;
        return arrowGroup;
    }
    function clustername(){
        var loader = new THREE.FontLoader();
        var clusterG = {};
        loader.load( 'src/fonts/optimer_regular.typeface.json', function ( font ) {
            cluster_info.forEach((d,i)=>{
                var textGeo = new THREE.TextGeometry( clusterDescription[d.name].text, {
                    font: font,
                    size: 20,
                    height: 1,
                    curveSegments: 12,
                    bevelEnabled: false
                } );
                textGeo.computeBoundingBox();
                textGeo.computeVertexNormals();
                textGeo = new THREE.BufferGeometry().fromGeometry( textGeo );
                let textMesh1 = new THREE.Mesh( textGeo, new THREE.MeshPhongMaterial( { color: 0xffffff, flatShading: true } ) );
                textMesh1.name = d.name;
                textMesh1.rotation.x = 0;
                textMesh1.rotation.y = 0;
                textMesh1.lookAt( camera.position );
                scene.add(textMesh1)
                clusterG[d.name] = textMesh1;
            })
        } );
        return clusterG;
    }
    let radarChartclusteropt = {
        margin: {top: 10, right: 0, bottom: 10, left: 0},
        w: 300,
        h: 300,
        radiuschange: false,
        levels:6,
        dotRadius:2,
        strokeWidth:1,
        maxValue: 0.5,
        isNormalize:true,
        showHelperPoint: false,
        roundStrokes: true,
        ringStroke_width: function(d){return d3.scaleLinear().range(serviceFullList[0].range)(d)===0?0.5:0.15},
        ringColor:'black',
        fillin:0.5,
        labelFactor:0.9,
        boxplot:true,
        animationDuration:100,
        showText: true};

    function handle_data_summary(allSelected_Data) {
        return graphicopt.radaropt.schema.map((s, i) => {
            let d = allSelected_Data.map(e => e[i]>-1?e[i]:undefined);
            if (d.length) {
                return {axis: s.text, value: d3.mean(d)||0, minval: d3.min(d)||0, maxval: d3.max(d)||0};
            }else
                return {axis: s.text, value: 0, minval: 0, maxval: 0}
        });
    }
    let freezemouseoverTrigger = false;
    function highlightNode(intersects) { // INTERSECTED
        var geometry = points.geometry;
        var attributes = geometry.attributes;
        var targetfilter;
        if (intersects.length > 0 && (!visibledata||visibledata&&(targetfilter=intersects.find(d=>visibledata.indexOf(d.index)!==-1)))) {
            linesGroup.visible = true;
            let targetIndex = intersects[0].index;
            if (visibledata)
                targetIndex = targetfilter.index;
            if (INTERSECTED.indexOf(targetIndex) === -1) {
                let target = datain[targetIndex];
                // INTERSECTED.forEach((d, i) => {
                //     attributes.size.array[d] = graphicopt.component.dot.size;
                // });
                INTERSECTED = [];
                // let radarData =[];
                // let posArr =[];
                datain.forEach((d, i) => {
                    if (d.name === target.name) {
                        INTERSECTED.push(i);
                        attributes.alpha.array[i] = graphicopt.component.dot.opacity;
                        attributes.size.array[i] = graphicopt.component.dot.size*2;
                        lines[d.name].visible = true;
                        lines[d.name].material.opacity = 1;
                        lines[d.name].material.linewidth  = graphicopt.component.link.highlight.opacity;
                        // radarData.push(d);
                        // posArr.push(getpos(attributes.position.array[i*3],attributes.position.array[i*3+1],attributes.position.array[i*3+2]));
                    } else{
                        if(!visibledata || (visibledata&&visibledata.indexOf(i) !== -1)) {

                                attributes.alpha.array[i] = 0.1;
                                attributes.size.array[i] = graphicopt.component.dot.size;
                                lines[d.name].visible = false;
                                lines[d.name].material.opacity = graphicopt.component.link.opacity;
                                lines[d.name].material.linewidth = graphicopt.component.link.size;
                        }else{
                            attributes.alpha.array[i] = 0;
                            lines[d.name].visible = false;
                            lines[d.name].material.opacity = graphicopt.component.link.opacity;
                            lines[d.name].material.linewidth  = graphicopt.component.link.size;
                        }
                    }
                });
                // drawRadar(radarData,posArr);

                attributes.size.needsUpdate = true;
                attributes.alpha.needsUpdate = true;
                // add box helper
                scene.remove(scene.getObjectByName('boxhelper'));
                var box = new THREE.BoxHelper(lines[target.name], 0x000000);
                // var box3 = new THREE.Box3().setFromObject(lines[target.name]);
                // var boxSize = box3.getSize(new THREE.Vector3());
                // var boxPos = box3.getCenter(new THREE.Vector3());
                // var geometry = new THREE.BoxGeometry(boxSize.x,boxSize.y,boxSize.z);
                // var material = new THREE.MeshBasicMaterial( {color: 0xdddddd,side: THREE.BackSide} );
                //
                // var box = new THREE.Mesh( geometry, material );
                // box.position.set(boxPos.x,boxPos.y,boxPos.z);
                box.material = new THREE.LineDashedMaterial( {
                    color: 0xdddddd,
                    linewidth: 0.1,
                    scale: 1,
                    dashSize: 3,
                    gapSize: 1,
                } );
                box.name = "boxhelper";
                scene.add(box);

                // showMetrics(target.name);
                d3.select('.radarTimeSpace .selectionNum').text(target.name+"|"+(target.timestep?'stop1':'wt'))
                // showMetrics_plotly(target.name+"|"+(target.timestep?'stop1':'wt'));
                renderRadarSummary(path[target.name].map(d=>datain[d.index].__metrics),colorarr[target.cluster].value,false)
            }
        } else if (INTERSECTED.length || ishighlightUpdate) {
            ishighlightUpdate = false;
            tooltip_lib.hide(); // hide tooltip
            linesGroup.visible = !!graphicopt.linkConnect;
            // d3.select('#modelWorkerScreen_svg').selectAll().remove();
            if (visibledata){
                if (visibledata.length<graphicopt.tableLimit*2)
                    linesGroup.visible = true;
                datain.forEach((d, i) => {
                    if (visibledata.indexOf(i) !==-1 || (filterGroupsetting.timestep!==undefined && filterGroupsetting.timestep===d.__timestep)){
                        INTERSECTED.push(i);
                        attributes.alpha.array[i] = graphicopt.component.dot.opacity;
                        attributes.size.array[i] = graphicopt.component.dot.size;
                        lines[d.name].visible = filterGroupsetting.timestep===undefined;
                        lines[d.name].material.opacity = graphicopt.component.link.opacity;
                        lines[d.name].material.linewidth  = graphicopt.component.link.highlight.opacity;
                    } else {
                        attributes.alpha.array[i] = 0;
                        lines[d.name].visible = false;
                        lines[d.name].material.opacity = graphicopt.component.link.opacity;
                        lines[d.name].material.linewidth  = graphicopt.component.link.size;
                    }
                });
            }else
                datain.forEach((d, i) => {
                    attributes.alpha.array[i] = graphicopt.component.dot.opacity;
                    attributes.size.array[i] = graphicopt.component.dot.size;
                    lines[d.name].visible = true;
                    lines[d.name].material.opacity = graphicopt.component.link.opacity;
                    lines[d.name].material.linewidth  = graphicopt.component.link.size;
                });

            attributes.size.needsUpdate = true;
            attributes.alpha.needsUpdate = true;
            INTERSECTED = [];
            removeBoxHelper();
            if (graphicopt.isSelectionMode&&selection_radardata)
                renderRadarSummary(selection_radardata.dataRadar,selection_radardata.color,selection_radardata.boxplot)
            else
                renderRadarSummary([]);
        }
        isneedrender = true;
    }
    function drawRadar({data,pos,posStatic}){
        let dataRadar = [];
        let links = {};
        data.forEach((d,i)=>{
            dataRadar.push(d.__metrics);
            if(!links[d.name])
                links[d.name]=[];
            pos[i].cluster = d.clusterName;
            links[d.name].push(pos[i]);
        });
        let old = d3.select('#modelWorkerScreen_svg_g').selectAll('.timeSpaceR')
            .data(dataRadar,d=>d.name_or+'_'+d.timestep).attr('transform',(d,i)=>`translate(${pos[i].x},${pos[i].y})`);
        old.exit().remove();
        old.enter().append('g').attr('class','timeSpaceR')
            .attr('transform',(d,i)=>`translate(${pos[i].x},${pos[i].y})`)
            .each(function(d){
                createRadar(d3.select(this).select('.radar'), d3.select(this), d, {size:radarSize*2,colorfill: true});
            });

        let old_link = d3.select('#modelWorkerScreen_svg_g').selectAll('.link')
            .data(_.values(links).filter(d=>d.length===2));
        old_link.exit().remove();
        old_link.enter().append('line').attr('class','link');
        d3.select('#modelWorkerScreen_svg_g').selectAll('.link')
            .attrs(d=>({
                x1:d[0].x,x2:d[1].x,y1:d[0].y,y2:d[1].y,
                'marker-end':d=>`url(#arrow${d[1].cluster})`
            }))
    }
    function updateforce(data){
        forceColider.force('tsne', function (alpha,e,f,g,h) {
            console.log(e,f,g,h)
            data.pos.forEach((d, i) => {
                d.fx =  null;
                d.fy =  null;
                d.x +=  alpha * (data.posStatic[i].x - d.x);
                d.y +=  alpha * (data.posStatic[i].y - d.y);
                // const row =  Math.round(d.y/(4/Math.sqrt(3)));
                // d.y =row * (4/Math.sqrt(3));
                // const col = Math.round(d.x / radarSize/2);
                // d.x = (col - row%2/2)*2*radarSize;
            });
        }).alphaTarget(0.1);
    }
    // function drawsvg(data,pos){
    //     let old = d3.select('#modelWorkerScreen_svg').selectAll('.timeSpaceR')
    //         .data(data.map(d=>d.__metrics));
    //     old.exit().remove();
    //     old.enter().append('g').attr('class','timeSpaceR');
    //     d3.select('#modelWorkerScreen_svg').selectAll('.timeSpaceR')
    //         .attr('transform',(d,i)=>`translate(${pos[i].x+graphicopt.radarTableopt.w},${pos[i].y+graphicopt.radarTableopt.h / 2})`)
    //         .each(function(d){
    //             createRadar(d3.select(this).select('.radar'), d3.select(this), d, {colorfill: true});
    //         })
    // }
    let svgData;
    function getpos(x,y,z,index){
        var width = graphicopt.widthG(), height = graphicopt.heightG();
        var widthHalf = width / 2, heightHalf = height / 2;
        camera.updateMatrixWorld();
        var vector = new THREE.Vector3(x,y,z);
        vector.project(camera);

        vector.x = ( vector.x * widthHalf ) + widthHalf;
        vector.y = - ( vector.y * heightHalf ) + heightHalf;
        vector.index = index;
        return vector;
    }
    let filterGroupsetting={timestep:undefined};
    let isdrawradar = false;
    let radarSize;
    function highlightGroupNode(intersects,timestep) { // INTERSECTED
        isdrawradar = false;
        if (intersects.length){
            if (intersects.length<graphicopt.tableLimit) {
                isdrawradar = true;
                linesGroup.visible = true;
                d3.select("#filterTable_wrapper").classed('hide',false);
                try {
                    updateDataTableFiltered(intersects);
                }catch(e){}
                d3.select("p#filterList").classed('hide',true);
            }else {
                linesGroup.visible = !!graphicopt.linkConnect;
                d3.select("#filterTable_wrapper").classed('hide',true);
                d3.select("p#filterList").classed('hide',false);
                d3.select("p#filterList").text(intersects.join(', '));
                // d3.select("p#filterList+.copybtn").classed('hide', false);
            }
        }else{
            d3.select("#filterTable_wrapper").classed('hide',true);
            d3.select("p#filterList").text('');
            d3.select("p#filterList").classed('hide',true);
            // d3.select("p#filterList+.copybtn").classed('hide',true);
        }
        filterGroupsetting.timestep = timestep;
        var geometry = points.geometry;
        var attributes = geometry.attributes;
        if (intersects.length > 0 || !(timestep===undefined)) {
            let radarData =[];
            let posArr =[];
            INTERSECTED = [];
            visibledata = [];
            datain.forEach((d, i) => {
                if (intersects.indexOf(d.name) !==-1 || (timestep!==undefined && timestep===d.__timestep)){
                    INTERSECTED.push(i);
                    attributes.alpha.array[i] = graphicopt.component.dot.opacity;
                    lines[d.name].visible = timestep===undefined;
                    lines[d.name].material.opacity = graphicopt.component.link.opacity;
                    lines[d.name].material.linewidth  = graphicopt.component.link.highlight.opacity;
                    visibledata.push(i);
                    radarData.push(d);
                    posArr.push(getpos(attributes.position.array[i*3],attributes.position.array[i*3+1],attributes.position.array[i*3+2],i));
                } else {
                    attributes.alpha.array[i] = 0;
                    lines[d.name].visible = false;
                    lines[d.name].material.opacity = graphicopt.component.link.opacity;
                    lines[d.name].material.linewidth  = graphicopt.component.link.size;
                }
            });

            attributes.alpha.needsUpdate = true;

            removeBoxHelper();

            if(isdrawradar){
                svgData = {data:radarData,posStatic:posArr,pos:_.cloneDeep(posArr)};
                radarSize = Math.min(graphicopt.radaropt.w/2,Math.sqrt(graphicopt.widthG()*graphicopt.heightG()/Math.PI/radarData.length)*0.75);
                forceColider.force('collide').radius(radarSize).iterations(10);
                forceColider.force('charge').distanceMin(radarSize*2);
                forceColider.nodes(svgData.pos).restart();
                updateforce(svgData);
                // drawRadar(svgData);
            }
        } else if (visibledata && visibledata.length || ishighlightUpdate) {
            visibledata = undefined;
            ishighlightUpdate = false;
            linesGroup.visible = !!graphicopt.linkConnect;
            tooltip_lib.hide(); // hide tooltip
            datain.forEach((d, i) => {
                attributes.alpha.array[i] = graphicopt.component.dot.opacity;
                lines[d.name].visible = true;
                lines[d.name].material.opacity = graphicopt.component.link.opacity;
                lines[d.name].material.linewidth  = graphicopt.component.link.size;
            });

            attributes.alpha.needsUpdate = true;
            INTERSECTED = [];
            removeBoxHelper();

            svgData=undefined;
            d3.select('#modelWorkerScreen_svg_g').selectAll('*').remove();
        }
        isneedrender = true;
    }
    let selection_radardata = undefined;
    let animationduration = 120;
    let animationtimer = undefined;
    let isneedrender = false;
    function animate() {
        if (!stop) {
            animateTrigger=true;
            if (isneedrender) {
                // visiableLine(graphicopt.linkConnect);
                //update raycaster with mouse movement
                try {
                    if (axesTime.visible) {
                        axesTime.getObjectByName("TimeText").lookAt(camera.position);
                    }
                } catch (e) {
                }
                if (mouseoverTrigger && !freezemouseoverTrigger) { // not have filterbyClustername
                    raycaster.setFromCamera(mouse, camera);
                    if (!filterbyClustername.length) {
                        var intersects = overwrite || raycaster.intersectObject(points);
                        //count and look after all objects in the diamonds group
                       highlightNode(intersects);
                    } else { // mouse over group
                        var geometry = points.geometry;
                        var attributes = geometry.attributes;
                        datain.forEach((d, i) => {
                            if (filterbyClustername.indexOf(d.clusterName) !== -1) {
                                attributes.alpha.array[i] = 1;
                                // lines[d.name].visible = true;
                            } else {
                                attributes.alpha.array[i] = 0.1;
                                // lines[d.name].visible = false;
                            }
                            lines[d.name].visible = false;
                        });
                        attributes.alpha.needsUpdate = true;
                    }
                } else if (lassoTool && lassoTool.needRender) {
                    let newClustercolor = d3.color('#000000');
                    try {
                        for (var i = 0; i < lassoTool.collection.length; i++) {
                            let currentIndex = lassoTool.collection[i];
                            let currentData = datain[mapIndex[currentIndex]];
                            let currentColor = d3.color(colorarr[currentData.cluster].value);
                            points.geometry.attributes.customColor.array[currentIndex * 3] = currentColor.r / 255;
                            points.geometry.attributes.customColor.array[currentIndex * 3 + 1] = currentColor.g / 255;
                            points.geometry.attributes.customColor.array[currentIndex * 3 + 2] = currentColor.b / 255;
                            points.geometry.attributes.customColor.needsUpdate = true;
                        }


                        var allSelected = lassoTool.select();
                        allSelected_Data = [];
                        for (var i = 0; i < allSelected.length; i++) {
                            allSelected_Data.push(datain[mapIndex[allSelected[i]]]);
                            let currentIndex = lassoTool.collection[i];
                            points.geometry.attributes.customColor.array[currentIndex * 3] = newClustercolor.r / 255;
                            points.geometry.attributes.customColor.array[currentIndex * 3 + 1] = newClustercolor.g / 255;
                            points.geometry.attributes.customColor.array[currentIndex * 3 + 2] = newClustercolor.b / 255;
                            points.geometry.attributes.customColor.needsUpdate = true;
                        }
                        // draw summary radar chart
                        drawSummaryRadar(allSelected_Data, handle_data_summary(allSelected_Data), newClustercolor);
                    } catch (e) {
                        // draw summary radar chart
                        drawSummaryRadar([], [], newClustercolor);
                    }
                    lassoTool.needRender = false;
                }
                // visiableLine(graphicopt.linkConnect);
                controls.update();
                renderer.render(scene, camera);
                if (solution&&solution.length)
                    cluster.forEach(c=>{
                        const pos = position2Vector( datain[c.__metrics.indexLeader].__metrics.position);
                        c.__metrics.projection = getpos(pos.x,pos.y,pos.z);
                    });
                updatelabelCluster();
                if(isdrawradar&&svgData&&iscameraMove) {
                    var geometry = points.geometry;
                    var attributes = geometry.attributes;
                    svgData.posStatic = svgData.posStatic.map(d=>getpos(attributes.position.array[d.index*3],attributes.position.array[d.index*3+1],attributes.position.array[d.index*3+2],d.index));
                    updateforce(svgData);
                    // drawRadar(svgData);
                }
            }
            iscameraMove = false;
            isneedrender = false;
            requestAnimationFrame(animate);
        }else{
            if (forceColider)
                forceColider.stop();
        }
    }
    function removeBoxHelper(){
        const object = scene.getObjectByName( 'boxhelper');
        if(object) {
            object.geometry.dispose();
            object.material.dispose();
            scene.remove(object);
        }
    }
    function drawSummaryRadar(dataArr,dataRadar,newClustercolor){
        let barH = graphicopt.radarTableopt.h/2;
        radarChartclusteropt.schema = graphicopt.radaropt.schema;
        d3.select('.radarTimeSpace .selectionNum').text(dataArr.length);
        renderRadarSummary(dataRadar,newClustercolor,true,true);
        // draw table
        let positionscale = d3.scaleLinear().domain([0,1]).range([0,Math.max(graphicopt.radarTableopt.h,40)]);
        let selectedNest = d3.nest().key(d=>d.cluster).rollup(d=>d.length).object(dataArr);
        let selectedCluster = cluster.filter((c,i)=>selectedNest[i]).map(d=>{
            let temp = d.__metrics.slice();
            temp.total = d.total_radar;
            temp.selected = selectedNest[d.index];
            temp.name = d.name;
            temp.prefixlName = `Group ${d.orderG+1}${clusterDescription[d.name].text?': ':''}`;
            temp.textName = clusterDescription[d.name].text;
            temp.fullName = temp.prefixlName+clusterDescription[d.name].text;
            return temp
        }).sort((a,b)=>b.selected - a.selected);
        selectedCluster.forEach((d,i)=>d.index = i);
        selectedCluster.action = {};
        let newCluster = dataRadar.map(d=>d);
        newCluster.index = selectedCluster.length;
        newCluster.name = `group_${cluster_info.length+1}`;
        newCluster.color = newClustercolor;
        newCluster.total = dataArr.length;
        newCluster.selected = dataArr.length;

        let totalscale = d3.scaleLinear().domain([0,d3.max(cluster.map(d=>d.total_radar))]).range([0,150]);


        drawComparisonCharts(selectedCluster);

        // add holder action
        let holder_action = d3.select('.relativemap .actionHolder');
        holder_action.selectAll('div.btn_group_holder').remove();
        let btg = holder_action.selectAll('div.btn_group_holder').data(selectedCluster);
        // btg.exit().remove();
        let btg_new = btg.enter().append('div').attr('class', 'btn_group_holder valign-wrapper').style('height',(d,i)=>`${positionscale(1)}px`)
            .append('div').attr('class', 'btn_group valign-wrapper');
        btg_new.append('i').attr('class','btn_item material-icons currentValue').html('check_box_outline_blank');
        btg_new.append('i').attr('class','btn_item material-icons selected hide').attr('title','action').html('check_box_outline_blank').attr('value','no-action').on('click',actionBtn);
        btg_new.append('i').attr('class','btn_item material-icons ').html('merge_type').attr('title','merge').attr('value','merge').on('click',actionBtn);
        btg_new.append('i').attr('class','btn_item material-icons hide').html('delete').attr('title','delete').attr('value','delete').on('click',actionBtn);
        dialogModel();
        d3.select('#modelSelectionInformation .newGroup')
            .classed('hide',!selectedCluster.length)
            .on('click',function(){
                selectedCluster.action ={root: newCluster.index};
                selectedCluster.action[newCluster.name] = {name: newCluster.name, index: newCluster.index, action: 'create', data: dataArr};
                console.log(selectedCluster.action.root);
                let otherItem = holder_action.selectAll('div.btn_group_holder');
                otherItem.filter(d=>d.selected !== d.total)
                    .select('.btn_item[value="no-action"]')
                    .each(actionBtn);
                otherItem
                    .select('.btn_item[value="delete"]')
                    .classed('hide',d=>d.selected !== d.total)
                    .filter(d=>d.selected === d.total)
                    .each(actionBtn);
                let dataCollection = selectedCluster.map(d=>d);
                dataCollection.push(newCluster);
                dataCollection.action = selectedCluster.action;
                renderRadarSummary(dataRadar, newClustercolor,true,true);
                drawComparisonCharts(dataCollection,true);
                dialogModel();
            });
        d3.select('#modelSelectionInformation .confirm .cancel').on('click',function(){
            if (selectedCluster.action.root!==newCluster.index)
                holder_action.selectAll('div.btn_group_holder').filter(d=>selectedCluster.action.root===d.index).select('.btn_item[value="no-action"]').each(actionBtn);
            else{
                // set action data
                selectedCluster.action = {};
                // render radar
                renderRadarSummary(dataRadar, newClustercolor,true,true);
                // adjust other selection data
                const allGroup = holder_action.selectAll('div.btn_group_holder');
                allGroup.select('.btn_item[value="delete"]').classed('hide',true);
                allGroup.select('.btn_item[value="no-action"]').each(actionBtn);
                // render bar chart view
                drawComparisonCharts(selectedCluster);
                dialogModel();
            }
        });
        d3.select('#modelSelectionInformation .confirm .ok').on('click',function(){
            // delete action
            let index = selectedCluster.action.root;
            let root = selectedCluster[index]||newCluster;
            let mainAction = selectedCluster.action[root.name];
            let newName = mainAction.rename;
            let newclusters = cluster_info.filter(d=>selectedCluster.action[d.name]=== undefined || selectedCluster.action[d.name].action !=="delete");
            if (mainAction.action === 'merge'){
                let rootCluster = newclusters.find(d=>d.name === root.name);
                let dataMergeIn = dataArr.filter(e=>e.clusterName!==rootCluster.name);
                rootCluster.__metrics.normalize = rootCluster.__metrics.normalize.map((d,i)=>(d* root.total + d3.sum(dataMergeIn,e=>e[i]) )/(root.total + dataMergeIn.length));
            }else {

                if (mainAction.action === 'create') {

                    let newCluster_data = {
                        name: newCluster.name,
                        text:  newName ||'',
                        axis: [],
                        __metrics: []
                    };
                    newCluster_data.__metrics.normalize = dataRadar.map(d => d.value);
                    clusterDescription[root.name] = {id: root.name, text: newName ||''};
                    newclusters.push(newCluster_data)
                }
            }
            clusterDescription[root.name].text =  newName || clusterDescription[root.name].text;
            // changed cluster but not relate to delete and merge
            selectedCluster.filter(d=>selectedCluster.action[d.name]=== undefined).forEach(e=>{
                let changedCluster = newclusters.find(d=>d.name === e.name);
                let dataMoveout = dataArr.filter(e=>e.clusterName===changedCluster.name);
                changedCluster.__metrics.normalize = changedCluster.__metrics.normalize.map((d,i)=>(d* root.total - d3.sum(dataMoveout,e=>e[i]) )/(root.total - dataMoveout.length));
            });
            console.log(newclusters)
            recalculateCluster( {normMethod:$('#normMethod').val()},onchangeCluster,newclusters);
        });
        function actionBtn(d){
            const target = d3.select(this);
            const value = target.attr('value');
            const style = target.style();
            const parent = d3.select(this.parentNode);
            parent.select('.currentValue').html(target.html()).style(style);
            parent.select('.selected.hide').classed('hide',false);
            target.classed('selected hide',true);
            reviewAction(d.index,value);
        }
        function dialogModel(){
            d3.select('#modelSelectionInformation .newGroup').classed('hide',!selectedCluster.length || selectedCluster.action.root===newCluster.index)
            d3.select('#modelSelectionInformation .confirm').classed('hide',Object.keys(selectedCluster.action).length<1)
        }
        function reviewAction(index,action){
            let target = selectedCluster[index];
            switch (action) {
                case 'merge':
                    // set action data
                    selectedCluster.action = {'root':index};
                    selectedCluster.action[target.name] = {name: target.name, index: index, action: action, data: dataArr};
                    // render radar
                    let newdataRadar = JSON.parse(JSON.stringify(dataRadar));
                    newdataRadar.forEach((d,i)=>{
                        d.value = d3.mean([d.value,target[i].value]);
                        d.minval = Math.min(d.minval,target[i].minval);
                        d.maxval = Math.max(d.maxval,target[i].maxval);
                    });

                    renderRadarSummary(newdataRadar,colorscale(target.name),true,true);
                    // adjust other selection data
                    let otherItem = holder_action.selectAll('div.btn_group_holder').filter(d=>d.index!==index);
                    otherItem.filter(d=>d.selected !== d.total)
                        .select('.btn_item[value="no-action"]')
                        .each(actionBtn);
                    otherItem
                        .select('.btn_item[value="delete"]')
                        .classed('hide',d=>d.selected !== d.total)
                        .filter(d=>d.selected === d.total)
                        .each(actionBtn);
                    // render bar chart view
                    drawComparisonCharts(selectedCluster,true)
                    break;
                case 'delete':
                    selectedCluster.action[target.name] = {name: target.name, action: action};
                    break;
                default:
                    if (selectedCluster.action && !isNaN(selectedCluster.action.root)&&selectedCluster.action[target.name]) {
                        const isRoot = selectedCluster.action[target.name].index===selectedCluster.action.root;
                        delete selectedCluster.action[target.name];
                        if (isRoot) { // if root action selected
                            // set action data
                            selectedCluster.action = {};
                            // render radar
                            renderRadarSummary(dataRadar, newClustercolor,true,true);
                            // adjust other selection data
                            const allGroup = holder_action.selectAll('div.btn_group_holder');
                            allGroup.select('.btn_item[value="delete"]').classed('hide',true);
                            allGroup
                                .filter(d => d.index !== index).select('.btn_item[value="no-action"]').each(actionBtn);
                            // render bar chart view
                            drawComparisonCharts(selectedCluster);
                        }
                    }
                    break;
            }
            dialogModel();
        }
        // draw function
        function drawComparisonCharts(dataCluster,isReview) {
            isReview = isReview||false;
            let inputHolder = d3.select('.relativemap input.clusterlabel');
            let rootTotal = 0;
            if (isReview) {
                let rootTitem = (selectedCluster[selectedCluster.action.root]===undefined)? _.last(dataCluster):selectedCluster[selectedCluster.action.root];
                rootTotal = rootTitem.total - rootTitem.selected + dataArr.length;
                totalscale.domain([0, Math.max(d3.max(cluster.map(d => d.total_radar)), rootTotal)]);
                inputHolder.styles({
                    top: `${positionscale( rootTitem.index +0.5)}px`,
                    left: `${graphicopt.radarTableopt.w +30}px`,
                    width: `calc(100% - ${graphicopt.radarTableopt.w + 30 +10}px)`
                }).attrs({
                    value: rootTitem.textName||'',
                }).on('change',function(){
                    selectedCluster.action[rootTitem.name].rename = $(this).val();
                });
                $(inputHolder.node()).val(rootTitem.textName||'');
            }else
                totalscale.domain([0,d3.max(cluster.map(d=>d.total_radar))]);

            inputHolder.classed('hide',!isReview);

            let holder = d3.select('.relativemap svg.svgHolder');
            holder.attr('width', radarChartclusteropt.width)
                .attr('height', positionscale(dataCluster.length) + 10);
            let bg = holder.selectAll('.timeSpace').data(dataCluster, d => d.name);
            bg.exit().remove();
            let bg_new = bg.enter().append('g').attr('class', 'timeSpace').attr('transform', (d, i) => `translate(${graphicopt.radarTableopt.w / 2 + 30},${positionscale(dataCluster.length + 1)})`);
            bg_new.append('g').attr('class', 'radar');
            let contributeRect = bg_new.append('g').attr('class', 'rate').attr('transform', (d, i) => `translate(${graphicopt.radarTableopt.w / 2},${0})`);
            contributeRect.append('rect').attr('class', 'totalNum').attrs({
                width: 0,
                height: barH
            }).styles({
                fill: d => d.color || colorscale(d.name),
                'fill-opacity': 0.5
            });
            contributeRect.append('rect').attr('class', 'contributeNum').attrs({
                width: 0,
                height: barH,
            }).styles({
                'fill-opacity': 0.5
            });
            let rateText = contributeRect.append('text').attrs({'x': 2, 'y': barH, 'dy': -5});
            rateText.append('tspan').attr('class', 'contributeNum');
            rateText.append('tspan').attr('class', 'totalNum').style('font-size', '80%');
            bg_new.append('text').attr('class', 'clustername').style('dy', '-2').attr('transform', (d, i) => `translate(${graphicopt.radarTableopt.w / 2},${0})`);
            bg = holder.selectAll('.timeSpace');
            bg.transition().duration(200).attr('transform', (d, i) => `translate(${graphicopt.radarTableopt.w / 2 + 30},${positionscale(d.index + 0.5)})`);
            bg
                .each(function (d) {
                    createRadarTable(d3.select(this).select('.radar'), d3.select(this), d, {colorfill: true});
                });
            bg.select('text.clustername').classed('hide',d=>(d.index=== selectedCluster.action.root)).text(d => d.fullName);
            bg.select('g.rate').select('rect.totalNum').transition().attr('width', d => totalscale(isReview?((d.index=== selectedCluster.action.root)? rootTotal: (d.total - d.selected)):d.total));
            bg.select('g.rate').select('rect.contributeNum').style('fill', newClustercolor).transition().attr('width', d => isReview? 0: totalscale(d.selected));
            rateText = bg.select('g.rate').select('text');
            rateText.transition().attr('x', d => totalscale(isReview?((d.index=== selectedCluster.action.root)? rootTotal: (d.total - d.selected)):d.total) + 2);
            rateText.select('.contributeNum').transition().text(d => isReview? '':d.selected);
            rateText.select('.totalNum').text(d => isReview?((d.index=== selectedCluster.action.root)? rootTotal: (d.total - d.selected)):('/' + d.total));
        }
    }
    function renderRadarSummary(dataRadar,color,boxplot,isselectionMode) {
        const holder = d3.select(".radarTimeSpace").classed('hide',!dataRadar.length);
        d3.select("#modelSelectionTool .emptyScreen").classed('hide',dataRadar.length);
        if (dataRadar.length) {
            radarChartclusteropt.color = function () {
                return color
            };
            radarChartclusteropt.boxplot = boxplot !== undefined ? boxplot : true;
            let currentChart;
            if (boxplot) {
                holder.select('.singleRadar').classed('hide',true);
                currentChart = RadarChart(".radarTimeSpace", [dataRadar], radarChartclusteropt, "");
            }else{
                holder.select('.singleRadar').classed('hide',false);
                if (graphicopt.iscompareMode)
                    currentChart = RadarChartCompare(".radarTimeSpace", dataRadar, radarChartclusteropt, "");
                else {
                    let cloneOpt = _.cloneDeep(radarChartclusteropt)
                    cloneOpt.fillin = false;
                    cloneOpt.strokeWidth = function(d,i){
                        return d.index?2:4;
                    };
                    cloneOpt.color = function(i,d){
                        return colorscale(d.name);
                    };
                    currentChart = RadarChart(".radarTimeSpace", dataRadar, cloneOpt, "");
                }
            }
            currentChart.selectAll('.axisLabel').remove();
            currentChart.select('.axisWrapper .gridCircle').classed('hide', true);
        }
        if (isselectionMode)
            selection_radardata = {dataRadar,color,boxplot};
    }
    function drawEmbedding(data,colorfill) {
        let newdata =handledata(data);
        let bg = svg.selectAll('.computeSig');
        bg.each(function (){
            let path = d3.select(this);
            if (path.select(".radar").empty()) {
                path.append('g').attr('class', 'radar');
            }
        });
        let datapointg = bg.select(".radar")
            .datum(d=>newdata.find(n=>n.name === d.name))
            .each(function(d){

                createRadar(d3.select(this).select('.linkLineg'), d3.select(this), newdata.find(n => n.name === d.name), {colorfill:colorfill});
            });
        // createRadar(datapointg.select('.linkLineg'), datapointg, newdata, {colorfill:colorfill});

    }

    function showMetrics_plotly(name) {
        let layout = {
            paper_bgcolor:"#ddd",
            plot_bgcolor:"#ddd",
            margin: {
                l: 50,
                r: 50,
                b: 20,
                t: 50,
            },
        };

        layout.shapes = path[name].map((v, i) => {
            return {
                type: 'rect',
                xref: 'x',
                yref: 'paper',
                layer: 'below',
                y0: 0,
                y1: 1,
                x0: scaleTime.invert(v.__timestep),
                x1: path[name][i + 1] ? scaleTime.invert(path[name][i + 1].__timestep) : undefined,
                fillcolor: colorarr[v.cluster].value,
                opacity: 0.5,
                line: {
                    width: 0
                }
            };
        });
        let colorSchema = d3.scaleLinear().range(['#000000','#b8b8b8']).domain(d3.extent(graphicopt.radaropt.schema,d=>d.idroot));
        let lineType = d3.scaleOrdinal().range(['solid','dot','dashdot']);
        let markerType = (d)=>d>2?'markers+lines':'lines';
        // layout.colorway = graphicopt.radaropt.schema.map((s,si)=>colorSchema(s.idroot))
        layout.colorway = graphicopt.radaropt.schema.map((s,si)=>'#000000')
        layout.shapes[layout.shapes.length - 1].x1 = scaleTime.domain()[1];
        let cdata = datain.filter(d=>d.name===name);

        const data_in = graphicopt.radaropt.schema.map((s,si) => {
            let temp = {x:[],
                y:[],
                text:[],
                mode: markerType(s.idroot),
                hovertemplate: '%{text}',
                marker:{
                    symbol:s.id
                },
                legendgroup: `group${s.idroot}`,
                line:{
                    dash: lineType(s.idroot)
                }
            };
            hostResults[name][serviceListattr[s.idroot]].forEach((e,ti) => {
                temp.x.push(scaleTime.invert(ti));
                temp.y.push(d3.scaleLinear().domain(s.range)(e[s.id]));
                temp.text.push(e[s.id]);
            });
            temp.name = s.text;
            let data_temp = temp;
            // layout.axis.y.label.push(s.text);
            // layout.axis.y.domain.push(s.range);
            // if (s.range[1] > 1000)
            //     layout.axis.y.tickFormat.push(d3.format('~s'));
            // else
            //     layout.axis.y.tickFormat.push(null);
            return data_temp;
        });
        layout.title = name;
        layout.title2 = name;
        layout.yaxis = {
            autorange: true
        };
        layout.xaxis = {
            autorange: true,
            // rangeselector: {buttons: [
            //         {
            //             count: 1,
            //             label: '5m',
            //             step: 'minute',
            //             stepmode: 'forward'
            //         },
            //         {
            //             count: 6,
            //             label: '1h',
            //             step: 'hour',
            //             stepmode: 'forward'
            //         },
            //         {step: 'all'}
            //     ]},
            range: scaleTime.domain(),
            rangeslider: {range: scaleTime.domain()},
        };
        Plotly.newPlot('myHnav', data_in, layout);

        // tooltip_lib.graphicopt({
        //     width: tooltip_opt.width,
        //     height: 100,
        //     margin: tooltip_opt.margin
        // }).data(data_in).layout(layout).show(target);
    }
    function showMetricsArr_plotly(selectedData) {
        if (plotlyWorker)
            plotlyWorker.terminate();
        plotlyWorker = new Worker('src/script/worker/plotlyWorker.js');
        workerList[1] = plotlyWorker;
        setTimeout(()=> {
            let namelist = _.uniq(selectedData.map(d=>d.name));
            let hostResults_temp ={};
            namelist.forEach(n=>hostResults_temp[n] =hostResults[n]);
            plotlyWorker.postMessage({
                action: "initDataRaw",
                // selectedData: selectedData,
                namelist: namelist,
                schema: graphicopt.radaropt.schema,
                serviceIndex: graphicopt.serviceIndex,
                serviceListattr: serviceListattr,
                hostResults: hostResults_temp,
                scaleTime: {domain: scaleTime.domain(), range: scaleTime.range()}
            });
            plotlyWorker.addEventListener('message', ({data}) => {
                Plotly.newPlot('myHnav', data.data_in, data.layout);
                plotlyWorker.terminate();
            })
        })
    }

    function setUpZoom() {
        // view.call(zoom);
        let initial_scale = 1;
        // var initial_transform = d3.zoomIdentity.translate(graphicopt.width/2, graphicopt.height/2).scale(initial_scale);
        // zoom.transform(view, initial_transform);
        camera.position.set(0, 0, getZFromScale(1));
    }
    function zoomHandler(d3_transform) {
        let scale = d3_transform.k;
        let x = -(d3_transform.x - graphicopt.width / 2) / scale;
        let y = (d3_transform.y - graphicopt.height / 2) / scale;
        let z = getZFromScale(scale);
        if (graphicopt.dim===2) {
            camera.position.set(x, y, z);
        }else{
            if (z===camera.position.z) {
                scatterPlot.rotation.y = x * 0.01;
                scatterPlot.rotation.x = y * 0.01;
            }
            // camera.position.z = z;
            camera.position.set(x, y, z);
        }
        camera.lookAt(new THREE.Vector3(0, 0, 0));
    }
    function getScaleFromZ (camera_z_position) {
        let half_fov = fov/2;
        let half_fov_radians = toRadians(half_fov);
        let half_fov_height = Math.tan(half_fov_radians) * camera_z_position;
        let fov_height = half_fov_height * 2;
        let scale = graphicopt.height / fov_height; // Divide visualization height by height derived from field of view
        return scale;
    }

    function getZFromScale(scale) {
        let half_fov = fov/2;
        let half_fov_radians = toRadians(half_fov);
        let scale_height = graphicopt.height / scale;
        let camera_z_position = scale_height / (2 * Math.tan(half_fov_radians));
        return camera_z_position;
    }

    function toRadians (angle) {
        return angle * (Math.PI / 180);
    }

    function createpoints(g){
        let pointsGeometry = new THREE.BufferGeometry();

        let datafiltered = mapIndex.map(i=>datain[i]);
        let colors =  new Float32Array( datafiltered.length * 3 );
        let pos =  new Float32Array( datafiltered.length * 3 );
        let alpha =  new Float32Array( datafiltered.length );
        let sizes =  new Float32Array( datafiltered.length);
        for (let i=0; i< datafiltered.length;i++) {
            let target = datafiltered[i];
            // Set vector coordinates from data
            // let vertex = new THREE.Vector3(0, 0, 0);
            pos[i*3+0]= 0;
            pos[i*3+1]= 0;
            pos[i*3+2]= 0;
            // let color = new THREE.Color(d3.color(colorarr[target.cluster].value)+'');
            let color = d3.color(target.name ===keyGenes?'black': colorarr[target.cluster].value);
            colors[i*3+0]= color.r/255;
            colors[i*3+1]= color.g/255;
            colors[i*3+2]= color.b/255;
            alpha[i]= 1;
            sizes[i] = graphicopt.component.dot.size;
        }
        pointsGeometry.setAttribute( 'position', new THREE.BufferAttribute( pos, 3 ) );
        pointsGeometry.setAttribute( 'customColor', new THREE.BufferAttribute( colors, 3 ) );
        pointsGeometry.setAttribute( 'size', new THREE.BufferAttribute( sizes, 1 ) );
        pointsGeometry.setAttribute( 'alpha', new THREE.BufferAttribute( alpha, 1 ) );
        pointsGeometry.boundingBox = null;
        pointsGeometry.computeBoundingSphere();
        // pointsGeometry.colors = colors;

        // let pointsMaterial = new THREE.PointsMaterial({
        //     size: graphicopt.component.dot.size,
        //     sizeAttenuation: false,
        //     map: new THREE.TextureLoader().load("src/images/circle.png"),
        //     vertexColors: THREE.VertexColors,
        //     transparent: true
        // });
        let pointsMaterial = new THREE.ShaderMaterial( {

            uniforms:       {
                color: { value: new THREE.Color( 0xffffff ) },
                pointTexture: { value: new THREE.TextureLoader().load( "src/images/circle.png" ) }

            },
            vertexShader:   document.getElementById( 'vertexshader' ).textContent,
            fragmentShader: document.getElementById( 'fragmentshader' ).textContent,
            transparent:    true

        });

        let p = new THREE.Points(pointsGeometry, pointsMaterial);
        p.frustumCulled = false;
        g.add(p);
        return p;
    }

    // make data table display raw data
    let dataTableFiltered
    function makeDataTableFiltered () {
        if ($.fn.DataTable.isDataTable('#filterTable')) {
            $('#filterTable').DataTable().destroy();
            d3.select('#filterTable').selectAll('*').remove();
        }

        const columns = [{title: 'atID'}];
        graphicopt.radaropt.schema.forEach(d => {
            columns.push({title: 'wt' + d.text, render: renderData})
        });
        graphicopt.radaropt.schema.forEach(d => {
            columns.push({title: 's1' + d.text, render: renderData})
        });
        let heatmaponTable = d3.scaleQuantize().domain(d3.range(0,10))
            .range(['#ffffff','#fff7ec','#fee8c8','#fdd49e','#fdbb84','#fc8d59','#ef6548','#d7301f','#b30000','#7f0000']);
        let textcolor = heatmaponTable.copy();
        textcolor.range(['#000000','#000000','#000000','#000000','#000000','#000000','#000000','#000000','#ffffff','#ffffff'])
        dataTableFiltered = $('#filterTable').DataTable({
            data: [],
            "pageLength": 50,
            // scrollY:        '50vh',
            // scrollCollapse: true,
            columns: columns,
            "dom": '<"top"f<"clear">>rt<"bottom"ip>B',
            buttons: [
                {
                    extend: 'copyHtml5',
                    exportOptions: {orthogonal: 'export'}
                },
                {
                    extend: 'excelHtml5',
                    exportOptions: {orthogonal: 'export'}
                },
                {
                    extend: 'pdfHtml5',
                    exportOptions: {orthogonal: 'export'}
                }
            ],
            rowCallback: function(row, data, index){
                data.forEach((d,i)=>{
                    if(i){ // not column of name
                        $(row).find(`td:eq(${i})`)
                            .css('background-color', heatmaponTable(Math.abs(d)))
                            .css('color', textcolor(Math.abs(d)));
                    }
                })
            }
            });
            $.fn.DataTable.ext.pager.numbers_length = 4;

        $('#filterTable tbody').on('mouseover', 'tr', function () {
            var tr = $(this).closest('tr');
            var row = dataTableFiltered.row( tr );
            highlightNode([{index:path[ row.data()[0]][0].index}]);
        })
        $('#filterTable tbody').on('mouseleave', function () {
            highlightNode([]);
        })

        $('#search').on('input', searchHandler); // register for oninput
        $('#search').on('propertychange', searchHandler); // for IE8

        // d3.select('#modelSampling').on('mouseover',()=>{
        //     let data = _.sampleSize(datain, 500);
        //     console.log(data)
        //     // drawRadar({data: data,pos:})
        // });
        function renderData(data, type, row) {
            if (type === 'display') {
                if (data%1==0)
                    return `${data}<span style="opacity: 0">.00</span>`
                return d3.format('.2f')(data);
            }
            else if(type === 'export'){
                return data;
            }
            return data%1==0?data:d3.format('.2f')(data);
        }
    }
    function searchHandler (e){
        if (e.target.value!=="") {
            let results = datain.filter(h=>h.name.includes(e.target.value)).map(h=>({index:path[h.name][0].index}));
            console.log(results)
            if(results.length<graphicopt.tableLimit)
                highlightNode([results[0]]);
            else
                highlightNode([])
        }else{
            highlightNode([]);
        }
    }
    function updateDataTableFiltered(newDataName){
        let newDataArray = newDataName.map(n=>{
            return _.flatten([n,graphicopt.radaropt.schema.map(s=>sampleS[n+'__wt'][s.text][0][0]),graphicopt.radaropt.schema.map(s=>sampleS[n+'__stop1'][s.text][0][0])]);
        });
        dataTableFiltered.clear();
        dataTableFiltered.rows.add(newDataArray);
        dataTableFiltered.draw();
    }

    let mapIndex =[];

    // function transition(){
    //     interuptAnimation();
    //     let count = 0 ;
    //     animationtimer = new IntervalTimer(function(){
    //         if (count>animationduration)
    //             animationtimer.stop();
    //         else{
    //
    //         }
    //         count++;
    //     },1000/60);
    // }
    let distancerange = d3.scaleLinear();
    let euclideandistancerange = d3.scaleLinear();
    function createClusterLabel() {
        svg.select('#modelClusterLabel').selectAll('g.cluster').remove();
        const marker =  svg.select('#modelClusterLabel').selectAll('g.cluster').data(cluster)
            .enter().append('g').attr('class', 'cluster');
        const symbolGenerator = d3.symbol().type(d3.symbolCross).size(100);
        marker.append('text').text(d=>d.text);
        marker.append('path').attr('d',symbolGenerator()).styles({'fill':'black','opacity':0.5});
        return marker;
    }
    function updatelabelCluster() {
        clusterMarker.attr('transform',d=>`translate(${d.__metrics.projection.x},${d.__metrics.projection.y})`);
    }

    function render (islast){
        if (isneedCompute) {
            let p = points.geometry.attributes.position.array;
            if (solution&&solution.length) {
                createRadar = _.partialRight(createRadar_func, 'timeSpace radar', graphicopt.radaropt, colorscale);
                solution.forEach(function (d, i) {
                    // mapIndex.forEach(function (i) {
                    const target = datain[i];
                    target.__metrics.position = d;
                    let pointIndex = mapIndex.indexOf(i);
                    if (pointIndex !== undefined) {
                        p[pointIndex * 3 + 0] = xscale(d[0]);
                        p[pointIndex * 3 + 1] = yscale(d[1]);

                        // 3rd dimension as time step
                        // p[pointIndex*3+2] = xscale(d[2])||0;
                        if (graphicopt.opt.dim > 2) {
                            p[pointIndex * 3 + 2] = scaleNormalTimestep(target.__timestep);
                            d[2] = xscale.invert(p[pointIndex * 3 + 2]);
                        } else {
                            p[pointIndex * 3 + 2] = 0;
                            if (solution[i].length > 2)
                                solution[i] = solution[i].slice(0, 2);
                        }
                    }
                });
                if (islast) {
                    let center = d3.nest().key(d => d.clusterName).rollup(d => [d3.mean(d.map(e => e.__metrics.position[0])), d3.mean(d.map(e => e.__metrics.position[1])), d3.mean(d.map(e => e.__metrics.position[2]))]).object(datain);
                    // for (let c in clusterAnnotation){
                    //     let newpos = position2Vector(center[c]);
                    //     clusterAnnotation[c].position.x = newpos.x;
                    //     clusterAnnotation[c].position.y = newpos.y;
                    //     clusterAnnotation[c].position.z = newpos.z;
                    // }
                    solution.forEach(function (d, i) {
                        const target = datain[i];
                        const posPath = path[target.name].findIndex(e => e.timestep === target.timestep);
                        path[target.name][posPath].value = d;
                        // updateStraightLine(target, posPath, d);
                        updateLine(target, posPath, d, path[target.name].map(p => center[datain[p.index].clusterName]));

                    });
                    let rangeDis = [+Infinity, 0];
                    let customz = d3.scaleLinear().range(scaleNormalTimestep.range());
                    let distance_data=[];
                    for (let name in path) {
                        let temp;
                        path[name].forEach((p, i) => {
                            if (!i) {
                                path[name].distance = 0;
                                temp = p.value;
                                return;
                            } else {
                                path[name].distance += distance(path[name][i - 1].value, p.value)
                            }
                        });
                        if (graphicopt.opt.dim === 2.5) {
                            path[name].distance /= (_.last(path[name]).__timestep);

                        } else
                            path[name].distance /= path[name].length;
                        if (path[name].distance < rangeDis[0])
                            rangeDis[0] = path[name].distance;
                        if (path[name].distance > rangeDis[1])
                            rangeDis[1] = path[name].distance;
                        distance_data.push(path[name].distance)
                    }
                    umapdistanceHis = getHistdata(distance_data,'umap',1000);
                    drawHis('#modelDistanceFilter_projection_svg',umapdistanceHis,'distance')
                    handleTopSort($('#modelSortBy').val());
                    distancerange.domain(rangeDis);
                    customz.domain(rangeDis);
                    // adjust z base on distance
                    if (graphicopt.opt.dim === 2.5) {
                        solution.forEach(function (d, i) {
                            const target = datain[i];
                            if (target.__timestep) {
                                const posPath = path[target.name].findIndex(e => e.timestep === target.timestep);
                                // updateStraightLine(target, posPath, d);
                                d = d.slice();
                                d[2] = customz(path[target.name].distance);
                                let pointIndex = mapIndex.indexOf(i);
                                if (pointIndex !== undefined) {
                                    p[pointIndex * 3 + 2] = d[2];
                                }
                                d[2] = xscale.invert(d[2]);
                                updateLine(target, posPath, d, path[target.name].map(p => center[datain[p.index].cluster]));
                            }
                        });
                    }
                }
                points.geometry.attributes.position.needsUpdate = true;
                points.geometry.boundingBox = null;
                points.geometry.computeBoundingSphere();
                isneedrender = true;

                // if (isradar && datain.length < 5000) {
                //     renderSvgRadar();
                // }
            }
            isneedCompute = false;
        }
    }

    function handle_data(data){
        data.forEach(d=>{
            d.__metrics = graphicopt.radaropt.schema.map((s,i)=>{
                return {axis: s.text, value: d.data[i]}
            });
            d.__metrics.name = d.clusterName;
            d.__metrics.name_or = d.name;
            d.__metrics.timestep = d.timestep;
        });
        let maxstep = sampleS.timespan.length - 1;
        // let maxstep = sampleS.timespan.length - 1;
        scaleTime = d3.scaleTime().domain([sampleS.timespan[0], sampleS.timespan[maxstep]]).range([0, maxstep]);
        scaleNormalTimestep.domain([0, 1]);
    }
    function interuptAnimation(){
        if (animationtimer)
            animationtimer.stop();
    }
    master.stop = function(){
        terminateWorker();
        interuptAnimation()
        stop = true;
        // if (modelWorker) {
        //     modelWorker.terminate();
        //     plotlyWorker.terminate();
        //     stop = true;
        //     // renderSvgRadar();
        // }
    };

    function terminateWorker() {
        workerList.forEach(w=>{
            w.terminate();
        });
        workerList.length = 0;
    }

    function positionLink_canvas(path, ctx) { //path 4 element
        // return p = new Path2D(positionLink(a,b));
        d3.line()
            .x(function (d) {
                return xscale(d[0]);
            })
            .y(function (d) {
                return yscale(d[1]);
            })
            .curve(d3.curveCardinalOpen.tension(0.75))
            .context(ctx)(path);
        return ctx.toShapes(true);
    }
    function createLine(path){
        let pointsGeometry = new THREE.Geometry();
        for (let i=0;i <path.length-1;i++){
            let vertex = new THREE.Vector3(0, 0, 0);
            colorLineScale.range([colorarr[path[i].cluster].value,colorarr[path[i+1].cluster].value]);
            pointsGeometry.vertices.push(vertex);
            pointsGeometry.colors.push(new THREE.Color(d3.color(colorLineScale(0))+''));
            pointsGeometry.vertices.push(vertex);
            pointsGeometry.colors.push(new THREE.Color(d3.color(colorLineScale(1))+''));
        }
        pointsGeometry.vertices.push(new THREE.Vector3(0, 0, 0));
        pointsGeometry.colors.push( new THREE.Color(d3.color(colorarr[path[path.length-1].cluster].value)+''));


        var material = new THREE.LineBasicMaterial( {
            opacity:graphicopt.component.link.opacity,
            linewidth:graphicopt.component.link.size,
            color: 0xffffff,
            vertexColors: THREE.VertexColors,
            transparent: true
        } );
        let lineObj = new THREE.LineSegments( pointsGeometry, material );
        lineObj.frustumCulled = false;
        return lineObj;
    }

    function createCurveLine(path,curves,key){
            //QuadraticBezierCurve3
        let lineObj = new THREE.Object3D();
        if (path.length > 1) {
            var material = new THREE.LineBasicMaterial({
                opacity:graphicopt.component.link.opacity,
                linewidth:graphicopt.component.link.size,
                color: 0xffffff,
                vertexColors: THREE.VertexColors,
                transparent: true,
            });
            var curve = new THREE.QuadraticBezierCurve3(new THREE.Vector3(0, 0, 0),new THREE.Vector3(0, 0, 0),new THREE.Vector3(0, 0, 0));
            curves[key] = curve;
            let curveSegment = graphicopt.curveSegment;
            var points = curve.getPoints(curveSegment);
            var geometry = new THREE.BufferGeometry().setFromPoints(points);
            // <editor-fold desc="add gradient effect">
            var colors = new Float32Array((curveSegment+1) * 3);
            let currentstep = 0;
            var colorInterpoalte = d3.interpolate(colorarr[path[0].cluster].value,colorarr[path[1].cluster].value);
            for (let i = 0; i < curveSegment+1; i++) {
                let color = d3.color(colorInterpoalte(i/curveSegment));
                colors[i * 3] = color.r / 255;
                colors[i * 3 + 1] = color.g / 255;
                colors[i * 3 + 2] = color.b / 255;
            }
            // </editor-fold>
            geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
            var curveObject = new THREE.Line(geometry, material);
            // console.log(curveSegment,path,curveObject)
            curveObject.frustumCulled = false;
            lineObj = curveObject;
        }
        return lineObj;
    }
    function updateCurveLine(target, posPath, d, center) {
        if (curves[target.name]!==undefined) {
            // var curve = new THREE.CatmullRomCurve3( path[target.name].map(p=> new THREE.Vector3(xscale(p.value[0]), yscale(p.value[1]), xscale(p.value[2]) || 0)),false,'catmullrom');
            const v0 = position2Vector(path[target.name][0].value);
            const v1 = position2Vector(center[0].map((d,i)=>d===undefined?undefined:d3.mean([d,center[1][i]])));
            const v2 = position2Vector(path[target.name][1].value);
            var curve = new THREE.QuadraticBezierCurve3(v0,v1,v2);
            curve.tension =0.05;
            curves[target.name] = curve;
            var points = curve.getPoints( graphicopt.curveSegment);
            lines[target.name].geometry.setFromPoints(points);
        }
    }
    function position2Vector(p){
        return new THREE.Vector3(xscale(p[0]), yscale(p[1]), xscale(p[2]) || 0);
    }
    function updateStraightLine(target, posPath, d, customZ) {
        lines[target.name].geometry.vertices[posPath * 2] = new THREE.Vector3(xscale(d[0]), yscale(d[1]), xscale(d[2]) || 0);
        // lines[target.name].geometry.vertices[posPath * 2] = new THREE.Vector3(xscale(d[0]), yscale(d[1]), d[2] || 0);
        if (posPath)
            lines[target.name].geometry.vertices[posPath * 2 - 1] = new THREE.Vector3(xscale(d[0]), yscale(d[1]), xscale(d[2]) || 0);
            // lines[target.name].geometry.vertices[posPath * 2 - 1] = new THREE.Vector3(xscale(d[0]), yscale(d[1]), d[2] || 0);
        lines[target.name].geometry.verticesNeedUpdate = true;
        lines[target.name].geometry.computeBoundingBox();
    }

    function onlinkopacity(){
        setTimeout(()=>{
            Object.keys(lines).forEach(lk=>{
                if (lines[lk].visible && lines[lk].material.opacity){
                    lines[lk].material.opacity = graphicopt.component.link.opacity;
                }
            })
            isneedrender = true;
        });
    }

    function createLines(g){
        colorLineScale.domain([0,1]);
        let lines = {};
        Object.keys(path).forEach(k=>{
            lines[k]= createLine(path[k]);
            g.add(lines[k]);
        });
        return lines;
    }

    // function createCurveLines(g){
    //     colorLineScale.domain([0,graphicopt.curveSegment]);
    //     let lines = {};
    //     curves = {};
    //     Object.keys(path).forEach(k=>{
    //         curves[k] = [];
    //         lines[k]= createCurveLine(path[k],curves[k]);
    //         g.add(lines[k]);
    //     });
    //     return lines;
    // }

    function createCurveLines(g){
        colorLineScale.domain([0,graphicopt.curveSegment]);
        let lines = {};
        curves = {};
        Object.keys(path).forEach(k=>{
            curves[k] = undefined
            lines[k]= createCurveLine(path[k],curves,k);
            g.add(lines[k]);
        });
        return lines;
    }

    function visiableLine(isvisiable){
        linesGroup.visible = isvisiable;
        d3.select('#Link_opacity').classed('hide',!isvisiable);
    }
    function drawline(ctx,path,cluster) {
        positionLink_canvas(path,new THREE.ShapePath());
        let fillColor = d3.color(colorarr[cluster].value);
        fillColor.opacity = graphicopt.component.link.opacity;
        ctx.strokeStyle = fillColor+'';
        ctx.stroke();
    }



    master.highlight = function(name){
        if (!freezemouseoverTrigger) {
            filterbyClustername.push(name);
            filterbyClustername = _.uniq(filterbyClustername);
            isneedrender = true;
            mouseoverTrigger = true;
        }
    };
    let ishighlightUpdate;
    master.unhighlight = function() {
        filterbyClustername = [];
        ishighlightUpdate = true;
        isneedrender = true;
        // d3.select(background_canvas).style('opacity',1);
        // d3.select(front_canvas).style('opacity',0);
    };
    let self = this;
    let needRecalculate=true;
    master.generateTable = function(){
        $( "#modelWorkerInformation" ).draggable({ containment: "parent", scroll: false });
        needRecalculate = true
        $('#modelSelectionInformation .tabs').tabs({
            onShow: function(){
                graphicopt.isSelectionMode = this.index===1;
                handle_selection_switch(graphicopt.isSelectionMode);
            }
        });
        d3.select('#modelWorkerInformation table').selectAll('*').remove();
        table_info = d3.select('#modelWorkerInformation table')
            .html(` <colgroup><col span="1" style="width: 40%;"><col span="1" style="width: 60%;"></colgroup>`);
            // .styles({'width':tableWidth+'px'});
        let tableData = [
            [
                {text:"Input",type:"title"},
                {label:'#Radars',content:datain.length,variable: 'datain'}
            ],
            [
                {text:"Settings",type:"title"},
            ],
            [
                {text:"Output",type:"title"},
            ]
        ];
        d3.values(self.controlPanel).forEach(d=>{
            tableData[1].push({label:d.text,type:d.type,content:d,variable: d.variable})
        });
        d3.values(controlPanelGeneral).forEach(d=>{
            tableData[1].push({label:d.text,type:d.type,content:d,variable: d.variable,variableRoot: d.variableRoot,id:d.id})
        });
        tableData[2] = _.concat(tableData[2],self.outputSelection);
        let tbodys = table_info.selectAll('tbody').data(tableData);
        tbodys
            .enter().append('tbody')
            .selectAll('tr').data(d=>d)
            .enter().append('tr')
            .attr('id',d=>d.id?d.id:null)
            .selectAll('td').data(d=>d.type==="title"?[d]:[{text:d.label},d.type?{content:d.content,variable:d.variable,variableRoor: d.variableRoot}:{text:d.content,variable:d.variable}])
            .enter().append('td')
            .attr('colspan',d=>d.type?"2":null)
            .style('text-align',(d,i)=>d.type==="title"?"center":(i?"right":"left"))
            .attr('class',d=>d.variable)
            .each(function(d){
                if (d.text!==undefined) // value display only
                    d3.select(this).text(d.text);
                else{ // other component display
                    let formatvalue = formatTable[d.content.variable]||(e=>Math.round(e));
                    if (d.content.type==="slider"){
                        let div = d3.select(this).style('width',d.content.width).append('div').attr('class','valign-wrapper');
                        noUiSlider.create(div.node(), {
                            start: (graphicopt.opt[d.content.variable]|| (d.content.variableRoot?d.content.variableRoot[d.content.variable]:undefined))|| d.content.range[0],
                            connect: 'lower',
                            tooltips: {to: function(value){return formatvalue(value)}, from:function(value){return +value.split('1e')[1];}},
                            step: d.content.step||1,
                            orientation: 'horizontal', // 'horizontal' or 'vertical'
                            range: {
                                'min': d.content.range[0],
                                'max': d.content.range[1],
                            },
                        });
                        div.node().noUiSlider.on("change", function () { // control panel update method
                            if (!d.content.variableRoot) {
                                graphicopt.opt[d.content.variable] = +this.get();
                            }else
                                d.content.variableRoot[d.content.variable] = +this.get();
                            if (d.content.callback)
                                d.content.callback();
                            else
                                start();
                        });
                    }else if (d.content.type === "checkbox") {
                        let div = d3.select(this).style('width', d.content.width).append('label').attr('class', 'valign-wrapper left-align');
                        div.append('input')
                            .attrs({
                                type: "checkbox",
                                class: "filled-in"
                            }).on('change',function(){
                            graphicopt[d.content.variable]  =  this.checked;
                            if (d.content.callback)
                                d.content.callback();
                        }).node().checked = graphicopt[d.content.variable];
                        div.append('span')
                    }else if (d.content.type === "switch") {
                        let div = d3.select(this).style('width', d.content.width).classed('switch',true)
                            .append('label').attr('class', 'valign-wrapper')
                            .html(`${d.content.labels[0]}<input type="checkbox"><span class="lever"></span>${d.content.labels[1]}`)
                        div.select('input').node().checked = (graphicopt.opt[d.content.variable]+"") ===d.content.labels[1];
                        div.select('input').on('change',function(){
                            graphicopt.opt[d.content.variable]  =  d.content.values[+this.checked];
                            if (d.content.callback)
                                d.content.callback();
                            else
                                start();
                        })
                            // .node().checked = graphicopt[d.content.variable];
                    }else if (d.content.type === "selection") {
                        let div = d3.select(this).style('width', d.content.width)
                            .append('select')
                            .on('change',function(){
                                graphicopt[d.content.variable]  =  d.content.values[this.value];
                                if (d.content.callback)
                                    d.content.callback();
                            });
                        div
                            .selectAll('option').data(d.content.labels)
                            .enter().append('option')
                            .attr('value',(e,i)=>i).text((e,i)=>e);
                        $(div.node()).val( d.content.values.indexOf(graphicopt[d.content.variable]));
                    }
                }
            });


        let div = d3.select('#modelDistanceFilter').node();
        if (!div.noUiSlider) {
            noUiSlider.create(div, {
                start: 0.5,
                connect: 'upper',
                orientation: 'horizontal', // 'horizontal' or 'vertical'
                range: {
                    'min': 0,
                    'max': 1,
                },
            });
            div.noUiSlider.on("change", function () { // control panel update method
                graphicopt.filter.distance = +this.get();
                d3.select('#modelFilterBy').dispatch("change");
            });
            d3.select(div).select('.noUi-handle').append('span').attr('class','num');
        }
        d3.select('#modelCompareMode').on('change',function(){
            graphicopt.iscompareMode=d3.select(this).property('checked')

        });
    };
    function updateTableInput(){
        table_info.select(`.datain`).text(e=>datain.length);
        d3.select('#modelCompareMode').property('checked',graphicopt.iscompareMode)
        try {
            d3.values(self.controlPanel).forEach((d)=>{
                if (graphicopt.opt[d.variable]) {
                    // d3.select('.nNeighbors div').node().noUiSlider.updateOptions({
                    //     range: {
                    //         'min': 1,
                    //         'max': Math.round(datain.length / 2),
                    //     }
                    // });
                    d3.select(`.${d.variable} div`).node().noUiSlider.set(graphicopt.opt[d.variable]);
                }
            });
        }catch(e){

        }
    }
    function updateTableOutput(output){
        d3.entries(output).forEach(d=>{
            table_info.select(`.${d.key}`).text(e=>d.value? formatTable[e.variable]? formatTable[e.variable](d.value):d3.format('.4s')(d.value) :'_');
        });

    }

    function loadProjection(opt,calback){
        let totalTime_marker = performance.now();
        d3.json(`data/${dataInformation.filename.replace('.csv','')}_${opt.projectionName}_${opt.nNeighbors}_${opt.dim}_${opt.minDist}.json`,function(error,sol){
            if (!error) {
                let xrange = d3.extent(sol, d => d[0]);
                let yrange = d3.extent(sol, d => d[1]);
                let xscale = d3.scaleLinear().range([0, graphicopt.widthG()]);
                let yscale = d3.scaleLinear().range([0, graphicopt.heightG()]);
                const ratio = graphicopt.heightG() / graphicopt.widthG();
                if ((yrange[1] - yrange[0]) / (xrange[1] - xrange[0]) > graphicopt.heightG() / graphicopt.widthG()) {
                    yscale.domain(yrange);
                    let delta = ((yrange[1] - yrange[0]) / ratio - (xrange[1] - xrange[0])) / 2;
                    xscale.domain([xrange[0] - delta, xrange[1] + delta])
                } else {
                    xscale.domain(xrange);
                    let delta = ((xrange[1] - xrange[0]) * ratio - (yrange[1] - yrange[0])) / 2;
                    yscale.domain([yrange[0] - delta, yrange[1] + delta])
                }
                calback({
                    action: 'stable',
                    value: {iteration: 1, time: 0, totalTime: performance.now() - totalTime_marker},
                    xscale: {domain: xscale.domain()},
                    yscale: {domain: yscale.domain()},
                    sol: sol
                })
            }else
                calback();
        })
        // solution = sol;
    }

    master.runopt = function (_) {
        //Put all of the options into a variable called runopt
        if (arguments.length) {
            for (let i in _) {
                if ('undefined' !== typeof _[i]) {
                    runopt[i] = _[i];
                }
            }
            return master;
        }else {
            return runopt;
        }

    };
    master.graphicopt = function (__) {
        //Put all of the options into a variable called graphicopt
        if (arguments.length) {
            for (let i in __) {
                if ('undefined' !== typeof __[i]) {
                    graphicopt[i] = __[i];
                }
            }
            if (graphicopt.radaropt)
                graphicopt.radaropt.schema = serviceFullList;
            if (graphicopt.radarTableopt) {
                graphicopt.radarTableopt.schema = serviceFullList;
            }

            createRadar = _.partialRight(createRadar_func,'timeSpace radar',graphicopt.radaropt,colorscale);
            createRadarTable = _.partialRight(createRadar_func,'timeSpace radar',graphicopt.radarTableopt,colorscale);
            return master;
        }else {
            return graphicopt;
        }

    };

    master.solution = function (_) {
        return solution;
    };

    master.color = function (_) {
        return arguments.length ? (colorscale = _, master) : colorscale;
    };

    master.schema = function (_) {
        return arguments.length ? (graphicopt.radaropt.schema = _,radarChartclusteropt.schema=_,schema = _, master) : schema;
    };
    master.dispatch = function (_) {
        return arguments.length ? (returnEvent = _, master) : returnEvent;
    };

    return master;
}

function calculateMSE_num(a,b){
    return ss.sum(a.map((d,i)=>(d-b[i])*(d-b[i])));
}

d3.pcaTimeSpace = _.bind(d3.TimeSpace,{name:'PCA',controlPanel: {},workerPath:'src/script/worker/PCAworker.js',outputSelection:[{label:"Total time",content:'_',variable:'totalTime'}]});
d3.tsneTimeSpace = _.bind(d3.TimeSpace,
    {name:'t-SNE',controlPanel: {
        epsilon: {text: "Epsilon", range: [1, 40], type: "slider", variable: 'epsilon', width: '100px'},
        perplexity: {text: "Perplexity", range: [1, 1000], type: "slider", variable: 'perplexity', width: '100px'},
        stopCondition: {
            text: "Limit \u0394 cost",
            range: [-12, -3],
            type: "slider",
            variable: 'stopCondition',
            width: '100px'
        },
    },workerPath:'src/script/worker/tSNETimeSpaceworker.js',outputSelection:[ {label: "#Iterations", content: '_', variable: 'iteration'},
        {label: "Cost", content: '_', variable: 'cost'},
        {label: "\u0394 cost", content: '_', variable: 'deltacost'},
        {label: "Time per step", content: '_', variable: 'time'},
        {label: "Total time", content: '_', variable: 'totalTime'}]});
d3.umapTimeSpace  = _.bind(d3.TimeSpace,
    {name:'UMAP',controlPanel: {
            minDist:{text:"Minimum distance", range:[0,1], type:"slider", variable: 'minDist',width:'100px',step:0.1},
            nNeighbors:{text:"#Neighbors", range:[1,200], type:"slider", variable: 'nNeighbors',width:'100px'},
        },workerPath:'src/script/worker/umapworker.js',outputSelection:[ {label:"#Iterations",content:'_',variable: 'iteration'},
            {label:"Time per step",content:'_',variable:'time'},
            {label:"Total time",content:'_',variable:'totalTime'},]});


// function handle_data_model(tsnedata) {
//     let dataIn = [];
//     d3.values(tsnedata).forEach(axis_arr => {
//         let lastcluster;
//         let lastdataarr;
//         let count = 0;
//         sampleS.timespan.forEach((t, i) => {
//             let index = axis_arr[i].cluster;
//             axis_arr[i].clusterName = cluster_info[index].name
//             // timeline precalculate
//             if (!(lastcluster !== undefined && index === lastcluster) || runopt.suddenGroup && calculateMSE_num(lastdataarr, axis_arr[i]) > cluster_info[axis_arr[i].cluster].mse * runopt.suddenGroup) {
//                 lastcluster = index;
//                 lastdataarr = axis_arr[i];
//                 axis_arr[i].timestep = count; // TODO temperal timestep
//                 count++;
//                 dataIn.push(axis_arr[i])
//             }
//             return index;
//             // return cluster_info.findIndex(c=>distance(c.__metrics.normalize,axis_arr)<=c.radius);
//         })
//     });
//     return dataIn;
// }
let windowsSize = 1;
// let timeWeight = 0;
function handle_data_model(tsnedata,isKeepUndefined) {
    preloader(true,1,'preprocess data','#modelLoading');
    windowsSize = windowsSize||1;
    // get windown surrounding
    let windowSurrounding =  (windowsSize - 1)/2;
    let dataIn = [];
    // let timeScale = d3.scaleLinear().domain([0,sampleS.timespan.length-1]).range([0,timeWeight]);
    d3.values(tsnedata).forEach(axis_arr => {
        let lastcluster;
        let lastdataarr;
        let count = 0;
        let timeLength = sampleS.timespan.length;
        sampleS.timespan.forEach((t, i) => {
            let currentData = axis_arr[i].slice();
            currentData.cluster = axis_arr[i].cluster;
            if (currentData.cluster <0) // outliers
                return;
            currentData.name = axis_arr[i].name.split('__')[0];
            // currentData.name = axis_arr[i].name;
            currentData.__timestep = axis_arr[i].timestep;
            let index = currentData.cluster;
            currentData.clusterName = cluster_info[index].name;
            let appendCondition = !cluster_info[currentData.cluster].hide;
            appendCondition = appendCondition && !(lastcluster !== undefined && index === lastcluster) || runopt.suddenGroup && calculateMSE_num(lastdataarr, currentData) > cluster_info[currentData.cluster].mse * runopt.suddenGroup;
            if (appendCondition) {
            // if (!(lastcluster !== undefined && index === lastcluster)|| currentData.cluster===13 || runopt.suddenGroup && calculateMSE_num(lastdataarr, currentData) > cluster_info[currentData.cluster].mse * runopt.suddenGroup) {
                currentData.show = true;
            // // add all points
            // }
            // // timeline precalculate
            // if (true) {

                lastcluster = index;
                lastdataarr = currentData.slice();
                currentData.timestep = count+1*axis_arr[i].category; // TODO temperal timestep
                currentData.__timestep = currentData.timestep; // TODO temperal timestep
                // currentData.timestep = count; // TODO temperal timestep

                count++;
                // make copy of axis data
                currentData.data = currentData.slice();
                // currentData.push(timeScale(axis_arr[i].timestep))
                // adding window
                for (let w = 0; w<windowSurrounding; w++)
                {
                    let currentIndex = i -w;
                    let currentWData;
                    if (currentIndex<0) // bounder problem
                        currentIndex = 0;
                    currentWData = axis_arr[currentIndex].slice();
                    // currentWData.push(timeScale(axis_arr[currentIndex].timestep))
                    currentWData.forEach(d=>{
                        currentData.push(d);
                    });
                }
                for (let w = 0; w<windowSurrounding; w++)
                {
                    let currentIndex = i + w;
                    let currentWData;
                    if (currentIndex > timeLength-1) // bounder problem
                        currentIndex = timeLength-1;
                    currentWData = axis_arr[currentIndex];
                    // currentWData.push(timeScale(axis_arr[currentIndex].timestep))
                    currentWData.forEach(d=>{
                        currentData.push(d);
                    });
                }
                if (isKeepUndefined)
                {
                    for (let i = 0; i< currentData.length; i++){
                        if (currentData[i]===0)
                            currentData[i] = -1;
                    }
                }
                dataIn.push(currentData);
            }
            return index;
            // return cluster_info.findIndex(c=>distance(c.__metrics.normalize,axis_arr)<=c.radius);
        })
    });
    return dataIn;
}

function handle_data_umap(tsnedata) {

        const dataIn = handle_data_model(tsnedata,true);
        // if (!umapopt.opt)
        umapopt.opt = {
            projectionName:'umap',
            // nEpochs: 20, // The number of epochs to optimize embeddings via SGD (computed automatically = default)
            // nNeighbors:  Math.round(dataIn.length/cluster_info.length/5)+2, // The number of nearest neighbors to construct the fuzzy manifold (15 = default)
            nNeighbors:  50, // The number of nearest neighbors to construct the fuzzy manifold (15 = default)
            // nNeighbors: 15, // The number of nearest neighbors to construct the fuzzy manifold (15 = default)
            dim: 2, // The number of components (dimensions) to project the data to (2 = default)
            minDist: 1, // The effective minimum distance between embedded points, used with spread to control the clumped/dispersed nature of the embedding (0.1 = default)
        };
        umapTS.graphicopt(umapopt).color(colorCluster).init(dataIn, cluster_info);

}
function handle_data_tsne(tsnedata) {
    const dataIn = handle_data_model(tsnedata);
    // if (!TsneTSopt.opt)
        TsneTSopt.opt = {
            projectionName:'tsne',
            epsilon: 20, // epsilon is learning rate (10 = default)
            // perplexity: Math.round(dataIn.length / cluster_info.length), // roughly how many neighbors each point influences (30 = default)
            perplexity: 20, // roughly how many neighbors each point influences (30 = default)
            dim: 2, // dimensionality of the embedding (2 = default)
        }
    tsneTS.graphicopt(TsneTSopt).color(colorCluster).init(dataIn, cluster_info);
}
function handle_data_pca(tsnedata) {
    const dataIn = handle_data_model(tsnedata);
    // if (!PCAopt.opt)
        PCAopt.opt = {
            projectionName:'pca',
            dim: 2, // dimensionality of the embedding (2 = default)
        };
    pcaTS.graphicopt(PCAopt).color(colorCluster).init(dataIn, cluster_info);
}