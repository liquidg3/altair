define(['altair/facades/declare',
        'altair/Lifecycle',
        'altair/facades/hitch',
        'altair/facades/when',
        'altair/facades/all',
        'altair/plugins/node!underscore'
], function (declare,
             Lifecycle,
             hitch,
             when,
             all,
             _) {

    return declare([Lifecycle], {

        menus:      null,
        chef:       null,
        inspector:  null,
        installers: null,

        startup: function (options) {

            var _options        = options || this.options,
                list            = [];

            //stop auto resolution
            this.deferred = new this.Deferred();

            //ensure they passed menus
            if(!_options.menus) {
                this.deferred.reject(new Error('You must pass menus to the kitchen or else we don\'t know what to cook.'));
                return this.deferred;
            }

            //without installers, i can't do anything
            if(!_options.installers) {

                list.push(this.module.refreshInstallers().then(hitch(this, function (installers) {
                    this.installers = installers;
                })));

            } else {
                this.installers = _options.installers;
            }

            //setup the chef so he can run and grab the menus if they are remote
            if(!_options.chef) {

                list.push(this.module.foundry('client/Chef').then(hitch(this, function (chef) {

                    this.chef = chef;

                    //setup our menus
                    this.menus = [];

                    //add menus but wait till they are finished before continuing by returning the deferred
                    return this.addMenus(_options.menus);

                })));

            } else {
                this.chef = _options.chef;
            }

            //wait 'till everything has resolved
            all(list).then(hitch(this, function () {

                //now that the kitchen is setup, lets get our inspector ready (for module search)
                if(!_options.inspector) {

                    return this.module.foundry('client/Inspector', { installers: this.installers, menus: this.menus }).then(hitch(this, function (inspector) {
                        this.inspector = inspector;
                    }));

                } else {
                    this.inspector = _options.inspector;
                }

            })).then(hitch(this.deferred, 'resolve', this)).otherwise(hitch(this.deferred, 'reject'));

            return this.inherited(arguments);

        },

        /**
         * Add new menus to the kitchen. See ./configs/menu.json for example of a valid menu
         *
         * @param menus [] array of menus as objects or urls (string)
         * @returns {altair.Deferred}
         */
        addMenus: function (menus) {

            //if there are any menus that are strings, it means they are urls. Chef should sync them.
            var list = [];

            //copy menus locally, if any are strings, we must use
            menus.forEach(function (menu) {

                if(_.isString(menu)) {
                    menu = this.chef.fetchMenu(menu);
                }

                list.push(when(menu));

            });

            return all(list).then(hitch(this, function (menus) {
                this.menus = menus;
                return this;
            }));

        },

        /**
         * Add a singe menu to the kitchen.
         *
         * @param menu an object matching schema in ./configs/menu.json or if string assumed to be a remotely
         *             hosted json file that is of the same form
         * @returns {altair.Deferred}
         */
        addMenu: function (menu) {
            return this.menus([menu]);
        },

        /**
         * Search every menu and see if there is a match.
         *
         * @param terms
         * @returns {altair.Deferred}
         */
        search: function (term, type) {
            return this.inspector.search(term, type || 'modules');
        }

    });

});