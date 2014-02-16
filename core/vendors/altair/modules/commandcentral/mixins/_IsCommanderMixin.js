define(['dojo/_base/declare',
        'altair/Lifecycle',
        'altair/facades/hitch',
        'dojo/node!fs'

], function (declare,
             Lifecycle,
             hitch,
             fs) {


    var Commander = declare('altair/modules/commandcentral/mixins/_HasCommandersMixin', [Lifecycle], {

        adapter: null,
        _styles: null,

        startup: function (options) {

            options         = options || this.options;
            this.adapter    = (options && options.adapter) ? options.adapter : this.module.adapter();

            if(!this.adapter) {
                throw Error('You must pass your commander an adapter from Altair:CommandCentral');
            }

            return this.inherited(arguments).then(hitch(this, function () {

                var file        = this.module.resolvePath('commanders/styles.json'),
                    deferred    = new this.module.Deferred();

                this.module.parseConfig(file).then(hitch(this, function (config) {

                    this.adapter.setStyles(config);
                    deferred.resolve(this);

                    return this;

                })).otherwise(hitch(deferred, 'resolve', this));


                return deferred;
            }));
        },


        splash: function () {
            this.module.adapter().splash();
        }

    });


    //mixin certain adapter methods
    var methods = ['notice', 'writeLine', 'readLine', 'form', 'select', 'showProgress', 'hideProgress'],
        sig     = {};

    methods.forEach(function (method) {
        sig[method] = function () {
            return this.adapter[method].apply(this.adapter, arguments);
        };
    });

    Commander.extend(sig);

    return Commander;

});
