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
        var container = $('<ul class="container" id="c-'+parentid+'" parent-id="'+parentid+'"></ul>');

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

        iron.logger('Creating container');
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
        } else {
            lbranch = undefined;
        }

        // Compare
        if (lbranch != undefined && rbranch != undefined &&
            lbranch.attr('branch-id') == rbranch.id) {
            iron.logger('Remote branch the same, no need to change '+rbranch.id);
            continue;
        }

        // If different, delete local
        if (lbranch != undefined) {
            iron.logger('Branches differ, delete local '+lbranch.attr('branch-id'));
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
        var addform = $('<li class="add"><input type="text" value="Add new" /></li>');
        container.append(addform);

        $('input', addform).focus(function() {
            iron.logger('Add form gains focus');
            $(this).addClass('hasinput');

            if ($(this).val() == 'Add new') {
                $(this).val('');
            }
        });

        $('input', addform).blur(function() {
            iron.logger('Add form blurs');

            if ($(this).val() == '') {
                $(this).removeClass('hasinput');
                $(this).val('Add new');
            }
        });

        $('input', addform).keyup(function(event) {
            if (event.keyCode == 13) {
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

    // Make sortable
    container.sortable(
        {
            items: '> li.branch',
            handle: '> span.content',
            axis: 'y',
            delay: 500
        }
    );

    // Create sort handler
    container.bind('sortstart', function(event, ui) {
        container.addClass('iron-sorting-started');
    });

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
        var html = '';
        var cssclass = 'branch';
        if (data.children_count) {
            cssclass += ' has-children';
        }

        html += '<li class="'+cssclass+'" id="b-'+branchid+'" ';
        html += 'branch-id="'+branchid+'" ';
        html += 'child-count="'+data.children_count+'" ';
        html += 'parent-id="'+data.parent_id+'"></li>';
        branch = $(html);

        var branchcontent = $('<span class="content"></span>');
        var branchlinks = $('<span class="links"></span>');
        var branchactions = $('<span class="archive">a</span>');
        branch.append(branchcontent);
        branch.append(branchlinks);
        branch.append(branchactions);

        if ($('> li.add', container).length) {
            $('> li.add', container).before(branch);
        } else {
            container.append(branch);
        }

        iron.logger('Creating branch');

        // Attach triggers
        iron.attach_branch_triggers(branch);
    }

    iron.update_branch(branch, data);

    iron.logger('Render branch '+branchid+' complete');
}


/**
 * Update branch content (but not it's children)
 *
 * @param   jquery  branch
 * @param   object  data
 */
iron.update_branch = function(branch, data) {

    var content = $('> span.content', branch);
    var links = $('> span.links', branch);
    var actions = $('> span.archive', branch);

    // Update branch content
    var linktext = '';
    if (data.text) {
        matches = data.text.match(/(http:\/\/[^ ]+)/g);
        for (match in matches) {
            linktext += ' <a target="_blank" href="'+matches[match]+'" title="'+matches[match]+'">^</a>';
        }
    }

    var text = '<span class="text">'+data.text+'</span>';
    if (data.children_count) {
        text += ' ('+data.children_count+')';
    }
    content.html(text);
    links.html(linktext);

    // Update child count
    branch.attr('child-count', data.children_count);

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
    var branchid = branch.attr('branch-id');

    iron.logger('Attaching events to branch '+branchid);

    // Create "toggle" click event on branch content
    $('span.content', branch).click(function() {
        // Check the branch is not being dragged
        var container = branch.parent('ul.container');
        if (container.hasClass('iron-sorting-started')) {
            container.removeClass('iron-sorting-started');
        }
        else {
            iron.toggle_branch(branchid);
        }
    });

    // Create "archive" click event on branch archive
    $('span.archive', branch).click(function() {

        iron.logger('Archive branch '+branchid);
        $.post('/archive/'+branchid);

        // Remove from display
        branch.remove();

        // Reload branch
        iron.load_branch(branch.attr('parent-id'));
    });
}


/**
 * Toggle a branch's children's visibility
 *
 * @param   integer branchid
 */
iron.toggle_branch = function(branchid) {

    // Check if child branches are visible
    var children = $('li#b-'+branchid+' > ul.container');

    // If visible, hide
    if (children.is(':visible')) {
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

    iron.logger('Saving child branch of '+parentid);

    // Generate url
    var url = '/new/'+ parentid;

    // Generate data
    var data = {
        text: content
    }

    // Save then update branch
    $.post(
        url,
        data,
        function() {
            iron.load_branch(parentid);
        }
    );
}


/**
 * Load branch from server and render
 *
 * @param   integer branchid
 */
iron.load_branch = function(branchid) {

    iron.logger('Requesting branch '+branchid);

    $.getJSON('/json/'+branchid, function(data) {
        iron.logger('Retrieved branch '+branchid);
        iron.render_branches(branchid, data);
    });
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
