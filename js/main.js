$(function() {

    var zebra = new Zebra("col_1", Obj);

    Obj.loadAll();

    $("#col_1_add_object").asEventStream("click").onValue(function(){
        createObject("col_1");
    });

});

function createObject(block){
    var color, obj,
        top, left, width, height, size;

    color = get_random_color();
    top = Math.round(Math.random()*(window.innerHeight-100));
    left = Math.round(Math.random()*($("#" + block).width()-200));
    height = Math.round(Math.random()*(window.innerHeight-top)/2)+30;
    width = Math.round(Math.random()*($("#" + block).width()-left)/3)+60;

    obj = new Obj(block, null, left, top, width, height, color);
}

function get_random_color() {
    var letters = '0123456789ABCDEF'.split(''), color = '#', i;
    for (i = 0; i < 6; i++ ) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}