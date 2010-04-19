$(function() {

    var fancybox_config = {
          ajax: {
            type: 'GET'
        }
        , padding: 20
        , width: 640
        , height: 480
    };

    // Bind dialog to links
    $('a.open-dialog').fancybox(fancybox_config);

    // Add archive functionality
    $('a.archive').live('click', function(e) {

        e.preventDefault();

        // Show confirm box
        if (!confirm('Do you want to archive this item?')) {
            return;
        }

        // Create form and submit
        var form = $('<form action="'+$(this).attr('href')+'" method="post"><input type="submit" /></form>');
        form.appendTo($('body'));
        form.submit();
    });

    // Expand parent and load children on click
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
            // On load complete

            // Append children to parent paragraph
            para.append(children);

            // Bind dialog to links
            $('a.open-dialog', children).fancybox(fancybox_config);
        });

    });

});
