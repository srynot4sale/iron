$(function() {

    $('a.open-dialog').fancybox({
        ajax: {
            type: 'GET'
        },
        padding: 20,
        width: 640,
        height: 480,
    });

    $('a.parent').live('click', function(e) {

        e.preventDefault();

        var link = $(this);
        var para = link.parent();

        // If children div exists, remove
        if ($('div.children', para).size()) {
            $('div.children', para).remove();
            return;
        }

        // Otherwise, create a new one and insert ajax result
        var children = $('<div class="children"></div>');
        children.load(link.attr('href'), function() {
            para.append(children);
        });

    });

});
