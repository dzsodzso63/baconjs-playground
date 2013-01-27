// Generated by CoffeeScript 1.3.3
(function() {
  var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  window.DisplayObject = (function() {

    function DisplayObject() {
      this.moveObject = __bind(this.moveObject, this);

      this.centerToObject = __bind(this.centerToObject, this);

    }

    DisplayObject.prototype.domObject = function() {
      return $("#" + this.domId);
    };

    DisplayObject.prototype.centerToObject = function(targetObject) {
      var center;
      center = {
        x: parseInt(targetObject.css('left'), 10) + (targetObject.width() / 2),
        y: parseInt(targetObject.css('top'), 10) + (targetObject.height() / 2)
      };
      return this.moveObject(center.x - this.domObject().width() / 2, center.y - this.domObject().height() / 2);
    };

    DisplayObject.prototype.moveObject = function(x, y) {
      return this.domObject().css('left', Math.round(x)).css('top', Math.round(y));
    };

    return DisplayObject;

  })();

}).call(this);