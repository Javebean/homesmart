const axios = require('axios');
const path = require('path')
const fs = require('fs');
const cronParser = require('cron-parser');
const { env } = require('process');

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
            this.log(`获取环境变量失败1：${error.message}`);
            console.log(error.response.data);
            console.log(error.response.data.validation);
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
            this.log(`删除环境变量失败1：${error.message}`);
            console.log(error.response.data);
            console.log(error.response.data.validation);
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
            console.log(error.response.data);
            console.log(error.response.data.validation);
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
            console.log(error.response.data);
            console.log(error.response.data.validation);
            this.log(`更新环境变量失败1：${error}`);
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
            this.log(`启用环境变量失败1：${error}`);
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
            this.log(`禁用环境变量失败1：${error}`);
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
            this.log(`获取任务列表失败1：${error}`);
            return null;
        }
    }

    async runCrons(id) {
        const url = `${this.address}/open/crons/run`;
        const headers = { Authorization: this.auth };
        try {
            const response = await axios.put(url, id, { headers });
            const { data } = response;
            if (data.code === 200) {
                return true;
            } else {
                this.log(`运行成功：${data.message}`);
                return false;
            }
        } catch (error) {
            console.log(error.response.data);
            console.log(error.response.data.validation);
            this.log(`运行失败1：${error}`);
            return false;
        }
    }

    async stopCrons(id) {
        const url = `${this.address}/open/crons/stop`;
        const headers = { Authorization: this.auth };
        try {
            const response = await axios.put(url, id, { headers });
            const { data } = response;
            if (data.code === 200) {
                return true;
            } else {
                this.log(`禁止失败：${data.message}`);
                return false;
            }
        } catch (error) {
            console.log(error.response.data);
            console.log(error.response.data.validation);
            this.log(`禁止失败1：${error}`);
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
                this.log(`获取日志失败${data.message}`);
                return false;
            }
        } catch (error) {
            console.log(error.response.data);
            console.log(error.response.data.validation);
            this.log(`获取日志失败1：${error}`);
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
    startStopCrons,
    enableEnvByName,
    getCronsLogById,
    getLatestLogById,
    getLatestWsckLog,
    getCornInfoById,
    goQlIndex,
    specifiedWskeyToCk,
    getCornTaskAndLog,
    getTaskLogsByIds
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
        const oldWskey = getPinKeyFromEnv('wskey', finded.value);
        if (newWskey == oldWskey) { // status -1 :无变化
            res.status(200).send({ msg: "wskey无变动", code: 0, status: -1, value });
            return;
        }
    } else if (value.indexOf('pt_key=') > -1 && finded.name == 'JD_COOKIE') {
        // 提取value中新的wskey
        const newPtkey = getPinKeyFromEnv('pt_key', value);
        console.log('新的ptkey' + newPtkey);
        // 如果传参中有pin值，和原值对比
        const newPtPin = getPinKeyFromEnv('pt_pin', value);
        const oldPtPin = getPinKeyFromEnv('pt_pin', finded.value);
        if (newPtPin && oldPtPin && newPtPin != oldPtPin) {
            res.status(500).send({ msg: "新pt_pin值和旧pt_pin值不相同，请检查！", code: 1 });
            return;
        }
        if (!newPtPin && !oldPtPin) {
            res.status(500).send({ msg: "pt_pin值不存在，请检查！", code: 1 });
            return;
        }
        value = newPtkey + (oldPtPin || newPtPin);

        const oldPtkey = getPinKeyFromEnv('pt_key', finded.value);
        if (newPtkey == oldPtkey) {// status -1 :无变化
            res.status(200).send({ msg: "ck无变动", code: 0, status: -1, value });
            return;
        }
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
        if (value.indexOf('wskey=') > -1) {
            let wsUpdate = await oneWskeyToCk(id, envs);
            let remarkMsg = finded.remarks
            if (finded.remarks) {
                if (finded.remarks.indexOf('ws') == -1) {
                    remarkMsg = finded.remarks + "ws";
                } else {
                    remarkMsg = finded.remarks;
                }
            }
            if (wsUpdate) {
                res.status(200).send({ msg: remarkMsg + '更新成功，ck转换成功！', status: 0, value, code: 0 });
            } else {
                res.status(500).send({ msg: remarkMsg + '更新成功，ck转换失败！', code: 1 });
            }
            return;
        } else if (value.indexOf('pt_key=') > -1) {
            let remarkMsg = finded.remarks
            if (finded.remarks) {
                if (finded.remarks.indexOf('ck') == -1) {
                    remarkMsg = finded.remarks + "ck";
                } else {
                    remarkMsg = finded.remarks;
                }
            }
            if (update) {
                res.status(200).send({ msg: remarkMsg + '更新成功，启用成功！', status: 0, value, code: 0 });
            } else {
                res.status(500).send({ msg: remarkMsg + '更新成功，启用失败！', code: 1 });
            }
            return;
        } else {
            if (update) {
                res.status(200).send({ msg: '更新成功，启用成功！', value, status: 0, code: 0 });
            } else {
                res.status(500).send({ msg: '更新成功，启用失败！', code: 1 });
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

    let queryObj = { filters: null, sorts: null, filterRelation: "and" }

    if (type == 'nongchang') {
        searchValue = '农场';
    } else if (type == 'ws') {
        searchValue = 'wskey';
    } else if (type == 'dapai') {
        queryString = '{"filters":[{"property":"name","operation":"Reg","value":"大牌"},{"property":"name","operation":"Reg","value":"token"}],"sorts":null,"filterRelation":"or"}';
    }
    // else if (type == 'running') {
    //     queryString = '{"filters":[{"property":"status","operation":"Reg","value":"0"}],"sorts":null,"filterRelation":"and"}';
    // } 
    else if (type == 'other') {
        // 不包含农场 dapai 真正运行 0 
        // 1 空闲 2 已禁用
        queryString = '{"filters":[{"property":"name","operation":"NotReg","value":"农场"},{"property":"name","operation":"NotReg","value":"大牌"},{"property":"status","operation":"Nin","value":[0]}],"sorts":null,"filterRelation":"and"}';
    } else if (type == 'top') {
        queryString = '{"filters":[{"property":"isPinned","operation":"Reg","value":"1"}],"sorts":null,"filterRelation":"and"}';
    } else if (type == 'all') {
    } else if (type == 'today') {
        let filtersArr = [
            { "property": "isDisabled", "operation": "Reg", "value": "0" },
        ]
        queryObj.filters = filtersArr;
        queryString = JSON.stringify(queryObj);
    } else if (type == 'todayOnce') {
        let filtersArr = [
            { "property": "isDisabled", "operation": "Reg", "value": "0" },
        ]
        queryObj.filters = filtersArr;
        queryString = JSON.stringify(queryObj);
    }

    console.time('executionTime');
    //条件查询出的结果
    let envs = await ql.getCrons(searchValue, queryString);

    const daystart = new Date();
    daystart.setHours(0, 0, 0, 0)
    if (type == 'today') {
        envs = envs.filter(e => e.status == 0 || e.last_execution_time * 1000 > daystart.getTime());
    }

    const dayEnd = new Date();
    dayEnd.setHours(23, 59, 59, 999)
    if (type == 'todayOnce') {
        envs = envs.filter(e => e.status == 0 || e.last_execution_time * 1000 > daystart.getTime() && hasCronExecutedTodayOnce(e.schedule, dayEnd));
    }

    //按上次执行时间 从大到小排序
    envs.sort((a, b) => {
        // 正在运行的排前面
        if (a.status !== b.status) {
            return a.status - b.status;
        }
        // 如果 status 相同，则根据 last_execution_time 排序
        if (type == 'todayOnce') {
            return a.last_execution_time - b.last_execution_time;
        } else {
            return b.last_execution_time - a.last_execution_time;
        }
    });

    let length = envs.length;
    for (let i = 0; i < length; i++) {
        let breakNum = 4;
        if (i > breakNum) {
            break;
        }
        let item = envs[i];
        if (item.status == 0) {
            item.log = '正在运行,请刷新';
        } else {
            let logText = await ql.getCronLog(item.id);
            item.log = getFiltedLog(logText);
        }
    }
    console.timeEnd('executionTime');
    res.json(envs);
    return;
}

function hasCronExecutedTodayOnce(cronExpression, dayEnd) {
    // 获取当前时间
    try {
        const interval = cronParser.parseExpression(cronExpression);
        const nextExeTime = interval.next().getTime();
        // 如果上一个执行时间在今日
        return nextExeTime > dayEnd.getTime();
    } catch (err) {
        console.log(err);
        throw new Error('Invalid cron expression');
    }
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

function getFiltedLog(logText) {
    logText = logText.replaceAll('===', '');
    logText = logText.replaceAll('---', '');
    logText = logText.replaceAll('>>>', '');
    logText = logText.replaceAll('****', '');
    return logText;
}

async function getTypeEnv(req, res, next) {
    let type = req.body.type;
    let envs = await ql.getEnvs();
    if (type && type.toLowerCase() !== 'all') {
        envs = envs.filter(e => type == e.name);
    } else {
        envs = envs.filter(e => e.name != 'JD_WSCK' && e.name != 'JD_COOKIE');
    }
    // console.log(envs.length);

    envs.sort((a, b) => {
        // 被禁用的排前面
        if (a.status !== b.status) {
            return b.status - a.status;
        } else {
            //timestamp更新新值的时间，updatedAt是任何变动的更新时间
            return formatDateString(a.timestamp) > formatDateString(b.timestamp) ? 1 : -1;
        }
    });

    res.json(envs);
}

//utils
function formatDateString(dateString) {
    // 将日期字符串拆分为数组
    const dateParts = dateString.split(' ');
    // 月份映射
    const monthMap = {
        Jan: '01', Feb: '02', Mar: '03', Apr: '04', May: '05', Jun: '06',
        Jul: '07', Aug: '08', Sep: '09', Oct: '10', Nov: '11', Dec: '12'
    };

    // 提取年、月、日和时间部分
    const day = dateParts[2];
    const month = monthMap[dateParts[1]];
    const year = dateParts[3];
    const time = dateParts[4];

    // 格式化日期为 YYYY-MM-DD HH:mm:ss
    const formattedDate = `${year}-${month}-${day} ${time}`;
    return formattedDate;
}
async function startStopCrons(req, res, next) {
    let id = req.body.id;
    if (!id) {
        res.status(400).send("Bad Request");
        return;
    }

    let searchValue = '';
    let queryString = '{"filters":[{"property":"id","operation":"In","value":"' + id + '"}],"sorts":null,"filterRelation":"and"}';
    let tasks = await ql.getCrons(searchValue, queryString);

    if (tasks && tasks.length > 0) {
        let task = tasks[0];
        console.log('执行脚本id:' + id + ", 脚本名称：" + task.name);
        if (task.status == 1 && await ql.runCrons([id])) {
            res.status(200).json({ id: id, status: 0, msg: '运行任务成功' });
            return;
        } else if (task.status == 0 && await ql.stopCrons([id])) {
            res.status(200).json({ id: id, status: 1, msg: '停止任务成功' });
            return;
        }
    }
    res.status(500).json({ id: id, msg: '执行脚本失败' });
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

// 根据id集合得到日志
async function getTaskLogsByIds(ids, res, next) {
    let result = [];
    for (let i = 0; i < ids.length; i++) {
        let id = ids[i];
        let log = await ql.getCronLog(id);
        let item = { id, log: getFiltedLog(log) }
        result.push(item);
    }
    res.json({ result });
    return;
}

async function getLatestLogById(req, res, next) {
    let id = req.body.id;
    if (!id) {
        res.status(400).send("Bad Request");
        return;
    }

    let logText = await ql.getCronLog(id);
    if (logText) {
        logText = logText.replaceAll('===', '');
        logText = logText.replaceAll('---', '');
        logText = logText.replaceAll('>>>', '');
        logText = logText.replaceAll('****', '');
        res.status(200).send({ log: logText });
    } else {
        res.status(500);
    }
}

async function getCornInfoById(req, res, next) {
    let id = req.body.id;
    if (!id) {
        res.status(400).send("Bad Request");
        return;
    }

    let searchValue = '';
    let queryString = '{"filters":[{"property":"id","operation":"In","value":"' + id + '"}],"sorts":null,"filterRelation":"and"}';
    let tasks = await ql.getCrons(searchValue, queryString);

    const findItem = tasks.find(e => e.id == id);
    if (findItem) {
        res.status(200).send({ data: findItem });
    } else {
        res.status(500);
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