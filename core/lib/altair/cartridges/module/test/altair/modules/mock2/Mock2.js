/**
 * Test module
 */
define(['dojo/_base/declare',
        'dojo/_base/lang',
        'altair/Lifecycle'
], function (declare, lang, Lifecycle) {


    return declare('altair/cartridges/test/altair/modules/mock/Mock2', [Lifecycle], {

        startedUp: false,
        startup: function () {

            this.startedUp = true;
            return this.inherited(arguments);
        }

    });
});