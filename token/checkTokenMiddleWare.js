const signature = require('./index')
const jwt = require('jsonwebtoken');

// 设置不需要进行验证的接口
const noCheckTokenUrl = ['/users/login', '/users/register']

function checkToken(req, res, next) {
    // 获取当前访问的接口地址
    const url = req.originalUrl
    const isNoCheck = noCheckTokenUrl.includes(url)
    if(isNoCheck) {
        next()
        return false;
    }
    // 获取api传递过来的token
    let token = req.get("Authorization"); // 从Authorization中获取token
    let uid = req.get("uid"); 

    // console.log(token, uid);
    // 每次登陆必须携带uid
    if(!uid) {
        return res.status(401).json({
            msg: 'uid呢兄弟？'
        })
    }
    // 进行token解密，需要token和签名。
    jwt.verify(token, signature.PRIVITE_KEY, (err, decode)=> {
        if (err) {  //时间失效的时候 || 伪造的token
            return res.status(401).json({
                msg: 'token校验失败！！！！'
            })
        } else {
           next()
        }
    })
}

module.exports = checkToken;