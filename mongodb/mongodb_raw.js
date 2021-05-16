const MongoClient = require('mongodb').MongoClient;
const url = "mongodb://localhost:27017/chat";

class MongoDB {
    constructor(MongoClient) {
        this.MongoClient = MongoClient;
        this.DB_URL = url;
    }
    connect() {
        return new Promise((resolve, reject)=> {
            this.MongoClient.connect(this.DB_URL, 
                // 配置这个不会出现控制台报错
                { useNewUrlParser: true ,useUnifiedTopology: true}, 
                function(err, db) {
                if (err) reject(err);
                let dbo = db.db("account");
                resolve({db, dbo})
              });
        })
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
            }
            this.connect().then(({db, dbo})=> {
                dbo.collection("chat").insertOne(accountObj, function(err, res) {
                    if (err) reject(err);
                    resolve({
                      code: 'success',
                      success: true,
                    })
                    db.close()
                });
            })
        })
    }
    login({username, password}) {
        return new Promise((resolve, reject)=> {
            this.connect()
            .then(({db, dbo})=> {
                dbo.collection("chat").find({username, password}).toArray((err, result)=> {
                    if (err) reject(err);
                    if((result || []).length > 0) {
                        resolve({
                            code: 'success',
                            success: true,
                            id: result[0]._id,
                        });
                    }else {
                        resolve({
                            code: 'fail',
                            success: false,
                        });
                    }
                    db.close();
                });
            })
        })
    }
    /**
     * 
     * @param {Object} queryObject 
     * @returns {Array} 满足查询条件的数据 
     */
    find( queryObject = {}) {
        return new Promise((resolve, reject)=> {
            this.connect()
            .then(({db, dbo})=> {
                dbo.collection("chat").find(queryObject).toArray((err, result)=> {
                    if (err) reject(err);
                    resolve(result);
                    db.close();
                });
            })
        })
    }
}
 
let mongo = new MongoDB(MongoClient, url)

module.exports = mongo;

// return new Promise((resolve, reject)=> {
    
// })
