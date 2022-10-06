///mnt/mmcblk2p4/ql/data/scripts/
const fs = require('fs');
let os = require("os");
const axios = require('axios');
const BARK_PUSH = true;
const timeout = 15000;

// QingLong log path
const qlLogPath = '/ql/data/log/';
const timeStamp = getTodayDateStr(true);
let timeStampRead;

//白名单
let WHITELIST = ['6dylan6_jdpro'];
//日志黑名单
let BLACKLIST = [
    'testNotify',
    'jd_dreamFactory'
];

fs.readFile(__dirname + '/notifyTimeLog.txt', function (err, data) {
    if (err) {
        // console.log(err);
        timeStampRead = getTodayDateStr(1, -2);
    } else {
        const arr = data.toString().replace(/\r\n/g, '\n').split('\n');
        console.log(arr);
        timeStampRead = arr[arr.length - 2];//每次写入会额外加入一个空行，因此最后一行是空行。
        if (timeStampRead) {
            console.log("Read last write date is: " + timeStampRead)
            loopLogDirs();
        } else {
            console.error('Read last write date error: ' + timeStampRead)
        }
    }
    writeExeTime();
});

function writeExeTime() {
    // 将数据写入文件sample.html
    fs.writeFile(__dirname + '/notifyTimeLog.txt', timeStamp + os.EOL, { flag: 'a' },
        // 写入文件后调用的回调函数
        function (err) {
            if (err) throw err;
            // 如果没有错误
            console.log("logdate is written to file successfully: " + timeStamp)
        });
}

function loopLogDirs() {
    fs.readdir(qlLogPath, (err, LogDirs) => {

        if (!err) {
            //hit white list
            let whiteLogDirs = LogDirs.filter(curLogFolder => filterLogFolder(curLogFolder, WHITELIST));

            //filter black list
            whiteLogDirs = whiteLogDirs.filter(curLogFolder => filterBlackList(curLogFolder, BLACKLIST));

            let len = whiteLogDirs.length;
            if (len == 0) {
                console.log('no log folders');
                return;
            }
            console.log('will scan log folder nums:' + len + ', base log folder is:[' + WHITELIST + ']');
            for (let i = 0; i < len; i++) {
                let folderName = whiteLogDirs[i];
                readLogFilesInDir(folderName);
            }
        } else {
            console.log(err);
        }
    });
}

// file logs in every folder
function readLogFilesInDir(folder) {
    fs.readdir(qlLogPath + folder, (err, files) => {
        if (!err) {
            let len1 = files.length;
            let needSend = false;
            for (let i = 0; i < len1; i++) {
                //青龙的日志文件格式都是2022-09-16-22-37-11.log格式
                //直接比较字符串就行,大于上次扫描的时间
                let curLogName = files[i];
                if (curLogName > timeStampRead) {
                    let singleLogPath = qlLogPath + folder + "/" + curLogName;
                    readSingleLog(singleLogPath, curLogName);
                    needSend = true;
                }
            }
            if (!needSend) {
                // console.log(folder + ' no log to send via BARK!');
            }
        } else {
            console.log(err);
        }
    });
}

// filter specify logFolder
function filterLogFolder(curLogFolder, nameArr) {
    return nameArr.some(x => curLogFolder.indexOf(x) > -1);
}

// filter black list
// return true: not in blacklist
function filterBlackList(curLogFolder, blackList) {
    return blackList.some(x => curLogFolder.indexOf(x) < 0);
}

function readSingleLog(filePath, curLogName) {
    fs.stat(filePath, (err, stats) => {
        if (err) {
            console.log(`File doesn't exist.`)
        } else {
            if (stats.size > 4000) { //4096byte = 4KB
                console.log(stats)

                readPart(filePath);
            } else {
                fs.readFile(filePath, { encoding: 'utf-8' }, function (err, data) {
                    if (!err) {
                        // console.log(filePath);
                        console.log('==================start send Bark Message================');
                        console.log('Log Content ：\r\n' + data);
                        BarkNotify(curLogName, data)
                    } else {
                        console.log(err);
                    }
                });
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

const WAIT = 0;
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

async function readPart(file) {
    let CHUNK_SIZE = 4000;
    for await (const chunk of generateChunks(file, CHUNK_SIZE)) {
        // do someting with data  
        // console.log(chunk.toString());
        BarkNotify("PART", chunk.toString())
        await waitTime();
    }
}

const waitTime = () => {
    return new Promise(resolve => {
        setTimeout(resolve, WAIT)
    });
}

function getTodayDateStr(time, offset) {
    let dateObj = new Date();
    if (offset) {
        dateObj.setHours(dateObj.getHours() + offset);
    }
    let year = dateObj.getUTCFullYear();
    let month = dateObj.getUTCMonth() + 1; //months from 1-12
    let day = dateObj.getUTCDate();
    month = paddingZero(month);
    day = paddingZero(day);
    let newdate = year + "-" + month + "-" + day;
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

function BarkNotify(title, desp) {
    if (BARK_PUSH) {
        const options = {
            url: 'https://api.day.app/**',
            body: desp,
            title: title,
            group: 'QingLong',
            icon: 'http://qn.whyour.cn/logo.png',
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
                console.log(error.data);
            });
    }
}