
locationSelectId = "location";
divisionSelectId = "division";

// Adds a location to the 'select' html element which let users scroll through locations
function addLocOption(location) {
    $(`#${locationSelectId}`).append(`<option value="${location}">${location}</option>`)
}

// Adds a division to the 'select' html element which let users scroll through divisions
function addDivisionOption(division) {
    $(`#${divisionSelectId}`).append(`<option value="${division}">${division}</option>`)
}

// Adds a location select html element to the div with id=divId
// the select has id="location"
function addLocationSelect(divId){
    $(`#${divId}`).html(
        `<br><p class="required">Please select your location.</p>
        <select id="${locationSelectId}" name="${locationSelectId}" class="form-control" aria-required="true">
            <option value="[select a location]">[select a location]</option>
        </select>`
    )
    locations.forEach(addLocOption);
}

// Adds a division select html element to the div with id=divId
// the select has id="division"
function addDivisionSelect(divId){
    $(`#${divId}`).html(
        `<br><p class="required">Please select your division.</p>
        <select id="${divisionSelectId}" name="${divisionSelectId}" class="form-control" aria-required="true">
            <option value="[select a division]">[select a division]</option>
        </select>`
    )
    divisions.forEach(addDivisionOption);
}