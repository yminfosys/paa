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
     var driverLocTimer;
    function wachLocation(){
        wachID=navigator.geolocation.watchPosition(function (position){
        ////////Call Circle Center Marker
        circleMarker(position);
        clearTimeout(driverLocTimer);
              
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

     /////Check setSystem ONLINE or OFFLINE  
  var setSystem=getCookie("setSystem");
  if(setSystem=="ONLINE"){
    document.getElementById("toggle").checked = true;
    onlineExicute();    

  }


    /////Off line Online /////////
    document.getElementById("toggle").addEventListener("click", function(){
    if(document.getElementById("toggle").checked == true){      
      onlineExicute();
    }else{
      clearWachposition();      
      clearDemandArea();
      /////Android Interface
      andRoid(0);
      ////////////////      
      setTimeout(function(){
        $.post('/india/drv/dutyUpdate',{duty:'offline'},function(data){
          console.log(data);
          setCookie("setSystem","OFFLINE",30);
          $("#offline-content").css({"display":"block"});
          $("#map").css({"display":"none"});

        })
      },1000);
    }
  }); 
  
  function onlineExicute(){
    wachLocation();
    clearDemandArea();
    setCookie("setSystem","ONLINE",30);

    /////Check Incomming Call Accept Display Window /////
      // if(getCookie("openAcceptWindow")){
      //   ///////Open accept Window/////
      //   var inData=JSON.parse(getCookie("openAcceptWindow"));
      //   $("#ringtone").css({"display":"block"});
      //   $("#pickupFrom").text(inData.pickuoAddress);
      //   $("#pilotID").val(inData.pilotID);
      //   $("#CustID").val(inData.CustID);
      //   var tt=setInterval(function(){
      //     if(!getCookie("openAcceptWindow")){
      //       $("#ringtone").css({"display":"none"});
      //       clearInterval(tt);
      //     }

      //   },300);
      // }
    

    /////Android Interface
    andRoid(1);
    ////////////////

    $("#map").css({"display":"block"});
    $("#offline-content").css({"display":"none"});
    
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

  ///////FOR ANDROID //////

  function andRoid(a){
    Android.onlineOffline(a);
   }

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

