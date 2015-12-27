### Lifecycles in Altair

An altair/Lifecycle is a simple base class that has 3 important methods, startup, execute, teardown. They are called in
order and each one returns an altair/Deferred giving you chance to do some asynchronous operations. Anytime your component
needs to do setup in an asynchronous fashion, use a Lifecycle. Below is interface:

```js
define(['altair/facades/declare'], function (declare) {

    return declare(null, {

        constructor: function (options) {
            this.options = options;
        },

        /**
         * Put anything that needs to be done (configuring, setup, etc.) before your lifecycle is executed.
         *
         * Startup always returns an altair/Deferred. If one does not exist (meaning you did not set
         * this.deferred = new this.Deferred in your class) then I will make one and resolve it immediately.
         *
         * @param options optional simply overrides this.options if passed
         * @return {altair.Promise}
         */
        startup: function (options) {
            ...
            return this.deferred.promise;
        },

        /**
         * Do your work in here.
         *
         * @returns {altair.Promise}
         */
        execute: function () {
            ....
            return this.deferred.promise;
        },

        /**
         * Clean up so it's like you never existed.
         *
         * @returns {altair.Promise}
         */
        teardown: function () {
            ...
            return this.deferred.promise;
        }
    });
});

```

## Creating a Lifecycle subclass

Lifecycles are used throughout Altair because of how often you need to be able to setup an environment before executing
some logic inside of it. Using a Lifecycle is as easy as mixing it into your module.

```js
define(['altair/facades/declare',
        'altair/facades/hitch',
        'altair/Lifecycle'],

    function (declare,
              Lifecycle,
              hitch) {

        return declare([Lifecycle], {


            startup: function (options) {

                //use options passed or the ones set in the constructor
                var _options = options || this.options;

                //override this.deferred to keep it from resolving immediately, giving you time to do your setup.
                //for convenience, this.Deferred is a reference to altair/Deferred and is ready to instantiate.
                this.deferred = new this.Deferred();

                //simulating async process
                setTimeout(hitch(this, function () {

                    //any callback passed .startup().then(...) will now be executed
                    this.deferred.resolve();

                }), 500);

                return this.inherited(arguments);

            }


        });

});
```

## Mixing in many async dependencies with `mixin()`

If you have a bunch of async libraries you need to load during starup, use `mixin`.

```js
define(['altair/facades/declare',
        'altair/facades/hitch',
        'altair/Lifecycle'],

    function (declare,
              Lifecycle,
              hitch) {

        return declare([Lifecycle], {


            users:      null,
            profiles:   null,
            
            
            startup: function (options) {


                this.mixin({
                    users: this.entity('User'),
                    profiles: this.entity('Profile')
                });
                

                return this.inherited(arguments);

            }


        });

});
```