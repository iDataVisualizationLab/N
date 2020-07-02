const music = document.getElementById("song");
const LEDNUMBER = 12;
const listLED=["http://192.168.0.19"];
let stop = false;
let script = [
    {
        id:0,
        LED: {command:clearcolor},
        delay: 0,
    },{
        id:0,
        LED: {command:singlecolor,position:0,color:"#0087dd"},
        delay: 400,
    },
    {
        id:0,
        LED: {command:singlecolor,position:2,color:"#0087dd"},
        delay: 400,
    },{
        id:0,
        LED: {command:singlecolor,position:4,color:"#0087dd"},
        delay: 400,
    },
    {
        id:0,
        LED: {command:singlecolor,position:6,color:"#0087dd"},
        delay: 400,
    },{
        id:0,
        LED: {command:singlecolor,position:8,color:"#0087dd"},
        delay: 400,
    },
    {
        id:0,
        LED: {command:clearcolor},
        delay: 200,
    },
    {
        id:0,
        LED: {command:groupcolor,start:0,end:11,color:"#ffffff"},
        delay: 400,
    },
    {
        id:0,
        LED: {command:clearcolor},
        delay: 200,
    },
    {
        id:0,
        LED: {command:groupcolor,start:0,end:11,color:"#ffffff"},
        delay: 400,
    },{
        id:0,
        LED: {command:singlecolor,position:0,color:"#dd008c"},
        delay: 400,
    },
    {
        id:0,
        LED: {command:singlecolor,position:2,color:"#dd008c"},
        delay: 400,
    },{
        id:0,
        LED: {command:singlecolor,position:4,color:"#dd008c"},
        delay: 400,
    },
    {
        id:0,
        LED: {command:singlecolor,position:6,color:"#dd008c"},
        delay: 400,
    },{
        id:0,
        LED: {command:singlecolor,position:8,color:"#dd008c"},
        delay: 400,
    }, {
        id:0,
        LED: {command:clearcolor},
        delay: 500,
    },
    {
        id:0,
        LED: {command:groupcolor,start:0,end:11,color:"#ffe861"},
        delay: 500,
    },
    {
        id:0,
        LED: {command:groupcolor,start:0,end:11,color:"#ffc729"},
        delay: 500,
    },
    {
        id:0,
        LED: {command:groupcolor,start:0,end:11,color:"#ff9a25"},
        delay: 500,
    },
    {
        id:0,
        LED: {command:groupcolor,start:0,end:11,color:"#ff5821"},
        delay: 500,
    },
    {
        id:0,
        LED: {command:groupcolor,start:0,end:11,color:"#ff7b9f"},
        delay: 500,
    },{
        id:0,
        LED: {command:groupcolor,start:0,end:11,color:"#7c72ff"},
        delay: 500,
    },{
        id:0,
        LED: {command:clearcolor},
        delay: 500,
    }
];
function circle(ip,colorArray,){

}
function singlecolor(d){
    const color = d3.color(d.color);
    const request = new FormData();
    request.append('command','SETCOLOR');
    request.append('position',d.position);
    request.append('r',color.r);
    request.append('g',color.g);
    request.append('b',color.b);
    return request;
}
function groupcolor(d){
    const color = d3.color(d.color);
    const request = new FormData();
    request.append('command','SETCOLORS');
    request.append('start',d.start);
    request.append('end',d.end);
    request.append('r',color.r);
    request.append('g',color.g);
    request.append('b',color.b);
    return request;
}
function clearcolor(){
    const request = new FormData();
    request.append('command','clear');
    return request;
}
function play_m(){
    stop = false;
    music.play();
    playLED(0)
}
function stop_m(){
    stop = true;
    music.pause();
    music.currentTime = 0;
}

function playLED(index) {
    return new Promise(function(resolve, reject){
        if (!stop){
            if (script.length>index) {
                setTimeout(function () {
                    const request = script[index].LED.command(script[index].LED);
                    fetch(`${listLED[script[index].id]}/`,
                        {
                            method: 'POST',
                            body: request,
                        });
                    index++;
                    resolve(playLED(index));
                }, script[index].delay);
            }else{
                stop_m();
                resolve('done');
            }
        }else{
            reject();
        }
    })
}
