// Mongoose 是一个让我们可以通过Node来操作MongoDB数据库的一个模块
// Mongoose 是一个对象文档模型（ODM）库，它是对Node原生的MongoDB模块进行了进一步的优化封装
// 大多数情况下，他被用来把结构化的模式应用到一个MongoDB集合，并提供了验证和类型装换等好处
// 基于MongoDB驱动，通过关系型数据库的思想来实现非关系型数据库

const url = "mongodb://localhost:27017/pc_chat";
const mongoose = require("mongoose")
const Schema = mongoose.Schema;
const { v4: uuidv4 } = require('uuid');
const {robotUid} = require('../robot');

mongoose.set('useFindAndModify', false)
class MongoDB {
    constructor(mongoose) {
        this.mongoose = mongoose;
        this.DB_URL = url;
        this.userModel = null; // 用户模型
        this.chatHistoryModel = null; // 聊天历史记录模型
        this.userLinkManModel = null; // 用户联系人模型
        this.initModelSchema()
        this.connect()
        // 生成聊天机器人
        this.createRobot()
    }
    // 初始化集合的模型
    initModelSchema() {
        this.userModel = this.mongoose.model('User',new Schema({
            username : {
                type: String,
                require: true,
            },
            password : {
                type: String,
                require: true,
            },
            email : {
                type: String,
                require: true,
            },
            // avatoar头像
            avatoar : {
                type: Schema.Types.Mixed,
                require: false,
                default: {

                },
            },
            signature: {
                type: String,
            },
            sex : {
                type: Number,
                require: false,
                default: 0,
            },
            lastLoginTime: {
                type: Number,
                require: false,
                default: new Date().getTime(),
            },
            registerTime: {
                type: Number,
                require: false,
                default: new Date().getTime(),
            },
            nickname: {
                type: String,
                require: true,
            },
            isOnLine: {
                type: Boolean,
                default: false,
            }
        }))
        this.chatHistoryModel = this.mongoose.model('ChatHistory',new Schema({
            lastHistory: {
                type: Schema.Types.Mixed,
                default: {},
            },
            members: [{
                type:  Schema.Types.ObjectId,
                ref: 'User',
            }],
            history: {
                type: Array,
                default: [],
            },
            type: {
                type: String,
                default: ''
            },
            groupName: {
                type: String,
            },
            owner: { // 群主
                type: Schema.Types.ObjectId,
            },
            notice: {
                type: String,
            }
        }))
        this.userLinkManModel = this.mongoose.model('UserLinkMan',new Schema({
            username: {
                type: String,
                default: '',
            },
            linkManList: {
                type: Array,
            },
            sessionList:{
                type: Array,
                default: [],
            },
            
            noValidation: {
                type: Array,
                default: [],
            },
            groupList: [{
                type: Schema.Types.ObjectId,
                ref: 'ChatHistory',
            }],
            uid: {
                type: String,
            },
        }))
    }
    connect() {
        this.mongoose.connect(this.DB_URL,
            { useNewUrlParser: true ,useUnifiedTopology: true}, 
            (err)=>{
            if(!err){
                console.log("数据库连接成功")
            }
        })
        // return new Promise((resolve, reject)=> {
        //     this.MongoClient.connect(this.DB_URL, 
        //         // 配置这个不会出现控制台报错
        //         { useNewUrlParser: true ,useUnifiedTopology: true}, 
        //         function(err, db) {
        //         if (err) reject(err);
        //         let dbo = db.db("account");
        //         resolve({db, dbo})
        //       });
        // })
    }
    register(accountObj) {
        return new Promise(async (resolve, reject)=> {
            const{ username } = accountObj;
            const resultObj = await this.find({username})
            if((resultObj || []).length > 0) {
                resolve({
                    code: 'fail',
                    success: false,
                    message: '已存在该账号'
                });
                return;
            }
            this.userModel.create({
                lastLoginTime: new Date().getTime(),
                nickname: '用户'+ uuidv4().slice(0, 6),
                ...accountObj}
            )
            .then(user=> {
                resolve({
                    code: 'success',
                    success: true,
                    user,
                })
            })
        })
    }
    login({username, password}) {
        return new Promise((resolve, reject)=> {
            this.find({username, password})
            .then((result)=> {
                if((result || []).length > 0) {
                    resolve({
                        code: 'success',
                        success: true,
                        uid: result[0]._id,
                    });
                }else {
                    resolve({
                        code: 'fail',
                        success: false,
                    });
                }
            })
        })
    }
    /**
     * 
     * @param {Object} queryObject 
     * @returns {Array} 满足查询条件的数据 
     */
    find( queryObject = {}) {
        return new Promise((resolve)=> {
            this.userModel.find(queryObject).then(result=> {
                resolve(result)
            })
        })
    }
    // 模糊查询
    dimFind( queryObject = {}, rule) {
        return new Promise((resolve)=> {
            this.userModel.find(queryObject).then(result=> {
                resolve(result)
            })
        })
    }
    async createRobot() {
        const resultObj = await this.find({username: 'admin-robot'})
        if((resultObj || []).length > 0) {
            return;
        }
        this.userModel.create({
            username: 'admin-robot',
            sex : 1,
            isOnLine: true,
            _id: robotUid,
            nickname: '机器人-sultan',
            email: 'sultan@163.com',
            signature: '有什么不明白的可以问我哦',
            avatoar : {
                AvatarStyle : "Transparent",
                Top : "NoHair",
                Accessories : "Wayfarers",
                HairColor : "Auburn",
                FacialHair : "Blank",
                FacialHairColor : "Black",
                Cloth : "Overall",
                ClothColor : "Black",
                Eyes : "Close",
                Eyebrow : "Angry",
                Mouth : "Smile",
                Skin : "Black",
            }
        }).then(_=> {
            // initUserLinkMan(username, robotUid)

        })
    }
}
 
let mongo = new MongoDB(mongoose, url)

module.exports = mongo;

// return new Promise((resolve, reject)=> {
    
// })
