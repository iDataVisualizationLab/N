'use strict';
angular.module('voyager2')
    .directive('guideMenu', function(){
        //template: "<svg id =\'bi-plot\' width=\'100%\' class=\"\"></svg>",
        return {
            templateUrl: 'components/guidemenu/guideMenu.html',
            restrict: 'E',
            scope: {
                spec: '<',
                supportAny: '<',
            },
            replace: true,
            controller: function($scope, util, vl, Config, Dataset, Logger, Pills) {
                $scope.marks = ['point', 'tick', 'bar', 'line', 'area', 'text','boxplot'];
                $scope.markChange =function (){};
                $scope.props = ['PCA1', 'skewness', 'outlier', 'PCA2'];
                $scope.typeChange =function (){};
                $scope.markChange =function (){};
                $scope.$on('$destroy', function() {
                });
            }
        }
    });
