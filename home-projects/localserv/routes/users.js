var express = require('express');
var router = express.Router();

const ql = require('../services/qlService');


/* GET users listing. */
router.use('/u', function(req, res, next) {
  res.send('respond with a resource');
});

module.exports = router;
