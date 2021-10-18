import React from 'react';
import * as d3 from 'd3';
import {withStyles} from "@material-ui/styles";
import {sankey,sankeyJustify} from "d3-sankey"
import {ScaleOrdinal, ScaleSequential} from "d3-scale";
import {map as d3_map} from "d3-array"
import NodeElement from "./NodeElement";

const styles = theme => ({
    svg: {
        '& .fade': {
            opacity: 0.2
        },
        '& .onhighlight .outer_node:not(.highlight)':
            {opacity: 0.1},
        '& .onhighlight .outer_node.highlight':
            {
                opacity: 1,
                // '& path.main': {
                //     opacity: 0
                // }
            }
    }
});

class Sankey extends React.Component {
    svgRef = React.createRef();

    widthView() {
        return this.props.width * (this.state.scalezoom ?? 1)
    }

    heightView() {
        return this.props.height * (this.state.scalezoom ?? 1)
    }

    widthG() {
        return this.widthView() - (this.state.margin ?? {
            top: 0,
            bottom: 0,
            left: 0,
            right: 0
        }).left - (this.state.margin ?? {top: 0, bottom: 0, left: 0, right: 0}).right
    }

    heightG() {
        return this.heightView() - (this.state.margin ?? {
            top: 0,
            bottom: 0,
            left: 0,
            right: 0
        }).top - (this.state.margin ?? {top: 0, bottom: 0, left: 0, right: 0}).bottom
    }

    padding = 0;
    isAnimate = false;
    sankey = sankey()
        .nodeWidth(0.1)
        // .nodeAlign(sankeyLeft)
        .nodeAlign((node) => {
            return node.layer;
        })
        .nodePadding(5)
    y = d3.scalePoint()
    x = d3.scaleTime()
    svg = d3.select(null)
    g = d3.select(null)
    color = d3.scaleOrdinal(d3.schemeCategory10)
    _color = d3.scaleOrdinal(d3.schemeCategory10)

    constructor(props) {
        super(props);
        this.state = {
            freezing: false,
            margin: {top: 20, right: 20, bottom: 30, left: 100},
            data: [],
            times: [],
            nodes: [],
            links: [],
            graph: {},
        }
    }

    zoomFunc = d3.zoom().on("zoom", (event) => {
        this.svg.select('g.content').attr("transform", event.transform);
    });

    componentDidMount() {
        const {margin} = this.state;
        this.svg = d3.select(this.svgRef.current);
        this.g = this.svg.select('g.content');

        this.svg.call(this.zoomFunc.bind(this)).call(this.zoomFunc.transform, d3.zoomIdentity.translate(margin.left, margin.top));
        this.draw();
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        if ((this.props.nodes !== prevProps.nodes)||(this.props.links !== prevProps.links)) {
            this.draw();
        } else if ((this.props.width !== prevProps.width) || (this.props.height !== prevProps.height)) {
            const {nodes,links,N} = this.state.graph;
            this.renderSankey({nodes,links,N});
        } else if ((this.state.isForceDone !== prevState.isForceDone) && this.state.isForceDone && !this.svg.empty()) {
            const {margin} = this.state;
            this.svg.call(this.zoomFunc.transform, d3.zoomIdentity.translate(margin.left, margin.top));
        }
    }

    freezeHandle() {
        const {freezing} = this.state;
        if (freezing) {
            this.setState({freezing: false});
        }
    }

    draw() {
        let {freezing} = this.state;
        const {linkSource,linkTarget,linkValue,nodeId,nodeGroup} = this.props;
        let {nodes,links,linkColor,nodeGroups} = this.props;
        if (freezing)
            this.freezeHandle();

        const LS = d3_map(links, linkSource).map(intern);
        const LT = d3_map(links, linkTarget).map(intern);
        const LV = d3_map(links, linkValue);
        if (nodes === undefined) nodes = Array.from(d3.union(LS, LT), id => ({id}));
        const N = d3_map(nodes, nodeId).map(intern);
        const G = nodeGroup == null ? null : d3_map(nodes, nodeGroup).map(intern);

        // Replace the input nodes and links with mutable objects for the simulation.
        let _nodes = d3_map(nodes, (_, i) => ({id: N[i],element: _.element,layer:_.layer}));
        let _links = d3_map(links, (_, i) => ({source: LS[i], target: LT[i],_id:'link_'+JSON.stringify([LS[i],LT[i]]).replace(/\.|\[|\]| |"|\\|:|-|,/g,''), value: LV[i],element: _.element}));

        // Ignore a group-based linkColor option if no groups are specified.
        if (!G && ["source", "target", "source-target"].includes(linkColor)) linkColor = "currentColor";

        // Compute default domains.
        if (G && nodeGroups === undefined) nodeGroups = G;
        this.renderSankey({nodes:_nodes, links:_links,N});
    }
    renderSankey({nodes, links,N}){
        const {nodeAlign,nodeWidth,nodePadding,nodeTitle,linkTitle} = this.props;
        let {format,nodeLabel} = this.props;
        const width = this.widthG();
        const height = this.heightG();
        if(nodes.length && links.length){
            sankey()
                .nodeId(({index: i}) => N[i])
                .nodeAlign(nodeAlign)
                .nodeWidth(nodeWidth)
                .nodePadding(nodePadding)
                .extent([[0, 0], [width, height]])
                ({nodes, links});
        }
        // Compute titles and labels using layout nodes, so as to access aggregate values.
        if (typeof format !== "function") format = d3.format(format);
        const Tl = nodeLabel === undefined ? N : nodeLabel == null ? null : d3_map(nodes, nodeLabel);
        const Tt = nodeTitle == null ? null : d3_map(nodes, d=>nodeTitle(format,d));
        const Lt = linkTitle == null ? null : d3_map(links, d=>linkTitle(format,d));
        this.setState({nodes,links,N,Tl,Tt,Lt,format,isForceDone:true})
    }
    onMouseOver(d, event) {
        const list = {};
        const highlight = {list, el: d, event};
        highlight.list[d.source.id] = true;
        this.setState({highlight})
        if(this.props.mouseOver)
            this.props.mouseOver(d);
    }

    onRelease() {
        this.setState({highlight: undefined, highlightJob: undefined});
        if (this.props.mouseLeave)
            this.props.mouseLeave();
    }

    _getColorScale_byName(d) {
        return this._color(d.id)
    }

    _getColorScale_byValue(d) {
        const val = this.getValue(d);
        return '' + this.color(val)
    }

    getValue(d) {
        const _key = +(this.props.colorBy ?? '0');
        return d.value[_key];
    }

    getColorScale = this._getColorScale_byName;

    render() {
        const {width, height,linkColor,linkPath,theme,classes} = this.props;
        const {margin, nodes, links, isForceDone, highlight} = this.state;
        const {x, y} = this;
        y.range([0, this.heightG()]).padding(this.padding);
        x.range([0, this.widthG()]);

        this._color = this.props.colorByName ?? d3.scaleOrdinal(["#1f77b4", "#aec7e8", "#ff7f0e", "#ffbb78", "#2ca02c", "#98df8a", "#d62728", "#ff9896", "#9467bd", "#c5b0d5", "#8c564b", "#c49c94", "#e377c2", "#f7b6d2", "#7f7f7f", "#c7c7c7", "#bcbd22", "#dbdb8d", "#17becf", "#9edae5"]);
        this.color = this.props.color ?? this._color;
        if (this.props.color) {
            if (this.props.colorBy === 'name') {
                this.getColorScale = this._getColorScale_byName;
            } else
                this.getColorScale = this._getColorScale_byValue;
        }

        return <div style={{width: width + ' px', height: height + ' px', position: 'relative'}}>
            <svg width={width}
                 height={height}
                 viewBox={`0 0 ${width} ${height}`}
                 ref={this.svgRef}
                // style={{backgroundColor:'white'}}
                 className={classes.svg}>
                <defs>
                </defs>
                <rect className={"pantarget"} width={width} height={height} onClick={() => this.freezeHandle()}
                      opacity="0"/>
                {this.state.freezing && <text fill={'black'}
                                              transform={`translate(${this.widthG() / 2},20)`}>Click anywhere to
                    release</text>}
                {isForceDone ?
                    <g className={'content' + (highlight ? ' onhighlight' : '')}>
                        <g className={'background'} opacity={0.2}></g>
                        <g className={'drawArea'}>
                            <g className={'links'}>
                                {links.map(d => <NodeElement
                                    className={'outer_node element ' + (d._class??"") + (d.hide ? ' hide' : '') + ((highlight && (highlight.list[d.source.id] || highlight.list[d.target.id])) ? ' highlight' : '')}
                                    key={d._id}
                                    opacity={0.7} transform={'scale(1,1)'}
                                    //style={{mixBlendMode:'multiply'}}
                                    freezing={this.state.freezing} setfreezing={(freezing) => {
                                    this.setState({freezing});
                                    if (!freezing) {
                                        this.onRelease()
                                    }
                                }}
                                    mouseOver={(e) => this.onMouseOver(d, e)}
                                    mouseLeave={() => this.onRelease()}>
                                    {linkColor === "source-target" ?
                                        <linearGradient id={d._id} gradientUnits={'userSpaceOnUse'} x1={d.source.x1}
                                                        x2={d.target.x0}>
                                            <stop offset={'0%'} stopColor={this.getColorScale(d.source)}/>
                                            <stop offset={'100%'} stopColor={this.getColorScale(d.target)}/>
                                        </linearGradient> : ''}
                                    <path className={'main'}
                                          fill={this.getColorScale === this._getColorScale_byName ? `url(#${d._id})` : this.getColorScale(d.target)}
                                          stroke={`url(#${d._id})`}
                                          strokeWidth={0.1} d={linkPath(d, this.props.linearScale)}/>
                                    {/*{highlight&&(highlight.list[d.source.name]||highlight.list[d.target.name])?<g stroke={'white'} style={{pointerEvents:this.state.freezing?'all':'none'}}>{renderjob(d,this.props.lineaScale,this.props.maxPerUnit,this.getColorScale.bind(this), this.onMouseOverJob.bind(this), this.onReleaseJob.bind(this),this.getValue.bind(this),highlightJob)}</g>:''}*/}
                                </NodeElement>)}
                            </g>
                            <g className={'nodes'}>
                                {nodes.map(d => <g key={d.id}
                                                   className={'outer_node element' + ((highlight && highlight.list[d.id]) ? ' highlight' : '')}
                                                   transform={`translate(${d.x0},${d.y0})`}>
                                    {/*<title></title>*/}
                                    <text x={-6} y={((d.y1 + d.y0)??0) / 2 - d.y0} dy={"0.35em"} textAnchor={'end'}
                                          paintOrder={'stroke'}
                                          stroke={'white'} strokeWidth={3}
                                          fill={'black'}
                                    >{d.id }</text>
                                    <rect height={(d.y1-d.y0)??0} width={(d.x1-d.x0)??0} fill={this._getColorScale_byName(d)}/>
                                </g>)}
                            </g>
                        </g>
                    </g> : ''
                }
            </svg>
        </div>
    }
}

function horizontalSource(d) {
    return [d.source.x1, d.y0];
}

function horizontalTarget(d) {
    return [d.target.x0, d.y1];
}
function str2class(str){
    return 'l'+str.replace(/ |,/g,'_');
}
function renderjob(d,lineaScale=0,max,getColorScale,onMouseOverJob,onReleaseJob,getValue,highlightJob){
    const source = horizontalSource(d);
    const target = horizontalTarget(d);
    const thick = d.width;

    const width = (target[0]-source[0])/2;

    const v = d3.sum(Object.values(d.byComp_t));
    const scale = d3.scaleLinear().domain([0,v]).range([0,thick+lineaScale]);
    let offest = -thick/2;
    const _byComp_s={};
    const _compS={};
    Object.keys(d.sources).forEach(e=>{
        _compS[e] = {};
        d.sources[e].data.node_list.forEach((comp)=>{
            if(d.source.comp[comp]){
                _compS[e][comp] = Math.min(max,d.sources[e].data.node_list_obj[comp])
                _byComp_s[comp] = (_byComp_s[comp]??0)+_compS[e][comp];
            }
        });
    });
    Object.keys(d.sources).forEach(e=> {
        const compT={};
        const compS= _compS[e];
        let oldpos = Infinity;
        // oldpos = d.sources[e].data.start_Index;
        // let _past = undefined;
        // d.source.relatedLinks.f
        if(d.sources[e].data[d.source.layer-1]){
            // d.sources[e].data.node_list.forEach((comp:string)=>{if(d.source.comp[comp]) compS[comp] = Math.min(max,d.sources[e].data.node_list_obj[comp])});
            oldpos = d3.mean(d.sources[e].data[d.source.layer-1],(d)=>d.y) ?? Infinity;
        }
        const isEnd = d.source.layer===d.sources[e].data.finish_Index;
        const value = d3.sum(Object.keys(compS),k=>(compS[k]/_byComp_s[k]) * d.byComp[k]);
        const _thick = scale(value)??0;
        d.sources[e].display = {compS,compT,isEnd,_thick,oldpos,data:d.sources[e].data}
        if (!d.sources[e].data[d.source.layer])
            d.sources[e].data[d.source.layer] = [d.sources[e].display]
    });

    return <>{Object.keys(d.sources).sort((a,b)=>d.sources[a].display.oldpos-d.sources[b].display.oldpos).map((e,ei)=>{
        const {compS,isEnd,_thick,data}=d.sources[e].display;
        offest += _thick;
        d.sources[e].display.y = target[1]+offest-_thick/2;
        const comp = {};
        Object.keys(compS).forEach(c=>comp[c] = d.sources[e].data.node_list_obj[c]);
        const _Data= {...d.source,comp};
        const colorS= getColorScale(_Data);
        const thick = _thick/2;
        return <g key={d._id+'__'+e} onMouseOver={()=>onMouseOverJob({name:e,x:source[0],y:d.sources[e].display.y,time:d.source.time,layer:d.source.layer,value:getValue(_Data),data})} onMouseLeave={()=>onReleaseJob()} className={highlightJob?((highlightJob.el.name!==e) ? 'fade': ''):''}>
            {isEnd?<linearGradient id={d._id+'__'+e} gradientUnits={'userSpaceOnUse'} x1={d.source.x1} x2={d.target.x0}>
                <stop offset={'0%'} stopColor={colorS}/>
                <stop offset={'100%'} stopColor={'black'}/>
            </linearGradient>:''}
            <path fill={isEnd?`url(#${d._id+'__'+e})`:colorS}
                  strokeWidth={0.1} d={renderFargment([source[0],source[1]+offest-thick],[target[0],d.sources[e].display.y],width,thick)}/>
        </g>})}</>
}
function linkPath(d, linearScale = 0) {
    const source = horizontalSource(d);
    const target = horizontalTarget(d);
    const width = (target[0] - source[0]) / 2;
    const thick = d.width / 2;

    return renderFargment(source, target, width, thick, linearScale);
    // return `M ${source[0]} ${source[1]-thick} C ${source[0]+width} ${source[1]-thick}, ${target[0]-width} ${target[1]-thick}, ${target[0]} ${target[1]-thick}
    //         L ${target[0]} ${target[1]+deltathickT} C ${target[0]-width} ${target[1]+deltathickT}, ${source[0]+width} ${source[1]+deltathickS}, ${source[0]} ${source[1]+deltathickS} Z`;
}

function renderFargment(source, target, width, thick, linearScale = 0) {
    thick = thick + linearScale;
    return `M ${source[0]} ${source[1] - thick} C ${source[0] + width} ${source[1] - thick}, ${target[0] - width} ${target[1] - thick}, ${target[0]} ${target[1] - thick}
            L ${target[0]} ${target[1] + thick} C ${target[0] - width} ${target[1] + thick}, ${source[0] + width} ${source[1] + thick}, ${source[0]} ${source[1] + thick} Z`;
}
function intern(value) {
    return value !== null && typeof value === "object" ? value.valueOf() : value;
}
Sankey.defaultProps = {
    links:[],
    nodes:[],
    format : ",", // a function or format specifier for values in titles
    nodeId : d => d.id, // given d in nodes, returns a unique identifier (string)
    nodeGroup:null, // given d in nodes, returns an (ordinal) value for color
    nodeGroups:null, // an array of ordinal values representing the node groups
    nodeLabel:null, // given d in (computed) nodes, text to label the associated rect
    nodeTitle : (format,d) => `${d.id}\n${format(d.value)}`, // given d in (computed) nodes, hover text
    nodeAlign : sankeyJustify, // Sankey node alignment strategy
    nodeWidth : 15, // width of node rects
    nodePadding : 10, // vertical separation between adjacent nodes
    nodeLabelPadding : 6, // horizontal separation between node and label
    nodeStroke : "currentColor", // stroke around node rects
    nodeStrokeWidth:null, // width of stroke around node rects, in pixels
    nodeStrokeOpacity:null, // opacity of stroke around node rects
    nodeStrokeLinejoin:null, // line join for stroke around node rects
    linkSource : ({source}) => source, // given d in links, returns a node identifier string
    linkTarget : ({target}) => target, // given d in links, returns a node identifier string
    linkValue : ({value}) => value, // given d in links, returns the quantitative value
    linkPath : linkPath, // given d in (computed) links, returns the SVG path
    linkTitle : (format,d) => `${d.source.id} → ${d.target.id}\n${format(d.value)}`, // given d in (computed) links
    linkColor : "source-target", // source, target, source-target, or static color
    linkStrokeOpacity : 0.5, // link stroke opacity
    linkMixBlendMode : "multiply", // link blending mode
    colors : d3.schemeTableau10, // array of colors
    width : 640, // outer width, in pixels
    height : 400, // outer height, in pixels
    marginTop : 5, // top margin, in pixels
    marginRight : 1, // right margin, in pixels
    marginBottom : 5, // bottom margin, in pixels
    marginLeft : 1, // left margin, in pixels
};

export default withStyles(styles)(Sankey);
