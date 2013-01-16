$(function() {
    var clicks = $("#b_object").asEventStream("click");
    clicks.log();
});
