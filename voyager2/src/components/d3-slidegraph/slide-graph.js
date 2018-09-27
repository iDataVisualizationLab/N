'use strict';
angular.module('voyager2')
    .directive('slideGraph', function(){
        //template: "<svg id =\'bi-plot\' width=\'100%\' class=\"\"></svg>",
        return {
            templateUrl: 'components/d3-slidegraph/slide-graph.html',
            replace: true,
            scope: {
                charts: '<', // Two-way
                pos: '=',
                postSelectAction: '&'
            },
            link: function postLink(scope,element) {

                var itemCount = scope.charts.length;
                var items = d3.select(".items-slider");
                //scope.PCAplot = PCAplot;
                // console.log (scope.charts);
                function setTransform() {
                    //items.style("transform",'translate3d(' + (-pos * items.node().offsetWidth) + 'px,0,0)');
                    items.style("transform",'translate3d(0,' + (-scope.pos * items.node().offsetHeight) + 'px,0)');
                }

                scope.$watch("pos",function(){
                    setTransform();
                },true);

                scope.prev = function() {

                    scope.pos = Math.max(scope.pos - 1, 0);

                    setTransform();
                };

                scope.next = function () {

                    scope.pos = Math.min(scope.pos + 1, itemCount - 1);
                    setTransform();
                };

                scope.$on('$destroy', function() {
                    console.log('guideplot destroyed');
                    scope.charts = null;
                });
            }
        }
    });
