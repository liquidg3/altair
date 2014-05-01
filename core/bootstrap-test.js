/**
 * Bootstrap Altair contexts based on a config
 */
require(['altair/TestRunner',
         'altair/plugins/node!debug',
         'altair/plugins/config!core/config/test'], function (TestRunner, debug, config) {

    if(!config) {
        throw new Error('Could not read core/config/test');
    }

    debug.enable(config.debug || ".*");
    debug = debug('altair:test');

    var runner = new TestRunner();

    runner.startup(config).then(function () {

        debug('tests loaded');

        runner.execute().then(function () {
            debug('tests complete, printing summary');
        }).otherwise(function (e) {
            debug('tests failed');
        });

    });


});