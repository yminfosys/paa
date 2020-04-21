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
  socket.on('refreshPreRideList', function (data) {
  console.log('inCommingCall',data);
  console.log("test data",data.pilotID)
  if(data.pilotID==getCookie("pilotID")){

      ////Check existing call////
      $.post('/india/existingPrerideCall',{pilotID:data.pilotID,driverBusy:data.driverBusy},function(rides){
        console.log("Ride Details",rides)
        var out="";
        var addressPart="";
        var btnPart="";
        var smalest=0;
        var smalIndx=0
        rides.forEach(function(val,indx,ar){
            if(indx==0){
                smalest=val.bookingID;
                smalIndx=indx;
            }else{
                if(smalest > val.bookingID){
                    smalest=val.bookingID;
                    smalIndx=indx;
                }                

            }

            ////////check callbookingStatus ///////

            if(val.callbookingStatus=="clineLocate"){
                addressPart='<div id="listItem'+indx+'" class="row listItem">\
                <div id="nameAds'+indx+'" class="col-xs-9 col-sm-9">\
                <p class="prerideName"><span>Order ID: '+val.bookingID+'</span><br>Pickup Form : '+val.name+'</p>\
                    <p class="prerideads">'+val.picupaddress+'</p>\
                </div>\
                <div id="mapBtn'+indx+'" class="col-xs-3 col-sm-3">\
                    <button id="mapBtn" onclick="googlemapbtn(\'' + 1 + '\',\'' + val.picuklatlng + '\')" type="button" class="btn btn-info mybtn"><i class="fa fa-location-arrow" aria-hidden="true"></i></button>\
                </div>';
                btnPart='<input onclick="clineLocated(\''+indx+'\')" id="clineLocated'+indx+'" class="pickupPreridebtn1" type="button" value="Cline Located">\
                <input onclick="startRide(\''+indx+'\')" id="startRide'+indx+'" class="pickupPreridebtn" type="button" value="Start Ride">\
                <input onclick="finishride(\''+indx+'\')" id="finishride'+indx+'" class="pickupPreridebtn1" type="button" value="Finish Ride">';
              
              }else{
                if(val.callbookingStatus=="startRide"){
                  addressPart='<div id="listItem'+indx+'" class="row listItem">\
                  <div id="nameAds'+indx+'" class="col-xs-9 col-sm-9">\
                  <p class="prerideName"><span>Order ID: '+val.bookingID+'</span><br>Drop To : '+val.name+'</p>\
                      <p class="prerideads">'+val.dropaddress+'</p>\
                  </div>\
                  <div id="mapBtn'+indx+'" class="col-xs-3 col-sm-3">\
                      <button id="mapBtn" onclick="googlemapbtn(\'' + 2 + '\',\'' + val.droplatlng + '\')" type="button" class="btn btn-info mybtn"><i class="fa fa-location-arrow" aria-hidden="true"></i></button>\
                  </div>';
                  btnPart='<input onclick="clineLocated(\''+indx+'\')" id="clineLocated'+indx+'" class="pickupPreridebtn1" type="button" value="Cline Located">\
                  <input onclick="startRide(\''+indx+'\')" id="startRide'+indx+'" class="pickupPreridebtn1" type="button" value="Start Ride">\
                  <input onclick="finishride(\''+indx+'\')" id="finishride'+indx+'" class="pickupPreridebtn" type="button" value="Finish Ride">';
                  
                }else{
                  addressPart='<div id="listItem'+indx+'" class="row listItem">\
                  <div id="nameAds'+indx+'" class="col-xs-9 col-sm-9">\
                  <p class="prerideName"><span>Order ID: '+val.bookingID+'</span><br>Pickup Form : '+val.name+'</p>\
                      <p class="prerideads">'+val.picupaddress+'</p>\
                  </div>\
                  <div id="mapBtn'+indx+'" class="col-xs-3 col-sm-3">\
                      <button id="mapBtn" onclick="googlemapbtn(\'' + 1 + '\',\'' + val.picuklatlng + '\')" type="button" class="btn btn-info mybtn"><i class="fa fa-location-arrow" aria-hidden="true"></i></button>\
                  </div>';
                  btnPart='<input onclick="clineLocated(\''+indx+'\')" id="clineLocated'+indx+'" class="pickupPreridebtn" type="button" value="Cline Located">\
                  <input onclick="startRide(\''+indx+'\')" id="startRide'+indx+'" class="pickupPreridebtn1" type="button" value="Start Ride">\
                  <input onclick="finishride(\''+indx+'\')" id="finishride'+indx+'" class="pickupPreridebtn1" type="button" value="Finish Ride">';
                }
  
              }
          
              out+=''+addressPart+'<div class="col-xs-9 col-sm-9">\
              <input type="hidden" id="preRideOTP'+indx+'" value="'+val.preRideOTP+'">\
              <input type="hidden" id="CustID'+indx+'" value="'+val.CustID+'">\
              <input type="hidden" id="pilotID'+indx+'" value="'+val.pilotID+'">\
              <input type="hidden" id="droplatlng'+indx+'" value="'+val.droplatlng+'">\
              <input type="hidden" id="picuklatlng'+indx+'" value="'+val.picuklatlng+'">\
              <input type="hidden" id="dropaddress'+indx+'" value="'+val.dropaddress+'">\
              <input type="hidden" id="name'+indx+'" value="'+val.name+'">\
              <input type="hidden" id="bookingID'+indx+'" value="'+val.bookingID+'">\
              '+btnPart+'\
              </div>\
              <div class="col-xs-3 col-sm-3 telmsg">\
                  <a href="tel:'+val.isdCode+val.mobileNumber+'"><button type="button" class="btn btn-warning btn-xs"><i class="fa fa-phone" aria-hidden="true"></i></button></a>\
                  <a href="sms:'+val.isdCode+val.mobileNumber+'"><button type="button" class="btn btn-warning btn-xs"><i class="fa fa-comments" aria-hidden="true"></i></button></a>\
              </div>\
              </div>';

            if(indx===ar.length -1){
               
                $("#rideList").html(out);
                $("#listItem"+smalIndx+"").css({"background-color":"#91bb2f"})

            }
        });

      });
   

  
  }
  });


  ///////Google Map BTN //////////
  function googlemapbtn(a,b){
      var lanlng=[b];
     console.log("picuklatlng",lanlng)
    if(a==1){
        if /* if we're on iOS, open in Apple Maps */
        ((navigator.platform.indexOf("iPhone") != -1) || 
         (navigator.platform.indexOf("iPad") != -1) || 
         (navigator.platform.indexOf("iPod") != -1)){
            window.open("maps://maps.google.com/maps?daddr="+lanlng[0]+","+lanlng[1]+", &amp;ll=");
         }else{
            window.open("https://maps.google.com/maps?daddr="+lanlng[0]+","+lanlng[1]+"&amp;ll=");
         } /* else use Google */
    }else{
        if(a==2){
       // alert("drop")
        if /* if we're on iOS, open in Apple Maps */
    ((navigator.platform.indexOf("iPhone") != -1) || 
     (navigator.platform.indexOf("iPad") != -1) || 
     (navigator.platform.indexOf("iPod") != -1)){
        window.open("maps://maps.google.com/maps?daddr="+lanlng[0]+","+lanlng[1]+" &amp;ll=");
     }else{
        window.open("https://maps.google.com/maps?daddr="+lanlng[0]+","+lanlng[1]+"&amp;ll=");
     } /* else use Google */
    }
  }
}
 

////////// On Cline Clocated/////////
function clineLocated(indx){
    var CustID=$("#CustID"+indx+"").val(); 
    var bookingID=$("#bookingID"+indx+"").val();   
    $.post('/india/preRideClinelocated',{CustID:CustID,bookingID:bookingID},function(respon){
    console.log("respon",respon)
        if(respon){                    
            $("#clineLocated"+indx+"").css({"display":"none"});
            $("#startRide"+indx+"").css({"display":"block"});
            $("#listItem"+indx+"").css({"background-color":"#91bb2f"})
        }

    });
}

/////////Start Ride ////////
function startRide(indx){        
    var OTP=$("#preRideOTP"+indx+"").val();   
    $("#OTP-Content").css({"display":"block"});
    $("#OTP-Content").html('<h3>Enter OTP</h3>\
    <input type="number" onkeyup="otpinput(\''+OTP+'\',\''+indx+'\')" id="otpp" maxlength="4" >')
}

function otpinput(otp,indx){         
    var valu=$("#otpp").val()
    var CustID=$("#CustID"+indx+"").val(); 
    var bookingID=$("#bookingID"+indx+"").val();
    var name=$("#name"+indx+"").val();
    var dropaddress=$("#dropaddress"+indx+"").val();
    var droplatlng=$("#droplatlng"+indx+"").val();
   if(valu.length >3){       
       if(otp==valu){
           $.post('/india/preRideStartRide',{CustID:CustID,bookingID:bookingID},function(responce){
                if(responce){
                    $("#OTP-Content").css({"display":"none"});
                    $("#startRide"+indx+"").css({"display":"none"});
                    $("#finishride"+indx+"").css({"display":"block"});
                    $("#mapBtn"+indx+"").html('<button id="mapBtn" onclick="googlemapbtn(\'' + 2 + '\',\'' + droplatlng + '\')" type="button" class="btn btn-info mybtn"><i class="fa fa-location-arrow" aria-hidden="true"></i></button>')
                    $("#nameAds"+indx+"").html('<p class="prerideName">Drop To : '+name+'</p>\
                    <p class="prerideads">'+dropaddress+'</p>');                    
                    googlemapbtn(2,droplatlng);
                }
           })
       }else{
        $("#otpp").css({"background-color": "#df0d0d","color": "#FFF" })
       }
    }
}


////////Finish Ride///////   
function finishride(indx){
    var CustID=$("#CustID"+indx+"").val(); 
    var bookingID=$("#bookingID"+indx+"").val();
    var picuklatlng=$("#picuklatlng"+indx+"").val();
    picuklatlng=picuklatlng.split(",");
    
        $.post('/india/preRideFinish',{
            CustID:CustID,
            bookingID:bookingID,
            picuklat:picuklatlng[0], 
            picuklng:picuklatlng[1]
            
        },function(respon){
            console.log("respon",respon)
                if(respon){ 
                    
                   // $("#pickDrop-Content").css({"display":"none"});
                   $("#listItem"+indx+"").css({"display":"none"})
                    $("#billAndfeedback").css({"display":"block"});                  
                    $("#OTP-Content").css({"display":"none"});
                    $("#startRide"+indx+"").css({"display":"none"});
                    $("#finishride"+indx+"").css({"display":"none"});
                    //$("#pickdropfooter"+indx+"").css({"display":"none"});
                    //$("#pickdropHead"+indx+"").css({"display":"none"});
                    $("#amt").text(respon.billAmount)
                    $("#bookingIDFinish").val(bookingID);
                }

            });
        
}

///////Pre Ride Cash Collection/////////////



