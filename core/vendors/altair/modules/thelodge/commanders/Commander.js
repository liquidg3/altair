define(['altair/facades/declare',
        '../../commandcentral/mixins/_IsCommanderMixin',
        'altair/facades/hitch'
], function (declare,
             _IsCommanderMixin,
             hitch) {

    return declare([_IsCommanderMixin], {

        _valet:  null,
        startup: function (options) {

            var _options = options || this.options;

            if(_options && _options.valet) {
                this._valet = _options.valet;
            } else {

                this.deferred = new this.Deferred();

                this.module.foundry('client/Valet').then(hitch(this, function (valet) {
                    this._valet = valet;
                    this.deferred.resolve(this);
                }));

            }

            return this.inherited(arguments);

        },

        search: function () {

            throw new Error('Not finished');

        },

        npm: function () {

            return this._valet.npm().step(hitch(this, function (step) {
                this.writeLine(step.message);
            }));

        }



    });
});