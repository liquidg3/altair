### Lifecycles in Altair

An altair/Lifecycle is a simple base class that has 3 important methods, startup, execute, teardown. They are called in
order and each one returns an altair/Deferred giving you chance to do some asynchronous operations. Below is interface
for altair/Lifecycle

```js
define(['altair/declare'], function (declare) {

    return declare(null, {

        constructor: function (options) {
            this.options = options;
        },

        /**
         * Put anything that needs to be done (configuring, setup, etc.) before your lifecycle is executed.
         *
         * Startup always returns an altair/Deferred. If one does not exist (meaning you did not set
         * this.deferred = new this.Deferred in your child class) then I will make one and resolve it immediately.
         * This makes the operation synchronise, but will allow us to always use the startup().then(... syntax.
         *
         * @param options optional simply overrides this.options if passed
         * @return {altair.Deferred}
         */
        startup: function (options) {
            ...
            return this.deferred;
        },

        /**
         * Do your work in here.
         *
         * @returns {altair.Deferred}
         */
        execute: function () {
            ....
            return this.deferred;
        },

        /**
         * Clean up so it's like you never existed.
         *
         * @returns {altair.Deferred}
         */
        teardown: function () {
            ...
            return this.deferred;
        }
    });
});

```

## Creating a Lifecycle subclass

Lifecycles are used throughout Altair because of how often you need to be able to setup an environment before executing
some logic inside of it. Using a Lifecycle is as easy as mixing it into your class.

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