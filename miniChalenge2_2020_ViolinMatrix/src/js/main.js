$(document).ready(function(){
    init();
    readFile().then(handleDate).then(update);
});

function init(){

}
function readFile(){
    return d3.csv(`src/data/${filepath}.csv`)
}
function handleDate(data){

}
