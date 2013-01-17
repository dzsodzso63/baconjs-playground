
$(function() {
    var isTransforming = false;
    var document_click = $(document).asEventStream("click").map(function(event){return $(event.target).closest('div');});
    var object_click = document_click.filter(function(object){return object[0] == $("#b_object")[0];});
    var outside_click = document_click.filter(function(object){return object[0] != $("#b_object")[0] && !object.hasClass("z");});
    var mouse_position = $(document).asEventStream("mousemove").map(function(event) { return {x: event.clientX, y: event.clientY}; }).toProperty({x: 0, y: 0});
    var zebra_visible = function(){return $("#b_zebra").is(':visible');};
    var show_zebra = object_click.filter(function(){return !zebra_visible();});
    var remove_zebra = outside_click.filter(function(){return zebra_visible();});
    var mouse_up = $(document).asEventStream("mouseup").map(false);
    var mouse_down = $(document).asEventStream("mousedown").map(true);
    var mouse_button = mouse_up.merge(mouse_down).toProperty(false);
    var mouse_enter = $(".z_button").asEventStream("mouseenter").map(function(event){return $(event.target).closest('div').attr('data-function');});
    var mouse_leave = $(".z_button").asEventStream("mouseleave").map(null);
    var current_button = mouse_enter.merge(mouse_leave).toProperty(null);
    var function_started = current_button.sampledBy(mouse_down.filter(current_button)).toProperty();
    var drag = mouse_position.changes().filter(mouse_button).filter(function(){return isTransforming;});
    var function_ended = mouse_up.filter(function(){return isTransforming;});
    var start_state = function_started.changes().map(mouse_position);
    var transform = Bacon.combineAsArray(start_state, drag, function_started.changes().filter(function_started));

    transform.onValue(function(origPos, pos, func){

    });
    function_ended.onValue(function(){
        isTransforming = false;
    });
    function_started.onValue(function(func){
        isTransforming = true;
    });
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