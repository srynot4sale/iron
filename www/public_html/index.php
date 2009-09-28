<?php

    require '../../setup.php';

    // Show header
    require '../header.tpl.php';

    // Load all pages
    $pages = array();
    $query = $db->query('SELECT * FROM data ORDER BY uid DESC');
    while ($page = $query->fetch(SQLITE_ASSOC))
    {
        $pages[] = $page;
    }

    // Show table
    require '../views/index.php';

    // Show footer
    require '../footer.tpl.php';

?>

