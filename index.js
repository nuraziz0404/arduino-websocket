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

app.get("/conn", function(req, res){
  res.json({servers: Object.keys(servers), clients: Object.keys(clients)})
})

wss.on("connection", function (ws) {
  let _id = ""
  let type = ""
  ws.on('close', function () {
    if (type == "server") {
      console.log('Server Disconected: '+_id);
      delete servers[_id]
    }
    else {
      console.log("Client disconected: "+_id)
      delete clients[_id]
    }
  });
  ws.on("message", (data, bin) => {
    let dat = data.toString()
    let args = dat.split(" ")
    let side = args[0]
    let id = args[1]
    let command = args[2]
    let msg = args.slice(3)?.join(" ")
    _id = id
    type = side

    let serverList = Object.keys(servers)
    let clientList = Object.keys(clients)

    switch (command) {
      case "set":
        if (side == "server") {
          console.log("sever connected: " + id)
          servers[id] = ws
        }
        else {
          console.log("client connected: " + id)
          clients[id] = ws
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

server.listen(80, '0.0.0.0', function () {
  console.log('Listening on http://localhost:8010');
});