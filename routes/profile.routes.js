const { Router } = require('express');
const router = Router();
const FileController = require('../controllers/FileController');
const File = require('../models/File')
const config = require('config');
const uuid = require('uuid');

const { generateTokens, saveToken, findToken, verifyTokens } = require('../service/token-service');

const QueueModel = require('../models/Queue');

//api/profile/getqueue
router.post('/getqueue', async (req, res) => {
    try{
        const queuesUsers = await QueueModel.find({ user_id: req.body.userId, active: true }) 
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
        // console.log(fileData)
        data.dir_id = fileData._id;

        //console.log(data)

        const queue = await QueueModel.create(data)
        console.log(queue)
        return res.status(200).json({ message:'Очередь создана', queue: queue, ok:"ok" });
    } catch(e) {
        console.log(e)
        return res.status(500).json({ message: e }); 
    }
})

//api/profile/deletequeue
router.post('/deletequeue', async (req, res) => {
    try{
        console.log(req.body)
        const queuesUsers = await QueueModel.findOneAndUpdate({ _id: req.body.queueId, active: false })
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
        console.log(req.body)

        const queue = req.body.queue;
        const member = req.body.member;
        queue.ticketNum++;
        queue.idNum++;

        //console.log('units in req queue', queue.units)

        const pushMember = {
            id: queue.idNum, 
            ticket:'A'+(queue.ticketNum.toString().padStart(3, 0)), 
            phone: member.phone, 
            date: member.date,
            active: true
        }
        //console.log('Pushing member', pushMember)
        
        //console.log('All units after push:', queue.units);

        //console.log(queue.ticketNum)


        const fileData = await FileController.createDir({name: pushMember.id, type:"dir", parent: req.body.dir_id, userId: queue.user_id})
        //console.log(fileData)

        pushMember.dir_id = fileData._id
        pushMember.parent_id = fileData.parent
        console.log(pushMember)

        queue.units.push(pushMember);
        const update = {ticketNum: queue.ticketNum, units: [...queue.units]  }

        const filter = {_id: queue._id}
        const queueUpdate = await QueueModel.findOneAndUpdate(filter, update)

        console.log(queueUpdate)

        return res.status(200).json({ message: 'Участник добавлен', ok:'ok', member: pushMember, ticketNum: queue.ticketNum, dir_id: pushMember.dir_id});
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

//api/profile/resetmembers
router.post('/resetmembers', async (req, res) => {
    try{
        const filter = {_id: req.body.id}
        const queue = await QueueModel.findOne(filter);
        queue.units.forEach(element => {
            element.active = false
        });
        queue.ticketNum = 0;

        console.log(queue);
        await QueueModel.findOneAndUpdate(filter, queue);
        return res.status(200).json({ message: 'Участники обнулены', queue: queue, ok:'ok' });
    } catch(e) {
        console.log(e)
        return res.status(500).json({ message: e }); 
    }
})


module.exports = router;