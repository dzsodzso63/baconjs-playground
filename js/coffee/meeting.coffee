class window.Meeting
  constructor: (@model, @baseCanvas, @targetCanvas) ->
    @notifyChangeStream = @model.notifyChangeStream.filter(@baseCanvasFilter)
    @notifyChangeStream.onValue(@onChange)

  baseCanvasFilter: (change) =>
    change.canvas == @baseCanvas

  onChange: (change) =>
    obj = change.object
    targetDomId = @model.domId(obj.id, @targetCanvas)
    targetObj = @model.objectByDomId[targetDomId]
    origObj = @model.objectByDomId[obj.domId]
    if targetObj?
      if origObj?
        @updateObject(obj, targetObj)
      else
        @deleteTargetObject(targetObj)
    else
      @createTargetObject(obj)

  createTargetObject: (obj) =>
    targetObj = new @model(@targetCanvas, obj.id, obj.left, obj.top, obj.width, obj.height, obj.colorCode, obj.deg)

  deleteTargetObject: (obj) =>
    obj.deleteStream.push()

  updateObject: (obj, targetObj) =>
    targetObj.size({width: obj.width, height: obj.height})
    targetObj.position({left: obj.left, top: obj.top})
    targetObj.rotation({deg: obj.deg})
    targetObj.color(obj.colorCode)

