const { Router } = require('express');
const router = Router();

const config = require('config');
const uuid = require('uuid');
const { body, check, validationResult } = require('express-validator');
const { generateTokens, saveToken, findToken, verifyTokens } = require('../service/token-service');


//api/profile
router.post('/getqueue', async (req, res) => {
    try{
        return res.status(200).json({message: 'Availible'})
    } catch(e) {
        
    }
})



module.exports = router;