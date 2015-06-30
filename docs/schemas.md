# Schemas
More often than not you'll find schemas being used in an ORM. Altair depends on [Apollo](../core/lib/apollo/README.md) for
its schema support.

## Why are schemas great?
It's actually a great idea to use a schema rather than local properties any time you have the patience to do so. Lets
go through a scenario and show why.

## No Schema
Below is a vanilla [Altair module](firstmodule.md). I mixes in nothing.
```js
define(['altair/facades/declare'],
    function (declare) {

    return declare(null, {
        foo: 'bar',
        aNumber: '5'
    });

});
```
Now lets work with our new module's properties from another module.
```js

var module = this.nexus('vendor:ModuleName');

console.log(module.foo); //will print 'bar'
console.log(_.isNumber(module.aNumber)); //will print false

```

## With Schema
Lets do the same thing (create 2 properties) but use the `apollo/_HasSchemaMixin` to provide the properties.
You'll notice there are 2 differences in this example. First, the use of the `apollo/_HasSchemaMixin'. Second,
you'll see we actually have properties.

```js
define(['altair/facades/declare',
        'apollo/_HasSchemaMixin'
], function (declare,
             _HasSchemaMixin) {

    return declare([_HasSchemaMixin], {


    });

});
```

Now define your schema in `./configs/schema.json`. Altair modules will automatically look in `configs/schema.json` for
 your defined schema.

```json
{
    "properties": {

        "foo": {
            "type": "string",
            "options": {
                "label":        "Are you Foo?",
                "default":      "bar",
                "description":  "This description is output next to wherever the input is rendered (in terminal or the web)."
            }
        },

        "aNumber": {
            "type": "integer",
            "options": {
                "label":        "A number",
                "required":     true
            }
        }
    }

}
```
*Special Note*: If you are adding a schema to something other than an Altair Module (like an adapter or some
other subComponent), you will have to manually pass the schema since its not auto loaded from ./configs/schema.json. That
will be explained way below.

Next you need to configure your module's settings. I'm going to assume you already created an [app](app.md) and have
an `app/configs/modules.json` ready.

```json

{
    "vendor:MyModule": {
        "foo": "bar",
        "aNumber": "5"
    }
}

```
By passing our values via our config, we can control what the values are on a per-environment bases (e.g. by defining
something different in `app/configs/modules-dev.json`).

Here is how we'll access those schema properties:

```js
var module = this.nexus('vendor:MyModule');

console.log(module.get('foo')); //will print 'bar'
console.log(_.isNumber(module.get('aNumber')); //will print true

```

## Other bonuses
Besides type coercion, you get a few other cool things. Here are some examples.
```js

var module = this.nexus('vendor:MyModule')

//default values are nice
if(module.get('foo', 'thebar') === 'thebar') {
    console.log('foo was null');
}

//by setting the "many" options to true for a property, it will always come back an array (unless it's null).
module.schema().setOptionFor('foo', 'many', true);

_.each(module.get('foo', []), function (value) {
    console.log(value); //prints out 'bar'
});

//you can get all values in the schema
var values = module.getValues();

console.log(values); //will print out everything in the schema


## Manually adding a schema to your AMD module (not Altair module) at build time
If you are inside a sub component of your module (like an adapter) you can add a schema by doing 2 additional steps.
First you manually include your schema using the `altair/plugins/config!`, then you assign it to the `_schema` property
of your class.

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
## Manually adding a schema to your AMD module (not Altair module) at run time
Lets say you want to programatically create a schema and add set it to an object you've already instantiated. Here is how you do that:

```js

//get at apollo via its cartridge
var apollo = this.nexus('cartridges/Apollo'),
    schema    = apollo.createSchema({
        properties: {
            firstName: {...},
            lastName: {...}
        }
    });

//forge a new instance of something with the hasSchemaMixin
var objectWithHasSchemaMixin = this.forgeSync('path/to/lib');

//set the schema
objectWithHasSchemaMixin.setSchema(schema);

objectWithHasSchemaMixin.mixin({
    firstName: 'Tay',
    lastName: 'Ro'
});

//use your instance like any other schema based class
var firstName = objectWithHasSchemaMixin.get('firstName');

```


You can find more information about Apollo in the [docs](../core/lib/apollo/README.md).