module.exports = {
    development: {
        db: 'mongodb://heroku_9837j3vp:vk6uf93654lhp7o39cgrs0vdru@ds263808.mlab.com:63808/heroku_9837j3vp',
        port: process.env.PORT || 3010,
        secrets: {
            session: 'OneJI',
            jwt: 'OneJI'
        }
    },
    production: {
        db: 'mongodb://127.0.0.1/cueb-chess-db',
        port: process.env.PORT || 3010,
        secrets: {
            session: 'OneJI',
            jwt: 'OneJI'
        }
    }
};
