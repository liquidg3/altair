#running altair is easy yo


**lets come up with something even easier!!!!!

step 1: create altair.js

step 2: paste this into it:

    #!/usr/bin/env node

    //Aaaaand go....

    require('altair.io');

step 3: create package.json

step 4: paste this into it:

    {
        "name": "myproject",
        "version": "0.0.1",
        "description": "New things!",
        "main": "altair.js",
        "dependencies": {
            "altair":           ">=0.0.x"
        }

    }
step 5: #npm update

step 6: ./altair.js

###what's next?

* dowload modules at [the lodge](../core/vendors/altair/modules/thelodge/README.md)
* bulid a module at [the forge](firstmodule.md)
* build a commander at [command central](../core/vendors/altair/modules/commandcentral/README.md)