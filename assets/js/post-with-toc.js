$(document).ready(function(){
    $("#page-wrapper #post-content img").not(".emoji").addClass("mx-auto d-block img-fluid mb-3");
    $(window).on("hashchange", function(){scrollBy(0, -56.94);});
});
