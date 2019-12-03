import {Delaunay} from "d3-delaunay";
import {createGraph} from "./modules/kruskal-mst";
import {mst} from "./modules/kruskal-mst";
import {Outlying} from "./modules/outlying";
import {Normalizer} from "./modules/normalizer";
import {LeaderBinner} from "./modules/leaderbinner";
import {Binner} from "./modules/binner";
import _ from "underscore";
// import {Binner} from './modules/binner';
if (!window) {
    window = self;
}
(function (window) {
    /**
     * initialize a scagnostic object
     * @param inputPoints   {*[][]} set of points from the scatter plot
     * @returns {*[][]}
     */
    window.outliagnostics = function (inputPoints, options = {}) {
        let thisInstance = this;
        let binType = options.binType,
            startBinGridSize = options.startBinGridSize,
            isNormalized = options.isNormalized,
            isBinned = options.isBinned,
            outlyingUpperBound = options.outlyingUpperBound,
            minBins = options.minBins,
            maxBins = options.maxBins;
        //Clone it to avoid modifying it.
        let points = inputPoints.slice(0);
        let normalizedPoints = points;
        /******This section is about normalizing the data******/
        if (!isNormalized) {
            let normalizer = new Normalizer(points);
            normalizedPoints = normalizer.normalizedPoints;
        }
        /******This section is about finding number of bins and binners******/
        let sites = null;
        let bins = null;

        if (!isBinned) {//Only do the binning if needed.
            let binSize = null;
            let binner = null;
            let binRadius = 0;
            if (!startBinGridSize) {
                startBinGridSize = 40;
            }
            bins = [];
            //Default bin range
            let minNumOfBins = 50;
            let maxNumOfBins = 250;
            if (minBins) {
                minNumOfBins = minBins;
            }
            if (maxBins) {
                maxNumOfBins = maxBins;
            }

            //Don't do the binning if the unique set of values are less than 50. Just return the unique set.
            let uniqueKeys = _.uniq(normalizedPoints.map(p => p.join(',')));
            let groups = _.groupBy(normalizedPoints, p => p.join(','));
            if (uniqueKeys.length < minNumOfBins) {
                uniqueKeys.forEach(key => {
                    let bin = groups[key];
                    //Take the coordinate of the first point in the group to be the bin leader (they should have the same points actually=> so just take the first one.
                    bin.x = bin[0][0];
                    bin.y = bin[0][1];
                    bin.binRadius = 0;
                    bins.push(bin);
                });
            } else {
                do {
                    //Start with 40x40 bins, and divided by 2 every time there are more than maxNumberofBins none empty cells, increase 5 (+5) if less than minNumberOfBins
                    if (binSize === null) {
                        binSize = startBinGridSize;
                    } else if (bins.length > maxNumOfBins) {
                        binSize = binSize / 2;
                    } else if (bins.length < minNumOfBins) {
                        binSize = binSize + 5;
                    }
                    if (binType === "hexagon") {
                        // This section uses hexagon binning
                        let shortDiagonal = 1 / binSize;
                        binRadius = Math.sqrt(3) * shortDiagonal / 2;
                        binner = new Binner().radius(binRadius).extent([[0, 0], [1, 1]]);//extent from [0, 0] to [1, 1] since we already normalized data.
                        bins = binner.hexbin(normalizedPoints);
                    } else if (!binType || binType === "leader") {
                        // This section uses leader binner
                        binRadius = 1 / (binSize * 2);
                        binner = new LeaderBinner(normalizedPoints, binRadius);
                        bins = binner.leaders;
                    }
                } while (bins.length > maxNumOfBins || bins.length < minNumOfBins);
            }
            sites = bins.map(d => [d.x, d.y]); //=>sites are the set of centers of all bins
            outputValue("bins", bins);
            outputValue("binSize", binSize);
        } else {
            sites = normalizedPoints;
        }

        /******This section is about the triangulating and triangulating results******/
            //Triangulation calculation
        let delaunay = Delaunay.from(sites);
        delaunay.points = sites;
        delaunay.triangleCoordinates = function () {
            let triangles = this.triangles;
            let tc = [];
            for (let i = 0; i < triangles.length; i += 3) {
                tc.push([
                    this.points[triangles[i]],
                    this.points[triangles[i + 1]],
                    this.points[triangles[i + 2]]
                ]);
            }
            return tc;
        }
        let triangleCoordinates = delaunay.triangleCoordinates();
        /******This section is about the spanning tree and spanning tree results******/
            //Spanning tree calculation
        let graph = createGraph(triangleCoordinates);
        let mstree = mst(graph);
        outputValue("mst", mstree);
        /******This section is about the outlying score and outlying score results******/
        let outlying = new Outlying(mstree, outlyingUpperBound);
        let outlyingScore = outlying.score();
        outlyingUpperBound = outlying.upperBound;
        let outlyingLinks = outlying.links();
        let outlyingPoints = outlying.points();
        let noOutlyingTree = outlying.removeOutlying();
        outputValue("outlyingScore", outlyingScore);
        outputValue("outlyingUpperBound", outlyingUpperBound);
        outputValue("outlyingLinks", outlyingLinks);
        outputValue("outlyingPoints", outlyingPoints);
        outputValue("noOutlyingTree", noOutlyingTree);

        return this;

        function outputValue(name, value) {
            thisInstance[name] = value;
        }
    };

})(window);