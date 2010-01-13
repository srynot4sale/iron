<?php

    require '../../setup.php';

    // Show header
    require '../header.tpl.php';

    // Load page
    if (!isset($_GET['id'])) {
        die('No ID supplied');
    }

    $page = iron_load_data($_GET['id']);

    // If actions
    if (!empty($_GET['del'])) {
        $db->queryExec(
            '
                DELETE FROM
                    relationship
                WHERE
                (
                    "primary" = '.(int)$_GET['id'].'
                AND "secondary" = '.(int)$_GET['del'].'
                )
                OR
                (
                    "secondary" = '.(int)$_GET['id'].'
                AND "primary" = '.(int)$_GET['del'].'
                )
        ');
        header('Location: /'.$_GET['id']);
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
                data.current = 1
            AND
            (
                (
                    data.id = relationship."secondary"
                    AND relationship."primary" = '.(int)$_GET['id'].'
                )
                OR
                (
                    data.id = relationship."primary"
                    AND relationship."secondary" = '.(int)$_GET['id'].'
                )
            )
            ORDER BY
                data.id DESC
    ');
    while ($relationship = $query->fetchArray(SQLITE_ASSOC)) {
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
            iron_add_relationship($page['id'], $related, $_POST['type']);

            header('Location: /'.$page['id']);
            die();
        }
    }

    // Show page and relationships
    require '../views/page.php';

    // Show footer
    require '../footer.tpl.php';

?>

