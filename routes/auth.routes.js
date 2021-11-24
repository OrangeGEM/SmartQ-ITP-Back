const {Router} = require('express');
const router = Router();
const config = require('config');
const bcrypt = require('bcryptjs');
const uuid = require('uuid');
const { check, validationResult } = require('express-validator');
const UserModel = require('../models/User'); //Mongo Model
const { sendActivationMail } = require('../service/mail-service')
const { generateTokens, saveToken } = require('../service/token-service');
const UserDto = require('../dtos/user-dto');
// api/auth/login
router.post('/login', 
    async (req, res)=> {
    
    try {

        const {email, password} = req.body;

        if(email === ''){
            return res.status(400).json({ message: 'Некорректный email' });
        }

        if(password.length < 6) {
            return res.status(400).json({ message: 'Пароль меньше 6 символов' });
        }

        const user = await UserModel.findOne({ email }) //Поиск 
        if(!user) {
            return res.status(400).json({ message: 'Пользователь не найден' })
        }

        const isMatch = await bcrypt.compare(password, user.password); //Проверка паролей
        if(!isMatch) {
            return res.status(400).json({ message: 'Неверный пароль' });
        }

        res.status(200).json({ message:'Аутентифицирован' }); //Auth - Next
    } catch(e) {
        console.log(e);
        res.status(500).json({ message:e.array() })
    }
    
});


// api/auth/register
router.post(
    '/register', 
    async (req, res)=> {

    try {

        const {email, password, rpassword} = req.body; 

        if(email === ''){
            return res.status(400).json({ message: 'Некорректный email' });
        }

        if(password.length < 6) {
            if(password != rpassword) { //Проверка на соответствие паролей
                return res.status(400).json({ message: 'Пароли не соответствуют друг другу' });
            }
            return res.status(400).json({ message: 'Пароль меньше 6 символов' });
        }

        const candidate = await UserModel.findOne({ email }); //Проверка на наличие 
        if(candidate) {
            return res.status(400).json({ message: 'Такой пользователь уже существует' });
        }

        const hashedPassword = await bcrypt.hash(password, 12);
        const activatedLink = uuid.v4();
        console.log(activatedLink);

        const user = await UserModel.create({ email, password: hashedPassword, activatedLink });

        await sendActivationMail(email, `${config.get('API_URL')}/api/auth/activate/${activatedLink}`);

        const userDto = new UserDto(user);
        const tokens = await generateTokens({...userDto});
        await saveToken(userDto.id, tokens.refreshToken); 
        await user.save();

        res.cookie('refreshToken', tokens.refreshToken, {maxAge: 30 * 24 * 60 * 60 * 1000, httpOnly: true});

        //console.log("[MongoDB] -> User Add")
        return res.json({userDto, ...tokens})
    } catch(e) {
        console.log(e);
        return res.status(500).json({ message:e });
    }


});

router.post('/logout', async (req,res) => {
    return res.status(200).json({ message:'Done' })
});

router.get('/refresh', async (req,res) => {
    return res.status(200).json({ message:'Done' })
});

router.get('/activate/:link', async (req,res) => {
    //await sendActivationMail();
    return res.status(200).json({ message:'Done' })
});

module.exports = router;