const contactData = [
    {
        nickname: '张翰',
        username: '1123',
        time: '2:09 PM',
        preview: '干啥呢老铁？',
        converId: '11111fdgh1111',
        portraitUrl: '',
    },
    {
        nickname: 'Drake',
        username: '3425',
        time: '2:09 PM',
        preview: 'I was wondering...',
        converId: '1231233413',
        portraitUrl: '',
    },
    {
        nickname: 'Dog Woofson',
        username: '32435',
        time: '1:44 PM',
        preview: "I've forgotten how it felt before",
        converId: '22222222',
        portraitUrl: '',
    },

    {
        nickname: 'Bo Jackson',
        time: '2:09 PM',
        preview: 'It’s not that bad...',
        converId: '44444qwerg444',
        portraitUrl: '',
        username: '567567',
    },
    {
        nickname: '小王',
        time: '2:09 PM',
        preview: 'I was wondering...',
        converId: 'asdfgfg',
        portraitUrl: '',
        username: '45674',
    },
    {
        nickname: '小李',
        time: '2:09 PM',
        preview: 'I was wondering...',
        converId: '12312312sf',
        portraitUrl: '',
        username: '678',
    },
    {
        nickname: '小张',
        time: '2:09 PM',
        preview: 'I was wondering...',
        converId: '55555555',
        portraitUrl: '',
        username: '325687679435',
    },
    {
        nickname: '小白',
        time: '2:09 PM',
        preview: 'I was wondering...',
        converId: 'adfgfghfdgh',
        portraitUrl: '',
        username: '788908',
    },

]

const chatData = {
    '11111fdgh1111': {
        lastTime: 'Today, 5:38 PM',
        users: ['111', '222'],
        type: 'single', // single，单人会话。 group, 群聊
        data: [
            {
                username: '111',
                content: '今天吃了吗？',
                isMySelf: true,
                timestamp: '1322342412341234',
            },
            {
                username: '222',
                content: '吃过了，你最近咋样啊',
                isMySelf: false,
                timestamp: '1324234212341234',
            },
            {
                username: '111',
                content: '挺好的',
                isMySelf: true,
                timestamp: '132412345345341234',
            },
            {
                username: '222',
                content: '你妈了个b的能好好说话不?',
                isMySelf: false,
                timestamp: '1324232344212341234',
            },
            {
                username: '111',
                content: '滚蛋',
                isMySelf: true,
                timestamp: '132234545345341234',
            },
            {
                username: '222',
                content: '你妈了个b的能好好说话不?',
                isMySelf: false,
                timestamp: '14324232344212341234',
            },
            {
                username: '111',
                content: '滚蛋',
                isMySelf: true,
                timestamp: '1322334545345341234',
            },
            {
                username: '222',
                content: '你妈了个b的能好好说话不?',
                isMySelf: false,
                timestamp: '14324232212341234',
            },
            {
                username: '111',
                content: '我爱你',
                isMySelf: true,
                timestamp: '132sfdg45345341234',
            },
            {
                username: '222',
                content: '你妈了个b的能好好说话不?',
                isMySelf: false,
                timestamp: 'rt746745674567',
            },
        ]
    }
}

module.exports = {contactData, chatData};