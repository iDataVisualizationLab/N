'use strict';
angular.module('voyager2')
    .directive('slideCom', function(){
        //template: "<svg id =\'bi-plot\' width=\'100%\' class=\"\"></svg>",
        return {
            templateUrl: 'components/d3-slidegraph/slide-com.html',
            replace: true,
            scope: {
                chart: '=', // Two-way
            },

            link: function postLink(scope, element) {
                // console.log(element.height());
        //GuidePill.get();
                // console.log(scope.chart);
                // d3.selectAll('.background-guideplot')
                //     .style('fill', '#ffffff')
                //     .attr('width', $('.guideplot').width())
                //     .attr('height', $('.guideplot').height());
                //$scope.idplot = "gplot"+$scope.pcdDef;

            }
        }
    });
