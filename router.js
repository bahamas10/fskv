var router = new require('routes').Router();

module.exports = router;

router.addRoute('/', require('./routes/index'));

router.addRoute('/data/*', require('./routes/data'));

router.addRoute('/docs', require('./routes/docs'));
router.addRoute('/ping', require('./routes/ping'));
router.addRoute('/stats', require('./routes/stats'));
