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
    if(cvalue.length > 0){
      $.post('/india/setCookies',{cname:cname,cvalue:cvalue,expires:exdays*24*60*60*1000},function(data){
          console.log(data)
       })
     }else{
      $.post('/india/clerCookies',{cname:cname},function(data){  console.log(data)})
     }
  }

  function setDytyCookie(cname, cvalue, exdays) {
    if(cvalue.length > 0){
      $.post('/india/setCookies',{cname:cname,cvalue:cvalue,expires:exdays*60*1000},function(data){
          console.log(data)
       })
     }else{
      $.post('/india/clerCookies',{cname:cname},function(data){  console.log(data)})
     }
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

  ///////Duty Hour Cound/////
 
    setInterval(function(){ 
      if(getCookie("dutyCount")){         
        setDytyCookie("dutyCount",getCookie("dutyCount"),20);
        console.log("dutyCount",getCookie("dutyCount")) 
        }
    },1000*60*5);
}
/////End InitMap/////



 ///////Handel Socket io  parameter/////// 
 var socket = io('//'+document.location.hostname+':'+document.location.port);
 var thotting=0;
  socket.on('preRideinCommingCall', function (data) {
  if(data.pilotID==getCookie("pilotID")){
    console.log("call Neeed to be accept");
    console.log("inCommingCall data",data);
    if(thotting==0){
      thotting=1;
      setTimeout(function(){
        thotting=0;
      }, 1000*15);
    $.post('/india/preRideAutoAccepeCall',{
        pilotID:data.pilotID,
        CustID:data.CustID,                        
      },function(dat){
        console.log("Call Accepted", dat);
         Android.startRingtone(); 
         vibrateApi(1000*10) 
      });
    }

  }
  });



  //////Vibrate Control API//////
  function vibrateApi(duretion){
    var  loop=0, count=0;
    loop=parseInt(duretion/1500);
    var timeInt=setInterval(function(){
      count++;
      navigator.vibrate(500);
      if(count==loop){
        clearInterval(timeInt);
        navigator.vibrate(0);
      }
    },1000)

    
  }

  

 