import {distance, getAllV2CornersFromTree, getAllV1sFromTree} from "./kruskal-mst";

export class Striated {
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
        let allObtuseV2CornersCount = this.getAllObtuseV2Corners().length;
        let v1Count = getAllV1sFromTree(this.tree).length;
        //TODO: Needs to make sure the divisor is all vertices count or vertices count for degree 2 vertices only.
        let verticesCount = this.tree.nodes.length;
        return allObtuseV2CornersCount / (verticesCount - v1Count);
        // let v2Count = this.getAllV2Corners().length;
        // return allObtuseV2CornersCount / v2Count;
    }

    getAllObtuseV2Corners() {
        let allV2Corners = this.getAllV2Corners();
        let allObtuseV2Corners = [];
        allV2Corners.forEach(corner => {
            let cs = cosine(corner[0], corner[1], corner[2]);
            if (cs <= -.75) {
                allObtuseV2Corners.push(corner);
            }
        });
        return allObtuseV2Corners;

        function cosine(p1, p2, p3) {
            let p12 = distance(p1, p2),
                p13 = distance(p1, p3),
                p23 = distance(p2, p3);
            return ((Math.pow(p12, 2)) + (Math.pow(p13, 2)) - (Math.pow(p23, 2))) / (2 * p12 * p13);
        }
    }

    /**
     * This function returns corners (three vertices) of vertices of degree two in the for mat of
     * point1, point2, point3 => point1 is the the vertex with degree two (two edges connected to it are [point1, point2] and [point1, point3] (order of the points in each edge is not important)).
     */
    getAllV2Corners() {
        return getAllV2CornersFromTree(this.tree);
    }
}
