var iron = {}

/**
 * Logger
 *
 * @param   string  message
 * @param   string  function call
 * @param   array   function params
 */
iron.logger = function(message, func, params) {

    // Display for debugging purposes
    $('#logmessages').prepend('<div>'+message+'</div>');
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

                $(this).blur();
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

    iron.logger('Render branch '+branchid);

    // Load branch
    var branch = $('li#b-'+branchid, container);

    // Create if doesn't exist
    if (!branch.length) {
        var branch = $('<li class="branch" id="b-'+branchid+'" branch-id="'+branchid+'"></li>');
        var branchcontent = $('<span class="text"></span>');
        branch.append(branchcontent);
        container.append(branch);

        iron.logger('Creating branch');

        // Attach triggers
        iron.attach_branch_triggers(branch);
    }

    // Update branch content
    $('span.text', branch).html(data.text);

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
        $.getJSON('/json/'+branchid, function(data) {
            iron.render_branches(branchid, data);
        });

        iron.logger('Show children of branch '+branchid);
    }
}


/**
 * Run on start up
 */
$(function() {

    // Build root branch
    iron.render_branches(0, data);

});
