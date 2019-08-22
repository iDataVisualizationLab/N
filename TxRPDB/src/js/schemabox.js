let Schemabox = function() {
    let graphicopt = {
            margin: {top: 20, right: 0, bottom: 0, left: 0},
            width: 250,
            height: 50,
            scalezoom: 10,
            widthView: function(){return this.width*this.scalezoom},
            heightView: function(){return this.height*this.scalezoom},
            widthG: function(){return this.widthView()-this.margin.left-this.margin.right},
            heightG: function(){return this.heightView()-this.margin.top-this.margin.bottom},
        },
        svg,g,
    data =[];
    let schemabox ={};

    function draw(dataset){
        var x = d3.scaleBand()
            .range([0, graphicopt.widthG()])
            .padding(0.1);
        var y = d3.scaleLinear()
            .range([graphicopt.heightG(), 0]);

        var xAxis = d3.axisBottom(x).tickSize([]).tickPadding(10);
        // var yAxis = d3.axisLeft(y).tickFormat(formatPercent);


        x.domain(dataset.map( d => { return d.key; }));
        // y.domain([0, d3.max(dataset,  d => { return d.value; })]);
        // y.domain(d3.extent(dataset,d=>d.value));
        y.domain(dataset.range);

        g.append("g")
            .attr("class", "x axis")
            .attr("transform", "translate(0," + graphicopt.heightG() + ")")
            .call(xAxis);

        let bar_g = g.selectAll(".bar")
            .data(dataset,d=>d.key);

        bar_g.exit().remove();

        let bar_g_n = bar_g.enter()
            .append("g")
            .attr("class", "bar")
            .attr('transform',d=>`translate(${x(d.key)},${graphicopt.heightG()})`);
        bar_g_n.append("rect").attr("width", x.bandwidth()).attr("height", 0);
        bar_g_n.append("text").attr("class", "label")
            .style('text-anchor','middle')
            .attr("x", ( d => { return (x.bandwidth() / 2); }));

        bar_g = bar_g_n.merge(bar_g)
            .style("display", d => { return d.value === null ? "none" : null; })
            .style("fill",  d => {
                return graphicopt.barcolor;
            })
            .attr('transform',d=>`translate(${x(d.key)},0)`);
        bar_g.select('rect')
            .transition()
            .duration(500)
            .attr("y",  d => { return y(d.value); })
            .attr("width", x.bandwidth())
            .attr("height",  d => { return graphicopt.heightG() - y(d.value); });
        bar_g.select('.label')
            .transition()
            .duration(500)
            .attr("x", ( d => { return (x.bandwidth() / 2); }))
            .attr("y",  d => { return y(d.value) + .1; })
            .text( d => d.value )
            .attr("dy", "-.7em")
        ;
    }

    schemabox.init = function () {
        svg.attrs({
            width: graphicopt.width,
            height: graphicopt.height,
            // overflow: "visible",

        });
        // svg.style('visibility','hidden');
        svg .attr("width", graphicopt.widthG())
            .attr("height", graphicopt.heightG());
        g = svg.append("g")
            .attr('class','pannel')
            .attr('transform',`translate(${graphicopt.margin.left},${graphicopt.margin.top})`);

        return schemabox;
    };
    schemabox.data = function (_) {
        if (arguments.length){
            data=_;
            draw(data);
            return schemabox;
        }else
            return data;
    };
    schemabox.graphicopt = function (_) {
        //Put all of the options into a variable called graphicopt
        if (arguments.length) {
            for (let i in _) {
                if ('undefined' !== typeof _[i]) {
                    graphicopt[i] = _[i];
                }
            }
            return schemabox;
        }else {
            return graphicopt;
        }

    };
    schemabox.svg = function (_) {
        return arguments.length ? (svg = _, schemabox) : svg;
    };
    return schemabox;
}