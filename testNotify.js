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
const notifyTimeLogPath = __dirname + '/notifyTimeLog.json';


//启用通知的项目
let NOTIFY_PRO = ['6dylan6_jdpro'];

let MODE = 0; // 0:WHITE 1:BLACK
let WHITELIST = [
    'jd_speed_sign#0',
    'jd_fruit#1',
    'jd_fruit_new#2',
    'jd_dwapp#4',//积分话费
    'jd_wxttzq#4',
    'jx_joypark_task#5',
    'jd_wskey#6',
    // 'jd_wsck#7', //停用
];

// [start,end)
let WHITELIST_MODE = [
    { start: '正常运行中', end: [', 结束'], skip: ['任务完成','记录成功','气泡收取成功'] }, //0
    { start: '系统通知', end: ['【预测】','已可领取','重新登录','--【京东账号'], skip: ['水果名称','已兑换','剩余水滴','领取失败'] },//1
    { start: '系统通知', end: ['【预测】','已可领取','重新登录','数据异常','剩余水','调用API失败','任务执行异常','发送通知消息成功'], skip: ['水果名称'] },//2
    { start: '开始【京东账号', end: '系统通知', skip: ['脚本也许随时失效,请注意', '没有需要签到的'] },//3
    { start: '开始【京东账号', end: [', 结束!'], skip: ['去做','领取任务','去领积分','已完成浏览','领取成功','去签到','开始任务','等待','任务完成','领取奖励','--已完成','at','scripts','TypeError','function'] },//4
    { start: '开始内部互助', end: ['没有可用于助力的ck'], skip: ['账号'] },//5
    { start: '检索成功', end: ['账号启用','账号禁用'], skip: ['检索成功','状态正常','账号有效','账号启用'] },//6
    { start: '转换结果', end: ['执行结束'], skip: [] },//7
];

// 帐号 - 昵称
let nickNameMap = [
    { ID: '1178080609_m',     nick: '5210'  },
    { ID: 'jd_JSwOngbVqJvL',  nick: '1330'  },
    { ID: 'jd_625e3281b31ca', nick: '7467'  },
    { ID: 'jd_4d2a4a1043fd6', nick: '2890'  },
    { ID: 'jd_YjNlBptDjNHx',  nick: '6143'  },
    { ID: 'jd_BCOTMkLCiRjV',  nick: '1975'  },
    { ID: 'jd_6cc96411fe998', nick: '2626'  },
    { ID: 'jd_UdFBUuRwgSZz',  nick: 'bro'   },
    { ID: 'wdfsDgQuBuEEce',   nick: 'jiang' },
];

//日志黑名单
let BLACKLIST = [
    'testNotify',
    'jd_dreamFactory',
    'jd_jxmc', //jx牧场
    'jd_cfd', //财富岛
    'jd_jdfactory', //dd工厂
    'jd_wish', //
    'jd_beauty', //
    'jd_xinruimz', //
    'jd_mf_new', //魔方
    'jd_superBrandZII', //特务
    'jd_superBrandStar', //特务
    'jd_twjk_new.js', //特务
    'jd_SuperBrandJXZ', //特务
    'jd_sign_graphics1', //特务
];

//level 0：简易通知，只显示知否完成
//level 1: 完整通知
const GLOBAL_LEVEL_0 = 0;
let GLOBAL_LEVEL = GLOBAL_LEVEL_0;

// test
// processLineByLine(__dirname + '/2023-03-13-06-18-13.log')
// processLineByLine(__dirname + '/jd_speed_signfree.log')
// prod
taskStart();

function taskStart() {
    loopLogDirs();
}

function loopLogDirs() {
    fs.readdir(qlLogPath, (err, LogDirs) => {
        if (!err) {
            //hit need notify project list
            let filterLogDirs = LogDirs.filter((curLogFolder) =>
                someOfArr(curLogFolder, NOTIFY_PRO)
            );

            //filter white/black list
            if (MODE == 0) {
                filterLogDirs = filterLogDirs.filter((curLogFolder) =>
                    filterList(curLogFolder, WHITELIST)
                );
            } else {
                filterLogDirs = filterLogDirs.filter(
                    (curLogFolder) => !filterList(curLogFolder, BLACKLIST)
                );
            }

            console.log('即将在['+NOTIFY_PRO+']中扫描以下日志文件夹：');
            console.log(filterLogDirs);
            let len = filterLogDirs.length;
            if (len == 0) {
                console.log('没有扫描的日志文件夹');
                return;
            }

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
            if (logTime2 > getSendTime(folderName)) {
                console.log('PreSend', folderName, '上次发送时间：'+getSendTime(folderName)+' 本次日志时间：'+logTime2);
                let singleLogPath = qlLogPath + folderName + '/' + logTime2;
                readSingleLog(singleLogPath, folderName, logTime2);
            } else {
                console.log('SkipSend', folderName, '上次发送时间：'+getSendTime(folderName)+' 本次日志时间：'+logTime2);
            }
        } else {
            console.log(err);
        }
    });
}

// readFile line by line
async function processLineByLine(filePath, folderName, sendTime) {
    const fileStream = fs.createReadStream(filePath);

    const rl = readline.createInterface({
        input: fileStream,
        crlfDelay: Infinity,
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

    for await (let oriLine of rl) {
        let line = oriLine;
        // console.log(`Line from file: ${line}`);
        // 等级1 过滤空行
        if (!oriLine) {
            // console.log('空行continue');
            continue;
        }

        // lv2 过滤skip
        if (mode.skip && mode.skip.length > 0) {
            if(someOfArr(oriLine, mode.skip)){
                continue;
            }
        }

        if (oriLine.indexOf('*****') > -1 ) {
            line = line.replaceAll('*','');
        }
        if (oriLine.indexOf('=====') > -1 ) {
            line = line.replaceAll('=','');
        }
        if (oriLine.indexOf('----') > -1 ) {
            line = line.replaceAll('-','');
        }
        if (oriLine.indexOf('系统通知') > -1) {
            line = '';
        }
        if (oriLine.indexOf('东东农场-任务') > -1 || oriLine.indexOf('新农场任务') > -1) {
            line = '';
        }

        if (oriLine.indexOf('转换异常') > -1 || oriLine.indexOf('转换成功') > -1) {
            line = '';
        }


        //替换帐号为nick
        line = replaceNickName(line);

        // console.log('^^^'+line+'^^^^');
        if (oriLine.indexOf(', 开始!') > -1) {
            obj.title = oriLine; //标题始终用原始值
        }

        if (accountSimpleCount > 0) {
            //包含end标记的那行，修改为取的到
            if(someOfArr(oriLine, mode.end)){
                accountSimpleCount = -1;
                obj.notifyContent = (obj.notifyContent || '');
                if (line) {
                    obj.notifyContent += line + os.EOL;//这是换行，不是空一行
                }
                //和下一段空一行
                if (obj.notifyContent) {
                    obj.notifyContent += os.EOL;
                }

                continue;
            }
            accountSimpleCount--;
            obj.notifyContent = (obj.notifyContent || '');
            if (line) {
                obj.notifyContent += line + os.EOL;
            }
        }

        // 上一段的结束 &&  新的开始
        if (accountSimpleCount == -1 && oriLine.indexOf(mode.start) > -1) {
            // console.log('京东账号:' + line);
            obj.notifyContent = (obj.notifyContent || '');
            if (line) {
                obj.notifyContent += line + os.EOL;
            }

            accountSimpleCount = 100;
        }

        if (oriLine.indexOf('执行结束') > -1) {
            console.log(folderName, '遍历日志结束');
            obj.endLine = line;
        }
    }

    if(obj.endLine){ // && obj.notifyContent
        // console.log('即将发送通知：', folderName);
        if (obj.notifyContent) {
            console.log('SucessSend', folderName, obj);
        } else {
            console.log('SucessSend', folderName, '发送文件内容为空');
        }
        BarkNotify(getTodayDateStr(2) + ' ' + (obj.title || folderName), (obj.notifyContent || 'Empty Context') + obj.endLine);
        setSendTime(folderName,sendTime);
    } else {
        console.log('FailSend', folderName, '该日志正在生成中,取消发送');
    }
}

function whichMode(filePath) {
    for (const item of WHITELIST) {
        let name = item.split('#')[0];
        let modeIndex = item.split('#')[1];
        // console.log('PreSend', name, '使用模板', modeIndex);
        if (filePath.indexOf(name + '/') > -1) {
            return WHITELIST_MODE[modeIndex];
        }
    }
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
    return list.some((x) => curLogFolder.endsWith(x.split('#')[0]));
}

function readSingleLog(filePath, folderName, sendTime) {
    processLineByLine(filePath, folderName, sendTime);
}

function replaceNickName(line) {
    let find = nickNameMap.find((x) => line.indexOf(x.ID)>-1);
    if (find) {
        return line.replace(find.ID, find.nick)
    }
    return line;
}

function getSendTime(key) {
    try {
        let data = fs.readFileSync(notifyTimeLogPath);
        let logObj = JSON.parse(data);
        return logObj[key] || '0000';
    } catch (err) {
        // console.log(err);
    }
    return '0000';
}

function setSendTime(key, value) {
    fs.readFile(notifyTimeLogPath, function (err, data) {
        let logObj = {};
        if (err) {
            if (err.code === 'ENOENT') {
                // 如果文件不存在，则新建文件并写入内容
                logObj[key] = value;
                // fs.writeFile(notifyTimeLogPath, JSON.stringify(logObj), (err) => {
                //     if (err) throw err;
                //     console.log('File created and content written!');
                // });
            } else {
                throw err;
            }
        } else {
            logObj = JSON.parse(data);
            logObj[key] = value;
        }

        fs.writeFile(notifyTimeLogPath, JSON.stringify(logObj), (err) => {
            if (err) throw err;
            console.log('发送日志写入成功!', key, value);
        });
    });
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

        axios
            .post(options.url, options)
            .then(function (response) {
                console.log('Bark Response:');
                console.log(response.data);
            })
            .catch(function (error) {
                console.log('Bark Error Response:');
                console.log(error);
            });
    }
}
