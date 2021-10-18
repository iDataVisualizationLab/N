
import React from "react";
import {makeStyles} from "@material-ui/styles";

const styles = makeStyles(theme => ({
    freezing: {
        '&:not(.highlight)': {pointerEvents: 'none'}
    },
    notFreezing: {
        '&:not(.highlight)' : {pointerEvents: 'auto'}
    }
}));

class NodeElement extends React.Component{
    onHandleClick(){
        const _freezing = this.props.freezing;
        const freezing = !_freezing;
        this.props.setfreezing(freezing)

    }
    onMouseOver(){
        if(!this.props.freezing){
            this.props.mouseOver()
        }
    }
    onMouseLeave(){
        if(!this.props.freezing){
            this.props.mouseLeave()
        }
    }
    render(){
        const {children,className,setfreezing,mouseLeave,mouseOver,...other} = this.props;
        const freezing = this.props.freezing;
        return <g {...other} onClick={()=>this.onHandleClick()}
                  className={[className,freezing?styles.freezing:styles.notFreezing].join(' ')}

                  onMouseOver={(!freezing)&&this.onMouseOver.bind(this)}
                  onMouseLeave={(!freezing)&&this.onMouseLeave.bind(this)}
        >
            {this.props.children}
        </g>;
    }
}
export default NodeElement;
