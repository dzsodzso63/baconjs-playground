$(function() {
    var
        zebra = new Zebra("col_1"),
        transform = createTransformStream();

    zebra.model(Obj);
    Obj.transformStream(transform);
    Obj.loadAll();

    $("#col_1_add_object").asEventStream("click").onValue(function(){
        createObject("col_1");
    });

});

function createTransformStream(){
    var transforming = (new Bacon.Bus()),
        isTransforming = transforming.toProperty(false),
        mouse_position = $(document).asEventStream("mousemove").merge($(document).asEventStream("mousedown")).map(function(event) { return {x: event.clientX, y: event.clientY}; }).toProperty({x: 0, y: 0}),
        mouse_up = $(document).asEventStream("mouseup").map(false),
        mouse_down = $(document).asEventStream("mousedown").map(true),
        mouse_button_pressed = mouse_up.merge(mouse_down).toProperty(false),
        mouse_enter = $(".transform_aea").asEventStream("mouseenter").map(function(event){return $(event.target).closest('div').attr('data-function');}),
        mouse_leave = $(".transform_aea").asEventStream("mouseleave").map(null),
        current_button = mouse_enter.merge(mouse_leave).toProperty(null),
        function_started = current_button.sampledBy(mouse_down.filter(current_button)).toProperty(),
        drag = mouse_position.changes().filter(mouse_button_pressed).filter(isTransforming),
        function_ended = mouse_up.filter(isTransforming),
        start_state = function_started.changes().map(mouse_position).map(function(pos){
            return {
                startMousePos: pos,
                startObjectPos: currentObject().position(),
                startObjectSize: {width: currentObject().domObject().width(), height: currentObject().domObject().height()}
            };
        }),
        startMousePos = mouse_position.sampledBy(mouse_down),
        currentObject = Bacon.latestValue(Obj.selectedObject);

    function_ended.onValue(function(){
        transforming.push(false);
        currentObject().persistStream.push()
    });
    function_started.onValue(function(func){
        transforming.push(true);
    });
    return (
        Bacon.combineTemplate({
            startState: start_state,
            cursorPosition: drag,
            type: function_started
                .changes()
                .filter(function_started)
        })
            .filter(isTransforming)
            .toProperty()
            .sampledBy($(document).asEventStream("mousemove"))
            .filter(isTransforming)
    );
}

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