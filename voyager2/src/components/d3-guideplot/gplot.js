'use strict';
angular.module('voyager2')
    .directive('gPlot', function(PCAplot){
        //template: "<svg id =\'bi-plot\' width=\'100%\' class=\"\"></svg>",
        return {
            templateUrl: 'components/d3-guideplot/gplot.html',
            replace: true,
            scope: {
                pcaDef: '=', // Two-way
            },
            link: function postLink(scope, element){
                scope.PCAplot = PCAplot;
                d3.select(element[0]).select('svg')
                    .attr('width',element.width())
                    .attr('height',element.height());
                PCAplot.plotguide(d3.select(element[0]).select('svg'), scope.pcaDef[0],scope.pcaDef[1]);
            },
            controller: function ($scope) {
                console.log("me");
                // d3.selectAll('.background-guideplot')
                //     .style('fill', '#ffffff')
                //     .attr('width', $('.guideplot').width())
                //     .attr('height', $('.guideplot').height());
                //$scope.idplot = "gplot"+$scope.pcdDef;
            }
        }
    });
