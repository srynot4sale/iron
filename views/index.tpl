% for item in items:
<p>
% if item.count:
    <a class="parent" href="/children/{{item.id}}" title="#{{item.id}}: created {{item.updated}}">{{item.text}} ({{item.count}})</a>
% else:
    <span class="parent" title="#{{item.id}}: created {{item.updated}}">{{item.text}}</span>
% end
    <a class="open-dialog" href="/new/{{item.id}}">+</a>
    <a class="archive" href="/archive/{{item.id}}">a</a>
</p>
% end


% if len(items) == 0:
<p>No items available</p>
% end

% if homepage == True:
% rebase template title='Index'
% end
