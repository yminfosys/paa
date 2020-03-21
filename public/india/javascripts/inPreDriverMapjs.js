var map;
var centerMarker;
var circle;
var wachID;
function initMap() {   
    map = new google.maps.Map(document.getElementById('map'), {
          zoom: 7,
         //center: {lat: 23.5659115, lng: 87.2727577},
          mapTypeId: 'roadmap',
          disableDefaultUI: true,
          map:map
        });
        
    ////////WatchLocation///////    
    var driverLocTimer;
    function wachLocation(){
        wachID=navigator.geolocation.watchPosition(function (position){
        ////////Call Circle Center Marker
        circleMarker(position);         
        clearTimeout(driverLocTimer);
        driverLocTimer=setTimeout(function(){          
            driverLocationUpdate(position);
        },500);           
        
        },function error(msg){
            alert('Please enable your GPS position future.');       
        },{maximumAge:600000, timeout:5000, enableHighAccuracy: true});
    }
  
   
    /////////Clear Watch location////
    function clearWachposition(){
      navigator.geolocation.clearWatch(wachID);
    }

     /////////GPS location update driver tracking///////
   function driverLocationUpdate(position){
    $.post('/india/drv/driverLocatioUpdate',{lat:position.coords.latitude,lng:position.coords.longitude,DriverType:"preRide"},function(data){
      console.log(data);
    });
   }

    ///////////Circle Marker/////////
  
    function circleMarker(position){
        var pos={lat:position.coords.latitude,lng:position.coords.longitude};      
        if(!centerMarker){
            centerMarker=new google.maps.Marker({
            position: pos, 
           // icon:'http://www.robotwoods.com/dev/misc/bluecircle.png',
            icon:new google.maps.MarkerImage('/india/images/bluecircle.png',
                                            new google.maps.Size(50,50),
                                            new google.maps.Point(0,0),
                                            new google.maps.Point(8,8)),
            map:map
          
          });
          circle = new google.maps.Circle({
            map: map,
            radius:position.coords.accuracy, ///   // 10 miles in metres
            fillColor: 'rgb(73, 136, 161)',
            strokeColor:'rgb(198, 232, 235)',
            
          });
        circle.bindTo('center', centerMarker, 'position')
        map.setZoom(14);
                
          }else{
            centerMarker.setPosition(pos);              
                map.setCenter(pos);
                map.setZoom(14);
            circle.setRadius(position.coords.accuracy);
    
            // $("#centerLocation").val(''+position.coords.latitude+','+position.coords.longitude+'');
            // $("#pickuplatlong").val('{"lat":"'+position.coords.latitude+'","lng":"'+position.coords.longitude+'"}')        
          }
        
      }
     //////End Circle Marker//////

      /////Off line Online /////////
    document.getElementById("toggle").addEventListener("click", function(){
      if(document.getElementById("toggle").checked == true){        
        onlineExicute();
      }else{
        $("#Offline").css({"display":"block"});
        $("#map").css({"display":"none"});
        $("#nofofride").css({"display":"none"});
        clearWachposition();
        setCookie("ringToneControl","OFF",1);        
        setTimeout(function(){
          $.post('/india/drv/dutyUpdate',{duty:'offline'},function(data){
            console.log(data)
          })
        },1000);
        
      }
    }); 
    
    function onlineExicute(){
      wachLocation();
      $("#Offline").css({"display":"none"});
      $("#nofofride").css({"display":"block"});
      $("#map").css({"display":"block"});
      var ringTimer= setInterval(RingToneHandeler,300);
      ///////Page Initiate///////////////
      var pilotID=getCookie("pilotID");
      $.post('/india/preRidePageInitiate',{pilotID:pilotID,driverBusy:"busy"},function(rides){
        var out="";
        rides.forEach(function(val,indx,ar){
            out+='<div class="row listItem">\
            <div class="col-xs-9 col-sm-9 ">\
            <p class="prerideName">Pickup : '+val.name+'</p>\
                <p class="prerideads">'+val.picupaddress+'</p>\
                </div>\
            <div class="col-xs-3 col-sm-3">\
            <input id="geoNav" type="hidden">\
                <button onclick="openMap()" type="button" class="btn btn-info mybtn"><i class="fa fa-location-arrow" aria-hidden="true"></i></button>\
            </div>\
            <div class="col-xs-9 col-sm-9">\
                <input onclick="clineLocated()" id="clineLocated" class="pickupPreridebtn" type="button" value="Cline Located">\
                <input onclick="startRide()" id="startRide" class="pickupPreridebtn" type="button" value="Start Ride">\
                <input onclick="finishride()" id="finishride" class="pickupPreridebtn" type="button" value="Finish Ride">\
            </div>\
            <div class="col-xs-3 col-sm-3 telmsg">\
                <a href="tel:'+val.isdCode+val.mobileNumber+'"><button type="button" class="btn btn-warning btn-xs"><i class="fa fa-phone" aria-hidden="true"></i></button></a>\
                <a href="sms:'+val.isdCode+val.mobileNumber+'"><button type="button" class="btn btn-warning btn-xs"><i class="fa fa-comments" aria-hidden="true"></i></button></a>\
            </div>\
            </div>';

            if(indx===ar.length -1){
               
                $("#rideList").html(out);
            }
        });
      });

    }

    //////Ring tone Handeler////
  var  myAudio= new Audio('/india/audio/car_horn.mp3');
  function RingToneHandeler(){
    var OnOff=getCookie("ringToneControl");
    if(OnOff=='ON'){
      myAudio.addEventListener('ended', function() {
      this.currentTime = 0;
      this.play();
      }, false);        
      myAudio.play();
      window.navigator.vibrate(200);
      setTimeout(function(){
        setCookie("ringToneControl","OFF",30);
        myAudio.pause();
      },3000)
    }
  }    

}/////End INITMAP