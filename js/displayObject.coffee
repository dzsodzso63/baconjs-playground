class window.DisplayObject
  domObject: ->
    $("##{@domId}")

  centerToObject: (targetObject) =>
    center = {
      x: parseInt(targetObject.css('left'), 10) + (targetObject.width()  / 2)
      y: parseInt(targetObject.css('top'), 10)  + (targetObject.height() / 2)
    }
    @moveObject(center.x - @domObject().width() / 2, center.y - @domObject().height() / 2);

  moveObject: (x, y) =>
    @domObject()
      .css('left', Math.round(x))
      .css('top', Math.round(y))