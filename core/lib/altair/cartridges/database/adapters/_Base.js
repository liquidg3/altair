define(['altair/facades/declare',
        'altair/Lifecycle'], function (declare, Lifecycle) {

    return declare([Lifecycle], {

        foundry:    null,
        _cartridge: null,
        alias:      '', //we can give our database connections an alias so they are easy to lookup later
        constructor: function (cartridge, options) {

            this._cartridge = cartridge;
            this.options = options;
            this.foundry = (options && options.foundry) ? options.foundry : null;


        },

        startup: function (options) {

            var _options = options || this.options || {};

            //was this connection given an alias?
            this.alias    = _options.alias || '';

            if(!this.alias) {
                this.deferred = new this.Deferred();
                this.deferred.reject(new Error('please give your database adapter a nickname.'));

            }

            return this.inherited(arguments);
        }


    });

});