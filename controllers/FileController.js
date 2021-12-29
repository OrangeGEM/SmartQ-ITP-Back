
const User = require('../models/User')
const File = require('../models/File')
const fileService = require('../service/file-service')


class FileController {
    async createDir(req, res) {
        try {
            const {name, type, parent, userId, memberId} = req.body
            const file = new File({name, type, parent, user: userId, memberId: memberId})
            const parentFile = await File.findOne({_id: parent})
            if(!parentFile) {
                file.path = name;
                await fileService.createDir(file)
            } else {
                file.path = `${parentFile.path}\\${file.name}`;
                await fileService.createDir(file);
                parentFile.childs.push(file._id)
                await parentFile.save();
            }
            await file.save();
            return res.json(file)
        } catch(e) {
            console.log(e);
            return res.status(400).json(e)
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
}

module.exports = new FileController()