Apollo
===

Apollo is a lightweight ORM written in JS for dojo/amd. Apollo is different than other ORM's in that it is intended to be used
without a database (though it can be used with one) and is not attached to any document or model system. Also, unlike
other ORM's, Apollo was built with UI (web, mobile, cli) support in mind. These 2 differences make Apollo something totally unique. Using
Apollo, you can give any object 'structure' and immediately expose it via a web form or a rest endpoint. This gives
users the ability to customize your objects in a myriad of ways.

Schemas in Apollo are powerful creatures. Because they contain (through various components) the ability
to normalize and validate data, they work great for things besides generic objects. Using a schema to validate a rest
endpoint and to normalize the incoming data is a great way to ensure your data is consistent and valid.

Apollo has several components:

- Apollo is where you configure your available field types
- Schema houses your structure, usually pulled from a .json file so it can be cached =)
- FieldTypes facilitate data normalization (date, number, string, relationship, etc.) to and from environments
- Validators get attached to FieldTypes to do, you guessed it, validation.
- _HasSchemaMixin is what actually gives any arbitrary object the ability to have a schema.
- Schema data is extremely flexible is great for customizing properties for many use cases (forms, REST, etc.)

** Apollo is totally decoupled from Altair. If you are looking to use schemas in Altair, look [here](../../../docs/apollo.md). **

##Step 1 - create Apollo
The main Apollo object houses all your property types. It is also responsible for instantiating new Schemas (through the
createSchema() factory). You will more than likely only have 1 Apollo instance per application.

```js

define(['apollo/Apollo',
        'apollo/propertytypes/Str',
        'apollo/propertytypes/Bool',
        'apollo/propertytypes/Float',
        'apollo/propertytypes/Int',
        'apollo/propertytypes/Object',
        'apollo/propertytypes/Primary',
        'apollo/propertytypes/Select',
        'apollo/propertytypes/Path'],
    function (Apollo,
              Str,
              Bool,
              Float,
              Int,
              Object,
              Primary,
              Select,
              Path) {


        //Create a new Apollo with all the field types you want to support
        var apollo = new Apollo([
            new Str(),
            new Bool(),
            new Float(),
            new Int(),
            new Object(),
            new Primary(),
            new Select(),
            new Path()
        ]);





    });

});
```


The Schema
---
Creating a Schema is

```json
{
    "properties": {

        "restEndpoint": {
            "type": "url",
            "options": {
                "required":     true,
                "label":        "Rest Endpoint",
                "secure":       true,
                "default":      "defaultvalue.com",
                "description":  "Enter in the URL of wherever we're connecting."
            }
        },

        "email": {
            "type": "email",
            "options": {
                "required":     true,
                "label":        "Email"
            }
        },

        "password": {
            "type": "password",
            "options": {
                "required":     true,
                "label":        "Password"
            }
        }

    }

}
```

\_HasSchemaMixin
---

The biggest switch that Apollo makes to the usual ORM paradigm is that it that we don't need to instantiate a particular
model or document class to get all our great functionality. The _HasSchemaMixin can be added to any class to give it a
schema. This is awesome for many reasons, but lets take a look at an example before letting our imagination run wild.


The Module
---
This can be any AMD module.

``` js
define(['apollo/_HasSchemaMixin', 'dojo/declare'],
    function (_HasSchemaMixin, declare) {

    return declare([_HasSchemaMixin], {

        startup: function () {

            //any field in the schema is retrieved via get(name, default, options, config)
            var endpoint = this.get('restEndpoint');

            if(!endpoint) {

                //you can also set()

            }

            this.set('restEndpoint', endpoint);

            //or if you want to check if a field is valid
            this.isValid('restEndpoint')

            //perhaps check if we are valid
            this.valid();



        }


    });

});
```

## More docs coming soon