var express = require('express');
var router = express.Router();
var googleApi=require('../module/googleMap');
var database=require('../module/database');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});
router.get('/driver', function(req, res, next) {
  res.render('indexDriver', { title: 'Express' });
});

router.get('/rider', function(req, res, next) {
  res.render('indexRider', { title: 'Express' });
});

router.get('/cust', function(req, res, next) {

  res.render('appCust', { title: 'Paacab' });
});

router.get('/privacy', function(req, res, next) {

  res.render('privacy', { title: 'Paacab' });
});

router.get('/drive', function(req, res, next) {

  res.render('appDriver', { title: 'Paacab' });
});
router.get('/preDrive', function(req, res, next) {

  res.render('appPreDriver', { title: 'Paacab' });
});

router.post('/geoplace', function(req, res, next) { 
  googleApi.SearchGeoCodePlaceByLatLng({
    lat:Number(req.body.lat),
    lng:Number(req.body.lng),
    apik:process.env.API_KEY,
 },function(data){
//console.log(data.results[0].address_components);
data.results[0].address_components.forEach(function(val){
  //console.log(val.types[0]); 
  if(val.types[0]=='country'){
    console.log(val.long_name);
    res.send(val.long_name); 
  }
    })
 });
});
router.get('/driver', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

module.exports = router;
