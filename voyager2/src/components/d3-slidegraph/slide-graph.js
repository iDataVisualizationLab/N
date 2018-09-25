'use strict';
angular.module('voyager2')
    .directive('slideGraph', function(){
        //template: "<svg id =\'bi-plot\' width=\'100%\' class=\"\"></svg>",
        return {
            templateUrl: 'components/d3-slidegraph/slide-graph.html',
            replace: true,
            scope: {
                charts: '<', // Two-way
                postSelectAction: '&'
            },
            link: function postLink(scope,element) {


                var pos = 0;
                var itemCount = scope.charts.length;
                var items = d3.select(".items-slider");
                //scope.PCAplot = PCAplot;
                // console.log (scope.charts);
                function setTransform() {
                    //items.style("transform",'translate3d(' + (-pos * items.node().offsetWidth) + 'px,0,0)');
                    items.style("transform",'translate3d(0,' + (-pos * items.node().offsetHeight) + 'px,0)');
                }

                scope.prev = function() {

                    pos = Math.max(pos - 1, 0);

                    setTransform();
                };

                scope.next = function () {

                    pos = Math.min(pos + 1, itemCount - 1);
                    setTransform();
                };

                scope.$on('$destroy', function() {
                    console.log('guideplot destroyed');
                    if (view) {
                        destroyView();
                    }

                    if (hoverPromise) {
                        $timeout.cancel(hoverPromise);

                    }
                });
            }
        }
    });
