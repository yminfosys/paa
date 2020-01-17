var express = require('express');
var router = express.Router();
var googleApi=require('../module/googleMap');
var database=require('../module/database');
const fileUpload = require('express-fileupload');
const bcrypt = require('bcrypt');

const saltRounds = 10;

router.use(fileUpload({
  limits: { fileSize: 500000000 },
  useTempFiles : true,
    tempFileDir : '/tmp/'
}));

///////////////////////////////////////
///* CUSTOMER LISTING. *///////////////
///////////////////////////////////////
router.get('/', function(req, res, next) {
  //res.send('respond with a resource I am INDIA');
  if(req.cookies.CustID){
    res.render('india/inCust',{YOUR_API_KEY:process.env.API_KEY})
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
///////////////////////////////////////
///* END CUSTOMER LISTING. *///////////
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

        res.render('india/inDriver',{YOUR_API_KEY:process.env.API_KEY});
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
      location:{type:'Point',coordinates:[req.body.lng, req.body.lat]}
      //location:{type:'Point',coordinates:[1.00001, 1.0001]}
    }).save(function(err){
      
      res.redirect('/india/drv/login?msg=Registration Success');
        }); 
    }); 

  });


   ///////Continue Registration process////////
router.post('/drv/completeReg', function(req, res, next) {
     
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

    // database.pilot.findOneAndUpdate({mobileNumber:req.body.mobile, isdCode:req.body.isd},{$set:{
    //   document:{photo:urlphoto,Idproof:urlid,dl:urldl,rto:urlrto,insurence:urlinsu,polution:urlpolu}
    // }},function(e,d){

    // });
        

  
  //res.redirect('/india/drv')
res.send(req.files)


  });

///////////////////////////////////////
///* END DRIVER LISTING. */////////////
///////////////////////////////////////
module.exports = router;
