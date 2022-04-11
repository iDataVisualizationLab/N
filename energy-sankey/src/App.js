import logo from './logo.svg';
import './App.css';
import Sankey from "./components/sankey/Sankey";
import React,{useEffect} from "react";
import {sum} from 'd3';
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import Typography from "@material-ui/core/Typography";
import MenuItem from "@material-ui/core/MenuItem";
import Select from "@material-ui/core/Select";
import FormControl from "@material-ui/core/FormControl";
import InputLabel from "@material-ui/core/InputLabel";
import {makeStyles} from "@material-ui/styles";
import { DataGrid } from '@mui/x-data-grid';

import {getData,handleNodeLink,valueCol} from "./components/data-config/EDR_EII";
import Table from "./components/table";

const useStyles = makeStyles((theme) => ({
    grow: {
        flexGrow: 1,
    }
}))
function App() {
    const [nodes, setNodes] = React.useState([]);
    const [links, setLinks] = React.useState([]);
    const [columnsDisplay, setColumnsDisplay] = React.useState([]);
    const [currentSelectedRow, setCurrentSelectedRow] = React.useState([]);
    const [selectedValue, setSelectedValue] = React.useState(valueCol[0]);
    useEffect(() => {
        getData.then(handleNodeLink).then(({nodes,links,columnsDisplay})=>{
            onChangeValue(nodes,links)
            setNodes(nodes);
            setLinks(links);
            setColumnsDisplay(columnsDisplay);
        })
    },[getData]);

    const onChangeValue = (nodes,links)=>{
        debugger
        links.forEach(l=>{
            l.value = sum(l.element,d=>d._value[selectedValue]);
        });
        nodes.forEach(l=>{
            l.value = sum(l.element,d=>d._value[selectedValue]);
        });
        return {nodes,links};
    }
    const classes = useStyles();
    return (
        <div className="App">
            <AppBar position="static">
                <Toolbar>
                    <Typography
                        variant="h6"
                        noWrap
                        component="div"
                        sx={{ display: { xs: 'none', sm: 'block' } }}
                    >
                        EDR-EII sankey by {selectedValue}
                    </Typography>
                    {/*<div className={classes.grow}/>*/}
                    {/*<FormControl>*/}
                    {/*    <InputLabel id="selected-label">Visualizing</InputLabel>*/}
                    {/*    <Select label={'Visualizing'} value={selectedValue} labelId="selected-label" onChange={(event)=>{*/}
                    {/*        setSelectedValue(event.target.value);*/}
                    {/*        const _nodes = nodes.slice();*/}
                    {/*        const _links = links.slice();*/}
                    {/*        onChangeValue(_nodes,_links);*/}
                    {/*        setNodes(_nodes);*/}
                    {/*        setLinks(_links); }}>*/}
                    {/*        {valueCol.map(v=><MenuItem key={v} value={v}>{v}</MenuItem>)}*/}
                    {/*    </Select>*/}
                    {/*</FormControl>*/}
                    {/*<div className={classes.grow}/>*/}
                </Toolbar>
            </AppBar>
            <div style={{width:'100%'}}>
            <Sankey nodes={nodes} links={links} width={1200} height={500} mouseOver={(d)=>setCurrentSelectedRow(d.element)} mouseLeave={()=>setCurrentSelectedRow([])}/>
            </div>
            {/*<Table data={currentSelectedRow} columns={columnsDisplay}/>*/}
        </div>
    );
}

export default App;
