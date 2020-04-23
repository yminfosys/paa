var express = require('express');
var router = express.Router();
var googleApi=require('../module/googleMap');
var database=require('../module/database');
const fileUpload = require('express-fileupload');
const bcrypt = require('bcrypt');
const saltRounds = 10;

const paytm = require('paytm-nodejs')
 
const config = {
    MID : 'hqfetl86344029798463', // Get this from Paytm console
    KEY : 'iXGHAlR9d3Tuju1w', // Get this from Paytm console
    ENV : 'prod', // 'dev' for development, 'prod' for production
    CHANNEL_ID : 'WAP',
    INDUSTRY : 'Retail',  
    WEBSITE : 'DEFAULT',
    CALLBACK_URL : 'https://paacab.com/india/paytm',  // webhook url for verifying payment
}


/////Testing OTP credentials are as follows: 
//Mobile Number: 7777777777. 
//Password: Paytm12345. 
///OTP: 489871.///


const moment = require('moment');


router.use(fileUpload({
 
  useTempFiles : true,
    tempFileDir : '/tmp/'
}));

///////////////////////////////////////
///* CUSTOMER LISTING. *///////////////
///////////////////////////////////////

router.get('/', function(req, res, next) { 
  //res.clearCookie("CustID");
  if(req.cookies.CustID){ 
    database.customer.findOne({CustID:req.cookies.CustID},function(err,data){
      if(data){
        console.log(data)
        //////Check Any Incomplete Order//////
        if(data.orderStage=='accept'||data.orderStage=='startRide'||data.orderStage=='finishRide'){
          res.redirect('/india/ride')
        }else{
          res.render('india/inCust',{YOUR_API_KEY:process.env.API_KEY,error:'',cust:data})
        }

      }else{
        res.render('india/inCust',{YOUR_API_KEY:process.env.API_KEY,error:'cookes'})
      }
    });   
    
  }else{
    res.redirect('/india/login')
  }
  
});

  ////////// SELECT SERVICE MODE////////
  router.get('/servecemode', function(req, res, next) {
    if(req.cookies.CustID){ 
    res.render('india/servecemode')
    }else{
      res.redirect('/india/login')
    }
   })

///////Login Customer listing////////
router.get('/login', function(req, res, next) {
  if(req.cookies.CustID){
    
    res.redirect('/india')
  }else{
    res.render('india/inCustLogin',{msg:req.query.msg,lat:req.query.lat,lng:req.query.lng})
  }
  
});

///////Login Customer////////
router.post('/login', function(req, res, next) {
  database.customer.findOne({mobileNumber:req.body.mobile},function(err,user){
    if(user){
    bcrypt.compare(req.body.password, user.password, function(err, pass) {
       console.log(pass)
         if(pass){
          res.cookie("CustID", user.CustID, {maxAge: 30*24*60*60*1000 });        
          res.send('success');
         }else{
           //////Worng Password//////
           res.send('worngpassword')
         }
         });
        }
      });
  });

///////////Check Mobile in our system////////////
router.post('/checkMobileExist', function(req, res, next) {
  console.log(req.body)
  database.customer.findOne({mobileNumber:req.body.mobile,isdCode:'+91'},function(err,data){
    console.log(data)
    if(data){

      res.send('exist');
    }else{
      res.send('notexist');
    }
  });
  
});

///////////OTP////////////
router.post('/otpSend', function(req, res, next) {
//   googleApi.otpsend({  
//   apikey : 'mWdlAOiE5nY-dlNUZ6linXXcgKhTCMq1MzoQJPAerf',
//   message : 'Your One Time Password : '+req.body.otp+' to very PaaCab. Kindly do not share with anyone.',
//   numbers : req.body.mobile,
//   sender : 'TXTLCL'
// },function(data){
// console.log(data);
// res.send(data);
// })

res.send({status: 'success'})
});

///////Register New Customer////////
router.post('/custReg', function(req, res, next) {
  bcrypt.hash(req.body.password, saltRounds, function(err, hash) {
    database.customer({
      name: req.body.name,
      email :req.body.email,    
      password: hash,    
      mobileNumber:req.body.mobile,
      custRating:'0',
      isdCode:'+91',
      generalMinimumKm:[2, 2, 2, 2],
      preRidePriceperKm:[3, null, null, null],
      preRideperMinutCharge:[0.5, 0.75, 1, 1.25 ],
      GenarelPerMinutCharge:[1.5, 1.75, 2, 2.5],
      generalPriceperKm:[8, 10, 15, 20],
      generalMinimumprice:[13, 40, 90, 90],
      generalBasePrice:[0, 30, 90, 90],
      driverPayout:[6, 8, 9, 10],
      shareRide:[0, 0, 0, 0],
      shereRideCapacity:[0, 0, 0, 0],
      walletBalance:'0',
      BuyKM:'5',
      location:{type:'Point',coordinates:[req.body.lng, req.body.lat]}
      //location:{type:'Point',coordinates:[1.00001, 1.0001]}
    }).save(function(err){
      
      res.redirect('/india/login?msg=Registration Success');
        }); 
    }); 

  });

////////Logout /////////////
  router.get('/logout/cust', function(req, res, next) {
    res.clearCookie("CustID");
    res.redirect('../../cust')
      
  });
  ///////Map Api Call//////////////

  /////find Place By Lat Lng////////
  router.post('/geoplace', function(req, res, next) {  //
    googleApi.SearchGeoCodePlaceByLatLng({
      lat:Number(req.body.lat),
      lng:Number(req.body.lng),
      apik:process.env.API_KEY,
   },function(data){
    res.send(data)
//console.log(data.results[0]);
  // data.results[0].address_components.forEach(function(val){
  //   //console.log(val.types[0]); 
  //   if(val.types[0]=='country'){
  //     console.log(val.long_name);
  //     res.send(val.long_name); 
  //   }
  //     })
   });
  });

  /////For Neareast One Calculation //////
router.post('/nearby', function(req, res, next) {
  console.log('myposition',req.body)
  database.index2Ddriver({},function(ss){
    database.driverlocation.find({
          location: {
            $near: {
              $geometry: {
                 type: "Point" ,
                 coordinates: [ Number(req.body.lng), Number(req.body.lat) ]
              },$maxDistance : 4000
            }
          },accountStatus:'Active',travelmod:req.body.travelmod
        },function(e,data){
        console.log('test nearby',JSON.stringify(data) );
          res.send(data);
        })
  });

});






  



/////For Neareast One Calculation //////
router.post('/nearbytime', function(req, res, next) {
  console.log('myposition',req.body)
  database.index2Ddriver({},function(ss){
    database.driverlocation.find({
          location: {
            $near: {
              $geometry: {
                 type: "Point" ,
                 coordinates: [ Number(req.body.lng), Number(req.body.lat) ]
              },$maxDistance :4000
            }
          },accountStatus:'Active',travelmod:req.body.travelmod
        },function(e,data){
        console.log('test result',JSON.stringify(data) );
          res.send({data:data,count:req.body.travelmod});
        })
  });

});

/////////Place Search using Autocomplete/////

router.post('/placesearch', function(req, res, next) {
  googleApi.autocomplete({
  quary:req.body.quary,
  location:req.body.location,
  radius:'1000',
  apik:process.env.API_KEY
},function(result){
  
  res.send(result)

});

});


router.post('/placeidtogeocod', function(req, res, next) {
  googleApi.placeByplaceID({
    placeid:req.body.placeid,
  apik:process.env.API_KEY
},function(result){
  console.log(JSON.stringify(result) )
  res.send(result)
  //console.log(result.results[0])
});

});

/////For Distance Calculation //////
router.post('/distbtwnActive', function(req, res, next) {
  googleApi.distance({
    origins:req.body.orig,
    destinations:req.body.diste,
    apik:process.env.API_KEY,
    travelmod:req.body.travelmod
},function(result){
  //console.log(JSON.stringify(result) )
  res.send(result)
  //console.log(result)
});

});

router.post('/distbtwntime', function(req, res, next) {
  googleApi.distance({
    origins:req.body.orig,
    destinations:req.body.diste,
    apik:process.env.API_KEY,
    travelmod:req.body.travelmod
},function(result){
  //console.log(JSON.stringify(result) )
  res.send({data:result,count:req.body.count})
});

});

///// distance and Price calculation //////
router.post('/getDistance', function(req, res, next) {
  googleApi.distance({
    origins:req.body.orig,
    destinations:req.body.diste,
    apik:process.env.API_KEY,
    travelmod:req.body.travelmod
},function(result){
  //console.log(JSON.stringify(result) )
  res.send({result:result,travelmod:req.body.travelmod})
  //console.log('Result',result.rows[0].elements[0].distance.value);
  
});

});

router.post('/getprice', function(req, res, next) { 
      var key=Number(req.body.travelmod)-1;
      var price=0;
      database.customer.findOne({CustID:req.cookies.CustID},function(er,cust){ 
        console.log("customer data", cust)  
        console.log("req.body", req.body)      
        if(Number(req.body.distance) <= Number(cust.generalMinimumKm[key])){
          price=Number(cust.generalMinimumprice[key]) + Number(cust.generalBasePrice[key]);
        }else{
          var dist=Number(req.body.distance) - Number(cust.generalMinimumKm[key]);
         price= (Number(dist) * Number(cust.generalPriceperKm[key])) + (Number(cust.generalMinimumprice[key])+ Number(cust.generalBasePrice[key])) 
        }
        res.send({price:price,travelmod:req.body.travelmod,preRidePrice:cust.preRidePriceperKm,shereRideCapacity:cust.shereRideCapacity});
        });
});

/////For Neareast RideBooking//////
router.post('/nearbyRideBooking', function(req, res, next) {    
  database.index2Ddriver({},function(ss){
    database.driverLocationArea.find({
          location: {
            $near: {
              $geometry: {
                 type: "Point" ,
                 coordinates: [ Number(req.body.lng), Number(req.body.lat) ]
              },$maxDistance : 4000
            }
          },accountStatus:'Active',travelmod:req.body.travelmod,DriverType:req.body.DriverType
        },function(e,data){
        database.rideCounter.findOne({},function(e, d){
          if(d){
            var newId=Number(d.bookingID)+1;
            database.rideCounter.findOneAndUpdate({bookingID:d.bookingID},{$set:{bookingID:newId}},function(e, dd){
              res.send({drivers:data,bookingID:newId}); 
            })
          }else{
            database.rideCounter({bookingID:1}).save(function(er){
              res.send({drivers:data,bookingID:1});
            });
          }
        });
          
        })
  });

});

////////Call Driver Requiest notification/////
router.post('/CallDriver', function(req, res, next) {  
res.io.emit("inCommingCall",{pilotID:req.body.pilotID,CustID:req.body.CustID,pickuoAddress:req.body.pickuoAddress,bookingID:req.body.bookingID});
res.send('ReqEmited');
});


////////Create New Ride Booking/////
router.post('/newRideBooking', function(req, res, next) {  
console.log(req.body)
  database.ride({
    bookingID:req.body.bookingID,   
    CustID:req.body.CustID,
    picupaddress:req.body.originAds,
    picuklatlng: [req.body.originLat, req.body.originLng],    
    dropaddress:req.body.distAds,     
    droplatlng:[req.body.distLat, req.body.distLng],        
    kmtravels:req.body.totalDistance,
    totalamount:req.body.totalAmt,
    paymentBy:req.body.payMode,
    discount:"",
    driverpayout:"",
    driverIncentiv:"",
    callbookingStatus:"waiting"
  }).save(function(err){
    
    res.send("new Booking Created");
  });
  });  


  ///////Update Demand Location /////
  router.post('/updateDemndLocation', function(req, res, next) {  
    database.demandArea.findOne({CustID:req.cookies.CustID},function(e,data){
      if(data){
        database.demandArea.findOneAndUpdate({CustID:req.cookies.CustID},{$set:{location:{type:'Point',coordinates:[req.body.lng, req.body.lat]}}},function(e,d){
          deleteDemand(req.cookies.CustID);
          res.send("demand Update")
        
        });
      }else{
        database.demandArea({
          CustID:req.cookies.CustID,
          location:{type:'Point',coordinates:[req.body.lng, req.body.lat]}
        }).save(function(er){
          res.send("demand location save")
        });
      }
    });
  });

  //DELETE ALL DEMAND /////////
  var deleteDemandTimer;
  function deleteDemand(CustID){ 
    clearTimeout(deleteDemandTimer);   
    deleteDemandTimer=setTimeout(function(){
        database.demandArea.deleteMany({CustID:CustID},function(e, d){
          console.log("Reset Demand")
        });
      }, 1000*60*5);
  

    
  }
  
  

///////////////////////////////////////
///* END CUSTOMER LISTING. *///////////
///////////////////////////////////////

///////////////////////////////////////
///* RIDE PAGE LISTING. *///////////
///////////////////////////////////////


  /////Listin Cust Ride Conform//////    
    router.get('/ride', function(req, res, next) {
      if(req.cookies.CustID){         
        database.customer.findOne({CustID:req.cookies.CustID},function(err,cust){     
        res.render('india/inCustRideConfrm',{YOUR_API_KEY:process.env.API_KEY,orderStage:cust.orderStage,bookingID:cust.bookingID})
        })
      }else{
        res.redirect('/india/login')
      }
      
    });

  
////////Call Driver Requiest notification/////
router.post('/rideDriverBookingDetails', function(req, res, next) { 
  database.ride.findOne({bookingID:req.body.bookingID},function(err,ride){
    if(ride){
      database.pilot.findOne({pilotID:ride.pilotID},function(err,driver){
        res.send({driver:driver,ride:ride});
      });
    }
  });
});

////////getDriverposition/////
router.post('/getDriverposition', function(req, res, next) {
  database.driverlocation.findOne({pilotID:req.body.pilotID},function(err,driver){
    if(driver){
        console.log(driver.location.coordinates);
        res.send(driver.location.coordinates);
    }
   
  }); 
 
});


  ////////// getFinalBooking For Billing //////
  router.post('/getFinishBooking', function(req, res, next) {
    database.ride.findOne({bookingID:req.body.bookingID},function(e,data){
      res.send(data);
    });
    });

 //////////setAllNormalandFinished //////
 router.post('/setAllNormalandFinished', function(req, res, next) {
  database.customer.findOneAndUpdate({CustID:req.cookies.CustID},{$set:{orderStage:"",bookingID:""}},function(er,data){
   res.clearCookie("orderCreated");
    res.send("ok")
  });
  });   

    
    
  ///////////////////////////////////////
///* END RIDE PAGE LISTING. *///////////
///////////////////////////////////////


///////////////////////////////////////
///* DRIVER LISTING. *///////////////
///////////////////////////////////////
router.get('/drv', function(req, res, next) {
  //res.send('respond with a resource I am INDIA');
  if(req.cookies.pilotID){
    database.pilot.findOne({completereg:'done',pilotID:req.cookies.pilotID},function(err,data){
      console.log(req.cookies.pilotID)
      if(data){          
        res.render('india/inDriver',{YOUR_API_KEY:process.env.API_KEY,driver:data});
      }else{
        database.pilot.findOne({pilotID:req.cookies.pilotID},function(err,driver){
          res.render('india/inDriverReg',{YOUR_API_KEY:process.env.API_KEY,driver:driver});
        });
        
      }
     
    });
    
  }else{
    res.redirect('/india/drv/login')
  }
})

  router.get('/drv/login', function(req, res, next) {
    if(req.cookies.pilotID){
      res.redirect('/india/drv')
    }else{
      res.render('india/inDriverLogin',{msg:req.query.msg,lat:req.query.lat,lng:req.query.lng})
    }
  });

  ///////////Check Mobile in our system////////////
router.post('/drv/checkMobileExist', function(req, res, next) {
  console.log(req.body)

  database.pilot.findOne({mobileNumber:req.body.mobile,isdCode:'+91'},function(err,data){
    console.log(data)
    
    if(data){

      res.send('exist');
    }else{
      res.send('notexist');
    }
  });
  
});


///////Login Driver////////
router.post('/drv/login', function(req, res, next) {
  database.pilot.findOne({mobileNumber:req.body.mobile,isdCode: '+91'},function(err,user){
    if(user){
    bcrypt.compare(req.body.password, user.password, function(err, pass) {
       console.log(pass)
         if(pass){
          res.cookie("pilotID", user.pilotID,{maxAge: 30*24*60*60*1000 }); 
          /////check Prise manager///////          
          res.send('success');
         }else{
           //////Worng Password//////
           res.send('worngpassword')
         }
         });
        }
      });
  });

   ////////Logout /////////////
   router.get('/drv/logout', function(req, res, next) {
    res.clearCookie("pilotID");
    res.redirect('../../drive')
      
  });

  ///////////OTP////////////
router.post('/drv/otpSend', function(req, res, next) {
  //   googleApi.otpsend({  
  //   apikey : 'mWdlAOiE5nY-dlNUZ6linXXcgKhTCMq1MzoQJPAerf',
  //   message : 'Your One Time Password : '+req.body.otp+' to very PaaCab. Kindly do not share with anyone.',
  //   numbers : req.body.mobile,
  //   sender : 'TXTLCL'
  // },function(data){
  // console.log(data);
  // res.send(data);
  // })
  
  res.send({status: 'success'})
  });

  //   googleApi.otpsend({  
  //   apikey : 'mWdlAOiE5nY-dlNUZ6linXXcgKhTCMq1MzoQJPAerf',
  //   message : 'Your One Time Password : 1234 to very PaaCab. Kindly do not share with anyone.',
  //   numbers : '+919733241080',
  //   sender : 'TXTLCL'
  // },function(data){
  // console.log(data);
  // //res.send(data);
  // })

  ///////Register New Driver////////
router.post('/drv/driverReg', function(req, res, next) {
  bcrypt.hash(req.body.password, saltRounds, function(err, hash) {
    database.pilot({
      name: req.body.name,
      email :req.body.email,    
      password: hash,    
      mobileNumber:req.body.mobile,
      isdCode:'+91',
      pilotRating:'0',
      preRideTotalTime:0,
      location:{type:'Point',coordinates:[req.body.lng, req.body.lat]}
      //location:{type:'Point',coordinates:[1.00001, 1.0001]}
    }).save(function(err){
      
      res.redirect('/india/drv/login?msg=Registration Success');
        }); 
    }); 

  });


   ///////Continue Registration process////////
router.post('/drv/completeReg', function(req, res, next) {
     console.log(req.body);
  ////upload files  ///////
     var photo = req.files.file1; 
     if(photo.size >0){         
     var urlphoto='driverDocument/photo'+req.body.mobile+'1'+photo.name+''
     photo.mv('public/india/'+urlphoto+'', function(err) {
       if(err){console.log(err)  }
       database.pilot.findOneAndUpdate({mobileNumber:req.body.mobile, isdCode:req.body.isd},{$set:{
         photo:urlphoto
      }},function(e,d){
       });

      });
    }
    var id = req.files.file2;
     if(id.size > 0){       
    var urlid='driverDocument/id'+req.body.mobile+'1'+id.name+''
    id.mv('public/india/'+urlid+'', function(err) {
      if(err){console.log(err)  }
      database.pilot.findOneAndUpdate({mobileNumber:req.body.mobile, isdCode:req.body.isd},{$set:{
        Idproof:urlid 
      }},function(e,d){
       });
   });
  }
    var dl = req.files.file3;
    if(dl.size >0){          
    var urldl='driverDocument/dl'+req.body.mobile+'1'+dl.name+''
    dl.mv('public/india/'+urldl+'', function(err) {
      if(err){console.log(err)  }
      database.pilot.findOneAndUpdate({mobileNumber:req.body.mobile, isdCode:req.body.isd},{$set:{
        dl:urldl
      }},function(e,d){
       });
    });
  }
    var rto = req.files.file4;
    if(rto.size > 0){          
    var urlrto='driverDocument/rto'+req.body.mobile+'1'+rto.name+''
    rto.mv('public/india/'+urlrto+'', function(err) {
      if(err){console.log(err)  }
      database.pilot.findOneAndUpdate({mobileNumber:req.body.mobile, isdCode:req.body.isd},{$set:{
        rto:urlrto
      }},function(e,d){
       });
    });
  }
  var insu = req.files.file5;
  if(insu.size > 0){
  var urlinsu='driverDocument/insurance'+req.body.mobile+'1'+insu.name+''
  insu.mv('public/india/'+urlinsu+'', function(err) {
    if(err){console.log(err)  }
    database.pilot.findOneAndUpdate({mobileNumber:req.body.mobile, isdCode:req.body.isd},{$set:{
      insurence:urlinsu
    }},function(e,d){
     });
    });
  }
  var polu = req.files.file6; 
  if(polu.size > 0){         
  var urlpolu='driverDocument/polution'+req.body.mobile+'1'+polu.name+''
  polu.mv('public/india/'+urlpolu+'', function(err) {
    if(err){console.log(err)  }
    database.pilot.findOneAndUpdate({mobileNumber:req.body.mobile, isdCode:req.body.isd},{$set:{
      polution:urlpolu
    }},function(e,d){
     });
    });
  }
    if(req.body.address){
    database.pilot.findOneAndUpdate({mobileNumber:req.body.mobile, isdCode:req.body.isd},{$set:{
      address:req.body.address
    }},function(e,d){

    });
  }

    if(req.body.riderCheckbox||req.body.deliveryCheckbox||req.body.employeeCheckbox){
      database.pilot.findOneAndUpdate({mobileNumber:req.body.mobile, isdCode:req.body.isd},{$set:{
        typeOfWork:[req.body.riderCheckbox,req.body.deliveryCheckbox,req.body.employeeCheckbox]
      }},function(e,d){
  
      });
    }

    if(req.body.employeeCheckbox){
      database.pilot.findOneAndUpdate({mobileNumber:req.body.mobile, isdCode:req.body.isd},{$set:{
        jobCategory:req.body.jobcategory,
        jobSubCategory:req.body.jobSubcategory,
        ageGroup:req.body.ageGroup,
        experance:req.body.experance,
        panNumber:req.body.panNumber,
        gender:req.body.gender
      }},function(e,d){
  
      });
    }

    if(req.body.travelmod){
      database.pilot.findOneAndUpdate({mobileNumber:req.body.mobile, isdCode:req.body.isd},{$set:{
        travelmod:req.body.travelmod,
        rtoRegno:req.body.RtoNo,
        carModel:req.body.carModel
      }},function(e,d){
  
      });
    }

    if(req.body.bankAc){
      database.pilot.findOneAndUpdate({mobileNumber:req.body.mobile, isdCode:req.body.isd},{$set:{
        bankAccountNo:req.body.bankAc,
        ifsc:req.body.ifsc,
      }},function(e,d){
  
      });
    }
    res.redirect('/india/drv')

  });



   //////////Update Driver Duty Offline and online//////
   router.post('/drv/dutyUpdate', function(req, res, next) {
    if(req.body.duty=='offline'){
      setTimeout(function(){
        database.driverlocation.deleteMany({pilotID:req.cookies.pilotID},function(e, ddd){
          console.log("delete Driver Location")
          res.send(req.body.duty);
        });
      },3000);
    }   
   
  });

  ////Randanm OTP/////////
function randamNumber(){
  var tex="";
  for(var i=0; i < 4; i++){
      tex+=''+Math.floor(Math.random() * 10)+'';    
  }
  return tex;

}
  ////////Call Driver accept notification/////
router.post('/AcceptCallByDriver', function(req, res, next) { 
  var OTP=randamNumber(); 
  
  database.ride.findOneAndUpdate({bookingID:req.body.bookingID},{$set:{pilotID:req.body.pilotID,callbookingStatus:'Accept'}},function(err, ride){
    if(ride){
      database.customer.findOneAndUpdate({CustID:req.body.CustID},{$set:{orderStage:'accept',}},function(er,cust){
        database.pilot.findOneAndUpdate({pilotID:req.body.pilotID},{$set:{orderStage:'accept'}},function(re, ou){
          database.driverLocationArea.findOneAndUpdate({pilotID:req.body.pilotID},{$set:{driverBusy:'busy'}},function(re, drvloc){
            res.io.emit("DriverAccepeCall",{pilotID:req.body.pilotID,CustID:req.body.CustID,pickuoAddress:req.body.pickuoAddress,bookingID:req.body.bookingID,RideOTP:OTP});
            res.send({ride:ride,cust:cust,RideOTP:OTP});
            database.demandArea.deleteMany({CustID:req.body.CustID},function(e, d){
              console.log("Reset Demand")
            });
          });
         
        });
       
      });
    }
  });
 
  });
 //////////Driver Cline Located //////
 router.post('/drv/clinelocated', function(req, res, next) {
 res.io.emit("clinelocated",{CustID:req.body.CustID});
 res.send("emitClinelocated")
});

//////////Driver Cline Located //////
router.post('/drv/startRide', function(req, res, next) {
  database.customer.findOneAndUpdate({CustID:req.body.CustID},{$set:{orderStage:'startRide'}},function(er,cust){
    database.pilot.findOneAndUpdate({pilotID:req.cookies.pilotID},{$set:{orderStage:'startRide'}},function(re, ou){
      database.ride.findOneAndUpdate({bookingID:req.body.bookingID},{$set:{startTime:new Date()}},function(re, ride){
        res.io.emit("StartRide",{CustID:req.body.CustID});
        res.send("emitStartRide") 
      });

    });
   
  });

  
  });

  //////////Driver Cline Located //////
router.post('/drv/finishRide', function(req, res, next) {
  database.customer.findOneAndUpdate({CustID:req.body.CustID},{$set:{orderStage:'finishRide'}},function(er,cust){
    database.pilot.findOneAndUpdate({pilotID:req.cookies.pilotID},{$set:{orderStage:'finishRide'}},function(re, driver){
      if(driver){
        database.ride.findOne({bookingID:req.body.bookingID},function(er, Booking){      
        //// Calculate Distance Last positio driver///////
         database.driverLocationArea.findOne({pilotID:req.cookies.pilotID},function(er, driverLoc){        
        var finishLocation=driverLoc.location.coordinates;
        console.log("finishLocation",finishLocation);
        console.log("pickuplocation",req.body.picuklat)
        var travelmod=driver.travelmod;
            googleApi.distance({
              origins:''+Number(req.body.picuklat)+', '+Number(req.body.picuklng)+'',              
              destinations:''+Number(finishLocation[1])+','+Number(finishLocation[0])+'',
              apik:process.env.API_KEY,
              travelmod:travelmod
          },function(result){
            var distance=result.rows[0].elements[0].distance.value;                        
              distance=parseInt(distance/1000) + 1;               
              console.log("distance",distance)
                var endTime=new Date();
                var totalTime=endTime.getTime()- moment(Booking.startTime).utc().toDate().getTime();
                totalTime= parseInt(totalTime/(1000*60)) + 1;
                var travelm=Number(travelmod)-1; 
                var timefare=Number(cust.GenarelPerMinutCharge[travelm])* Number(totalTime);
                timefare=timefare.toFixed(0);
               // database.priceOffer.findOne({travelmod:travelmod,distanceKM:distance},function(e,price){
                  
                  var billAmount=0;                  
                  var price=0;
                  var driverpayout=0;

                  if(Number(distance) <= Number(cust.generalMinimumKm[travelm])){
                    price=Number(cust.generalMinimumprice[travelm])  + Number(cust.generalBasePrice[travelm]);
                    driverpayout=Number(cust.generalMinimumKm[travelm]) * Number(cust.driverPayout[travelm])
                  }else{
                    var dist=Number(distance) - Number(cust.generalMinimumKm[travelm]);
                   price= (Number(dist) * Number(cust.generalPriceperKm[travelm])) + (Number(cust.generalMinimumprice[travelm]) + Number(cust.generalBasePrice[travelm])) 
                   driverpayout=Number(distance) * Number(cust.driverPayout[travelm])
                  }
                                   
                  if(price >= Booking.totalamount){
                     billAmount=Number(price) + Number(timefare)  ;
                    
                  }else{
                     billAmount=Number(Booking.totalamount)+ Number(timefare);                     
                  }
                  /////send  and update bill details/////
                  database.ride.findOneAndUpdate({bookingID:req.body.bookingID},{$set:{totalamount:billAmount,driverpayout:driverpayout,totalTime:totalTime,timefare:timefare,generalBasePrice:Number(cust.generalBasePrice[travelm])}},function(er, updatbooking){ 
                    if(updatbooking){
                      //////Wallet Update ////
                      if(Number(updatbooking.paymentBy)==2){
                        var walletAmt=Number(cust.walletBalance)-billAmount;
                        database.customer.findOneAndUpdate({CustID:req.body.CustID},{$set:{walletBalance:walletAmt}},function(er,cu){
                          res.io.emit("finishRide",{CustID:req.body.CustID});
                          res.send({billAmount:0}); 
                        });
                      }else{
                        if(Number(updatbooking.paymentBy)==3){
                          var buykmAmt=Number(cust.walletBalance)-Number(distance);
                          database.customer.findOneAndUpdate({CustID:req.body.CustID},{$set:{BuyKM:buykmAmt}},function(er,n){
                            res.io.emit("finishRide",{CustID:req.body.CustID});
                          res.send({billAmount:0}); 
                          });
                        }else{
                          database.ride.findOneAndUpdate({bookingID:req.body.bookingID},{$set:{driverCashCollectio:billAmount,DriverType:"General"}},function(er, cashcollec){
                            res.io.emit("finishRide",{CustID:req.body.CustID});
                            res.send({billAmount:billAmount});
                          }) ;
 
                           
                        }
                      }
                    }
                  });
                  

               // }); /////          
           
          });

        });

        });
      }
      
    });
   
  });
  });

  //////////Driver getFinalBooking For Billing //////
router.post('/drv/getFinalBooking', function(req, res, next) {
  database.ride.findOne({bookingID:req.body.bookingID},function(e,data){
    res.send(data);
  });
  });

   //////////Driver finishEverythingAndSetNormal //////
router.post('/drv/finishEverythingAndSetNormal', function(req, res, next) {
    database.pilot.findOneAndUpdate({pilotID:req.cookies.pilotID},{$set:{orderStage:""}},function(e,data){
    // console.log("Find all cook",req.cookies);
    //////delete all cookes/////
    res.send("ok") 
    });
  });

   //////////Driver finishEverythingAndSetNormal //////
   router.post('/drv/bookingIncentiveDetails', function(req, res, next) {
    var totalErning=0;
    var totalIncentive=0;
   var todayStart = moment().startOf('day').utc();
   var todayend = moment().endOf('day').utc();

  database.ride.find({
    date:{$gte: todayStart.toDate(), $lte:todayend.toDate() },
    pilotID:req.cookies.pilotID,
    callbookingStatus:"Accept"
  },function(er , data){
      data.forEach(function(val,indx,arry){
      totalErning+=Number(val.driverpayout)
      totalIncentive+=Number(val.driverIncentiv)
      if(indx===arry.length - 1){
        console.log("Earnings",totalErning);
        console.log("Incentive",totalIncentive)
        res.send({noOfBooking:arry.length,totalErning:totalErning,totalIncentive:totalIncentive})
      }
    });
    
    });
  });

/////getDemadndArea count and find //////
router.post('/drv/getDemadndArea', function(req, res, next) {
  console.log('myposition',req.body)
  database.index2Ddemand({},function(ss){
    database.demandArea.find({
          location: {
            $near: {
              $geometry: {
                 type: "Point" ,
                 coordinates: [ Number(req.body.lng), Number(req.body.lat) ]
              },$maxDistance :10000
            }
          }
        },function(e,data){
        console.log('test result',JSON.stringify(data) );
          res.send(data);
        })
  });

});



///////////////////////////////////////
///* END DRIVER LISTING. */////////////
///////////////////////////////////////

///////////////////////////////////////
///* PRE DRIVER LISTING. */////////////
///////////////////////////////////////
router.get('/preDrv', function(req, res, next) {
  //res.send('respond with a resource I am INDIA');
  if(req.cookies.pilotID){
    database.pilot.findOne({completereg:'done',pilotID:req.cookies.pilotID},function(err,data){
      console.log(req.cookies.pilotID)
      if(data){          
        res.render('india/inPreDriver',{YOUR_API_KEY:process.env.API_KEY,driver:data});
      }else{
        database.pilot.findOne({pilotID:req.cookies.pilotID},function(err,driver){
          res.render('india/inPreDriverReg',{YOUR_API_KEY:process.env.API_KEY,driver:driver});
        });
        
      }
     
    });
    
  }else{
    res.redirect('/india/preDrv/login')
  }
});

router.get('/preDrv/login', function(req, res, next) {
  if(req.cookies.pilotID){
    res.redirect('/india/preDrv')
  }else{
    res.render('india/inPreDriverLogin',{msg:req.query.msg,lat:req.query.lat,lng:req.query.lng})
  }
});

///////////Check Mobile in our system////////////
router.post('/preDrv/checkMobileExist', function(req, res, next) {
console.log(req.body)

database.pilot.findOne({mobileNumber:req.body.mobile,isdCode:'+91'},function(err,data){
  console.log(data)
  
  if(data){

    res.send('exist');
  }else{
    res.send('notexist');
  }
});

});


///////Login Driver////////
router.post('/preDrv/login', function(req, res, next) {
database.pilot.findOne({mobileNumber:req.body.mobile,isdCode: '+91'},function(err,user){
  if(user){
  bcrypt.compare(req.body.password, user.password, function(err, pass) {
     console.log(pass)
       if(pass){
        res.cookie("pilotID", user.pilotID,{maxAge: 30*24*60*60*1000 }); 
        /////check Prise manager///////          
        res.send('success');
       }else{
         //////Worng Password//////
         res.send('worngpassword')
       }
       });
      }
    });
});

 ////////Logout /////////////
 router.get('/preDrv/logout', function(req, res, next) {
  res.clearCookie("pilotID");
  res.redirect('../../preDrive')
    
});

///////Register New Driver////////
router.post('/preDrv/driverReg', function(req, res, next) {
bcrypt.hash(req.body.password, saltRounds, function(err, hash) {
  database.pilot({
    name: req.body.name,
    email :req.body.email,    
    password: hash,    
    mobileNumber:req.body.mobile,
    isdCode:'+91',
    pilotRating:'0',
    location:{type:'Point',coordinates:[req.body.lng, req.body.lat]}
    //location:{type:'Point',coordinates:[1.00001, 1.0001]}
  }).save(function(err){
    
    res.redirect('/india/preDrv/login?msg=Registration Success');
      }); 
  }); 

});


 ///////Continue Registration process////////
router.post('/preDrv/completeReg', function(req, res, next) {
   console.log(req.body);
////upload files  ///////
   var photo = req.files.file1; 
   if(photo.size >0){         
   var urlphoto='driverDocument/photo'+req.body.mobile+'1'+photo.name+''
   photo.mv('public/india/'+urlphoto+'', function(err) {
     if(err){console.log(err)  }
     database.pilot.findOneAndUpdate({mobileNumber:req.body.mobile, isdCode:req.body.isd},{$set:{
       photo:urlphoto
    }},function(e,d){
     });

    });
  }
  var id = req.files.file2;
   if(id.size > 0){       
  var urlid='driverDocument/id'+req.body.mobile+'1'+id.name+''
  id.mv('public/india/'+urlid+'', function(err) {
    if(err){console.log(err)  }
    database.pilot.findOneAndUpdate({mobileNumber:req.body.mobile, isdCode:req.body.isd},{$set:{
      Idproof:urlid 
    }},function(e,d){
     });
 });
}
  var dl = req.files.file3;
  if(dl.size >0){          
  var urldl='driverDocument/dl'+req.body.mobile+'1'+dl.name+''
  dl.mv('public/india/'+urldl+'', function(err) {
    if(err){console.log(err)  }
    database.pilot.findOneAndUpdate({mobileNumber:req.body.mobile, isdCode:req.body.isd},{$set:{
      dl:urldl
    }},function(e,d){
     });
  });
}
  var rto = req.files.file4;
  if(rto.size > 0){          
  var urlrto='driverDocument/rto'+req.body.mobile+'1'+rto.name+''
  rto.mv('public/india/'+urlrto+'', function(err) {
    if(err){console.log(err)  }
    database.pilot.findOneAndUpdate({mobileNumber:req.body.mobile, isdCode:req.body.isd},{$set:{
      rto:urlrto
    }},function(e,d){
     });
  });
}
var insu = req.files.file5;
if(insu.size > 0){
var urlinsu='driverDocument/insurance'+req.body.mobile+'1'+insu.name+''
insu.mv('public/india/'+urlinsu+'', function(err) {
  if(err){console.log(err)  }
  database.pilot.findOneAndUpdate({mobileNumber:req.body.mobile, isdCode:req.body.isd},{$set:{
    insurence:urlinsu
  }},function(e,d){
   });
  });
}
var polu = req.files.file6; 
if(polu.size > 0){         
var urlpolu='driverDocument/polution'+req.body.mobile+'1'+polu.name+''
polu.mv('public/india/'+urlpolu+'', function(err) {
  if(err){console.log(err)  }
  database.pilot.findOneAndUpdate({mobileNumber:req.body.mobile, isdCode:req.body.isd},{$set:{
    polution:urlpolu
  }},function(e,d){
   });
  });
}
  if(req.body.address){
  database.pilot.findOneAndUpdate({mobileNumber:req.body.mobile, isdCode:req.body.isd},{$set:{
    address:req.body.address
  }},function(e,d){

  });
}

  if(req.body.riderCheckbox||req.body.deliveryCheckbox||req.body.employeeCheckbox){
    database.pilot.findOneAndUpdate({mobileNumber:req.body.mobile, isdCode:req.body.isd},{$set:{
      typeOfWork:[req.body.riderCheckbox,req.body.deliveryCheckbox,req.body.employeeCheckbox]
    }},function(e,d){

    });
  }

  if(req.body.employeeCheckbox){
    database.pilot.findOneAndUpdate({mobileNumber:req.body.mobile, isdCode:req.body.isd},{$set:{
      jobCategory:req.body.jobcategory,
      jobSubCategory:req.body.jobSubcategory,
      ageGroup:req.body.ageGroup,
      experance:req.body.experance,
      panNumber:req.body.panNumber,
      gender:req.body.gender
    }},function(e,d){

    });
  }

  if(req.body.travelmod){
    database.pilot.findOneAndUpdate({mobileNumber:req.body.mobile, isdCode:req.body.isd},{$set:{
      travelmod:req.body.travelmod,
      rtoRegno:req.body.RtoNo,
      carModel:req.body.carModel
    }},function(e,d){

    });
  }

  if(req.body.bankAc){
    database.pilot.findOneAndUpdate({mobileNumber:req.body.mobile, isdCode:req.body.isd},{$set:{
      bankAccountNo:req.body.bankAc,
      ifsc:req.body.ifsc,
    }},function(e,d){

    });
  }
  res.redirect('/india/preDrv')

});


///////PreDriver Cash Collection///////
router.get('/preDriverCash', function(req, res, next) {
  if(req.cookies.pilotID){
    var newPreviousDue=0;
    var newPendingConsumption=0;
    database.pilot.findOne({pilotID:req.cookies.pilotID},function(e,pilot){
      preRideCashDueCalculation({pilotID:pilot.pilotID,travelmod:pilot.travelmod},function(value){
          if(pilot.lastCheckCashCollcetion){
            var lastCheckCashCollcetion=pilot.lastCheckCashCollcetion;
          }else{
            var lastCheckCashCollcetion=0;
          }
         
        newPreviousDue=Number(lastCheckCashCollcetion)+Number(value.previousDue); 
        console.log(" newPreviousDue", newPreviousDue)
        fuleConsumptionCalculation({pilotID:pilot.pilotID,travelmod:pilot.travelmod},function(consum){
          if(pilot.lastCheckFuleconsumption){
            var lastCheckFuleconsumption=pilot.lastCheckFuleconsumption;
          }else{
            var lastCheckFuleconsumption=0;
          }
          newPendingConsumption=Number(lastCheckFuleconsumption)+Number(consum.previousConsumption); 
            database.pilot.findOneAndUpdate({pilotID:req.cookies.pilotID},{$set:{ 
              lastCheckDate:new Date(),
              lastCheckCashCollcetion:newPreviousDue,
              lastFuleCheckDate:new Date(),
              lastCheckFuleconsumption:newPendingConsumption       
          }},function(e,d){
            res.render('india/inPreDriverCashCollection',{
              previousDue:newPreviousDue,
              dailyCollection:value.dailyCollection,
              PendingConsumption:newPendingConsumption,
              dailyConsum:consum.dailyConsum

            })
          })
        })
        
    });
    })

    
       
  }else{
    res.redirect('/india/preDrv/login')
  }
});

router.get('/resetpilot', function(req, res, next) {
  if(req.cookies.pilotID){
    database.pilot.findOneAndUpdate({pilotID:req.cookies.pilotID},{$set:{date:new Date()}},function(e,d){
      res.send("Reset"+req.cookies.pilotID )
    })
  } 
})

function fuleConsumptionCalculation(req,cb){
  var StartTime="";
  var EndTime="";
  var consumption=0;
  var paidConsumption=0;
  database.pilot.findOne({pilotID:req.pilotID},function(e, pilot){
    if(pilot.lastFuleCheckDate){
      /////Check From Last Checking Date/////
      StartTime=moment(pilot.lastFuleCheckDate).utc();
      EndTime = moment().startOf('day').utc();
      database.Carlogbook.find({
        date:{$gte: StartTime.toDate(), $lte:EndTime.toDate() },
        pilotID:req.pilotID,
        travelmod:req.travelmod,
        loogBookStatus:"complete",
        DriverType : "preRide"
      },function(er,logbook){
        if(logbook.length > 0){
          logbook.forEach(function(val, key ,ary){
            if(val.fuleConsumption){
              consumption=Number(consumption)+Number(val.fuleConsumption);
            }
            if(val.fuleConsumptionPaid){
              paidConsumption=Number(paidConsumption)+Number(val.fuleConsumptionPaid)
            }
            if(key===ary.length -1){
              var previousConsumption=Number(consumption)-Number(paidConsumption);
              dailyConsumption({pilotID:req.pilotID,travelmod:req.travelmod},function(consum){
                cb({previousConsumption:previousConsumption,dailyConsum:consum});
              })
            }
          })
        }else{
          dailyConsumption({pilotID:req.pilotID,travelmod:req.travelmod},function(consum){
            cb({previousConsumption:0,dailyConsum:consum});
          })
          
        }
      });

    }else{
      //////Check From Begining//////
      if(pilot.date.getDate()==new Date().getDate()){
        dailyConsumption({pilotID:req.pilotID,travelmod:req.travelmod},function(consum){
          cb({previousConsumption:0,dailyConsum:consum});
        })
      }else{       
      StartTime=moment(pilot.date).utc();
      EndTime = moment().startOf('day').utc();
      database.Carlogbook.find({
        date:{$gte: StartTime.toDate(), $lte:EndTime.toDate() },
        pilotID:req.pilotID,
        travelmod:req.travelmod,
        loogBookStatus:"complete",
        DriverType : "preRide"
      },function(er,logbook){
        if(logbook.length > 0){
          logbook.forEach(function(val, key ,ary){
            if(val.fuleConsumption){
              consumption=Number(consumption)+Number(val.fuleConsumption);
            }
            if(val.fuleConsumptionPaid){
              paidConsumption=Number(paidConsumption)+Number(val.fuleConsumptionPaid)
            }
            if(key===ary.length -1){
              var previousConsumption=Number(consumption)-Number(paidConsumption);
              dailyConsumption({pilotID:req.pilotID,travelmod:req.travelmod},function(consum){
                cb({previousConsumption:previousConsumption,dailyConsum:consum});
              })
            }
          })
        }else{
          dailyConsumption({pilotID:req.pilotID,travelmod:req.travelmod},function(consum){
            cb({previousConsumption:0,dailyConsum:consum});
          })
          
        }
      });

      }


    }

  });
}

function dailyConsumption(req,cb){
  var consumption=0;
  var paidConsumption=0;
  var totalkm=0;
  var mileage=0;
  var fulePrice=0;

  var StartTime = moment().startOf('day').utc();
  var EndTime = moment().endOf('day').utc();
  database.Carlogbook.find({
    date:{$gte: StartTime.toDate(), $lte:EndTime.toDate() },
    pilotID:req.pilotID,
    travelmod:req.travelmod,
    loogBookStatus:"complete",
    DriverType : "preRide"
  },function(er , logbook){
    if(logbook.length > 0){
      logbook.forEach(function(val, key ,ary){
        if(val.fuleConsumption){
          consumption=Number(consumption)+Number(val.fuleConsumption);
          totalkm=Number(totalkm)+Number(val.kmTravels);
          mileage=val.enginMilege;
          fulePrice=val.perltrFulePrice;
        }
        if(val.fuleConsumptionPaid){
          paidConsumption=Number(paidConsumption)+Number(val.fuleConsumptionPaid)
        }
        if(key===ary.length -1){
          var previousConsumption=Number(consumption)-Number(paidConsumption); 

            cb({previousConsumption:previousConsumption,totalkm:totalkm,mileagr:mileage,fulePrice:fulePrice});         
        }
      })
    }else{
      cb(0);
    }
  });
}

function preRideCashDueCalculation(req,cb){
var StartTime="";
    var EndTime="";
    var CashCollection=0;
    var payment=0;
    database.pilot.findOne({pilotID:req.pilotID},function(e, pilot){
      if(pilot.lastCheckDate){
        /////Check Balance From Last Checking Date
        StartTime=moment(pilot.lastCheckDate).utc();
        EndTime = moment().startOf('day').utc();
       // var todayend = moment().endOf('day').utc();
        database.ride.find({
          date:{$gte: StartTime.toDate(), $lte:EndTime.toDate() },
          pilotID:req.pilotID,
          travelmod:req.travelmod,
          callbookingStatus:"complete",
          DriverType : "preRide"
        },function(er , balance){
          if(balance.length >0){
            balance.forEach(function(val, key ,ary){
              if(val.driverCashCollectio){
                CashCollection=Number(CashCollection)+Number(val.driverCashCollectio);
              }
              if(val.driverCashDeposit){
                payment=Number(payment)+Number(val.driverCashDeposit)
              }
              if(key===ary.length -1){
                var previousDue=Number(CashCollection)-Number(payment);
                dailyCashCollection({pilotID:req.pilotID,travelmod:req.travelmod},function(cash){
                  cb({previousDue:previousDue,dailyCollection:cash});
                })
              }
          });
          }else{
            dailyCashCollection({pilotID:req.pilotID,travelmod:req.travelmod},function(cash){
              cb({previousDue:0,dailyCollection:cash});
            })
          }
        });
      }else{
        /////Check Balance From Starting
        if(pilot.date.getDate()==new Date().getDate()){
          dailyCashCollection({pilotID:req.pilotID,travelmod:req.travelmod},function(cash){
            cb({previousDue:0,dailyCollection:cash});
          });
        }else{       
        StartTime=moment(pilot.date).utc();
        EndTime = moment().startOf('day').utc();
       // var todayend = moment().endOf('day').utc();
        database.ride.find({
          date:{$gte: StartTime.toDate(), $lte:EndTime.toDate() },
          pilotID:req.pilotID,
          travelmod:req.travelmod,
          callbookingStatus:"complete",
          DriverType : "preRide"
        },function(er , balance){
          if(balance.length >0){
            balance.forEach(function(val,key,ary){
              if(val.driverCashCollectio){
                CashCollection=Number(CashCollection)+Number(val.driverCashCollectio);
              }
              if(val.driverCashDeposit){
                payment=Number(payment)+Number(val.driverCashDeposit)
              }

              if(key===ary.length -1){
                var previousDue=Number(CashCollection)-Number(payment);
                dailyCashCollection({pilotID:req.pilotID,travelmod:req.travelmod},function(cash){
                  cb({previousDue:previousDue,dailyCollection:cash});
                })
              }
          });
          } else{
            dailyCashCollection({pilotID:req.pilotID,travelmod:req.travelmod},function(cash){
              cb({previousDue:0,dailyCollection:cash});
            })
          }      
          
        });
      }

      }   /////
      
    })
}

function dailyCashCollection(req,cb){
  var CashCollection=0;  
  var payment=0;      
        var StartTime = moment().startOf('day').utc();
        var EndTime = moment().endOf('day').utc();
        database.ride.find({
          date:{$gte: StartTime.toDate(), $lte:EndTime.toDate() },
          pilotID:req.pilotID,
          travelmod:req.travelmod,
          callbookingStatus:"complete",
          DriverType : "preRide"
        },function(er , balance){
          if(balance.length > 0){
            balance.forEach(function(val,key,ary){
              if(val.driverCashCollectio){
                CashCollection=Number(CashCollection)+Number(val.driverCashCollectio);
              }
              if(val.driverCashDeposit){
                payment=Number(payment)+Number(val.driverCashDeposit)
              }
  
              if(key===ary.length -1){
                var cash=Number(CashCollection)-Number(payment);
                cb(cash);
              }
            });
          }else{
            cb(0);
          }
         

        });

}


/////For Neareast PreRide Driver//////
router.post('/nearbyPrerideDriver', function(req, res, next) {
  database.index2Ddriver({},function(ss){
    /////Check  Driver for 3KM //////
      database.driverlocation.find({
        location: {
          $near: {
            $geometry: {
               type: "Point" ,
               coordinates: [Number(req.body.lng), Number(req.body.lat)]
            },$maxDistance : 3000
          }
        },accountStatus:'Active',travelmod:req.body.travelmod,DriverType:req.body.DriverType,preRideTotalTime:{$lt:30}
      },function(e, driver3km){
        if(driver3km.length > 0){
          res.send({drivers:driver3km});
             
        }else{
           /////Check  Driver for 10KM //////
           database.driverlocation.find({
            location: {
              $near: {
                $geometry: {
                   type: "Point" ,
                   coordinates: [Number(req.body.lng), Number(req.body.lat)]
                },$maxDistance : 10000
              }
            },accountStatus:'Active',travelmod:req.body.travelmod,DriverType:req.body.DriverType,preRideTotalTime:{$lt:30}
          },function(e, driver10km){
            if(driver10km.length > 0){
              res.send({drivers:driver10km});
                
            }else{
              res.send({drivers:[]});
            }
          });

        }
      });
    
     

  });

});

/////////Generate Booking ID///////
function GenbookingID(rq,cb){
  database.rideCounter.findOne({},function(e, d){
if(d){
  var newId=Number(d.bookingID)+1;
  database.rideCounter.findOneAndUpdate({bookingID:d.bookingID},{$set:{bookingID:newId}},function(e, dd){
    cb({bookingID:newId}); 
  })
}else{
  database.rideCounter({bookingID:1}).save(function(er){
   cb({bookingID:1});
  });
}
});
}

////////Start Car LogBook Reading///////

router.post('/startCarLoogbook', function(req, res, next) { 
  database.Carlogbook.findOne({bookingID:req.body.bookingID},function(er, carlock){
    if(!carlock){
      database.pilot.findOne({pilotID:req.cookies.pilotID},function(err,pilot){  
        var position=JSON.parse(req.cookies.position) ;
        database.Carlogbook({
         bookingID:req.body.bookingID,
         pilotID :pilot.pilotID,
         travelmod:pilot.travelmod,
         DriverType:"preRide",  
         startlatlng: [Number(position.lat), Number(position.lng)],  
         loogBookStatus:"start"
        }).save(function(err){
         res.send("LoogBook Created");
        });   
     
       });
    }
  });
 })


////////Create New Pre Ride Booking/////
router.post('/savePreRideCallAndBooking', function(req, res, next) {  
  console.log(req.body)
  
    ///////Create Bookinng////
  GenbookingID({},function(NewBookinid){
    database.ride({
      bookingID:NewBookinid.bookingID,   
      CustID:req.body.CustID,
      pilotID:req.body.pilotID,
      DriverType:req.body.DriverType,
      picupaddress:req.body.originAds,
      picuklatlng: [req.body.originLat, req.body.originLng],    
      dropaddress:req.body.distAds,     
      droplatlng:[req.body.distLat, req.body.distLng],        
      kmtravels:req.body.totalDistance,
      totalamount:req.body.totalAmt,
      paymentBy:req.body.payMode,
      travalTime:Number(req.body.travalTime)+2 ,     
      callbookingStatus:"Accept",
      driverBusy:"busy",
      preRideOTP:randamNumber(),    
    }).save(function(err){ 
      //////CUST data////
      database.customer.findOneAndUpdate({CustID:req.body.CustID},{$set:{
        orderStage:'accept',
        bookingID:NewBookinid.bookingID
      }},function(er,cust){
        database.pilot.findOne({pilotID:req.body.pilotID},function(er, pilot){ 
          var newtotalTime=pilot.preRideTotalTime + Number(req.body.travalTime) + 2           
          database.pilot.findOneAndUpdate({pilotID:req.body.pilotID},{$set:{
            preRideTotalTime: newtotalTime
          }},function(er,pil){
            ////Requiest for Preride  List refresh/////
            res.io.emit("refreshPreRideList",{driverBusy:"busy",pilotID:req.body.pilotID});
            res.io.emit("startRingtone",{play:"1"});
            res.send("Final order Save");    
          });
        }); 
      });

      
    });
  })
  
}); 
    
    ////PreRide Driver Call Emit//////
  router.post('/CallPreRideDriver', function(req, res, next) {
  res.io.emit("preRideinCommingCall",{pilotID:req.body.pilotID,CustID:req.body.CustID});
  res.send('ReqEmited');
  });

  
    ////////Call Driver accept notification/////
router.post('/preRideAutoAccepeCall', function(req, res, next) {    
  console.log('incomecalldetails',req.body)
  res.io.emit("PreRideDriverAccepeCall",{pilotID:req.body.pilotID,CustID:req.body.CustID});
  res.send("emited Call Accept by driver");  
  });
   
 

/////CHECK EXISTING PRE RIDE CALL DETAILS/////
  router.post('/existingPrerideCall', function(req, res, next) {
    var Record=[];
    var count =0;
    var countArray=[];
    console.log("req Body:", req.body)
    database.ride.find({pilotID:req.body.pilotID,driverBusy:req.body.driverBusy},function(err, data){
      console.log("data:", data)
      data.forEach(function(val,i,ar){
        count++;
        gatherRecord({val:val,count:count},function(result){
          Record.push(result.out);
          countArray.push(result.count);
          console.log("countArray.length",countArray.length)
          console.log("ar.length",ar.length)

          if(countArray.length==ar.length){
            res.send(Record);
          }
        })
      })
    });

    function gatherRecord(req,cb){
      database.customer.findOne({CustID:req.val.CustID},function(er,cust){
        var out={
          CustID:cust.CustID,
          mobileNumber:cust.mobileNumber,
          isdCode:cust.isdCode,
          name:cust.name,
          picuklatlng:req.val.picuklatlng,
          droplatlng:req.val.droplatlng,
          picupaddress:req.val.picupaddress,
          dropaddress:req.val.dropaddress,
          callbookingStatus:req.val.callbookingStatus,
          pilotID:req.val.pilotID,
          preRideOTP:req.val.preRideOTP,
          bookingID:req.val.bookingID
        }
        cb({out:out,count:req.count});
        
      })
    }

  });

  
 /////PRE RIDE FULE PRICE AND CITY UPDATE/////
 router.post('/preRideCityFulepriceUpdate', function(req, res, next) {
   database.pilot.findOne({pilotID:req.body.pilotID},function(err, data){
    if(data.cityName){
        database.petroldesel.findOne({cityName:data.cityName},function(e, petrol){
          if(data.vichelEnginType=="Petrol"){
            var fulePrice=petrol.petrolPerLtr;
          }else{
            if(data.vichelEnginType=="Diesel"){
              var fulePrice=petrol.deselPerLtr;
            }else{
                /////cng///////
                var fulePrice=petrol.cngPrice;
            }
          }
          database.pilot.findOneAndUpdate({pilotID:req.body.pilotID},{$set:{
            fulePrice:fulePrice
          }},function(err, da){
            res.send("Fule Price Update");
          });


        })
    }else{
      res.send("0");
    }
   })

 });

  /////PRE RIDE PAGE INITIATE/////
  router.post('/preRidePageInitiate', function(req, res, next) {
    var Record=[];
    var count =0;
    var countArray=[];
    console.log("req Body:", req.body)
    database.ride.find({pilotID:req.body.pilotID,driverBusy:req.body.driverBusy},function(err, data){
      console.log("data:", data)
      data.forEach(function(val,i,ar){
        count++;
        gatherRecord({val:val,count:count},function(result){
          Record.push(result.out);
          countArray.push(result.count);
          console.log("countArray.length",countArray.length)
          console.log("ar.length",ar.length)

          if(countArray.length==ar.length){
            res.send(Record);
          }
        })
      })
    });

    function gatherRecord(req,cb){
      database.customer.findOne({CustID:req.val.CustID},function(er,cust){
        var out={
          CustID:cust.CustID,
          mobileNumber:cust.mobileNumber,
          isdCode:cust.isdCode,
          name:cust.name,
          picuklatlng:req.val.picuklatlng,
          droplatlng:req.val.droplatlng,
          picupaddress:req.val.picupaddress,
          dropaddress:req.val.dropaddress,
          callbookingStatus:req.val.callbookingStatus,
          pilotID:req.val.pilotID,
          preRideOTP:req.val.preRideOTP,
          bookingID:req.val.bookingID
        }
        cb({out:out,count:req.count});
        
      })
    }

  });

  


  //////////Update Driver Duty initiate//////
  // router.post('/preRideDutyInitiate', function(req, res, next) { 
  //       database.driverlocation.deleteMany({pilotID:req.cookies.pilotID},function(e, ddd){
  //         console.log("delete Driver Location")
  //         res.send(req.body.duty);
  //       });
  // });

  //////////Driver preRide Cline Located //////
 router.post('/preRideClinelocated', function(req, res, next) {  
  database.ride.findOneAndUpdate({bookingID:req.body.bookingID},{$set:{callbookingStatus:'clineLocate'}},function(re, ou){
   res.io.emit("clinelocated",{CustID:req.body.CustID});
   res.send("emitClinelocated") 
  });

})

  //////Start Pre Ride/////////////
  router.post('/preRideStartRide', function(req, res, next) {
    database.customer.findOneAndUpdate({CustID:req.body.CustID},{$set:{orderStage:'startRide'}},function(er,cust){
      database.ride.findOneAndUpdate({bookingID:req.body.bookingID},{$set:{callbookingStatus:'startRide',startTime:new Date()}},function(re, ou){
        res.io.emit("StartRide",{CustID:req.body.CustID});
        res.send("emitStartRide") 
      });
     
    });
    //res.send("emitStartRide") 
  
  })




   //////////Finish Pre Ride //////
  //  var endTime=new Date();
  //  var aa=moment().utc().toDate();
  //  console.log("endTime",endTime);
  //  console.log("moment",aa);
  //  var dd=aa.getTime();
  //  var cc=endTime.getTime();
  // console.log("UTC",dd);
  // console.log("enct",cc);

  // console.log(dd-cc)
   
router.post('/preRideFinish', function(req, res, next) {
  database.customer.findOneAndUpdate({CustID:req.body.CustID},{$set:{orderStage:'finishRide'}},function(er,cust){
    database.pilot.findOne({pilotID:req.cookies.pilotID},function(re, driver){
      if(driver){
        var endTime=new Date();
        database.ride.findOneAndUpdate({bookingID:req.body.bookingID},{$set:{callbookingStatus:"finishRide",endTime:endTime,travelmod:driver.travelmod}},function(er, Booking){      
        ///////Update pilot TotalTime///////
        var newTotaltime=Number(driver.preRideTotalTime) - Number(Booking.travalTime);
        database.pilot.findOneAndUpdate({pilotID:req.cookies.pilotID},{$set:{
          preRideTotalTime:newTotaltime
        }},function(e, dddddd){ });
        
          //// Calculate Distance Last positio driver///////
         database.driverlocation.findOne({pilotID:req.cookies.pilotID},function(er, driverLoc){        
        var finishLocation=driverLoc.location.coordinates;
        console.log("finishLocation",finishLocation);
        console.log("pickuplocation",req.body.picuklat)
        var travelmod=driver.travelmod;
            googleApi.distance({
              origins:''+Number(req.body.picuklat)+', '+Number(req.body.picuklng)+'',              
              destinations:''+Number(finishLocation[1])+','+Number(finishLocation[0])+'',
              apik:process.env.API_KEY,
              travelmod:travelmod
          },function(result){
            var distance=result.rows[0].elements[0].distance.value;
            var totalTime=endTime.getTime()- moment(Booking.startTime).utc().toDate().getTime();
            totalTime= parseInt(totalTime/(1000*60)) + 1;
            var travelm=Number(travelmod)-1; 
            var timefare=Number(cust.preRideperMinutCharge[travelm])* Number(totalTime);
            timefare=timefare.toFixed(0);
            console.log("totalTime",totalTime)                       
              distance=parseInt(distance/1000) + 1; 
              console.log("distance",distance)
              var distancefare=Number(cust.preRidePriceperKm[travelm])* Number(distance);
               // database.priceOffer.findOne({travelmod:travelmod,distanceKM:distance},function(e,price){
                  //console.log("Price :",price.price, "Bookin Price", Booking.totalamount)
                  var billAmount=0;
                  ///var driverpayout=Number(distance) *6;                  
                  if(distancefare >= Booking.totalamount){
                     billAmount=Number(distancefare) + Number(timefare);                    
                  }else{
                     billAmount= Number(Booking.totalamount) + Number(timefare);                 
                  }
                  /////send  and update bill details/////
                  database.ride.findOneAndUpdate({bookingID:req.body.bookingID},{$set:{totalamount:billAmount,totalTime:totalTime,timefare:timefare}},function(er, updatbooking){ 
                    if(updatbooking){
                      //////Wallet Update ////
                      if(Number(updatbooking.paymentBy)==2){
                        var walletAmt=Number(cust.walletBalance)-billAmount;
                        database.customer.findOneAndUpdate({CustID:req.body.CustID},{$set:{walletBalance:walletAmt}},function(er,cu){
                          res.io.emit("finishRide",{CustID:req.body.CustID});
                          res.send({billAmount:0}); 
                        });
                      }else{
                        if(Number(updatbooking.paymentBy)==3){
                          var buykmAmt=Number(cust.walletBalance)-Number(distance);
                          database.customer.findOneAndUpdate({CustID:req.body.CustID},{$set:{BuyKM:buykmAmt}},function(er,n){
                            res.io.emit("finishRide",{CustID:req.body.CustID});
                          res.send({billAmount:0}); 
                          });
                        }else{
                          database.ride.findOneAndUpdate({bookingID:req.body.bookingID},{$set:{driverCashCollectio:billAmount}},function(er, cash){
                            res.io.emit("finishRide",{CustID:req.body.CustID});
                            res.send({billAmount:billAmount}); 
                          }); 
               
                        }
                      }
                    }
                  });
                  

                  

               // }); ////          
           
          });

        });

        });
      }
      
    });
   
  });
  });

  router.post('/finishandUpdateRide', function(req, res, next) {
    database.ride.findOneAndUpdate({bookingID:req.body.bookingID},{$set:{
      callbookingStatus:"complete",
      driverBusy:""
    }},function(err, data){
      //////Finish Logbook///////
      var position=JSON.parse(req.cookies.position) ;
      database.Carlogbook.findOne({bookingID:req.body.bookingID},function(e, carLog){
        googleApi.distance({
          origins:""+carLog.startlatlng[0]+","+carLog.startlatlng[1]+"",
          destinations:""+position.lat+","+position.lng+"",
          apik:process.env.API_KEY,
          travelmod:carLog.travelmod
      },function(result){
       var distance=result.rows[0].elements[0].distance.value;
        distance=parseInt(distance/1000)+1;
        
       database.pilot.findOne({pilotID:req.cookies.pilotID},function(e, driver){
        var fuleConsumption=0;
         if(driver.enginMilege){
          fuleConsumption=(Number(driver.fulePrice)/ Number(driver.enginMilege))*Number(distance);
         }        
        database.Carlogbook.findOneAndUpdate({bookingID:req.body.bookingID},{$set:{
          droplatlng:[position.lat, position.lng],
          kmTravels:distance,
          perltrFulePrice:driver.fulePrice,
          enginMilege:driver.enginMilege,
          fuleConsumption:fuleConsumption,          
          loogBookStatus:"complete",
        }},function(e, d){
          res.send(data);
         }) 
       }); 
        

        })
      });
     
    })
  });

  //////////Update City Price/////////
  router.post('/preRideUpdateCitywisePrice', function(req, res, next){
      googleApi.SearchGeoCodePlaceByLatLng({
        lat:Number(req.body.lat),
        lng:Number(req.body.lng),
        //lat:Number(22.8895),
        //lng:Number(88.4220),
        apik:process.env.API_KEY,
    },function(data){
      console.log("City Name",data.results[0]);
    
    data.results[0].address_components.forEach(function(val){           
      if(val.types[0]=='administrative_area_level_2'){
        database.cityPrice.find({CityName:val.long_name},function(er, city){
          database.customer.findOne({CustID:req.cookies.CustID},function(ee,cust){
            if(cust){
              generalPriceperKm=cust.generalPriceperKm;
              generalMinimumprice=cust.generalMinimumprice;
              generalMinimumKm=cust.generalMinimumKm;
              generalBasePrice=cust.generalBasePrice;
              preRidePriceperKm=cust.preRidePriceperKm;
              preRideperMinutCharge=cust.preRideperMinutCharge;
              GenarelPerMinutCharge=cust.GenarelPerMinutCharge;
              shereRide=cust.shereRide;
              shereRideCapacity=cust.shereRideCapacity
              driverPayout=cust.driverPayout;

              city.forEach(function(value, kk, array){
                var key=Number(value.travelMode) - 1;
                generalPriceperKm[key]=Number(value.PerKMPrice);
                generalMinimumprice[key]=Number(value.minimumPricePer);
                generalMinimumKm[key]=Number(value.minimumKM);
                generalBasePrice[key]=Number(value.basePrice);
                preRidePriceperKm[key]=Number(value.preRidekmprice);
                preRideperMinutCharge[key]=Number(value.preRideperMinutCharge);
                GenarelPerMinutCharge[key]=Number(value.GenarelPerMinutCharge);
                shereRide[key]=Number(value.shareRide);
                shereRideCapacity[key]=Number(value.shereRideCapacity)
                driverPayout[key]=Number(value.driverpayout)
                
                if(kk===array.length -1){
                    console.log("preRidePriceperKm",shereRide)
                    database.customer.findOneAndUpdate({CustID:req.cookies.CustID},{$set:{
                      generalPriceperKm:generalPriceperKm,
                      generalMinimumprice:generalMinimumprice,
                      generalMinimumKm:generalMinimumKm,
                      generalBasePrice:generalBasePrice,
                      preRidePriceperKm:preRidePriceperKm,
                      preRideperMinutCharge:preRideperMinutCharge,
                      GenarelPerMinutCharge:GenarelPerMinutCharge,
                      shereRide:shereRide,
                      shereRideCapacity:shereRideCapacity,
                      driverPayout:driverPayout,
                      lastPriceCityCheckDate:new Date(),
                      }},function(e,d){
                        res.send("price Update")
                      });
                 
                }
              })
              
            }
          });
         
        });  
          
          }
    });
});
    

})



 


////////PRE RIDE BACGROUND LOCATION UPDATE IN  NATIVE DEDICE////
router.get('/preRideBacgroundService', function(req, res, next) {
  if(req.cookies.pilotID){   
   res.render('india/inPreDriverBackGroundService',{YOUR_API_KEY:process.env.API_KEY}) 
  }
});

//////For ANDROID//////
router.post('/locationUpdate', function(req, res, next) {

console.log("Android Respons",req.body);
res.status(200).send();
});

////////DriverLocationUpdate/////////
router.post('/driverLocationUpdate', function(req, res, next) { 
  res.cookie("position",JSON.stringify({lat:req.body.lat, lng:req.body.lng, accuracy:req.body.accuracy}),{maxAge: 5*60*1000 });
  database.pilot.findOne({pilotID:req.cookies.pilotID},function(err,pilot){
    if(pilot){
      database.driverlocation.findOne({pilotID:req.cookies.pilotID},function(err,data){
        if(data){
          database.driverlocation.findOneAndUpdate({pilotID:req.cookies.pilotID},{$set:{
            pilotID:req.cookies.pilotID,            
            DriverType:req.body.DriverType,
            rating:pilot.rating,
            travelmod:pilot.travelmod,
            accountStatus:pilot.accountStatus, 
            preRideTotalTime:pilot.preRideTotalTime,                  
            location:{type:'Point',coordinates:[req.body.lng, req.body.lat]},
          }},function(er, dd){
            res.send(req.body)
          });
        }else{
          database.driverlocation({
            pilotID:req.cookies.pilotID,            
            DriverType:req.body.DriverType,
            rating:pilot.rating,
            travelmod:pilot.travelmod,
            accountStatus:pilot.accountStatus, 
            preRideTotalTime:pilot.preRideTotalTime,                   
            location:{type:'Point',coordinates:[req.body.lng, req.body.lat]},
          }).save(function(err){
            res.send(req.body)
          })
        }
      });

    }
  });

});





///////////////////////////////////////
///* END PRE DRIVER LISTING. */////////////
///////////////////////////////////////

///////////////////////////////////////
///* PAYTM PAY. */////////////
///////////////////////////////////////
router.post('/walletOrderCount', function(req, res, next) {
  
database.walletOrderCouner.findOne({},function(err,data){
  if(Number(data.walletOrderID)>0){
    var WOrderID=Number(data.walletOrderID)+1 ;
    database.walletOrderCouner.findOneAndUpdate({walletOrderID:data.walletOrderID},{$set:{walletOrderID:WOrderID}},function(er, upda){
      res.send({WOrderID:WOrderID});
    });
  }else{
    database.walletOrderCouner({walletOrderID:'1'}).save(function(ree){
    res.send({WOrderID:1});
    });
  }
});

});


router.post('/pay', function(req, res, next) {
console.log(req.body)

let data = {
  TXN_AMOUNT : req.body.rechrgAmt, // request amount
  ORDER_ID : req.body.walletOrderid, // any unique order id 
  CUST_ID : req.body.CustID // any unique customer id		
}

req.session.paymentData=data;

 // create Paytm Payment
 paytm.createPayment(config,data,function(err,data){
  if(err){
     console.log(err);
  }

  //success will return

  /*{ 
      MID: '###################',
      WEBSITE: 'DEFAULT',
      CHANNEL_ID: 'WAP',
      ORDER_ID: '#########',
      CUST_ID: '#########',
      TXN_AMOUNT: '##',
      CALLBACK_URL: 'localhost:8080/paytm/webhook',
      INDUSTRY_TYPE_ID: 'Retail',
      url: 'https://securegw-stage.paytm.in/order/process',
      checksum: '####################################' 
  }*/

  //store the url and checksum
  let url = data.url;
  let checksum = data.checksum;
  req.session.checksum=checksum;
  /* Prepare HTML Form and Submit to Paytm */
  res.writeHead(200, {'Content-Type': 'text/html'});
  res.write('<html>');
  res.write('<head>');
  res.write('<title>Merchant Checkout Page</title>');
  res.write('</head>');
  res.write('<body>');
  res.write('<center><h1>Please do not refresh this page...</h1></center>');
  res.write('<form method="post" action="' + url + '" name="paytm_form">');
  for(var x in data){
      res.write('<input type="hidden" name="' + x + '" value="' + data[x] + '">');
  }
  res.write('<input type="hidden" name="CHECKSUMHASH" value="' + checksum + '">');
  res.write('</form>');
  res.write('<script type="text/javascript">');
  res.write('document.paytm_form.submit();');
  res.write('</script>');
  res.write('</body>');
  res.write('</html>');
  res.end();
  });

});

router.post('/paytm', function(req, res, next) {
  console.log('PayTM data', req.session.paymentData);
  
  
////Payment Validate//////
paytm.validate(config,req.body,function(err,data){
  if(err){console.log(err)}
  if(data.status == 'verified'){
    paytm.status(config,req.session.paymentData.ORDER_ID,function(err,data){
      if(err){console.log(err)}
      database.customer.findOne({CustID:req.cookies.CustID},function(er, cust){
        if(cust){
          var waletBalance=Number(cust.walletBalance) + Number(data.TXNAMOUNT);

          database.customer.findOneAndUpdate({CustID:req.cookies.CustID},{$set:{walletBalance:waletBalance}},function(ert,dd){
            
            res.redirect('/india')
          });
        }
      });

      
  
  
      // data will contain order details
    })  
  }

  
})



});

///////////////////////////////////////
///* PAYTM PAY END. */////////////
///////////////////////////////////////

router.post('/trstloop', function(req,res,next){
  setTimeout(function(){
    res.send({bookings:req.body.pilotID})
  },5000)
})

//for(var i=0; i<10; i++){
// database.index2Ddriver({},function(ss){
//   database.driverLocationArea.find({
//     location: {
//       $near: {
//         $geometry: {
//            type: "Point" ,
//            coordinates: [ Number(87.84598852164488), Number(22.973649017041968) ]
//         },$maxDistance : 3000
//       }
//     },accountStatus:'Active',travelmod:"1",DriverType:"preRide",driverBusy:"free"
//   },function(e,freeDriver){
//     console.log("freeDriver",freeDriver)
//   })
// })

//  database.index2DdriverDroplocation({},function(ss){

//   database.driverdroplocation.find({
//     droplocation: {
//           $near: {
//             $geometry: {
//                type: "Point" ,
//                coordinates: [ Number(87.84598852164488), Number(22.973649017041968) ]
//             },$maxDistance : 3000
//           }
//         },accountStatus:'Active',travelmod:"1",DriverType:"preRide"
//       },function(e,busyDriver){
//         console.log("busyDriver",busyDriver)
//       })
// })
// }
         
          
       


module.exports = router;
