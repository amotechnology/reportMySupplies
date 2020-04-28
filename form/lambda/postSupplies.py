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
    conn = pymysql.connect(host=host, user=name, passwd=password, db=database)
except pymysql.MySQLError as e:
    logger.error('ERROR: Unexpected error: Could not connect to MySQL instance.')
    logger.error(e)
    sys.exit()

# lambda function to send form response to database
def postSupplies(event, context):
    
    # get data from api post
    name = event['name']
    email = event['email']
    location = event['location']
    division = event['division']
    faceShields = event['faceShields']
    isolationMasks = event['isolationMasks']
    n95s = event['n95s']
    paprs = event['paprs']
    wipes = event['wipes']
    gowns = event['gowns']
    additionalResources = event['additionalResources']

    formResponseTemplate = ('''
        INSERT INTO FormResponses (
            name, employee_email, location, division,
            face_shields, isolation_masks, n95s, paprs,
            wipes, gowns, additional_resources)
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
    ''')
    
    formResponseAnswers = (
        name, email, location, division, 
        faceShields, isolationMasks, n95s, 
        paprs, wipes, gowns, additionalResources
    )
    
    try:
        with conn.cursor() as cursor:
            cursor.execute(formResponseTemplate, formResponseAnswers)
            conn.commit()
            cursor.close()
    except pymysql.MySQLError as e:
        return {
            'statusCode': 200,
            'body': {
                'status': 'failure',
                'message': str(e)
            }
        }

    return {
        'statusCode': 200,
        'body': {
            'status': 'success'
        } 
    }

