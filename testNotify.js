///mnt/mmcblk2p4/ql/data/scripts/
const fs = require('fs');
const readline = require('readline');
let os = require('os');
const axios = require('axios');
const BARK_PUSH = true;
const BARK_CODE = "**"
const timeout = 15000;

// QingLong log path
const qlLogPath = '../log/';
const timeStamp = getTodayDateStr();
let timeStampRead;

//启用通知的项目
let NOTIFY_PRO = ['6dylan6_jdpro'];

let MODE = 0;// 0:WHITE 1:BLACK
let WHITELIST = [
    'jd_fruit#1',
    'jd_speed_sign#0',
    'jd_speed_signfree#2',
];

let WHITELIST_MODE = [
    { 'start': "系统通知", 'end': ', 结束', 'block': [] },
    { 'start': "系统通知", 'end': '开始【京东账号', 'block': [] },
    { 'start': "开始【京东账号", 'end': '系统通知', 'block': ['脚本也许随时失效,请注意', '没有需要签到的'] },
]

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
    'jd_mf_new',//魔方
    'jd_superBrandZII',//特务
    'jd_superBrandStar',//特务
    'jd_twjk_new.js',//特务
    'jd_SuperBrandJXZ',//特务
    'jd_sign_graphics1',//特务
];

//level 0：简易通知，只显示知否完成
//level 1: 完整通知
const GLOBAL_LEVEL_0 = 0;
let GLOBAL_LEVEL = GLOBAL_LEVEL_0;


// test
// processLineByLine(__dirname + '/2023-03-13-06-18-13.log')
// processLineByLine(__dirname + '/jd_speed_signfree.log')
// prod
taskStart()

function taskStart() {
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
}


function writeExeTime(f) {
    // 将数据写入文件sample.html
    fs.writeFile(__dirname + '/notifyTimeLog.txt', timeStamp + os.EOL, { flag: f },
        // 写入文件后调用的回调函数
        function (err) {
            if (err) throw err;
            // 如果没有错误
            console.log('本次通知时间写入成功: ' + timeStamp)
        });
}

function loopLogDirs() {
    fs.readdir(qlLogPath, (err, LogDirs) => {
        if (!err) {
            //hit need notify project list
            let filterLogDirs = LogDirs.filter(curLogFolder => hitNotifyPro(curLogFolder, NOTIFY_PRO));

            //filter white/black list
            if (MODE == 0) {
                filterLogDirs = filterLogDirs.filter(curLogFolder => filterList(curLogFolder, WHITELIST));
            } else {
                filterLogDirs = filterLogDirs.filter(curLogFolder => !filterList(curLogFolder, BLACKLIST));
            }

            // console.log(filterLogDirs);
            let len = filterLogDirs.length;
            if (len == 0) {
                console.log('没有扫描到需要发送的通知');
                return;
            }
            console.log('will scan log folder nums:' + len + ', base log folder is:[' + NOTIFY_PRO + ']');
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



// readFile line by line
async function processLineByLine(filePath) {
    console.log(filePath);
    const fileStream = fs.createReadStream(filePath);

    const rl = readline.createInterface({
        input: fileStream,
        crlfDelay: Infinity
    });
    // Note: we use the crlfDelay option to recognize all instances of CR LF
    // ('\r\n') in input.txt as a single line break.

    let obj = {};
    let accountSimpleCount = -1;

    let mode = whichMode(filePath);
    if (!mode) {
        console.log('没有解析模板，直接返回', filePath);
        return;
    }
    console.log('使用该模板：', filePath, mode);

    for await (const line of rl) {
        // console.log(`Line from file: ${line}`);
        if (!line) {
            // console.log('空行continue');
            continue;
        }

        if (mode.block && mode.block.length > 0) {
            let blockArr = mode.block;

            if (blockArr.some(x => line.indexOf(x) > -1)) {
                continue;
            }
        }

        // console.log('^^^'+line+'^^^^');
        if (line.indexOf(', 开始!') > -1) {
            console.log('遍历日志开始');
            obj.title = line;
        }

        if (accountSimpleCount > 0) {
            if (line.indexOf(mode.end) > -1) {
                accountSimpleCount = -1;
                continue;
            }
            accountSimpleCount--;
            obj.notifyContent = obj.notifyContent + line + os.EOL;
        }

        if (accountSimpleCount == -1 && line.indexOf(mode.start) > -1) {
            // console.log('京东账号:' + line);
            obj.notifyContent = (obj.notifyContent || '') + line + os.EOL;
            accountSimpleCount = 100;
        }

        if (line.indexOf('执行结束') > -1) {
            console.log('遍历日志结束')
            obj.endLine = line;
        }
    }
    console.log("输出结果：", obj);
    BarkNotify(getTodayDateStr(2) + ' ' + obj.title, obj.notifyContent + obj.endLine);
}

function whichMode(filePath) {
    for (const item of WHITELIST) {
        let name = item.split('#')[0];
        let modeIndex = item.split('#')[1];
        console.log(name, modeIndex)
        if (filePath.indexOf(name + '/') > -1) {
            return WHITELIST_MODE[modeIndex]
        }
    }
}

// format 0/undefined 2023-03-19 11:40:23
// format 1 : 2023-03-19
// format 2 : 03-19
function getTodayDateStr(format, offset) {
    let need_year = true, need_time = true;
    if (format == 1) {
        need_time = false;
    } else if (format == 2) {
        need_time = false;
        need_year = false;
    }

    let dateObj = new Date();
    if (offset) {
        dateObj.setHours(dateObj.getHours() + offset);
    }
    let year = dateObj.getFullYear();
    let month = dateObj.getMonth() + 1; //months from 1-12
    let day = dateObj.getDate();
    month = paddingZero(month);
    day = paddingZero(day);
    let newdate = month + '-' + day;

    if (need_year) {
        newdate = year + '-' + newdate;
    }
    if (need_time) {
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

// hit white list
function hitNotifyPro(curLogFolder, projects) {
    return projects.some(x => curLogFolder.indexOf(x) > -1);
}

// hit black list
function filterList(curLogFolder, list) {
    return list.some(x => curLogFolder.indexOf(x.split('#')[0]) > -1);
}

function readSingleLog(filePath, descriptor) {
    processLineByLine(filePath);
}

function BarkNotify(title, content) {
    if (!content) {
        return;
    }
    if (BARK_PUSH) {
        const options = {
            url: 'https://api.day.app/' + BARK_CODE,
            body: content,
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