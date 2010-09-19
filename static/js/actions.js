iron.actions = {

    /**
     * Display root branch
     */
    display_root_branch: function() {
        iron.views.setup_root_branch();
        iron.actions.display_branch(0);
    },


    /**
     * Display child branch
     *
     * @param   rootid  Root id for this branch
     */
    display_branch: function(rootid) {

        // Get branch data
        var data = iron.data.fetch_branch(rootid);

        iron.views.display_branch(rootid, data);
    },

    /**
     * Display add form for data items
     */
    display_add_form: function(parent) {
        iron.views.display_add_form(parent);
    },


    /**
     * Submit add form for data items
     */
    submit_add_form: function(form, type, refid) {

        var parent = $(form).closest('li');

        // Get input data
        var value = $('input', form).val();

        // Get previous id
        if (type == 'before') {
            var previd = refid;
        }
        else {
            var previd = 0;
        }

        // Get parentid
        var parentid = parent.parent().attr('branch-id');

        // Update the node
        iron.data.add_node(
            parentid,
            previd,
            value
        );

        iron.views.hide_add_form(parent);

        // Rerender the branch
        iron.actions.display_branch(parentid);
    },


    move_node: function(where, parent) {

        var node = iron.data.store[parent.attr('item-id')];

        if (node == undefined) {
            return;
        }

        // Up
        if (where == 'up') {
            // Check if already at top
            if (node.order == 0) {
                return;
            }

            iron.data.update_node(node.id, node.parent_id, undefined, node.order - 1);

            // Rerender the branch
            iron.actions.display_branch(node.parent_id);
            return;
        }

        if (where == 'down') {
            // Check if not already at bottom
            var siblings = iron.data.fetch_branch(node.parent_id);

            for (sorder in siblings) {
                if (sorder > node.order) {
                    iron.data.update_node(node.id, node.parent_id, undefined, node.order + 1);

                    // Rerender the branch
                    iron.actions.display_branch(node.parent_id);
                    return;
                }
            }
        }

    },
};
