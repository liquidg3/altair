var fs = require('fs');
var path = require('path');

var rootPath = path.resolve( path.dirname( process.mainModule.filename ) );

//TODO: Tay, Please correct me on this one, i know this wont work for module overrides across our folder structure. but it gets all modules in any vendor into our system at startup.
function loadPackages(){
    var packages = [{
        "name": "dojo",
        "location": "dojo"
    }];
    
    var folderItems = fs.readdirSync(rootPath);
    
    for( var index = 0; index < folderItems.length; index++ ){
        var folderItem = folderItems[index];
        
        if( fs.lstatSync( rootPath+'/'+folderItem ).isDirectory() && fs.existsSync(rootPath+'/'+folderItem+'/vendor') && fs.lstatSync( rootPath+'/'+folderItem+'/vendor' ).isDirectory()){
            var vendors = fs.readdirSync( rootPath+'/'+folderItem+'/vendor' );

            for( var vendorIndex = 0; vendorIndex < vendors.length; vendorIndex++ ){
                var vendorName = vendors[vendorIndex];
                
                var thisPackage = {
                    "name": vendors[vendorIndex],
                    "location": '../../'+folderItem+'/vendor/'+vendorName+'/module'
                }
                
                
                
                packages.push( thisPackage );
                
            }
            
        }
        
    }
    
    return packages;
    
}

module.exports = {
    "baseUrl": "core/library/",
    "async": 1,
    "hasCache": {
        "host-node": 1,
        "dom": 0
    },
    "packages": loadPackages(),             //loaded from any root folder that has a vendors sub directory.
    
    "deps": ["Altair/Core/Module"]          //core module is the first to load, 
};