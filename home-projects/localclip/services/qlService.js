const axios = require('axios');
const path = require('path')
const fs = require('fs');


// 该路径可覆盖public下的index.html
const indexSource = path.join(__dirname, '..', 'public', 'qlhelp.html');
const indexDest= path.join(__dirname, '..', 'data', 'qlhelp.html');
let goQlIndex = function (res) {
    if (!fs.existsSync(indexDest)) {
        // indexpath
        fs.copyFile(indexSource, indexDest, (err) => {
            if (err) {
                return console.error('文件复制失败：', err);
            }
            res.sendFile(indexDest);
        });
    } else {
        res.sendFile(indexDest);
    }
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
                this.log(`启用环境变量成功`);
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
                this.log(`禁用环境变量成功`);
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

    async getCrons() {
        const url = `${this.address}/open/crons?searchValue=`;
        const headers = { Authorization: this.auth };
        try {
            const response = await axios.get(url, { headers });
            const { data } = response;
            if (data.code === 200) {
                return data.data.data;
            } else {
                this.log(`获取环境变量失败：${data.message}`);
            }
        } catch (error) {
            this.log(`获取环境变量失败：${error.message}`);
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

    async getCronLog(env) {
        const url = `${this.address}/open/crons/${env}/log`;
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
    disableOther,
    startRunCrons,
    getCronsLog,
    goQlIndex
};

async function updateEnvById(req, res, next) {
    let id = req.body.id;
    let value = req.body.value;
    if (!id) {
        res.status(400).send("Bad Request");
    }

    let envs = await ql.getEnvs();
    const finded = envs.find(e => e.id == id);

    // 如果是wskey，只更新wskey的部分
    if (value.indexOf('wskey=') > -1) {
        const wsIndex = value.indexOf("wskey=");
        const index = value.indexOf(";", wsIndex);
        const result = value.substring(wsIndex, index + 1);

        // pin值使用原值，如果原值不存在使用参数中的pin值
        let value0 = finded.value;
        let pinIndex = value0.indexOf("pin=");
        if (pinIndex == -1) {
            value0 = value;
            pinIndex = value0.indexOf("pin=");
            if (pinIndex == -1) {
                res.status(400).send('传参无pin值');
            }
        }
        const pinEndIndex = value0.indexOf(";", pinIndex);
        const pin = value0.substring(pinIndex, pinEndIndex + 1);
        value = pin + result
    }

    const update_item = {
        id: id,
        name: finded.name,
        value: value,
        remarks: finded.remarks
    }
    if (await ql.updateEnv(update_item)) {
        //更新成功把状态改成启用’
        let status_res = await ql.enableEnvStatus([Number(id)]);
        if (!status_res) {
            console.log('更新后，状态改变失败');
        }
        res.json({ id: id, value: value, msg: '使用原pin值' });
    } else {
        res.status(500).send('更新环境变量失败');
    }
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

async function disableOther(req, res, next) {
    let id = req.body.id;
    let pageIds = req.body.pageIds;

    if (!id || !pageIds) {
        res.status(400).send("Bad Request");
    }

    let status_res = false;
    status_res = await ql.disableEnvStatus(pageIds);
    status_res = await ql.enableEnvStatus([Number(id)]);

    if (status_res) {
        res.json({ id: id, status: 0 });
    }
}

async function getTypeEnv(req, res, next) {
    let type = req.body.type;
    let envs = await ql.getEnvs();
    if (type && type !== 'all') {
        envs = envs.filter(e => type == e.name);
    }
    res.json(envs);
}

async function startRunCrons(req, res, next) {
    let name = req.body.name;
    let crons = await ql.getCrons();

    if (!name) {
        res.status(400).send("Bad Request");
    }

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

async function getCronsLog(req, res, next) {
    let id = req.body.id;
    if (!id) {
        res.status(400).send("Bad Request");
    }

    const logText = await ql.getCronLog(id);

    const splitArray = logText.split(/\n+/).filter(Boolean);

    let filterLog = splitArray.filter(e => e.indexOf('转换成功：') > -1 || e.indexOf('已禁用') > -1 || e.indexOf('执行结束') > -1);
    let logs = filterLog.join('\n');
    res.json({ logs: logs });
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