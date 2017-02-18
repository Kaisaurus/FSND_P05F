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


@app.context_processor
def utility_processor():
    # utility function to check if image is valid (called in templates)
    def exists(path, placeholder):
        try:
            r = requests.head(path)
            if r.status_code == requests.codes.ok:
                return path
            else:
                return placeholder
        except:
            return placeholder
    return dict(exists=exists)


@app.route('/')
def showHome():
    # reversed order is used so new shows first and also makes sense with new
    # dynamic content that is added by the user
    #
    # list is used so it can be iterated more than once easily
    categories = list(reversed(session.query(Category).all()))
    brands = list(reversed(session.query(Brand).all()))
    products = list(reversed(session.query(Item).all()))
    return render_template('index.html',
                           categories=categories,
                           brands=brands,
                           products=products)


@app.route('/new_product', methods=['POST'])
def newProduct():
    if request.method == 'POST':
        try:
            name = request.json['name']
            category = session.query(Category).filter_by(
                id=request.json['category']).one()
            newItem = Item(
                name=name,
                category=category,
                img_url=request.json['img_url'],
                description=request.json['description'])
            # user_id=login_session['user_id'])
            session.add(newItem)
            session.commit()
            print "succcess"
            return jsonify(success=1,
                           id=newItem.id,
                           msg="Product " + name + " added!")
        except Exception, e:
            print "fail"
            print str(e)
            return jsonify(success=0, msg=str(e))


@app.route('/edit_product', methods=['POST'])
def editProduct():
    if request.method == 'POST':
        try:
            productID = request.json['id']
            product = session.query(Item).filter_by(id=productID).one()
            productName = request.json['name']
            product.name = productName
            product.img_url = request.json['img_url']
            product.description = request.json['description']
            '''category = session.query(Category).filter_by(
                id=request.json['category']).one()
            product.category = category
            '''
            session.add(product)
            session.commit()
            return jsonify(success=1,
                           msg='Product '+productName+' succesfully edited.')
        except Exception, e:
            return jsonify(success=0, msg=str(e))


@app.route('/delete_product', methods=['POST'])
def deleteProduct():
    if request.method == 'POST':
        try:
            productID = request.json['id']
            product = session.query(Item).filter_by(id=productID).one()
            # user_id=login_session['user_id'])
            session.delete(product)
            session.commit()
            return jsonify(success=1,
                           id=productID,
                           msg='Product '+product.name+' deleted.')
        except Exception, e:
            return jsonify(success=0, msg=str(e))


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
                           msg="Category " + item.name + " deleted.")
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
                           msg='Category '+oldName+' changed to '+newName+'.')
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

# API endpoint (GET request)


@app.route('/products/JSON')
def productsJSON():
    products = session.query(Item).all()
    return jsonify(products=[i.serialize for i in products])


@app.route('/products/<int:product_id>/JSON')
def singleProductJSON(product_id):
    print str(product_id)
    product = session.query(Item).filter_by(id=product_id).one()
    return jsonify(product=product.serialize)


if __name__ == '__main__':
    app.debug = True
    app.secret_key = 'super_secret_key'
    app.run(host='0.0.0.0', port=5000)
