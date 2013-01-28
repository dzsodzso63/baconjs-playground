// Generated by CoffeeScript 1.3.3
(function() {
  var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  window.Zebra = (function(_super) {

    __extends(Zebra, _super);

    function Zebra(canvas, model) {
      var _this = this;
      this.canvas = canvas;
      this.model = model;
      this.createTransformStream = __bind(this.createTransformStream, this);

      this.scope = __bind(this.scope, this);

      this.deleteObject = __bind(this.deleteObject, this);

      this.createStreams = __bind(this.createStreams, this);

      this.hide = __bind(this.hide, this);

      this.show = __bind(this.show, this);

      this.followMove = __bind(this.followMove, this);

      this.displayStreams = __bind(this.displayStreams, this);

      this.createObject = __bind(this.createObject, this);

      this.domId = 'b_' + this.canvas + '_b_zebra';
      this.createObject();
      this.createStreams();
      this.selectObjectBus = model.selectedObject;
      this.currentObject = Bacon.latestValue(this.selectObjectBus);
      this.selectObjectBus.flatMapLatest(function(obj) {
        return (obj != null ? obj.moveStream : void 0) || Bacon.never();
      }).onValue(this.followMove);
      this.transformStream = this.createTransformStream();
      model.transformStream(this.transformStream);
    }

    Zebra.prototype.createObject = function() {
      return $("#" + this.canvas).prepend('<div id="' + this.domId + '" class="zebra display_area z" style="display: none;">\
    		        <div class="zebra-container z">\
    		            <div id="b_z_move" class="display_area z z_button transform_aea" data-function="move"><span>Move</span></div>\
    		            <div id="b_z_scale" class="display_area z z_button transform_aea" data-function="scale"><span>Scale</span></div>\
    		            <div id="b_z_rotate" class="display_area z z_button transform_aea" data-function="rotate"><span>Rotate</span></div>\
    		            <div id="b_z_delete" class="display_area z z_button delete_button" data-function="delete"><span>Delete</span></div>\
    		        </div>\
    	        </div>\
    ');
    };

    Zebra.prototype.displayStreams = function(streams) {
      if ((streams != null ? streams.show : void 0) != null) {
        this.showStream = streams.show;
        this.showStream.onValue(this.show);
      }
      if ((streams != null ? streams.hide : void 0) != null) {
        this.hideStream = streams.hide;
        this.hideStream.onValue(this.hide);
      }
      return {
        show: this.showStream,
        hide: this.hideStream
      };
    };

    Zebra.prototype.followMove = function(obj) {
      var _ref, _ref1;
      return this.centerToObject((_ref = this.currentObject()) != null ? (_ref1 = _ref.domObject()) != null ? _ref1.parent() : void 0 : void 0);
    };

    Zebra.prototype.show = function(obj) {
      this.centerToObject(obj.parent());
      this.domObject().fadeIn(100);
      return this.selectObjectBus.push(this.model.objectByDomId[obj.attr('id')]);
    };

    Zebra.prototype.hide = function() {
      this.selectObjectBus.push(null);
      return this.domObject().fadeOut(100);
    };

    Zebra.prototype.createStreams = function() {
      var deleteStream, document_click, object_click, outside_click, remove_zebra, show_zebra, zebraButtonAvailable, zebra_visible,
        _this = this;
      document_click = this.scope().asEventStream("click").map(function(event) {
        return $(event.target).closest('div');
      });
      object_click = document_click.filter(function(object) {
        return object.hasClass("transformable");
      });
      outside_click = document_click.filter(function(object) {
        return !object.hasClass("transformable") && !object.hasClass("z");
      });
      zebra_visible = function() {
        return _this.domObject().is(':visible');
      };
      show_zebra = object_click.filter(function(obj) {
        return !zebra_visible() || (obj[0] !== _this.currentObject().domObject()[0]);
      });
      remove_zebra = outside_click.filter(function() {
        return zebra_visible();
      });
      zebraButtonAvailable = show_zebra.delay(300).map(true).merge(remove_zebra.map(false)).toProperty(false);
      deleteStream = $("#" + this.domId + " .delete_button").asEventStream("click").filter(zebraButtonAvailable);
      deleteStream.onValue(this.deleteObject);
      return this.displayStreams({
        show: show_zebra,
        hide: remove_zebra
      });
    };

    Zebra.prototype.deleteObject = function() {
      this.currentObject().deleteStream.push();
      return this.hide();
    };

    Zebra.prototype.scope = function() {
      return $("#" + this.canvas);
    };

    Zebra.prototype.createTransformStream = function() {
      var currentObject, current_button, drag, function_ended, function_started, isTransforming, mouse_button_pressed, mouse_down, mouse_enter, mouse_leave, mouse_position, mouse_up, startMousePos, start_state, transforming,
        _this = this;
      transforming = new Bacon.Bus();
      isTransforming = transforming.toProperty(false);
      mouse_position = this.scope().asEventStream("mousemove").merge($(document).asEventStream("mousedown")).map(function(event) {
        return {
          x: event.clientX,
          y: event.clientY
        };
      }).toProperty({
        x: 0,
        y: 0
      });
      mouse_up = this.scope().asEventStream("mouseup").map(false);
      mouse_down = this.scope().asEventStream("mousedown").map(true);
      mouse_button_pressed = mouse_up.merge(mouse_down).toProperty(false);
      mouse_enter = $(".transform_aea").asEventStream("mouseenter").map(function(event) {
        return $(event.target).closest('div').attr('data-function');
      });
      mouse_leave = $(".transform_aea").asEventStream("mouseleave").map(null);
      current_button = mouse_enter.merge(mouse_leave).toProperty(null);
      function_started = current_button.sampledBy(mouse_down.filter(current_button)).toProperty();
      drag = mouse_position.changes().filter(mouse_button_pressed).filter(isTransforming);
      function_ended = mouse_up.filter(isTransforming);
      start_state = function_started.changes().map(mouse_position).map(function(pos) {
        return {
          startMousePos: pos,
          startObjectPos: currentObject().position(),
          startObjectSize: {
            width: currentObject().domObject().width(),
            height: currentObject().domObject().height()
          }
        };
      });
      startMousePos = mouse_position.sampledBy(mouse_down);
      currentObject = Bacon.latestValue(Obj.selectedObject);
      function_ended.onValue(function() {
        var _ref;
        transforming.push(false);
        return (_ref = currentObject().transformDoneStream) != null ? _ref.push() : void 0;
      });
      function_started.onValue(function(func) {
        return transforming.push(true);
      });
      return Bacon.combineTemplate({
        startState: start_state,
        cursorPosition: drag,
        type: function_started.changes().filter(function_started)
      }).filter(isTransforming).toProperty().sampledBy($(document).asEventStream("mousemove")).filter(isTransforming);
    };

    return Zebra;

  })(DisplayObject);

}).call(this);
