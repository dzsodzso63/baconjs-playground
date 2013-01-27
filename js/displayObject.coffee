class window.DisplayObject
  domObject: ->
    $("##{@domId}")

  centerToObject: (targetObject) =>
    center = {
      x: targetObject.offset().left + (targetObject.width()  / 2)
      y: targetObject.offset().top  + (targetObject.height() / 2)
    }
    @moveObject(center.x - @domObject().width() / 2, center.y - @domObject().height() / 2);

  moveObject: (x, y) =>
    @domObject()
      .css('left', Math.round(x))
      .css('top', Math.round(y))