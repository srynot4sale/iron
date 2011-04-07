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
    c = data.conn.cursor()
    c.execute(
        """
            SELECT
                `value`
            FROM
                `config`
            WHERE
                `name` = 'version'
        """
    )

    result = c.fetchone()
    if result == None:
        return None

    return int(result['value'])


def set_current_version(version):
    c = data.conn.cursor()
    c.execute(
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
