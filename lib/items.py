#
#
#
#

import sys

# If version 2.6 or greater
if sys.version_info[0] >= 3 or sys.version_info[1] >= 6:
    import json
else:
    import simplejson

import time
import relationships
from data import conn

class item():

    # Database mapped properties
    uid = None
    id = None
    text = None
    updated = None
    current = None

    # Meta properties (no corresponding db column)
    count = None


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

        c.close()

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


    # Count children
    def num_children(self):
        return countChildren(self.id)


    # Archive this item
    def set_archived(self):
        c = conn.cursor()
        c.execute(
            """
                UPDATE
                    "data"
                SET
                    "archive" = 1
                WHERE
                    "id" = ?
            """,
            (
                self.id,
            )
        )

        conn.commit()
        c.close()


    # Validate item
    def validate(self):
        if len(self.text):
            return True
        else:
            return False


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


# Return a list of all children of a parent
# Parent 0 = the root nodes
def loadChildren(parent):
    c = conn.cursor()
    c.execute(
        """
            SELECT
                "data"."uid",
                "data"."id",
                "data"."text",
                "data"."updated",
                "data"."current",
                "children"."count"
            FROM
                "data"
            INNER JOIN
                "relationship"
             ON "relationship"."primary" = "data"."id"
            LEFT JOIN
                (
                    SELECT
                        "relationship"."secondary" AS "id",
                        COUNT("relationship"."uid") AS "count"
                    FROM
                        "relationship"
                    INNER JOIN
                        "data"
                     ON "data"."id" = "relationship"."primary"
                    WHERE
                        "data"."current" = 1
                    AND "data"."archive" = 0
                    AND "relationship"."type" = :rel
                    GROUP BY
                        "relationship"."secondary"
                ) AS "children"
             ON "children"."id" = "data"."id"
            WHERE
                "data"."current" = 1
            AND "data"."archive" = 0
            AND "relationship"."secondary" = :parent
            AND "relationship"."type" = :rel
        """,
        {
            'parent': parent,
            'rel': relationships.CHILD_OF,
        }
    )

    items = []

    for data in c:
        new = item()
        new.set_data(data)

        items.append(new)

    c.close()
    return items


# Return a count of all children of a parent
# Parent 0 = the root nodes
def countChildren(parent):
    c = conn.cursor()
    c.execute(
        """
            SELECT
                COUNT("data"."id") AS "count"
            FROM
                "data"
            INNER JOIN
                "relationship"
             ON "relationship"."primary" = "data"."id"
            LEFT JOIN
                (
                    SELECT
                        "relationship"."secondary" AS "id",
                        COUNT("relationship"."uid") AS "count"
                    FROM
                        "relationship"
                    INNER JOIN
                        "data"
                     ON "data"."id" = "relationship"."primary"
                    WHERE
                        "data"."current" = 1
                    AND "data"."archive" = 0
                    AND "relationship"."type" = :rel
                    GROUP BY
                        "relationship"."secondary"
                ) AS "children"
             ON "children"."id" = "data"."id"
            WHERE
                "data"."current" = 1
            AND "data"."archive" = 0
            AND "relationship"."secondary" = :parent
            AND "relationship"."type" = :rel
        """,
        {
            'parent': parent,
            'rel': relationships.CHILD_OF,
        }
    )

    count = 0

    if c:
        for data in c:
            count = data['count']

    c.close()
    return count



# Create json array of items
def createjson(parent):

    if parent == '0':
        parent_item = item()
        parent_item.id = 0
        parent_item.text = 'Root'
    else:
        parent_item = item()
        parent_item.load(parent)

    # Load children of parent
    children = parent_item.get_children()

    data = []
    for child in children:

        grand = child.get_children()

        dc = {}
        dc['id'] = child.id
        dc['text'] = child.text
        dc['children_count'] = len(grand)
        dc['parent_id'] = int(parent)

        data.append(dc)


    # Return as json formatted string
    return json.dumps(data)
