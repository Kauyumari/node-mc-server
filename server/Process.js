const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const log = (data) => {
  process.stdout.write(data.toString());
};

module.exports = class MinecraftProcess {
  constructor() {
    if (!this.MinecraftProcess) {
      this.initializeProcess();
    }

    return this;
  }


  initializeProcess() {
    this.MinecraftProcess = spawn('java', [
      '-Xmx1024M',
      '-Xms1024M',
      '-jar',
      'minecraft_server.jar',
      'nogui',
    ]);

    this.MinecraftProcess.stdout.on('data', log);
    this.MinecraftProcess.stderr.on('data', log);
    this.MinecraftProcess.on('exit', () => {
      this.initializeProcess();
    });
    return this.MinecraftProcess;
  }

  write(command, response) {
    this.MinecraftProcess.stdin.write(`${command}\n`);
    const buffer = [];
    const collector = (data) => {
      const d = data.toString();
      buffer.push(d.split(']: ')[1]);
    };
    this.MinecraftProcess.stdout.on('data', collector);
    setTimeout(() => {
      this.MinecraftProcess.stdout.removeListener('data', collector);
      response.send(buffer.join(''));
    }, 250);
  }

  reset() {
    this.MinecraftProcess.kill();
  }

  async changeWorld(world, response) {
    const appDir = path.dirname(require.main.filename);
    fs.readFile(path.join(appDir, 'server.properties'), (err, data) => {
      if (err) throw err;
      const params = data.toString().split('\n');
      const newParams = params.map((param) => {
        let pair = param.split('=');
        const key = pair[0];
        let value = pair[1];
        if (key === 'level-name') {
          value = world;
          pair = [key, value].join('=');
          return pair;
        }
        return param;
      });
      const file = newParams.join('\n');
      fs.writeFile(path.join(appDir, 'server.properties'), file, () => {
        if (err) throw err;
        this.reset();
        response.send('Successfully changed world');
      });
    });
  }
};
