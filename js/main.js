var selectedObject, zebraButtonAvailable;

$(function() {
    var transform = createTransformStream(),
        move = transform.filter(transformFunctionFilter("move")),
        scale = transform.filter(transformFunctionFilter("scale")),
        rotate = transform.filter(transformFunctionFilter("rotate")),
        zebra_streams = createZebraStreams("#col_1"),
        delete_command = createDeleteStream();

    Obj.loadAll();
    $("#col_1_add_object").asEventStream("click").onValue(function(){
        createObjects(1, "col_1");
    });
    zebra_streams.show.onValue(function(object){
        centerObjectToObject($("#b_zebra"), object.parent());
        $("#b_zebra").fadeIn(100);
        selectedObject = Obj.objectByDomId[object.attr('id')];
        //console.log(selectedObject);
    });
    zebra_streams.hide.merge(delete_command).onValue(function(object){
        $("#b_zebra").fadeOut(100);
    });

    move.onValue(function(params){
        var startCurPos = params[0][0],
            startObjPos = params[0][1],
            curPos      = params[1],
            object      = params[0][3];
        selectedObject.moveStream.push({left: startObjPos.left + (curPos.x - startCurPos.x), top: startObjPos.top + (curPos.y - startCurPos.y)});
        centerObjectToObject($("#b_zebra"), object.parent());
    });
    scale.onValue(function(params){
        var startCurPos  = params[0][0],
            startObjSize = params[0][2],
            object       = params[0][3],
            curPos       = params[1],
            scale, wrapperSize;
        scale = Math.pow(3,((curPos.x - startCurPos.x)/1000));
        selectedObject.size(startObjSize.width * scale, startObjSize.height * scale);
    });
    rotate.onValue(function(params){
        var startCurPos = params[0][0],
            object      = params[0][3],
            curPos      = params[1],
            radAngle, degreeAngle;
        radAngle = Math.atan2((curPos.y - startCurPos.y), (curPos.x - startCurPos.x));
        degreeAngle = radAngle * 180.0 / Math.PI;
        selectedObject.rotation(degreeAngle);
    });
    delete_command.onValue(function(){
        selectedObject.delete();
    });
});

function createZebraStreams(zebraBlock){
    var document_click = $(zebraBlock).asEventStream("click").map(function(event){return $(event.target).closest('div');}),
        object_click = document_click.filter(function(object){return object.hasClass("transformable")}),
        outside_click = document_click.filter(function(object){return !object.hasClass("transformable") && !object.hasClass("z");}),
        zebra_visible = function(){return $("#b_zebra").is(':visible');},
        show_zebra = object_click.filter(function(obj){return !zebra_visible() || (obj[0]!=selectedObject.domObject()[0]);}),
        remove_zebra = outside_click.filter(function(){return zebra_visible();});
    zebraButtonAvailable = (
        show_zebra
            .delay(300)
            .map(true)
            .merge(remove_zebra.map(false))
            .toProperty(false)
        );
    return {
        show: show_zebra,
        hide: remove_zebra
    };
}

function createTransformStream(){
    var _isTransforming = false,
        isTransforming = function(){return _isTransforming;},
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
            return [
                pos,
                selectedObject.position(),
                {width: selectedObject.domObject().width(), height: selectedObject.domObject().height()},
                selectedObject.domObject()
            ];
        });
    function_ended.onValue(function(){
        _isTransforming = false;
        selectedObject.persistStream.push()
    });
    function_started.onValue(function(func){
        _isTransforming = true;
    });
    return (Bacon.combineAsArray(start_state, drag,
            function_started
                .changes()
                .filter(function_started)
            )
        .filter(isTransforming)
        .toProperty()
        .sampledBy($(document).asEventStream("mousemove"))
        .filter(isTransforming)
    );
}

function createDeleteStream(){
    return (
        $(".delete_button")
            .asEventStream("click")
            .filter(zebraButtonAvailable)
    );
}

function transformFunctionFilter(func){
    return (function(params){
        return params[2] === func;
    })
}

function centerObjectToObject(objectToCenter, objectBase){
    var center = {
        x: objectBase.offset().left + (objectBase.width()  / 2),
        y: objectBase.offset().top  + (objectBase.height() / 2)
    };
    moveObject(objectToCenter, center.x - objectToCenter.width() / 2, center.y - objectToCenter.height() / 2);
}

function moveObject(object, x, y){
    object.css('left', x);
    object.css('top', y);
}

function resizeObject(object, w, h){
    var origLeft   = object.offset().left,
        origTop    = object.offset().top,
        origWidth  = object.width(),
        origHeight = object.height();
    moveObject(object, origLeft-((w-origWidth)/2), origTop-((h-origHeight)/2));
    object.css('width', Math.round(w));
    object.css('height', Math.round(h));
    object.css('line-height', Math.round(h) + "px");
}

function createObjects(n, block){
    var i, color, obj,
        top, left, width, height, size;
    for(i=0;i<n;i++){
        color = get_random_color();
        top = Math.round(Math.random()*(window.innerHeight-100));
        left = Math.round(Math.random()*($("#" + block).width()-200));
        height = Math.round(Math.random()*(window.innerHeight-top)/2)+30;
        width = Math.round(Math.random()*($("#" + block).width()-left)/3)+60;

        obj = new Obj(block, i, left, top, width, height, color);
    }
}

function get_random_color() {
    var letters = '0123456789ABCDEF'.split(''), color = '#', i;
    for (i = 0; i < 6; i++ ) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}