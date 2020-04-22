$(document).ready(function () {

    const emailInput = $('#email-input');
    let emailValue = emailInput.val();
     // Function taken from: https://www.w3resource.com/javascript/form/email-validation.php
     function validateEmail(email) {
        if (/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email)) {
            return true;
        }
        else {
            return false;
        }
    }


    
    
    emailInput.change(function(){
        emailValue = emailInput.val();
        if(validateEmail(emailValue)){
            let data = {
                'email':emailValue
            }

            let lambdaApiUrl = 'https://5alsy89r1j.execute-api.us-east-2.amazonaws.com/prod/verifyemaildomain';
           
            $.ajax({
                type: 'POST',
                url: lambdaApiUrl,
                crossDomain: true,
                data: JSON.stringify(data),
                dataType: 'json',
                contentType: 'application/json',
                success: function(response) {
                    if (response['statusCode'] == 200) {
                        if (response['body'] == 'success') {
                            console.log("Sent to API. Valid email response");
                            $('#valid-email-domain').css('display', 'block');
                            $('#invalid-email-domain').css('display', 'none');
                        }
                        else {
                            console.log("invalid email");
                            $('#invalid-email-domain').css('display', 'block');
                            $('#valid-email-domain').css('display', 'none');
                        }
                    }
                    else {
                        console.log("no email");
                        $('#invalid-email-domain').css('display', 'none');
                        $('#valid-email-domain').css('display', 'none');
                    }
                }
            })
        }else{
            console.log("Not a real email");
        }
    })
});