import sys
sys.path = ['.','..'] + sys.path

from lib import data

print 'Create config table in MySQL'
mc = data.conn.cursor()

mc.execute(
    """
        CREATE TABLE IF NOT EXISTS `config` (
            `uid` int(10) unsigned NOT NULL AUTO_INCREMENT,
            `name` varchar(255) NOT NULL,
            `value` text NOT NULL,
            PRIMARY KEY (`uid`),
            UNIQUE KEY `name` (`name`)
        ) ENGINE=MyISAM DEFAULT CHARSET=utf8;
    """
)


def get_current_version():
    mc.execute(
        """
            SELECT
                `value`
            FROM
                `config`
            WHERE
                `name` = 'version'
        """
    )

    result = mc.fetchone()
    if result == None:
        return None

    return int(result['value'])


def set_current_version(version):
    mc.execute(
        """
            UPDATE
                `config`
            SET
                `value` = %s
            WHERE
                `name` = 'version'
        """,
        (
            version
        )
    )



if not get_current_version():
    print 'Add version record to config'

    mc.execute(
        """
            INSERT INTO
                `config`
            (
                `name`,
                `value`
            )
            VALUES
            (
                'version',
                2011040000
            )
        """
    )

version = get_current_version()
print 'Currently at version %s' % version

upgradeto = 2011040701
if version < upgradeto:

    print 'Dropping "current" column from data table'

    mc.execute(
        """
            ALTER TABLE
                `data`
            DROP
                `current`
        """
    )

    set_current_version(upgradeto)


upgradeto = 2011040702
if version < upgradeto:

    print 'Adding "parentid" column to data table'

    mc.execute(
        """
            ALTER TABLE  `data` ADD  `parentid` INT UNSIGNED NOT NULL AFTER  `id` ,
            ADD INDEX (  `parentid` )
        """
    )

    set_current_version(upgradeto)


upgradeto = 2011040703
if version < upgradeto:

    print 'Moving relationships values into "parentid" column of data table'

    mc.execute(
        """
            SELECT
                *
            FROM
                `relationship`
            WHERE
                `type` = 1
            AND `secondary` != 0
        """
    )

    mc2 = data.conn.cursor()
    for relationship in mc:
        mc2.execute(
            """
                UPDATE
                    `data`
                SET
                    `parentid` = %s
                WHERE
                    `uid` = %s
            """,
            (
                relationship['secondary'],
                relationship['primary']
            )
        )

    mc2.close()

    set_current_version(upgradeto)


upgradeto = 2011040704
if version < upgradeto:

    print 'Dropping "relationship" table'

    mc.execute(
        """
            DROP TABLE
                `relationship`
        """
    )

    set_current_version(upgradeto)


upgradeto = 2011052700
if version < upgradeto:

    print 'Adding "ownerid" column to data table'

    mc.execute(
        """
            ALTER TABLE  `data` ADD  `ownerid` INT UNSIGNED NOT NULL AFTER  `id` ,
            ADD INDEX (  `ownerid` )
        """
    )

    set_current_version(upgradeto)


upgradeto = 2011052701
if version < upgradeto:

    print 'Update "ownerid" to be 2 for existing data'

    mc.execute(
        """
            UPDATE
                `data`
            SET
                `ownerid` = 2
        """
    )

    set_current_version(upgradeto)


mc.close()
