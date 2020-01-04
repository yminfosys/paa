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
        //alert(otp)
        $("#mobile").css({"color":"green"});
        ////////Check Mobile No Exist in our System/////
        $.post('/india/checkMobileExist',{mobile:mobile},function(data){
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
                $.post('/india/otpSend',{mobile:mobile,otp:otp},function(data){
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
    $.post('/india/login',{password:password,mobile:mobile},function(data){
        if(data=='success'){
            window.location='/india'
        }else{
            $("#password").css({"background-color": "#c44630","color":"#FFF"});
            alert('Password dose not match')
        }
    });

}



 ///////End Login and Register///////
 
 
 ///////////////////////////////////////////////////
 ///////////////Main Customer Page/////////////////
 //////////////////////////////////////////////////
 function CloseAll(div){  
    $("#"+div+"").css({"display":"none"})
    CenterChange='Enable';
    }
////////CAll pickup placesearch content//////
    function pickupsearch(a){
  
        $("#placesearch").css({"display":"Block"});        
        $("#searchPlace").focus()
        $("#searchPlace").val("")
        $("#placeList").html('<a onclick="CloseAll(\'placesearch\')" class="list-group-item active"><i class="fa fa-map-marker" aria-hidden="true"></i></span> &nbsp; Select From Map</a>');
        $(".searchGif").css({"display":"none"});
        
        }

        function searchdown(){
            clearTimeout(timerr)
            $(".searchGif").css({"display":"none"});
            
          }
          var out;
          function searchup(){
            $(".searchGif").css({"display":"none"});
            clearTimeout(timerr)
            $(".searchGif").css({"display":"block"});
            timerr=setTimeout(function(){
              var quary=$("#searchPlace").val();
              var origin=JSON.parse(getCookie("pickuplatlong")) ;
              var location=''+origin.lat+' ,'+origin.lng+'';
              out='<a onclick="CloseAll(\'placesearch\')" class="list-group-item active"><i class="fa fa-map-marker" aria-hidden="true"></i></span> &nbsp; Select From Map</a>'
              $.post('/india/placesearch',{quary:quary,location:location},function(data){ 
                     
                if(data.status=='OK'){
                data.predictions.forEach(function(val,indx){ 
                 out+='<a id="abc" class="list-group-item searchItem"> '+val.description+'</a>      '
                ///{lat:'+val.geometry.location.lat+', lng:'+val.geometry.location.lng+'}
                })
                $("#placeList").html(out);
                $(".searchGif").css({"display":"none"});
                
              }else{
                
                out+='<a  class="list-group-item"> <img class="imgIcon"  src="/images/not-found.png"></span> Address not Found</a>      '
                $("#placeList").html(out);
                $(".searchGif").css({"display":"none"});
              }
              });
            },1000)
          } 
 
          
    // ////////// Travelmode time calculation///////
    function AlldrivingModeNearestTime(){ 
        var j=0;
        var travelmod=$("#ModeofTravel").val();
        var pickup=JSON.parse(getCookie("pickuplatlong")) ;
        $.each($(".modeImg"),function(i){
            j=i+1;
            if(travelmod!=j){
              $.post('/india/nearbytime',{
                lat:pickup.lat,
                lng:pickup.lng,
                travelmod:j
               },function(resul){
                //alert(resul.data.length) 
               if(resul.data.length>0){
                //////// Call time distance/////
                var orig=''+Number(pickup.lat)+','+Number(pickup.lng)+'';
                var diste=''+Number(resul.data[0].location.coordinates[1])+','+Number( resul.data[0].location.coordinates[0])+'';
                $.post('/india/distbtwntime',{orig:orig,diste:diste,count:resul.count},function(outp){
                     //alert(outp.rows[0].elements[0].duration.text)
                  $("#timee"+outp.count+"").css({"display":"block"}); 
                  $("#timee"+outp.count+"").text(outp.data.rows[0].elements[0].duration.text)   
                  $("#gif"+outp.count+"").css({"display":"none"});
                    });        
               }else{
               ////////
               //alert(resul.count)
               $("#timee"+resul.count+"").css({"display":"none"});
               $("#gif"+resul.count+"").css({"display":"block"});
               
               }
              }); 
    
            }
            
        });
          
          
      }

          
            //////////Change Travel Mode//////
  function changeModeofTravel(tm){
    $("#ModeofTravel").val(tm);
    $("#modeImg"+tm+"").css({"border": "4px solid rgb(42, 204, 36)"});
    AlldrivingModeNearestTime();    
    for(var i=0; i<10; i++){
      if(i!=tm){
        $("#modeImg"+i+"").css({"border": "1px solid #000"})
      }
    }
    };


        
 
            
        
  ///////////////////////////////////////////////////
 ///////////////End Main Customer Page/////////////////
 //////////////////////////////////////////////////

