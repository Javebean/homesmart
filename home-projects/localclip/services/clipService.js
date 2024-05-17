const fs = require('fs');
const path = require('path')
const multer = require('multer');
const jsonFilePath = path.join(__dirname, '..', 'data', 'message.json');
const fileUploadPath = path.join(__dirname, '..', 'data', 'upload');
if (!fs.existsSync(fileUploadPath)) {
    fs.mkdirSync(fileUploadPath, { recursive: true });
    console.log('上传目录已创建:', fileUploadPath);
} else {
    console.log('上传目录已存在:', fileUploadPath);
}

let goHome = function (res) {
    res.sendFile(path.join(__dirname, 'public/index.html'));
}


let saveOrUpdateMessage = function (param) {
    let id = param.id;
    let message = param.message;
    // 要写入的数据对象
    const newData = {
        id: id,
        message: message,
    };
    if (!isEmpty(id)) {
        updateMessageById(newData)
    } else {
        id = saveOneMessage(newData).id;
    }

    return id;
}


let saveOneMessage = function (newData) {
    newData.date = formatDateTime(new Date());

    // 读取之前的数据,首次是[]
    let dataArr = readMessage();
    let id = 1;
    if (dataArr.length > 0) {
        id = dataArr[0].id + 1;
    }

    newData.id = id;
    dataArr.unshift(newData);

    writeFileSync(dataArr);
    return newData;
}


let updateMessageById = function (newData) {
    // 读取之前的数据
    let dataArr = readMessage();

    var foundItem = dataArr.find(function (item) {
        //传过来的id是字符串
        return item.id == newData.id;
    });
    if (foundItem) {
        foundItem.message = newData.message;
        foundItem.date = formatDateTime(new Date());
        writeFileSync(dataArr);
    } else {
        console.error('没找到更新的对象' + JSON.stringify(newData));
    }

}


let readMessage = function () {
    try {
        // 读取 JSON 文件
        const data = fs.readFileSync(jsonFilePath, 'utf8');
        let jsonData = JSON.parse(data);
        return jsonData;
    } catch (error) {
        console.error("文件错误，重新创建: " + error);
        initDataFile();
    }
}

function initDataFile() {
    writeFileSync([]);
}


function writeFileSync(data) {
    // 将 JavaScript 对象转换为 JSON 字符串
    const jsonStr = JSON.stringify(data, null, 2); // 使用 null 和 2 以美化 JSON 格式
    try {
        fs.writeFileSync(jsonFilePath, jsonStr, 'utf8');
        console.log('数据已成功写入到 data.json 文件中。');
    } catch (err) {
        console.error('写入文件时出错:', err);
    }
}

function deleteById(req, res) {
    try {
        let del_id = req.body.id;
        let jsonArray = readMessage();
        var index = jsonArray.findIndex(item => item.id == del_id);
        if (index !== -1) {
            let delItems = jsonArray.splice(index, 1);
            writeFileSync(jsonArray);
            if (delItems.length > 0 && delItems[0]) {
                const firstItem = delItems[0];
                if (firstItem.file) {
                    const oldname = path.join(fileUploadPath, firstItem.file);
                    const newname = path.join(fileUploadPath, 'Del_' + formatDate() + '-' + firstItem.file);
                    renameDelFile(oldname, newname)
                }
            }

            return res.json({ status: 200, id: del_id });
        }
    } catch (er) {
        console.log(er);
        return res.json({ status: -1 });
    }
    return res.json({ status: -1 });
}

function renameDelFile(oldPath, newPath) {
    fs.rename(oldPath, newPath, (err) => {
        if (err) {
            console.error('文件重命名失败:', err);
        } else {
            console.log('文件重命名成功');
        }
    });
}




const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, fileUploadPath);
    },
    filename: function (req, file, cb) {
        utf8FileName = Buffer.from(file.originalname, "latin1").toString(
            "utf8"
        );
        var idName = formatDate() + generateRandomString(4) + '-';
        cb(null, idName + utf8FileName);
    }
});


const upload = multer({ storage: storage }).array('files[]', 12);
function uploadFiles(req, res) {
    upload(req, res, function (err) {
        if (err) {
            console.error('文件上传失败');
            return res.status(500).send('文件上传失败');
        }
        if (!req.files) {
            console.error('没有文件被上传');
            return res.status(400).send('没有文件被上传');
        }

        var promises = req.files.map(function (file) {
            const newData = {
                file: file.filename,
                message: ''
            };

            return saveOneMessage(newData);
        });

        Promise.all(promises)
            .then(function (results) {
                res.json(results);
            })
            .catch(function (error) {
                console.error('文件上传过程中出现错误:', error);
                res.status(500).send('文件上传失败');
            });
    });
}


module.exports = {
    saveOneMessage,
    readMessage,
    saveOrUpdateMessage,
    uploadFiles,
    deleteById,
    goHome
};


function formatDateTime(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');

    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

function formatDate(date = new Date()) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');

    return `${year}${month}${day}${hours}${minutes}${seconds}`;
}


function isEmpty(value) {
    return value === null || typeof value === 'undefined' || (typeof value === 'string' && value.trim() === '' || value === "undefined");
}

function generateRandomString(length) {
    var result = '';
    var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for (var i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}





