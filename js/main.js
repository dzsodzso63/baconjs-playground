
$(function() {
    var document_click = $(document).asEventStream("click").map(function(event){return $(event.target).closest('div');});
    var object_click = document_click.filter(function(object){return object[0] == $("#b_object")[0];});
    var outside_click = document_click.filter(function(object){return object[0] != $("#b_object")[0];});
    var mouse_position = $(document).asEventStream("mousemove").map(function(event) { return {x: event.clientX, y: event.clientY}; }).toProperty({x: 0, y: 0});
    var zebra_visible = function(){return $("#b_zebra").is(':visible');};
    var show_zebra = object_click.filter(function(){return !zebra_visible();});
    var remove_zebra = outside_click.filter(function(){return zebra_visible();});
    show_zebra.onValue(function(object){
        centerObjectToObject($("#b_zebra"), object);
        $("#b_zebra").fadeIn(100);
    });
    remove_zebra.onValue(function(object){
        $("#b_zebra").fadeOut(100);
    });
});

function centerObjectToObject(objectToCenter, objectBase){
    var center = {
        x: objectBase.offset().left + (objectBase.width()  / 2),
        y: objectBase.offset().top  + (objectBase.height() / 2)
    };
    objectToCenter.css("left", center.x - objectToCenter.width() / 2)
        .css("top", center.y - objectToCenter.height() / 2);
}