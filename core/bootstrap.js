/**
 * Bootstrap Altair contexts based on a config
 */
require(['altair/Altair','dojo/_base/lang', 'altair/config!core/bootstrap.json'], function(Altair,lang){





    //start a single Altair instance to start @TODO load this from a config
    var altair = new Altair();

    altair.startup();
    altair.go().then(lang.hitch(altair, 'teardown'));

});