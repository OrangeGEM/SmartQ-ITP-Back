const { Router } = require('express');
const router = Router();

const config = require('config');
const uuid = require('uuid');

const { generateTokens, saveToken, findToken, verifyTokens } = require('../service/token-service');

const QueueModel = require('../models/Queue')

//api/profile/getqueue
router.post('/getqueue', async (req, res) => {
    try{
        const queuesUsers = await QueueModel.find({ user_id: req.body.userId })
        //console.log('Queues: ', queuesUsers);  
        return res.status(200).json(queuesUsers);
    } catch(e) {
        console.log(e)
        return res.status(500).json({ message: e }); 
    }
})

//api/profile/deletequeue
router.post('/deletequeue', async (req, res) => {
    try{
        const queuesUsers = await QueueModel.find({ user_id: req.body.userId })
        //console.log('Queues: ', queuesUsers);  
        return res.status(200).json(queuesUsers);
    } catch(e) {
        console.log(e)
        return res.status(500).json({ message: e }); 
    }
})

//api/profile/deletemember
router.post('/deletemember', async (req, res) => {
    try{
        const filter = {_id: req.body.queueId}
        const update = {units: [...req.body.members]}

        const queue = await QueueModel.findOneAndUpdate(filter, update)
        return res.status(200).json({ message: 'Ok, member delete' });
    } catch(e) {
        console.log(e)
        return res.status(500).json({ message: e }); 
    }
})



module.exports = router;