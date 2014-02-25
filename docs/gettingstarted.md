#running altair is easy yo


**lets come up with something even easier!!!!!

step 1: create altair.js

step 2: paste this into it:

    #!/usr/bin/env node

    require('altair.io');

Step 3: chmod 755 altair.js 

step 4: create package.json

step 5: paste this into it:

    {
        "name": "myproject",
        "version": "0.0.1",
        "description": "New things!",
        "main": "altair.js",
        "dependencies": {
            "altair.io":           ">=0.0.x"
        }

    }
step 6: #npm update

step 7: ./altair.js

###what's next?

* dowload modules at [the lodge](../core/vendors/altair/modules/thelodge/README.md)
* bulid a module at [the forge](firstmodule.md)
* build a commander at [command central](../core/vendors/altair/modules/commandcentral/README.md)