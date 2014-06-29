#Creating your first App
An app in Altair is really just a configuration. Since each part of the Altair system was built in a fully configurable
way, launching an app really just comes down to having a configuration file that tells Altair what to load and how.

##Forge your app
```bash
$ npm install altar.io -g
$ mkdir path/to/app
$ cd path/to/app
$ altair forge app
```

or

```bash
$ altair forge app --destination path/to/app
```

###What got created?
The template app will come with a few files:

- `altair.json`: This is the main config that allows you to customize every aspect of Altair. Because it can grow large, we break it out into sub files.
- `package.json`: Npm needs this file and it does not appear it'll ever change  (I found 62 instances of "package.json" in npm/lib).
- `configs/database.json`: An example config for the Database cartridge. Notice the ".disabled" in the key.
- `configs/database-dev.json`: Lets you override the database settings while in the dev environment: `$ altair --env dev`
- `configs/modules.json`: Allows you to pass options to any module during startup.
- `configs/modules-dev.json`: Special dev options


##Using your app
```bash
$ cd path/to/app
$ altair
```
You'll notice when your app loads that Altair will output something like:
```bash
altair:Altair app detected - loading config @ path/to/app/altair.json +0ms
```
Now you are free to play around with your new environment!

###What's next?
Why not start by [creating a module](firstmodule.md)?