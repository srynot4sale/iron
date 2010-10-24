#
#
#
#
import os.path
import json

# Load bottle framework
from lib import bottle

# Load iron's common library
from lib import common

# Load data library
from lib import items

bottle.debug(True)

# Static files
@bottle.get('/static/:filename#.+#')
def static_file(filename):
    path = os.path.join(common.cwd, 'static')
    bottle.send_file(filename, root=path)


# Define favicon.ico
@bottle.get('/favicon.ico')
def favicon():
    return ''


# Define mobile version
@bottle.get('/mobile=:toggle')
def mobile(toggle):
    if toggle == 'on':
        toggle = True
    else:
        toggle = False

    common.togglemobile(toggle)
    bottle.redirect('/')


# Define homepage
@bottle.get('/')
@bottle.view('index')
def index():
    new = items.loadNewest()

    return {
        'items': new,
        'homepage': True,
        'mobile': common.ismobile()
    }


# Define show children page
@bottle.get('/children/:parent#[0-9]+#')
@bottle.view('index')
def children(parent):
    parent_item = items.item()
    parent_item.load(parent)
    children = parent_item.get_children()

    return {
        'parent': parent_item,
        'items': children,
        'homepage': False,
        'mobile': common.ismobile()
    }


# Define create new page
@bottle.get('/new/:parent#[0-9]+#')
@bottle.view('new')
def new(parent):

    if parent == '0':
        parent_item = items.item()
        parent_item.id = 0
        parent_item.text = 'Root'
    else:
        parent_item = items.item()
        parent_item.load(parent)

    return {
        'parent': parent_item,
        'mobile': common.ismobile()
    }


# Define create new page
@bottle.post('/new/:parent#[0-9]+#')
def new(parent):

    item = items.item()
    item.set_data(bottle.request.POST)

    # Check text was actually entered
    if item.validate():
        item.save(parent)

    bottle.redirect('/')


# Define archive item page
@bottle.post('/archive/:itemid#[0-9]+#')
def archive(itemid):
    item = items.item()
    item.load(itemid)
    item.set_archived()

    bottle.redirect('/')


# Define new-style homepage
@bottle.get('/index2')
@bottle.view('index2')
def index2():
    return {
        'json': createjson('0')
    }


# Define json format data
@bottle.get('/json/:parent#[0-9]+#')
def getjson(parent):
    return createjson(parent)


def createjson(parent):

    if parent == '0':
        parent_item = items.item()
        parent_item.id = 0
        parent_item.text = 'Root'
    else:
        parent_item = items.item()
        parent_item.load(parent)

    # Load children of parent
    children = parent_item.get_children()

    childs = []
    order = 0
    for child in children:

        grand = child.get_children()

        if parent == '0':
            dc = {}
            dc['id'] = child.id
            dc['text'] = child.text
            dc['order'] = order
            dc['children_count'] = len(grand)
            dc['parent_id'] = int(parent)

            order += 1
            childs.append(dc)

        # Load children's children
        gorder = 0
        for g in grand:

            dc = {}
            dc['id'] = g.id
            dc['text'] = g.text
            dc['order'] = gorder
            dc['children_count'] = g.num_children()
            dc['parent_id'] = int(child.id)

            gorder += 1
            childs.append(dc)

    # Return as json formatted string
    return json.dumps(childs)


bottle.run(
    host = '127.0.0.1',
    port = 8083
)
