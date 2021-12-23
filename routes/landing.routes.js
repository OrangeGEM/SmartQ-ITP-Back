const { Router } = require('express');
const router = Router();

const QueueModel = require('../models/Queue')

router.post('/queuecount', async(req,res) => {
    try {
        const queue = await QueueModel.find({}) //todo use method for count of objects
        return res.status(200).json({count: queue.length})//todo use cache
    } catch(e) {
        console.log(e);
        return res.status(500).json({ message: e }); 
    }
})

module.exports = router;