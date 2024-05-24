var express = require('express');
var router = express.Router();

const ql = require('../services/qlService');


/* GET users listing. */
router.use('/getEnvs', function(req, res, next) {
 ql.getEnvs();
});

module.exports = router;
