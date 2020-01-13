$(document).ready(function(){
    $('ul.tabs li').click(function(){
      var tab_id = $(this).attr('data-tab');

      $('ul.tabs li').removeClass('current');
      $('.tab-content').removeClass('current');

      $(this).addClass('current');
      $("#"+tab_id).addClass('current');
    });
  });

  function findDriver(){
    var mobile=$("#mobile").val();
    var isd='+91';
    $.post('/admin/findDriver',{mobile:mobile,isd:isd},function(data){
        if(data!='worng'){
          //alert(data) 
          $("#Driver-search").css({"display":"none"});
          $("#verify-driver").css({"display":"block"});
          $(".user-data").html('<h2>'+data.name+'</h2>\
          <span  class="post-label">Account ID : '+data.mobileNumber+'</span><br>\
          <input id="AccountID" type="hidden" value="'+data.mobileNumber+'">\
          <span class="post-label">Status : '+data.accountStatus+'</span><br>\
          <i class="fa fa-map-marker" aria-hidden="true"></i>  '+data.address+'</p>')

        }else{
            $("#mobile").css({"background-color": "#c44630","color":"#FFF"});
        }
    });
  }

  function verifyDriver(){
    var mobile=$("#AccountID").val();
    var isd='+91';
    $.post('/admin/verifyDriver',{mobile:mobile,isd:isd},function(data){
        if(data!='worng'){
            //alert(data) 
            $("#Driver-search").css({"display":"none"});
            $("#verify-driver").css({"display":"block"});
            $(".user-data").html('<h2>'+data.name+'</h2>\
            <span id="AccountID" class="post-label">Account ID : '+data.mobileNumber+'</span><br>\
            <span class="post-label">Status : '+data.accountStatus+'</span><br>\
            <i class="fa fa-map-marker" aria-hidden="true"></i>  '+data.address+'</p>')
  
          }else{
              $("#mobile").css({"background-color": "#c44630","color":"#FFF"});
          }
    })   
  }