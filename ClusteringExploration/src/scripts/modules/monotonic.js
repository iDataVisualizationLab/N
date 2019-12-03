export class Monotonic {
    constructor(points) {
        //Clone it in order to avoid modifying it.
        this.points = points.slice(0);
    }
    /**
     * Returns monotonic score
     * @returns {number}
     */
    score() {
        let xArr = [];
        let yArr = [];
        this.points.forEach(p=>{
            xArr.push(p[0]);
            yArr.push(p[1])
        })
        let r = computeSpearmans(xArr, yArr);
        return Math.pow(r, 2);

        /**Adopted from: https://bl.ocks.org/nkullman/f65d5619843dc22e061d957249121408**/
        function computeSpearmans(arrX, arrY) {
            // simple error handling for input arrays of nonequal lengths
            if (arrX.length !== arrY.length) { return null; }

            // number of observations
            let n = arrX.length;

            // rank datasets
            let xRanked = rankArray(arrX),
                yRanked = rankArray(arrY);

            // sum of distances between ranks
            let dsq = 0;
            for (let i = 0; i < n; i++) {
                dsq += Math.pow(xRanked[i] - yRanked[i], 2);
            }

            // compute correction for ties
            let xTies = countTies(arrX),
                yTies = countTies(arrY);
            let xCorrection = 0,
                yCorrection = 0;
            for (let tieLength in xTies) {
                xCorrection += xTies[tieLength] * tieLength * (Math.pow(tieLength, 2) - 1)
            }
            xCorrection /= 12.0;
            for (let tieLength in yTies) {
                yCorrection += yTies[tieLength] * tieLength * (Math.pow(tieLength, 2) - 1)
            }
            yCorrection /= 12.0;

            // denominator
            let denominator = n * (Math.pow(n, 2) - 1) / 6.0;

            // compute rho
            let rho = denominator - dsq - xCorrection - yCorrection;

            let x = (denominator - 2 * xCorrection) * (denominator - 2 * yCorrection);

            if(x<=0){
                return 0;
            }else{
                rho /= Math.sqrt(x);
            }

            return rho;
        }
        /** Computes the rank array for arr, where each entry in arr is
         * assigned a value 1 thru n, where n is arr.length.
         *
         * Tied entries in arr are each given the average rank of the ties.
         * Lower ranks are not increased
         */
        function rankArray(arr) {

            // ranking without averaging
            let sorted = arr.slice().sort(function (a, b) { return b - a });
            let ranks = arr.slice().map(function (v) { return sorted.indexOf(v) + 1 });

            // counts of each rank
            let counts = {};
            ranks.forEach(function (x) { counts[x] = (counts[x] || 0) + 1; });

            // average duplicates
            ranks = ranks.map(function (x) { return x + 0.5 * ((counts[x] || 0) - 1); });

            return ranks;
        }
        /** Counts the number of ties in arr, and returns
         * an object with
         * a key for each tie length (an entry n for each n-way tie) and
         * a value corresponding to the number of key-way (n-way) ties
         */
         function countTies(arr) {
            let ties = {},
                arrSorted = arr.slice().sort(),
                currValue = arrSorted[0],
                tieLength = 1;

            for (let i = 1; i < arrSorted.length; i++) {
                if (arrSorted[i] === currValue) {
                    tieLength++;
                } else {
                    if (tieLength > 1) {
                        if (ties[tieLength] === undefined) ties[tieLength] = 0;
                        ties[tieLength]++;
                    }
                    currValue = arrSorted[i];
                    tieLength = 1;
                }
            }
            if (tieLength > 1) {
                if (ties[tieLength] === undefined) ties[tieLength] = 0;
                ties[tieLength]++;
            }
            return ties;
        }
    }
}
