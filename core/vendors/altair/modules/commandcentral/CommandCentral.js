/**
 * Test module
 */
define(['dojo/_base/declare',
        'dojo/_base/lang',
        'altair/Lifecycle',
        'dojo/node!prompt'
], function (declare, lang, Lifecycle, prompt) {


    return declare('altair/modules/commandcentral/CommandCentral', [Lifecycle], {

        startup: function () {
            return this.inherited(arguments);
        }

    });
});