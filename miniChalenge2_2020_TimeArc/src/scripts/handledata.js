let dataS = {
    Variables:[],
    Countries:[],
    YearsData:[],
    CountriesData:{}
};

function cleanjs(data,index) {
    dataS.Countries = d3.keys(data[0]).slice();
    data.forEach((t,i)=>{
        if (!dataS.YearsData[i])
            dataS.YearsData[i] = {};
        dataS.YearsData[i]['s'+index] = d3.values(t);
        dataS.Countries.forEach(co=> {
            if (!dataS.CountriesData[co])
                dataS.CountriesData[co]=[];
            if (!dataS.CountriesData[co][i])
                dataS.CountriesData[co][i]={};
                dataS.CountriesData[co][i]['s' + index] = t[co];
            }
        );
    });
    return data;
}
let list = ['Construction','Government','Leisure','Nonfarm','Transportation'];
list.forEach(async(ln,i)=>{
    dataS.Variables.push(ln);
    await d3.json("src/data/raw/"+ln+"Standardized.json").then(d=>cleanjs(d,i))}
);