const {Router} = require('express');
const router = Router();
const config = require('config');
const FileController = require('../controllers/FileController');

router.post('', FileController.createDir)
router.post('/get', FileController.getFiles)
router.post('/upload', FileController.uploadFile)

module.exports = router;