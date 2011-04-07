# Database connection and utilies
import MySQLdb
import MySQLdb.cursors

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
