var express = require('express');
var router = express.Router();
// 引入mongodb数据库
const mongo = require('../mongodb/mongoose');

// jwt为一个设置token的api
const jwt = require('jsonwebtoken');
// 引入token密钥和过期时间
const signature = require('../token')
const {initUserLinkMan, initChatHistoryModel} = require('../mongodb/server');
const { wsMap } = require('../websocket');

/* 账号登录 */
router.post('/login', function(req, res, next) {
  const { username, password } = req.body;
  mongo.login({ username, password }).then((result)=> {
    const { success, uid } = result;
    if(success) {
      // 登陆成功，添加token验证，token生成需要三个参数，用户信息，密钥，过期时间
      let token = jwt.sign(
        {username}, 
        signature.PRIVITE_KEY, // 密钥
        {expiresIn: signature.EXPIRESD}) // 过期时间
      res.send({
        token,
        uid,
        ...result,
      }); 
    }else {
      res.send({
        success: false,
        code: 'fail',
        message: '账号密码不正确',
      })
    }
  })
});

/* 账号注册 */
router.post('/register', function(req, res, next) {
  const { username, password, email, randomAvatar } = req.body;
  mongo.register({ username, password, email, randomAvatar, signature: '这个人很懒，还没有填写个性签名',isOnLine: false })
  .then((result=> {
    // console.log(result);
    const { success, user } = result;
    if(success) {
      // 登陆成功，添加token验证，token生成需要三个参数，用户信息，密钥，过期时间
      let token = jwt.sign(
        {username}, 
        signature.PRIVITE_KEY, // 密钥
        {expiresIn: signature.EXPIRESD}) // 过期时间
      const { _id } = user;
      initUserLinkMan(username, _id)
      res.send({
        ...result,
        token,
      })
      return;
    }
    res.send(result); 
  }))
});

// 修改用户头像
router.post('/avatoar',(req, res, next)=> {
  const uid = req.get("uid"); 
  const { avatoar} =  req.body;
  mongo.userModel.updateOne({_id: uid}, {avatoar}, { }, (result)=> {
    res.send({
      success: true,
      code: 'success',
    })
  })  
})

// 修改用户信息
router.post('/userinfo',(req, res, next)=> {
  const uid = req.get("uid"); 
  const { email, sex, nickname,signature } =  req.body;
  mongo.userModel.updateOne({_id: uid}, { email, sex, nickname, signature}, { }, (result)=> {
    res.send({
      success: true,
      code: 'success',
    })
  })  
})

// 查询用户信息
router.post('/queryUser',async (req, res, next)=> {
  const uid = req.get("uid"); 
  const result = await mongo.userModel.findOne({_id: uid})
  const {
    nickname,
    username,
    email,
    sex,
    avatoar,
    signature,
  } = result;
  res.send({
    nickname,
    username,
    email,
    sex,
    avatoar,
    uid,
    signature,
  })
})

// 响应好友请求
router.post('/respondAdd',async (req, res, next)=> {
  const { isAgree, username} = req.body;
  const uid = req.get("uid"); 

  let { _id } = await mongo.userModel.findOne({username})
  // mongodb自动生成的id不是String类型的。
  _id = String(_id)
  
  // 将a的待验证数组清空对应b的id
  // 不管用户同意还是拒绝，都讲该条好友验证剔除
  const  { nModified } = await mongo.userLinkManModel.updateOne({ uid }, {$pull: {'noValidation': String(_id) }})  
  if(nModified > 0) {
    // 去除成功
  }

  if(!isAgree) {
    res.send({
      success: true,
      code: 'success',
      message: '成功'
    })
    return;
  }

  // 查询是否已经为好友
  const {linkManList } = await mongo.userLinkManModel.findOne({uid})

  if(linkManList.some((item)=> item.uid === _id)) {
    res.send({
      success: true,
      code: 'fail',
      message: '该用户已经是您的好友了'
    })
    return;
  }

  if(isAgree) {
    const { resultObj } = await initChatHistoryModel({
      members: [_id, uid], 
      type: 'session', 
  })
    const { _id: converId } = resultObj;
    // 更新接受者的好友列表
    const provider = await mongo.userLinkManModel.updateOne( 
      {uid,  "linkManList.uid": { $ne: String(_id) }}, // 
      {$push: {'linkManList': {uid:_id, converId}, 'sessionList': _id} })
       
    // 更新发送者的好友列表
    const consumer = await mongo.userLinkManModel.updateOne(
      {uid:_id,  "linkManList.uid": { $ne: String(uid) }}, 
      {$push: {'linkManList': {uid, converId }, 'sessionList': uid}})

    // 接受者像发送者发送一条消息
    const text = {
      date: new Date().getTime(),
      talker: uid, // 
      content: `我已经通过了你的验证，很高兴认识你！`, // 说话内容
      read: [], // 已读的人
      type: 'text',
    }
    const result = await mongo.chatHistoryModel.updateOne({_id: converId}, {$push: {history: text}, lastHistory: text})
    
    // 当A用户同意b用户请求后，应该将同意反馈給b用户
    for(let map of wsMap) {
      const ws = map[0]
      const _uid = map[1]
      if(_uid === _id ) {
        let userinfo = await mongo.userModel.findOne({_id: uid}, 
        {sex: 1,lastLoginTime:1, isOnLine:1, nickname:1,username:1,email:1,avatoar:1 })
        ws.send(JSON.stringify({
          type:'linkmanResponse',
          data: {
            userinfo: userinfo,
            converId,
            history: {
              history: [text],
              lastHistory: text,
              members: [],
              _id: converId,
            }
          },
      }))
      }
  }
    res.send({
      code: 'success',
      success: true,
      message: '添加成功',
      converId,
      history: {
        history: [text],
        lastHistory: text,
        members: [],
        _id: converId,
      }
    })
  }
})

module.exports = router;

