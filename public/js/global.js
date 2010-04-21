$(function() {

    function setup_items(par) {

        // Setup fancyboxes
        $('a.open-dialog', par).fancybox({
              ajax: {
                type: 'GET'
            }
            , padding: 20
            , width: 640
            , height: 480
        });

        // Find urls and add links
        $('.parent', par).each(function() {
            var content = $(this).html();

            matches = content.match(/(http:\/\/[^ ]+)/g);
            for (match in matches) {
                $(this).after(' <a target="_blank" href="'+matches[match]+'" title="'+matches[match]+'">^</a> ');
            }
        });
    }

    setup_items($('body'));

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

            // Bind dialog to links, and setup other stuff
            setup_items(children);
        });

    });

});
