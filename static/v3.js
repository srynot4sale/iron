var iron = {}


/**
 * Detect if being accessed via smartphone
 */
iron.detect_smartphone = function() {

    // User agent string
    var useragent = navigator.userAgent.toLowerCase();

    return useragent.search('android') > -1;
}


/**
 * Django specific code to support CSRF tokens
 */
$('html').ajaxSend(function(event, xhr, settings) {
    function getCookie(name) {
        var cookieValue = null;
        if (document.cookie && document.cookie != '') {
            var cookies = document.cookie.split(';');
            for (var i = 0; i < cookies.length; i++) {
                var cookie = jQuery.trim(cookies[i]);
                // Does this cookie string begin with the name we want?
                if (cookie.substring(0, name.length + 1) == (name + '=')) {
                    cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                    break;
                }
            }
        }
        return cookieValue;
    }
    if (!(/^http:.*/.test(settings.url) || /^https:.*/.test(settings.url))) {
        // Only send the token to relative URLs i.e. locally.
        xhr.setRequestHeader("X-CSRFToken", getCookie('csrftoken'));
    }
});


/**
 * Log messages
 */
iron.logging_enabled = true;
iron.log_messages = [];
iron.log_message_count = 0;


/**
 * Show toggle logging button
 */
iron.logging_toggle = function() {

    var button = $('input#iron-logging-toggle');

    // Add button to body of document if it doesn't exist
    if (!button.length) {
        var button = $('<input id="iron-logging-toggle" type="button" />');
        $('#logmessages').prepend(button);

        // Add click handler
        button.click(iron.logging_toggle);
    }

    // Toggle logging
    if (iron.logging_enabled) {
        iron.logging_enabled = false;
        button.val('Enable logging');

        // Clear any existing log messages
        $('#logmessages div').remove();
    }
    else {
        iron.logging_enabled = true;
        button.val('Disable logging');
        iron.logger('Logging enabled');
    }
}


/**
 * Logger
 *
 * @param   string  message
 * @param   string  function call
 * @param   array   function params
 */
iron.logger = function(message, func, params) {

    // Check if enabled
    if (!iron.logging_enabled) {
        return;
    }

    // Limit array length to 100
    iron.log_messages = iron.log_messages.slice(-99);

    // Add message to array
    iron.log_messages.push([message, func, params]);

    // Latest message
    var latest = iron.log_message_count++;

    // Display for debugging purposes
    $('#logmessages #iron-logging-toggle').after('<div message="'+latest+'"><span>'+message+'</span></div>')
    window.setTimeout(function() {
        $('#logmessages div[message="'+latest+'"]').fadeOut();
    }, 10000);
}


/**
 * Render branch's markup from data
 *
 * @param   integer parent branch id
 * @param   array   branch item data
 */
iron.render_branches = function(parentid, data) {

    iron.logger('Render child branches of '+parentid);

    // Child count
    var child_count = data.length;

    // Load container
    var container = $('div#content ul#c-'+parentid);

    // Create if doesn't exist
    if (!container.length) {
        var container = $('<ul class="container" id="c-'+parentid+'"></ul>');

        // Hide container initially
        container.hide();

        // Check for parent branch
        var pbranch = $('div#content li#b-'+parentid);

        if (pbranch.length) {
            pbranch.append(container);
        }
        else {
            $('div#content').append(container);
        }

        // Make sortable
        container.sortable(
            {
                items: '> li.branch',
                handle: '> span.content',
                axis: 'y',
                delay: 500,
                cursor: 'crosshair'
            }
        );

        // Create sort handler
        container.bind('sortupdate', function(event, ui) {
            var branch = $(ui.item);

            // Only run this once (for the direct parent)
            if (branch.data('parentid') != parentid) {
                return true;
            }

            var moveto = branch.prev().data('branchid');
            if (!moveto) {
                moveto = 0;
            }

            iron.move_branch(branch.data('branchid'), moveto)
        });
    }

    // Populate branches
    var l = 0; // local count

    var localbranches = $('> li.branch', container);
    var remotebranches = data;

    var rbranch;
    var lbranch;

    while (remotebranches.length || localbranches.length - l) {
        // Grab next branches
        if (remotebranches.length) {
            rbranch = remotebranches.shift();
        } else {
            rbranch = undefined;
        }

        if (localbranches.length - l) {
            lbranch = $(localbranches[l]);
            l += 1;

            // Check if branch has been editing and needs refreshing
            if (lbranch.data('needsrefresh')) {
                lbranch = undefined;
            }
        } else {
            lbranch = undefined;
        }

        // Compare
        if (lbranch != undefined && rbranch != undefined &&
            lbranch.data('branchid') == rbranch.id) {
            iron.logger('Remote branch the same, no need to change '+rbranch.id);
            continue;
        }

        // If different, delete local
        if (lbranch != undefined) {
            iron.logger('Branches differ, delete local '+lbranch.data('branchid'));
            lbranch.remove();
        }

        // If remote exists, add
        if (rbranch != undefined) {
            iron.render_branch(container, rbranch);
        }
    }

    // Add new child branch form
    var addform = $('> li.add', container);

    if (!addform.length) {
        var addform = $('<li class="add"><span>Add new</span><textarea style="display: none;" rows="1" cols="40"></textarea></li>');
        container.append(addform);

        $('span', addform).click(function() {
            $('textarea', addform).show();
            $('textarea', addform).focus();
            $(this).hide();
        });

        $('textarea', addform).blur(function() {
            $('span', addform).show();
            $(this).hide();
        });

        $('textarea', addform).keydown(function(event) {
            // Handle enter
            if (event.keyCode == 13) {
                event.stopImmediatePropagation();
                event.preventDefault();

                iron.logger('Save new branch with content "'+$(this).val()+'"');

                // Build temp item for display with loading message
                var newitemdata = {
                    id: 0,
                    children_count: 0,
                    parent_id: parentid,
                    text: $(this).val() + ' <i>(saving...)</i>'
                }

                // Render temp item
                iron.render_branch(container, newitemdata);

                // Save item and update branch
                iron.save_branch(parentid, $(this).val());

                // Reset add form ready for new item
                $(this).val('');
            }
            // Handle ESC
            else if (event.keyCode == 27) {
                $(this).blur();
            }
        });
    }

    // Keep child count up-to-date
    var parentbranch = $('div#content li#b-'+parentid);
    var parentdata = {
        'text': $('> span.content span.text', parentbranch).html(),
        'children_count': child_count
    };

    iron.update_branch(parentbranch, parentdata);

    // Show branches
    container.show();

    iron.logger('Render child branches of '+parentid+' complete');
}


/**
 * Render markup for individual branch
 *
 * @param   jquery  container
 * @param   object  branch data
 */
iron.render_branch = function(container, data) {

    // Branch ID
    var branchid = data.id;

    // Load branch
    var branch = $('li#b-'+branchid, container);

    // Create if doesn't exist
    if (!branch.length) {
        var cssclass = 'branch';
        if (data.children_count) {
            cssclass += ' has-children';
        }

        branch = $('<li class="'+cssclass+'" id="b-'+branchid+'"></li>');
        branch.data({
            branchid:   branchid,
            parentid:   data.parent_id,
            childcount: data.children_count
        });

        var branchcontent = $('<span class="content" title="Branch ID: '+branchid+'"></span>');
        var branchmeta = $('<span class="meta"></span>');
        var branchtoggle = $('<span class="toggle"></span>');
        var branchactions = $('<span class="actions"><span class="edit">e</span><span class="archive">a</span></span>');
        branchmeta.append(branchtoggle);
        branchmeta.append(branchactions);
        branch.append(branchmeta);
        branch.append(branchcontent);

        if ($('> li.add', container).length) {
            $('> li.add', container).before(branch);
        } else {
            container.append(branch);
        }

        // Attach triggers
        iron.attach_branch_triggers(branch);
    }

    iron.update_branch(branch, data);

    iron.logger('Render branch '+branchid);
}


/**
 * Update branch content (but not it's children)
 *
 * @param   jquery  branch
 * @param   object  data
 */
iron.update_branch = function(branch, data) {

    var content = $('> span.content', branch);
    var actions = $('> span.actions span.archive', branch);

    // Update branch content
    if (data.text) {
        // Surround all links with correct html
        var html = data.text.replace(/(https?:\/\/[^ ]+)/g, "<a href=\"$1\" target=\"_blank\">$1</a>");
    }

    var text = '<span class="text">'+html+'</span>';
    if (data.children_count) {
        text += ' ('+data.children_count+')';
    }
    content.html(text);
    branch.data('text', data.text);

    // Update child count
    branch.data('childcount', data.children_count);
    if (data.children_count) {
        branch.addClass('has-children');
    }
    else {
        branch.removeClass('has-children');
    }

    // Hide actions if has children
    if (data.children_count) {
        actions.hide();
    }
    else {
        actions.show();
    }
}


/**
 * Attach event triggers to a branch
 *
 * @param   jquery  branch
 */
iron.attach_branch_triggers = function(branch) {

    // Branch ID
    var branchid = branch.data('branchid');

    // Make branch draggable
/*    branch.draggable({
        revert:     true,
        handle:     'span.move'
    });

    // Make branch droppable
    branch.droppable({
        greedy: true,
        drop: function(event, ui) {
            // Reparent
            iron.reparent_branch(ui.draggable.data('branchid'), ui.draggable.data('parentid'), branchid);
        }
    });
*/
    // Create "toggle" click event
    $('> span.meta span.toggle', branch).click(function() {
        // Check the branch is not being dragged
        var container = branch.parent('ul.container');
        iron.toggle_branch(branchid);
    });

    // Create "edit" click event
    $('> span.meta span.actions span.edit', branch).click(function() {

        var content = $('> span.content', branch);
        var text = $('span.text', content);
        var actions = $('> span.actions', branch);

        // Check for existing textarea
        var editform = $('> textarea', content);
        if (!editform.length) {
            var editform = $('<textarea rows="1" cols="40"></textarea>');
            editform.val(branch.data('text'));
            text.after(editform);
        }

        // Show textarea, hide text
        editform.show();
        text.hide();
        actions.hide();
        editform.focus();

        // Hide (but not reset) on blur
        editform.blur(function() {
            $(this).hide();
            text.show();
            actions.show();
        });

        editform.keydown(function(event) {

            // Handle enter
            if (event.keyCode == 13) {
                event.stopImmediatePropagation();
                event.preventDefault();

                iron.logger('Edit branch "'+branchid+'" with content "'+$(this).val()+'"');

                // Update text to read "saving"
                text.html($(this).val()+' <i>(updating...)</i>');

                // Set needsrefresh
                branch.data('needsrefresh', 1);

                // Send update
                iron.edit_branch(branch.data('parentid'), branchid, $(this).val());

                // Delete textarea, clearing content
                $(this).remove();
                text.show();
                actions.show();
            }
            // Handle ESC
            else if (event.keyCode == 27) {
                // Delete textarea, clearing content
                $(this).remove();
                text.show();
                actions.show();
            }
        });
    });

    // Create "archive" click event on branch archive
    $('> span.meta span.actions span.archive', branch).click(function() {

        // Add loading icon to branch and "archiving" message
        $('> span.content span.text', branch).append(' <i>(archiving...)</i>');
        branch.addClass('loading-progress');

        // Success callback (removes branch)
        var archive_branch_success = function() {
            branch.remove();

            // Reload branch
            iron.load_branch(branch.data('parentid'));
        };

        // Save then update branch
        iron.api.post(
            'Archive branch '+branchid,
            '/archive/'+branchid,
            { branchid: branchid },
            archive_branch_success
        );
    });
}


/**
 * Toggle a branch's children's visibility
 *
 * @param   integer branchid
 */
iron.toggle_branch = function(branchid) {

    var branch = $('li#b-'+branchid);

    // Check if child branches are visible
    var children = $('> ul.container', branch);

    // If visible, hide
    if (children.is(':visible')) {
        branch.removeClass('expanded');
        children.hide();

        iron.logger('Hide children of branch '+branchid);
    }
    // Otherwise, load and show
    else {
        // Load branch markup
        iron.load_branch(branchid);
        iron.logger('Show children of branch '+branchid);
    }
}


/**
 * Save branch
 *
 * @param   integer parentid
 * @param   string  content
 */
iron.save_branch = function(parentid, content) {

    // Add loading icon to all new branches waiting for response
    var branch = $('li#b-0');
    branch.addClass('loading-progress');

    // Success callback (removes loading icon)
    var save_branch_success = function() {
        branch.removeClass('loading-progress');
        iron.load_branch(parentid);
    };

    // Save then update branch
    iron.api.post(
        'Saving child branch of '+parentid,
        '/new/'+parentid,
        { text: content },
        save_branch_success
    );
}


/**
 * Reparent branch
 *
 * @param   integer branchid
 * @param   integer oldparentid
 * @param   integer newparentid
 * @param   string  content
 */
iron.reparent_branch = function(branchid, oldparentid, newparentid) {

    // Add loading icon to branch
    var branch = $('li#b-'+branchid);
    branch.addClass('loading-progress');

    iron.logger('Branch: '+branchid);
    iron.logger('Old parent: '+oldparentid);
    iron.logger('New parent: '+newparentid);

    // Success callback (removes loading icon)
    var reparent_branch_success = function() {
        branch.remove();
        iron.load_branch(newparentid);
        iron.load_branch(oldparentid);
    };

    // Reparent then update branch
    iron.api.post(
        'Reparent branch '+branchid,
        '/reparent/'+branchid,
        { parentid: newparentid },
        reparent_branch_success
    );
}


/**
 * Edit branch
 *
 * @param   integer parentid
 * @param   integer branchid
 * @param   string  content
 */
iron.edit_branch = function(parentid, branchid, content) {

    // Add loading icon to branch
    var branch = $('li#b-'+branchid);
    branch.addClass('loading-progress');

    // Success callback (removes loading icon)
    var save_branch_success = function() {
        branch.removeClass('loading-progress');
        iron.load_branch(parentid);
    };

    // Edot branch
    iron.api.post(
        'Edit branch '+branchid,
        '/edit/'+branchid,
        { text: content },
        save_branch_success
    );
}

/**
 * Update branch sort order
 *
 * @param   integer branchid to move
 * @param   integer moveid  ID of branch to move after (or 0 to go to the top)
 */
iron.move_branch = function(branchid, moveid) {

    // Add loading icon to branch
    var branch = iron.get_branch(branchid);
    branch.addClass('loading-progress');

    // Success callback (removes loading icon)
    var move_branch_success = function() {
        branch.removeClass('loading-progress');
    };

    // Save then update branch
    iron.api.post(
        'Move branch '+branchid+' to '+moveid,
        '/move/'+branchid,
        { moveto: moveid },
        move_branch_success
    );
}


/**
 * Load branch from server and render
 *
 * @param   integer branchid
 */
iron.load_branch = function(branchid) {

    // Add loading icon to branch
    var branch = iron.get_branch(branchid);
    branch.addClass('loading-progress');
    branch.addClass('expanded');

    // Success callback (renders branch and removes loading icon)
    var load_branch_success = function(data) {
        branch.removeClass('loading-progress');
        iron.render_branches(branchid, data);
    };

    // Try catch undefined bug I've been seeing
    if (branchid == undefined) {
        alert('Branch ID undefined (in iron.load_branch)');
    }

    iron.api.getJSON(
        'Load branch '+branchid,
        '/json/'+branchid,
        load_branch_success
    );

}


/**
 * Get branch object
 *
 * @param   integer branchid
 */
iron.get_branch = function(branchid) {
    return $('li#b-'+branchid);
}


/**
 * API layer
 */
iron.api = function() {}

iron.api.getJSON = function(message, url, callback_success, callback_failure) {

    iron.logger(message + ' (request)');

    $.getJSON(
        url,
        function(response) {
            iron.logger(message + ' (success)');
            callback_success(response);
        }
    );
}

iron.api.post = function(message, url, data, callback_success, callback_failure) {

    iron.logger(message + ' (request)');

    $.post(
        url,
        data,
        function(response) {
            iron.logger(message + ' (success)');
            callback_success(response);
        }
    );
}

/**
 * Run on start up
 */
$(function() {

    // Detect smartphone
    if (iron.detect_smartphone()) {
        $('body').addClass('smartphone');
    }

    // Display logging toggle button
    iron.logging_toggle();

    // Build root branch
    iron.render_branches(0, data);

});
