// Avoid `console` errors in browsers that lack a console.
(function() {
  var method;
  var noop = function () {};
  var methods = [
    'assert', 'clear', 'count', 'debug', 'dir', 'dirxml', 'error',
    'exception', 'group', 'groupCollapsed', 'groupEnd', 'info', 'log',
    'markTimeline', 'profile', 'profileEnd', 'table', 'time', 'timeEnd',
    'timeline', 'timelineEnd', 'timeStamp', 'trace', 'warn'
  ];
  var length = methods.length;
  var console = (window.console = window.console || {});

  while (length--) {
    method = methods[length];

    // Only stub undefined methods.
    if (!console[method]) {
      console[method] = noop;
    }
  }
}());

/**
 * Get a cookie
 * @param {String} cname, cookie name
 * @return {String} String, cookie value
 */
function getCookie(cname) {
    var name = cname + "="; //Create the cookie name variable with cookie name concatenate with = sign
    var cArr = window.document.cookie.split(';'); //Create cookie array by split the cookie by ';'

    //Loop through the cookies and return the cooki value if it find the cookie name
    for(var i=0; i<cArr.length; i++) {
        var c = cArr[i].trim();
        //If the name is the cookie string at position 0, we found the cookie and return the cookie value
        if (c.indexOf(name) == 0)
            return c.substring(name.length, c.length);
    }

    //If we get to this point, that means the cookie wasn't find in the look, we return an empty string.
    return "";
}

// Place any jQuery/helper plugins in here.
/**
 * Check if there is a vistorname cookie.
 * If yes, display welcome message.
 * If No, prompt the vistor for a name, and set the vistorname cookie.
 */
function checkCookie() {
    //deleteCookie('vistorname');
    var vistor=getCookie("vistorname");
    if (vistor != "") {
        var welcome_msg = window.document.getElementById('welcome-msg');
        welcome_msg.innerHTML="Welcome "+vistor;
    } else {
        vistor = prompt("What is your name?","");
        if (vistor != "" && vistor != null) {
            setCookie("vistorname", vistor, 30);
        }
    }
}

/**
 * Set a cooke and reload the page when the create cookie button is clicked
 */
function setACookie(){
    var cname = window.document.getElementById('cname').value; //Get the cookie name from the cname input element
    var cvalue = window.document.getElementById('cvalue').value;//Get the cookie value from the cvalue input element
    var exdays = window.document.getElementById('exdays').value;//Get the expiration days from the exdays input element

    setCookie(cname, cvalue, exdays);//Call the setCookie to create the cookie
    window.location.reload();//Reload the page
}

/**
 * Delete a cookie and reload the page when the delete cookie button is clicked
 */
function deleteACookie(){
    var cname = window.document.getElementById('cname').value;//Get the cookie name from the cname input element
    deleteCookie(cname);//Call the deleteCookie to delete the cookie
    window.location.reload();//Reload the page
}

/**
 * Display all the cookies
 */
function disPlayAllCookies()
{
    var cookieDiv = window.document.getElementById('cookies');//Get the cookies div element
    var cArr = window.document.cookie.split(';'); //Create cookie array by split the cookie by ';'

    //Loop through all the cookies and display them with cookie name = cookie value
    for(var i=0; i<cArr.length; i++)
    {
        var pElm = window.document.createElement("p");//Create a p element to hold the cookie name and cookie value
        pElm.innerHTML=cArr[i].trim();//Put the cookie name and cookie value in the p elment
        cookieDiv.appendChild(pElm);//Append the p to the cookies div element
    }
}

function readConf(choice) {
    return d3.json("src/data/" + choice + ".json", function (data) {
        return data;
    });
}

function readLib(choice) {
    return d3.json("src/lib/" + choice + ".json", function (data) {
        return data;
    });
}

function dmstoLongLat(string){
    const dicarr = string.match(/[A-Z]/gi);
    let temp = {};
    if(dicarr !==null) {
        const numstrarr = string.split(/[A-Z]/i)
        temp[COL_LONG] =  convertorGPS(str2num(numstrarr[2]));
        temp[COL_LAT] = convertorGPS(str2num(numstrarr[1]));
        if (dicarr[0] === "S"||dicarr[1] === "S") {
            temp[COL_LAT] = -temp[COL_LAT];
        }
        if (dicarr[1] === "W"||dicarr[1] === "w") {
            temp[COL_LONG] = -temp[COL_LONG];
        }
    }else{
        const numstrarr = string.split(',');
        temp[COL_LONG] =  +numstrarr[1];
        temp[COL_LAT] = +numstrarr[0];
    }
    return temp;
    function str2num(str){
        return str.split(/�|'|"/).map(d=>+d);
    }
    function convertorGPS([d,min,sec]){
        return d + (min/60) + (sec/3600);
    }
}

