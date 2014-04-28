/**
 * Test module
 */
define(['altair/facades/declare',
        'altair/Lifecycle',
        'apollo/_HasSchemaMixin'
], function (declare,
             Lifecycle,
             _HasSchemaMixin) {

    return declare([Lifecycle, _HasSchemaMixin], {

        startedUp: false,
        startup: function () {

            this.startedUp = true;
            return this.inherited(arguments);
        },

        foo: function () {
            return 'original';
        }

    });
});