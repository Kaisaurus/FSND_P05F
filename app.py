from flask import Flask, render_template, request, redirect, \
    url_for, flash, jsonify, make_response
from flask import session as login_session
import random
import string
import httplib2
import json
import requests
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from db_setup import Base, Category, Brand, Item, User
from oauth2client.client import flow_from_clientsecrets
from oauth2client.client import FlowExchangeError

# from handlers.bloghandler import BlogHandler

app = Flask(__name__)
engine = create_engine('sqlite:///catalog.db')
Base.metadata.bind = engine

DBSession = sessionmaker(bind=engine)
session = DBSession()


def getFlashMsg(action, **kwargs):
    msg = json.loads(open('flash_msgs.json', 'r').read())['web'][action]
    flash("").format()
    print msg


@app.route('/')
def showHome():
    categories = reversed(session.query(Category).all())
    brands = reversed(session.query(Brand).all())
    return render_template('index.html', categories=categories, brands=brands)


@app.route('/new_category', methods=['POST'])
def newCategory():
    if request.method == 'POST':
        try:
            name = request.json['name']
            newItem = Category(
                name=name)
            # user_id=login_session['user_id'])
            session.add(newItem)
            session.commit()
            return jsonify(success=1,
                           id=newItem.id,
                           msg="Category " + name + " added!")
        except Exception, e:
            return jsonify(success=0, msg=str(e))


@app.route('/delete_category', methods=['POST'])
def deleteCategory():
    if request.method == 'POST':
        try:
            catID = request.json['id']
            item = session.query(Category).filter_by(id=catID).one()
            # user_id=login_session['user_id'])
            session.delete(item)
            session.commit()
            return jsonify(success=1,
                           id=catID,
                           msg="Category " + item.name + " Deleted.")
        except Exception, e:
            return jsonify(success=0, msg=str(e))


@app.route('/edit_category', methods=['POST'])
def editCategory():
    if request.method == 'POST':
        try:
            catID = request.json['id']
            editCat = session.query(Category).filter_by(id=catID).one()
            oldName = editCat.name
            newName = request.json['name']
            editCat.name = newName
            session.add(editCat)
            session.commit()
            return jsonify(success=1,
                           id=catID,
                           msg='Category '+oldName+' changed to '+newName)
        except Exception, e:
            return jsonify(success=0, msg=str(e))


@app.route('/login')
def showLogin():
    state = ''.join(random.choice(string.ascii_uppercase + string.digits)
                    for x in xrange(32))
    login_session['state'] = state
    return render_template('login.html',
                           STATE=state)


def getSessionUserID():
    try:
        user_id = login_session['user_id']
        return user_id
    except:
        return None

if __name__ == '__main__':
    app.debug = True
    app.secret_key = 'super_secret_key'
    app.run(host='0.0.0.0', port=5000)
