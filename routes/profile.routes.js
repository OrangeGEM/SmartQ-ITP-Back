const { Router } = require('express');
const router = Router();
const FileController = require('../controllers/FileController');
const File = require('../models/File')
const config = require('config');
const uuid = require('uuid');

const { generateTokens, saveToken, findToken, verifyTokens } = require('../service/token-service');

const QueueModel = require('../models/Queue')

//api/profile/getqueue
router.post('/getqueue', async (req, res) => {
    try{
        const queuesUsers = await QueueModel.find({ user_id: req.body.userId }) 
        return res.status(200).json(queuesUsers);
    } catch(e) {
        console.log(e)
        return res.status(500).json({ message: e }); 
    }
})

//api/profile/createqueue
router.post('/createqueue', async (req, res) => {
    try{
        const data = req.body;
        const fileData = await FileController.createDir({name: data.title, type:"dir", userId: data.user_id})
        data.dir_id = (fileData._id).toString();

        //console.log(data)

        const queue = await QueueModel.create(data)
        return res.status(200).json({ message:'Очередь создана', _id: queue._id, dir_id: data.dir_id, ok:"ok" });
    } catch(e) {
        console.log(e)
        return res.status(500).json({ message: e }); 
    }
})

//api/profile/deletequeue
router.post('/deletequeue', async (req, res) => {
    try{
        console.log(req.body)
        const queuesUsers = await QueueModel.findOneAndDelete({ _id: req.body.queueId })
        return res.status(200).json({ message:'Очередь удалена', ok:"ok" });
    } catch(e) {
        console.log(e)
        return res.status(500).json({ message: e }); 
    }
})

//api/profile/editqueue
router.post('/editqueue', async (req, res) => {
    try{
        console.log(req.body)
        const queuesUsers = await QueueModel.findOneAndUpdate({ _id: req.body.queueId }, {...req.body})  
        return res.status(200).json({ message:'Очередь обновлена', ok:"ok" });
    } catch(e) {
        console.log(e)
        return res.status(500).json({ message: e }); 
    }
})


// MEMBERS //


//api/profile/deletemember
router.post('/deletemember', async (req, res) => {
    try{
        const filter = {_id: req.body.queueId}
        const update = {units: [...req.body.members]} //todo fixed it

        const queue = await QueueModel.findOneAndUpdate(filter, update)
        return res.status(200).json({ message: 'Участник удален', ok:'ok' });
    } catch(e) {
        console.log(e)
        return res.status(500).json({ message: e }); 
    }
})

//api/profile/createmember
router.post('/createmember', async (req, res) => {
    try{
        //console.log(req.body)

        const queue = req.body.queue;
        const member = req.body.member;
        queue.ticketNum++;

        //console.log('units in req queue', queue.units)

        const pushMember = {
            id: queue.ticketNum, 
            ticket:'A'+(queue.ticketNum.toString().padStart(3, 0)), 
            phone: member.phone, 
            date: member.date
        }
        //console.log('Pushing member', pushMember)
        queue.units.push(pushMember);
        //console.log('All units after push:', queue.units);

        //console.log(queue.ticketNum)

        const update = {ticketNum: queue.ticketNum, units: [...queue.units]  }
        const filter = {_id: queue._id}
        const queueUpdate = await QueueModel.findOneAndUpdate(filter, update)
        return res.status(200).json({ message: 'Участник добавлен', ok:'ok', member: pushMember, ticketNum: queue.ticketNum});
    } catch(e) {
        console.log(e)
        return res.status(500).json({ message: e }); 
    }
})

//api/profile/editmember
router.post('/editmember', async (req, res) => {
    try{
        const queue = req.body.queue;
        const member = req.body.member;

        Object.assign(queue.units.find(item => item.id === req.body.member.id), {
            id: member.id,
            ticket: member.ticket,
            phone: member.phone,
            date: member.date
        });
        console.log(queue.units)


        const update = { units: [...queue.units]  }
        const filter = { _id: queue._id }
        console.log(update)
        const queueUpdate = await QueueModel.findOneAndUpdate(filter, update)
        return res.status(200).json({ message: 'Участник добавлен', ok:'ok', members: queue.units});
    } catch(e) {
        console.log(e)
        return res.status(500).json({ message: e }); 
    }
})

module.exports = router;