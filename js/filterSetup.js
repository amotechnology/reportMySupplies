var locationSelectId = 'location-filter';
var divisionSelectId = 'division-filter';
var ppeSelectId = 'ppe-filter';

function addLocationOption(location) {
    $(`#${locationSelectId}`).append(`<option value="${location}" selected>${location}</option>`);
}

function addDivisionOption(division) {
    $(`#${divisionSelectId}`).append(`<option value="${division}" selected>${division}</option>`);
}

function addPpeOption(ppe) {
    $(`#${ppeSelectId}`).append(`<option value="${ppe.val}" selected>${ppe.label}</option>`);
}

$(document).ready(function() {
    locations.forEach(addLocationOption);
    divisions.forEach(addDivisionOption);
    ppes.forEach(addPpeOption);
});