import json
import re

def verifyEmailDomain(event, context):
    domain = re.compile('^[a-zA-Z0-9_.+-]+@(?:(?:[a-zA-Z0-9-]+\.)?[a-zA-Z]+\.)?(bjc.org|wustl.edu)$')
    try:
        if (domain.match(event['email']) != None ): 
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

