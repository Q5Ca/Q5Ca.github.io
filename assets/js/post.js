$(document).ready(function(){
    $("#page-wrapper #post-content img").addClass("mx-auto d-block img-fluid mb-3");
    $('img').each(function(i){
        this.alt = encodeURI(this.src.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/'/g, '&#39;').replace(/</g, '&lt;').replace(/>/g, '&gt;') );
        });
});