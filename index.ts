import express from "express";
import path from "path";
import { createServer } from "http";
import WebSocket from "ws";

const app = express();
app.use(express.static(path.join(__dirname, "/templates")));

const server = createServer(app);
const wss = new WebSocket.Server({ server });

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
          } else {
            console.log("sever connected: " + id);
            servers[id] = ws;
            servers[id].lastPong = process.uptime();

            servers[id].PingInt = setInterval(() => {
              let pongOffset = Math.round(process.uptime() - servers[id].lastPong);
              if (pongOffset > 3) {
                console.log(`Server: ${id} | Last connection: ${pongOffset}s ago`);
                clearInterval(servers[id].PingInt);
                ws.close();
                console.log("Server Disconected: " + id);
                delete servers[id];
              } else ws.ping("ping", true, function () {});
            }, 1000);

            ws.on("pong", function (data) {
              servers[id].lastPong = process.uptime();
            });
          }
        } else {
          if (clientList.includes(id)) {
            ws.send("exists");
            return ws.close();
          } else if (!serverList.includes(id)) {
            ws.send("no_server");
            ws.close();
          } else {
            console.log("client connected: " + id);
            clients[id] = ws;
            ws.on("close", function () {
              console.log("Client Disconected: " + id);
              if (clients[id]?.PingInt) clearInterval(clients[id].PingInt);
              delete clients[id];
            });
          }
        }
        break;
      case "send":
        if (side == "server") {
          if (clientList.includes(id)) clients[id].send(msg);
        } else {
          if (serverList.includes(id)) servers[id].send(msg);
          else {
            ws.send("no_server");
            ws.close();
          }
        }
        break;
      case "cuaca":
        if (clientList.includes(id)) clients[id].send("cuaca " + msg);
        break;
    }
  });
});

let listener = server.listen(8019, "0.0.0.0", function () {
  console.log(`Listening on: http://127.0.0.1:${listener.address()['port']}`);
});
