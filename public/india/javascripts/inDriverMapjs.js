var map;
var centerMarker;
var circle;
var wachID;
function initMap() {   
    map = new google.maps.Map(document.getElementById('map'), {
          zoom: 7,
         // center: {lat: 23.5659115, lng: 87.2727577},
          mapTypeId: 'roadmap',
          disableDefaultUI: true,
          map:map
        });
    ////////WatchLocation///////    
   
    function wachLocation(){
        wachID=navigator.geolocation.watchPosition(function (position){
        ////////Call Circle Center Marker
        circleMarker(position); 
        driverLocationUpdate(position);          
        
        },function error(msg){
            alert('Please enable your GPS position future.');       
        },{maximumAge:600000, timeout:5000, enableHighAccuracy: true});
    }
  
    /////////Clear Watch location////
    function clearWachposition(){
      navigator.geolocation.clearWatch(wachID);
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
        map.setCenter(pos)
        map.setZoom(14); 
        circle.setRadius(position.coords.accuracy);

        // $("#centerLocation").val(''+position.coords.latitude+','+position.coords.longitude+'');
        // $("#pickuplatlong").val('{"lat":"'+position.coords.latitude+'","lng":"'+position.coords.longitude+'"}')        
      }
    
  }
 //////End Circle Marker//////

   /////////GPS location update driver tracking///////
   function driverLocationUpdate(position){
    $.post('/india/drv/driverLocatioUpdate',{lat:position.coords.latitude,lng:position.coords.longitude},function(data){
      console.log(data);
    });
   }
   


    /////Off line Online /////////
    document.getElementById("toggle").addEventListener("click", function(){
    if(document.getElementById("toggle").checked == true){
      
      onlineExicute();
    }else{
      $("#offline-content").css({"display":"block"});
      $("#map").css({"display":"none"});
      $.post('/india/drv/dutyUpdate',{duty:'offline'},function(data){
        console.log(data)
      })
      clearWachposition();
      setCookie("ringToneControl","OFF",1);
    }
  }); 
  
  function onlineExicute(){
    wachLocation();
    $("#map").css({"display":"block"});
    $("#offline-content").css({"display":"none"});
    $.post('/india/drv/dutyUpdate',{duty:'online'},function(data){
      console.log(data)
    });
     ringTimer= setInterval(RingToneHandeler,300);
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
    }else{
      myAudio.pause();
      //window.navigator.vibrate();
    }
  }    
 
////////Relods Driver Order Page///////
reloadBookingStage($("#orderStage").val());
function reloadBookingStage(stage){
 
   if(stage=='accept'){
      wachLocation();
      $("#map").css({"display":"block"});
      $("#offline-content").css({"display":"none"});
       var data=JSON.parse(getCookie("rideBookingDetails"));                
       setCookie("ringToneControl","OFF",1);
       $("#ringtone").css({"display":"none"});           
       $("#pickDrop-Content").css({"display":"block"});
       $("#orderNO").text(data.ride.bookingID);
       $("#telsms").html('<a href="tel:'+data.cust.isdCode+data.cust.mobileNumber+'"><button type="button" class="btn btn-warning btn-xs"><i class="fa fa-phone" aria-hidden="true"></i></button></a>\
       <a href="sms:'+data.cust.isdCode+data.cust.mobileNumber+'"><button type="button" class="btn btn-warning btn-xs"><i class="fa fa-comments" aria-hidden="true"></i></button></a>');
       $("#address").html('<p>Pick up: <br> <strong>'+data.cust.name+'</strong> <br>'+data.ride.picupaddress+'</p>');
       $("#geoNav").val(1); 
   }else{
       if(stage=='startRide'){
        wachLocation();
        $("#map").css({"display":"block"});
        $("#offline-content").css({"display":"none"});
         var data=JSON.parse(getCookie("rideBookingDetails"));                
         setCookie("ringToneControl","OFF",1);
         $("#ringtone").css({"display":"none"});           
         $("#pickDrop-Content").css({"display":"block"});
         $("#orderNO").text(data.ride.bookingID);
         $("#telsms").html('<a href="tel:'+data.cust.isdCode+data.cust.mobileNumber+'"><button type="button" class="btn btn-warning btn-xs"><i class="fa fa-phone" aria-hidden="true"></i></button></a>\
         <a href="sms:'+data.cust.isdCode+data.cust.mobileNumber+'"><button type="button" class="btn btn-warning btn-xs"><i class="fa fa-comments" aria-hidden="true"></i></button></a>');
         $("#address").html('<p>Drop to: <br> <strong>'+data.cust.name+'</strong> <br>'+data.ride.dropaddress+'</p>');
         $("#geoNav").val(2); 
         $("#startRide").css({"display":"none"});
         $("#clineLocated").css({"display":"none"});
         $("#finishride").css({"display":"block"});

       }else{
           if(stage=='finish'){


           }else{

           }                
       }
   }
 }

 

} /////End IntMap////////

