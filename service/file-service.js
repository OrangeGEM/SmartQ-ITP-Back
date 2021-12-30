const config = require('config');
const fs = require('fs');
const File = require('../models/File');

class FileService {
    createDir(file) {
        //console.log(file)
        const filePath = `${config.get('filePath')}\\${file.user}\\${file.path}`
        //console.log(filePath)
        return new Promise((resolve, reject) => {
            try {
                if(!fs.existsSync(file)) {
                    fs.mkdirSync(filePath)
                    return resolve({message: 'File was created'});
                } else {
                    return reject({message: 'File already exist'});
                }
            } catch(e) {
                return reject({message: 'File Error'})
            }
        })
    }
}

module.exports = new FileService()