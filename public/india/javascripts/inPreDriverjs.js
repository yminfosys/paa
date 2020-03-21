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
        $.post('/india/preDrv/checkMobileExist',{mobile:mobile},function(data){
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
    $.post('/india/preDrv/login',{password:password,mobile:mobile},function(data){
        if(data=='success'){
            window.location='/india/Predrv'
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
  socket.on('preRideinCommingCall', function (data) {
  console.log('inCommingCall',data);
  console.log("test data",data.pilotID)
  if(data.pilotID==getCookie("pilotID")){
  setCookie("ringToneControl","ON",1);
  //setCookie("preRideinCommingCallDetails",JSON.stringify(data),1);
  $.post('/india/preRideAutoAccepeCall',{
    pilotID:data.pilotID,
    CustID:data.CustID,
    pickuoAddress:data.pickuoAddress,
    bookingID:data.bookingID,
    driverBusy:data.driverBusy,
    
  },function(dat){
      ////Check existing call////
      $.post('/india/existingPrerideCall',{pilotID:dat.pilotID,driverBusy:"busy"},function(rides){
        console.log("Ride Details",rides)
        var out="";
        rides.forEach(function(val,indx,ar){
            out+='<div class="row listItem">\
            <div class="col-xs-9 col-sm-9 ">\
            <p class="prerideName">Pickup : '+val.name+'</p>\
                <p class="prerideads">'+val.picupaddress+'</p>\
                </div>\
            <div class="col-xs-3 col-sm-3">\
            <input id="geoNav" type="hidden">\
                <button onclick="openMap()" type="button" class="btn btn-info mybtn"><i class="fa fa-location-arrow" aria-hidden="true"></i></button>\
            </div>\
            <div class="col-xs-9 col-sm-9">\
                <input onclick="clineLocated()" id="clineLocated" class="pickupPreridebtn" type="button" value="Cline Located">\
                <input onclick="startRide()" id="startRide" class="pickupPreridebtn" type="button" value="Start Ride">\
                <input onclick="finishride()" id="finishride" class="pickupPreridebtn" type="button" value="Finish Ride">\
            </div>\
            <div class="col-xs-3 col-sm-3 telmsg">\
                <a href="tel:'+val.isdCode+val.mobileNumber+'"><button type="button" class="btn btn-warning btn-xs"><i class="fa fa-phone" aria-hidden="true"></i></button></a>\
                <a href="sms:'+val.isdCode+val.mobileNumber+'"><button type="button" class="btn btn-warning btn-xs"><i class="fa fa-comments" aria-hidden="true"></i></button></a>\
            </div>\
            </div>';

            if(indx===ar.length -1){
               
                $("#rideList").html(out);
            }
        });

      });
   

  });
  }
  });

 
