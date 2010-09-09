var iron = {

    actions: {

        /**
         * Bind links in header navigation
         */
        bind_header_links: function() {

            var nav = $('ul#header-navigation');

            // New root node form
            $('a.open-dialog', nav).bind(
                'click',
                function () {
                    iron.actions.display_edit_form(0, 0);
                    return false;
                }
            );

        },


        /**
         * Display create/edit form for data items
         *
         * @param   itemid  Item's id, 0 = new
         * @param   parentid    Parent's id, 0 = root
         */
        display_edit_form: function(itemid, parentid) {

            // Get form
            var form = $('div#edit-item');

            // Clear data in form
            $('textarea', form).html('');

            // Save ids
            $('#edit-item-itemid', form).val(itemid);
            $('#edit-item-parentid', form).val(parentid);

            // Bind submit event
            $('form', form).bind(
                'submit',
                iron.actions.submit_edit_form
            );

            // Bind close event
            $('#edit-item-close', form).bind(
                'click',
                iron.actions.hide_edit_form
            );

            // Display
            form.show();
        },


        /**
         * Hide create/edit form for data items
         */
        hide_edit_form: function() {

            $('div#edit-item').hide();

        },


        /**
         * Submit create/edit form for data items
         */
        submit_edit_form: function() {

            iron.actions.hide_edit_form();

        }
    },

    views: {

        /*
         * Build and display root branch markup
         */
        display_root_branch: function() {

            // Create a container for the branch data
            var root_container = $('<ul id="cont-0"></ul>');
            $('div#content').append(root_container);
            iron.views.display_branch(0);
        },


        /*
         * Build and display a branch's markup
         */
        display_branch: function(rootid) {

            // Get branch data
            var data = iron.data.fetch_branch(rootid);

            // Render branch data
            var branch = '';
            for (leaf in data) {
                branch += '<li item-id="'+leaf+'">';
                branch += '<span class="text">';
                branch += data[leaf].text;
                branch += '</span>';

                if (data[leaf].children) {
                    branch += ' <span class="meta">(<span class="children-count">'+data[leaf].children+'</span>)</span>';
                    branch += '<ul id="cont-'+leaf+'" style="display: none;"></ul>';
                }

                branch += '</li>';
            }

            // Hide container
            var container = $('ul#cont-'+rootid);
            container.hide();

            // Locate markup
            container.html(branch);

            // Add event handlers
            $('li > span.text', container).click(function() {
                var parentel = $(this).parent();
                var children = $('ul', parentel);

                // Toggle children view
                if (children.is(':visible')) {
                    children.hide();
                }
                else {
                    iron.views.display_branch(parentel.attr('item-id'));
                }
            });

            // Show container
            container.show();
        }
    },

    data: {

        store: {

            0: {
                1: {
                    'text': 'Test 1',
                    'children': 1
                },
                2: {
                    'text': 'Test 2',
                    'children': 0
                }
            },

            1: {
                3: {
                    'text': 'Child of Test 1',
                    'children': 0
                }
            }
        },


        fetch_branch: function(rootid) {

            // Just test data for now
            if (iron.data.store[rootid] == undefined) {
                return {};
            }

            return iron.data.store[rootid];
        },


        fetch_node: function(itemid, parentid) {

            return iron.data.store[parentid][itemid];
        },


        update_node: function(itemid, parentid, text, orderid) {

            // Save
            var node= {
                'text': text,
                'children': 0
            };

            iron.data.store[parentid][itemid] = node;

        },
    }
}

$(function() {

    /**
     * Bind header-navigation links
     */
    iron.actions.bind_header_links();

    /**
     * Things to do on first page load
     *
     * - Build root nodes view
     */
    iron.views.display_root_branch();
});

/*
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
                $(this).after(' <a class="external" target="_blank" href="'+matches[match]+'" title="'+matches[match]+'">^</a> ');
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
*/
