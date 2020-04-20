/////cookie Setting////
function getCookie(cname) {
    var name = cname + "=";
    var decodedCookie = decodeURIComponent(document.cookie);
    var ca = decodedCookie.split(';');
    for(var i = 0; i <ca.length; i++) {
      var c = ca[i];
      while (c.charAt(0) == ' ') {
        c = c.substring(1);
      }
      if (c.indexOf(name) == 0) {
        return c.substring(name.length, c.length);
      }
    }
    return "";
  }
  
  

  function setCookie(cname, cvalue, exdays) {
    var d = new Date();
    d.setTime(d.getTime() + (exdays*24*60*60*1000));
    var expires = "expires="+ d.toUTCString();
    document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
  }
var wachID;
function initMap() { 
    wachLocation();
    function wachLocation(){
        wachID=navigator.geolocation.watchPosition(function (position){
            LocationUpdate(position);
        },function error(msg){
            alert('Please enable your GPS position future.');       
        },{maximumAge:600000, timeout:5000, enableHighAccuracy: true});
    } 

    function LocationUpdate(position){     
        $.post('/india/driverLocationUpdate',{lat:position.coords.latitude,lng:position.coords.longitude,accuracy:position.coords.accuracy, DriverType:"preRide" },function(data){
            console.log(data);
         });

    }

  

}

setInterval(function(){
 console.log(JSON.parse(getCookie("position")).lat);
},5000);

 ///////Handel Socket io  parameter/////// 
 var socket = io('//'+document.location.hostname+':'+document.location.port);
 var tt;
  socket.on('preRideinCommingCall', function (data) {
  if(data.pilotID==getCookie("pilotID")){
    console.log("call Neeed to be accept");
    console.log("inCommingCall data",data);
    $.post('/india/preRideAutoAccepeCall',{
        pilotID:data.pilotID,
        CustID:data.CustID,                        
      },function(dat){
        console.log("Call Accepted", dat);
        clearTimeout(tt);
        tt=setTimeout(function(){
         Android.startRingtone();
        },500);
          
      });

  }
  });

  

 