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
            data.id = relationship."primary"
        OR  data.id = relationship."secondary"
        WHERE
            data.current = 1
        GROUP BY
            data.id
        ORDER BY
            COUNT(relationship.uid) DESC,
            data.id DESC
    ');

    while ($page = $query->fetchArray(SQLITE_ASSOC))
    {
        $pages[] = $page;
    }

    // Show table
    require '../views/index.php';

    // Show footer
    require '../footer.tpl.php';

?>

