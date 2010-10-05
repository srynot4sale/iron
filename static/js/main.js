var iron = {

    data: {

        store: {

            0: {
                text: 'Root node',
                children_count: 2,
                children: [],
                parent_id: false,
                order: 0
            },
/*
            1: {
                text: 'Test 1',
                children_count: 2,
                children: [3,4],
                parent_id: 0,
                order: 0
            },

            2: {
                text: 'Test 2',
                children_count: 0,
                parent_id: 0,
                order: 1
            },

            3: {
                text: 'Child of Test 1',
                children_count: 0,
                parent_id: 1,
                order: 0
            },

            4: {
                text: 'Awesome',
                children_count: 1,
                children: [5],
                parent_id: 1,
                order: 1
            },

            5: {
                text: 'Lols',
                children_count: 0,
                parent_id: 4,
                order: 0
            }
*/
        },


        load_branch: function(rootid, callback) {

            var root = iron.data.store[rootid];

            if (root == undefined) {
                return;
            }

            var load = function(rootid, callback) {

                $.getJSON('/json/'+rootid, function(data) {

                    // Loop through data
                    for (item in data) {
                        item = data[item];
                        id = item['id'];
                        delete item['id'];
                        iron.data.store[id] = item;

                        var root = iron.data.store[item['parent_id']];

                        if (root.children == undefined) {
                            root.children = [];
                        }

                        root.children.push(id);
              //          root.children_count += 1
                    }

                    if (callback !== undefined) {
                        callback();
                    }
                });

            };

            load(rootid, callback);

        },


        /**
         * Load data from cache or the server
         *
         * Just test data for now tho
         *
         * @param rootid Root ID
         * @return array
         */
        fetch_branch: function(rootid) {

            var root = iron.data.store[rootid];

            // If root does not exist, or has no children
            if (root == undefined || root.children_count < 1) {
                return [];
            }

            // Trigger loading of all child branches
            if (rootid != 0) {
                iron.data.load_branch(rootid);
            }

            var ordered = [];

            // Load children
            for (i in root.children) {
                var id = root.children[i];
                item = iron.data.store[id];
                item.id = id;

                ordered[item.order] = item;
            }

            // Return as ordered array
            return ordered;
        },


        update_node: function(itemid, parentid, text, order) {

            // Check to see if already exists
            var item = iron.data.store[itemid];

            // Flag to say whether new or not
            var exists = true;

            if (item == undefined) {
                exists = false;
                item = {
                    text: '',
                    children_count: 0,
                    parent_id: false,
                    order: 0
                };
            }

            // Update
            if (text != undefined) {
                item.text = text;
            }

            if (parentid != undefined) {
                item.parent_id = parentid;
            }

            if (order != undefined) {
                // Get order and update sibling's orders
                // See if order already taken
                var siblings = iron.data.fetch_branch(parentid);
                var taken = 0;
                for (sorder in siblings) {
                    if (sorder == order) {
                        taken = siblings[sorder].id;
                        break;
                    }
                }

                // Re order other siblings
                if (taken) {
                    if (exists) {
                        for (sorder in siblings) {
                            if (siblings[sorder].order == order) {
                                siblings[sorder].order = item.order;
                                break;
                            }
                        }
                    }
                    else {
                        for (sorder in siblings) {
                            if (siblings[sorder].order >= order) {
                                siblings[sorder].order += 1;
                            }
                        }
                    }
                }

                item.order = order;
            }

            // Save
            iron.data.store[itemid] = item;

            // Get parent
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

            // Get order
            if (previd) {
                // Get the item this will be previous too
                var prev = iron.data.store[previd];
                var order = prev.order;
            }
            else {
                // Get the next order not already taken
                var siblings = iron.data.fetch_branch(parentid);

                // Check actually has siblings
                var order = 0;
                if (siblings.length) {
                    for (sorder in siblings) {
                        if (sorder > order) {
                            order = sorder;
                        }
                    }

                    order = parseInt(order) + 1;
                }
            }

            iron.data.update_node(nextid, parentid, text, order);
        },


        archive_node: function(itemid) {

            var node = iron.data.store[itemid];

            // Re order other siblings
            var siblings = iron.data.fetch_branch(node.parent_id);

            // Check actually has siblings
            if (siblings.length) {
                for (sorder in siblings) {
                    if (siblings[sorder].order > node.order) {
                        siblings[sorder].order -= 1;
                    }
                }
            }

            // Delete node from store
            delete iron.data.store[itemid];

            // Get parent
            var parent = iron.data.store[node.parent_id];

            if (parent == undefined) {
                return;
            }

            // Check if item is listed under this parent, then remove
            var index = parent.children.indexOf(parseInt(itemid));

            if (index != -1) {
                parent.children.splice(index, 1);
                parent.children_count -= 1;
            }
        }
    }
}

$(function() {

    /**
     * Things to do on first page load
     *
     * - Build root nodes view
     */
    iron.data.load_branch(0, iron.actions.display_root_branch);
});
