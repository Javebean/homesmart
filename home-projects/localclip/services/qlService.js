const axios = require('axios');
const e = require('express');

class QL {
    constructor(address, id, secret) {
        this.address = address;
        this.id = id;
        this.secret = secret;
        this.valid = true;
        this.auth = '';
    }

    log(content) {
        console.log("日志："+ content);
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
}

const address = "http://192.168.1.12:5700";
const client_id = "Zq6jz-PT_j-Q";
const client_secret = "VWcvopV-8LEp0tIYoXl0t9D6";

const ql = new QL(address, client_id, client_secret);

module.exports = {
    ql,
};


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