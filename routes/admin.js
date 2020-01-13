var express = require('express');
var router = express.Router();
var googleApi=require('../module/googleMap');
var database=require('../module/database');

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
