define("altair/config", null, function (dojo) {
    return {
        load: function(id, require, load){
           console.log('load: ', id);
        },
        normalize: function(id, toAbsMid){

            var path = id.split('.json')[0];

            console.log(dojo);

            return '';


            return 'poop';
            console.log('normalize', arguments);
            return id;
        }};
});
