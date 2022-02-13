const express = require('express');
const path = require('path');
const { createServer } = require('http');

const WebSocket = require('ws');

const app = express();
app.use(express.static(path.join(__dirname, '/templates')));

const server = createServer(app);
const wss = new WebSocket.Server({ server });

var servers = {}
var clients = {}

app.get("/conn", function (req, res) {
  res.json({ servers: Object.keys(servers), clients: Object.keys(clients) })
})

wss.on("connection", function (ws) {
  ws.on("message", (data, bin) => {
    let dat = data.toString()
    let args = dat.split(" ")
    let side = args[0]
    let id = args[1]
    let command = args[2]
    let msg = args.slice(3)?.join(" ")

    let serverList = Object.keys(servers)
    let clientList = Object.keys(clients)

    switch (command) {
      case "set":
        if (side == "server") {
          if (serverList.includes(id)) {
            ws.send("exists")
            return ws.close()
          } else {
            console.log("sever connected: " + id)
            servers[id] = ws
            ws.lastPong = process.uptime()

            ws.PingInt = setInterval(() => {
              let pongOffset = Math.round(process.uptime() - ws.lastPong)
              if (pongOffset > 3) {
                console.log(`Server: ${id} | Last connection: ${pongOffset}s ago`)
                clearInterval(ws.PingInt)
                ws.close()
                console.log('Server Disconected: ' + id);
                delete servers[id]
              }
              else ws.ping("ping", true, function () { })
            }, 1000);

            ws.on("pong", function (data) {
              ws.lastPong = process.uptime()
            })
          }
        }
        else {
          if (clientList.includes(id)) {
            ws.send("exists")
            return ws.close()
          } else if(!serverList.includes(id)){
            ws.send("no_server")
            ws.close()
          }
          else {
            console.log("client connected: " + id)
            clients[id] = ws
            ws.on('close', function () {
              console.log('Client Disconected: ' + id);
              if (ws?.PingInt) clearInterval(ws.PingInt)
              delete clients[id]
            });
          }
        }
        break;
      case "send":
        if (side == "server") {
          if (clientList.includes(id)) clients[id].send(msg)
          // else console.log([clientList, id])
        }
        else {
          if (serverList.includes(id)) servers[id].send(msg)
          // else console.log([serverList, id])
        }
        break;
    }


  })
});

let listener = server.listen(8019, '0.0.0.0', function () {
  console.log(`Listening on http://localhost:${listener.address().port}`);
});