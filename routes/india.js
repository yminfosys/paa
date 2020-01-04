var express = require('express');
var router = express.Router();
var googleApi=require('../module/googleMap');
var database=require('../module/database');
const fileUpload = require('express-fileupload');
const bcrypt = require('bcrypt');

const saltRounds = 10;

router.use(fileUpload({

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
    apik:process.env.API_KEY
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
    apik:process.env.API_KEY
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
    apik:process.env.API_KEY
},function(result){
  //console.log(JSON.stringify(result) )
  res.send(result)
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

///////////////////////////////////////
///* END DRIVER LISTING. */////////////
///////////////////////////////////////
module.exports = router;
