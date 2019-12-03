import {concaveHull, convexHull, concaveHullArea, convexHullArea, concaveHull1} from "./hulls";

export class Convex {
    constructor(tree, alpha) {
        this.tree = tree;
        this.alpha = 1/alpha;
    }

    /**
     * Returns convex score
     * @returns {number}
     */
    score() {
        let concaveArea = concaveHullArea(this.concaveHull());
        let convexArea = convexHullArea(this.convexHull());
        if(convexArea===0){
            return 0;
        }
        return concaveArea / convexArea;
    }

    concaveHull() {
        if(!this.cch){
            //Clone the tree to avoid modifying it
            let tree = JSON.parse(JSON.stringify(this.tree));
            let sites = tree.nodes.map(d => d.id);
            let cch = concaveHull(this.alpha, sites);
            // while(cch.length == 0   ){
            //     // //Add a random factor to avoid removing all points
            //     // const newSites = sites.map(p=>{
            //     //     let newP = [];
            //     //     for (let i = 0; i < p.length; i++) {
            //     //         newP[i] = p[i] + (Math.random() - 0.5)*10e-5;
            //     //     }
            //     //     return newP;
            //     // });
            //     // cch = concaveHull(this.alpha, newSites);
            //     //Change alpha a little bit
            //     // this.alpha = this.alpha - 10e-3;
            //     // cch = concaveHull(this.alpha, sites);
            //
            //     //switch to delaunay way of calculating alpha shape.
            //     cch = concaveHull1(scagnostics.delaunay, 1/this.alpha);
            // }
            this.cch = cch;
        }
        return this.cch;
    }

    convexHull() {
        if(!this.cvh){
            //Clone the tree to avoid modifying it
            let tree = JSON.parse(JSON.stringify(this.tree));
            let sites = tree.nodes.map(d => d.id);
            this.cvh = convexHull(sites);
        }
        return this.cvh;
    }
}
