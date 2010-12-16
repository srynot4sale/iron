# Setup database and migrate from sqlite

import lib.data

# Get sqlite connection
import sqlite3, os.path

# Load common file
from lib import common

# Generate path
path = os.path.join(common.cwd, 'data.db')

# Check db exists
if not os.path.isfile(path):
    raise Exception, 'Could not load data.db %s' % path

# Connect to the db
conn = sqlite3.connect(path)

# Helper function for returning dicts with named columns
def dict_factory(cursor, row):
    d = {}
    for idx, col in enumerate(cursor.description):
        d[col[0]] = row[idx]
    return d

conn.row_factory = dict_factory


# Get couchdb connection
couch = lib.data.database('127.0.0.1')

def setup():

    print "\nCreate couchdb db"
    couch.createDb('iron')

    print "\nLoad items"
    c = conn.cursor()
    c.execute(
        """
            SELECT
                *
            FROM
                "data"
            WHERE
                "archive" != 1
            ORDER BY
                "id" ASC
        """
    )

    items = []

    for data in c:
        items.append(data)

    c.close()

    print "\n%d items" % len(items)
    print items[0]

    print "\nLoad relationships"
    c = conn.cursor()
    c.execute(
        """
            SELECT
                *
            FROM
                "relationship"
        """
    )

    relationships = {}
    for rel in c:
        relationships[int(rel['primary'])] = rel['secondary']

    c.close()

    print "\n%d relationships" % len(relationships)


    print "\nMigrate data from sqlite"

    newids = {}
    newids[0] = '0';

    for data in items:

        print data['id']
        parent_id = relationships[int(data['id'])]

        doc = """
        {
            "value": {
                "text": "%s",
                "updated": "%s",
                "parent_id": "%s"
            }
        }
        """ % (
            data['text'],
            data['updated'],
            newids[int(parent_id)]
        )

        id = couch.saveDoc('iron', doc)
        print id
        newids[data['id']] = id


setup()
