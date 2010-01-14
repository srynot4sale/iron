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
        $db->query(
            '
                DELETE FROM
                    relationship
                WHERE
                    uid = '.(int)$_GET['del'].'
        ');
        header('Location: /'.$_GET['id']);
        die();
    }


    // Load relationships
    // Load parents
    $parents = array();
    $query = $db->query(
        '
            SELECT DISTINCT
                data.*,
                r.uid AS rid
            FROM
                data
            INNER JOIN
                relationship r
             ON r."primary" = data.id
            WHERE
                data.current = 1
            AND r.type = 2
            AND r."secondary" = '.(int)$page['id'].'
            ORDER BY
                data.id DESC
    ');
    while ($parent = $query->fetchArray(SQLITE_ASSOC)) {
        $parents[] = $parent;
    }

    // Load children
    $children = array();
    $query = $db->query(
        '
            SELECT DISTINCT
                data.*,
                r.uid AS rid
            FROM
                data
            INNER JOIN
                relationship r
             ON r."secondary" = data.id
            WHERE
                data.current = 1
            AND r.type = 2
            AND r."primary" = '.(int)$page['id'].'
            ORDER BY
                data.id DESC
    ');
    while ($child = $query->fetchArray(SQLITE_ASSOC)) {
        $children[] = $child;
    }

    // Load related
    $relatedto = array();
    $query = $db->query(
        '
            SELECT DISTINCT
                data.*,
                r.uid AS rid
            FROM
                data,
                relationship r
            WHERE
                data.current = 1
            AND r.type = 1
            AND
            (
                (
                    data.id = r."secondary"
                    AND r."primary" = '.(int)$_GET['id'].'
                )
                OR
                (
                    data.id = r."primary"
                    AND r."secondary" = '.(int)$_GET['id'].'
                )
            )
            ORDER BY
                data.id DESC
    ');
    while ($relationship = $query->fetchArray(SQLITE_ASSOC)) {
        $relatedto[] = $relationship;
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

