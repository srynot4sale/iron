var iron = {

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
     * Things to do on first page load
     *
     * - Build root nodes view
     */
    iron.actions.display_root_branch();
});
