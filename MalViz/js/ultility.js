function make2Darray(rows, cols) {
    var arr = new Array(rows);
    for (var i = 0; i < rows; i++) {
        arr[i] = new Array(cols);
        for (j = 0; j < cols; j++) {
            arr[i][j] = {x: j, y: i, z: []};
        }
    }
    return arr;
}

let allDomainsObj = {};
let allDomains = [];
let domainResult;

function ProcessDataV2(originalData, domainInfo, domain) {
    var processNameList = d3.nest().key(d => d.Process_Name)
        .entries(originalData)
        .map(d => d.key.toLowerCase());
    // .filter(d => d.toLowerCase() !== "procmon.exe");

    domainResult = [];
    var globalData = [];
    var domainFormat = /[a-zA-Z0-9][a-zA-Z0-9-]{1,61}[a-zA-Z0-9](?:\.[a-zA-Z]{2,})+/;
    var domainFormat2 = /\b((?=[a-z0-9-]{1,63}\.)(xn--)?[a-z0-9]+(-[a-z0-9]+)*\.)+[a-z]{2,63}\b/;
    var previoustime;
    var previoustep = 0;
    var count = 0;
    originalData.forEach(function (row, index) {
        //Preprocess Data
        var time = row.Timestamp.split(':');
        var hour = +time[0];
        var minute = +time[1];
        var second = +time[2].split('.')[0];
        var milisecond = +time[2].split('.')[1].split(' ')[0].slice(0, 5);
        var currentTimeStamp = (hour * 3600 + minute * 60 + second) * 100000 + milisecond;

        if (index == 0) {
            previoustime = currentTimeStamp;
        }
        var timediff = currentTimeStamp - previoustime;
        var currentStep = previoustep + timediff;

        //Assign value
        var obj = new Object();
        obj.Timestamp = row.Timestamp;
        obj.Process_Name = row.Process_Name.toLowerCase();
        obj.Path = row.Path.toLowerCase();
        obj.PID = row.PID;
        obj.Operation = row.Operation;
        obj.Detail = row.Detail;
        obj.currenttimestamp = currentTimeStamp;
        obj.Step = currentStep;
        obj.Process = getOperationType(row.Operation);

        for (var i = 0; i < processNameList.length; i++) {
            if (row.Path.toLowerCase().endsWith("\\" + processNameList[i])) {
                obj.targetProcessName = row.Path.replace(/^.*[\\\/]/, '').toLowerCase();
            }
        }

        if (obj.Process == 'Network') {

            var getdomain = row.Path.slice(row.Path.indexOf('->') + 3).split(":")[0];

            if (getdomain.match(domainFormat2)) {
                // console.log(getdomain, obj.Operation);
                if (getdomain.split('.').length > 4) {
                    getdomain = getdomain.slice(getdomain.indexOf('.') + 1);
                    obj.Domain = getdomain;
                } else {
                    obj.Domain = getdomain;
                }

                if (!allDomainsObj[getdomain]) {
                    allDomainsObj[getdomain] = true;
                    allDomains.push(getdomain)
                }

                if (domain){
                    domain.forEach(function (dm_value) {
                        if (dm_value.domain == obj.Domain) {
                            // console.log("found")
                            var obj_child = {}
                            obj_child.count = +dm_value.count;
                            obj_child.harmless = +dm_value.harmless;
                            obj_child.malicious = +dm_value.malicious;
                            obj_child.suspicious = +dm_value.suspicious;
                            obj_child.undetected = +dm_value.undetected;
                            obj.VirusTotal = obj_child;

                            if (obj.VirusTotal.malicious > 0){
                                console.log("malicious")
                            }
                        }
                    })
                }

            }
        }
        if (row.Path.slice(-3).toLowerCase() == 'dll') {
            obj.library = row.Path.replace(/^.*[\\\/]/, '')
        }
        //Push value
        globalData.push(obj);

        //After pushing data update previous time
        previoustime = currentTimeStamp;
        previoustep = currentStep;
    });

    // Check APIs

    // allDomains.forEach(domain => {
    //     (function () {
    //         fetch('https://www.virustotal.com/ui/search?query=' + domain)
    //             .then(res => res.json()).then(virusCheck => {
    //                 fetch('http://api.ipstack.com/'+domain+'?access_key=4a1b242e5a1fb231469dfb271bac2f3a&format=1')
    //                     .then(res => res.json()).then(urlLocation =>{
    //                         let obj = {
    //                             virusCheck: virusCheck,
    //                             urlLocation: urlLocation,
    //                             domain: domain
    //                         }
    //                     console.log('still awesome', obj);
    //                     domainResult.push(obj)
    //                 })
    //         })
    //     })();
    // });
    // console.log(domainResult)

    // console.log(domainInfo);

    // allDomains.forEach(domain => {
    //     let thisRes = domainRes.data[0].attributes.last_analysis_stats;
    //     console.log(thisRes);
    //     if (thisRes.malicious || thisRes.suspicious || thisRes.undetected){
    //
    //     }
    // })

    // with API
    // return [globalData, domainResult];

    return [globalData, domainInfo];
}

function UpdateProcessNameWithChild(processLst, links) {
    processLst.forEach(function (proc, parentIndex) {
        proc.selfCalls = [];
        proc.childs = [];
        proc.childInfo = {};
        links.forEach(function (link) {
            if ((proc.key === link.Process_Name) && (link.Process === "ProcessThread")) {    // if key = parent
                let index = getProcessNameIndex(processLst, link.targetProcessName);
                // index = stt child in processLst
                if (index != parentIndex) {
                    // if chld != parent

                    //Check for loop insertion
                    if (processLst[index].hasOwnProperty('childs')) {
                        if (!processLst[index].childs.includes(parentIndex)) {
                            if (!proc.childs.includes(index)) {
                                proc.childs.push(index);
                            }
                            if (!proc.childInfo[link.targetProcessName]) {    // if havent met this process
                                proc.childInfo[link.targetProcessName] = [];
                                proc.childInfo[link.targetProcessName].push({
                                    event: link.Operation,
                                    step: link.Step
                                })
                            } else {
                                proc.childInfo[link.targetProcessName].push({
                                    event: link.Operation,
                                    step: link.Step
                                })
                            }
                        }
                    } else {
                        if (!proc.childs.includes(index)) {
                            proc.childs.push(index);
                        }
                        if (!proc.childInfo[link.targetProcessName]) {
                            proc.childInfo[link.targetProcessName] = [];
                            proc.childInfo[link.targetProcessName].push({
                                event: link.Operation,
                                step: link.Step
                            })
                        } else {
                            proc.childInfo[link.targetProcessName].push({
                                event: link.Operation,
                                step: link.Step
                            })
                        }
                    }
                }
                else {
                    proc.selfCalls.push({
                        event: link.Operation,
                        step: link.Step
                    });
                }
            }
        });
    });
    return processLst;
}


function getProcessNameIndex(processlst, key) {
    let index;
    processlst.forEach(function (d, i) {
        if (d.key === key) {
            index = i;
        }
    });
    return index;
}


Array.prototype.groupBy = function (props) {
    var arr = this;
    var partialResult = {};

    arr.forEach(el => {

        var grpObj = {};

        props.forEach(prop => {
            grpObj[prop] = el[prop]
        });

        var key = JSON.stringify(grpObj);

        if (!partialResult[key]) partialResult[key] = [];

        partialResult[key].push(el);

    });

    var finalResult = Object.keys(partialResult).map(key => {
        var keyObj = JSON.parse(key);
        keyObj.values = partialResult[key];
        return keyObj;
    })

    return finalResult;
}