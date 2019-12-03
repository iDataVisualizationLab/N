import {getAllV2CornersFromTree, getAllV1sFromTree} from "./kruskal-mst";

export class Stringy {
    constructor(tree) {
        //Clone the tree to avoid modifying it
        this.tree = JSON.parse(JSON.stringify(tree));
    }

    /**
     * Returns striated score
     * @returns {number}
     */
    score() {
        //Loop through the nodes.
        let verticesCount = this.tree.nodes.length;
        let v2Count = this.getAllV2Corners().length;
        let v1Count = this.getAllV1s().length;
        return v2Count/(verticesCount-v1Count);
    }

    /**
     * This function returns corners (three vertices) of vertices of degree two in the for mat of
     * point1, point2, point3 => point1 is the the vertex with degree two (two edges connected to it are [point1, point2] and [point1, point3] (order of the points in each edge is not important)).
     * @returns {Array}
     */
    getAllV2Corners(){
        return getAllV2CornersFromTree(this.tree);
    }

    /**
     * This function returns
     * @returns {Array}
     */
    getAllV1s(){
        return getAllV1sFromTree(this.tree);
    }
}
