import {isA2DLine} from "./line";
import {Delaunay} from "d3-delaunay";

export function delaunayFromPoints(sites) {
    let delaunay = {};

    //But we need to order the sites
    if (isA2DLine(sites)) {
        //If it is a straight line => simulate as triangles of three consecutive points (with connection of a common points between two consecutive triangles)
        let copiedSites = sites.slice();
        //We need to sort points so that the mst will be sequential.
        copiedSites.sort((a, b)=> a[0]>b[0] ? a[0]-b[0]: a[1]-b[1]);

        let tgs = [];
        let siteLength = copiedSites.length;
        for (let i = 0; i < siteLength; i = i + 2) {
            if (i + 1 < siteLength) {
                tgs.push(i);
                tgs.push(i + 1);
            }
            if (i + 2 < siteLength) {
                tgs.push(i + 2);
            } else if (siteLength % 2 == 0) {
                tgs.push(i - 1);//If it is odd => we add back one point. to make them divisible by 3 (as triangles).
            }
        }
        delaunay.triangles = tgs;
        delaunay.points = copiedSites;
    } else {
        delaunay = Delaunay.from(sites);
        delaunay.points = sites;
    }

    //TODO: There are many places we need the triangleCoordinates function => we should build it as a prototype instead of copy/paste this function in many different places.
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
    return delaunay;
}