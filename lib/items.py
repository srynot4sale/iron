#
#
#
#

import time
import relationships
from data import conn

class item():

    # Properties
    uid = None
    id = None
    text = None
    updated = None
    current = None


    # Load from database
    def load(self, id):
        c = conn.cursor()
        c.execute(
            """
                SELECT
                    *
                FROM
                    "data"
                WHERE
                    "id" = ?
                AND
                    "current" = 1
            """,
            (
                id,
            )
        );

        self.set_data(c.fetchone())

        if self.uid < 1:
            raise Exception('item does not exist')


    # Update data from dict
    def set_data(self, data):
        for key in data.keys():
            if hasattr(self, key):
                setattr(self, key, data[key])


    # Get children
    def get_children(self):
        return loadChildren(self.id)


    # Save item to database as new item
    def save(self, parent):
        c = conn.cursor()
        c.execute(
            """
                INSERT INTO
                    data
                (
                    text,
                    updated
                )
                VALUES
                (
                    ?,
                    ?
                )
            """,
            (
                self.text,
                str(time.time())
            )
        )

        self.uid = c.lastrowid
        self.id = self.uid

        # Update the id
        c.execute(
            """
                UPDATE
                    data
                SET
                    id = ?
                WHERE
                    uid = ?
            """,
            (
                self.id,
                self.uid
            )
        )

        conn.commit()
        c.close()

        # Create relationship to parent
        rel = relationships.relationship()
        rel.type = relationships.CHILD_OF
        rel.primary = self.id
        rel.secondary = parent
        rel.save()


def loadNewest():
    return loadChildren(0)


def loadChildren(parent):
    c = conn.cursor()
    c.execute(
        """
            SELECT
                "data"."uid",
                "data"."id",
                "data"."text",
                "data"."updated",
                "data"."current"
            FROM
                "data"
            INNER JOIN
                "relationship"
             ON "relationship"."primary" = "data"."id"
            WHERE
                "data"."current" = 1
            AND "relationship"."secondary" = ?
            AND "relationship"."type" = ?
        """,
        (
            parent,
            relationships.CHILD_OF,
        )
    )

    items = []

    for data in c:
        new = item()
        new.set_data(data)

        items.append(new)

    c.close()
    return items