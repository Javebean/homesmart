/**
 * 
 
 #google google search
 package:/system/priv-app/Velvet/Velvet.apk=com.google.android.googlequicksearchbox //可卸载
 package:/system/priv-app/GoogleOneTimeInitializer/GoogleOneTimeInitializer.apk=com.google.android.onetimeinitializer
 package:/system/app/ConfigUpdater/ConfigUpdater.apk=com.google.android.configupdater
 package:/system/priv-app/GooglePartnerSetup/GooglePartnerSetup.apk=com.google.android.partnersetup
 
START

package:/system/app/com.shafa.zhuomian_2.4.7_xm0014/com.shafa.zhuomian_2.4.7_xm0014.apk=com.shafa.launcher
package:/system/app/com.shafa.market/com.shafa.market.apk=com.shafa.market


package:/data/app/com.tv.kuaisou-1/base.apk=com.tv.kuaisou
package:/data/app/com.gitvdemo.video-1/base.apk=com.gitvdemo.video
package:/data/app/com.moretv.android-1/base.apk=com.moretv.android
package:/data/app/com.cibn.tv-1/base.apk=com.cibn.tv
package:/data/app/com.linkin.tv-1/base.apk=com.linkin.tv

/system/app/dabaizhiyin/dabaizhiyin.apk=com.ph.remote
package:/system/app/PPPoE/PPPoE.apk=com.droidlogic.PPPoE

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
    return 'adb shell rm -f ' + path;
}

processLineByLine();