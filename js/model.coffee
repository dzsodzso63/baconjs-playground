class window.Obj extends DisplayObject
  @prefix: "object_"
  @objectByDomId: {}
  @Transform: {move: "move", scale: "scale", rotate: "rotate"}
  @loadAll: ->
    for i in [0..Obj.objectCount()]
      @loadObject(i)
    FlashMessage.message "Objects loaded."

  @objectCount: ->
    localStorage.getItem("object_count") || 0
  @storeKey: (id) ->
    "object_" + id
  @loadObject: (id) ->
    jsonData = localStorage.getItem(Obj.storeKey(id))
    if jsonData
      o = JSON.parse(jsonData)
      obj = new Obj(o.canvas, id, o.left, o.top, o.width, o.height, o.colorCode, o.deg)
  @transformStream: (trans) =>
    if trans?
      @globalTransformStream = trans
    @globalTransformStream
  @selectedObject: (new Bacon.Bus())

  constructor: (@canvas, @id, @left, @top, @width, @height, @colorCode, @deg) ->
    isNew = false
    if !@id
      @id = parseInt(Obj.objectCount(), 10) + 1
      isNew = true
    @domId = 'b_' + @canvas + '_' + Obj.prefix + @id
    @createObject()
    @size({width: @width, height: @height})
    @position({left: @left, top: @top})
    @rotation({deg: @deg || 0})
    @color(@colorCode)
    @createStreams()
    @persistStream.push() if isNew
    Obj.objectByDomId[@domId] = @

  createStreams: =>
    @persistStream = (new Bacon.Bus())
    @persistStream.onValue(@persist)
    @selectionFilter = Obj.selectedObject.map((obj) => obj?.id == @id).toProperty()
    @transformStream(Obj.globalTransformStream.filter(@selectionFilter))
    @deleteStream = new Bacon.Bus()
    @deleteStream.onValue(@deleteThis)

  transformStream: (stream) =>
    if stream?
      @_transformStream = stream
      @moveStream = @_transformStream.filter((trans)-> return (trans.type==Obj.Transform.move))
      @scaleStream = @_transformStream.filter((trans)-> return (trans.type==Obj.Transform.scale))
      @rotateStream = @_transformStream.filter((trans)-> return (trans.type==Obj.Transform.rotate))
      @moveStream.onValue(@position)
      @scaleStream.onValue(@size)
      @rotateStream.onValue(@rotation)
    @_transformStream

  wrapperSize: ->
    Math.round(Math.sqrt(Math.pow(@width,2)+Math.pow(@height,2)))

  rePositionInWrapper: ->
    @moveObject(((@wrapperSize()-@width) / 2), ((@wrapperSize()-@height) / 2))

  createObject: ->
    $("##{@canvas}").prepend(
      '<div id="' + @domId + '_wrapper" class="wrapper" style="">'+
      '<div id="' + @domId + '" class="display_area transformable" style="'+
      '"><span>'+Obj.prefix+(@id+1)+'</span></div></div>'
    )

  color: (colorCode) ->
    if colorCode?
      @colorCode = colorCode
      @domObject().css('background-color', @colorCode)
    @colorCode

  size: (to) =>
    if to?
      if to.width? and to.height?
        @position({left: @left-((to.width - @width) / 2), top: @top-((to.height - @height) / 2)})
        @width = to.width
        @height = to.height
      else
        scale = Math.pow(3,((to.cursorPosition.x - to.startState.startMousePos.x) / 1000));
        to_width = to.startState.startObjectSize.width * scale
        to_height = to.startState.startObjectSize.height * scale
        @position({left: @left-((to_width - @width) / 2), top: @top-((to_height - @height) / 2)})
        @width = to_width
        @height = to_height
      @domObject()
        .css('width', Math.round(@width))
        .css('height', Math.round(@height))
        .css('line-height', Math.round(@height) + 'px')
      @domObject().parent()
        .css('width', @wrapperSize())
        .css('height', @wrapperSize())
    {width: @width, height: @height}

  position: (to) =>
    if to?
      if to.left? and to.top?
        @left = to.left
        @top = to.top
      else
        @left = to.startState.startObjectPos.left + (to.cursorPosition.x - to.startState.startMousePos.x)
        @top = to.startState.startObjectPos.top + (to.cursorPosition.y - to.startState.startMousePos.y)
      @domObject().parent()
        .css('left', Math.round(@left-(@wrapperSize() - @width) / 2))
        .css('top', Math.round(@top-(@wrapperSize() - @height) / 2))
      @rePositionInWrapper()
    {left: @left, top: @top}

  rotation: (to) =>
    if to?
      if to.deg?
        @deg = to.deg
      else
        radAngle = Math.atan2((to.cursorPosition.y - to.startState.startMousePos.y), (to.cursorPosition.x - to.startState.startMousePos.x));
        @deg = radAngle * 180.0 / Math.PI;
      @domObject().css({
        '-webkit-transform': 'rotate(' + @deg + 'deg)'
        '-moz-transform': 'rotate(' + @deg + 'deg)'
        '-ms-transform': 'rotate(' + @deg + 'deg)'
        '-o-transform': 'rotate(' + @deg + 'deg)'
        'transform': 'rotate(' + @deg + 'deg)'
      })
    @deg

  toJSON: =>
    {
      canvas: @canvas
      id: @id
      left: @left
      top: @top
      width: @width
      height: @height
      colorCode: @colorCode
      deg: @deg
    }

  storeKey: ->
    Obj.storeKey(@id)

  persist: =>
    jsonData = JSON.stringify(@)
    localStorage.setItem(@storeKey(), jsonData)
    if @id > Obj.objectCount()
      localStorage.setItem("object_count", @id)
    FlashMessage.message "Saved."

  deleteThis: =>
    @domObject().parent().fadeOut(300, ->
      $(this).remove()
    )
    localStorage.removeItem(@storeKey())
    FlashMessage.message "Object deleted."
