import {max} from 'simple-statistics';
import {equalPoints, pairNodeLinks, equalLinks} from "./kruskal-mst";
import _ from 'underscore';

export class Clumpy {
    constructor(tree) {
        //Clone the tree to avoid modifying it
        this.tree = JSON.parse(JSON.stringify(tree));
    }

    /**
     * Returns clumpy score
     * @returns {number}
     */
    score() {
        let allRuntRatios = [];
        this.tree.links.forEach(link =>{
            let rg = this.runtGraph(link);
            if(rg.length>0){
                allRuntRatios.push(this.maxLength(rg)/link.weight);
            }
        });
        if(allRuntRatios.length>0){
            //Only if there are some runt graphs
            return max(allRuntRatios.map(rr=>1-rr));
        }else{
            //In case all lengths are equal => then the score is 0
            return 0;
        }
    }
    // score() {
    //     return max(this.tree.links.map(link=>1-this.maxLength(this.runtGraph(link))/link.weight));
    // }
    // runtGraph(link){
    //     let greaterOrEqualLinks = this.tree.links.filter(l=>l.weight >= link.weight);
    //     //Remove the currently checking link.
    //     greaterOrEqualLinks = greaterOrEqualLinks.filter(l=>!equalLinks(l, link));
    //     let pairedResults = pairNodeLinks(greaterOrEqualLinks);
    //
    //     //Process the source side.
    //     let sourceConnectedNodes = [link.source];
    //     let sourceConnectedLinks = this.getConnectedLinks(sourceConnectedNodes, pairedResults);
    //
    //     let targetConnectedNodes = [link.target];
    //     let targetConnectedLinks = this.getConnectedLinks(targetConnectedNodes, pairedResults);
    //
    //     return sourceConnectedLinks.length < targetConnectedLinks.length?sourceConnectedLinks:targetConnectedLinks;
    // }
    runtGraph(link){
        let greaterOrEqualLinks = this.tree.links.filter(l=>l.weight < link.weight);
        //Remove the currently checking link.
        greaterOrEqualLinks = greaterOrEqualLinks.filter(l=>!equalLinks(l, link));
        let pairedResults = pairNodeLinks(greaterOrEqualLinks);

        //Process the source side.
        let sourceConnectedNodes = [link.source];
        let sourceConnectedLinks = this.getConnectedLinks(sourceConnectedNodes, pairedResults);

        let targetConnectedNodes = [link.target];
        let targetConnectedLinks = this.getConnectedLinks(targetConnectedNodes, pairedResults);

        return sourceConnectedLinks.length < targetConnectedLinks.length?sourceConnectedLinks:targetConnectedLinks;
    }


    getConnectedLinks(connectedNodes, pairedResults) {
        let processedNodes = [];
        let connectedLinks = [];
        while (connectedNodes.length > 0) {
            //Can stop earlier if this is having more than half of the links in the whole tree.
            if(connectedLinks.length > this.tree.links.length + 1){
                break;
            }
            let firstNode = _.first(connectedNodes);
            //Removed the processed nodes
            connectedNodes = _.without(connectedNodes, firstNode);
            //Add it to the processed node
            processedNodes.push(firstNode);
            //Find the edges connected to that node.
            let result = pairedResults.find(p => p[0] === firstNode.join(","));
            let links = result?result[1]:[];
            connectedLinks = connectedLinks.concat(links);
            //Add new nodes to be processed
            links.forEach(l => {
                //If the node in the connected link is not processed => then add it to be processed (to expand later on).
                if (!pointExists(processedNodes, l.source)) {
                    connectedNodes.push(l.source);
                }
                if(!pointExists(processedNodes, l.target)) {
                    connectedNodes.push(l.target);
                }
            });
        }
        return connectedLinks;
    }

    maxLength(runtGraph){
        if(runtGraph.length===0){
            return 0;
        }
        return max(runtGraph.map(l=>l.weight));
    }
}
export function pointExists(points, point){
    for (let i = 0; i < points.length; i++) {
        let point1 = points[i];
        if (equalPoints(point1, point)) {
            return true;
        }
    }
    return false;
}