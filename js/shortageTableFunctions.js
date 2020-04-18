/**
 * Sets up the document with default filters set and pulls data from database
 */
$(document).ready(function() {
    setDefaultDateRange(new Date(), new Date());
    applyFilter();
    $('#filter-submit').click(function() {
        applyFilter();
    });
});

/**
 * Converts a date object to a string in the form YYYY-MM-DD
 * @param {Date} date 
 */
function convertDateToString(date) {
    let year = date.getUTCFullYear();
    let month = date.getMonth()+1;
    let day = date.getUTCDate();
    if (month < 10) {
        month = `0${month}`;
    }
    if (day < 10) {
        day = `0${day}`;
    }
    return `${year}-${month}-${day}`;
}

/**
 * 
 * @param {array} xAxis the labels for the the x-axis
 * @param {string} yAxis the label for the y-axis
 * @param {array} data array of dicts with y-axis and all x-axis labels as the keys
 * @param {jQuery Selector} table the table that needs to be rebuilt
 */
function buildTable(xAxis, yAxis, data, table) {
    // used to map between table headers and data indexes
    const ppeEnum = {
        face_shields: 'Face Shields',
        isolation_masks: 'Isolation Masks',
        n95s: 'N95s',
        paprs: 'PAPRs',
        wipes: 'Wipes',
        gowns: 'Gowns'
    }
    const yAxisEnum = {
        location: 'Location',
        division: 'Division',
        date: 'Date'
    }

    // clear out the table
    table.empty();

    // build headers
    let headers = `<tr><th class='y-axis'>${yAxisEnum[yAxis]}</th>`;
    for (let axis in xAxis) {
        headers += `<th class='x-axis'>${ppeEnum[xAxis[axis]]}</th>`;
    }
    headers += `</tr>`;
    table.append(headers);

    // build data rows
    for (let row in data) {
        let tableRow = `<tr><td class='y-axis'>${data[row][yAxis]}</td>`;
        for (let axis in xAxis) {
            tableRow += `<td class='x-axis'>${data[row][xAxis[axis]]}</td>`;
        }
        tableRow += `</tr>`;
        table.append(tableRow);
    }

    // make data rows equal width
    let widthForXAxis = 60/($('.x-axis').length);
    $('.x-axis').css('width', `${widthForXAxis}`);
}

/**
 * 
 * @param {dict} data specifies query constraints for supply shortage data
 */
function queryDatabase(data) {
    let lambdaApiUrl = 'https://5alsy89r1j.execute-api.us-east-2.amazonaws.com/prod/data';
    $.ajax({
        type: 'POST',
        url: lambdaApiUrl,
        crossDomain: true,
        data: JSON.stringify(data),
        dataType: 'json',
        contentType: 'application/json',
        success: function(response) {
            console.log(response)
            buildTable(data['ppe'], data['y_axis'], response.body, $('#shortage-table'));
        }
    });
}

/**
 * Collects the data from the filters and queries the database based on what was collected 
 */
function applyFilter() {

    // show loader
    $('.loader').css('display', 'inline-block');

    let yAxis = $('#y-axis-filter').val();
    let location = $('#location-filter').val();
    let division = $('#division-filter').val();
    let ppe = $('#ppe-filter').val();
    let startDate = new Date($('#start-date').val());
    let endDate = new Date($('#end-date').val());

    let data = {
        'query_type': 'count',
        'y_axis': yAxis,
        'additional_resources': 'yes',
        'location': location,
        'ppe': ppe,
        'division': division,
        'date_range': `${convertDateToString(startDate)} ${convertDateToString(endDate)}`
    };

    queryDatabase(data);

    // hide loader
    $('.loader').css('display', 'none');
}

/**
 * Sets the default dates of the date-filter
 * @param {Date} startDate 
 * @param {Date} endDate 
 */
function setDefaultDateRange(startDate, endDate) {
    $('#start-date').val(`${startDate.getMonth()+1}/${startDate.getDate()}/${startDate.getFullYear()}`);
    $('#end-date').val(`${endDate.getMonth()+1}/${endDate.getDate()}/${endDate.getFullYear()}`);;
    $('.input-daterange').datepicker({
        clearBtn: true,
        todayHighlight: true,
        autoclose: true,
    });
}