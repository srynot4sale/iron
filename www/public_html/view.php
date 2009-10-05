<?php

    require '../../setup.php';

    // Show header
    require '../header.tpl.php';

    // Load page
    $query = $db->query('SELECT * FROM data WHERE uid = '.(int)$_GET['uid'].' ORDER BY id DESC');
    $page = $query->fetch(SQLITE_ASSOC);

    // If actions
    if (!empty($_GET['del'])) {
        $db->queryExec(
            '
                DELETE FROM
                    relationship
                WHERE
                (
                    "primary" = '.(int)$_GET['uid'].'
                AND "secondary" = '.(int)$_GET['del'].'
                )
                OR
                (
                    "secondary" = '.(int)$_GET['uid'].'
                AND "primary" = '.(int)$_GET['del'].'
                )
        ');
        header('Location: /'.$_GET['uid']);
        die();
    }


    // Load relationships
    $linkedto = array();
    $query = $db->query(
        '
            SELECT DISTINCT
                data.*
            FROM
                data,
                relationship
            WHERE
            (
                data.uid = relationship."secondary"
                AND relationship."primary" = '.(int)$_GET['uid'].'
            )
            OR
            (
                data.uid = relationship."primary"
                AND relationship."secondary" = '.(int)$_GET['uid'].'
            )
            ORDER BY
                data.uid DESC
    ');
    while ($relationship = $query->fetch(SQLITE_ASSOC)) {
        $linkedto[] = $relationship;
    }


    // If commited
    if ($_SERVER['REQUEST_METHOD'] === 'POST')
    {
        if (!empty($_POST['text']))
        {
            // Insert new
            $related = iron_add_data($_POST['text']);
        }
        elseif (!empty($_POST['related']))
        {
            $related = $_POST['related'];
        }

        // If we received the data we needed
        if (!empty($related))
        {
            // Attempt to insert relationship into database
            iron_add_relationship($page['uid'], $related, $_POST['type']);

            header('Location: /'.$page['uid']);
            die();
        }
    }

    // Show page and relationships
    require '../views/page.php';

    // Show footer
    require '../footer.tpl.php';

?>

