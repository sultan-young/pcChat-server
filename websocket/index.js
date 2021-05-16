// 开启websocket服务
const WebSocket = require('ws')
const WebSocketServer = WebSocket.Server;
const PubSub = require('pubsub-js');
// 引入mongodb数据库
const mongo = require('../mongodb/mongoose');
const {robotUid, autoReply, createkRobatFirstConver} = require('../robot');
const { setUserIsOnline } = require('../mongodb/server')

function noop() {}

function heartbeat() {
    // console.log(new Date().getTime());
    this.isAlive = true;
}

const wsMap = new Map();
  

// 创建 websocket 服务器 监听在 3000 端口
const wss = new WebSocketServer({port: 7779})

wss.on('connection', (ws)=> {
    ws.isAlive = true;
    ws.on('pong', heartbeat);
    // console.log(ws);
    ws.on('message',async (message)=>{
        const { msg, type, SUB_UID, PUB_UID, converId, talkerName} = JSON.parse(message);
        
        if(type === 'sub') {
            // 机器人自动发送一条消息
            ws.send(JSON.stringify({
                type: 'session',
                data: createkRobatFirstConver(),
            }))
            // 将当前客户端发来的uid存入map数组里
            wsMap.set(ws, SUB_UID)
            setUserIsOnline(SUB_UID, true)
            PubSub.subscribe(SUB_UID, (PUB_UID, {msg, converId, SUB_UID, talkerName})=> {
                const sendData = {
                    date: new Date().getTime(),
                    talker: SUB_UID,
                    content: msg,
                    read: [],
                    type:'text',
                    converId,
                    talkerName,
                }
                ws.send(JSON.stringify({
                    type: 'session',
                    data: sendData,
                }))
            })
        }else {
            // PUB_UID 为Object时候，说明发送为群消息
            if(PUB_UID instanceof Object) {
                for(let map of wsMap) {
                    const _uid = map[1]
                    if(PUB_UID.includes(_uid) && _uid !== SUB_UID) {
                        PubSub.publish(_uid, {msg, converId, SUB_UID, talkerName})
                    }
                }
            }else {
              PubSub.publish(PUB_UID, {msg, converId, SUB_UID})
            }
            // 如果是发送给机器人，则不存入数据库
                if(PUB_UID === robotUid) {
                    try {
                        const result = await autoReply(msg, converId)
                        // console.log(result);
                        ws.send(JSON.stringify({
                            type: 'session',
                            data: result,
                        }))
                    } catch (sendData) {
                        ws.send(JSON.stringify({
                            type: 'session',
                            data: sendData,
                        }))
                    }
                    return;
            }
            // 每当有人发送了记录，就把记录存到对应convertId里
            const history = {
                date: new Date().getTime(),
                talker: SUB_UID,
                content: msg,
                read: [],
                type: 'text',
                talkerName,
            }
            const result = await mongo.chatHistoryModel.updateOne({_id: converId}, {$push: {history}, lastHistory: history})
        }
    })
    ws.on('close',()=> {
        let uid = wsMap.get(ws)
        // 将对应用户在线状态设置为false
        setUserIsOnline(uid, false)
        wsMap.delete(ws)
        // 将当前客户端设置为离线
    })
})

// 20s进行一个心跳检测
const interval = setInterval(function ping() {
    wss.clients.forEach(function each(ws) {
      if (ws.isAlive === false) {
        return ws.terminate()
      };
      ws.isAlive = false;
      ws.ping(noop);
    });
  }, 10000);
  
wss.on('close', function close() {
  clearInterval(interval);
});

module.exports = {
    wsMap
}