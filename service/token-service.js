const jwt = require('jsonwebtoken');
const config = require('config');
const tokenModel = require('../models/Token');

function generateTokens(payload) {
    const accessToken = jwt.sign(payload, config.get('JWT_ACCESS_SECRET'), {expiresIn: '1d'})
    const refreshToken = jwt.sign(payload, config.get('JWT_REFRESH_SECRET'), {expiresIn: '30d'})

    return { accessToken, refreshToken };
}

async function saveToken(userId, refreshToken) {
    const tokenData = await tokenModel.findOne({ user: userId })
    if(tokenData) {
        tokenData.refreshToken = refreshToken;
        return tokenData.save();
    }
    const token = await tokenModel.create({ user: userId, refreshToken });
    return token;
}

// async function removeToken(refreshToken) {
//     const tokenData = await tokenModel.deleteOne({ refreshToken });
//     return tokenData;
// }

function validateAccessToken(token) {
    try {
        const userData = jwt.verify(token, config.get('JWT_ACCESS_SECRET'));
        return userData;
    } catch(e) {
        return null;
    }   
}

function validateRefreshToken(token) {
    try {
        const userData = jwt.verify(token, config.get('JWT_REFRESH_SECRET'));
        return userData;
    } catch(e) {
        return null;
    }   
}

function findToken(refreshToken) {
    const tokenData = await.tokenModel.findOne({ refreshToken });
}

module.exports = { generateTokens, saveToken, validateAccessToken, validateRefreshToken, findToken };