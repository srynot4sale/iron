var iron = {

    data: {

        store: {

            0: {
                text: 'Root node',
                children_count: 2,
                children: [1,2]
            },

            1: {
                text: 'Test 1',
                children_count: 2,
                children: [3,4]
            },

            2: {
                text: 'Test 2',
                children_count: 0
            },

            3: {
                text: 'Child of Test 1',
                children_count: 0
            },

            4: {
                text: 'Awesome',
                children_count: 1,
                children: [5]
            },

            5: {
                text: 'Lols',
                children_count: 0
            }
        },


        /**
         * Load data from cache or the server
         *
         * Just test data for now tho
         *
         * @param rootid Root ID
         * @return object
         */
        fetch_branch: function(rootid) {

            var root = iron.data.store[rootid];

            // If root does not exist, or has no children
            if (root == undefined || root.children_count < 1) {
                return {}
            }

            var children = {};

            // Load children
            for (i in root.children) {
                var id = root.children[i];
                children[id] = iron.data.store[id];
            }

            return children;
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
