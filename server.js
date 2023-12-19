const fs = require("fs");
const fsp = fs.promises;
const express = require("express");
const http = require("http");
const WebSocket = require("ws");
const read = require("./helper");

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

const logFilePath = "logFile.log";
let lastKnowSize = 0;

const sendUpdate = () => {
  fsp.stat(logFilePath)
    .then((stats) => {
      const fileSize = stats.size;
      const readStream = fs.createReadStream(logFilePath, {
        start: lastKnowSize,
        end: fileSize,
      });
      readStream.on("data", (chunk) => {
        wss.clients.forEach((client) => {
          if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify([chunk.toString()]));
          }
        });
      });
      lastKnowSize = fileSize;
    })
    .catch((error) => {
      console.error("Error reading file:", error);
    });
};
let counter = 0;

app.use(express.static(`public`));

wss.on("connection", async (ws) => {
  let data = await read(logFilePath, 10);
  console.log(data);
  ws.send(JSON.stringify(data));
});

fs.watch(logFilePath, (eventType, filename) => {
  console.log(eventType);
  if (eventType === "change") {
    sendUpdate();
  }
});


let writeContent = async () => {
  try {
    await fsp.appendFile(logFilePath, `File Contents are Edited ${counter} \n`);

    counter++;
    setInterval(async () => {
      await fsp.appendFile(logFilePath, `File Contents are Edited ${counter} \n`);
      counter++;
    }, 3000);
  } catch (error) {
    console.error("Error writing file:", error);
  }
};

writeContent();

const PORT = 3000;
server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
