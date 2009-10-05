<?php

    function iron_add_data($text)
    {
        global $db; 

        $sql = '
            INSERT INTO
                data
            (
                text
            )
            VALUES
            (
                \''.sqlite_escape_string($text).'\'
            )
        ';
        $db->queryExec($sql);

        return $db->lastInsertRowid();
    }

    function iron_add_relationship($data, $relatedto, $type)
    {
        global $db;

        $sql = '
            INSERT INTO
                "relationship"
            (
                "type",
                "primary",
                "secondary"
            )
            VALUES
            (
                '.(int)$type.',
                '.(int)$data.',
                '.(int)$relatedto.'
            )
        ';

        $db->queryExec($sql);
    }
