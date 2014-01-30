/**
 * Test module
 */
define(['dojo/_base/declare',
        'dojo/_base/lang',
        'altair/Lifecycle',
        'altair/modules/mock/mixins/_MockMixin'
], function (declare, lang, Lifecycle, _MockMixin) {


    return declare('altair/modules/mock2/Mock2', [Lifecycle, _MockMixin], {

        startedUp: false,

        startup: function () {

            this.startedUp = true;
            return this.inherited(arguments);
        }

    });
});