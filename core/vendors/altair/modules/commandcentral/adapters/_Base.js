define([
    'dojo/_base/declare',
    'altair/events/Emitter',
    'altair/Lifecycle'
        ], function (declare, Emitter, Lifecycle) {


    return declare('altair/modules/commandcentral/adapters/_Base', [Emitter, Lifecycle], {

        /**
         * Not all adapters will implement a notice feature
         */
        notice: function (msg) {

        },

        splash: function () {
            throw "This should output a cool logo or background or something.";
        },

        /**
         * Outputs some select options, should return a deferred.
         * @param question
         * @param options
         * @return {dojo.Deferred}
         */
        select: function (question, options) {

        },

        showProgress: function (message) {
            console.log(message);
        },

        hideProgress: function () {

        }

    });

});
