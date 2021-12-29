const {Router} = require('express');
const router = Router();
const config = require('config');
const FileController = require('../controllers/FileController');

router.post('', FileController.createDir)
router.post('/get', FileController.getFiles)

router.post('/upload', (req, res) => {
    console.log(req.body);
    return res.status(200).json({message: 'Ok!'})
})

module.exports = router;