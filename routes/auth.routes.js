const {Router} = require('express');
const router = Router();
const bcrypt = require('bcryptjs');
const {check, validationResult} = require('express-validator');
const User = require('../models/User'); //Mongo Model

// api/auth/login
router.post('/login', 
    [
        check('email', 'Некорректный email'),
        check('password', 'Минимальная длина пароля 8 символов'),
    ],
    async (req, res)=> {
    
    try {
        const errors = validationResult(req);

        if(!errors.isEmpty()) {
            return res.status(400).json({
                errors: errors.array(), message: 'Некорректные данные при регистрации'
            })
        }

        const {email, password} = req.body;

        const user = await User.findOne({ email }) //Поиск 
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
    [
        check('email', 'Некорректный email'),
        check('password', 'Минимальная длина пароля 8 символов'),
        check('rpassword', 'Неправильный пароль')
    ],
    async (req, res)=> {
    //console.log('Request body:', req.body)
    try {
        const errors = validationResult(req);

        if(!errors.isEmpty()) {
            return res.status(400).json({
                errors: errors.array(), message: 'Некорректные данные при регистрации'
            })
        }

        const {email, password, rpassword} = req.body; 
        if(password.length < 6) {
            if(password != rpassword) { //Проверка на соответствие паролей
                return res.status(400).json({ message: 'Пароли не соответствуют друг другу' });
            }
            return res.status(400).json({ message: 'Пароль меньше 6 символов' });
        }

        const candidate = await User.findOne({ email }); //Проверка на наличие 
        if(candidate) {
            return res.status(400).json({ message: 'Такой пользователь уже существует' });
        }

        const hashedPassword = await bcrypt.hash(password, 12);
        const user = new User({ email, password: hashedPassword });

        await user.save();
        console.log("[MongoDB] -> User Add")
        return res.status(201).json({ message:'Пользователь создан' })
    } catch(e) {
        console.log(e);
        return res.status(500).json({ message:e.array() });
    }


});

module.exports = router;