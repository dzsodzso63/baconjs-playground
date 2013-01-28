class window.Zebra extends DisplayObject
  constructor: (@canvas, @model) ->
    @domId = 'b_' + @canvas + '_b_zebra'
    @createObject()
    @createStreams()
    @selectObjectBus = model.selectedObject
    @currentObject = Bacon.latestValue(@selectObjectBus)
    @selectObjectBus.flatMapLatest((obj)=> obj?.moveStream || Bacon.never()).onValue(@followMove)
    @transformStream = @createTransformStream()
    model.transformStream(@transformStream)

  createObject: =>
    $("##{@canvas}").prepend('<div id="' + @domId + '" class="zebra display_area z" style="display: none;">
    		        <div class="zebra-container z">
    		            <div id="b_z_move" class="display_area z z_button transform_aea" data-function="move"><span>Move</span></div>
    		            <div id="b_z_scale" class="display_area z z_button transform_aea" data-function="scale"><span>Scale</span></div>
    		            <div id="b_z_rotate" class="display_area z z_button transform_aea" data-function="rotate"><span>Rotate</span></div>
    		            <div id="b_z_delete" class="display_area z z_button delete_button" data-function="delete"><span>Delete</span></div>
    		        </div>
    	        </div>
    ')

  displayStreams: (streams) =>
    if streams?.show?
      @showStream = streams.show
      @showStream.onValue(@show)
    if streams?.hide?
      @hideStream = streams.hide
      @hideStream.onValue(@hide)
    {show: @showStream, hide: @hideStream}

  followMove: (obj) =>
    @centerToObject(@currentObject()?.domObject()?.parent())

  show: (obj) =>
    @centerToObject(obj.parent())
    @domObject().fadeIn(100)
    @selectObjectBus.push(@model.objectByDomId[obj.attr('id')])

  hide: =>
    @selectObjectBus.push(null)
    @domObject().fadeOut(100)

  createStreams: =>
    document_click = @scope().asEventStream("click").map((event)=> $(event.target).closest('div'))
    object_click = document_click.filter((object)=> object.hasClass("transformable"))
    outside_click = document_click.filter((object)=> !object.hasClass("transformable") && !object.hasClass("z"))
    zebra_visible = => @domObject().is(':visible')
    show_zebra = object_click.filter((obj)=> !zebra_visible() || (obj[0]!=@currentObject().domObject()[0]))
    remove_zebra = outside_click.filter(=> zebra_visible())
    zebraButtonAvailable = (
      show_zebra
        .delay(300)
        .map(true)
        .merge(remove_zebra.map(false))
        .toProperty(false)
    )
    deleteStream = $("##{@domId} .delete_button")
      .asEventStream("click")
      .filter(zebraButtonAvailable)
    deleteStream.onValue(@deleteObject)
    @displayStreams({
      show: show_zebra
      hide: remove_zebra
    })

  deleteObject: =>
    @currentObject().deleteStream.push()
    @hide()

  scope: =>
    $("##{@canvas}")

  createTransformStream: =>
    transforming = new Bacon.Bus()
    isTransforming = transforming.toProperty(false)
    mouse_position = @scope().asEventStream("mousemove").merge($(document).asEventStream("mousedown")).map((event)=> {x: event.clientX, y: event.clientY}).toProperty({x: 0, y: 0})
    mouse_up = @scope().asEventStream("mouseup").map(false)
    mouse_down = @scope().asEventStream("mousedown").map(true)
    mouse_button_pressed = mouse_up.merge(mouse_down).toProperty(false)
    mouse_enter = $(".transform_aea").asEventStream("mouseenter").map((event)=> $(event.target).closest('div').attr('data-function'))
    mouse_leave = $(".transform_aea").asEventStream("mouseleave").map(null)
    current_button = mouse_enter.merge(mouse_leave).toProperty(null)
    function_started = current_button.sampledBy(mouse_down.filter(current_button)).toProperty()
    drag = mouse_position.changes().filter(mouse_button_pressed).filter(isTransforming)
    function_ended = mouse_up.filter(isTransforming)
    start_state = function_started.changes().map(mouse_position).map((pos) =>
      {
        startMousePos: pos
        startObjectPos: currentObject().position()
        startObjectSize: {width: currentObject().domObject().width(), height: currentObject().domObject().height()}
      }
    )
    startMousePos = mouse_position.sampledBy(mouse_down)
    currentObject = Bacon.latestValue(Obj.selectedObject)

    function_ended.onValue( =>
      transforming.push(false)
      currentObject().transformDoneStream?.push()
    )

    function_started.onValue((func) =>
      transforming.push(true)
    )
    (
      Bacon.combineTemplate({
        startState: start_state
        cursorPosition: drag
        type: function_started
          .changes()
          .filter(function_started)
        })
          .filter(isTransforming)
          .toProperty()
          .sampledBy($(document).asEventStream("mousemove"))
          .filter(isTransforming)
    )
