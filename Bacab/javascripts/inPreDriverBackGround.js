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
        $.post('/india/preRideLocationUpdate',{lat:position.coords.latitude,lng:position.coords.longitude},function(data){
            console.log(data);
         });

    }

}
