const fs = require('fs');
const path = require('path');
let basePath = 'D:\\Downloads\\emuelec-games\\';
let allgame = '';

traverseFolder(basePath);

function traverseFolder(folderPath) {
    const folderList = fs.readdirSync(folderPath, { withFileTypes: true });
    folderList.forEach(item => {
        if (item.isDirectory()) {
            traverseFolder(`${folderPath}/${item.name}`);
        } else {
            gamepath = path.relative(basePath, `${folderPath}/${item.name}`);
            gamename = path.parse(item.name).name;
            let onegame = createGameItem(gamepath, gamename, '', '', '');
            allgame += onegame;

        }
    });
    let allgameXml = createGameList(allgame);
    console.log(allgameXml);
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