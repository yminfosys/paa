//////cookie Setting////
function getCookie(cname) {
    var name = cname + "=";
    var decodedCookie = decodeURIComponent(document.cookie);
    var ca = decodedCookie.split(';');
    for(var i = 0; i <ca.length; i++) {
      var c = ca[i];
      while (c.charAt(0) == ' ') {
        c = c.substring(1);
      }
      if (c.indexOf(name) == 0) {
        return c.substring(name.length, c.length);
      }
    }
    return "";
  }


  function setCookie(cname, cvalue, exdays) {
    var d = new Date();
    d.setTime(d.getTime() + (exdays*24*60*60*1000));
    var expires = "expires="+ d.toUTCString();
    document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
  }

var map;

function initMap() {  
    ///////Map Initiate 
    map = new google.maps.Map(document.getElementById('map'), {
          zoom: 7,
          center: {lat: 23.5659115, lng: 87.2727577},
          mapTypeId: 'roadmap',
          disableDefaultUI: true,
          map:map
        });

///////////Initiate page Parametter///////
        function pageInit(){
         var RideDetails=JSON.parse(getCookie("RideDetails"));
         console.log('rRideDetails',RideDetails);
         $.post('/india/rideDriverBookingDetails',RideDetails,function(data){
            console.log('rider',data);
            $("#footer").html('<div id="driver-content">\
             <div class="row">\
             <div class="col-xs-10 col-xs-offset-1 col-sm-10 col-sm-offset-1">\
                <img class="drive-img img-circle" src="/india/images/tm1.png">\
                    <div class="driver-details">\
                        <p>Sukanta Sardar</p>\
                            <p>Rating: 4.5 <i class="fa fa-star" aria-hidden="true"></i></p>\
                            <p class="otp">OTP: '+RideDetails.RideOTP+'</p>\
                    </div>\
                    <div class="car-details">\
                        <p class="text-center">WB96G77581</p>\
                        <p style="font-size: smaller;" class="text-center">Honda Shin SP</p>\
                        <a href="tel:9733241208" class="btn btn-success"><i class="fa fa-phone" aria-hidden="true"></i></a>\
                        <a href="sms:9733241208" class="btn btn-success"><i class="fa fa-comments" aria-hidden="true"></i></a>\
                    </div>\
                </div>\
            </div>\
        </div>\
        <div id="booking-content">\
            <div class="row">\
                <div class="col-xs-10 col-xs-offset-1 col-sm-10 col-sm-offset-1">\
                    <div id="up-arw" class="text-center" onclick="resizeFooter()" class=""><i class="fa fa-angle-double-up" aria-hidden="true"></i></div>\
                    <div id="down-arw" class="text-center" style="display: none;" onclick="restoreFooter()" class=""><i class="fa fa-angle-double-down" aria-hidden="true"></i></div>\
                </div>\
            <div class="row">\
                <div style="margin-top: 20px;" class=" mystyl col-xs-10 col-xs-offset-1 col-sm-10 col-sm-offset-1">\
                    <div id="pickup" > Pickup From : BAnachity Durgaput</div>\
                </div>\
            </div>\
                <div class="row">\
                    <div  class=" mystyl col-xs-10 col-xs-offset-1 col-sm-10 col-sm-offset-1">\
                        <div id="drop" > Going To :BAnachity Durgaput</div>\
                    </div>\
                </div> \
                <div class="row">\
                    <div  class=" mystyl col-xs-10 col-xs-offset-1 col-sm-10 col-sm-offset-1">\
                        <button type="button" class="btn btn-lg btn-danger">Cancel</button>\
                    </div>\
                </div>\
            </div>')
            
         });           
            
        }
        pageInit();
}  //////end InitMap 



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

