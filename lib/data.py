
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

def dict_factory(cursor, row):
    d = {}
    for idx, col in enumerate(cursor.description):
        d[col[0]] = row[idx]
    return d

conn.row_factory = dict_factory
