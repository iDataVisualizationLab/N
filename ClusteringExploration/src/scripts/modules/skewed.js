import {quantile} from 'simple-statistics';

export class Skewed {
    constructor(tree) {
        //Clone the tree to avoid modifying it
        this.tree = JSON.parse(JSON.stringify(tree));
    }

    /**
     * Returns skewed score
     * @returns {number}
     */
    score() {
        let allLengths = this.tree.links.map(l=>l.weight),
        q90 = quantile(allLengths, .9),
        q50 = quantile(allLengths, .5),
        q10 = quantile(allLengths, .1);
        if(q90!=q10){
            return (q90-q50)/(q90-q10);
        }else{
            return 0;
        }

    }
}
