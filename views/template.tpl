% if title:
% newparent = title.id
% else:
% newparent = 0
% end

<html>
    <head>
        <title>Iron</title>

% if not mobile:
        <script type="text/javascript" src="/static/js/jquery-1.3.2.min.js"></script>
        <script type="text/javascript" src="/static/fancybox/jquery.fancybox-1.3.1.pack.js"></script>
        <script type="text/javascript" src="/static/fancybox/jquery.easing-1.3.pack.js"></script>

        <script type="text/javascript" src="/static/js/global.js"></script>

        <link rel="stylesheet" href="/static/fancybox/jquery.fancybox-1.3.1.css" type="text/css" media="screen" />
        <link rel="stylesheet" href="/static/css/global.css" type="text/css" media="screen" />
% else:
        <link rel="stylesheet" href="/static/css/global.css" type="text/css" media="screen" />
        <link rel="stylesheet" href="/static/css/mobile.css" type="text/css" media="screen" />
% end

    </head>

    <body>

% if title:
        <h1><a href="/">Iron</a> &raquo; {{title.text}}</h1>
% else:
        <h1><a href="/">Iron</a></h1>
% end

        <ul id="header-navigation" class="navigation">
% if not mobile:
            <li><a href="/mobile=on">View mobile site</a></li>
% end
            <li><a class="open-dialog" href="/new/{{newparent}}">New</a></li>
        </ul>

        <div id="content">

%include

        </div>

% if mobile:
        <ul id="footer-navigation" class="navigation">
            <li><a class="open-dialog" href="/new/{{newparent}}">New</a></li>
            <li><a href="/mobile=off">View full site</a></li>
        </ul>
% end
    </body>
</html>
