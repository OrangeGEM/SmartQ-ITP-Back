const {Router} = require('express');
const router = Router();
const config = require('config');
const bcrypt = require('bcryptjs');
const uuid = require('uuid');
const { body, check, validationResult } = require('express-validator');
const UserModel = require('../models/User'); //Mongo Model
const { sendActivationMail } = require('../service/mail-service')
const { generateTokens, saveToken, findToken, verifyTokens } = require('../service/token-service');
const UserDto = require('../dtos/user-dto');
// api/auth/login
router.post(
    '/login', 
    body('email').isEmail(), 
    body('password').isLength({ min:6, max: 32 }),
    async (req, res)=> {
    
    try {
        const errors = validationResult(req);
        if(!errors.isEmpty()) {
            return res.status(400).json({ message: 'Ошибка валидации', errors: errors.array() })
        }

        const {email, password} = req.body;

        const user = await UserModel.findOne({ email })
        
        if(!user) {
            res.status(400).json({ message:'Пользователь не найден' })
        }
        const isPassEquels = await bcrypt.compare(password, user.password);
        if(!isPassEquels) {
            res.status(400).json({ message: 'Пароль не верный' })
        }
        const userDto = new UserDto(user);
        const tokens = generateTokens({ ...userDto })

        // await saveToken(userDto.id, tokens.refreshToken); 

        res.cookie('accessToken', tokens.accessToken, { maxAge: 1 * 24 * 60 * 60 * 1000, httpOnly: true });
        res.cookie('refreshToken', tokens.refreshToken, { maxAge: 30 * 24 * 60 * 60 * 1000, httpOnly: true });
        return res.status(200).json({userDto, ...tokens});
        
    } catch(e) {
        console.log(e);
    }
    
});


// api/auth/register
router.post(
    '/register',
    body('email').isEmail(), 
    body('password').isLength({ min:6, max: 32 }),
    async (req, res)=> {

    try {
        const errors = validationResult(req);
        if(!errors.isEmpty()) {
            return res.status(400).json({ message: 'Ошибка валидации', errors: errors.array() })
        }

        const {email, password, rpassword} = req.body; 

        if(password != rpassword) { //Проверка на соответствие паролей
            return res.status(400).json({ message: 'Пароли не соответствуют друг другу' });
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
        // await saveToken(userDto.id, tokens.); 
        await user.save();

        res.cookie('accessToken', tokens.accessToken, { maxAge: 1 * 24 * 60 * 60 * 1000, httpOnly: true });
        res.cookie('refreshToken', tokens.refreshToken, { maxAge: 30 * 24 * 60 * 60 * 1000, httpOnly: true });

        //console.log("[MongoDB] -> User Add")
        return res.json({userDto, ...tokens})
    } catch(e) {
        console.log(e);
        return res.status(500).json({ message:e });
    }


});

router.post('/logout', async (req, res, next) => {
    try { 
        res.clearCookie('accessToken');
        res.clearCookie('refreshToken')
        return res.status(200).json({ message: 'Токен удален'});
    } catch(e) {    
        console.log(e);
        return res.status(500).json({ message:e });
    }
});

router.post('/refresh', async (req, res, next) => {
    try {
        const { accessToken, refreshToken } = req.cookies; 
        await (async () => {
            if(!accessToken || !refreshToken) {
                return res.status(401).json({ message: 'Пользователь не авторизован'  })
            }

            const userData = verifyTokens({accessToken, refreshToken});

            const user = await UserModel.findById(userData.id);
            const userDto = new UserDto(user);
            const tokens = generateTokens({ ...userDto });

            res.cookie('refreshToken', tokens.refreshToken, {maxAge: 30 * 24 * 60 * 60 * 1000, httpOnly: true});
            res.cookie('accessToken', tokens.accessToken, {maxAge: 1 * 24 * 60 * 60 * 1000, httpOnly: true});

            return res.json({ userDto, ...tokens })
        })();
    } catch (e) {
        console.log(e);
        res.status(500).json(e);
    }
});

router.get('/activate/:link', async (req, res) => {
    try {
        const activationLink = req.params.link;
        await ( async () => {
            const user = await UserModel.findOne({ activationLink }) 
            if(!user) {
                throw new Error('Некорректная ссылка активации')
            }
            user.isActivated = true;
            await user.save();
        })();

        return res.redirect(config.get('CLIENT_URL'))

    } catch(e) {
        console.log(e);
    }
});

router.post('/verify', async (req, res) => {
    try {
        const { accessToken, refreshToken } = req.cookies; 
        
        console.log( 'body: ', req.body );
        console.log( 'headers: ', req.headers )

        await (async () => {
            if(!accessToken || !refreshToken) {
                res.status(401).json({ message: 'Пользователь не авторизован'  })
                return res.redirect(config.get('CLIENT_URL'))
            }   

            const userData = verifyTokens({accessToken, refreshToken});
            console.log( 'Userdata: ', userData );
            if(!userData) {
                res.status(401).json({ message: 'Срок действия токена закончен'  })
                return res.redirect(config.get('CLIENT_URL'))
            }

            const user = await UserModel.findById(userData.id);
            console.log('userdb: ', user);
            if(!user) {
                res.status(401).json({ message: 'Пользователь не зарегистрирован'  })
                return res.redirect(config.get('CLIENT_URL'))
            }
            
            return res.status(200).json({ done: true });
            
            // return res.json({ userDto, ...tokens })
        })();
    } catch(e) {
        console.log(e);
        res.status(500).json(e);
    }
    
});

module.exports = router;