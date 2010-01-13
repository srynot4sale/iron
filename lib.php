<?php

    /**
     * Load and return data element
     *
     * @param   $id     Integer Data ID to load
     */
    function iron_load_data($id)
    {
        global $db;

        // Load page
        $page = $db->querySingle('SELECT * FROM data WHERE id = '.(int)$id.' AND current = 1', true);

        // Check there were results
        if (!$page) {
            die('Could not load data');
        }

        return $page;
    }

    /**
     * Add/update data element
     *
     * @param   $text   String  Raw data text (unescaped)
     * @param   $id     Integer Data ID to update (optional)
     */
    function iron_add_data($text, $id = NULL)
    {
        global $db;

        // Insert data
        $cols = array(
            'text',
            'updated',
            'current'
        );

        $data = array(
            sqlite_escape_string($text),
            time(),
            1
        );

        // If $id supplied, we are updating a record
        if ($id !== NULL && is_numeric($id)) {
            $cols[] = 'id';
            $data[] = (int)$id;
        }

        // Generate SQL
        $sql = '
            INSERT INTO
                data
            (
                '.implode(',', $cols).'
            )
            VALUES
            (
                \''.implode('\', \'', $data).'\'
            )
        ';

        // Insert data
        $db->exec($sql);
        $newid = $db->lastInsertRowID();

        // If a new data element, update the id
        if ($id === NULL) {
            $db->exec('
                UPDATE
                    data
                SET
                    id = '.(int)$newid.'
                WHERE
                    uid = '.(int)$newid
            );
        // If an existing element, remove current flag from old records
        } else {
            $db->exec('
                UPDATE
                    data
                SET
                    current = 0
                WHERE
                    id = '.(int)$id.'
                AND uid <> '.(int)$newid
            );
        }

        return ($id !== NULL ? $id : $newid);
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

        $db->exec($sql);
    }
