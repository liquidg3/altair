# Adapters

The Adapters module is comes with a handy *altair/modules/adaptens/mixins/\_HasAdaptersMixin* that makes it easy for your
Lifecycle object to utilize the adapter pattern to solve the problem of normalizing input/output/etc.

## Step 1 - _HasAdaptersMixin
``` js
define(['altair/facades/declare',
        'altair/modules/adapters/mixins/_HasAdaptersMixin'
], function (declare,
             _HasAdaptersMixin) {

    return declare([_HasAdaptersMixin], {

    });

});
```

## Step 2 - Create _Base adapter
An adapter is really just a standard AMD module. Adapters are built using the [foundry
plugin](../../../../../docs/moduleplugins.md). By convention, they are put in an "adapters" dir inside your
module's dir.

Paste this into path/to/your/module/adapters/_Base.js to get yourself started. All your adapters should mixin
this _Base class to ensure API consistency.

``` js
define(['altair/facades/declare'], function (declare) {

    return declare(null, {

        requiredMethod1: function () {
            throw new Error('You must implement requiredMethod');
        }

    });

});
```

## Step 3 - Create adapter
Now you create an AMD module right next to _Base, making sure to mix _Base in.


``` js
define(['altair/facades/declare'
        './_Base'],

        function (declare,
                  _Base) {

    return declare(_Base, {

        requiredMethod1: function () {
            return "we fullfilled our module's interface requirements";
        }

    });

});
```
## Step 5 - Setup dependencies
Your module now depends on altair:Adapters so we should tell Altair.

```json
"altairDependencies": {
    "altair:Adapters": ">=0.0.x"
}
```

## Step 6 - Set selected adapter
The easiest way to do this is to add the following to your app/config/altair.json
***COMING SOON**

## Step 7 - Use your adapter
The _HasAdaptersMixin depends on Apollo for its schema support. This means you'll be using get/set like you're used to,
which is nice. All the methods below call be called from the module that has the mixin.

``` js
/**
 * Get the currently selected adapter (always a single value, can be null if no selected adapter is set)
 *
 * @param default optional if no adapter set, return default
 * @param options optional reserved for future use (probably pass through to adapter)
 * @param config optional reserved for future use
 * @returns {altair.Promise}
 */
this.get('selectedAdapter', default, options, config).then(function (adapter) {
    console.dir(adapter);
}).otherwise(function (err) {
    console.log(err);
});

/**
 * Get the currently selected adapters *more than one* (always an array or null if no selected adapters are set)
 *
 * @param default optional if no adapter set, you'll get what you pass here back
 * @param options optional reserved for future use (probably pass through to adapter)
 * @param config optional reserved for future use
 * @returns {altair.Promise}
 */
this.get('selectedAdapters', default, options, config).then(function (adapters) {
    console.log(adapters);
}).otherwise(function (err) {
    console.log(err);
});

/**
 * Set the selected adapter.
 */
this.set('selectedAdapter', adapter);

/**
 * Set more than one adapter at a time
 */
this.set('selectedAdapters', [adapter1, adapter2]);

/**
 * Same as calling this.get('selectedAdapters') **with no arguments** but returns the adapter instead of a deferred;
 * NOTE: this method works best *AFTER* startup(). Calling before then will return a deferred. This method
 * really does most of the work in the mixin, you should really inspect its source to see how it works.
 *
 * @return {*}
 */
var adapter = this.adapter();


/**
 * getting an adapter by name from yourself (you shouldn't need to do this often)
 *
 * @param name path to class relative to your own module
 * @return {altair.Promise}
 */
this.adapter('adapters/Smtp').then(hitch(this, function (smtp) {
    console.dir(smtp);
})).otherwise(function (err) {
    console.log(err);
});

/**
 * Same as above, but using nexus to resolve to an adapter on a different module
 *
 * @param name full nexus path to adapter
 * @return {altair.Promise}
 */
this.adapter('altair:PostMaster/adapters/Smtp').then(hitch(this, function (smtp) {
    console.dir(smtp);
})).otherwise(function (err) {
    console.log(err);
});
```
