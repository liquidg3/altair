/**
 * Test module
 */
define(['dojo/_base/declare',
        'altair/modules/events/mixins/_HasEventsMixin' //we always have to use the full path to mixins we are both introducing into altair and using because the paths don't get
], function (declare, _HasEventsMixin) {


    return declare('altair/modules/events/Events', [_HasEventsMixin], {

        startup: function () {
            return this.inherited(arguments);
        }

    });
});