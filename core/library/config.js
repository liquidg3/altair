define("altair/config", function (dojo) {
    return {
        load: function(id, require, load){
           console.log('load: ', id);
        },
        normalize: function(id, toAbsMid){

            console.log(id);
            var path = id.split('.json')[0];

            console.log(dojo);

//            return '';


//            return 'poop';
            console.log('normalize', arguments);
            return id;
        }};
});
