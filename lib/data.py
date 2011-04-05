# Database connection and utilies
import MySQLdb
import MySQLdb.cursors

# Load common file
from lib import common

USER = 'iron'
PASSWORD = 'TANwF3yUThCBuN9G'

# Connect to the db
conn = MySQLdb.connect(
    host = 'localhost',
    db = 'iron',
    user = USER,
    passwd = PASSWORD,
    cursorclass = MySQLdb.cursors.DictCursor
)
