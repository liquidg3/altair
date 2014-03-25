#AMD Template
Use the template below when starting to define a new class.

``` js
define(['altair/facades/declare',
        'altair/Lifecycle'
], function (declare,
             Lifecycle) {

    return declare([Lifecycle], {

        startup: function (options) {

            //get options, fallback to default
            var _options = options || this.options;

            return this.inherited(arguments);

        }

    });

});
```