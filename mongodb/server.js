const mongo = require('./mongoose');
const {robotUid} = require('../robot')

function initUserLinkMan(username, uid) {
    return new Promise((resolve)=> {
        mongo.userLinkManModel.create({
            username,
            linkManList: [
                {
                    uid: robotUid,
                }
            ],
            noValidation: [],
            sessionList: [
                robotUid
            ],
            group: [

            ],
            uid,
        }).then(()=> {
            resolve({
                code: 'success',
                success: true,
            })
        })
    })
}

function initChatHistoryModel({ members, type, groupName, owner }) {

    let Model = {
        members: members,
        lastHistory: new Object(),
        history: [
            // {
            //     date: '123123',
            //     talker: '123123', // 
            //     content: '', // 说话内容
            //     read: ['123123'], // 已读的人
            //     type: 'text',
            // }
        ],
        type,
    }
    if(type === 'group') {
        Model.owner = owner;
        Model.groupName = groupName;
        Model.notice = '暂无群公告';
    }

    return new Promise((resolve)=> {
        mongo.chatHistoryModel.create(Model).then((resultObj)=> {
            resolve({
                code: 'success',
                success: true,
                resultObj,
            })
        })
    })
}

async function setUserIsOnline(uid, isOnLine) {
    await mongo.userModel.updateOne({_id: uid}, {isOnLine, lastLoginTime: new Date().getTime()})  
}

module.exports = {
    initUserLinkMan,
    initChatHistoryModel,
    setUserIsOnline,
}