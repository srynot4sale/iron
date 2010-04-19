#
#
#
#

# Load bottle framework
from lib import bottle

# Load data library
from lib import items

bottle.debug(True)


# Static files
@bottle.get('/static/:filename#.+#')
def static_file(filename):
    bottle.send_file(filename, root='/home/aaronb/code/personal/iron/public')


# Define homepage
@bottle.get('/')
@bottle.view('index')
def index():
    new = items.loadNewest()

    return {'items': new}


# Define show children page
@bottle.get('/children/:parent#[0-9]+#')
@bottle.view('children')
def new(parent):
    parent_item = items.item()
    parent_item.load(parent)
    children = parent_item.get_children()

    return {'parent': parent, 'children': children}


# Define create new page
@bottle.get('/new/:parent#[0-9]+#')
@bottle.view('new')
def new(parent):
    return {'parent': parent}


# Define create new page
@bottle.post('/new/:parent#[0-9]+#')
def new(parent):
    post = bottle.request.POST

    item = items.item()
    item.set_data(post)
    item.save(parent)

    bottle.redirect('/')


# Define archive item page
@bottle.post('/archive/:itemid#[0-9]+#')
def archive(itemid):
    item = items.item()
    item.load(itemid)
    item.set_archived()

    bottle.redirect('/')


bottle.run(
    host = '127.0.0.1',
    port = 8080
)
