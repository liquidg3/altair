# Apollo

Apollo is our ORM. It does not come with database support out of the gate and is designed to work with any type of object
(not just entities or data models). It handles schema support, data transformation/normalization, and validation.

Read the [Apollo docs](../core/lib/apollo/README.md).

## Adding a schema to your Altair module
The Apollo plugin for Altair makes it really easy to give your module a schema. Simple use the _HasSchemaMixin, create
a config/schema.json, then you're done!

### Step 1 - _HasSchemaMixin

```js
define(['altair/facades/declare',
        'altair/Lifecycle',
        'apollo/_HasSchemaMixin'
], function (declare,
             Lifecycle,
             _HasSchemaMixin) {

    return declare([Lifecycle, _HasSchemaMixin], {
        //your module has such a nice body
    });

});
```

### Step 2 - Create a ./config/schema.json
```json
{
    "description": "This is a description of your schema",
    "properties":    {
        "port": {
            "type":    "integer",
            "options": {
                "label":   "Port",
                "default": 3000
            }
        }
    }
}
```

## Manually adding a schema to your AMD module
If you are inside a sub component of your module (like and adapter) you can add a schema by doing 1 additional step.

```js
define(['altair/facades/declare',
         'altair/Lifecycle',
         'apollo/_HasSchemaMixin',
         'altair/plugins/config!./schema.json' //bring in your schema manually
], function (declare,
              Lifecycle,
              _HasSchemaMixin,
              schema) {

     return declare([Lifecycle, _HasSchemaMixin], {
         _schema: schema //set the parsed schema config to this.schema
     });

});
```
You can find more information about Apollo in the [docs](../core/lib/apollo/README.md).