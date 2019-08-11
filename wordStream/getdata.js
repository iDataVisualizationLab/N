
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
// var time =1533746739000;
// var time =1532525019000;
// var time = 1530428400000;
// var time = 1529514032000;
var time = 1528213179000;
(async function loop() {
    for (let i = 0; i < 200; i++) {
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

        await delay(Math.random() * 3000+2000);
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
//htt = htt.filter(d=> d!="riskmanagement"&&d!="RiskManagement"&&d!="Riskmanagement");
JSON.stringify(htt);
///
var ht = document.querySelectorAll(".js-tweet-text-container");
let htg = [];
ht.forEach(d=>htg.push(d.querySelectorAll(".twitter-hashtag")));
htt = htg.map(d=> { var tt= [];
    d.forEach(e=>tt.push(e.querySelector("b").textContent));
    return tt;});
htt=htt.filter(d=>d.length!=0);




    /// scroll Twitt

// from:twdb since:2012-01-01 until:2015-01-01
var username = 'twdb';
var timestart = '2012-01-01';
var timeend = '2016-12-31';
var queryhtml = 'https://twitter.com/search?f=tweets&q=from%3A'+username+'%20since%3A'+timestart+'%20until%3A'+timeend+'&src=typd';

// auto scroll
    var scolling = setInterval(function(){
        if (document.documentElement.scrollTop === document.documentElement.scrollHeight) {
            clearInterval(scolling);
            console.log('done scroll');
        }
        else
            window.scrollBy(0,1000);
        }, 2000);


//twitter
var ht = document.querySelectorAll(".js-stream-item");
var datacollection = [];
ht.forEach(d=>{
    var time = d.querySelector('._timestamp.js-short-timestamp').getAttribute('data-time');
    // (new Date(time.getAttribute('data-time') * 1000)).toLocaleString()
    var datatweet = d.querySelector('.tweet')['dataset'];

    var body = d.querySelector('.js-tweet-text-container');
    var bodyContent = body.innerText;
    var htg = d.querySelectorAll(".twitter-hashtag");
    var htgtext = [];
    htg.forEach(e=>htgtext.push(e.querySelector("b").textContent));
    var action = d.querySelector(".ProfileTweet-actionList");
    var replynum = action.querySelector(".ProfileTweet-action--reply").querySelector('.ProfileTweet-actionCountForPresentation').textContent;
    replynum=~~likenum;
    var Retweet = action.querySelector(".ProfileTweet-action--retweet").querySelector('.ProfileTweet-actionCountForPresentation').textContent;
    Retweet=~~Retweet;
    var likenum = action.querySelector(".ProfileTweet-action--favorite").querySelector('.ProfileTweet-actionCountForPresentation').textContent;
    likenum=~~likenum;

    var imgcontain = null;
    var imglist = [];
    try {imgcontain = (d.querySelector('.AdaptiveMedia-container')||d.querySelector('.js-media-container').querySelector('iframe').contentDocument);
        if (imgcontain!=null) {
            var img = imgcontain.querySelectorAll('img');
            img.forEach(im => imglist.push(im.src));
            if (imglist.length == 0)
                imglist.push(d.querySelector('.js-media-container').querySelector('iframe').contentDocument.querySelector('img').src);
        }
    }catch{};
    var content ={time:time,
        body:bodyContent,
        hashtag:htgtext,
        action: {
            reply:replynum,
            retweet: Retweet,
            like:likenum,
        },
        link: datatweet.permalinkPath,
        img: imglist,
        mentions: datatweet.mentions,
    };
    datacollection.push(content);
    });
JSON.stringify(datacollection);

//imdb
var datacollection = [];
var ht = document.querySelectorAll(".lister-item");
ht.forEach(d=>{
    var time = d.querySelector('.lister-item-year').innerText.replace(/\(|\)/g,'');
    time = ~~time;
    // (new Date(time.getAttribute('data-time') * 1000)).toLocaleString()
    //var datatweet = d.querySelector('.tweet')['dataset'];
    var title = d.querySelector(".lister-item-header").querySelector('a').text;
    console.log(title);
    var bodyContent = d.innerHTML;
    var actors = d.querySelector("p[class='']").innerText;
    var objectactor = {};
    if (actors!=="") {
        actors=actors.trim().split(" | ");
        actors.forEach(a => {
            var sa = a.split(': ');
            objectactor[sa[0]] = sa[1].split(', ');
        });
    }
    var metascore = 0;
    try {
        metascore = ~~d.querySelector('.metascore').textContent.trim();
    }catch{}
    var htg = d.querySelector(".genre");
    if (htg==null)
        htg =["UNKNOW"];
    else
        htg = htg.innerText.trim().split(", ");
    var story = d.querySelectorAll(".text-muted")[2].textContent.trim();
    //vote
    var vote = d.querySelector("meta[itemprop=ratingCount]").content;
    vote=~~vote;
    var rate = d.querySelector("meta[itemprop=ratingValue]").content;
    rate=parseFloat(rate);
    var bestRating = d.querySelector("meta[itemprop=bestRating]").content;
    bestRating=parseFloat(bestRating);


    var imglist = d.querySelector(".lister-item-image").querySelector("img").src;

    var content ={time:time,
        title: title,
        body:bodyContent,
        story:story,
        genre:htg,
        action: {
            vote:vote,
            rate: rate,
            bestRating:bestRating,
        },
        member: objectactor,
        link: d.querySelector('.lister-item-header>a').href,
        img: imglist
    };
    datacollection.push(content);
});
JSON.stringify(datacollection);

//usgs.gov
//https://www.usgs.gov/centers/tx-water/publications?logstash-usgs-pw%3Apalladium_root_publication_type=Report&logstash-usgs-pw%3Apalladium_root_topics=&logstash-usgs-pw%3Apalladium_root_publication_year_date=&sort=&page=0

var data = [];
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));
var source = "usgs";
var url = "https://www.usgs.gov/centers/tx-water/publications?logstash-usgs-pw%3Apalladium_root_publication_type=Report&logstash-usgs-pw%3Apalladium_root_topics=&logstash-usgs-pw%3Apalladium_root_publication_year_date=&sort=&page=0";
(async function loop() {
    var nextnotnull = true;
    do{
        //let url = "https://www.usgs.gov/centers/tx-water/publications?logstash-usgs-pw%3Apalladium_root_publication_type=Report&logstash-usgs-pw%3Apalladium_root_topics=&logstash-usgs-pw%3Apalladium_root_publication_year_date=&sort=&page=0";
        let html = document;
        let r = html.querySelector(".view-content").querySelectorAll(".views-row");
        r.forEach( d => {
            var content = d.querySelector(".field-content>div").outerText.split("\n");
            var item = {};
                item.source = source;
                item.title = d.querySelector(".list-title").textContent;
                item.abstract = d.querySelector(".field-content>div>p").textContent;
                item.link = d.querySelector(".field-content>div>a").href;
                item.urlToImage = d.querySelector("img").src;
                item.author = content[4];

                item.time = ~~content[0].split(": ")[1];
                //console.log(item.time);
                data.push(item);
        });
        nextnotnull = html.querySelector("li.next")!=null;
        html.querySelector("li.next>a").click();
        await delay(Math.random() * 3000+3000);
    } while (nextnotnull)
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




// GAB.com
var data =[];
var no_more = false;
var topic = 'Terrorist';
var baseurl = 'https://gab.com/api/hash/'+topic+'?sort=date';
var timeString ='0';
var fetchNow = function(d) {
    fetch(baseurl+'&before='+d)
    .then(function(response) {
            return response.json();
    }).then(function(myJson) {
        no_more = myJson['no-more'];
        myJson.data.forEach(d=>data.push(d));
        if(no_more) {
            resultFound = true;
            console.log('done: data.length = '+data.length);
            JSON.stringify(data);
        }
        else {
            if (myJson.data.length)
                fetchNow(myJson.data[myJson.data.length-1].published_at.replace(/:/g,'%3A').replace('+','%2B'));
            else
                fetchNow(myJson.data[myJson.data.length-1].published_at.replace(/:/g,'%3A').replace('+','%2B'));
        }
    });
};

fetchNow('0');