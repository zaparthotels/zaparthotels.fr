const { spawn } = require('node:child_process');

const composeFile = 'docker-compose.dev.yaml';
const projectName = 'zaparthotels';
const envFile = '../.env.dev';

const startCompose = () => {
  console.log('Starting Docker Compose...');
  const composeProcess = spawn(
    'docker',
    [
      'compose',
      '-f',
      composeFile,
      '-p',
      projectName,
      '--env-file',
      envFile,
      'up',
      '--watch',
    ],
    { stdio: 'inherit', detached: true },
  );

  return composeProcess;
};

const stopCompose = () => {
  console.log('Stopping Docker Compose...');
  const stopProcess = spawn(
    'docker',
    ['compose', '-f', composeFile, '-p', projectName, 'down'],
    { stdio: 'inherit' },
  );

  return new Promise((resolve, reject) => {
    stopProcess.on('close', (code) => {
      if (code === 0) resolve();
      else reject(new Error(`Docker Compose down failed with code ${code}`));
    });
  });
};

const composeProcess = startCompose();

process.on('SIGINT', async () => {
  console.log('Received SIGINT, stopping...');
  try {
    composeProcess.kill('SIGINT');
    await stopCompose();
    process.exit(0);
  } catch (error) {
    console.error('Error during cleanup:', error);
    process.exit(1);
  }
});

process.on('SIGTERM', async () => {
  console.log('Received SIGTERM, stopping...');
  try {
    composeProcess.kill('SIGTERM');
    await stopCompose();
    process.exit(0);
  } catch (error) {
    console.error('Error during cleanup:', error);
    process.exit(1);
  }
});
