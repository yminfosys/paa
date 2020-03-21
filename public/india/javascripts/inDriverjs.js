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
        //////Run Timer for 15sec///////
         setTimeout(function(){
         $("#ringtone").css({"display":"none"});
         $("#pickupFrom").text('');
         setCookie("ringToneControl","OFF",1);
         setCookie("inCommingCallDetails"," ",1);
         },14*1000);
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
            $("#pickDrop-Content").css({"display":"block"});
            $("#orderNO").text(data.ride.bookingID);
            $("#telsms").html('<a href="tel:'+data.cust.isdCode+data.cust.mobileNumber+'"><button type="button" class="btn btn-warning btn-xs"><i class="fa fa-phone" aria-hidden="true"></i></button></a>\
            <a href="sms:'+data.cust.isdCode+data.cust.mobileNumber+'"><button type="button" class="btn btn-warning btn-xs"><i class="fa fa-comments" aria-hidden="true"></i></button></a>');
            $("#address").html('<p>Pick up: <br> <strong>'+data.cust.name+'</strong> <br>'+data.ride.picupaddress+'</p>');
            $("#geoNav").val(1); 
            $("#clineLocated").css({"display":"block"});       
            }           
           
            });
        } 
  ///////Open Google Map///////
        function openMap(){
            var a =$("#geoNav").val(); 
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
               // alert("drop")
                if /* if we're on iOS, open in Apple Maps */
            ((navigator.platform.indexOf("iPhone") != -1) || 
             (navigator.platform.indexOf("iPad") != -1) || 
             (navigator.platform.indexOf("iPod") != -1)){
                window.open("maps://maps.google.com/maps?daddr="+data.ride.droplatlng[0]+","+data.ride.droplatlng[1]+" &amp;ll=");
             }else{
                window.open("https://maps.google.com/maps?daddr="+data.ride.droplatlng[0]+","+data.ride.droplatlng[1]+"&amp;ll=");
             } /* else use Google */
            }
        }
            
     }


     ////////// On Cline Clocated/////////
     function clineLocated(){
            var data=JSON.parse(getCookie("rideBookingDetails"));
            console.log(data)
            $.post('/india/drv/clinelocated',{CustID:data.cust.CustID},function(respon){
            console.log("respon",respon)
                if(respon){                    
                    $("#clineLocated").css({"display":"none"});
                    $("#startRide").css({"display":"block"});
                }

            });
            }
            
     function otpinput(){        
         var valu=$("#otpp").val()
        if(valu.length >3){
            var data=JSON.parse(getCookie("rideBookingDetails"));
            if(data.RideOTP==valu){
                $.post('/india/drv/startRide',{CustID:data.cust.CustID},function(respon){
                    console.log("respon",respon)
                        if(respon){
                            $("#address").html('<p>Drop To: <br> <strong>'+data.cust.name+'</strong> <br>'+data.ride.dropaddress+'</p>');
                            $("#geoNav").val(2);
                            $("#OTP-Content").css({"display":"none"});
                            $("#startRide").css({"display":"none"});
                            $("#finishride").css({"display":"block"});
                            $("#otpp").val("");
                            openMap();    
                           
                        }
        
                    });
                
            }else{
                $("#otpp").css({"background-color": "#df0d0d","color": "#FFF" })
            }
        }
     }  
 /////////Start Ride ////////
    function startRide(){     
        $("#OTP-Content").css({"display":"block"});
    }
 ////////Finish Ride///////   
 function finishride(){
    var data=JSON.parse(getCookie("rideBookingDetails"));
    console.log("finisf data",data)
    //alert(data.ride.picuklatlng[0])    
        $.post('/india/drv/finishRide',{
            CustID:data.cust.CustID,
            bookingID:data.ride.bookingID,
            picuklat:data.ride.picuklatlng[0], 
            picuklng:data.ride.picuklatlng[1]
            
        },function(respon){
            console.log("respon",respon)
                if(respon){ 
                    
                    $("#pickDrop-Content").css({"display":"none"});
                    $("#billAndfeedback").css({"display":"block"});                  
                    $("#OTP-Content").css({"display":"none"});
                    $("#startRide").css({"display":"none"});
                    $("#finishride").css({"display":"none"});
                    $("#pickdropfooter").css({"display":"none"});
                    $("#pickdropHead").css({"display":"none"});
                    $("#amt").text(respon.billAmount)
                }

            });
        
}

