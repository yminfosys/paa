var express = require('express');
var router = express.Router();
var googleApi=require('../module/googleMap');
var database=require('../module/database');


router.get('/', function(req, res, next) {
  res.render('admin/admin.ejs', { title: 'Paacab' });
});

router.post('/addnewPrice', function(req, res, next) {
 //res.send(req.body);
database.cityPrice.findOne({CityName: req.body.city, travelMode: req.body.travelmode},function(err, city){
if(city){
  database.cityPrice.findOneAndUpdate({CityName: req.body.city, travelMode: req.body.travelmode},{$set:{
    CityName:req.body.city,
    preRidekmprice:req.body.preRidekmprice,
    PerKMPrice:req.body.kmprice,
    basePrice:req.body.basePrice,
    minimumPricePer:req.body.minimumprice,
    minimumKM:req.body.minimumkm,
    travelMode: req.body.travelmode,    
    rideIncetiv:req.body.incentive,
    driverpayout:req.body.driverpayout,
    shareRide:req.body.shareride,
    shereRideCapacity:req.body.passengerCapacity,
    preRideperMinutCharge:req.body.preRidePerminuteCharge,
    GenarelPerMinutCharge:req.body.gneralPreMuniteCharge
  }},function(er ,data){
    res.redirect('/admin');
  });

}else{
  database.cityPrice({
    CityName:req.body.city,
    preRidekmprice:req.body.preRidekmprice,
    PerKMPrice:req.body.kmprice,
    basePrice:req.body.basePrice,
    minimumPricePer:req.body.minimumprice,
    minimumKM:req.body.minimumkm,
    travelMode: req.body.travelmode,    
    rideIncetiv:req.body.incentive,
    driverpayout:req.body.driverpayout,
    shareRide:req.body.shareride,
    shereRideCapacity:req.body.passengerCapacity,
    preRideperMinutCharge:req.body.preRidePerminuteCharge,
    GenarelPerMinutCharge:req.body.gneralPreMuniteCharge
  }).save(function(err){
   res.redirect('/admin');
  })

}

})




  

  
});

router.post('/getCityprice', function(req, res, next) {
  database.cityPrice.find({},function(err, data){
    console.log(data)
    res.send(data);
  })
})



router.get('/sub', function(req, res, next) {
  database.cityPrice.find({},function(e , city){
    database.petroldesel.find({},function(e, petrol){
      res.render('admin/appAdminSub', { title: 'Paacab', city:city,petrol:petrol});
    })
   
  })

  
});

  router.post('/findDriver', function(req, res, next) {
    database.pilot.findOne({mobileNumber:req.body.mobile,isdCode:req.body.isd},function(err,data){
      if(data){
        res.send(data);
      }else{
        res.send('worng');
      }
      
    });
    
  }); 
  router.post('/verifyDriver', function(req, res, next) {
    console.log(req.body)
    database.pilot.findOneAndUpdate({mobileNumber:req.body.mobile,isdCode:req.body.isd},{$set:{completereg:'done',accountStatus:'Active'}},function(err,data){
      if(data){
        res.send('veryfied');
        console.log(data)
      }else{
        res.send('worng');
      }
      
    });
    
  }); 
  
  router.post('/updateBasicDetails', function(req, res, next) {
    database.pilot.findOneAndUpdate({mobileNumber:req.body.mobile,isdCode:req.body.isd},{$set:{
      vichelEnginType:req.body.engintype,  
      enginMilege:req.body.milege,
      cityName:req.body.driverCity,
    }},function(err,data){
      res.send("Update Successfull");
    });

  });

  router.post('/updatedisealPetrol', function(req, res, next) {
    database.petroldesel.findOne({cityName:req.body.city},function(e,dd){
      if(dd){
        database.petroldesel.findOneAndUpdate({cityName:req.body.city},{$set:{
          petrolPerLtr:req.body.petrol,
          deselPerLtr:req.body.diesel,
          cngPrice: req.body.cng,
          cityName:req.body.city
        }},function(e,data){
          res.send("ok")
        })
      }else{
        database.petroldesel({
          petrolPerLtr:req.body.petrol,
          deselPerLtr:req.body.diesel,
          cngPrice: req.body.cng,
          cityName:req.body.city
        }).save(function(er){
          res.send("ok")
        })
      }
    })
  })
 
  
  

module.exports = router;
