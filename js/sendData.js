$(document).ready(function () {
    const nameInput = $('#exampleInputEmail1');
    const emailInput = $('#email-input');
    const locationSelect = $('#location');
    const divisionSelect = $('#division');
    const faceShieldRadio = $("input[name='face-shield-customRadio']");
    const isolationMaskRadio = $("input[name='isolation-mask-customRadio']");
    const n95Radio = $("input[name='n95-customRadio']");
    const paprRadio = $("input[name='papr-customRadio']");
    const wipeRadio = $("input[name='wipe-customRadio']");
    const gownRadio = $("input[name='gown-customRadio']");
    const additionalInfoInput = $('#additional-text');
    const submitButton = $('#submit-button');

    let name = '';
    let email = '';
    let location = '[select a location]';
    let division = '[select a division]';
    let faceShields = 'n/a';
    let isolationMasks = 'n/a';
    let n95s = 'n/a';
    let paprs = 'n/a';
    let wipes = 'n/a';
    let gowns = 'n/a';
    let additionalInfo = '';

    faceShieldRadio.click(function() {
        let type = 'face-shield';
        let choice = $(this).attr('id');

        if (choice == `${type}-yes`) {
            faceShields = 'yes';
        } 
        else if (choice == `${type}-no`) {
            faceShields = 'no';
        } 
        else {
            faceShields = 'n/a';
        }
    });

    isolationMaskRadio.click(function() {
        let type = 'isolation-mask';
        let choice = $(this).attr('id');

        if (choice == `${type}-yes`) {
            isolationMasks = 'yes';
        } 
        else if (choice == `${type}-no`) {
            isolationMasks = 'no';
        } 
        else {
            isolationMasks = 'n/a';
        }
    });

    n95Radio.click(function() {
        let type = 'n95';
        let choice = $(this).attr('id');

        if (choice == `${type}-yes`) {
            n95s = 'yes';
        } 
        else if (choice == `${type}-no`) {
            n95s = 'no';
        } 
        else {
            n95s = 'n/a';
        }
    });

    paprRadio.click(function() {
        let type = 'papr';
        let choice = $(this).attr('id');

        if (choice == `${type}-yes`) {
            paprs = 'yes';
        } 
        else if (choice == `${type}-no`) {
            paprs = 'no';
        } 
        else {
            paprs = 'n/a';
        }
    });

    wipeRadio.click(function() {
        let type = 'wipe';
        let choice = $(this).attr('id');

        if (choice == `${type}-yes`) {
            wipes = 'yes';
        } 
        else if (choice == `${type}-no`) {
            wipes = 'no';
        } 
        else {
            wipes = 'n/a';
        }
    });

    gownRadio.click(function() {
        let type = 'gown';
        let choice = $(this).attr('id');

        if (choice == `${type}-yes`) {
            gowns = 'yes';
        } 
        else if (choice == `${type}-no`) {
            gowns = 'no';
        } 
        else {
            gowns = 'n/a';
        }
    });

    // Function taken from: https://www.w3resource.com/javascript/form/email-validation.php
    function validateEmail(email) {
        if (/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email)) {
            return true;
        }
        else {
            return false;
        }
    }
    
    function validateInputs() {
        let validInput = true;
        if (!validateEmail(email)) {
            validInput = false;
            $('#invalid-email').css('display', 'block');
        }
        if (location == '[select a location]') {
            validInput = false;
            $('#invalid-location').css('display', 'block');
        }
        if (division == '[select a division]') {
            validInput = false;
            $('#invalid-division').css('display', 'block');
        }
        return validInput;
    }

    submitButton.click(function() {
        window.scrollTo(0, 0);
        $('#invalid-email').css('display', 'none');
        $('#invalid-location').css('display', 'none');
        $('#invalid-division').css('display', 'none');

        name = nameInput.val();
        email = emailInput.val();
        location = locationSelect.val();
        division = divisionSelect.val();
        additionalInfo = additionalInfoInput.val();

        if (validateInputs()) {
            let data = {
                'name': name,
                'email': email,
                'location': location,
                'division': division,
                'faceShields': faceShields,
                'isolationMasks': isolationMasks,
                'n95s': n95s,
                'paprs': paprs,
                'wipes': wipes,
                'gowns': gowns,
                'additionalResources': additionalInfo
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
                        if (response['body']['status'] == 'success') {
                            $('#successful-submit').css('display', 'block');
                            $('#form').css('display', 'none');
                        }
                        else {
                            $('#successful-submit').css('display', 'block');
                            $('#form').css('display', 'none');
                        }
                    }
                    else {
                        ('#unsuccessful-submit').css('display', 'block');
                        $('#form').css('display', 'none');
                    }
                }
            });
        }
    });

});