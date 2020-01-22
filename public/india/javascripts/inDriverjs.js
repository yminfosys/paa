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

////Randanm OTP/////////
function randamNumber(){
    var tex="";
    for(var i=0; i < 4; i++){
        tex+=''+Math.floor(Math.random() * 10)+'';    
    }
    return tex;

}
////////////Login and Register/////
var timerr;
function mkeydown(){
clearTimeout(timerr);
}

function mkeyup(){
    clearTimeout(timerr);
    timerr=setTimeout(veryfyMobileNumber,1000) ; 
}

function veryfyMobileNumber(){
   //////call otp API////
   var mobile=$("#mobile").val()
    if(mobile.length===10){        ;
        var otp=randamNumber();
        $("#otp1").val(otp);
        alert(otp)
        $("#mobile").css({"color":"green"});
        ////////Check Mobile No Exist in our System/////
        $.post('/india/drv/checkMobileExist',{mobile:mobile},function(data){
            if(data=='exist'){
                ///////Login Function////
                $("#password-content").css({"display": "block"});
                $("#login-content").css({"display": "block"});
                $("#password").focus();
                $("#submit-content").css({"display": "none"});
                $("#name-content").css({"display": "none"})
                $("#otp-content").css({"display": "none"});
                $("#email-content").css({"display": "none"})
                

            }else{
                //////Send OTP////
                $.post('/india/drv/otpSend',{mobile:mobile,otp:otp},function(data){
                    if(data.status=='success'){
                        $("#mobile").css({"background-color": "Green","color":"#FFF"});
                        $("#otp-content").css({"display": "block"});   
                        $("#otp").val('');
                        $("#otp").focus();
                        
                        $("#name-content").css({"display": "none"})
                        $("#password-content").css({"display": "none"})
                        $("#submit-content").css({"display": "none"})
                        $("#email-content").css({"display": "none"})
                        $("#login-content").css({"display": "none"});
                        $("#login-content").css({"display": "none"});
                    }else{
                        $("#mobile").css({"background-color": "#c44630","color":"#FFF"});
                    }
                   }); 
            }
        })

       
    }else{
        $("#mobile").css({"color":"red"});  
    }
 
}

function verifyOTP(){
    var otp1=$("#otp1").val();
    var otp=$("#otp").val();
    if(otp.length==4 && otp==otp1){
        $("#otpnotmatch").css({"display": "none"})
        //alert('match')
        $("#name-content").css({"display": "block"})
        $("#password-content").css({"display": "block"})
        $("#submit-content").css({"display": "block"})
        $("#email-content").css({"display": "block"})
        $("#otp-content").css({"display": "none"})
        $("#login-content").css({"display": "none"});
        $("#submit-btn").val('Rigister');
        $("#name").focus();
        
    }else{
        $("#otpnotmatch").css({"display": "block"})
    }

}

function resendOTP(){
    $("#resendOTP").hide()
}

function loginprocess(){
    var password=$("#password").val();
    var mobile=$("#mobile").val();
    $.post('/india/drv/login',{password:password,mobile:mobile},function(data){
        if(data=='success'){
            window.location='/india/drv'
        }else{
            $("#password").css({"background-color": "#c44630","color":"#FFF"});
            alert('Password dose not match')
        }
    });

}



 ///////End Login and Register///////



 /////////Driver Page ////////////

 ///////Handel Socket io  parameter///////
 
        var socket = io('//'+document.location.hostname+':'+document.location.port);
        socket.on('inCommingCall', function (data) {
        console.log('inCommingCall',data);
        if(data.pilotID==getCookie("pilotID")){
        setCookie("ringToneControl","ON",1);
        setCookie("inCommingCallDetails",JSON.stringify(data),1);
        circlebar();
        $("#ringtone").css({"display":"block"});
        $("#pickupFrom").text(data.pickuoAddress);
        
        }
        });

         //////////Driver Accept /////////
         function acceptRide(inp){
            
            var inCommingCallDetails=JSON.parse(getCookie("inCommingCallDetails")) ;
             console.log(inCommingCallDetails);
            $.post('/india/AcceptCallByDriver',inCommingCallDetails,function(data){
            console.log(data);
            if(data){
            setCookie("ringToneControl","OFF",1); 
            setCookie("rideBookingDetails",JSON.stringify(data),30);
            $("#ringtone").css({"display":"none"});
            alert(JSON.stringify(data))
            $("#pickDrop-Content").css({"display":"block"});
            $("#pickDrop-Content").html('<div class="pickdropHead">\
            <div class="container">\
                <div class="row pickdropHeadContainer">\
                    <div class="col-xs-12  col-sm-12 ">\
                       <div class="row">\
                         <div class="col-xs-1 col-sm-1 ">\
                            <a href="tel:100"><button type="button" class="btn btn-danger btn-xs">sos</button></a>\
             </div>\
                         <div class="col-xs-8 col-sm-8 ">\
                             <p class="text-center"><span class="label label-success ">CRN : 56556</span></p></div>\
                         <div class="col-xs-3 col-sm-3 ">\
                            <a href="tel:999"><button type="button" class="btn btn-warning btn-xs"><i class="fa fa-phone" aria-hidden="true"></i></button></a>\
                            <a href="sms:333"><button type="button" class="btn btn-warning btn-xs"><i class="fa fa-comments" aria-hidden="true"></i></button></a>\
                            </div>\
                       </div>\
                    </div>\
                </div>\
            </div>\
        </div>\
        <div class="pickdropfooter">\
                <div class="container">\
                    <div class="row pickupfootrer">\
                        <div class="col-xs-9 col-sm-9">\
                                <p>Pick up: <br> <strong>dudmfjt</strong> <br>durga</p>\
                        </div>\
                        <div class="col-xs-3 col-sm-3">\
                            <button onclick="openMap(1)" type="button" class="btn btn-info mybtn"><i class="fa fa-location-arrow" aria-hidden="true"></i></button>\
                        </div>\
                    </div>\
                    <div class="row pickupfootrer">\
                        <div class="col-xs-6 col-sm-6 col-xs-offset-3 col-sm-offset-3">\
                           <input class="pickupfootrerbtn" type="button" value="Cline Located">\
                        </div>\
                    </div>\
                </div>\
            </div>');


           
            // $("#mapVal").val(1);
            // $("#booking-no").html('Order No : '+data.ride.bookingID+'');
            // $("#callSms").html('<a href="tel:'+data.cust.isdCode+data.cust.mobileNumber+'" class="call"><i class="fa fa-phone" aria-hidden="true"></i></a>\
            // <a href="" class="call"><i class="fa fa-comments" aria-hidden="true"></i></a>');
            // $("#custName").text(data.cust.name);
            // $("#address").text(data.ride.picupaddress);
            
            
            
            
            }           
           
            });
        } 
  ///////Open Google Map///////
        function openMap(a){
            var data=JSON.parse(getCookie("rideBookingDetails")) ;
            if(a==1){
                if /* if we're on iOS, open in Apple Maps */
                ((navigator.platform.indexOf("iPhone") != -1) || 
                 (navigator.platform.indexOf("iPad") != -1) || 
                 (navigator.platform.indexOf("iPod") != -1)){
                    window.open("maps://maps.google.com/maps?daddr="+data.ride.picuklatlng[0]+","+data.ride.picuklatlng[1]+" &amp;ll=");
                 }else{
                    window.open("https://maps.google.com/maps?daddr="+data.ride.picuklatlng[0]+","+data.ride.picuklatlng[1]+"&amp;ll=");
                 } /* else use Google */
            }else{
                if(a==2){
                alert("drop")
            //     if /* if we're on iOS, open in Apple Maps */
            // ((navigator.platform.indexOf("iPhone") != -1) || 
            //  (navigator.platform.indexOf("iPad") != -1) || 
            //  (navigator.platform.indexOf("iPod") != -1)){
            //     window.open("maps://maps.google.com/maps?daddr="+data.ride.picuklatlng[0]+","+data.ride.picuklatlng[1]+" &amp;ll=");
            //  }else{
            //     window.open("https://maps.google.com/maps?daddr="+data.ride.picuklatlng[0]+","+data.ride.picuklatlng[1]+"&amp;ll=");
            //  } /* else use Google */
            }
        }
            
            }
 
 