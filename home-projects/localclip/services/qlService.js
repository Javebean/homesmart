const axios = require('axios');
const path = require('path')
const fs = require('fs');


// 该路径可覆盖public下的index.html
// const indexSource = path.join(__dirname, '..', 'public', 'qlhelp.html');
// const indexDest = path.join(__dirname, '..', 'data', 'qlhelp.html');
// let goQlIndex = function (res) {
//     if (!fs.existsSync(indexDest)) {
//         // indexpath
//         fs.copyFile(indexSource, indexDest, (err) => {
//             if (err) {
//                 return console.error('文件复制失败：', err);
//             }
//             res.sendFile(indexDest);
//         });
//     } else {
//         res.sendFile(indexDest);
//     }
// }
const vueIndex = path.join(__dirname, '..', 'public', 'vue', 'index.html');
let goQlIndex = function (res) {
    res.sendFile(vueIndex);
}

class QL {
    constructor(address, id, secret) {
        this.address = address;
        this.id = id;
        this.secret = secret;
        this.valid = true;
        this.auth = '';
        this.login();
    }

    log(content) {
        console.log("日志：" + content);
    }

    async login() {
        const url = `${this.address}/open/auth/token?client_id=${this.id}&client_secret=${this.secret}`;
        try {
            const response = await axios.get(url);
            const { data } = response;
            if (data.code === 200) {
                this.auth = `${data.data.token_type} ${data.data.token}`;
                this.log(`登录成功`);
            } else {
                this.log(`登录失败：${data.message}`);
            }
        } catch (error) {
            this.valid = false;
            this.log(`登录失败：${error.message}`);
        }
    }

    async getEnvs() {
        const url = `${this.address}/open/envs?searchValue=`;
        const headers = { Authorization: this.auth };
        try {
            const response = await axios.get(url, { headers });
            const { data } = response;
            if (data.code === 200) {
                return data.data;
            } else {
                this.log(`获取环境变量失败：${data.message}`);
            }
        } catch (error) {
            this.log(`获取环境变量失败：${error.message}`);
        }
    }

    async deleteEnvs(ids) {
        const url = `${this.address}/open/envs`;
        const headers = { Authorization: this.auth, 'content-type': 'application/json' };
        try {
            const response = await axios.delete(url, { headers, data: ids });
            const { data } = response;
            if (data.code === 200) {
                this.log(`删除环境变量成功：${ids.length}`);
                return true;
            } else {
                this.log(`删除环境变量失败：${data.message}`);
                return false;
            }
        } catch (error) {
            this.log(`删除环境变量失败：${error.message}`);
            return false;
        }
    }

    async addEnvs(envs) {
        const url = `${this.address}/open/envs`;
        const headers = { Authorization: this.auth, 'content-type': 'application/json' };
        try {
            const response = await axios.post(url, envs, { headers });
            const { data } = response;
            if (data.code === 200) {
                this.log(`新建环境变量成功：${envs.length}`);
                return true;
            } else {
                this.log(`新建环境变量失败：${data.message}`);
                return false;
            }
        } catch (error) {
            this.log(`已存在键值唯一键: ${error.response.data.message}`);
            return false;
        }
    }

    async updateEnv(env) {
        const url = `${this.address}/open/envs`;
        const headers = { Authorization: this.auth, 'content-type': 'application/json' };
        try {
            const response = await axios.put(url, env, { headers });
            const { data } = response;
            if (data.code === 200) {
                this.log(`更新环境变量成功`);
                return true;
            } else {
                this.log(`更新环境变量失败：${data.message}`);
                return false;
            }
        } catch (error) {
            console.log(error.response.data.validation);

            this.log(`更新环境变量失败：${error}`);
            return false;
        }
    }

    async enableEnvStatus(env) {
        const url = `${this.address}/open/envs/enable`;
        const headers = { Authorization: this.auth, 'content-type': 'application/json' };
        try {
            const response = await axios.put(url, env, { headers });
            const { data } = response;
            if (data.code === 200) {
                this.log(`启用环境变量成功 ${env}`);
                return true;
            } else {
                this.log(`启用环境变量失败：${data.message}`);
                return false;
            }
        } catch (error) {
            console.log(error.response.data);
            console.log(error.response.data.validation);
            this.log(`启用环境变量失败：${error}`);
            return false;
        }
    }

    async disableEnvStatus(env) {
        const url = `${this.address}/open/envs/disable`;
        const headers = { Authorization: this.auth, 'content-type': 'application/json' };
        try {
            const response = await axios.put(url, env, { headers });
            const { data } = response;
            if (data.code === 200) {
                this.log(`禁用环境变量成功 ${env}`);
                return true;
            } else {
                this.log(`禁用环境变量失败：${data.message}`);
                return false;
            }
        } catch (error) {
            console.log(error.response.data);
            console.log(error.response.data.validation);
            this.log(`禁用环境变量失败：${error}`);
            return false;
        }
    }

    // 简单搜索用searchValue,复杂的用queryString
    async getCrons(searchValue, queryString) {
        const url = `${this.address}/open/crons?searchValue=${searchValue}&page=1&size=1000&queryString=${queryString}`;
        const headers = { Authorization: this.auth };
        try {
            const response = await axios.get(url, { headers });
            const { data } = response;
            if (data.code === 200) {
                return data.data.data;
            } else {
                this.log(`获取任务列表失败：${data.message}`);
                return null;
            }
        } catch (error) {
            console.log(error.response.data);
            console.log(error.response.data.validation);
            this.log(`获取任务列表失败：${error.message}`);
            return null;
        }
    }

    async runCrons(env) {
        const url = `${this.address}/open/crons/run`;
        const headers = { Authorization: this.auth };
        try {
            const response = await axios.put(url, env, { headers });
            const { data } = response;
            if (data.code === 200) {
                return true;
            } else {
                this.log(`运行成功：${data.message}`);
                return false;
            }
        } catch (error) {
            this.log(`运行失败：${error.message}`);
            return false;
        }
    }

    async getCronLog(cornId) {
        const url = `${this.address}/open/crons/${cornId}/log`;
        const headers = { Authorization: this.auth };
        try {
            const response = await axios.get(url, { headers });
            const { data } = response;
            if (data.code === 200) {
                return data.data;
            } else {
                this.log(`获取日志成功${data.message}`);
                return false;
            }
        } catch (error) {
            this.log(`获取日志失败：${error.message}`);
            return false;
        }
    }

}

const address = "http://192.168.1.12:5700";
const client_id = "Zq6jz-PT_j-Q";
const client_secret = "VWcvopV-8LEp0tIYoXl0t9D6";

const ql = new QL(address, client_id, client_secret);

module.exports = {
    QL: ql,
    toggleStatus,
    updateEnvById,
    getTypeEnv,
    disableOtherCk,
    disableEnvByName,
    enableEnvByName,
    startRunCrons,
    getCronsLogById,
    getLatestWsckLog,
    goQlIndex,
    specifiedWskeyToCk,
    getCornTaskAndLog
};

async function updateEnvById(req, res, next) {
    let id = req.body.id;
    let value = req.body.value;
    if (!id || !value) {
        res.status(400).send({ msg: "Bad Request", code: 1 });
        return;
    }

    let envs = await ql.getEnvs();
    const finded = envs.find(e => e.id == id);

    if (!finded) {
        res.status(500).send({ msg: '没找到id=' + id + " 的环境变量", code: 1 });
        return;
    }

    // 如果value含有wskey，顺便转换下wskey->ck
    if (value.indexOf('wskey=') > -1 && finded.name == 'JD_WSCK') {
        // 提取value中新的wskey
        const newWskey = getPinKeyFromEnv('wskey', value);
        console.log('新的wskey' + newWskey);
        // 如果传参中有pin值，和原值对比
        const newPin = getPinKeyFromEnv('pin', value);
        const oldPin = getPinKeyFromEnv('pin', finded.value)
        if (newPin && oldPin && newPin != oldPin) {
            res.status(500).send({ msg: "新pin值和旧pin值不相同，请检查！", code: 1 });
            return;
        }
        if (!newPin && !oldPin) {
            res.status(500).send({ msg: "pin值不存在，请检查！", code: 1 });
            return;
        }
        value = (oldPin || newPin) + newWskey;
    } else if (value.indexOf('pt_key=') > -1 && finded.name == 'JD_COOKIE') {
        // 提取value中新的wskey
        const newPtkey = getPinKeyFromEnv('pt_key', value);
        console.log('新的ptkey' + newPtkey);
        // 如果传参中有pin值，和原值对比
        const newPtPin = getPinKeyFromEnv('pt_pin', value);
        const oldPtPin = getPinKeyFromEnv('pt_pin', finded.value)
        if (newPtPin && oldPtPin && newPtPin != oldPtPin) {
            res.status(500).send({ msg: "新pt_pin值和旧pt_pin值不相同，请检查！", code: 1 });
            return;
        }
        if (!newPtPin && !oldPtPin) {
            res.status(500).send({ msg: "pt_pin值不存在，请检查！", code: 1 });
            return;
        }
        value = newPtkey + (oldPtPin || newPtPin);
    }

    const update_item = {
        id: id,
        name: finded.name,
        value: value,
        remarks: finded.remarks
    }
    if (await ql.updateEnv(update_item)) {
        //更新成功把状态改成启用
        let update = await ql.enableEnvStatus([Number(id)]);
        if (value.indexOf('wskey') == -1) {
            if (update) {
                res.status(200).send({ msg: '更新并启用成功', value, status: 0, code: 0 });
            } else {
                res.status(500).send({ msg: '更新成功，启用失败', code: 1 });
            }
            return;
        } else {
            let wsUpdate = await oneWskeyToCk(id, envs);
            if (wsUpdate) {
                res.status(200).send({ msg: 'wskey更新成功，ck转换成功！', status: 0, value, code: 0 });
            } else {
                res.status(500).send({ msg: 'wskey更新成功，ck转换失败！', code: 1 });
            }
            return;
        }
    }
    res.status(500).send({ msg: '更新环境变量失败', code: 1 });
}

async function toggleStatus(req, res, next) {
    let del_id = req.body.id;

    if (!del_id) {
        res.status(400).send("Bad Request");
    }

    let envs = await ql.getEnvs();
    const del_item = envs.find(e => e.id == del_id);
    const status = del_item.status;

    let status_res = false;
    if (status === 0) {
        status_res = await ql.disableEnvStatus([Number(del_id)]);
    } else {
        status_res = await ql.enableEnvStatus([Number(del_id)]);
    }

    if (status_res) {
        res.json({ id: del_id, status: status === 0 ? 1 : 0 });
    }
}

async function disableOtherCk(req, res, next) {
    let id = req.body.id;

    if (!id) {
        res.status(400).send("Bad Request");
    }
    let envs = await ql.getEnvs();
    const enableIds = envs.filter(e => e.name == 'JD_COOKIE' && e.status == 0).map(e => e.id);

    let status_res = false;
    status_res = await ql.disableEnvStatus(enableIds);
    status_res = await ql.enableEnvStatus([Number(id)]);

    if (status_res) {
        res.json({ id: id, status: 0 });
    }
}

// 禁用 按名称
async function disableEnvByName(req, res, next) {
    let name = req.body.name;

    if (!name) {
        res.status(400).send("Bad Request");
    }
    let envs = await ql.getEnvs();
    const enableIds = envs.filter(e => e.name == name && e.status == 0).map(e => e.id);

    if (enableIds && enableIds.length > 0) {
        let status_res = await ql.disableEnvStatus(enableIds);
        if (status_res) {
            res.json({ status: status_res });
        }
    } else {
        res.json({ message: "没有查到名称为：" + name + " 的环境变量" });
    }

}

// 启用 按名称
async function enableEnvByName(req, res, next) {
    let name = req.body.name;

    if (!name) {
        res.status(400).send("Bad Request");
    }
    let envs = await ql.getEnvs();
    const disableIds = envs.filter(e => e.name == name && e.status == 1).map(e => e.id);

    if (disableIds && disableIds.length > 0) {
        let status_res = await ql.disableEnvStatus(disableIds);
        if (status_res) {
            res.json({ status: status_res });
        }
    } else {
        res.json({ message: "没有查到名称为：" + name + " 的环境变量" });
    }
}

async function specifiedWskeyToCk(id, pageIds) {
    if (!id || !pageIds) {
        res.status(400).send("Bad Request");
    }

    const envs = await ql.getEnvs();
    return oneWskeyToCk(id, envs);
}

async function getCornTaskAndLog(type, res) {
    if (!type) {
        res.status(400).send("Bad Request");
        return;
    }
    let queryString = '{"filters":null,"sorts":null,"filterRelation":"and"}';
    let searchValue = '';
    if (type == 'nongchang') {
        searchValue = '农场';
    } else if (type == 'ws') {
        searchValue = 'wskey';
    } else if (type == 'dapai') {
        queryString = '{"filters":[{"property":"name","operation":"Reg","value":"大牌"},{"property":"name","operation":"Reg","value":"token"}],"sorts":null,"filterRelation":"or"}';
    }
    const envs = await ql.getCrons(searchValue, queryString);
    for (const item of envs) {
        try {
            const logText = await ql.getCronLog(item.id);
            item.log = logText;
        } catch (error) {
            console.error(`Failed to get log for item with id ${item.id}:`, error);
        }
    }
    res.json(envs);
    return;
}

// 转换一个wskey ->ck
async function oneWskeyToCk(id, envs) {
    // 用来在最后还原原来状态
    const enableWsIds = envs.filter(e => e.status == 0 && e.name == 'JD_WSCK').map(e => e.id);
    const wskeyIds = envs.filter(e => e.name == 'JD_WSCK').map(e => e.id);
    if (wskeyIds.length == 0) {
        console.log("没有wskey的环境变量");
        return false;
    }
    // 先禁用所有的 wskey，不管禁用还是启用状态。
    await ql.disableEnvStatus(wskeyIds);
    // 单独启用 目标 wskey
    if (wskeyIds.includes(id)) {
        await ql.enableEnvStatus([id]);
    } else {
        console.log("id 不是wskey: " + id);
        console.log("全部wskey id : " + wskeyIds);
        return false;
    }

    // 运行转换任务 - wskey本地转换
    let wskeyScriptId = 436;
    // let wskeyScriptId = 355; //测试任务id 茅台签到
    await ql.runCrons([wskeyScriptId]);

    let result = false;
    for (var i = 0; i < 30; i++) {
        await waitTime(100);
        const logText = await ql.getCronLog(wskeyScriptId);
        console.log("wskeyToCk log: " + logText);
        if (logText.indexOf('转换成功') > 0) {
            result = true;
            break;
        } else if (logText.indexOf('转换失败') > 0) {
            result = false;
            break;
        } else {
            console.log('尝试 ' + i + " 次");
            await waitTime(1000);
        }
    }
    // 不管成功还是失败都还原
    await ql.enableEnvStatus(enableWsIds);
    return result;
}



/**----------工具方法----------- */
const waitTime = (WAIT_TIME) => {
    return new Promise(resolve => {
        setTimeout(resolve, WAIT_TIME)
    });
}

function getPinKeyFromEnv(key, text) {
    if (!key || !text) {
        return;
    }

    let k = key + '=';
    const start = text.indexOf(k);
    if (start > -1) {
        const end = text.indexOf(";", start);
        return text.substring(start, end + 1);
    }
    return null;
}



async function getTypeEnv(req, res, next) {
    let type = req.body.type;
    let envs = await ql.getEnvs();
    if (type && type.toLowerCase() !== 'all') {
        envs = envs.filter(e => type == e.name);
    } else {
        envs = envs.filter(e => e.name != 'JD_WSCK' && e.name != 'JD_COOKIE');
    }
    console.log(envs.length);

    res.json(envs);
}

async function startRunCrons(req, res, next) {
    let name = req.body.name;

    if (!name) {
        res.status(400).send("Bad Request");
        return;
    }

    let crons = await ql.getCrons(name, '');
    const findItem = crons.find(e => e.name == name);

    if (findItem) {
        const id = findItem.id;
        console.log('执行脚本id:' + id + ", 脚本名称：" + findItem.name);

        if (await ql.runCrons([id])) {
            res.json({ id: id, code: 0 });
        } else {
            res.json({ id: id, msg: '执行脚本失败' });
        }
    } else {
        res.status(200).send({ msg: '查找wskey任务失败' });
    }

}

async function getCronsLogById(id, res, next) {
    // let id = req.body.id;
    if (!id) {
        res.status(400).send("Bad Request");
    }

    const logText = await ql.getCronLog(id);

    const splitArray = logText.split(/\n+/).filter(Boolean);

    let filterLog = splitArray.filter(e =>
        e.indexOf('转换成功：') > -1
        || e.indexOf('已禁用') > -1
        || e.indexOf('执行结束') > -1
        || e.indexOf('在获取token时失败') > -1
    );

    filterLog = filterLog.map(e => e.trim());


    let logs = filterLog.join('\n');
    res.json({ logs: logs });
}

async function getLatestWsckLog(req, res, next) {
    let crons = await ql.getCrons('wskey本地转换', '');
    const findItem = crons.find(e => e.name == 'wskey本地转换');
    if (findItem) {
        getCronsLogById(findItem.id, res);
    } else {
        res.status(200).send({ msg: '查找wskey任务失败' });
    }
}


// node qlService.js
if (require.main === module) {
    async function executeAfterLogin() {
        // 先登录获取token
        await ql.login()

        // 获取所有环境变量
        // let envs = await ql.getEnvs();
        // console.log(envs);

        // 新建环境变量，name&value组合唯一键，不可以初始化status
        // const envsToAdd = [
        //     { name: "aadd24", value: 'z111', remarks: "rr"},
        //     { name: "aadd2", value: 'z1113', remarks: "rr"}
        // ];
        // await ql.addEnvs(envsToAdd);

        // 更新一条
        // const envsToUp = {id:53, name: "更", value:'z1',remarks:"sdf"};
        // await ql.updateEnv(envsToUp);

        // 批量禁用
        // const disableIds = [52, 53];
        // await ql.disableEnvStatus(disableIds);

        // 批量启用
        // const enableIds = [52, 53];
        // await ql.enableEnvStatus(enableIds);


        // 批量禁用
        const deleteIds = [52, 53];
        await ql.deleteEnvs(deleteIds);


    }
    executeAfterLogin();
}