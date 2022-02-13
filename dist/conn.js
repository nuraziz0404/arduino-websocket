"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.cekState = exports.updateWeather = exports.updateState = exports.connection = void 0;
const knex_1 = require("knex");
class connection {
    conn;
    constructor() {
        this.conn = (0, knex_1.knex)({
            client: "mysql",
            connection: {
                host: "sql6.freemysqlhosting.net",
                port: 3306,
                user: "sql6471859",
                password: "szjxRpGaqv",
                database: "sql6471859",
            },
        });
    }
}
exports.connection = connection;
let { conn } = new connection();
function updateState(id, state) {
    conn("state")
        .insert({
        id: id,
        state: state,
    })
        .onConflict("id")
        .merge()
        .then((e) => { })
        .catch(console.log);
}
exports.updateState = updateState;
function updateWeather(id, weather) {
    conn("state")
        .insert({
        id: id,
        weather: weather,
    })
        .onConflict("id")
        .merge()
        .then((e) => { })
        .catch(console.log);
}
exports.updateWeather = updateWeather;
function cekState(id) {
    return new Promise(resolve => {
        conn("state").where("id", "=", id)
            .then(resolve)
            .catch(e => {
            console.log(e);
            resolve("err");
        });
    });
}
exports.cekState = cekState;
//# sourceMappingURL=conn.js.map