// Generated by CoffeeScript 1.3.3
(function() {

  window.FlashMessage = (function() {

    function FlashMessage() {}

    FlashMessage.target = function(domObject) {
      FlashMessage.domObject = domObject;
    };

    FlashMessage.message = function(text) {
      FlashMessage.domObject.html(text);
      return FlashMessage.domObject.fadeIn(200).delay(1200).fadeOut(1000);
    };

    return FlashMessage;

  }).call(this);

}).call(this);