const fs = require('fs');
const path = require('path');
let basePath = 'D://Downloads/emuelec-games';
let allgame = '';

traverseFolder(basePath);

function traverseFolder(folderPath) {
    const folderList = fs.readdirSync(folderPath, { withFileTypes: true });
    folderList.forEach(item => {
        if (item.isDirectory()) {
            traverseFolder(`${folderPath}/${item.name}`);
            //这里判断第一层目录是模拟器，如nes,sfc
            //遍历完nes里面的所有文件及子文件夹中文件夹后，写入gamelist
            if (path.resolve(folderPath) === path.resolve(basePath)) {
                let allgameXml = createGameList(allgame);
                try {
                    fs.writeFileSync(`${folderPath}/${item.name}` + '/gamelist.xml', allgameXml, 'utf8');
                    console.log('File written successfully!' + `${folderPath}/${item.name}` + '/gamelist.xml');
                    //每次模拟器文件夹重新开始遍历
                    allgame = '';
                } catch (error) {
                    console.error(error);
                }
            }
        } else {
            if (item.name == 'gamelist.xml') {
                return;
            }
            //这里解析把D://Downloads/emuelec-games/nes/超级马里奥RPG - 七星传奇.zip
            //解析成./超级马里奥RPG - 七星传奇.zip
            gamepath = (folderPath+'/'+item.name).replace(basePath, '')
            gamepath = '.'+gamepath.substr(gamepath.indexOf('/',1))
            gamename = path.parse(item.name).name;
            let onegame = createGameItem(gamepath, gamename, '', '', '');
            allgame += onegame;
        }
    });
}

function createGameList(allItemStr) {
    let model = '<?xml version="1.0"?>\n'
        + '<gameList>\n'
        + allItemStr
        + '</gameList>';
    return model;
}

function createGameItem(path, name, image, video, desc) {
    let model = getTab(1) + '<game>\n'
        + getTab(2) + '<path>' + path + '</path>\n'
        + getTab(2) + '<name>' + name + '</name>\n'
        + getTab(2) + '<image>' + image + '</image>\n'
        + getTab(2) + '<video>' + video + '</video>\n'
        + getTab(2) + '<desc>' + desc + '</desc>\n'
        + getTab(1) + '</game>\n';
    return model;
}

function getTab(n) {
    if (n == 1) {
        return '    ';
    } else if (n == 2) {
        return '        ';
    } else {
        return '';
    }
}