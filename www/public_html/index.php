<?php

    require '../../setup.php';

    // Show header
    require '../header.tpl.php';

    // Load all pages
    $pages = array();
    $query = $db->query('
        SELECT DISTINCT
            data.*,
            COUNT(relationship.uid) AS links
        FROM
            data
        LEFT JOIN
            relationship
        ON
            data.uid = relationship."primary"
        OR  data.uid = relationship."secondary"
        GROUP BY
            data.uid
        ORDER BY
            COUNT(relationship.uid) DESC,
            data.uid DESC
    ');
    while ($page = $query->fetch(SQLITE_ASSOC))
    {
        $pages[] = $page;
    }

    // Show table
    require '../views/index.php';

    // Show footer
    require '../footer.tpl.php';

?>

