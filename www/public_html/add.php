<?php

    require '../../setup.php';

    // Show header
    require '../header.tpl.php';

    // If commited
    if ($_SERVER['REQUEST_METHOD'] === 'POST')
    {
        // Attempt to insert into database
        $sql = '
            INSERT INTO
                data
            (
                text
            )
            VALUES
            (
                \''.sqlite_escape_string($_POST['text']).'\'
            )
        ';
        $db->queryExec($sql);

        header('Location: /');
        die();
    }
    else
    {
        // Show add form
        require '../views/add.php';
    }

    // Show footer
    require '../footer.tpl.php';

?>

