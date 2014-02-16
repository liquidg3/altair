define(['dojo/_base/declare',
        'altair/facades/hitch',
        'altair/modules/commandcentral/mixins/_IsCommanderMixin'
], function (declare,
             hitch,
             _IsCommanderMixin) {


    return declare('altair/modules/commandcentral/commanders/Dashboard', [_IsCommanderMixin], {

        go: function () {

            this.splash();

            this.select('Select a Commander', this.module.commanders(), 'commander-select').then(hitch(this, function (answer) {

                console.log(answer);

            }));

        }

    });

});
