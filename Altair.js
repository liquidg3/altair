var path = require('path');

// Configuration Object for Dojo Loader:
dojoConfig = {
    baseUrl: path.resolve('./'), // Where we will put our packages
    async: 1, // We want to make sure we are using the "modern" loader
    hasCache: {
        "host-node": 1, // Ensure we "force" the loader into Node.js mode
        "dom": 0 // Ensure that none of the code assumes we have a DOM
    },
    packages: [
        {
            name: "dojo",
            location: "core/library/dojo"
        },
        {
            name: "altair",
            location: "core/library"
        },
        {
            name: "core",
            location: "core"
        }
    ],
    deps: [
        "core/bootstrap"
    ]
};

// Now load the Dojo loader
require("./core/library/dojo/dojo.js");