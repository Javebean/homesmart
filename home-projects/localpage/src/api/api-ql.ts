import request from "@/utils/axiosRq";

//先看，post 参数用data, get参数用params
export function getQlEnvsByName(data = {}) {
    return request({
        method: 'POST',
        url: '/ql/getTypeEnv',
        data,
    })
}

export function toggleQlEnvStatus(data = {}) {
    return request({
        method: 'POST',
        url: '/ql/toggleStatus',
        data,
    })
}

export function updateEnvById(data = {}) {
    return request({
        method: 'POST',
        url: '/ql/updateEnvById',
        data,
    })
}

export function disableOtherCK(data = {}) {
    return request({
        method: 'POST',
        url: '/ql/disableOtherCk',
        data,
    })
}

export function disableEnvByName(data = {}) {
    return request({
        method: 'POST',
        url: '/ql/disableEnvByName',
        data,
    })
}

export function enableEnvByName(data = {}) {
    return request({
        method: 'POST',
        url: '/ql/enableEnvByName',
        data,
    })
}

export function getLatestWsckLog() {
    return request({
        method: 'GET',
        url: '/ql/getLatestWsckLog',
    })
}

export function getCornInfoById(data = {}) {
    return request({
        method: 'POST',
        url: '/ql/getCornInfoById',
        data
    })
}

export function getLatestLogById(data = {}) {
    return request({
        method: 'POST',
        url: '/ql/getLatestLogById',
        data
    })
}

export function getCronsViews(data = {}) {
    return request({
        method: 'GET',
        url: '/ql/getCronsViews',
        data
    })
}

export function getTaskLogsByIds(data = {}) {
    return request({
        method: 'POST',
        url: '/ql/getTaskLogsByIds',
        data
    })
}

//青龙自带tab views
export function getCornTaskAndLog(data = {}) {
    return request({
        method: 'POST',
        url: '/ql/getCornTaskAndLog',
        data
    })
}

//自定义tab
export function getCornTaskAndLog2(data = {}) {
    return request({
        method: 'POST',
        url: '/ql/getCornTaskAndLog2',
        data
    })
}

export function startStopCrons(data = {}) {
    return request({
        method: 'POST',
        url: '/ql/startStopCrons',
        data
    })
}

export function enOrDisableCrons(data = {}) {
    return request({
        method: 'POST',
        url: '/ql/enOrDisableCrons',
        data
    })
}

export function addEnvs(data = {}) {
    return request({
        method: 'POST',
        url: '/ql/addEnvs',
        data
    })
}

export function delEnvs(data = {}) {
    return request({
        method: 'POST',
        url: '/ql/delEnvs',
        data
    })
}

export function parseWsck(data = {}) {
    return request({
        method: 'POST',
        url: '/ql/parseWsck',
        data
    })
}

export function specifiedWskeyToCk(data = {}) {
    return request({
        method: 'POST',
        url: '/ql/specifiedWskeyToCk',
        data
    })
}

export function getInitInfo(data = {}) {
    return request({
        method: 'POST',
        url: '/ql/getInitInfo',
        data
    })
}

export function getBackupEnvList(data = {}) {
    return request({
        method: 'POST',
        url: '/ql/getBackupEnvList',
        data
    })
}

export function backupEnv(data = {}) {
    return request({
        method: 'POST',
        url: '/ql/backupEnv',
        data
    })
}
