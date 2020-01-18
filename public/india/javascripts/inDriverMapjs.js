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


    /////Off line Online /////////
    document.getElementById("toggle").addEventListener("click", function(){
    if(document.getElementById("toggle").checked == true){
      
      onlineExicute();
    }else{
      $("#offline-content").css({"display":"block"});
      $("#map").css({"display":"none"});
      clearWachposition();
    }
  }); 
  
  function onlineExicute(){
    $("#map").css({"display":"block"});
    $("#offline-content").css({"display":"none"});
    wachLocation();
  }

} /////End IntMap////////

