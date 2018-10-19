
var data = [];
var checkh;
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));
var source = "cnbc";
(async function loop() {
    for (let i = 36; i > 0; i--) {
        let url = "https://www.cnbc.com/finance/?page="+i;
        fetch(url).then(function(webresponse) {
            if(webresponse.ok) {
                webresponse.text().then(function (response) {
                    let html = document.createElement('html');
                    html.innerHTML = response;
                    let r = html.querySelector("#pipeline_assetlist_0").querySelectorAll("li");
                    checkh = r;
                    return r;
                }).then(async function (r) {

                    r.forEach(async d => {
                        var item = {};
                        if (!d.id) {
                            item.source = source;
                            item.title = d.querySelector("img").title;
                            item.description = d.querySelector(".desc").textContent;
                            item.link = d.querySelector("a").href;
                            item.urlToImage = d.querySelector("meta[itemprop='image']").content;
                            item.author = d.querySelector("meta[itemprop='author']").content;
                            await delay(Math.random() * 20000+10000);
                            await fetch(item.link).then(function (webresponse1) {
                                if (webresponse1.ok) {
                                    console.log(item.link);
                                    webresponse1.text().then(function (response1) {
                                        var html1 = document.createElement('html');
                                        html1.innerHTML = response1;
                                        item.time = (html1.querySelector(".last-pub-date")||html1.querySelector(".datestamp")).dateTime;
                                        var r1 = html1.querySelector("#article_body");
                                        try {
                                            r1.querySelectorAll(".group-container").forEach(function (gc) {
                                                gc.querySelector(".group").querySelectorAll("div").forEach(ad => ad.remove())
                                            });
                                        }catch(e){console.log("No ads found");}
                                        item.body = r1.innerHTML;
                                        // var position = html1.querySelector(".social-reporter").querySelector(".title").textContent;
                                        // item.position = position;
                                    });
                                }
                            });

                            //console.log(item.time);
                            data.push(item);
                        }
                    });

                });
            }
        });


        await delay(Math.random() * 30000+10000);
    }
    // var a = document.createElement("a");
    // var dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(data));
    // a.href = dataStr;
    // a.download = 'data.json';
    // a.click();
    console.log(JSON.stringify(data));
})();


data.forEach( d =>{
    let html = document.createElement('html');
    html.innerHTML = d.body;
    d.body = html.innerText.replace(/\s+/g,' ').replace("\t", '').replace("\n", '');
});
//
// var a = document.createElement("a");
// var dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(data));
// a.href = dataStr;
// a.download = 'dataTranfered.json';
// a.click();


///reuters
https://www.reuters.com/assets/jsonWireNews?startTime=1511107161000

    StandardArticleBody_container
var data = [];
var checkh;
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));
var source = "reuters";
// var time = 1539631486481;
// var time = 1539356002000;
// var time =1538423562000;
// var time =1537363447000;
var time =1533746739000;
(async function loop() {
    for (let i = 0; i < 300; i++) {
        let url = "https://www.reuters.com/assets/jsonWireNews?endTime="+time;
        fetch(url).then(function(webresponse) {
            if(webresponse.ok) {
                webresponse.json().then(function (response) {
                    var res = response.headlines;
                    console.log(res);
                    res.forEach(r=> {
                        var item = {
                            id : r.id,
                            source: source,
                            title: r.headline,
                            description: "",
                            time: r.dateMillis,
                            url: "https://www.reuters.com"+r.url,
                            urlToImage: r.mainPicUrl,
                        }
                        data.push(item);
                        time = r.dateMillis;
                    })

                })
            }
        });

        await delay(Math.random() * 10000+5000);
    }
    // var a = document.createElement("a");
    // var dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(data));
    // a.href = dataStr;
    // a.download = 'data.json';
    // a.click();
    console.log(JSON.stringify(data));
})();



fetch(url).then(function(webresponse) {
    if(webresponse.ok) {
        webresponse.text().then(function (response) {
            let html = document.createElement('html');
            html.innerHTML = response;
            let r = html.querySelector(".news-headline-list ").querySelectorAll(".story");
            r.forEach(d=>{
                item ={};
                item.time = d.querySelector("time").querySelector("span").textContent;
                item.source = source;
                item.title = d.querySelector(".story-title").textContent;
                item.description = d.querySelector(".story-content").querySelector("p").textContent;
                item.link = d.querySelector(".story-content").querySelector("a").href;
                item.urlToImage = d.querySelector("img").attributes["org-src"].value;
                console.log(item);
                //item.author = d.querySelector("meta[itemprop='author']").content;
            });
            console.log(r);})}})



/// twitter
let ht = document.querySelectorAll(".twitter-hashtag");
var htt = [];
ht.forEach(d=>htt.push(d.querySelector("b").textContent));
htt = htt.filter(d=> d!="riskmanagement"&&d!="RiskManagement"&&d!="Riskmanagement");
JSON.stringify(htt);
///
var     ht = document.querySelectorAll(".js-tweet-text-container");
let htg = [];
ht.forEach(d=>htg.push(d.querySelectorAll(".twitter-hashtag")));
htt = htg.map(d=> { var tt= [];
    d.forEach(e=>tt.push(e.querySelector("b").textContent));
    return tt;});
htt=htt.filter(d=>d.length!=0);