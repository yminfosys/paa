var express = require('express');
var router = express.Router();
///////////////////////////////////////
///* CUSTOMER LISTING. *///////////////
///////////////////////////////////////
router.get('/', function(req, res, next) {
 
  if(req.cookies.custID){
    res.render('uk/ukCust',{})
  }else{
    res.redirect('/uk/login')
  }
  
});
router.get('/login', function(req, res, next) {
  //res.send('respond with a resource I am INDIA');
  res.render('uk/ukCustLogin',{})
});
///////////////////////////////////////
///* END CUSTOMER LISTING. *///////////
///////////////////////////////////////

///////////////////////////////////////
///* DRIVER LISTING. *///////////////
///////////////////////////////////////
router.get('/drv', function(req, res, next) {
  //res.send('respond with a resource I am INDIA');
  if(req.cookies.CustID){
    res.render('uk/inDriver',{YOUR_API_KEY:process.env.API_KEY})
  }else{
    res.redirect('/uk/drv/login')
  }
})

  router.get('/drv/login', function(req, res, next) {
    //res.send('respond with a resource I am INDIA');
    res.send("driver login")
  });
///////////////////////////////////////
///* END DRIVER LISTING. */////////////
///////////////////////////////////////

module.exports = router;
