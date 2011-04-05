# Iron util script
# Migrate from SQLite to MySQL
# Run from command line

# Params
sqlite_params = {
    'database':     '/home/aaron/code/iron/data2.db'
}

mysql_params = {
    'host':     'localhost',
    'database': 'iron',
    'user':     'iron',
    'password': 'TANwF3yUThCBuN9G'
}

# Connect to SQLite
print 'Connecting to SQLite database %s' % sqlite_params['database']

import sqlite3

sconn = sqlite3.connect(sqlite_params['database'])

# Helper function for returning dicts with named columns
def dict_factory(cursor, row):
    d = {}
    for idx, col in enumerate(cursor.description):
        d[col[0]] = row[idx]
    return d

sconn.row_factory = dict_factory

print 'Connected to SQLite'

# Connect to MySQL
print 'Connecting to MySQL database %s' % mysql_params['database']

import MySQLdb

mconn = MySQLdb.connect(
    host = mysql_params['host'],
    user = mysql_params['user'],
    passwd = mysql_params['password'],
    db = mysql_params['database']
)

print 'Connected to MySQL'


# Create tables in MySQL
print 'Creating tables in MySQL'
mc = mconn.cursor()

# Use all the SQL you like
mc.execute(
    """
        CREATE TABLE `data` (
        `uid` int(10) unsigned NOT NULL AUTO_INCREMENT,
        `id` int(10) unsigned DEFAULT NULL,
        `text` text NOT NULL,
        `updated` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        `current` tinyint(3) unsigned NOT NULL DEFAULT '1',
        `archive` tinyint(3) unsigned NOT NULL DEFAULT '0',
        PRIMARY KEY (`uid`),
        KEY `id` (`id`,`updated`,`current`,`archive`)
        ) ENGINE=MyISAM DEFAULT CHARSET=utf8;
    """
)

mc.execute(
    """
        CREATE TABLE `relationship` (
        `uid` int(10) unsigned NOT NULL AUTO_INCREMENT,
        `type` smallint(5) unsigned NOT NULL,
        `primary` int(10) unsigned NOT NULL,
        `secondary` int(10) unsigned NOT NULL,
        `added` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        `deleted` timestamp NULL DEFAULT NULL,
        PRIMARY KEY (`uid`),
        KEY `type` (`type`,`primary`,`secondary`,`deleted`)
        ) ENGINE=MyISAM DEFAULT CHARSET=utf8;
    """
)

print 'Created tables in MySQL'


# Load old queryset
print 'Loading "data" table from SQLite'

sc = sconn.cursor()
sc.execute(
    """
        SELECT
            *
        FROM
            "data"
    """
)

dcount = 0
for data_item in sc:

    # Fix null "text" column
    if data_item['text'] == None:
        data_item['text'] = ''

    # Get first part of timestamp
    data_item['updated'] = data_item['updated'].partition('.')[0]

    print data_item

    # Insert into mysql data table
    mc.execute(
        """
        INSERT INTO
            `data`
        VALUES
        (
            %s,
            %s,
            %s,
            FROM_UNIXTIME(%s),
            %s,
            %s
        )
        """,
        (
            data_item['uid'],
            data_item['id'],
            data_item['text'],
            data_item['updated'],
            data_item['current'],
            data_item['archive']
        )
    )

    dcount += 1

sc.close()

print '%d items inserted into MySQL "data" table' % dcount


# Load old queryset 2
print 'Loading "relationship" table from SQLite'

sc = sconn.cursor()
sc.execute(
    """
        SELECT
            *
        FROM
            "relationship"
    """
)

scount = 0
for data_item in sc:

    # Get first part of timestamp
    data_item['added'] = data_item['added'].partition('.')[0]

    print data_item

    # Insert into mysql data table
    mc.execute(
        """
        INSERT INTO
            `relationship`
        VALUES
        (
            %s,
            %s,
            %s,
            %s,
            FROM_UNIXTIME(%s),
            %s
        )
        """,
        (
            data_item['uid'],
            data_item['type'],
            data_item['primary'],
            data_item['secondary'],
            data_item['added'],
            data_item['deleted']
        )
    )

    scount += 1

sc.close()

print '%d items inserted into MySQL "data" table' % dcount
print '%d items inserted into MySQL "relationship" table' % scount
