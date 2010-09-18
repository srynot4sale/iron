iron.views = {

    /*
     * Setup markup ready to display root branch markup
     */
    setup_root_branch: function() {

        // Create a container for the branch data
        var root_container = $('<ul id="cont-0"></ul>');
        $('div#content').append(root_container);
    },


    /*
     * Build and display a branch's markup
     */
    display_branch: function(rootid, data) {

        // Render branch data
        var branch = '';
        for (leaf in data) {
            var class = '';

            if (data[leaf].children_count) {
                class = class + ' has-children';
            }

            branch += '<li item-id="'+leaf+'" class="'+class+'">';
            branch += '<span class="text">';
            branch += data[leaf].text;
            branch += '</span>';

            if (data[leaf].children_count) {
                branch += ' <span class="meta">(<span class="children-count">'+data[leaf].children_count+'</span>)</span>';
                branch += '<ul id="cont-'+leaf+'" style="display: none;"></ul>';
            }

            branch += '<span class="after"><span class="add">+</span></span>';
            branch += '</li>';
        }

        // Hide container
        var container = $('ul#cont-'+rootid);
        container.hide();

        // Locate markup
        container.html(branch);

        // Add event handlers
        // Toggle children
        $('li > span.text', container).click(function() {
            var parentel = $(this).parent();
            var children = $('ul', parentel);

            // Toggle children view
            if (children.is(':visible')) {
                children.hide();
            }
            else {
                iron.actions.display_branch(parentel.attr('item-id'));
            }
        });

        // Show add form
        $('li > span.after span.add', container).click(function() {
            var parentel = $(this).closest('li');

            iron.actions.display_add_form(parentel);
        });

        // Show container
        container.show();
    },


    display_add_form: function(parent) {

        // Hide add link
        $(' > span.after', parent).hide();

        // Create form markup
        var input = $('<input type="text" />');
        var form = $('<form class="add-form"></form>');
        form.append(input);

        // Add event handlers
        // Hide form on blur
        input.blur(function() {
            iron.views.hide_add_form(parent);
        });

        // Submit form on enter
        form.submit(function(event) {
            event.stopImmediatePropagation();
            iron.actions.submit_add_form(this);
            return false;
        });

        // Show form
        parent.append(form);
        input.focus();
    },


    hide_add_form: function(parent) {
        $('form.add-form', parent).remove();
        $(' > span.after', parent).show();
    }
}
