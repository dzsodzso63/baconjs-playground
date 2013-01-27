class window.Zebra extends DisplayObject
  constructor: (@canvas) ->
    @domId = 'b_' + @canvas + '_b_zebra'
    @createObject()
    @createStreams()

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

  model: (model) =>
    if model?
      @model = model
      @selectObjectBus = model.selectedObject
      @currentObject = Bacon.latestValue(@selectObjectBus)
      @selectObjectBus.flatMapLatest((obj)=> obj?.moveStream || Bacon.never()).onValue(@followMove)
    @model

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
    document_click = $("##{@canvas}").asEventStream("click").map((event)=> $(event.target).closest('div'))
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
