'use strict'
angular.module('pcagnosticsviz')
    .component('biPlot', {
            //template: "<svg id =\'bi-plot\' width=\'100%\' class=\"\"></svg>",
        templateUrl: 'components/d3-biplot/bi-plot.html',
        controller: function ($scope) {
                d3.selectAll('.background-biplot')
                    .style('fill','#ffffff')
                    .attr('width',$('.biplot').width())
                    .attr('height',$('.biplot').width());
        }});
