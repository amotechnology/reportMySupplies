// Return a custom link to reportmysupplies.app with parameters email and location
// (this will lead those fields to be pre-filled in the embedded form at reportmysupplies.app)
function generateLink(email, location) {
    return `https://www.reportmysupplies.app?email=${encodeURI(email)}&location=${encodeURI(location)}`;
}

// Returns html to create two buttons, one to copy a link and one to open the link
function generateLinksHTML() {
    let html = `
<div class="btn-toolbar btn-toolbar-lg text-center" role="toolbar" />
    <div class="btn-group btn-group-lg" role="group">
        <button class = "btn-light btn-lg" id="copy-button">Copy Link</button>
    </div>
    <div class="btn-group" role="group">
        <button class = "btn-light btn-lg" id="open-button">Open Link</button>
    </div>
</div>
`
    return html;
}

// Copies the str to the clipboard of the user (shameless stackoverflow steal)
const copyToClipboard = (str) => {
    const el = document.createElement('textarea');
    el.value = str;
    document.body.appendChild(el);
    el.select();
    document.execCommand('copy');
    document.body.removeChild(el);
};

// Updates the response area to represent a proper response to 
// the current inputted email and location (or lack thereof)
function updateResponseArea() {
    let locVal = $('#location').children("option:selected").val();
    if (locVal == "[select a location]") {
        locVal = "";
    }
    let emailVal = $('#email').val();
    if (emailVal == "undefined") {
        emailVal = "";
    }
    let locEmpty = (locVal == "");
    let emailEmpty = (emailVal == "");
    
    // This string will be set as the html contents of the #response-area div
    let html = "";

    if (locEmpty && emailEmpty) {
        html = `<p><i>Please input your email address and/or location</i></p>`;
    } else {
        if (locEmpty) {
            html = `<p>Here's your form link with pre-filled email address <strong>${emailVal}</strong>, but no pre-filled location:</p>`;
        } else if (emailEmpty) {
            html = `<p>Here's your form link with pre-filled location <strong>${locVal}</strong>, but no pre-filled email address:</p>`;
        } else {
            html = `<p>Here's your form link with pre-filled email address <strong>${emailVal}</strong> and pre-filled location <strong>${locVal}</strong>:</p>`;
        }

        // We generate links in every scenario, unless the user has inputted absolutely nothing
        html = html + generateLinksHTML();
    }
    $('#response-area').html(html);

    // Link the buttons, now that the html exists
    const prefilledLink = generateLink(emailVal, locVal);
    $('#copy-button').on('click', function () {
        copyToClipboard(prefilledLink);
        $('#copy-button').text("Link Copied");
    });
    $('#open-button').on('click', function () {
        window.open(prefilledLink, '_blank');
    });
}

$(document).ready(function () {
    
    // we add all locations to the select html element representing locations
    addLocationSelect('select-div');
    
    // initialize the response area, then make sure any change to the user inputs is 
    // reflected in the response area by 
    updateResponseArea()
    $('#location').on('change', function () {
        updateResponseArea()
    });
    $('#email').on('change', function () {
        updateResponseArea()
    });
});