'use strict';
angular.module('voyager2')
    .directive('guideMenu', function(){
        //template: "<svg id =\'bi-plot\' width=\'100%\' class=\"\"></svg>",
        return {
            templateUrl: 'components/guidemenu/guideMenu.html',
            restrict: 'E',
            scope: {
                prop: '=',
            },
            replace: true,
            controller: function($scope, util, vl, Config, Dataset, Logger, Pills) {
                $scope.marks = ['point', 'tick', 'bar', 'line', 'area', 'text','boxplot'];
                $scope.props = ['PCA1', 'skewness', 'outlier', 'PCA2'];
                $scope.typeChange =function (){};
                $scope.markChange =function (){
                    console.log ($scope.prop.mark);
                };
                var specWatcher = $scope.$watch('prop', function(spec) {

                    // Only call Pills.update, which will trigger Spec.spec to update if it's not a preview.

                }, true); //, true /* watch equality rather than reference */);


                $scope.$on('$destroy', function() {
                    // Clean up watcher
                    specWatcher();
                });
            }
        }
    });
