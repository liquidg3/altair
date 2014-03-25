# Adapters

The Adapters module is comes with a handy altair/modules/adaptens/mixins/\_HasAdaptersMixin that makes it easy for your
module to utilize the adapter pattern to solve the problem of normalizing input/output/etc.

Anytime you are working with any input/output where the source or format can change (databases or credit card
processors are a great examples) then you should use the \_HasAdaptersMixin.

## mixin _HasAdaptersMixin

    define(['altair/facades/declare',
            'altair/modules/adapters/mixins/_HasAdaptersMixin'
    ], function (declare,
                 _HasAdaptersMixin) {

        return declare([_HasAdaptersMixin], {

        });

    });

## The _HasAdaptersMixin API
The _HasAdaptersMixin depends on Apollo for its schema support. This means you'll be using get/set like you're used to,
which is nice.

    /**
     * Get the currently selected adapter (always a single value, can be null if no selected adapter is set)
     *
     * @param default optional if no adapter set, return default
     * @param options optional reserved for future use (probably pass through to adapter)
     * @param config optional reserved for future use
     * @returns {altair.Deferred}
     */
    this.get('selectedAdapter', default, options, config).then(function (adapter) {
        console.dir(adapter);
    }).otherwise(function (err) {
        console.log(err);
    });

    /**
     * Get the currently selected adapters *more than one* (always an array or null if no selected adapters are set)
     *
     * @param default optional if no adapter set, return default
     * @param options optional reserved for future use (probably pass through to adapter)
     * @param config optional reserved for future use
     * @returns {altair.Deferred}
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
     * @return {altair.Deferred}
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
     * @return {altair.Deferred}
     */
    this.adapter('altair:PostMaster::adapters/Smtp').then(hitch(this, function (smtp) {
        console.dir(smtp);
    })).otherwise(function (err) {
        console.log(err);
    });



## Creating an adapter
An adapter is really just a standard AMD module. Adapters are built using the [foundry module
plugin](../../../../../docs/moduleplugins.md). By convention, they are put in an "adapters" dir inside your
module's dir.

Paste this into path/to/your/module/adapters/ClassName.js to get yourself started.

    define(['altair/facades/declare',
            'altair/Lifecycle'
    ], function (declare,
                 Lifecycle) {



        return declare([Lifecycle], {

        });

    });
