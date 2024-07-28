import request from "@/utils/axiosRq";

export function get(params = {}){
    return request({
        method: 'GET',
        url: '/followRecord/query/1',
        params,
    })
}

export function queryPage(params = {}){
    return request({
        method: 'GET',
        url: '/followRecord/queryPage',
        params
    })
}

export function updateState(data:Record<string, any>){
    return request({
        method: 'post',
        url: '/followRecord/updateState',
        data
    })
}

export function add(data:Record<string, any>){
    return request({
        method: 'post',
        url: '/followRecord/add',
        data
    })
}

export function saveLatest(data:Record<string, any>){
    return request({
        method: 'post',
        url: '/followRecord/saveLatest',
        data
    })
}