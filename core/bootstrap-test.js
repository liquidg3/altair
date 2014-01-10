/**
 * Bootstrap Altair contexts based on a config
 */
require(['altair/TestRunner',
         'altair/config!core/config/test.json'], function (TestRunner, config) {


    var runner = new TestRunner();

    runner.startup(config).then(function () {
        console.log('-- TESTS COMPLETE --');
    });


});