import pymysql
import sys
import logging

host = 'reportmysupplies.czvyghkkrqot.us-east-2.rds.amazonaws.com'
name = 'admin'
password = 'FezTropic365'
database = 'ReportMySupplies'

logger = logging.getLogger()
logger.setLevel(logging.INFO)

try:
    conn = pymysql.connect(host=host, user=name, passwd=password, db=database)
except pymysql.MySQLError as e:
    logger.error('ERROR: Unexpected error: Could not connect to MySQL instance.')
    logger.error(e)
    sys.exit()

logger.info('SUCCESS: Connection to RDS MySQL instance succeeded')

def postSupplies(event, context):
    # get the data from the form to stroe in database
    # name = event['name']
    # email = event['email']
    # location = event['location']
    # faceShields = event['faceShields']
    # isolationMasks = event['isolationMasts']
    # n95s = event['n95s']
    # paprs = event['paprs']
    # wipes = event['wipes']
    # gowns = event['gowns']
    # additionResources = event['additionalResources']

    name = 'ryan'
    email = 'ryanloutos@icloud.com'

    addReport = ('INSERT INTO users (name, email) VALUES (%s, %s)')
    cur = conn.cursor()
    cur.execute(addReport, (name, email))
    # result = cur.fetchone()
    result = "hey"
    conn.commit()

    response = {}
    response['headers'] = {}
    response['headers']['Content-Type'] = 'application/json'
    response['body'] = {}
    response['body']['status'] = str(result)

    return response

