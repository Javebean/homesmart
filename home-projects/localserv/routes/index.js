var express = require('express');
const path = require('path')
var router = express.Router();

const clipService = require('../services/clipService');

/* GET home page. */
router.get('/', (req, res) => {
  clipService.goHome(res);
});

router.post('/saveOrUpdateMessage', function (req, res, next) {
  if (req.body) {
    let id = clipService.saveOrUpdateMessage(req.body);
    res.json({ id: id });
  } else {
    res.status(400).send("Bad Request");
  }
});


router.get('/getMessageList', function (req, res, next) {
  let list = clipService.readMessage();
  res.json(list);
});

router.post('/deleteById', function (req, res, next) {
  return clipService.deleteById(req, res);
});



router.post('/upload', clipService.uploadFiles);

module.exports = router;
