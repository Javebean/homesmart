///mnt/mmcblk2p4/ql/data/scripts/
const fs = require('fs');
let os = require('os');
const axios = require('axios');
const BARK_PUSH = true;
const timeout = 15000;
let logCount = 0;

const CHUNK_SIZE = 4000;

// QingLong log path
const qlLogPath = '/ql/data/log/';
const timeStamp = getTodayDateStr(true);
let timeStampRead;

//项目白名单
let WHITELIST = ['6dylan6_jdpro'];
//日志黑名单
let BLACKLIST = [
    'testNotify',
    'jd_dreamFactory',
    'jd_jxmc',//jx牧场
    'jd_cfd',//财富岛
    'jd_jdfactory',//dd工厂
    'jd_wish',//
    'jd_beauty',//
    'jd_xinruimz',//
];

//level 0：简易通知，只显示知否完成
//level 1: 完整通知
const GLOBAL_LEVEL_0 = 0;
const GLOBAL_LEVEL_1 = 1;
let GLOBAL_MSG = '';
let GLOBAL_LEVEL = GLOBAL_LEVEL_0;

fs.readFile(__dirname + '/notifyTimeLog.txt', function (err, data) {
    if (err) {
        console.log(err);
        // timeStampRead = getTodayDateStr(1, -2);
    } else {
        const arr = data.toString().replace(/\r\n/g, '\n').split('\n');
        console.log(arr);
        for (let i = arr.length - 1; i >= 0; i--) {
            if (arr[i] && arr[i].length > 4) {
                timeStampRead = arr[i];//倒序选择第一个时间
                // timeStampRead = '2022-11-23-15-12-46';
                break;
            }
        }

        if (timeStampRead) {
            console.log('上次通知的时间戳: ' + timeStampRead)
            loopLogDirs();
        } else {
            console.error('错误的时间戳: ' + timeStampRead)
        }
        writeExeTime(arr.length > 50 ? 'w' : 'a');
    }
});

function writeExeTime(f) {
    // 将数据写入文件sample.html
    fs.writeFile(__dirname + '/notifyTimeLog.txt', timeStamp + os.EOL, { flag: f },
        // 写入文件后调用的回调函数
        function (err) {
            if (err) throw err;
            // 如果没有错误
            console.log('logdate is written to file successfully: ' + timeStamp)
        });
}

function loopLogDirs() {
    fs.readdir(qlLogPath, (err, LogDirs) => {
        if (!err) {
            //hit white list
            let filterLogDirs = LogDirs.filter(curLogFolder => hitWhiteList(curLogFolder, WHITELIST));

            //filter black list
            filterLogDirs = filterLogDirs.filter(curLogFolder => !hitBlackList(curLogFolder, BLACKLIST));
            // console.log(filterLogDirs);
            let len = filterLogDirs.length;
            if (len == 0) {
                console.log('no log folders');
                return;
            }
            console.log('will scan log folder nums:' + len + ', base log folder is:[' + WHITELIST + ']');
            for (let i = 0; i < len; i++) {
                let folderName = filterLogDirs[i];
                readLogFilesInDir(folderName);
            }
        } else {
            console.log(err);
        }
    });
}

// file logs in every folder
function readLogFilesInDir(folderName) {
    fs.readdir(qlLogPath + folderName, (err, files) => {
        if (!err) {
            //青龙的日志文件格式都是2022-09-16-22-37-11.log格式
            //不管正序倒序，比较出最新的日志即可
            let logTime1 = files[0];
            let logTime2 = files[files.length - 1];

            if (logTime1 > logTime2) {
                logTime2 = logTime1;
            }

            if (logTime2 > timeStampRead) {
                let singleLogPath = qlLogPath + folderName + '/' + logTime2;
                // console.log(singleLogPath);
                readSingleLog(singleLogPath, folderName);
            }
        } else {
            console.log(err);
        }
    });
}

// hit white list
function hitWhiteList(curLogFolder, whiteList) {
    return whiteList.some(x => curLogFolder.indexOf(x) > -1);
}

// hit black list
function hitBlackList(curLogFolder, blackList) {
    return blackList.some(x => curLogFolder.indexOf(x) > -1);
}

function readSingleLog(filePath, descriptor) {
    fs.stat(filePath, (err, stats) => {
        if (err) {
            console.log(`File doesn't exist.`)
        } else {
            if (GLOBAL_LEVEL == GLOBAL_LEVEL_0 || stats.size < CHUNK_SIZE) { //4096byte = 4KB
                fs.readFile(filePath, { encoding: 'utf-8' }, function (err, content) {
                    if (!err) {
                        // console.log(filePath);
                        // console.log('Log Content ：\r\n' + data);
                        let keyObj = getTitleInFile(content);
                        keyObj.title = keyObj.title || descriptor;
                        logCount++;
                        scheduleSendNotify(keyObj, content)
                    } else {
                        console.log(err);
                    }
                });
            } else {
                // console.log(stats)
                // send message separate
                readPart(filePath, descriptor);
            }
        }
    })
}

function readBytes(fd, buffer) {
    return new Promise((resolve, reject) => {
        fs.read(
            fd,
            buffer,
            0,
            buffer.length,
            null,
            (err) => {
                if (err) { return reject(err); }
                resolve();
            }
        );
    });
}

// https://betterprogramming.pub/a-memory-friendly-way-of-reading-files-in-node-js-a45ad0cc7bb6
async function* generateChunks(filePath, size) {
    const sharedBuffer = Buffer.alloc(size);
    const stats = fs.statSync(filePath); // file details
    const fd = fs.openSync(filePath); // file descriptor
    let bytesRead = 0; // how many bytes were read
    let end = size;

    for (let i = 0; i < Math.ceil(stats.size / size); i++) {
        await readBytes(fd, sharedBuffer);
        bytesRead = (i + 1) * size;
        if (bytesRead > stats.size) {
            // When we reach the end of file, 
            // we have to calculate how many bytes were actually read
            end = size - (bytesRead - stats.size);
        }
        yield sharedBuffer.slice(0, end);
    }
}

async function readPart(file, descriptor) {
    let index = 0;
    let isFindTitle = false;
    let title;
    for await (const chunk of generateChunks(file, CHUNK_SIZE)) {
        if (!isFindTitle) {
            title = getTitleInFile(chunk.toString());
            if (!title) {
                title = descriptor;
            } else {
                isFindTitle = true;
            }
        }
        index++;
        BarkNotify(title + '-' + index, chunk.toString());
        await waitTime(0);
    }
}

const waitTime = (WAIT_TIME) => {
    return new Promise(resolve => {
        setTimeout(resolve, WAIT_TIME)
    });
}

function getTodayDateStr(time, offset) {
    let dateObj = new Date();
    if (offset) {
        dateObj.setHours(dateObj.getHours() + offset);
    }
    let year = dateObj.getFullYear();
    let month = dateObj.getMonth() + 1; //months from 1-12
    let day = dateObj.getDate();
    month = paddingZero(month);
    day = paddingZero(day);
    let newdate = year + '-' + month + '-' + day;
    if (time) {
        let hour = dateObj.getHours();
        let minutes = dateObj.getMinutes();
        let seconds = dateObj.getSeconds();
        hour = paddingZero(hour);
        minutes = paddingZero(minutes);
        seconds = paddingZero(seconds);
        newdate += '-' + hour + '-' + minutes + '-' + seconds;
    }
    return newdate;
}



function paddingZero(v) {
    v += '';
    return v.length == 1 ? '0' + v : v;
}

// https://masteringjs.io/tutorials/fundamentals/foreach-break
function getTitleInFile(data) {
    let obj = {};
    let shouldSkip = false;
    let accountSimpleCount = -1;
    data.split(/\r?\n/).forEach(function (line) {
        if (shouldSkip) {
            return;
        }
        if (line.indexOf(', 开始!') > 0) {
            obj.title = line;
        }

        if (accountSimpleCount > 0) {
            accountSimpleCount--;
            obj.accountSimpleLine = obj.accountSimpleLine + line + os.EOL + os.EOL;
        }
        if (line.indexOf('开始【京东账号') > 0) {
            // console.log(line);
            obj.accountSimpleLine = (obj.accountSimpleLine || '') + line + os.EOL;
            accountSimpleCount = 5;
        }

        if (line.indexOf('执行结束') > 0) {
            obj.endLine = line;
            shouldSkip = true;
        }

        if (shouldSkip) {
            return;
        }
    })
    return obj;
}

let lastLogCount = -1;
let checkTimes = 0;//多次检测 logCount不再增长的话，说明这次遍历结束
let checkStart = false;
async function scheduleSendNotify(keyObj, content) {
    console.log('触发scheduleSendNotify :' + logCount);
    if (GLOBAL_LEVEL == GLOBAL_LEVEL_0) {
        GLOBAL_MSG += keyObj.title + os.EOL + keyObj.accountSimpleLine + keyObj.endLine + os.EOL + os.EOL;
        if (!checkStart) {
            checkStart = true
            for (var i = 0; i < 100; i++) {
                if (logCount != lastLogCount) {
                    lastLogCount = logCount;
                    console.log('检测次数 :' + i + ', logCount:' + logCount + ', lastLogCount:' + lastLogCount);
                } else {
                    checkTimes++
                    console.log('检测次数(不变) :' + i + ', logCount:' + logCount + ', lastLogCount:' + lastLogCount);
                    if (checkTimes == 3) {
                        var size = 1000; //length ≠ byte size
                        var k = Math.ceil(GLOBAL_MSG.length / size);
                        console.log(k, GLOBAL_MSG.length);
                        for (var c = 0; c < k; c++) {
                            // console.log('------------------------------------------');
                            // console.log(GLOBAL_MSG.substring(c * size, (c + 1) * size));
                            let end = GLOBAL_MSG.length - c * size;
                            let start = end - size > 0 ? end - size : 0
                            BarkNotify('简易通知-' + (k - c == k ? '结束' : (k - c)), GLOBAL_MSG.substring(start, end));
                            await waitTime(1000);
                        }
                        break;
                    }
                }
                await waitTime(1000);
            }
        }
    } else {
        BarkNotify(keyObj.title, content);
    }
}

function BarkNotify(title, content) {
    if (!content) {
        return;
    }
    if (BARK_PUSH) {
        const options = {
            url: 'https://api.day.app/**',
            body: desp,
            title: title,
            group: 'QingLong',
            icon: 'http://day.app/assets/images/avatar.jpg',
            level: GLOBAL_LEVEL == GLOBAL_LEVEL_0 ? 'active' : 'passive',
            sound: '',
            headers: {
                'Content-Type': 'application/json; charset=utf-8',
            },
            timeout,
        };

        axios.post(options.url, options)
            .then(function (response) {
                console.log('Bark Response:');
                console.log(response.data);
            }).catch(function (error) {
                console.log('Bark Error Response:');
                console.log(error);
            });
    }
}