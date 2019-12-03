/**
 * Check if set of unique points (need to make sure the points are unique) are in a line
 * @param points
 * @returns {boolean}
 */
export function isA2DLine(points) {
    let x1 = points[0][0];
    let y1 = points[0][1];
    let x2 = points[1][0];
    let y2 = points[1][1];

    for (let i = 2; i < points.length; i++) {
        let x3 = points[i][0];
        let y3 = points[i][1];
        if (((x2 - x1) * (y3 - y1) - (y2 - y1) * (x3 - x1)) !== 0) {
            return false;
        }
    }
    return true;
}