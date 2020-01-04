var express = require('express');
var router = express.Router();
///////////////////////////////////////
///* CUSTOMER LISTING. *///////////////
///////////////////////////////////////
router.get('/', function(req, res, next) {
  //res.send('respond with a resource I am INDIA');
  if(req.cookies.custID){
    res.render('bangladesh/bdCust',{})
  }else{
    res.redirect('/bangladesh/login')
  }
  
});
router.get('/login', function(req, res, next) {
  //res.send('respond with a resource I am INDIA');
  res.render('bangladesh/bdCustLogin',{})
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
