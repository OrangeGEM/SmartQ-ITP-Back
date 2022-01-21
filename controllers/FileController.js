
const User = require('../models/User')
const File = require('../models/File')
const fileService = require('../service/file-service')
const config = require('config')
const fs = require('fs')


class FileController {
    async createDir(data) {
        try {
            const {name, type, parent, userId} = data;

            console.log('Data: ', data)
            const file = new File({name, type, parent, user: data.userId, memberId: data.memberId})
            console.log('File', file)
            const parentFile = await File.findOne({_id: parent})
            console.log('Parent: ', parentFile)
            if(!parentFile) {
                file.path = name;
                console.log('Path: ', file.path)
                await fileService.createDir(file)
            } else {
                file.path = `${parentFile.path}\\${file.name}`;
                await fileService.createDir(file);
                parentFile.childs.push(file._id)
                await parentFile.save();
            }
            await file.save();
            console.log('Generated file: ', file)
            return file
        } catch(e) {
            console.log("Controller: ", e);
        }
    }

    async getFiles(req, res) {
        try {
            console.log(req.body)
            const files = await File.find({user: req.body.userId, parent: req.body.parent})
            return res.json({files})
        } catch(e) {
            console.log(e);
            return res.status(500).json({message:"Can not get files"})
        }


    }
    //
    async uploadFile(req, res) {
        try {
            console.log(req.files)
            const file = req.files.file
            const parent = await File.findOne({user: req.body.userId, _id: req.body.parent})

            const path = parent ? `${config.get('filePath')}\\${req.body.userId}\\${parent.path}\\${file.name}` : `${config.get('filePath')}\\${req.body.userId}\\${file.name}`

            if(fs.existsSync(path)) {
                return res.status(400).json({message: "File already exist"})
            }
            file.mv(path)

            const type = file.name.split('.').pop()
            const dbFile = new File({
                name: file.name,
                type,
                path: parent?.path,
                parent: parent?._id,
                user: req.body.userId
            })

            await dbFile.save()

            res.json(dbFile)
        } catch(e) {
            console.log(e)
            return res.status(500).json({message:"Upload Error"})
        }
    }
}

module.exports = new FileController()