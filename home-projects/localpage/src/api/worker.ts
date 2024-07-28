import request from "@/utils/axiosRq";

export function get(params = {}){
    return request({
        method: 'GET',
        url: '/worker/query/1',
        params,
    })
}

export function queryPage(params = {}){
    return request({
        method: 'GET',
        url: '/worker/queryPage',
        params
    })
}

export function userLogin(data){
    return request({
        method: 'post',
        url: '/worker/login',
        data
    })
}

export function addWorker(data){
    return request({
        method: 'post',
        url: '/worker/add',
        data
    })
}
export function updateWorker(data){
    return request({
        method: 'post',
        url: '/worker/update',
        data
    })
}
export function delWorkerById(id){
    return request({
        method: 'delete',
        url: '/worker/del/'+id,
    })
}