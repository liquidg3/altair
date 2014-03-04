Apollo
===

Apollo is a lightweight ORM written in JS for dojo/amd. Apollo is different than other ORM's in that it is intended to be used
without a database (though it can be used with any) and is not attached to any document or model system. Also, unlike
other ORM's, Apollo was built with UI support in mind. These 2 differences make Apollo something totally unique. Using
Apollo, you can give any object structure and immediately expose that schema via a web form or a rest endpoint giving
users the ability to customize your objects in a myriad of ways.

Schemas in Apollo are powerful creatures. Because they contain inside themselves (through various components) the ability
to normalize and validate data, they work great for things besides generic objects. Using a schema to validate a rest
endpoint is a great way to ensure your data is consistent and valid.

Apollo has several components:

- Apollo is where you configure your available field types
- Schema houses you structure, usually pulled from a .json file so it can be cached =)
- FieldTypes facilitate data normalization (date, number, string, relationship, etc.) to and from environments
- Renderers get attached to FieldTypes to allow them to be rendered as web forms (among other things)
- Validators get attached to FieldTypes to do, you guessed it, validation.
- _HasSchemaMixin is what actually gives any arbitrary object the ability to have a schema.

** Apollo is totally decoupled from Altair **

_HasSchemaMixin
---

The biggest switch that Apollo makes to the usual ORM paradigm is that it that we don't need to instantiate a particular
model or document class to get all our great functionality. The _HasSchemaMixin can be added to any class to give it a
schema. This is awesome for many reasons, but lets take a look at an example before letting our imagination run wild.


The Schema
---
By default, you will put this file in ./config/schema.json.


    {
        "elements": {

            "restEndpoint": {
                "type": "url",
                "options": {
                    "required":     true,
                    "label":        "Rest Endpoint",
                    "secure":       true,
                    "value":        "defaultvalue.com",
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


The Module
---
This can be any .js file.

    define(['apollo/_HasSchemaMixin', 'dojo/declare'], function (_HasSchemaMixin, declare) {

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