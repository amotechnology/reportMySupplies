$(document).ready(function () {
    const nameInput = $('#exampleInputEmail1');
    const emailInput = $('#email-input');
    const locationSelect = $('#location');
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
    let location = '';
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

    submitButton.click(function() {
        name = nameInput.val();
        email = emailInput.val();
        location = locationSelect.val();
        additionalInfo = additionalInfoInput.val();

        let data = {
            'name': name,
            'email': email,
            'location': location,
            'faceShields': faceShields,
            'isolationMasks': isolationMasks,
            'n95s': n95s,
            'paprs': paprs,
            'wipes': wipes,
            'gowns': gowns,
            'additionalResources': additionalInfo
        }

        let lambdaApiUrl = 'https://5alsy89r1j.execute-api.us-east-2.amazonaws.com/prod/form';
        $.ajax({
            type: 'POST',
            url: lambdaApiUrl,
            crossDomain: true,
            data: JSON.stringify(data),
            dataType: 'json',
            contentType: 'plain/text',
            success: function(data) {
                console.log(data);
            }
        });
    });

});