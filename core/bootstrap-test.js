/**
 * Bootstrap Altair contexts based on a config
 */
require(['altair/TestRunner',
         'altair/plugins/node!debug',
         'altair/plugins/config!core/config/test',
         'altair/plugins/config!./altair.json',
         'altair/plugins/node!config-extend',], function (TestRunner, debug, config, appConfig, extend) {

    if(!config) {
        throw new Error('Could not read core/config/test');
    }


    debug.enable(config.debug || ".*");
    debug = debug('altair:test');

    //setup app if local config exists
    if(appConfig) {

        debug('app detected. mixing in configuration');
        extend(config, appConfig.tests);

        require({
            paths: {
                app: process.cwd()
            }
        });

    }

    //make tests the cwd so "tests" can be used by testers (app is only available when a local altair.json is found).
    require({
        paths: {
            tests: process.cwd()
        }
    });


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