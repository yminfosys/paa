var express = require('express');
var router = express.Router();
var googleApi=require('../module/googleMap');
var database=require('../module/database');

router.get('/sub', function(req, res, next) {

    res.render('admin/appAdminSub', { title: 'Paacab' });
  });
  

module.exports = router;
