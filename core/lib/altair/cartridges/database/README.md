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
var db = this.nexus('cartridges/Database');


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
var promise = db.findOne('test_collection').where('firstName', '===', 'tay).execute()



//Update
var promise = db.update('test_collection').where('group', '===', 'foo').set('group', 'bar').execute();
var promise = db.update('test_collection').where('group', '===', 'foo').set({
    group: 'bar',
    happy:  true
}).execute();


//Delete
var promise = db.delete('test_collection').where(...).execute()

//count
db.count('test_collection').where(...).then(function (count) {
    console.log(count);
});

//iterating over results
db.findOne('test_collection').where('firstName', '===', 'tay).execute().then(function (results) {

    return results.each().step(function (doc) {

        console.log(doc);

    });

});


//Getting to the raw mongodb adapter (or whichever adapter you may be using)
var connection = db.defaultConnection(); //a "connection" is an adapter for a data store
//var connection = db.connection('mongo1'); //if you have multiple connections and want a specific one

//get the original mongodb module
var mongo = connection.client();
var database = connection.db(); //gets the mongodb instance with current database as the context
 
//use the normal mongo api
database.collection('users').update(...);

```