/**
 * The dashboard for Command Central. Simply allows you to select a commander, then run that commander, then start it again.
 */
define(['dojo/_base/declare',
        'altair/facades/hitch',
        'altair/modules/commandcentral/mixins/_IsCommanderMixin'
], function (declare,
             hitch,
             _IsCommanderMixin) {


    return declare('altair/modules/commandcentral/commanders/Dashboard', [_IsCommanderMixin], {

        showingMenu: false,

        startup: function (options) {

            this.module.on('cartridges/Module::did-startup-module').then(hitch, 'refreshMenu');

            return this.inherited(arguments);
        },

        /**
         * Show splash, then render our main menu
         */
        go: function () {

            this.splash();
            this.menu();

        },

        /**
         * Render the commander select menu.
         */
        menu: function () {

            this.showingMenu = true;

            var commanders = this.module.commanders(),
                options    = {};

            Object.keys(commanders).forEach(function (alias) {
                options[alias] = commanders[alias].description || commanders[alias].name;
            });

            this.select('Select a Commander', options, 'commander-select').then(hitch(this, function (commander) {
                this.showingMenu = false;
                this.selectCommander(commander)
            }));

        },

        refreshMenu: function () {

            if(this.showingMenu) {



            }

        },

        selectCommander: function (named) {

            console.log('showing commander named' , named);


        }

    });

});
