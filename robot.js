const robotUid = '888888888888888888888888';

const request = require('request')
const urlencode = require('urlencode');

const contentList = [
    '做了个这app也没人用，老大让我来陪您聊天~',
    '客官您好，一号技师为您服务~',
    '广播广播：前端使用react全家桶+hooks完成，后端使用node+express框架搭建',
    '偷偷告诉你，sultan是一个热爱技术的死瘦宅。别泄密哦',
    '代码虽美，可不要贪杯哦。',
    '点击左上角三个点可以切换头像哦',
]

function getRandomContent() {
    const len = contentList.length;
    const randomIndex = Math.floor(Math.random() * len)
    return contentList[randomIndex]
}

const mockRobotHistory = {
    history: [
    ],
    lastHistory: {
    },
    owner: [],
    _id: robotUid,
}

const createkRobatFirstConver = ()=> {
    return {
        content: getRandomContent(),
        converId: robotUid,
        date: 1620989470955,
        read: [],
        talker: robotUid,
        type: "text",
    }
}

async function autoReply(msg, converId) {
    const options = {
        method:'GET',
        url: `http://api.qingyunke.com/api.php?key=free&appid=0&msg=${urlencode(msg)}`,
    };
    const sendData = {
        date: new Date().getTime(),
        talker: robotUid,
        content: '',
        read: [],
        type:'text',
        converId,
    }
    return new Promise((resolve, reject)=> {
        request(options, function (err, res, body) {
            if (res) {
                const { content } = JSON.parse(body);
                sendData.content = content;
                resolve(sendData);
            } else {
                sendData.content = '对不起，网络故障了，请联系下sultan~'
                reject(sendData);
            }
        })
    })
}


module.exports = {
    robotUid,
    autoReply,
    mockRobotHistory,
    createkRobatFirstConver,
};