% for item in items:
<p class="item">
% if item.count:
    <a class="parent" href="/children/{{item.id}}" title="#{{item.id}}: created {{item.updated}}">{{item.text}} ({{item.count}})</a>
% elif mobile:
    <a class="parent" href="/children/{{item.id}}" title="#{{item.id}}: created {{item.updated}}">{{item.text}}</a>
% else:
    <span class="parent" title="#{{item.id}}: created {{item.updated}}">{{item.text}}</span>
% end
% if not mobile:
<a class="new open-dialog" href="/new/{{item.id}}">+</a>
% end
% if not item.count:
    <a class="archive" href="/archive/{{item.id}}">a</a>
% end
</p>
% end


% if len(items) == 0:
<p>No items available</p>
% end

% if homepage == True:
% rebase template title=False, mobile=mobile
% elif mobile:
% rebase template title=parent, mobile=mobile
% end
