import {distance} from "./kruskal-mst";
import _ from "underscore";

export class LeaderBinner{
    constructor(points, radius){
        //TODO: Should check if there are more than 3 unique values here or even after the binning.
        //TODO: May need to clone the points to avoid modifying it, but we don't do to reserve other data or to make the process faster
        // //Clone these to avoid modifying them
        // this.points = points.map(p=>p.slice(0));
        this.points = points;
        this.radius = radius;
    }
    get leaders(){
        let self = this;
        let theLeaders = [];
        //find all the leaders
        this.points.forEach(point=>{
            let leader = closestLeader(theLeaders, point);
            if(!leader){
                let newLeader = [];
                newLeader.x = point[0];
                newLeader.y = point[1];
                theLeaders.push(newLeader);
            }
        });
        //now do this again to set the closest leader.
        this.points.forEach(point=>{
           let leader = closestLeader(theLeaders, point);
           leader.push(point);
        });
        return theLeaders;
        function closestLeader(leaders, point){
            let length = leaders.length;
            let minDistance = 2;//select 2 since normalized distance can't  be greater than 2.
            let theLeader = null;
            for (let i = 0; i < length; ++i) {
                let l = leaders[i];
                let d = distance([l.x, l.y], point);
                if(d< self.radius){
                    if(d<minDistance){
                        minDistance = d;
                        theLeader = l;
                    }
                }
            }
            return theLeader;

            // let distances = leaders.map(l=>distance([l.x, l.y], point));
            // //Filter the distance to be <= the radius
            // let copiedDistances = distances.filter(d=>d<self.radius);
            // if(copiedDistances.length===0){
            //     return null;
            // }
            // let theDistance = _.min(distances);
            // let theLeader = leaders[distances.indexOf(theDistance)];
            // return theLeader;
        }
    }
}