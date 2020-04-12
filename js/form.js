
// We track these supplies
const supplies = ['Face Shields', 'Isolation Masks', 'N95s', 'PAPRs', 'Wipes', 'Gowns'];
const supplyID = ['face-shield', 'isolation-mask', 'n95', 'papr', 'wipe', 'gown']

$(document).ready(function () {

    // we add all locations to the select html element representing locations
    addLocationSelect('select-div');


    for(let i = 0; i < supplies.length; i++){
        $("#survey").append(`<br><h6 class="required">${supplies[i]}</h6>
        <div class="custom-control custom-radio" aria-required="true">
        <input type="radio" id="${supplyID[i]}-yes" name="${supplyID[i]}-customRadio" class="custom-control-input">
        <label class="custom-control-label" for="${supplyID[i]}-yes">Yes, I have enough ${supplies[i]}.</label>
        </div>
        <div class="custom-control custom-radio">
            <input type="radio" id="${supplyID[i]}-no" name="${supplyID[i]}-customRadio" class="custom-control-input">
            <label class="custom-control-label" for="${supplyID[i]}-no">No, I don't have enough ${supplies[i]}</label>
        </div>
        <div class="custom-control custom-radio">
            <input type="radio" checked id="${supplyID[i]}-na" name="${supplyID[i]}-customRadio" class="custom-control-input" >
            <label class="custom-control-label" for="${supplyID[i]}-na">N/A</label>
        </div>`);
    }
});



