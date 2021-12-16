const { Router } = require('express');
const router = Router();

const config = require('config');
const uuid = require('uuid');

const { generateTokens, saveToken, findToken, verifyTokens } = require('../service/token-service');

const QueueModel = require('../models/Queue')

//api/profile/getqueue
router.post('/getqueue', async (req, res) => {
    try{
        const { accessToken, refreshToken } = req.cookies;
        const userData = verifyTokens({ accessToken, refreshToken })
        if(!userData) {
            return res.status(401).json({ message: 'Пользователь не авторизован' })
        }

        const queuesUsers = await QueueModel.find({ user_id: userData.id })
        // console.log('Queues: ', queuesUsers);  
        return res.status(200).json(queuesUsers);

    } catch(e) {
        console.log(e)
        return res.status(500).json({ message: e }); 
    }
})

//api/profile/setqueue
router.post('/setqueue', async (req, res) => {
    try{
        // console.log('SET QUEUE: ', req.body)
        const { accessToken, refreshToken } = req.cookies;
        const userData = verifyTokens({accessToken, refreshToken})
        if(!userData) {
            return res.status(401).json({ message: 'Пользователь не авторизован' })
        } 
        // console.log({ user_id: userData.id, ...req.body });
        await QueueModel.create({ user_id: userData.id, ...req.body, ticketNum: 0 })
        const setQueue = await QueueModel.find({ user_id: userData.id })
        //console.log(setQueue);
        return res.status(200).json({ message: 'Очередь создана', setQueue })

    } catch(e) { 
        console.log(e)
        return res.status(500).json({ message:e }); 
    }
})

//api/profile/deletequeue
router.post('/deletequeue', async (req, res) => {
    try{
        // console.log('SET QUEUE: ', req.body)
        const { accessToken, refreshToken } = req.cookies;
        const userData = verifyTokens({accessToken, refreshToken})
        if(!userData) {
            return res.status(401).json({ message: 'Пользователь не авторизован' })
        } 
        //console.log('Deleting: ', { ...req.body });
        await QueueModel.findByIdAndDelete(req.body._id)
        const setQueue = await QueueModel.find({ userId: userData.id });
        // console.log(setQueue);
        return res.status(200).json({ message: 'Очередь удалена', setQueue })

    } catch(e) { 
        console.log(e)
        return res.status(500).json({ message:e }); 
    }
})

//api/profile/updatequeue
router.post('/updatequeue', async (req, res) => {
    try{
        // console.log('SET QUEUE: ', req.body)
        const { accessToken, refreshToken } = req.cookies;
        const userData = verifyTokens({accessToken, refreshToken})
        const queueMembers = [];
        if(!userData) {
            return res.status(401).json({ message: 'Пользователь не авторизован' })
        } 



        if(req.body.title) {
            await QueueModel.findByIdAndUpdate(req.body._id, { 
                title: req.body.title, 
                key: req.body.key, 
                desc: req.body.desc 
            })
        } else {
            const queue = await QueueModel.findById(req.body._id)
            queue.ticketNum++;
            queue.units.push({
                id: queue.ticketNum, 
                ticket:'A'+(queue.ticketNum.toString().padStart(3, 0)), 
                phone: req.body.phone, 
                time: req.body.time
            });
            queueMembers.push(...queue.units)
            await queue.save();
        }
        
        const setQueue = await QueueModel.find({ userId: userData.id });
        // console.log(setQueue);
        return res.status(200).json({ message: 'Очередь обновлена', setQueue, queueMembers })

    } catch(e) { 
        console.log(e)
        return res.status(500).json({ message:e }); 
    }
})

//api/profile/updatemembers
router.post('/updatemembers', async (req, res) => {
    try{
        const { accessToken, refreshToken } = req.cookies;
        const userData = verifyTokens({accessToken, refreshToken})
        if(!userData) {
            return res.status(401).json({ message: 'Пользователь не авторизован' })
        }
        //console.log(req.body)
        const queue = await QueueModel.findById( req.body.id );
        queue.units = req.body.units;
        queue.save();

        return res.status(200).json({ message: 'Участники обновлены', queue: queue.units })

    } catch(e) { 
        console.log(e)
        return res.status(500).json({ message:e }); 
    }
})

module.exports = router;