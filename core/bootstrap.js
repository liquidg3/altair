/**
 * Bootstrap Altair contexts based on a config
 */
require(['altair/Altair','dojo/_base/lang'], function(Altair,lang){

    //start a single Altair instance to start @TODO load this from a config
    var altair = new Altair({
        cartridges: {

        }
    });

    altair.startup();
    altair.go().then(lang.hitch(altair, 'teardown'));

});