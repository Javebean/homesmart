/**
 * 
START

  
package:/system/priv-app/TvSettings/TvSettings.apk=com.android.tv.settings
package:/data/app/com.dangbei.tvlauncher-1/base.apk=com.dangbei.tvlauncher
package:/data/app/com.gitvdemo.video-1/base.apk=com.gitvdemo.video
package:/data/app/com.moretv.android-1/base.apk=com.moretv.android
package:/data/app/com.cibn.tv-1/base.apk=com.cibn.tv
package:/data/app/com.linkin.tv-1/base.apk=com.linkin.tv



END
 * 
 */


const { info } = require('console');
const fs = require('fs');
const readline = require('readline');

let read = false;
let sysPackage = [];

async function processLineByLine() {
    const fileStream = fs.createReadStream(__dirname + '/parseShell.js');

    const rl = readline.createInterface({
        input: fileStream,
        crlfDelay: Infinity
    });
    // Note: we use the crlfDelay option to recognize all instances of CR LF
    // ('\r\n') in input.txt as a single line break.

    for await (const line of rl) {
        // Each line in input.txt will be successively available here as `line`.
        if (line.startsWith('END')) {
            read = false;
        }
        if (read && line.trim()) {
            // console.log(`Line from file: ${line}`);
            if (line.indexOf('/system') > -1) {
                sysPackage.push(removePackage(getPackagePath(line)));
            } else {
                let syntax = removePackage(getPackagePath(line));
                console.log(syntax);
            }
        }
        if (line.startsWith('START')) {
            read = true;
        }
    }
    console.log("=========NOTE!SYSTEM!==========");
    for (const syntax of sysPackage) {
        console.log(syntax);
    }
}



function getPackagePath(info) {
    let s = info.indexOf(':') + 1;
    let e = info.indexOf('=');
    // console.log(info.substring(s,e));
    return info.substring(s, e);
}

function removePackage(path) {
    return 'rm -f ' + path;
}

processLineByLine();