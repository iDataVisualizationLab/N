'use strict';

angular.module('pcagnosticsviz')
  .directive('cqlQueryEditor', function(Spec) {
    return {
      templateUrl: 'components/cqlQueryEditor/cqlQueryEditor.html',
      restrict: 'E',
      scope: {},
      link: function postLink(scope /*, element, attrs*/) {
        scope.Spec = Spec;
      }
    };
  });
