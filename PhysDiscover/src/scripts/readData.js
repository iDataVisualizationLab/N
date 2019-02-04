var serviceList = ["Temperature","Job_load","Memory_usage","Fans_speed","Power_consum"];
var serviceListattr = ["arrTemperature","arrCPU_load","arrMemory_usage","arrFans_health","arrPower_usage"];
function readData(){
    for (var att in hostList.data.hostlist) {
        var h = {};
        h.name = att;
        h.hpcc_rack = +att.split("-")[1];
        h.hpcc_node = +att.split("-")[2].split(".")[0];
        h.index = hosts.length;

        // to contain the historical query results
        hostResults[h.name] = {};
        hostResults[h.name].index = h.index;
        hostResults[h.name].arr = [];
        hostResults[h.name].arrTemperature = [];
        hostResults[h.name].arrCPU_load = [];
        hostResults[h.name].arrMemory_usage = [];
        hostResults[h.name].arrFans_health = [];
        hostResults[h.name].arrPower_usage = [];
        hosts.push(h);
    }
}
function readData(hostResults) {
    for (i = 0; i < iterationstep; i++) {
        var result = simulateResults2(hosts[count].name, iteration, selectedService);
        // Process the result
        var name = result.data.service.host_name;
        hostResults[name].arr.push(result);
        plotResult(result);
        //console.log(hosts[count].name+" "+hostResults[name]);
        var result = simulateResults2(hosts[count].name, iteration, serviceList[0]);
        hostResults[name].arrTemperature.push(result);

        var result = simulateResults2(hosts[count].name, iteration, serviceList[1]);
        hostResults[name].arrCPU_load.push(result);

        var result = simulateResults2(hosts[count].name, iteration, serviceList[2]);
        hostResults[name].arrMemory_usage.push(result);

        var result = simulateResults2(hosts[count].name, iteration, serviceList[3]);
        hostResults[name].arrFans_health.push(result);

        var result = simulateResults2(hosts[count].name, iteration, serviceList[4]);
        hostResults[name].arrPower_usage.push(result);
        iteration++;
    }
    return hostResults;
}
function simulateResults2(hostname,iter, s){
    var newService;
    if (s == serviceList[0])
        newService = sampleS[hostname].arrTemperature[iter];
    else if (s == serviceList[1])
        newService = sampleS[hostname].arrCPU_load[iter];
    else if (s == serviceList[2])
        newService = sampleS[hostname].arrMemory_usage[iter];
    else if (s == serviceList[3])
        newService = sampleS[hostname].arrFans_health[iter];
    else if (s == serviceList[4]) {
        if (sampleS[hostname]["arrPower_usage"]== undefined) {
            var simisval = handlemissingdata(hostname,iter);
            sampleS[hostname]["arrPower_usage"] = [simisval];
        }else if (sampleS[hostname]["arrPower_usage"][iter]== undefined){
            var simisval = handlemissingdata(hostname,iter);
            sampleS[hostname]["arrPower_usage"][iter] = simisval;
        }
        newService = sampleS[hostname]["arrPower_usage"][iter];
    }

    function processData(str, serviceName) {
        if (serviceName == serviceList[0]){
            var a = [];
            if (str.indexOf("timed out")>=0 || str.indexOf("(No output on stdout)")>=0 || str.indexOf("UNKNOWN")>=0 ){
                a[0] = undefinedValue;
                a[1] = undefinedValue;
                a[2] = undefinedValue;
            }
            else{
                var arrString =  str.split(" ");
                a[0] = +arrString[2]||undefinedValue;
                a[1] = +arrString[6]||undefinedValue;
                a[2] = +arrString[10]||undefinedValue;
            }
            return a;
        }
        else if (serviceName == serviceList[1]){
            var a = [];
            if (str.indexOf("timed out")>=0 || str.indexOf("(No output on stdout)")>=0 || str.indexOf("UNKNOWN")>=0
                || str.indexOf("CPU Load: null")>=0){
                a[0] = undefinedValue;
                a[1] = undefinedValue;
                a[2] = undefinedValue;
            }
            else{
                var arrString =  str.split("CPU Load: ")[1];
                a[0] = +arrString;
                a[1] = undefinedValue;
                a[2] = undefinedValue;
            }
            return a;
        }
        else if (serviceName == serviceList[2]) {
            var a = [];
            if (str.indexOf("timed out")>=0 || str.indexOf("(No output on stdout)")>=0 || str.indexOf("UNKNOWN")>=0 ){
                a[0] = undefinedValue;
                a[1] = undefinedValue;
                a[2] = undefinedValue;
            }
            else{
                var arrString =  str.split(" Usage Percentage = ")[1].split(" :: ")[0];
                a[0] = +arrString;
                a[1] = undefinedValue;
                a[2] = undefinedValue;
            }
            return a;
        }
        else if (serviceName == serviceList[3]) {
            var a = [];
            if (str.indexOf("timed out")>=0 || str.indexOf("(No output on stdout)")>=0 || str.indexOf("UNKNOWN")>=0 ){
                a[0] = undefinedValue;
                a[1] = undefinedValue;
                a[2] = undefinedValue;
                a[3] = undefinedValue;
            }
            else{
                var arr4 =  str.split(" RPM ");
                a[0] = +arr4[0].split("FAN_1 ")[1];
                a[1] = +arr4[1].split("FAN_2 ")[1];
                a[2] = +arr4[2].split("FAN_3 ")[1];
                a[3] = +arr4[3].split("FAN_4 ")[1];
            }
            return a;
        }
        else if (serviceName == serviceList[4]) {
            var a = [];
            if (str.indexOf("timed out")>=0 || str.indexOf("(No output on stdout)")>=0 || str.indexOf("UNKNOWN")>=0 ){
                a[0] = undefinedValue;
                a[1] = undefinedValue;
                a[2] = undefinedValue;
            }
            else{
                var maxConsumtion = 3.2;  // over 100%
                var arr4 =  str.split(" ");
                a[0] = +arr4[arr4.length-2]/maxConsumtion;
                a[1] = undefinedValue;
                a[2] = undefinedValue;
            }
            return a;
        }
    }

    function handlemissingdata(hostname,iter){
        var simisval = jQuery.extend(true, {}, sampleS[hostname]["arrTemperature"][iter]);
        var simval = processData(simisval.data.service.plugin_output, serviceList[0]);
        // simval = (simval[0]+simval[1])/2;
        simval = (simval[0]+simval[1]+20);
        var tempscale = d3.scaleLinear().domain([thresholds[0][0],thresholds[0][1]]).range([thresholds[4][0],thresholds[4][1]]);
        if (simval!==undefinedValue && !isNaN(simval) )
        //simisval.data.service.plugin_output = "OK - The average power consumed in the last one minute = "+Math.round(tempscale(simval)*3.2)+" W";
            simisval.data.service.plugin_output = "OK - The average power consumed in the last one minute = "+Math.floor(simval*3.2)+" W";
        else
            simisval.data.service.plugin_output = "UNKNOWN";
        return simisval;
    }

    return newService;
}