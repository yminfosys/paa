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
          if(getCookie("stopMapSetCenter")!="YES"){
            map.setCenter(pos);
            map.setZoom(14); 
          }
          console.log("stopMapSetCenter",getCookie("stopMapSetCenter"))
        
        circle.setRadius(position.coords.accuracy);

        // $("#centerLocation").val(''+position.coords.latitude+','+position.coords.longitude+'');
        // $("#pickuplatlong").val('{"lat":"'+position.coords.latitude+'","lng":"'+position.coords.longitude+'"}')        
      }
    
  }
 //////End Circle Marker//////

    ////////Map Ctrl Marker//////
        var demand=0;
         $('<div/>').addClass('demandArea').appendTo(map.getDiv())
         //do something onclick
         .click(function() {
           if(demand==1){
            //////Set Normal/////
            clearDemandArea();
            demand=0; 
           }else{
             demand=1;
             demandArea();
           
           }
           
         });
         $('<div/>').addClass('demandUpdate').appendTo(map.getDiv())
         //do something onclick
         .click(function() {
          demandArea();
         });

         function demandArea(){
         /////Get Demand Area Marker//////
         $("#map-msg").appendTo(map.getDiv())
          $("#map-msg").css({"display":"block"});
         $.post('/india/drv/getDemadndArea',{lat:map.getCenter().toJSON().lat,lng:map.getCenter().toJSON().lng},function(data){
          console.log(data)
          $("#map-msg").css({"display":"none"});
            if(data){
              var driverlist=[];        
              data.forEach(function(val,key,arr){          
                 driverlist.push({lat:Number(val.location.coordinates[1]), lng:Number(val.location.coordinates[0])})
                if(key === arr.length -1){ 
                  AllDemandMarker(driverlist);           
                  }
              });
             
            }
          
         });

          $(".demandUpdate").css({"display":"block"});
          setCookie("stopMapSetCenter","YES",1);
         }

         function clearDemandArea(){
          //alert("clerdemand");
          $(".demandUpdate").css({"display":"none"});
          setCookie("stopMapSetCenter","NO",1);
          $("#map-msg").css({"display":"none"});
          clearDemandMarker();
         }

           ///////Nearest Driver Marker////////
    var DemandMarkers=[];
    var angleDegrees=90;
    function AllDemandMarker(DemandLocetion,type){    
      clearDemandMarker();
    DemandLocetion.forEach(function(val,indx){
     
      DemandMarkers.push(new google.maps.Marker({
        position: {lat:val.lat, lng:val.lng},
        //icon:new google.maps.MarkerImage('/images/ic_bike.png'),
        icon:{
            url: "/india/images/demand-marker.png", // url
            scaledSize: new google.maps.Size(20, 20), // scaled size
            origin: new google.maps.Point(0,0), // origin
            anchor: new google.maps.Point(10, 10), // anchor
            
            
        },
        map: map,
        }));
        
        

    })
    }

///////Clear Demand Marker////////
    function clearDemandMarker(){
    if(DemandMarkers.length>0){
      DemandMarkers.forEach(function(valu,key,arry){
        valu.setMap(null);
        if(key===arry.length-1){
          DemandMarkers=[];
        }
    });
    }

    }

   /////////GPS location update driver tracking///////
   function driverLocationUpdate(position){
    $.post('/india/drv/driverLocatioUpdate',{lat:position.coords.latitude,lng:position.coords.longitude,DriverType:"General"},function(data){
      //console.log(data);
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
      clearDemandArea();
    }
  }); 
  
  function onlineExicute(){
    wachLocation();
    clearDemandArea();
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
       $("#clineLocated").css({"display":"block"});
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
           if(stage=='finishRide'){
            wachLocation();
            $("#map").css({"display":"block"});
            $("#offline-content").css({"display":"none"});
             var data=JSON.parse(getCookie("rideBookingDetails"));                
             setCookie("ringToneControl","OFF",1);
             $("#ringtone").css({"display":"none"});           
             $("#pickDrop-Content").css({"display":"none"});
            $.post('/india/drv/getFinalBooking',{bookingID:data.ride.bookingID},function(data){
              if(data){
                console.log(data);
                $("#billAndfeedback").css({"display":"block"});                  
                $("#OTP-Content").css({"display":"none"});
                $("#startRide").css({"display":"none"});
                $("#finishride").css({"display":"none"});
                $("#pickdropfooter").css({"display":"none"});
                $("#pickdropHead").css({"display":"none"});
                $("#amt").text(data.totalamount)
              }
            }); 
            
             

           }else{

           }                
       }
   }
 }

  /////continueNextRide /////////
  document.getElementById("continueNextRide").addEventListener("click", function(){    
    $.post('/india/drv/finishEverythingAndSetNormal',{},function(data){
      if(data){
        onlineExicute();
        $("#billAndfeedback").css({"display":"none"});
        document.getElementById("toggle").checked = true;
        incetiveAndBooking();
      }
      
    });
    
  });


  /////// Incentive and Booking /////////

  function incetiveAndBooking(){
    $.post('/india/drv/bookingIncentiveDetails',{},function(data){
      $("#booking").text(data.noOfBooking);
      $("#earning").text(data.totalErning);
      $("#inct").text(data.totalIncentive);
    });
  }

  incetiveAndBooking();

  
} /////End IntMap////////

