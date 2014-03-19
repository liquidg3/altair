/**
 * This is a simple module. It does not do to much on its own. You can run it and see that you get a console.log.
 */
define(['altair/declare',
        'altair/Lifecycle'
], function (declare, Lifecycle) {

    return declare(Lifecycle, {

        startup: function (options) {

            console.log('go $(name)s go!');

            return this.inherited(arguments);
        }

    });
});