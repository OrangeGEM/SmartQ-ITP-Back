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

function verifyTokens(tokens) {
    try {   
        const accessData = tokens.accessToken ? jwt.verify(tokens.accessToken, config.get('JWT_ACCESS_SECRET')) : null;
        if(!accessData) {
            const refreshData = tokens.refreshToken ? jwt.verify(tokens.refreshToken, config.get('JWT_REFRESH_SECRET')) : null;
            return refreshData ? refreshData : null;
        }
        return accessData;
    } catch(e) {
        console.log(e);
        return null;
    }
}

function findToken(refreshToken) {
    const tokenData = await.tokenModel.findOne({ refreshToken });
}

module.exports = { generateTokens, saveToken, findToken, verifyTokens };