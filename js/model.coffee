class window.Obj
  @prefix: "object_"
  @objectByDomId: {}
  @loadAll: ->
    for i in [0..Obj.objectCount()]
      @loadObject(i)
  @objectCount: ->
    localStorage.getItem("object_count") || 0
  @storeKey: (id) ->
    "object_" + id
  @loadObject: (id) ->
    jsonData = localStorage.getItem(Obj.storeKey(id))
    if jsonData
      o = JSON.parse(jsonData)
      obj = new Obj(o.canvas, id, o.left, o.top, o.width, o.height, o.colorCode, o.deg)

  constructor: (@canvas, @id, @left, @top, @width, @height, @colorCode, @deg) ->
    if !@id
      @id = parseInt(Obj.objectCount(),10) + 1
    @domId = 'b_' + @canvas + '_' + Obj.prefix + @id
    @createObject()
    @size(@width, @height)
    @position({left: @left, top: @top})
    @rotation(@deg || 0)
    @color(@colorCode)
    Obj.objectByDomId[@domId] = @
    @persistStream = (new Bacon.Bus())
    @persistStream.onValue(@persist)
    @persistStream.push()
    @moveStream = new Bacon.Bus()
    @moveStream.onValue(@position)

  wrapperSize: ->
    Math.round(Math.sqrt(Math.pow(@width,2)+Math.pow(@height,2)))

  rePositionInWrapper: ->
    @positionInWrapper(((@wrapperSize()-@height) / 2),  ((@wrapperSize()-@width) / 2))

  domObject: ->
    $("##{@domId}")

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

  size: (to_width, to_height) ->
    if to_width? and to_height?
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
    if to? and to.left? and to.top?
      @left = to.left
      @top = to.top
      @domObject().parent()
        .css('left', Math.round(@left-(@wrapperSize() - @width) / 2))
        .css('top', Math.round(@top-(@wrapperSize() - @height) / 2))
      @rePositionInWrapper()
    {left: @left, top: @top}

  positionInWrapper: (x,y)->
    @domObject()
      .css('top', Math.round(x))
      .css('left', Math.round(y))

  rotation: (degree)->
    if degree?
      @deg = degree
      @domObject().css({
        '-webkit-transform': 'rotate(' + degree + 'deg)'
        '-moz-transform': 'rotate(' + degree + 'deg)'
        '-ms-transform': 'rotate(' + degree + 'deg)'
        '-o-transform': 'rotate(' + degree + 'deg)'
        'transform': 'rotate(' + degree + 'deg)'
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

  delete: ->
    @domObject().parent().fadeOut(300, ->
      $(this).remove()
    )
    localStorage.removeItem(@storeKey())
