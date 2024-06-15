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

export function getTaskLogsByIds(data = {}) {
    return request({
        method: 'POST',
        url: '/ql/getTaskLogsByIds',
        data
    })
}

export function getCornTaskAndLog(data = {}) {
    return request({
        method: 'POST',
        url: '/ql/getCornTaskAndLog',
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
