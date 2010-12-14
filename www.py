#
#
#
#
import os.path

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


# Define homepage
@bottle.get('/')
@bottle.view('index')
def index():
    return {
        'json': items.createjson('0')
    }


# Define json format data
@bottle.get('/json/:parent#[0-9]+#')
def getjson(parent):
    return items.createjson(parent)




bottle.run(
    host = '127.0.0.1',
    port = 8083
)
