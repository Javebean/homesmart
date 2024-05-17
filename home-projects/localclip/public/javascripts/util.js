function isEmpty(value) {
    return value === null || typeof value === 'undefined' || (typeof value === 'string' && value.trim() === '' || value === "undefined");
}

//nodejs 要返回json res.json({status:-1});
function doPost(url, data, method = 'POST', contentType = 'application/json') {
    return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();

        xhr.open(method, url, true);
        xhr.setRequestHeader('Content-Type', contentType);

        xhr.onreadystatechange = function () {
            if (xhr.readyState === XMLHttpRequest.DONE) {
                if (xhr.status === 200) {
                    var responseData = JSON.parse(xhr.responseText);
                    resolve(responseData);
                } else {
                    console.log(xhr.status);
                    reject(new Error('请求失败'));
                }
            }
        };

        xhr.onerror = function () {
            reject(new Error('请求失败'));
        };

        const jsonData = JSON.stringify(data);
        xhr.send(jsonData);
    });
}

// get请求不应该传data, url？携带参数
function doGet(url) {
    return doPost(url, {}, 'GET')
}


function disableTouch() {
    //阻止safari浏览器双击放大功能
    let lastTouchEnd = 0  //更新手指弹起的时间
    document.documentElement.addEventListener("touchstart", function (event) {
        //多根手指同时按下屏幕，禁止默认行为
        if (event.touches.length > 1) {
            event.preventDefault();
        }
    });
    document.documentElement.addEventListener("touchend", function (event) {
        let now = (new Date()).getTime();
        if (now - lastTouchEnd <= 500) {
            //当两次手指弹起的时间小于300毫秒，认为双击屏幕行为
            event.preventDefault();
        } else { // 否则重新手指弹起的时间
            lastTouchEnd = now;
        }
    }, false);
    //阻止双指放大页面
    document.documentElement.addEventListener("gesturestart", function (event) {
        event.preventDefault();
    });
}


// function fetchData(method, url, callback) {
//     var xhr = new XMLHttpRequest();
//     xhr.open(method, url, true);
//     xhr.onreadystatechange = function () {
//         if (xhr.readyState === 4) {
//             if (xhr.status === 200) {
//                 // 请求成功，调用回调函数并传入响应数据
//                 var responseData = JSON.parse(xhr.responseText);
//                 callback(null, responseData);
//             } else {
//                 // 请求失败，调用回调函数并传入错误信息
//                 callback(new Error('Failed to fetch data'));
//             }
//         }
//     };
//     xhr.send();
// }