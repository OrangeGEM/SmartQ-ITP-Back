const {Router} = require('express');
const router = Router();


// api/auth/login
router.post('/login', async (req, res)=> {
    console.log('Request body:', req.body)
    res.status(200).json({message:"All Ok!"});
});


// api/auth/register
router.post('/register', async (req, res)=> {
    console.log('Request body:', req.body)
    res.status(200).json({message:"All Ok!"});
});

module.exports = router;