ss.std_median = function (data,func) {
    func = func||((d)=>d);
    let median = ss.median(data,func);
    let std = 0;
    data.forEach(d=>{
        std += (func(d)-median)*(func(d)-median);
    });
    std = Math.sqrt(std/(data.length-1));
    return std;
};