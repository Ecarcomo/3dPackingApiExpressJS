const { spawn } = require('child_process');

/**
 * Intérprete Python: `PYTHON_CMD` o, por defecto, `python` en Windows y `python3` en el resto.
 * @returns {string}
 */
function getPythonCommand() {
  if (process.env.PYTHON_CMD) {
    return process.env.PYTHON_CMD;
  }
  return process.platform === 'win32' ? 'python' : 'python3';
}

/**
 * @function executePythonScript
 * @author @emmanuel_carcomo <emmanuelcarcomo@gmail.com>
 * @description Parsea JSON en {data}, construye argumentos para el script Python y lo ejecuta con spawn (sin shell).
 * @param {string} scriptPath Ruta al script .py
 * @param {string} data JSON stringificado del cuerpo de la petición
 * @returns {Promise<string>} Salida stdout del script (JSON)
 */
function executePythonScript(scriptPath, data) {
  const pJSON = JSON.parse(data);
  const bauleraArg =
    'baulera::' +
    pJSON.baulera.name +
    '|' +
    pJSON.baulera.width +
    '|' +
    pJSON.baulera.height +
    '|' +
    pJSON.baulera.depth +
    '|' +
    pJSON.baulera.weightLimit;

  const args = [scriptPath, bauleraArg];
  pJSON.items.forEach((item) => {
    args.push(
      'item::' +
        item.name +
        '|' +
        item.width +
        '|' +
        item.height +
        '|' +
        item.depth +
        '|' +
        item.weight +
        '|' +
        item.quantity
    );
  });

  return new Promise((resolve, reject) => {
    const child = spawn(getPythonCommand(), args, {
      cwd: process.cwd(),
      windowsHide: true,
    });
    let stdout = '';
    let stderr = '';
    child.stdout.setEncoding('utf8');
    child.stderr.setEncoding('utf8');
    child.stdout.on('data', (chunk) => {
      stdout += chunk;
    });
    child.stderr.on('data', (chunk) => {
      stderr += chunk;
    });
    child.on('error', (err) => {
      reject(err);
    });
    child.on('close', (code) => {
      if (code !== 0) {
        const err = new Error(stderr.trim() || `Python exited with code ${code}`);
        err.code = code;
        err.stderr = stderr;
        reject(err);
        return;
      }
      resolve(stdout);
    });
  });
}

module.exports = {
  executePythonScript,
};
