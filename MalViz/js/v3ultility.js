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

function getObjectIndex(obj, property, value) {
    var index;
    obj.forEach(function (d, i) {
        if (d[property] == value) index = i;
    })
    return index;
}

function convertToMilis(row) {
    var time = row.Timestamp.split(':');
    var hour = +time[0];
    var minute = +time[1];
    var second = +time[2].split('.')[0];
    var milisecond = +time[2].split('.')[1].split(' ')[0].slice(0, 5);
    var currentTimeStamp = (hour * 3600 + minute * 60 + second) * 100000 + milisecond;
    return currentTimeStamp;
}

function ProcessDataV2(originalData, domain) {
    var medium = [];
    // originalData.forEach(function (row) {
    //     if ((getProcessName(row.Operation) !== "Profiling") &&
    //         (row.Process_Name.toLowerCase() !== "procmon.exe") &&
    //         (row.Process_Name.toLowerCase() !== "procmon64.exe") &&
    //         (row.Process_Name.toLowerCase() !== "procexp.exe") &&
    //         (row.Process_Name.toLowerCase() !== "procexp64.exe")) {
    //         medium.push(row);
    //     }
    // });
    //
    var processNameList = d3.nest().key(d => d.Process_Name).entries(originalData).map(d => d.key).filter(d => d.toLowerCase() !== "procmon.exe");

    var globalData = [];
    var domainFormat = /[a-zA-Z0-9][a-zA-Z0-9-]{1,61}[a-zA-Z0-9](?:\.[a-zA-Z]{2,})+/;
    var previoustime;
    var previoustep = 0;
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
        obj.Process_Name = row.Process_Name;
        obj.Path = row.Path;
        obj.PID = row.PID;
        obj.Operation = row.Operation;
        obj.Detail = row.Detail;
        obj.currenttimestamp = currentTimeStamp;
        obj.Step = currentStep;
        obj.Process = getProcessName(row.Operation);

        for (var i = 0; i < processNameList.length; i++) {
            if (row.Path.endsWith("\\" + processNameList[i])) {
                obj.targetProcessName = row.Path.replace(/^.*[\\\/]/, '');
            }
        }

        if (row.Operation == 'UDP Send') {

            var getdomain = row.Path.slice(row.Path.indexOf('->') + 3, -5);

            if (getdomain.match(domainFormat)) {
                if (getdomain.split('.').length > 2) {
                    getdomain = getdomain.slice(getdomain.indexOf('.') + 1);
                    obj.Domain = getdomain;
                } else {
                    obj.Domain = getdomain;
                }
                domain.forEach(function (dm_value) {
                    if (dm_value.domain == obj.Domain) {

                        var obj_child = {}
                        obj_child.count = +dm_value.count;
                        obj_child.harmless = +dm_value.harmless;
                        obj_child.malicious = +dm_value.malicious;
                        obj_child.suspicious = +dm_value.suspicious;
                        obj_child.undetected = +dm_value.undetected;
                        obj.VirusTotal = obj_child;
                    }
                })
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
    return globalData;
}

function UpdateProcessNameWithChild(processLst, links) {
    processLst.forEach(function (proc, parentIndex) {
        proc.selfCalls = [];
        proc.childs = [];
        proc.childInfo = {};
        links.forEach(function (link) {
            if (proc.key == link.Process_Name) {    // if key = parent
                let index = getProcessNameIndex(processLst, link.targetProcessName);
                // index = stt child in processLst

                if (index != parentIndex) {
                    // if chld != parent

                    //Check for loop insertion
                    if (processLst[index].hasOwnProperty('childs')) {
                        if (!processLst[index].childs.includes(parentIndex)) {
                            if (!proc.childs.includes(index)){
                                proc.childs.push(index);
                            }
                            if (!proc.childInfo[link.targetProcessName]){    // if havent met this process
                                proc.childInfo[link.targetProcessName] = [];
                                proc.childInfo[link.targetProcessName].push({
                                    event: link.Operation,
                                    step: link.Step
                                })
                            } else{
                                proc.childInfo[link.targetProcessName].push({
                                    event: link.Operation,
                                    step: link.Step
                                })
                            }
                        }
                    } else {
                        if (!proc.childs.includes(index)){
                            proc.childs.push(index);
                        }
                        if (!proc.childInfo[link.targetProcessName]){
                            proc.childInfo[link.targetProcessName] = [];
                            proc.childInfo[link.targetProcessName].push({
                                event: link.Operation,
                                step: link.Step
                            })
                        } else{
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

function handleOperation(malist) {
    var array = [];
    malist.forEach(d => {
        array.push(d.Name);
    });
    return array;
}