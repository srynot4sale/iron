var iron = {

    data: {

        store: {

            0: {
                text: 'Root node',
                children_count: 2,
                children: [1,2],
                parent_id: false
            },

            1: {
                text: 'Test 1',
                children_count: 2,
                children: [3,4],
                parent_id: 0
            },

            2: {
                text: 'Test 2',
                children_count: 0,
                parent_id: 0
            },

            3: {
                text: 'Child of Test 1',
                children_count: 0,
                parent_id: 1
            },

            4: {
                text: 'Awesome',
                children_count: 1,
                children: [5],
                parent_id: 1
            },

            5: {
                text: 'Lols',
                children_count: 0,
                parent_id: 4
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

            // Check to see if already exists
            var item = iron.data.store[itemid];

            if (item == undefined) {
                item = {
                    text: '',
                    children_count: 0,
                    parent_id: false
                };
            }

            // Update
            item.text = text;
            item.parent_id = parentid;

            // Save
            iron.data.store[itemid] = item;

            // Update parent if neccesary
            var parent = iron.data.store[parentid];

            if (parent == undefined) {
                return;
            }

            // Check if parent has any children
            if (parent.children_count == 0) {
                parent.children = [];
            }

            // Check if item is listed under this parent, if not then add
            if (parent.children.indexOf(itemid) == -1) {
                parent.children.push(itemid);
                parent.children_count = parent.children_count + 1;
            }
        },


        add_node: function(parentid, previd, text) {

            // Get parent node
            var parent = iron.data.store[parentid];

            if (parent == undefined) {
                return;
            }

            // Get next id
            var nextid = 0;
            for (id in iron.data.store) {
                if (id > nextid) {
                    nextid = id;
                }
            }

            nextid = parseInt(nextid) + 1;

            iron.data.update_node(nextid, parentid, text);
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
