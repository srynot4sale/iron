<?php

    require '../../setup.php';

    // Show header
    require '../header.tpl.php';

    // Load page
    if (!isset($_GET['id'])) {
        die('No ID supplied');
    }

    $page = iron_load_data($_GET['id']);

    // If commited
    if ($_SERVER['REQUEST_METHOD'] === 'POST')
    {
        // Attempt to insert into database
        $id = iron_add_data($_POST['text'], $page['id']);

        header('Location: /'.$id);
        die();
    }

    // Show add form
    require '../views/edit.php';

    // Show footer
    require '../footer.tpl.php';
