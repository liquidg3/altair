/**
 * Test module
 */
define(['altair/facades/declare',
        'altair/Lifecycle',
        'altair/modules/mock/mixins/_MockMixin'
], function (declare, Lifecycle, _MockMixin) {


    return declare('altair/modules/mock/Mock', [Lifecycle, _MockMixin], {

        startedUp: false,
        startup: function () {

            this.startedUp = true;
            return this.inherited(arguments);
        }

    });
});