'use strict';
angular.module('pcagnosticsviz')
    .directive('guidePlot', function(PCAplot) {
        //template: "<svg id =\'bi-plot\' width=\'100%\' class=\"\"></svg>",
        return {
            templateUrl: 'components/d3-guideplot/guide-plot.html',
            replace: true,
            restrict: 'E',
            scope: {
                pcaDefs: '<',
            },
            link: function ($scope) {
                //scope.PCAplot = PCAplot;
            }
        }
    });
