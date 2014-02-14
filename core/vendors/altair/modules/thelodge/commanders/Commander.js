/**
 * Test module
 */
define(['dojo/_base/declare',
        'altair/modules/events/mixins/_HasEventsMixin',
        'altair/events/Emitter',
        'altair/facades/hitch'

], function (declare, _HasEventsMixin, Emitter, hitch) {

    return declare('altair/modules/thelodge/commanders/Commander', null, {

        index: function () {

            var bg              = new this.Box('bg'),
                textContainer   = new this.Box('hd');


            this.writeLine("Welcome to The Lodge", textContainer);

            this.readLine("Enter your name").then(hitch(this, function (name) {



            })).otherwise(hitch(this, function () {

            }));


        }

    });
});