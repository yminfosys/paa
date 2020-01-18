var map;
function initMap() {

   
    map = new google.maps.Map(document.getElementById('map'), {
          zoom: 7,
          center: {lat: 23.5659115, lng: 87.2727577},
          mapTypeId: 'roadmap',
          disableDefaultUI: true,
          map:map
        });
    /////Off line Online /////////
    document.getElementById("toggle").addEventListener("click", function(){
    if(document.getElementById("toggle").checked == true){
      
      onlineExicute();
    }else{
      $("#offline-content").css({"display":"block"});
      $("#map").css({"display":"none"});
    }
  }); 
  
  function onlineExicute(){
    $("#map").css({"display":"block"});
    $("#offline-content").css({"display":"none"});
  }

}

