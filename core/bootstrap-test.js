/**
 * Bootstrap Altair contexts based on a config
 */
require(['altair/TestRunner',
         'altair/plugins/node!debug',
         'altair/plugins/config!core/config/test'], function (TestRunner, debug, config) {

    debug.enable('altair:test');
    debug = debug('altair:test');

    var runner = new TestRunner();

    runner.startup(config).then(function () {

        debug('tests loaded');

        runner.execute().then(function () {
            debug('tests complete');
        }).otherwise(function (e) {
            debug('tests failed');
        });

    });


});