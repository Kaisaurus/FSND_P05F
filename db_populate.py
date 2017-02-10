''' This file is used when setting up the database for the first time or
 resetting data to the default sample data '''
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from db_setup import *


def load_default_data(session):
    '''  Loads dummy data given an using an sqlalchemy session '''

    company_1 = Company(
        name="Shirt.Woot", siteuri="http://shirt.woot.com/")
    session.add(company_1)

    sales_item_0 = SalesItem(
        name="The Binge",
        imageuri=("http://d3gqasl9vmjfd8.cloudfront.net/3b9e7d98-0758-478e-95d"
                  "c-cf335a809af7.png"),
        price="$15.00", company=company_1)
    session.add(sales_item_0)

    # commit all of that at once
    session.commit()
    session.close()


if __name__ == '__main__':
    engine = create_engine('sqlite:///catalog.db')
    Base.metadata.bind = engine
    DBSession = sessionmaker(bind=engine)
    this_session = DBSession()
    load_default_data(this_session)
    print "added items!"
