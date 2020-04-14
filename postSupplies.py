import pymysql
import sys
import logging

# info to access database....could move this to its own file 
host = 'reportmysupplies.czvyghkkrqot.us-east-2.rds.amazonaws.com'
name = 'admin'
password = 'FezTropic365'
database = 'ReportMySupplies'

logger = logging.getLogger()
logger.setLevel(logging.INFO)

# connect to database
try:
    conn = pymysql.connect(host=host, user=name, passwd=password, db=database)
except pymysql.MySQLError as e:
    logger.error('ERROR: Unexpected error: Could not connect to MySQL instance.')
    logger.error(e)
    sys.exit()

logger.info('SUCCESS: Connection to RDS MySQL instance succeeded')

# lambda function to send form response to database
def postSupplies(event, context):
    
    # get data from api post
    name = event['name']
    email = event['email']
    location = event['location']
    faceShields = event['faceShields']
    isolationMasks = event['isolationMasks']
    n95s = event['n95s']
    paprs = event['paprs']
    wipes = event['wipes']
    gowns = event['gowns']
    additionalResources = event['additionalResources']

    formResponseTemplate = ('''
        INSERT INTO FormResponses (
            name, employee_email, location,
            face_shields, isolation_masks, n95s, paprs,
            wipes, gowns, additional_resources)
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
    ''')
    
    formResponseAnswers = (
        name, email, location, faceShields,
        isolationMasks, n95s, paprs, wipes,
        gowns, additionalResources
    )
    
    cur = conn.cursor()
    cur.execute(formResponseTemplate, formResponseAnswers)
    result = str(cur.fetchone())
    conn.commit()
    cur.close()
    response = {
        'statusCode': 200, 
    }

    return response

