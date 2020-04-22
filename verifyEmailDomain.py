import json
import re

def lambda_handler(event, context):
    domain = re.compile('^[a-zA-Z0-9_.+-]+@(?:(?:[a-zA-Z0-9-]+\.)?[a-zA-Z]+\.)?(bjc.org|wustl.edu)$')
    email = event
    try:
        #if domain == event['email']:
        if (domain.match(email) != None ): 
            return {
                'statusCode': 200,
                'body': json.dumps('Valid Email')
            } 
        else:
            return {
                'statusCode': 200,
                'body': json.dumps('Invalid Email')
            }
    except:
         return {
                'statusCode': 200,
                'body': json.dumps('No email has been sent in the request')
            }

