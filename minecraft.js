const express = require('express');
const MinecraftProcess = require('./server/Process');

const app = express();

app.use(express.urlencoded({
  extended: true,
}));
app.use(express.json());
const MinecraftServer = new MinecraftProcess();

app.post('/command', (request, response) => {
  const { command } = request.body;
  MinecraftServer.write(command, response);
});

app.post('/changeWorld', (request, response) => {
  const { world } = request.body;
  try {
    MinecraftServer.changeWorld(world, response);
  } catch (e) {
    response.send(e);
  }
});

app.listen(8000, () => {
  process.stdout.write('App running on port 8000');
});
