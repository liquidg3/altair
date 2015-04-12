# Database
Connect to databases using adapters. Mongo is the only one supported for now. All someone has to do is create an
adapter and implement all the methods inside of `./adapters/_Base`.

##Configuring connections
Setting up your database connection is pretty easy, first make sure you understand the basics of building an [app](../../../../../docs/app.md).

###Set `options` for the `database` cartridge in `modules.json` and `modules-dev.json`

```json
{
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
```
There is currently only 1 database adapter (Mongodb), but adding new ones is as simple is creating an AMD module and
 mixing in `./adapters/_Base`, then implementing all the methods that exist.

##Database operations
Now that the `database` cartridge is configure, you can run queries and create/update/delete records/documents.

```js

//get database cartridge instance
var db = this.nexus('cartidges/Database');


//Create a record
db.create('test_collection').set({
    foo: 'bar',
    firstName: 'tay',
    lastName: 'ro'
}).execute().then(function (record) {

    console.log(record);

}).otherwise(function (err) {
    console.log(err);
});


//Create many records
var promise = db.createMany('test_collection')
                .set([ {object: one}, {object: two} ])
                .execute();

//Read
var p = db.findOne('test_collection').where('firstName', '===', 'tay).execute()



//Update
//Delete

//iterating over results
db.findOne('test_collection').where('firstName', '===', 'tay).execute().then(function (results) {

    return results.each().step(function (doc) {

        console.log(doc);

    });

});
```