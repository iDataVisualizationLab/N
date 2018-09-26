'use strict';
angular.module('voyager2')
    .directive('guideMenu', function(){
        //template: "<svg id =\'bi-plot\' width=\'100%\' class=\"\"></svg>",
        return {
            templateUrl: 'components/guidemenu/guideMenu.html',
            restrict: 'E',
            scope: {
                prop: '=',
                initialLimit: '<',
                priority:'<',
            },
            replace: true,
            controller: function($scope, PCAplot) {
                $scope.limit = $scope.initialLimit || 4;
                $scope.marks = ['tick', 'bar','area','boxplot'];
                $scope.props = ['PCA1', 'skewness', 'outlier', 'PCA2'];
                $scope.typeChange =function (){
                    PCAplot.updateSpec($scope.prop);
                };
                $scope.previewSlider = function (index){
                    $scope.prop.pos =index;
                    //console.log($scope.prop.pos);
                };
                $scope.markChange =function (){
                    PCAplot.updateSpec($scope.prop);
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
