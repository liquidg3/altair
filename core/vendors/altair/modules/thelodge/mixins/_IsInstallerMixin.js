define(['altair/facades/declare',
        'altair/facades/hitch',
        'altair/events/Emitter',
        'altair/Lifecycle'
], function (declare,
             hitch,
             Emitter,
             Lifecycle) {


    return declare([Emitter, Lifecycle], {

        type: null,

        startup: function (options) {

            var _options = options || this.options;

            if(!_options.type) {
                throw new Error('You must pass installers for thelodge a type (such as modules, themes, widgets, etc.)');
            }

            this.type = _options.type;

            return this.inherited(arguments);
        },

        install: function (from, to) {

            if(!this.deferred) {
                this.deferred = new this.Deferred();
                this.deferred.resolve(this);
            }

            //remove the deferred after it's been resolved
            this.deferred.promise.always(this._deferredAutoRemover(this.deferred));

            return this.deferred;

        },


        unInstall: function (from) {

            if(!this.deferred) {
                this.deferred = new this.Deferred();
                this.deferred.resolve(this);
            }

            //remove the deferred after it's been resolved
            this.deferred.promise.always(this._deferredAutoRemover(this.deferred));

            return this.deferred;

        }



    });

});
