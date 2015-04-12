define(['altair/facades/declare',
        'altair/mixins/_DeferredMixin',
        'lodash'
], function (declare,
             _DeferredMixin,
             _) {

    return declare(_DeferredMixin, {

        _queues: null,

        constructor: function () {
            this._queues = {};
        },


        queue: function (key) {

            var dfd = new this.Deferred();

            key = key || 'default-key';

            if (!this._queues[key] || this._queues[key].length == 0) {
                this._queues[key] = [];
                dfd.resolve();
            }

            this._queues[key].push(dfd);

            return dfd.promise;

        },

        next: function (key) {

            key = key || 'default-key';
            
            if (this._queues[key] && this._queues[key].length > 0) {

                //it could be have already been resolved
                var deferred = this._queues[key].shift();

                if (deferred && deferred.isResolved()) {
                    deferred = this._queues[key].shift();
                }

                if (deferred) {
                    deferred.resolve();
                }
            }

        }

    });

});