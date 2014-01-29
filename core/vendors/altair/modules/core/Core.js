/**
 * Test module
 */
define(['dojo/_base/declare',
    'dojo/_base/lang',
    'altair/Lifecycle',
], function (declare, lang, Lifecycle) {


    return declare('altair/modules/core/Core', [Lifecycle], {

        startup: function () {
            return this.inherited(arguments);
        }

    });
});