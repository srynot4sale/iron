var iron = {}

/**
 * Log messages
 */
iron.log_messages = [];


/**
 * Logger
 *
 * @param   string  message
 * @param   string  function call
 * @param   array   function params
 */
iron.logger = function(message, func, params) {

    // Add message to array
    iron.log_messages.push([message, func, params]);

    // Latest message
    var latest = iron.log_messages.length;

    // Display for debugging purposes
    $('#logmessages').prepend('<div message="'+latest+'"><span>'+message+'</span></div>')
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
    for (branch in data) {
        iron.render_branch(container, data[branch]);
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

                iron.save_branch($(this).closest('ul').attr('parent-id'), $(this).val());
                $(this).closest('li.add').remove();
            }
        });
    }

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
        var branch = $('<li class="branch" id="b-'+branchid+'" branch-id="'+branchid+'" child-count="'+data.children_count+'"></li>');
        var branchcontent = $('<span class="text"></span>');
        var branchactions = $('<span class="archive">a</span>');
        branch.append(branchcontent);

        // Add actions if no children
        if (!data.children_count) {
            branch.append(branchactions);
        }

        if ($('> li.add', container).length) {
            $('> li.add', container).before(branch);
        } else {
            container.append(branch);
        }

        iron.logger('Creating branch');

        // Attach triggers
        iron.attach_branch_triggers(branch);
    }

    // Update branch content
    var text = data.text;
    if (data.children_count) {
        text += ' ('+data.children_count+')';
    }

    $('span.text', branch).html(text);

    iron.logger('Render branch '+branchid+' complete');
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
    $('span.text', branch).click(function() {
        iron.toggle_branch(branchid);
    });

    // Create "archive" click event on branch archive
    $('span.archive', branch).click(function() {

        iron.logger('Archive branch '+branchid);
        $.post('/archive/'+branchid);

        // Remove from display
        branch.remove();
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

    // Build root branch
    iron.render_branches(0, data);

});
