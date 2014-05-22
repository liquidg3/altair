define(['altair/facades/declare',
        'altair/Lifecycle',
        'altair/facades/hitch',
        'altair/facades/when',
        'altair/facades/all',
        'lodash'
], function (declare,
             Lifecycle,
             hitch,
             when,
             all,
             _) {

    return declare([Lifecycle], {

        _menus:      null,
        _menuItems:  null, //item cache
        _chef:       null,
        _inspector:  null,
        _installers: null,


        startup: function (options) {

            var _options        = options || this.options || {},
                deps            = {};

            //ensure they passed menus
            if(!_options.menus) {
                this.deferred.reject(new Error('You must pass menus to the kitchen or else we don\'t know what to cook.'));
                return this.deferred;
            }

            //setup installers
            if(!_options.installers) {
                deps.installers = this.parent.refreshInstallers();
            } else {
                deps.installers = _options.installers;
            }


            //setup chef (for menu retreival)
            if(!_options.chef) {
                deps.chef = this.parent.forge('client/Chef');
            } else {
                deps.chef = _options.installers;
            }

            //inspector (for search)
            if(!_options.inspector) {
                deps.inspector = this.parent.forge('client/Inspector');
            } else {
                deps.inspector = _options.inspector;
            }


            this.deferred = this.all(deps).then(function (deps) {

                this._chef = deps.chef;
                this._inspector = deps.inspector;
                this._installers = deps.installers;

                //drop in menus
                return this.addMenus(_options.menus);

            }.bind(this)).then(function () {

                return this;

            }.bind(this));


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
                    menu = this._chef.fetchMenu(menu);
                }

                list.push(when(menu));

            });

            return all(list).then(hitch(this, function (menus) {

                //track individual menu items to pass to the inspector
                this._menuItems = [];

                //drop in installer to each menu item, starting bo looping through all menus
                _.each(menus, function (menu) {

                    //each menu item is nested under a type (modules, widgets, etc.) all provided by installers
                    _.each(this._installers, function (installer, type) {

                        //set installer on each item, which are grouped by type
                        menu[type] = _.map(menu[type], function (menuItem) {

                            menuItem.type = type;

                            return menuItem;

                        });

                        this._menuItems = this._menuItems.concat(menu[type]);

                    }, this);

                },this);

                //menus
                this._menus = menus;

                //refresh any inspector that may be working today (for search)
                if(this._inspector) {
                    this._inspector.refresh(this._menuItems);
                }

                return this;

            }));

        },

        /**
         * Add a singe menu to the kitchen. Make
         *
         * @param menu an object matching schema in ./configs/menu.json or if string assumed to be a remotely
         *             hosted json file that is of the same form
         * @returns {altair.Deferred}
         */
        addMenu: function (menu) {
            return this.addMenus([menu]);
        },

        /**
         * Search every menu and see if there is a match.
         *
         * @param terms
         * @returns {altair.Deferred}
         */
        search: function (term, type) {
            return this._inspector.search(term, type || 'modules');
        },

        /**
         * Get you a menu item by name.
         *
         * @param name
         * @returns {menuItem}
         */
        menuItemFor: function (name) {

            var menuItems = [];
            return _.find(this._menuItems || [], {name: name});


        }

    });

});