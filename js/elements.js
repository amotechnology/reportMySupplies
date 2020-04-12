
selectId = "location";

// Adds a location to the 'select' html element which let users scroll through locations
function addLocOption(location) {
    $(`#${selectId}`).append(`<option value="${location}">${location}</option>`)
}

// Adds a location select html element to the div with id=divId
// the select has id="location"
function addLocationSelect(divId){
    $(`#${divId}`).html(
        `<select id="${selectId}" name="${selectId}" class="form-control">
            <option value="[select a location]">[select a location]</option>
        </select>`
    )
    locations.forEach(addLocOption);
}