<h2>Create new child of '{{parent.text}}'</h2>

<form method="POST" action="/new/{{parent.id}}">

    <textarea name="text"></textarea>

    <input type="submit" value="Create" />
% if mobile:
% if parent.id == 0:
    <a class="cancel" href="/">Cancel</a>
% else:
    <a class="cancel" href="/children/{{parent.id}}">Cancel</a>
% end

</form>

% if mobile:
% rebase template title=False, mobile=mobile
% end
