'use strict';
angular.module('voyager2')
    .directive('slideGraph', function(){
        //template: "<svg id =\'bi-plot\' width=\'100%\' class=\"\"></svg>",
        return {
            templateUrl: 'components/d3-slidegraph/slide-graph.html',
            replace: true,
            scope: {
                // pcaDef: '=', // Two-way
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
