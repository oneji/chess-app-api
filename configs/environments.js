module.exports = {
    development: {
        db: 'mongodb://127.0.0.1/cueb-chess-db',
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
