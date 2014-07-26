
define(['altair/facades/declare',
        'altair/mixins/_DeferredMixin',
        'lodash'
], function (declare,
             _DeferredMixin) {

    return declare([_DeferredMixin], {


        forge: function (destination, context) {

            var from = this.parent.resolvePath('templates/app'),
                dfd = new this.Deferred();

            this.parent.forge('models/Copier').then(function (copier) {

                copier.execute(from, destination, context)
                      .step(this.hitch(dfd, 'progress'))
                      .then(this.hitch(dfd, 'resolve'))
                      .otherwise(this.hitch(dfd, 'reject'));

            }.bind(this));

            return dfd;

        }


    });

});