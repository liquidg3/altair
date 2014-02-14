define(['dojo/_base/declare',
        'altair/facades/hitch',
        'altair/modules/commandcentral/adapters/_Base',
        'dojo/node!blessed'
], function (declare,
             hitch,
             _Base,
             blessed) {


    return declare('altair/modules/commandcentral/adapters/Blessed', [_Base], {

        screen:  null,
        noticeBox: null,

        startup: function () {

            this.screen = blessed.screen();


            return this.inherited(arguments);
        },

        notice: function(str) {

            if(!this.noticeBox) {

            }


        }

    });

});
