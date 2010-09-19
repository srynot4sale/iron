iron.views = {

    /*
     * Setup markup ready to display root branch markup
     */
    setup_root_branch: function() {

        // Create a container for the branch data
        var root_container = $('<ul id="cont-0" branch-id="0"></ul>');
        $('div#content').append(root_container);
    },


    /*
     * Build and display a branch's markup
     */
    display_branch: function(rootid, data) {

        // Get container
        var container = $('ul#cont-'+rootid);

        // Get count
        var count = $('> div.item span.meta span.children-count', container.parent());

        // Get number of items in data
        var length = data.length;

        // Compare with old count
        if (length != parseInt(count.html())) {
            // Update old count
            count.html(length);

            // Make sure it's visible
            count.closest('span.meta').show();
        }

        // Add new node
        if ($('> li.action', container).length < 1) {
            add  = '<li class="action">';
            add += '<span class="add">Add new</span>';
            add += '</li>';

            container.append(add);

            // Add event handler
            $('> li.action span.add', container).click(function() {
                var parentel = $(this).closest('li');
                iron.actions.display_add_form(parentel);
            });
        }

        // Render branch data
        iron.views.display_nodes(container, data);

        // Show container
        container.show();
    },


    display_nodes: function(container, data) {

        // Create new nodes
        var last = 0;
        for (i in data) {

            // Get node
            node = data[i];

            // Check if already exists
            var exists = $('> li[item-id='+node.id+']', container);

            // If doesn't already exist, create
            if (exists.length == 0) {

                var branch = '';

                var has_children = false;
                if (node.children_count) {
                    has_children = true;
                }

                branch += '<li class="item" item-id="'+node.id+'" order-id="'+node.order+'">';
                branch += '<div class="item">';
                branch += '<span class="text">';
                branch += node.text;
                branch += '</span>';

                style = has_children ? '' : 'style="display: none;"';
                branch += ' <span class="meta" '+style+'>(<span class="children-count">'+node.children_count+'</span>)</span>';

                branch += '<span class="after">';
                branch += '<span class="add" title="Add before">+</span>';
                branch += '<span class="up" title="Move up">&uarr;</span>';
                branch += '<span class="down" title="Move down">&darr;</span>';
                branch += '</span>';
                branch += '</div>';
                branch += '<ul id="cont-'+node.id+'" branch-id="'+node.id+'" style="display: none;"></ul>';

                branch += '</li>';
            }
            // If it does already exist
            else {
                // Check if order hasn't changed
                if (parseInt(exists.attr('order-id')) == node.order) {
                    last = node.id;
                    continue;
                }
                // Remove ready to be moved to correct position
                else {
                    exists.remove();
                    branch = exists;

                    // Update order-id attr
                    branch.attr('order-id', node.order);
                }
            }

            // Insert after the last item
            if (last) {
                $('> li[item-id='+last+']', container).after(branch);
            }
            // Other wise put it before the action element
            else {
                container.prepend(branch);
            }

            // If it already existed, don't bother adding event handlers
/*            if (exists.length) {
                last = node.id;
                continue;
            }*/

            // Add event handlers
            // Toggle children
            $('> li[item-id='+node.id+'] > div.item span.text', container).click(function() {
                var parentel = $(this).closest('li');
                var children = $('> ul', parentel);

                // Toggle children view
                if (children.is(':visible')) {
                    children.hide();
                }
                else {
                    iron.actions.display_branch(parentel.attr('item-id'));
                }
            });

            // Show add before form
            $('> li[item-id='+node.id+'] > div.item span.after span.add', container).click(function() {
                var parentel = $(this).closest('li');
                iron.actions.display_add_form(parentel);
            });

            // Move up
            $('> li[item-id='+node.id+'] > div.item span.after span.up', container).click(function() {
                var parentel = $(this).closest('li');
                iron.actions.move_node('up', parentel);
            });

            // Move down
            $('> li[item-id='+node.id+'] > div.item span.after span.down', container).click(function() {
                var parentel = $(this).closest('li');
                iron.actions.move_node('down', parentel);
            });

            // Update last
            last = node.id;
        }

        return branch;
    },


    display_add_form: function(parent) {

        // Check if this is an add new
        if (parent.hasClass('action')) {
            var type = 'new';
            var refid = parent.parent().attr('branch-id');
        }
        else {
            var type = 'before';
            var refid = parent.attr('item-id');
        }

        // Create form markup
        var input = $('<input type="text" />');
        var form = $('<form class="add-form"></form>');
        var container = $('<li class="add-'+type+'"></li>');
        form.append(input);
        container.append(form);

        // Add event handlers
        // Hide form on blur
        input.blur(function() {
            iron.views.hide_add_form(container);
        });

        // Submit form on enter
        form.submit(function(event) {
            event.stopImmediatePropagation();
            iron.actions.submit_add_form(this, type, refid);
            return false;
        });

        // Hide stuff
        if (type == 'new') {
            parent.hide();
        }

        // Show form
        parent.before(container);
        input.focus();
    },


    hide_add_form: function(container) {
        if (container.hasClass('add-new')) {
            $('> li.action', container.parent()).show();
        }

        container.remove();
    }
}
