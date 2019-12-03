import _ from 'underscore';
import {quantile} from 'simple-statistics';
import {pointExists} from "./clumpy";
import {createGraph, mst, getAllV2OrGreaterFromTree} from "./kruskal-mst";
import {delaunayFromPoints} from "./delaunay";

export class Outlying {
    constructor(tree, upperBound) {
        //Clone the tree to avoid modifying it
        this.tree = JSON.parse(JSON.stringify(tree));
        this.upperBound = upperBound;

        //Calculate the upper bound if it is not provided.
        if (!upperBound) {
            upperBound = findUpperBound(this.tree, 1.5);
            //Save it for displaying purpose.
            this.upperBound = upperBound;
        }
        //Mark the long links
        markLongLinks(this.tree, upperBound);
        //Finding normal nodes
        let normalNodes = findNormalNodes(this.tree);

        //Finding outlying points
        this.outlyingPoints = findOutlyingPoints(this.tree, normalNodes);

        //Now mark the outlying links
        markOutlyingLinks(this.tree, this.outlyingPoints);

        //Create none outlying tree
        this.noOutlyingTree = buildNoOutlyingTree(this.tree, this.outlyingPoints);

        function buildNoOutlyingTree(tree, outlyingPoints) {
            let noOutlyingTree = {};
            noOutlyingTree.nodes = normalNodes;
            noOutlyingTree.links = tree.links.filter(l => l.isOutlying !== true)
            //If the outlying nodes has the degree of 2 or greater => it will break the tree into subtrees => so we need to rebuild the tree.
            //Take the outlying points
            let outlyingPointsStr = outlyingPoints.map(p => p.join(','));
            let v2OrGreaterStr = getAllV2OrGreaterFromTree(tree).map(p => p.join(','));

            let diff = _.difference(outlyingPointsStr, v2OrGreaterStr);
            if (diff.length < outlyingPointsStr.length) {
                //Means there is outlying node(s) with degree 2 or higher (so we should rebuild the tree)
                let delaunay = delaunayFromPoints(noOutlyingTree.nodes.map(n => n.id));
                let graph = createGraph(delaunay.triangleCoordinates())
                noOutlyingTree = mst(graph);
            }
            return noOutlyingTree;
        }

        function markOutlyingLinks(tree, outlyingPoints) {
            if (outlyingPoints.length > 0) {
                //Check the long links only
                tree.links.filter(l => l.isLong).forEach(l => {
                    //Also check if the link contains outlying points.
                    if (pointExists(outlyingPoints, l.source) || pointExists(outlyingPoints, l.target)) {
                        l.isOutlying = true;
                    }
                });
            }
        }

        function findNormalNodes(tree) {
            //Remove long links
            let normalLinks = tree.links.filter(l => !l.isLong);
            //Remove outlying nodes (nodes are not in any none-long links)
            let allNodesWithLinks = [];
            normalLinks.forEach(l => {
                allNodesWithLinks.push(l.source);
                allNodesWithLinks.push(l.target);
            });
            allNodesWithLinks = _.uniq(allNodesWithLinks, false, d => d.join(','));
            let normalNodes = allNodesWithLinks.map(n => {
                return {id: n};
            });
            return normalNodes;
        }

        function findOutlyingPoints(tree, normalNodes) {
            let newNodes = normalNodes;
            let oldNodes = tree.nodes;
            //Get the outlying points
            let ops = [];
            oldNodes.forEach(on => {
                //.id since we are accessing to points and the node is in form of {id: thePoint}
                if (!pointExists(newNodes.map(nn => nn.id), on.id)) {
                    ops.push(on.id);
                }
            });
            return ops;
        }

        function markLongLinks(tree, upperBound) {
            tree.links.forEach(l => {
                if (l.weight > upperBound) {
                    l.isLong = true;
                }
            });
        }

        function findUpperBound(tree, coefficient) {
            let allLengths = tree.links.map(l => l.weight),
                q1 = quantile(allLengths, 0.25),
                q3 = quantile(allLengths, 0.75),
                iqr = q3 - q1,
                upperBound = q3 + coefficient * iqr;
            return upperBound;
        }
    }

    /**
     * Returns outlying score
     * @returns {number}
     */
    score() {
        let totalLengths = 0;
        let totalOutlyingLengths = 0;
        this.tree.links.forEach(l => {
            totalLengths += l.weight;
            //If there are outlying points first.
            if (l.isOutlying) {
                totalOutlyingLengths += l.weight;
            }
        });
        return totalOutlyingLengths / totalLengths;
    }

    /**
     * Returns outlying links
     */
    links() {
        if (!this.outlyingLinks) {
            this.outlyingLinks = this.tree.links.filter(l => l.isOutlying);
        }
        return this.outlyingLinks;
    }

    /**
     * Remove outlying links and nodes and return a new tree without outlying points/edges
     */
    removeOutlying() {
        return this.noOutlyingTree;
    }

    /**
     * Returns the outlying points (in form of points, not node object).
     * @returns {Array}
     */
    points() {
        return this.outlyingPoints;
    }
}
