var express = require('express');
var router = express.Router();
var googleApi=require('../module/googleMap');
var database=require('../module/database');


router.get('/', function(req, res, next) {
  res.render('admin/admin.ejs', { title: 'Paacab' });
});

router.post('/addnewPrice', function(req, res, next) {
// res.send(req.body);
database.cityPrice.findOneAndUpdate({CityName: req.body.city},{$set:{
  CityName: req.body.city,
  preRidekmprice:req.body.preRidekmprice,
  PerKMPrice:req.body.kmprice,
  minimumPricePer:req.body.minimumprice,
  minimumKM:req.body.minimumkm,
  travelMode: req.body.travelmode,    
  rideIncetiv:req.body.incentive,
  driverpayout:req.body.driverpayout
}},function(er ,data){
  if(data){
    res.redirect('/admin');
  }else{
    database.cityPrice({
      CityName: req.body.city,
      preRidekmprice:req.body.preRidekmprice,
      PerKMPrice:req.body.kmprice,
      minimumPricePer:req.body.minimumprice,
      minimumKM:req.body.minimumkm,
      travelMode: req.body.travelmode,    
      rideIncetiv:req.body.incentive,
      driverpayout:req.body.driverpayout
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

    res.render('admin/appAdminSub', { title: 'Paacab' });
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
  

module.exports = router;
