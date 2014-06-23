# Database
Connect to databases using adapters. Mongo is the only one supported for now. All someone has to do is create an
adapter and implement all the methods inside of `./adapters/_Base`.

##Configuring connections
Setting up your database connection is pretty easy, first make sure you understand the basics of building an [app](../../../../../docs/app.md).

###Set `options` for the `database` cartridge in `altair.json`
In this example we'll setup a `default` connection, then override it for `production`. It really just amounts to
creating a database connection and configuring it through `options`.
```json
{
    "default": {
        "cartridges": {
            "database": {
                "options": {
                    "connections": [
                        {
                            "path":    "altair/cartridges/database/adapters/Mongodb",
                            "options": {
                                "alias":            "mongo1",
                                "connectionString": "mongodb://localhost/my_database_dev"
                            }
                        }
                    ]
                }
            }
        }
    }
    "production": {
        "cartridges": {
            "database": {
                "options": {
                    "connections": [
                        {
                            "path":    "altair/cartridges/database/adapters/Mongodb",
                            "options": {
                                "alias":            "mongo1",
                                "connectionString": "mongodb://localhost/my_database_prod"
                            }
                        },
                        {
                            "path":    "altair/cartridges/database/adapters/Mongodb",
                            "options": {
                                "alias":            "mongo2",
                                "connectionString": "mongodb://localhost/my_database_dev"
                            }
                        }
                    ]
                }
            }
        }
    }
}
```
There is currently only 1 database adapter (Mongodb), but adding new ones is as simple is creating an AMD module and
 mixing in `./adapters/_Base`, then implementing all the methods that exist.

##Database operations
Now that the `database` cartridge is configure, you can run queries and create/update/delete records/documents.

```js


``