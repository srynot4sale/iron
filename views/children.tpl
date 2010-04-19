% for item in children:
<p>
    <a class="parent" href="/children/{{item.id}}" title="#{{item.id}}: created {{item.updated}}">{{item.text}}</a>
    <a class="open-dialog" href="/new/{{item.id}}">+</a>
</p>
% end


% if len(children) == 0:
<p>No children</p>
% end
