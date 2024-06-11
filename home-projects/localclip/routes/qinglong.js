var express = require('express');
var router = express.Router();

const { QL } = require('../services/qlService');
const ql = require('../services/qlService');

//ql
// router.get('/public/vue', (req, res) => {
//     try {
//         ql.goQlIndex(res);
//     } catch (error) {
//         console.log(error);
//         res.status(500).send('Failed to get environment variables');
//     }
// });


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
        await ql.updateEnvById(req, res);
    } catch (error) {
        console.log(error);
        res.status(500).send('Failed to get environment variables');
    }
});

router.use('/disableOtherCk', async (req, res) => {
    try {
        return await ql.disableOtherCk(req, res);
    } catch (error) {
        console.log(error);
        res.status(500).send('Failed to get environment variables');
    }
});

router.use('/disableEnvByName', async (req, res) => {
    try {
        return await ql.disableEnvByName(req, res);
    } catch (error) {
        console.log(error);
        res.status(500).send('Failed to get environment variables');
    }
});

router.use('/enableEnvByName', async (req, res) => {
    try {
        return await ql.enableEnvByName(req, res);
    } catch (error) {
        console.log(error);
        res.status(500).send('Failed to get environment variables');
    }
});

router.use('/specifiedWskeyToCk', async (req, res) => {
    try {
        let id = req.body.id;
        let pageIds = req.body.pageIds;

        let obj = await ql.specifiedWskeyToCk(id, pageIds);
        if (obj.result) {
            res.json({ id: id, ...obj });
        } else {
            res.status(500).send('Failed to get environment variables1');
        }
    } catch (error) {
        console.log(error);
        res.status(500).send('Failed to get environment variables');
    }
});

router.use('/startStopCrons', async (req, res) => {
    try {
        return await ql.startStopCrons(req, res);
    } catch (error) {
        console.log(error);
        res.status(500).send('Failed to get environment variables');
    }
});

router.use('/getCronsLog', async (req, res) => {
    try {
        let id = req.body.id;
        return await ql.getCronsLogById(id, res);
    } catch (error) {
        console.log(error);
        res.status(500).send('Failed to get environment variables');
    }
});

router.use('/getLatestWsckLog', async (req, res) => {
    try {
        return await ql.getLatestWsckLog(req, res);
    } catch (error) {
        console.log(error);
        res.status(500).send('Failed to get environment variables');
    }
});

router.use('/getCornInfoById', async (req, res) => {
    try {
        return await ql.getCornInfoById(req, res);
    } catch (error) {
        console.log(error);
        res.status(500).send('Failed to get environment variables');
    }
});

router.use('/getLatestLogById', async (req, res) => {
    try {
        return await ql.getLatestLogById(req, res);
    } catch (error) {
        console.log(error);
        res.status(500).send('Failed to get environment variables');
    }
});

router.use('/getCornTaskAndLog', async (req, res) => {
    try {
        let type = req.body.type;
        return await ql.getCornTaskAndLog(type, res);
    } catch (error) {
        console.log(error);
        res.status(500).send('Failed to get environment variables');
    }
});

module.exports = router;
