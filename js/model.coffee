class window.Obj
  @prefix: "object_"
  @objectByDomId: {}
  constructor: (@canvas, @id, @left, @top, @width, @height) ->
    @domId = 'b_' + @canvas + '_' + Obj.prefix + @id
    @createObject()
    @size(@width, @height)
    @position(@left, @top)
    @rotation(0)
    Obj.objectByDomId[@domId] = @

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

  color: (color) ->
    @domObject().css('background-color', color) if color
    @domObject().css('background-color')

  size: (to_width, to_height) ->
    if to_width? and to_height?
      @position(@left-((to_width - @width) / 2), @top-((to_height - @height) / 2))
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

  position: (to_left, to_top) ->
    if to_left? and to_top?
      @left = to_left
      @top = to_top
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
