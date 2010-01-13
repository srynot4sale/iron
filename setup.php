<?php

    require 'lib.php';

    ob_start();

    // Connect to the database
    $path = dirname(__FILE__).'/data/main.v3.db';
    $db = new SQLite3($path);
