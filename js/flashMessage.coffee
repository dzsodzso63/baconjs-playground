class window.FlashMessage
  @target: (@domObject) =>

  @message: (text)=>
    FlashMessage.domObject.html(text)
    FlashMessage.domObject.fadeIn(300).delay(1200).fadeOut(600)