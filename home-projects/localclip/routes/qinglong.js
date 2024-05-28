var express = require('express');
var router = express.Router();

const { QL } = require('../services/qlService');
const ql = require('../services/qlService');

//ql
router.get('/', (req, res) => {
    try {
        ql.goQlIndex(res);
    } catch (error) {
        console.log(error);
        res.status(500).send('Failed to get environment variables');
    }
});


router.use('/getEnvs', async (req, res) => {
    try {
        const envs = await QL.getEnvs();
        res.json(envs);
    } catch (error) {
        console.log(error);
        res.status(500).send('Failed to get environment variables');
    }
});


router.use('/getTypeEnv', async (req, res) => {
    try {
        await ql.getTypeEnv(req, res);
    } catch (error) {
        console.log(error);
        res.status(500).send('Failed to get environment variables');
    }
});

router.use('/toggleStatus', async (req, res) => {
    try {
        return await ql.toggleStatus(req, res);
    } catch (error) {
        console.log(error);
        res.status(500).send('Failed to get environment variables');
    }
});

router.use('/updateEnvById', async (req, res) => {
    try {
        return await ql.updateEnvById(req, res);
    } catch (error) {
        console.log(error);
        res.status(500).send('Failed to get environment variables');
    }
});

router.use('/disableOther', async (req, res) => {
    try {
        return await ql.disableOther(req, res);
    } catch (error) {
        console.log(error);
        res.status(500).send('Failed to get environment variables');
    }
});

router.use('/specifiedWskeyToCk', async (req, res) => {
    try {
        let id = req.body.id;
        let pageIds = req.body.pageIds;
        if( await ql.specifiedWskeyToCk(id, pageIds)){
            res.json({ id: id, status: 0 });
        }else{
            res.status(500).send('Failed to get environment variables1');
        }
    } catch (error) {
        console.log(error);
        res.status(500).send('Failed to get environment variables');
    }
});

router.use('/startRunCrons', async (req, res) => {
    try {
        return await ql.startRunCrons(req, res);
    } catch (error) {
        console.log(error);
        res.status(500).send('Failed to get environment variables');
    }
});

router.use('/getCronsLog', async (req, res) => {
    try {
        return await ql.getCronsLog(req, res);
    } catch (error) {
        console.log(error);
        res.status(500).send('Failed to get environment variables');
    }
});

module.exports = router;
