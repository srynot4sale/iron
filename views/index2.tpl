<html>
    <head>
        <title>Iron</title>

        <script type="text/javascript" src="/static/js/jquery-1.3.2.min.js"></script>
        <script type="text/javascript" src="/static/fancybox/jquery.fancybox-1.3.1.pack.js"></script>
        <script type="text/javascript" src="/static/fancybox/jquery.easing-1.3.pack.js"></script>

        <script type="text/javascript" src="/static/js/main.js"></script>

        <link rel="stylesheet" href="/static/fancybox/jquery.fancybox-1.3.1.css" type="text/css" media="screen" />
        <link rel="stylesheet" href="/static/css/global.css" type="text/css" media="screen" />
    </head>

    <body>

        <h1><a href="/">Iron</a></h1>

        <ul id="header-navigation" class="navigation">
            <li><a class="open-dialog">New</a></li>
        </ul>

        <div id="content">


        </div>

        <div id="edit-item" style="display: none; width: 50%; position: absolute; top: 40%;">
            <span id="edit-item-close">close</span>
            <form>
                <fieldset>
                    <textarea id="edit-item-text" name="text"></textarea>
                    <input id="edit-item-itemid" name="itemid" type="hidden" />
                    <input id="edit-item-parentid" name="parentid" type="hidden" />
                    <input id="edit-item-submit" type="submit" value="Save" />
                </fieldset>
            </form>
        </div>

    </body>
</html>
