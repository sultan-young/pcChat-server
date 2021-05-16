var app = require('../app.js');

const port = 7777;



app.listen(port, ()=> {
    console.log('后端服务器成功开启，端口'+ port);
});
  