define(['dojo/_base/declare',
        'altair/facades/hitch',
        'altair/modules/commandcentral/adapters/_Base',
        'dojo/node!prompt'
], function (declare,
             hitch,
             _Base,
             prompt) {


    return declare('altair/modules/commandcentral/adapters/Prompt', [_Base], {

        startup: function () {

            prompt.start();

            return this.inherited(arguments);

        },

        notice: function(str) {
            console.log(str);
        }

    });

});
