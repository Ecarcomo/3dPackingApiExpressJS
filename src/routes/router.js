//Dependences imports
const express = require('express');
const router = express.Router();

//Local imports
const packController = require('../controllers/packController');
const validate = require('../controllers/validator');
const apiKeyAuth = require('../middleware/apiKeyAuth');

router.use(apiKeyAuth);


/**
 * @author @emmanuel_carcomo <emmanuelcarcomo@gmail.com> 
 * @description Define API endpoint handler for packing controller and call to express validator function for security
 * @param {String} scriptPath path to API endpoint
 * @param {Function} data call to fn for validate request info for packController
 * @param {Function} data invoque to packController
 */

router.post('/pack',
            validate('packController'), 
            packController);


module.exports = router;