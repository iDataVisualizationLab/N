/// twitter

var content = document.querySelectorAll("li[data-item-type='tweet']");

var data = [];
content.forEach(d=>{
    var item = {};
    item.time = d.querySelector("._timestamp").dataset.timeMs;
    var text = d.querySelector(".js-tweet-text-container");
    item.plainText = text.textContent;
    item.hashTag = [];
    text.querySelectorAll(".twitter-hashtag > b").forEach(t=>item.hashTag.push(t.textContent.toLowerCase()));
    data.push(item);
});
JSON.stringify(data);