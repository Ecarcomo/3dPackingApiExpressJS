//Dependences imports
const path = require('path');
const { validationResult } = require('express-validator');

//Local imports
const pythonExecutor = require('../utils/pythonExecutor');

const PACK_SCRIPT = path.join(__dirname, '..', 'utils', 'ejecutable.py');


/**
 * @function packController
 * @author @emmanuel_carcomo <emmanuelcarcomo@gmail.com> 
 * @description packController verify if request info is correct and call to pythonExecutor function
 * @param {Object} req info object sended to API request with JSON 
 * @param {Object} res API response empty
 * @returns  {Object}  API response
 */
const packController = (req, res) => {

    const errors = validationResult(req); 

    if (!errors.isEmpty()) {
      res.status(422).json({ errors: errors.array() });
      return;
    }

    pythonExecutor
      .executePythonScript(PACK_SCRIPT, JSON.stringify(req.body))
      .then(function (data) {
        res.setHeader('Content-Type', 'application/json');
        res.status(200).send(data);
      })
      .catch((err) => {
        console.error(err);
        const isProd = process.env.NODE_ENV === 'production';
        res.status(500).json({
          error: 'pack_execution_failed',
          message: isProd
            ? 'No se pudo completar el empaquetado.'
            : err.message || String(err),
        });
      });

};


module.exports =  packController;