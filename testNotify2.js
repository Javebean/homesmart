///mnt/mmcblk2p4/ql/data/scripts/
const fs = require('fs');
const readline = require('readline');
const os = require('os');
const axios = require('axios');
const BARK_PUSH = true;
const BARK_CODE = 'Wqemw2bfoMB4tZYLeNL86M';
const timeout = 15000;

// 日志目录
const LOG_PATH = '../log/';
const notifyTimeLogPath = __dirname + '/notifyTimeLog.json';
let SEND_TIME_LOG = {};

// 启用通知的项目的名称的前缀（日志目录中可能存在很多不同的日志目录，这里用名称来区别不同的项目）
let NOTIFY_PRO = ['6dylan6_jdpro_jd'];

// 启用通知的具体任务名 （一个完整的日志文件夹形如：6dylan6_jdpro_jd_speed_sign_xx）新版文件夹有_xx数字后缀
let WHITELIST2 = [
    { script: 'jd_wsck', name: 'ck', sendText: ['转换失败'] },
    { script: 'jd_fruit_', name: '新旧农场', sendText: ['京东账号', '水果进度','【种植进度】'] },
    { script: 'jd_speed_sign', name: '极速签到',  sendText: ['结束'] },
    { script: 'jd_dwapp', name: '积分话费', sendText: ['总积分'] },
    { script: 'jd_bean_change', name: '资产统计', sendText: ['【账号', '红包总额','当前京豆','话费积分'],blackText:['账号信息'] },
];


// 帐号 - 昵称映射表
let nickNameMap = [
    { ID: '1178080609_m', nick: '5210' },
    { ID: 'jd_JSwOngbVqJvL', nick: '1330' },
    { ID: 'jd_625e3281b31ca', nick: '7467' },
    { ID: 'jd_4d2a4a1043fd6', nick: '2890' },
    { ID: 'jd_YjNlBptDjNHx', nick: '6143' },
    { ID: 'jd_BCOTMkLCiRjV', nick: '1975' },
    { ID: 'jd_6cc96411fe998', nick: '2626' },
    { ID: 'jd_UdFBUuRwgSZz', nick: 'bro' },
    { ID: 'wdfsDgQuBuEEce', nick: 'jiang' },
];


//level 0：简易通知，只显示知否完成
//level 1: 完整通知
let GLOBAL_LEVEL = true;

taskStart();

// 1. 开始任务 读取发送日志时间
function taskStart() {
    fs.readFile(notifyTimeLogPath, 'utf8', (err, data) => {
        if (err) {
            console.error('发生错误：', err);
        } else {
            try {
                SEND_TIME_LOG = JSON.parse(data);
                // SEND_TIME_LOG = JSON.parse("{}");
            } catch (e) {
            }
            console.log('发送时间日志：', SEND_TIME_LOG);
            loopLogDirs();
        }
    });
}

// 2. 读取日志目录中的所有文件夹LogDirs
function loopLogDirs() {
    fs.readdir(LOG_PATH, (err, LogDirs) => {
        if (!err) {
            // 判断当前文件夹是否开启通知
            let filterLogDirs = LogDirs.filter((curLogFolder) =>
                someOfArr(curLogFolder, NOTIFY_PRO)
            );

            // 进一步过滤具体的任务
            filterLogDirs = filterLogDirs.filter((curLogFolder) =>
                filterList(curLogFolder, WHITELIST2)
            );
           

            let len = filterLogDirs.length;
            if (len == 0) {
                console.log('没有需要发送的日志文件夹');
                return;
            }

            console.log('即将在[' + NOTIFY_PRO + ']中扫描以下日志文件夹中最新且未发送的日志：');
            console.log(filterLogDirs);

            // 遍历读取开启通知的任务文件夹
            for (let i = 0; i < len; i++) {
                let log_folder = filterLogDirs[i];
                readLogFilesInDir(log_folder);
            }
        } else {
            console.log(err);
        }
    });
}

// 3. 读取某一个日志文件夹中最新时间的日志
function readLogFilesInDir(log_folder) {
    fs.readdir(LOG_PATH + log_folder, (err, files) => {
        if (!err) {
            //青龙的日志文件格式都是2022-09-16-22-37-11.log格式
            //不管正序倒序，比较出最新的日志即可
            let logTime1 = files[0];
            let latestTime = files[files.length - 1];

            if (logTime1 > latestTime) {
                latestTime = logTime1;
            }
            // 发现新的日志产生
            if (latestTime > getSendTime(log_folder)) {
                console.log('发现新日志文件', log_folder);

                let send_texts_mode = whichMode(log_folder);
                if (!send_texts_mode) {
                    console.log('没有解析模板，发送空消息', log_folder);
                    BarkNotify(getTodayDateStr(2), "", log_folder, '已执行', latestTime);
                    return;
                }

                processLineByLine(send_texts_mode, log_folder, latestTime);
            } else {
                // console.log('SkipSend', log_folder, '上次发送时间：'+getSendTime(log_folder)+' 本次日志时间：'+latestTime);
            }
        } else {
            console.log(err);
        }
    });
}

// 4. 读取单个文件
async function processLineByLine(mode, log_folder, latestTime) {
    let singleLogPath = LOG_PATH + log_folder + '/' + latestTime;
    const fileStream = fs.createReadStream(singleLogPath);

    const rl = readline.createInterface({
        input: fileStream,
        crlfDelay: Infinity,
    });
    // Note: we use the crlfDelay option to recognize all instances of CR LF
    // ('\r\n') in input.txt as a single line break.


    let send_log = '';
    let log_created = false;
    for await (let line of rl) {
        // console.log(`Line from file: ${line}`);
        // 等级1 过滤空行
        if (!line) {
            // console.log('空行continue');
            continue;
        }

        // lv2 过滤skip
        if (mode && mode.sendText.length > 0) {
            if (someOfArr(line, mode.sendText) || line.indexOf('执行结束') > -1) {
                // 过滤 --- ==== *** 符号
                if (line.indexOf("*****") > -1 || line.indexOf("-----") > -1 || line.indexOf("=====") > -1) {
                    continue;
                }

                if(mode.blackText && someOfArr(line, mode.blackText)){
                    continue;
                }

                //替换帐号为nick
                line = replaceNickName(line);

                if (line.indexOf('执行结束') > -1) {
                    log_created = true;
                }

                send_log += line + os.EOL;
            }
        }
    }

    // 发送拼装好的日志文本
    if (log_created) {
        // console.log(send_log);
        BarkNotify(getTodayDateStr(2), mode.name, log_folder, send_log, latestTime);

    } else {
        console.log('FailSend', log_folder, '该日志正在生成中,取消发送');
    }
}

function whichMode(name) {
    return WHITELIST2.find((x) => name.indexOf(x.script) > -1);
}

// format 0/undefined fullformat 2023-03-19-11-40-23
// format 1 : 2023-03-19
// format 2 : 03-19
function getTodayDateStr(format, offset) {
    let need_year = true,
        need_time = true;
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

// hit project list
function someOfArr(text, keysArr) {
    return keysArr.some((x) => text.indexOf(x) > -1);
}

// hit whilte/black list
function filterList(curLogFolder, list) {
    return list.some((x) => curLogFolder.indexOf(x.script) > -1);
}


function replaceNickName(line) {
    let find = nickNameMap.find((x) => line.indexOf(x.ID) > -1);
    if (find) {
        return line.replace(find.ID, find.nick)
    }
    return line;
}

function getSendTime(key) {
    return SEND_TIME_LOG[key] || '000000000000';
}

// 写入日志
function setSendTime(key, value) {
    SEND_TIME_LOG[key] = value;
    fs.writeFileSync(notifyTimeLogPath, JSON.stringify(SEND_TIME_LOG));
}

function BarkNotify(today, script_name, log_folder, content, send_time) {

    let title = today + " " + script_name;
    if (BARK_PUSH) {
        const options = {
            url: 'https://api.day.app/' + BARK_CODE,
            body: content,
            title: title,
            group: 'QingLong',
            icon: 'http://day.app/assets/images/avatar.jpg',
            level: GLOBAL_LEVEL ? 'active' : 'passive',
            sound: '',
            headers: {
                'Content-Type': 'application/json; charset=utf-8',
            },
            timeout,
        };

        axios
            .post(options.url, options)
            .then(function (response) {
                console.log('Bark Response:');
                console.log(response.data);
                setTimeout(setSendTime, 500, log_folder, send_time);
                console.log("写入日志成功");
            })
            .catch(function (error) {
                console.log('Bark Error Response:');
                console.log(error);
            });
    }
}
