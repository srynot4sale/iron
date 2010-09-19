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
        var length = 0;
        for (leaf in data) {
            length += 1;
        }

        // Compare with old count
        if (length != parseInt(count.html())) {
            // Update old count
            count.html(length);
        }

        // Render branch data
        branch = iron.views.render_nodes(data);

        // Add new node
        branch += '<li class="action">';
        branch += '<span class="add">Add new</span>';
        branch += '</li>';

        // Hide container
        container.hide();

        // Locate markup
        container.html(branch);

        // Add event handlers
        // Toggle children
        $('li > div.item span.text', container).click(function() {
            var parentel = $(this).closest('li');
            var children = $('ul', parentel);

            // Toggle children view
            if (children.is(':visible')) {
                children.hide();
            }
            else {
                iron.actions.display_branch(parentel.attr('item-id'));
            }
        });

        // Show add before form
        $('li > div.item span.after span.add', container).click(function() {
            var parentel = $(this).closest('li');
            iron.actions.display_add_form(parentel);
        });

        // Show add new form
        $('li.action span.add', container).click(function() {
            var parentel = $(this).closest('li');
            iron.actions.display_add_form(parentel);
        });

        // Show container
        container.show();
    },


    render_nodes: function(data) {

        // Create new nodes
        var branch = '';
        for (leaf in data) {
            var class = '';

            var has_children = false;
            if (data[leaf].children_count) {
                has_children = true;
            }

            if (has_children) {
                class += ' has-children';
            }

            branch += '<li item-id="'+leaf+'" class="'+class+'">';
            branch += '<div class="item">';
            branch += '<span class="text">';
            branch += data[leaf].text;
            branch += '</span>';

            if (has_children) {
                branch += ' <span class="meta">(<span class="children-count">'+data[leaf].children_count+'</span>)</span>';
            }

            branch += '<span class="after"><span class="add" title="Add before">+</span></span>';
            branch += '</div>';

            if (has_children) {
                branch += '<ul id="cont-'+leaf+'" branch-id="'+leaf+'" style="display: none;"></ul>';
            }

            branch += '</li>';
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
