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

router.use('/addEnvs', async (req, res) => {
    try {
        await ql.addEnvs(req, res);
    } catch (error) {
        console.log(error);
        res.status(500).send('Failed to get environment variables');
    }
});

router.use('/delEnvs', async (req, res) => {
    try {
        await ql.delEnvs(req, res);
    } catch (error) {
        console.log(error);
        res.status(500).send('Failed to get environment variables');
    }
});

//把文本转换为wsck对象数组，放入指定环境变量
router.use('/parseWsck', async (req, res) => {
    try {
        await ql.parseWsck(req, res);
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

router.use('/getCronsViews', async (req, res) => {
    try {
        await ql.getCronsViews(req, res);
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
        let obj = await ql.specifiedWskeyToCk(req, res);
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

router.use('/enOrDisableCrons', async (req, res) => {
    try {
        return await ql.enOrDisableCrons(req, res);
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

router.use('/getTaskLogsByIds', async (req, res) => {
    try {
        let ids = req.body.ids;
        return await ql.getTaskLogsByIds(ids, res);
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
        return await ql.getCornTaskAndLog(req, res);
    } catch (error) {
        console.log(error);
        res.status(500).send('Failed to get environment variables');
    }
});

router.use('/getCornTaskAndLog2', async (req, res) => {
    try {
        let type = req.body.type;
        return await ql.getCornTaskAndLog2(type, res);
    } catch (error) {
        console.log(error);
        res.status(500).send('Failed to get environment variables');
    }
});

router.use('/getInitInfo', async (req, res) => {
    try {
        return await ql.getInitInfo(req, res);
    } catch (error) {
        console.log(error);
        res.status(500).send('Failed to backupEnv');
    }
});

router.use('/backupEnv', async (req, res) => {
    try {
        return await ql.backupEnv(req, res);
    } catch (error) {
        console.log(error);
        res.status(500).send('Failed to backupEnv');
    }
});

router.use('/getBackupEnvList', async (req, res) => {
    try {
        return await ql.getBackupEnvList(req, res);
    } catch (error) {
        console.log(error);
        res.status(500).send('Failed getBackupEnvList');
    }
});

module.exports = router;
