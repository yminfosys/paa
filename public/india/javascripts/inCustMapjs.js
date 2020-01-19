var CenterChange='Enable';
var confrmContent='<div class="col-xs-10 col-sm-10 col-md-10 col-lg-10 col-xs-offset-1 col-sm-offset-1 col-md-offset-1 col-lg-offset-1">\
<div style="border-bottom: 1px solid #000; height: 25%;" class="row">\
<div class="col-xs-3 col-sm-3 col-md-3 col-lg-3">\
<img onclick="changeModeofTravel(2)" id="modeImg2" class="modeImg img-rounded" src="/india/images/tm2.png"></div>\
<div class="col-xs-6 col-sm-6 col-md-6 col-lg-6">\
        <div class="form-group">\
        <input type="text" class="form-control" placeholder="Coupon Code" >\
       </div>\
    </div>\
    <div class="col-xs-3 col-sm-3 col-md-3 col-lg-3">\
    <div id="totalAmt">&#8377; 20</div>\
    </div>\
</div>\
<div style="border-bottom: 1px solid #000; height: 25%;" class="row">\
<div class="col-xs-4 col-sm-4 col-md-4 col-lg-4">\
<p><strong><i class="fa fa-money" aria-hidden="true"></i> Payment</strong></p></div>\
<div class="col-xs-4 col-sm-4 col-md-4 col-lg-4">\
<div class="checkbox">\
            <label>\
                <input type="checkbox" value="">\
                Cash\
            </label>\
        </div>\
    </div>\
    <div class="col-xs-4 col-sm-4 col-md-4 col-lg-4">\
    <p><i class="fa fa-google-wallet" aria-hidden="true"></i> &#8377; <br> Wallet(0.00)</p></div>\
</div>\
<div style=" height: 25%; margin-top: 5px;" class="row">\
<div class="col-xs-12 col-sm-12 col-md-12 col-lg-12">\
<button id="confrmBtn" type="button" class="btn btn-large btn-block btn-primary">Confirm PaaCab</button>\
</div>\
</div></div>'
function initMap() {
    var directionsService = new google.maps.DirectionsService;
    var directionsDisplay = new google.maps.DirectionsRenderer({
         polylineOptions:{strokeColor:"#36301e",strokeWeight:2}, 
         suppressMarkers:true 
        });
    var map = new google.maps.Map(document.getElementById('map'), {
          zoom: 7,
          //center: {lat: 23.5659115, lng: 87.2727577},
          mapTypeId: 'roadmap',
          disableDefaultUI: true
        });
      //   directionsDisplay.setOptions({
      //   polylineOptions: {
      //     strokeColor: '#e21b25'
      //   },
      //   draggable: true
      // });
        directionsDisplay.setMap(map);

    var centerMarker;
    var circle;
    var wachID;
   
    ///////Clear Wach Location//////
    wachLocation();
   
    function wachLocation(){
        wachID=navigator.geolocation.watchPosition(function (position){
        ////////Call Circle Center Marker
        circleMarker(position);           
        
        },function error(msg){
            alert('Please enable your GPS position future.');       
        },{maximumAge:600000, timeout:5000, enableHighAccuracy: true});
    }

///////////////Direction rood Service/////
function directionRooteService(orgn,dist,mode){
  if(mode=='1'){
    var reqst={
      origin: {lat:Number(orgn.lat) ,lng: Number(orgn.lng)},
      destination: {lat:Number(dist.lat) ,lng: Number( dist.lng)},
      travelMode: 'WALKING',
      unitSystem: google.maps.UnitSystem.METRIC
    }

  }else{
    var reqst={
      origin: {lat:Number(orgn.lat) ,lng: Number(orgn.lng)},
      destination: {lat:Number(dist.lat) ,lng: Number( dist.lng)},
      travelMode: 'DRIVING',
      unitSystem: google.maps.UnitSystem.METRIC,
      drivingOptions: {
      departureTime: new Date(Date.now()),  // for the time N milliseconds from now.
      trafficModel: 'optimistic'
    }

    }
  }
 
directionsService.route(reqst, function(response, status) {
    if (status === 'OK') {
      console.log(response);      
      directionsDisplay.setDirections(response);
    } else {
      window.alert('Directions request failed due to ' + status);
    }
  });
}
    
    ///////Clear Wach Location//////
  function clearWachposition(){
    navigator.geolocation.clearWatch(wachID);
  }
  google.maps.event.addListener(map, 'drag', function() {
    clearWachposition()
   
  });
  document.getElementById("picuplocation").addEventListener("click", function(){
    clearWachposition();
    $("#ModeofSearch").val('0');
    CenterChange='Enable';
  });
  document.getElementById("droplocation").addEventListener("click", function(){
    clearWachposition();
    $("#ModeofSearch").val('1');
    CenterChange='Enable';
  });
 
  

 
  var centertimer;
   /////Get Address  from map center changes ////////
   google.maps.event.addListener(map, 'center_changed', function() {
       if(CenterChange=='Enable'){
         clearTimeout(centertimer);
        centertimer=setTimeout(function(){
          findPlaceBylntlng({lat:map.getCenter().toJSON().lat,lng:map.getCenter().toJSON().lng});
         },1000);
        
       }
  })
  ///////////Circle Marker/////////
  
  function circleMarker(position){
    var pos={lat:position.coords.latitude,lng:position.coords.longitude};
        ////////Find Pickup Address////       
        findPlaceBylntlng(pos); 
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

      ///////Add CenterMArker pin////////
      $('<div/>').addClass('centerMarker').appendTo(map.getDiv());
      
      ///////Add Navigation Button////////
    $('<div/>').addClass('navigationMarker').appendTo(map.getDiv())
    //do something onclick
    .click(function() {
      wachLocation();
    });
      

var dropMarker=new google.maps.Marker({        
       // icon:'http://www.robotwoods.com/dev/misc/bluecircle.png',
        icon:new google.maps.MarkerImage('/india/images/drop.png',
                                        new google.maps.Size(50,50),
                                        new google.maps.Point(0,0),
                                        new google.maps.Point(25,50)),
        map:map
      
      });
var pickupMarker=new google.maps.Marker({        
// icon:'http://www.robotwoods.com/dev/misc/bluecircle.png',
    icon:new google.maps.MarkerImage('/india/images/pickup.png',
                                    new google.maps.Size(50,50),
                                    new google.maps.Point(0,0),
                                    new google.maps.Point(25,50)),
    map:map
    

});
   
var pickupwindow = new google.maps.InfoWindow({
    content: "Pickup"
  });
var dropwindow = new google.maps.InfoWindow({
content: "Drop"
});
  

  ///////////Find Place By Lat Lng/////
  var driversMarkeTimer;
  function findPlaceBylntlng(latlng){
    var searchmod=$("#ModeofSearch").val();
     $.post('/india/geoplace',{lat:latlng.lat,lng:latlng.lng},function(data){
       
    if(searchmod=='0'){
        setCookie("pickuplatlong",JSON.stringify(latlng),1);
        $("#picuplocation").val(data.results[0].formatted_address);
       // var a=JSON.parse(getCookie("pickuplatlong")) ;
     
        ///////Add pickup Marker/////       
        pickupMarker.setPosition(latlng)
        pickupwindow.open(map, pickupMarker);
        
        clearTimeout(driversMarkeTimer);
        driversMarkeTimer=setTimeout(function(){
          driversMarke();
        },1000);
    }else{
        setCookie("droplatlong",JSON.stringify(latlng),1);
        $("#droplocation").val(data.results[0].formatted_address);
       
        ///////Add drop Marker/////
        dropMarker.setPosition(latlng);
        dropwindow.open(map, dropMarker);
        
    }
        
     }); 
  }

  ///////Nearest Driver Marker////////
    var driverMarkers=[];
    var angleDegrees=90;
    function nereastDriver(driverLocetion,type){
    var travelmod=$("#ModeofTravel").val();
    clearDriverMarker();
    driverLocetion.forEach(function(val,indx){
      var mk;
       mk=new google.maps.Marker({
        position: {lat:val.lat, lng:val.lng},
        //icon:new google.maps.MarkerImage('/images/ic_bike.png'),
        icon:{
            url: "/india/images/DriverMarker"+travelmod+".png", // url
            scaledSize: new google.maps.Size(50, 25), // scaled size
            origin: new google.maps.Point(0,0), // origin
            anchor: new google.maps.Point(22, 22), // anchor
            
            
        },
        map: map,
        });
        if (mk) { // when it hasn't loaded, it's null
        mk.style.transform = `rotate(${angleDegrees}deg)`
      }
        driverMarkers.push(mk);

    })
    }

///////Clear Nearest Driver Marker////////
    function clearDriverMarker(){
    if(driverMarkers.length>0){
    driverMarkers.forEach(function(valu,key,arry){
        valu.setMap(null);
        if(key===arry.length-1){
        driverMarkers=[];
        }
    });
    }

    }
     ////////////Nearest Driver//////////
     function driversMarke(){
         var latLong=JSON.parse(getCookie("pickuplatlong"));
        var travelmod=$("#ModeofTravel").val();
  ////////////Fetch Marker Velue form database////////      
       $.post('/india/nearby',{
         lat:latLong.lat,
         lng:latLong.lng,
         travelmod:travelmod
        },function(data){
        if(data.length>0){
          activTravalModeNerestTime(data[0].location.coordinates,'OK');
          var driverlist=[];        
          data.forEach(function(val,key,arr){          
             driverlist.push({lat:Number(val.location.coordinates[1]), lng:Number(val.location.coordinates[0])})
            if(key === arr.length -1){ 
              nereastDriver(driverlist);           
              }
          });
        }else{
          /////clear driver////
          clearDriverMarker();
          activTravalModeNerestTime([],'NOT');
        }
       });
  
      }

      ////////Contunue Button////////////     
    document.getElementById("naxtBtn").addEventListener("click", function(){
      CenterChange='Disable';
      $(".centerMarker").css({"display":"none"})
      var origin=JSON.parse(getCookie("pickuplatlong")) ;
      var dist=JSON.parse(getCookie("droplatlong")) ;
      var travelmod=$("#ModeofTravel").val();
      directionRooteService(origin,dist,travelmod); 
           
      
          $.each($(".modeImg"),function(i){
            j=i+1;
            $.post('/india/getDistance',{travelmod:j,orig:''+Number(origin.lat)+' , '+Number(origin.lng)+'',diste:''+Number(dist.lat)+' , '+Number(dist.lng)+''},function(data){
              //alert(data.rows[0].elements[0].distance.value);          
              var distance=data.result.rows[0].elements[0].distance.value;
              //alert(distance)          
              distance=parseInt(distance/1000) + 1;
            
            $.post('/india/getPrice',{travelmod:data.travelmod,distance:distance},function(data){
              $("#tm"+data.travelmod+"").css({"display":"block"})
              $("#tm"+data.travelmod+"").html('&#8377;'+data.price+'');
              $("#tmPrice"+data.travelmod+"").val(+data.price);             
              
            });
          });
          });        
      
      $("#naxtBtn").css({"display":"none"});
      $("#footer-content").html(confrmContent);
     
    });


      
      document.getElementById("placeList").addEventListener("click", function(e) {
        if (e.target && e.target.matches("a.searchItem")) {
          e.target.className = "searchItem"; // new class name here
         // alert("clicked " + e.target.innerText);
         
          $.post('/india/placeidtogeocod',{address:e.target.innerText},function(data){
            if(data.status=='OK'){
              var geoloc=data.results[0].geometry.location
              var placeID=data.results[0].place_id
              CloseAll('placesearch');
              CenterChange='disable';
              findPlaceBylntlng(geoloc);
              
            }
          });
        }
      });

 ////////activTravalModeNerestDistanceandTime///////
 function activTravalModeNerestTime(data,status){
      ////////timeanddistancs between
      var travelmod=$("#ModeofTravel").val();
      if(status == 'OK' ){
      
      var origin=JSON.parse(getCookie("pickuplatlong")) ;
      $.post('/india/distbtwnActive',{orig:''+Number(origin.lat)+' , '+Number(origin.lng)+'',diste:''+Number(data[1])+' , '+Number(data[0])+''},function(data){
       
        $("#timee"+travelmod+"").css({"display":"block"}); 
        $("#timee"+travelmod+"").text(data.rows[0].elements[0].duration.text)   
        $("#gif"+travelmod+"").css({"display":"none"});
        
      })
    }else{
      $("#timee"+travelmod+"").css({"display":"none"});
       
    $("#gif"+travelmod+"").css({"display":"block"});
    }
 } 

   

 

} ///////End IntMap  






