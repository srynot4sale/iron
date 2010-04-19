
import sqlite3

# Connect to db
conn = sqlite3.connect('/home/aaronb/code/personal/iron/data.db')

def dict_factory(cursor, row):
    d = {}
    for idx, col in enumerate(cursor.description):
        d[col[0]] = row[idx]
    return d

conn.row_factory = dict_factory
