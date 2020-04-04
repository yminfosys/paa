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
        ////////Call Circle Center 
       
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
        console.log("Rides detals",rides)
        var smalest=0;
        var smalIndx=0
        rides.forEach(function(val,indx,ar){
          if(indx==0){
            smalest=val.bookingID;
            smalIndx=indx;
        }else{
            if(smalest > val.bookingID){
                smalest=val.bookingID;
                smalIndx=indx;
            }                

        }
        
            out+='<div id="listItem'+indx+'" class="row listItem">\
            <div id="nameAds'+indx+'" class="col-xs-9 col-sm-9">\
            <p class="prerideName"><span>Order ID: '+val.bookingID+'</span><br>Pickup Form : '+val.name+'</p>\
                <p class="prerideads">'+val.picupaddress+'</p>\
            </div>\
            <div id="mapBtn'+indx+'" class="col-xs-3 col-sm-3">\
                <button id="mapBtn" onclick="googlemapbtn(\'' + 1 + '\',\'' + val.picuklatlng + '\')" type="button" class="btn btn-info mybtn"><i class="fa fa-location-arrow" aria-hidden="true"></i></button>\
            </div>\
            <div class="col-xs-9 col-sm-9">\
            <input type="hidden" id="preRideOTP'+indx+'" value="'+val.preRideOTP+'">\
            <input type="hidden" id="CustID'+indx+'" value="'+val.CustID+'">\
            <input type="hidden" id="pilotID'+indx+'" value="'+val.pilotID+'">\
            <input type="hidden" id="droplatlng'+indx+'" value="'+val.droplatlng+'">\
            <input type="hidden" id="picuklatlng'+indx+'" value="'+val.picuklatlng+'">\
            <input type="hidden" id="dropaddress'+indx+'" value="'+val.dropaddress+'">\
            <input type="hidden" id="name'+indx+'" value="'+val.name+'">\
            <input type="hidden" id="bookingID'+indx+'" value="'+val.bookingID+'">\
                <input onclick="clineLocated(\''+indx+'\')" id="clineLocated'+indx+'" class="pickupPreridebtn" type="button" value="Cline Located">\
                <input onclick="startRide(\''+indx+'\')" id="startRide'+indx+'" class="pickupPreridebtn1" type="button" value="Start Ride">\
                <input onclick="finishride(\''+indx+'\')" id="finishride'+indx+'" class="pickupPreridebtn1" type="button" value="Finish Ride">\
            </div>\
            <div class="col-xs-3 col-sm-3 telmsg">\
                <a href="tel:'+val.isdCode+val.mobileNumber+'"><button type="button" class="btn btn-warning btn-xs"><i class="fa fa-phone" aria-hidden="true"></i></button></a>\
                <a href="sms:'+val.isdCode+val.mobileNumber+'"><button type="button" class="btn btn-warning btn-xs"><i class="fa fa-comments" aria-hidden="true"></i></button></a>\
            </div>\
            </div>';


            if(indx===ar.length -1){
               
                $("#rideList").html(out);
                $("#listItem"+smalIndx+"").css({"background-color":"#91bb2f"})
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
  
  /////continueNextRide /////////
  document.getElementById("continueNextRide").addEventListener("click", function(){ 
    var bookingID=$("#bookingIDFinish").val(); 
    //alert(bookingID)  
    $.post('/india/finishandUpdateRide',{bookingID:bookingID},function(data){
      if(data){
        onlineExicute();
        $("#billAndfeedback").css({"display":"none"});
        document.getElementById("toggle").checked = true;        
      }
      
    });
    
  });

 
  

}/////End INITMAP