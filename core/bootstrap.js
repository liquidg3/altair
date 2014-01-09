/**
 * Bootstrap Altair contexts based on a config
 */
require(['altair/Altair','dojo/_base/lang', 'altair/config!core/config/altair.json'], function(Altair, lang, config){
    //start a single Altair instance to start @TODO load this from a config
    var altair = new Altair();
    console.log(config);

    altair.startup(config).go().then(lang.hitch(altair, 'teardown'));

});