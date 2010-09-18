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
    submit_add_form: function(form) {

        var parent = $(form).closest('li');

        // Get input data
        var value = $('input', form).val();

        // Get previous id
        var previd = parent.attr('item-id');

        // Update the node
        iron.data.add_node(
            previd,
            value
        );

        iron.views.hide_add_form(parent);
    }
};
