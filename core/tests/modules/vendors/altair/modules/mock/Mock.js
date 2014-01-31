/**
 * Test module
 */
define(['dojo/_base/declare',
        'dojo/_base/lang',
        'altair/Lifecycle',
        'apollo/_HasSchemaMixin'
], function (declare, lang, Lifecycle, _HasSchemaMixin) {


    return declare('altair/modules/mock/Mock', [Lifecycle, _HasSchemaMixin], {

        startedUp: false,
        startup: function () {

            this.startedUp = true;
            return this.inherited(arguments);
        }

    });
});