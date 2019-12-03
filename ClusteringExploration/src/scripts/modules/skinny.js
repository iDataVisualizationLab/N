import {concaveHullLength, concaveHullArea} from "./hulls";

export class Skinny {
    constructor(alphaHull) {
        //Clone it in order to avoid modifying it.
        this.alphaHull = alphaHull.slice();
    }
    /**
     * Returns skinny score
     * @returns {number}
     */
    score() {
        return 1 - Math.sqrt(4*Math.PI*concaveHullArea(this.alphaHull))/concaveHullLength(this.alphaHull);
    }
}
