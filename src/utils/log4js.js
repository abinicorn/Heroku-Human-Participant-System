const log4js = require('log4js');
const { log4jsConfig } = require('../config/log4jsConfig');
log4js.configure(log4jsConfig);

const levels = {
    'trace': log4js.levels.TRACE,
    'debug': log4js.levels.DEBUG,
    'info': log4js.levels.INFO,
    'warn': log4js.levels.WARN,
    'error': log4js.levels.ERROR,
    'fatal': log4js.levels.FATAL
}

/**
 * Log output level is bug
 * @param { string } content
 */
exports.debug = (content) => {
    let logger = log4js.getLogger('default')
    logger.level = levels.debug
    logger.debug(content)
}
/**
 * Log output level is warn
 * @param { string } content
 */
exports.warn = (content) => {
    let logger = log4js.getLogger('warn')
    logger.level = levels.warn
    logger.warn(content)
}
/**
 * Log output level is info
 * @param { string } content
 */
exports.info = (content) => {
    let logger = log4js.getLogger('info')
    logger.level = levels.info
    logger.info(content)
}

/**
 * Log output level is error
 * @param { string } content
 */
exports.error = (content) => {
    let logger = log4js.getLogger('error')
    logger.level = levels.error
    logger.error(content)
}
