# retrieveData.py by Daniel Sosebee - queries to get form entries and summary statistics from the ReportMySupplies RDS
# see /archive/example.json to see how to use this lambda

import pymysql
import sys
import logging

# info to access database
host = 'reportmysupplies.czvyghkkrqot.us-east-2.rds.amazonaws.com'
name = 'admin'
password = 'FezTropic365'
database = 'ReportMySupplies'

logger = logging.getLogger()
logger.setLevel(logging.INFO)

# connect to database
try:
    conn = pymysql.connect(host=host, user=name, passwd=password, db=database, cursorclass=pymysql.cursors.DictCursor)
except pymysql.MySQLError as e:
    logger.error('ERROR: Unexpected error: Could not connect to MySQL instance.')
    logger.error(e)
    sys.exit()


def no_query_type_specified(event):
    return {
        'statusCode': 400,
        'body': {
            'status': 'failure',
            'message': 'Error: No query_type specified in request body.'
        }
    }


def y_axis_not_specified():
    return {
        'statusCode': 400,
        'body': {
            'status': 'failure',
            'message': 'Error: You did not specify a y axis.'
        }
    }


def invalid_ppe():
    return {
        'statusCode': 400,
        'body': {
            'status': 'failure',
            'message': 'Error: You specified invalid PPE.'
        }
    }


def invalid_date_range():
    return {
        'statusCode': 400,
        'body': {
            'status': 'failure',
            'message': 'Error: Something wrong with your date range.'
        }
    }


# creates the sql to filter for location, division, or date range
# event is the request body, and mid_where is whether we are in the middle of a where statement already
def filter_sql(event, mid_where):

    sql = ""

    # filter locations as specified in event
    if 'location' in event and len(event['location']) > 0:
        if (mid_where):
            sql += ") and ("
        else :
            mid_where = True
            sql += " where (("
        for location in event['location']:
            safe_location = pymysql.escape_string(location)
            sql += "\"{}\", ".format(safe_location)
        sql = sql[:-2] + ")"

    #filter divisions as specified in event
    if 'division' in event and len(event['division']) > 0:
        if (mid_where):
            sql += ") and ("
        else :
            mid_where = True
            sql += " where (("
        sql += "division in ("
        for division in event['division']:
            safe_division = pymysql.escape_string(division)
            sql += "\"{}\", ".format(safe_division)
        sql = sql[:-2] + ")"

    #filter dates as specified in event
    if 'date_range' in event:
        date_range = event['date_range'].split()
        if len(date_range) == 2:
            if (mid_where):
                sql += ") and ("
            else:
                mid_where = True
                sql += " where (("
            safe_start_date = pymysql.escape_string(date_range[0])
            safe_end_date = pymysql.escape_string(date_range[1])
            sql += "timestamp BETWEEN \"{}\" AND \"{} 23:59:59.993\"".format(safe_start_date, safe_end_date)
        else:
            return invalid_date_range()

    # if we had a where statement, end it here
    if (mid_where):
        sql += "))"

    return sql


# executes the query and returns the result
def execute(sql):
    try:
        with conn.cursor() as cursor:
            cursor.execute(sql)
            conn.commit()
            result = cursor.fetchall()
            cursor.close()
    except pymysql.MySQLError as e:
        return {
            'statusCode': 400,
            'body': {
                'status': 'failure',
                'message': str(e)
            }
        }
    return {
        'statusCode': 200,
        'body': result
    }


def submission_count(event):
    
    # default ppe list, all options
    ppeList = ['face_shields', 'wipes', 'gowns', 'n95s', 'isolation_masks', 'paprs']

    # set up y axis to display names along the left column
    if 'y_axis' not in event:
        return y_axis_not_specified()
    stated_y_axis = pymysql.escape_string(event['y_axis'])
    if stated_y_axis in['date', 'datetime', 'timestamp', 'date_range']:
        y_axis = "DATE(timestamp)"
    else:
        y_axis = stated_y_axis
    sql = "SELECT {} as {}".format(y_axis, stated_y_axis)
    
    # set up the counts of ppe
    if 'ppe' in event and len(event['ppe']) > 0:
        for ppe in event['ppe']:
            if not ppe in ppeList:
                return invalid_ppe()
        ppeList = event['ppe']
    for ppe in ppeList:
        sql += ", COUNT(CASE WHEN {} = \"no\" then 1 end) as {}".format(ppe,ppe)
    
    # add a column for additional comments
    if 'additional_resources' in event and event['additional_resources'] == 'yes':
        sql += ", COUNT(CASE WHEN CHAR_LENGTH(additional_resources) > 2 then 1 end) as additional_resources"

    sql += " from FormResponses"

    # get the filters on the sql, or return an error if there is one
    filter_sql_response = filter_sql(event, False)
    if hasattr(filter_sql_response, '__call__'):
        return filter_sql_response()
    else:
        sql += filter_sql_response

    # group rows by our specified y axis
    sql += " GROUP BY " + y_axis + ";"
    
    print("\n\n" + sql + "\n\n")

    return execute(sql)


# TODO: this will be used make a query for entire submissions
def submission_full(event):
    pass


# functions to query the database, or to return different error codes
query_functions = {
    'count': submission_count,
    'select': submission_full,
    'no_query_type_specified': no_query_type_specified
}


# lambda function to retrieve supply chain data, outsourced to query functions
def retrieve_data(event, context):
    query_type = event.get("query_type", "no_query_type_specified")
    query_function = query_functions[query_type]
    response = query_function(event)
    return response

result = retrieve_data({
        "query_type": "count",
        "y_axis": "location",
        "additional_resources": "yes",
        "ppe":[
            "gowns",
            "face_shields",
            "n95s"
        ],
        "date_range": "2020-04-12 2020-04-19"
}, 0)

print(result)