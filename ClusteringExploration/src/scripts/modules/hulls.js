import alphaShape from 'alpha-shape';
import * as polygon from 'd3-polygon';
import {distance} from './kruskal-mst';
import _ from "underscore";
import {Delaunay} from "d3-delaunay";
import {isA2DLine} from "./line";

export function concaveHull(alpha, sites) {
    //check if the sites are on the same line
    if (isA2DLine(sites)) {
        //Just simply returns that sites as concave hull
        return [sites];
    }
    let cells = alphaShape(alpha, sites);
    //Switch to another delaunay + cut long edge algorithms
    if (cells.length === 0) {
        cells = concaveHull1(sites, 1 / alpha);
    }
    let hulls = [];
    processCells(cells, hulls);
    hulls = hulls.map(h => {
        //Get vertices
        let vertices = Array.from(h).map(item => {
            return sites[item];
        });
        return sortVerticies(vertices);
    });
    return hulls;
}

export function concaveHullArea(hulls) {
    let total = 0;
    hulls.forEach(h => {
        total += Math.abs(polygon.polygonArea(h));//Still need to use Math.abs here since for the case of line => the sort vertices may return very small negative values
    });
    return total;
}

export function concaveHullLength(hulls) {
    let total = 0;
    hulls.forEach(h => {
        total += polygon.polygonLength(h);
    });
    return total;
}

export function convexHull(sites) {
    //check if the sites are on the same line
    if (isA2DLine(sites)) {
        //Just simply returns that sites as concave hull
        return sites;
    }
    const cells = alphaShape(0, sites);
    let h = Array.from(new Set(cells.flat()));
    //Get vertices
    let vertices = Array.from(h).map(item => {
        return sites[item];
    });
    return sortVerticies(vertices);
}

export function convexHullArea(hull) {
    return Math.abs(polygon.polygonArea(hull));//Still need to use Math.abs here since for the case of line => the sort vertices may return very small negative values
}

//<editor-fold desc="Util to convert cells to hulls">
function putCellToHulls(cell, hulls) {
    for (let i = 0; i < hulls.length; i++) {
        let hull = hulls[i];
        if (hull.has(cell[0])) {
            hull.add(cell[1]);
            return true;
        } else if (hull.has(cell[1])) {
            hull.add(cell[0]);
            return true;
        }
    }
    return false;
}

function processCells(cells, hulls) {
    if (cells.length === 0) {
        return;
    }
    //If loop through all cells but can't put into any hull then need to create new hull
    let processedIndice = [];
    cells.forEach((cell, i) => {
        if (putCellToHulls(cell, hulls)) {
            processedIndice.push(i);
        }
    });
    //If loop through all of them but none got put into the cells => we need to take first one from cells to create a new hull.
    if (processedIndice.length == 0) {
        //Put first one in the hull
        let cell = cells.shift();
        const hull = new Set(cell);
        hulls.push(hull);
    } else {
        //Remove the processed items and continue.
        cells = cells.filter((v, i) => processedIndice.indexOf(i) < 0);
    }
    //Do this recursively
    processCells(cells, hulls);
}

function sortVerticies(points) {
    let center = findCentroid(points);
    points.sort((a, b) => {
        let a1 = (toDegrees(Math.atan2(a[0] - center[0], a[1] - center[1])) + 360) % 360;
        let a2 = (toDegrees(Math.atan2(b[0] - center[0], b[1] - center[1])) + 360) % 360;
        return Math.round(a1 - a2);
    });
    return points;

    function toDegrees(angle) {
        return angle * (180 / Math.PI);
    }

    function findCentroid(points) {
        let x = 0;
        let y = 0;
        points.forEach(p => {
            x += p[0];
            y += p[1];
        });
        let center = [];
        center.push(x / points.length);
        center.push(y / points.length);
        return center;
    }
}

//</editor-fold>

//<editor-fold desc="Another way of calculating concave hull, basing on delaunay and removing long length">
//Adapted from: https://bl.ocks.org/emeeks/9aa0478cf739164c9005
export function concaveHull1(sites, longEdge) {
    //TODO: Consider to reuse the previous delaunay result (but how to pass to this in a proper way)
    let delaunay = Delaunay.from(sites);
    //Remove the long distance edges
    let cells = [];
    longEdge = longEdge - 10e-3;//Substract it here since it will be added later
    let triangles = delaunay.triangles;
    //TODO: May need to check to convert from delaunay.points (x0, y0, x1, y1, ...) or take directly from sites like this.
    let points = sites;
    while (cells.length <= 0) {
        longEdge = longEdge + 10e-3;
        for (let i = 0; i < triangles.length; i += 3) {
            for (let j = 0; j < 3; j++) {
                let d = distance(points[triangles[i + j]], points[triangles[i + (j + 1) % 3]]);
                if (d < longEdge) {
                    cells.push([triangles[i + j], triangles[i + (j + 1) % 3]]);
                }
            }
        }
    }
    //do the edge count
    let edgeCount = {};
    cells.forEach(edge => {
        let theKey = edge.sort().join(',');
        edgeCount[theKey] = edgeCount[theKey] ? edgeCount[theKey] : 0 + 1;
    });
    //Filter the inner edges (duplicated).
    cells = cells.filter(edge => {
        let theKey = edge.sort().join(',');
        return edgeCount[theKey] === 1;
    })
    //Next we remove the duplicated edges => only take the unique points.
    // cells = _.uniq(cells, false, d => d.sort().join(','));
    return cells;
}

//</editor-fold>

//