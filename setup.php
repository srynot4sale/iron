<?php

    require 'lib.php';

    ob_start();

    // Connect to the database
    $path = dirname(__FILE__).'/data/main.db';
    $db = new SQLiteDatabase($path);
