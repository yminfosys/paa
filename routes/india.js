var express = require('express');
var router = express.Router();
var googleApi=require('../module/googleMap');
var database=require('../module/database');
const fileUpload = require('express-fileupload');
const bcrypt = require('bcrypt');
const saltRounds = 10;

const moment = require('moment');


router.use(fileUpload({
 
  useTempFiles : true,
    tempFileDir : '/tmp/'
}));

///////////////////////////////////////
///* CUSTOMER LISTING. *///////////////
///////////////////////////////////////
router.get('/', function(req, res, next) {  
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
          /////check Prise manager///////
          database.priceOffer.findOne({CustID:user.CustID},function(err, price){
            if(!price){
              ///////// Add Price manager/////
              ;
              for(var mod =1; mod < 5; mod++){
                console.log('mode',mod);
                for(var km =1; km < 101; km++){
                  console.log('mode',km);
                  var pric=km*12*mod;
                  if(km==1){
                    pric=3*mod;
                  }
                  if(km==2){
                    pric=8*mod;
                  }
                  if(km==3){
                    pric=18*mod;
                  }
                  database.priceOffer({
                    CustID:user.CustID,
                    travelmod:mod,
                    price:pric,                     
                    distanceKM:km,
                  }).save(function(erro){

                  });
                }
              }
            }
          });
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
      location:{type:'Point',coordinates:[req.body.lng, req.body.lat]}
      //location:{type:'Point',coordinates:[1.00001, 1.0001]}
    }).save(function(err){
      database.priceOffer({})
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
  database.index2Dpilot({},function(ss){
    database.pilot.find({
          location: {
            $near: {
              $geometry: {
                 type: "Point" ,
                 coordinates: [ Number(req.body.lng), Number(req.body.lat) ]
              },$maxDistance : 4000
            }
          },duty:'online',travelmod:req.body.travelmod
        },function(e,data){
        console.log('test nearby',JSON.stringify(data) );
          res.send(data);
        })
  });

});

  



/////For Neareast One Calculation //////
router.post('/nearbytime', function(req, res, next) {
  console.log('myposition',req.body)
  database.index2Dpilot({},function(ss){
    database.pilot.find({
          location: {
            $near: {
              $geometry: {
                 type: "Point" ,
                 coordinates: [ Number(req.body.lng), Number(req.body.lat) ]
              },$maxDistance :4000
            }
          },duty:'online',travelmod:req.body.travelmod
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
  googleApi.placeByadds({
  address:req.body.address,
  apik:process.env.API_KEY
},function(result){
  //console.log(JSON.stringify(result) )
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

  database.priceOffer.findOne({CustID:req.cookies.CustID,travelmod:req.body.travelmod,distanceKM:req.body.distance},function(err , data){
    if(data){
      res.send({price:data.price,travelmod:data.travelmod});
      console.log(data);
    }
  });

});

/////For Neareast RideBooking//////
router.post('/nearbyRideBooking', function(req, res, next) {    
  database.index2Dpilot({},function(ss){
    database.pilot.find({
          location: {
            $near: {
              $geometry: {
                 type: "Point" ,
                 coordinates: [ Number(req.body.lng), Number(req.body.lat) ]
              },$maxDistance : 4000
            }
          },duty:'online',travelmod:req.body.travelmod
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

  //////DELETE ALL DEMAND /////////
var  DemandTime;
  function deleteDemand(){    
    DemandTime=setInterval(function(){
      database.demandArea.deleteMany({},function(e, d){
        console.log("Reset Demand")
      });
    }, 1000*60*5);
    
  }
  
  deleteDemand();

///////////////////////////////////////
///* END CUSTOMER LISTING. *///////////
///////////////////////////////////////

///////////////////////////////////////
///* RIDE PAGE LISTING. *///////////
///////////////////////////////////////


  /////Listin Cust Ride Conform//////    
    router.get('/ride', function(req, res, next) {
      if(req.cookies.CustID){         
        database.pilot.findOne({CustID:req.body.CustID},function(err,cust){     
        res.render('india/inCustRideConfrm',{YOUR_API_KEY:process.env.API_KEY,orderStage:cust.orderStage})
        })
      }else{
        res.redirect('/india/login')
      }
      
    });

  
////////Call Driver Requiest notification/////
router.post('/rideDriverBookingDetails', function(req, res, next) {
  database.pilot.findOne({pilotID:req.body.pilotID},function(err,driver){
    database.ride.findOne({bookingID:req.body.bookingID},function(err,ride){
      res.send({driver:driver,ride:ride});
    });  
  }); 
 
});

////////getDriverposition/////
router.post('/getDriverposition', function(req, res, next) {
  database.pilot.findOne({pilotID:req.body.pilotID},function(err,driver){
   console.log(driver.location.coordinates);
   res.send(driver.location.coordinates) 
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
  database.customer.findOneAndUpdate({CustID:req.cookies.CustID},{$set:{orderStage:" "}},function(er,data){
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

  //////////Update Driver Location//////
  router.post('/drv/driverLocatioUpdate', function(req, res, next) {
    console.log('body',req.body)
    database.pilot.findOneAndUpdate({pilotID:req.cookies.pilotID},{$set:{location:{type:'Point',coordinates:[req.body.lng, req.body.lat]}}},function(err,data){
    console.log(data)
    });
    res.send(req.body.lat)
    
  });

   //////////Update Driver Duty Offline and online//////
   router.post('/drv/dutyUpdate', function(req, res, next) {
    database.pilot.findOneAndUpdate({pilotID:req.cookies.pilotID},{$set:{duty:req.body.duty}},function(err,data){
      if(data){
        res.send(req.body.duty)
      }
   });
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
      database.customer.findOneAndUpdate({CustID:req.body.CustID},{$set:{orderStage:'accept'}},function(er,cust){
        database.pilot.findOneAndUpdate({pilotID:req.body.pilotID},{$set:{duty:'offline',orderStage:'accept'}},function(re, ou){
          res.io.emit("DriverAccepeCall",{pilotID:req.body.pilotID,CustID:req.body.CustID,pickuoAddress:req.body.pickuoAddress,bookingID:req.body.bookingID,RideOTP:OTP});
          res.send({ride:ride,cust:cust,RideOTP:OTP});
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
      res.io.emit("StartRide",{CustID:req.body.CustID});
      res.send("emitStartRide") 
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
        var finishLocation=driver.location.coordinates;
        var travelmod=driver.travelmod;
            googleApi.distance({
              origins:''+Number(req.body.picuklat)+', '+Number(req.body.picuklng)+'',              
              destinations:''+Number(finishLocation[1])+','+Number(finishLocation[0])+'',
              apik:process.env.API_KEY,
              travelmod:travelmod
          },function(result){
            var distance=result.rows[0].elements[0].distance.value;                        
              distance=parseInt(distance/1000) + 1; 
                database.priceOffer.findOne({travelmod:travelmod,distanceKM:distance},function(e,price){
                  console.log("Price :",price.price, "Bookin Price", Booking.totalamount)
                  var billAmount=0;
                  var driverpayout=Number(distance) *6;                  
                  if(price.price >= Booking.totalamount){
                     billAmount=price.price;
                    
                  }else{
                     billAmount=Booking.totalamount;                     
                  }
                  /////send  and update bill details/////
                  database.ride.findOneAndUpdate({bookingID:req.body.bookingID},{$set:{totalamount:billAmount,driverpayout:driverpayout}},function(er, updatbooking){ 
                    if(updatbooking){
                      res.io.emit("finishRide",{CustID:req.body.CustID});
                      res.send({billAmount:billAmount}); 
                      
                    }
                  });
                  

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
    pilotID:req.cookies.pilotID
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
module.exports = router;
