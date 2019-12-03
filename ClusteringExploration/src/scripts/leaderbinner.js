import {LeaderBinner} from "./modules/leaderbinner";
(function (window) {
    window.leaderbinner = function (inputPoints, binRadius) {
        //Clone it to avoid modifying it.
        let binner = new LeaderBinner(inputPoints, binRadius);
        let bins = binner.leaders;
        outputValue("bins", bins);
        return window.leaderbinner;
        function outputValue(name, value) {
            window.outliagnostics[name] = value;
        }
    };

})(window);