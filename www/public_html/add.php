<?php

    require '../../setup.php';

    // Show header
    require '../header.tpl.php';

    // If commited
    if ($_SERVER['REQUEST_METHOD'] === 'POST')
    {
        // Attempt to insert into database
        $id = iron_add_data($_POST['text']);

        header('Location: /'.$id);
        die();
    }

    // Show add form
    require '../views/add.php';

    // Show footer
    require '../footer.tpl.php';
