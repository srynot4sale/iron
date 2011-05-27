#
#
#
#

import sys

# If version 2.6 or greater
if sys.version_info[0] >= 3 or sys.version_info[1] >= 6:
    import json
else:
    import simplejson as json

import time
from data import conn


OWNER_ID = None

def setowner(ownerid):
    global OWNER_ID
    OWNER_ID = ownerid


class item():

    # Database mapped properties
    uid = None
    id = None
    text = None
    updated = None

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
                    `data`
                WHERE
                    `id` = %s
                AND
                    `ownerid` = %s
            """,
            (
                id,
                OWNER_ID
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
        return len(loadChildren(self.id))


    # Archive this item
    def set_archived(self):
        c = conn.cursor()
        c.execute(
            """
                UPDATE
                    `data`
                SET
                    `archive` = 1
                WHERE
                    `id` = %s
                AND
                    `ownerid` = %s
            """,
            (
                self.id,
                OWNER_ID
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
                    `data`
                (
                    `text`,
                    `updated`,
                    `parentid`,
                    `ownerid`
                )
                VALUES
                (
                    %s,
                    FROM_UNIXTIME(%s),
                    %s,
                    %s
                )
            """,
            (
                self.text,
                int(time.time()),
                parent,
                OWNER_ID
            )
        )

        self.uid = c.lastrowid
        self.id = self.uid

        # Update the id
        c.execute(
            """
                UPDATE
                    `data`
                SET
                    `id` = %s
                WHERE
                    `uid` = %s
                AND `ownerid` = %s
            """,
            (
                self.id,
                self.uid,
                OWNER_ID
            )
        )

        conn.commit()
        c.close()


def loadNewest():
    return loadChildren(0)


# Return a list of all children of a parent
# Parent 0 = the root nodes

def loadChildren(parent):
    c = conn.cursor()
    c.execute(
        """
            SELECT
                `data`.`uid`,
                `data`.`id`,
                `data`.`text`,
                `data`.`updated`,
                `children`.`count`
            FROM
                `data`
            LEFT JOIN
                (
                    SELECT
                        `data`.`parentid` AS `id`,
                        COUNT(`data`.`uid`) AS `count`
                    FROM
                        `data`
                    WHERE
                        `data`.`archive` = 0
                    AND `data`.`parentid` = %s
                    AND `data`.`ownerid` = %s
                    GROUP BY
                        `data`.`parentid`
                ) AS `children`
             ON `children`.`id` = `data`.`id`
            WHERE
                `data`.`archive` = 0
            AND `data`.`parentid` = %s
            AND `data`.`ownerid` = %s
        """,
        (
            parent,
            OWNER_ID,
            parent,
            OWNER_ID
        )
    )

    items = []

    for data in c:
        new = item()
        new.set_data(data)

        items.append(new)

    c.close()
    return items


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