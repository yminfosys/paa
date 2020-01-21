var map;

function initMap() {   
    map = new google.maps.Map(document.getElementById('map'), {
          zoom: 7,
          center: {lat: 23.5659115, lng: 87.2727577},
          mapTypeId: 'roadmap',
          disableDefaultUI: true,
          map:map
        });




} 


/////Other Function/////

function resizeFooter(){
$("#footer").css({"height": "100vh","top": "0vh","z-index":"50"});
$("#down-arw").css({"display":"block"});
$("#up-arw").css({"display":"none"});

}

function restoreFooter(){
    $("#footer").css({"height": "25vh","top": "75vh"});
    $("#down-arw").css({"display":"none"});
    $("#up-arw").css({"display":"block"});

}