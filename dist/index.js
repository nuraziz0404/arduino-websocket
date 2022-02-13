"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const path_1 = __importDefault(require("path"));
const http_1 = require("http");
const ws_1 = __importDefault(require("ws"));
const db = __importStar(require("./conn"));
const app = (0, express_1.default)();
app.use(express_1.default.static(path_1.default.join(process.cwd(), "/templates")));
const server = (0, http_1.createServer)(app);
const wss = new ws_1.default.Server({ server });
var servers = {};
var clients = {};
app.get("/conn", function (req, res) {
    res.json({ servers: Object.keys(servers), clients: Object.keys(clients) });
});
wss.on("connection", function (ws) {
    ws.on("message", (data, bin) => {
        let dat = data.toString();
        let args = dat.split(" ");
        let side = args[0];
        let id = args[1];
        let command = args[2];
        let msg = args.slice(3)?.join(" ");
        let serverList = Object.keys(servers);
        let clientList = Object.keys(clients);
        switch (command) {
            case "set":
                if (side == "server") {
                    if (serverList.includes(id)) {
                        ws.send("exists");
                        return ws.close();
                    }
                    else {
                        console.log("sever connected: " + id);
                        servers[id] = ws;
                        servers[id].lastPong = process.uptime();
                        servers[id].PingInt = setInterval(() => {
                            let pongOffset = Math.round(process.uptime() - servers[id].lastPong);
                            if (pongOffset > 3) {
                                db.updateState(id, servers[id]["state"]);
                                db.updateWeather(id, servers[id]["weather"]);
                                console.log(`Server: ${id} | Last connection: ${pongOffset}s ago`);
                                clearInterval(servers[id].PingInt);
                                ws.close();
                                console.log("Server Disconected: " + id);
                                delete servers[id];
                            }
                            else
                                ws.ping("ping", true, function () { });
                        }, 1000);
                        ws.on("pong", function (data) {
                            servers[id].lastPong = process.uptime();
                        });
                    }
                }
                else {
                    if (clientList.includes(id)) {
                        ws.send("exists");
                        return ws.close();
                    }
                    else if (!serverList.includes(id)) {
                        db.cekState(id).then((e) => {
                            if (e == "err")
                                ws.send("error");
                            else if (e.length == 0)
                                ws.send("no_server");
                            else
                                ws.send(`offline ${e[0].state} ${e[0].weather}`);
                            ws.close();
                        });
                    }
                    else {
                        console.log("client connected: " + id);
                        clients[id] = ws;
                        ws.on("close", function () {
                            console.log("Client Disconected: " + id);
                            if (clients[id]?.PingInt)
                                clearInterval(clients[id].PingInt);
                            delete clients[id];
                        });
                    }
                }
                break;
            case "send":
                if (side == "server") {
                    servers[id]["state"] = msg;
                    if (clientList.includes(id))
                        clients[id].send(msg);
                }
                else {
                    if (serverList.includes(id))
                        servers[id].send(msg);
                    else {
                        ws.send("no_server");
                        ws.close();
                    }
                }
                break;
            case "cuaca":
                servers[id]["weather"] = msg;
                if (clientList.includes(id))
                    clients[id].send("cuaca " + msg);
                break;
        }
    });
});
setInterval(() => {
    for (let id in servers) {
        db.updateState(id, servers[id]["state"]);
        db.updateWeather(id, servers[id]["weather"]);
    }
}, 5000);
let listener = server.listen(parseInt(process.env["PORT"]) || 8019, "0.0.0.0", function () {
    console.log(`Listening on: http://127.0.0.1:${listener.address()["port"]}`);
});
//# sourceMappingURL=index.js.map