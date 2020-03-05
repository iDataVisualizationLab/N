// Read data
let width = 500;
let height = 500;

// UMAP opt
let umap_opt = {
}
init();
d3.select('#message').text('load raw data');
d3.text("./data/transcriptome.csv").then(function(text) {
    const data = text.split('\n').map(t=>t.split(',').map(d=>+d));

    // divide data
    const data_train = data.slice(0,data.length/2);
    const data_test = data.slice(data.length/2,data.length);

    d3.select('#message').text('load color data');
    d3.text("./data/transcriptome_color.txt").then(function(colortext) {
        const color = colortext.split('\n');
        // divide data color
        const color_train = color.slice(0,color.length/2);
        const color_test = color.slice(color.length/2,color.length);

        d3.select('#message').text('Calculalte UMAP');
        let train_time = performance.now();
        // UMAP calculation
        const umap = new UMAP(umap_opt);
        const embedding = umap.fit(data_train);
        train_time = performance.now()-train_time;
        // draw train data
        var context_train = train_data_canvas.getContext('2d');
        draw(embedding,color_train,context_train);

        // transformed
        let test_time = performance.now();
        const transformed = umap.transform(data_test);
        test_time = performance.now()-test_time;
        // draw test data
        var context_test = test_data_canvas.getContext('2d');
        draw(transformed,color_test,context_test);

        d3.select('#message').text(`training time: ${train_time} ---- testing time: ${test_time}`);
        d3.select('#progress').classed('hide',true);

    })
});
function init(){
    d3.select('#train_data_canvas').attr('width',width).attr('height',height);
    d3.select('#test_data_canvas').attr('width',width).attr('height',height);
}
function draw(data,color,context){
    var xrange  = d3.extent(data,d=>d[0]);
    var yrange  = d3.extent(data,d=>d[1]);
    var range = [Math.min(xrange[0],yrange[0]),Math.max(xrange[1],yrange[1])]
    var xScale = d3.scaleLinear()
        .domain(range)
        .range([0, width]);
    var yScale = d3.scaleLinear()
        .domain(range)
        .range([0, width]);
    context.clearRect(0, 0, width, height);
    data.forEach((d,i)=>{
        drawPoint(d,2,color[i]);
    })

    function drawPoint(point, r, color) {
        var cx = xScale(point[0]);
        var cy = yScale(point[1]);
        context.fillStyle = color;
        // NOTE; each point needs to be drawn as its own path
        // as every point needs its own stroke. you can get an insane
        // speed up if the path is closed after all the points have been drawn
        // and don't mind points not having a stroke
        context.beginPath();
        context.arc(cx, cy, r, 0, 2 * Math.PI);
        context.closePath();
        context.fill();
    }
}