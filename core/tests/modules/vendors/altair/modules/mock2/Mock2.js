/**
 * Test module
 */
define(['dojo/_base/declare',
        'altair/Lifecycle',
        'altair/modules/mock/mixins/_MockMixin'
], function (declare, Lifecycle, _MockMixin) {


    return declare([Lifecycle, _MockMixin], {

        startedUp: false,

        startup: function () {

            this.startedUp = true;
            return this.inherited(arguments);
        }

    });
});