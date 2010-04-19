#
#
#
#

import time
from data import conn

CHILD_OF = 1
RELATED_TO = 2


class relationship():

    # Properties
    uid = None
    type = None
    primary = None
    secondary = None
    added = None

    # Save new
    def save(self):
        c = conn.cursor()
        c.execute(
            """
                INSERT INTO
                    "relationship"
                (
                    "type",
                    "primary",
                    "secondary",
                    "added"
                )
                VALUES
                (
                    ?,
                    ?,
                    ?,
                    ?
                )
            """,
            (
                self.type,
                self.primary,
                self.secondary,
                str(time.time())
            )
        )

        self.uid = c.lastrowid

        conn.commit()
        c.close()
