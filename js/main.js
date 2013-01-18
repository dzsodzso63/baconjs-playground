var selectedObject, zebraButtonAvailable;

$(function() {
    var transform = createTransformStream(),
        move = transform.filter(transformFunctionFilter("move")),
        scale = transform.filter(transformFunctionFilter("scale")),
        rotate = transform.filter(transformFunctionFilter("rotate")),
        zebra_streams = createZebraStreams(),
        delete_command = createDeleteStream();

    createObjects(10, "object_");

    zebra_streams.show.onValue(function(object){
        centerObjectToObject($("#b_zebra"), object.parent());
        $("#b_zebra").fadeIn(100);
        selectedObject = object;
    });
    zebra_streams.hide.merge(delete_command).onValue(function(object){
        $("#b_zebra").fadeOut(100);
    });

    move.onValue(function(params){
        var startCurPos = params[0][0],
            startObjPos = params[0][1],
            curPos      = params[1],
            object      = params[0][3];
        moveObject(object.parent(), startObjPos.left + (curPos.x - startCurPos.x), startObjPos.top + (curPos.y - startCurPos.y));
        centerObjectToObject($("#b_zebra"), object.parent());
        rePositionWrapper(object);
    });
    scale.onValue(function(params){
        var startCurPos  = params[0][0],
            startObjSize = params[0][2],
            object       = params[0][3],
            curPos       = params[1],
            scale, wrapperSize;
        scale = Math.pow(3,((curPos.x - startCurPos.x)/1000));
        resizeObject(object, startObjSize.width * scale, startObjSize.height * scale);
        wrapperSize = Math.round(Math.sqrt(Math.pow(object.width(),2)+Math.pow(object.height(),2)));
        resizeObject(object.parent(), wrapperSize, wrapperSize);
        rePositionWrapper(object);
    });
    rotate.onValue(function(params){
        var startCurPos = params[0][0],
            object      = params[0][3],
            curPos      = params[1],
            radAngle, degreeAngle;
        radAngle = Math.atan2((curPos.y - startCurPos.y), (curPos.x - startCurPos.x));
        degreeAngle = radAngle * 180.0 / Math.PI;
        rotateObject(object, degreeAngle);
    });
    delete_command.onValue(function(){
        selectedObject.parent().fadeOut(300, function(){ $(this).remove();});;
    });
});

function createZebraStreams(){
    var document_click = $(document).asEventStream("click").map(function(event){return $(event.target).closest('div');}),
        object_click = document_click.filter(function(object){return object.hasClass("transformable")}),
        outside_click = document_click.filter(function(object){return !object.hasClass("transformable") && !object.hasClass("z");}),
        zebra_visible = function(){return $("#b_zebra").is(':visible');},
        show_zebra = object_click.filter(function(obj){return !zebra_visible() || (obj[0]!=selectedObject[0]);}),
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
                selectedObject.parent().offset(),
                {width: selectedObject.width(), height: selectedObject.height()},
                selectedObject
            ];
        });
    function_ended.onValue(function(){
        _isTransforming = false;
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

function rotateObject(object, degree) {
    object.css({
        '-webkit-transform': 'rotate(' + degree + 'deg)',
        '-moz-transform': 'rotate(' + degree + 'deg)',
        '-ms-transform': 'rotate(' + degree + 'deg)',
        '-o-transform': 'rotate(' + degree + 'deg)',
        'transform': 'rotate(' + degree + 'deg)'
    });
}

function createObjects(n, prefix){
    var i, color,
        top, left, width, height, size;
    for(i=0;i<n;i++){
        color = get_random_color();
        top = Math.round(Math.random()*(window.innerHeight-100));
        left = Math.round(Math.random()*(window.innerWidth-200));
        height = Math.round(Math.random()*(window.innerHeight-top)/2)+30;
        width = Math.round(Math.random()*(window.innerWidth-left)/3)+60;
        size = Math.round(Math.sqrt(Math.pow(width,2)+Math.pow(height,2)));
        $("body").prepend('<div id="b_object'+i+'_wrapper" class="wrapper" style="'+
            "top:"+top+"px;"+
            "left:"+left+"px;"+
            "height:"+size+"px;"+
            "width:"+size+"px;"+
            '"><div id="b_object'+i+'" class="display_area transformable" style="'+
            "background-color:"+color+";"+
            "height:"+height+"px;"+
            "line-height:"+height+"px;"+
            "width:"+width+"px;"+
            '"><span>'+prefix+(i+1)+'</span></div></div>');
        rePositionWrapper($("#b_object"+i));
    }
}

function rePositionWrapper(object){
    var wrapper = object.parent();
    object.css('top', (wrapper.height()-object.height())/2).css('left', (wrapper.width()-object.width())/2);
}

function get_random_color() {
    var letters = '0123456789ABCDEF'.split(''), color = '#', i;
    for (i = 0; i < 6; i++ ) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}