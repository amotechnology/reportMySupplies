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
const databaseColumns = {
    timestamp: "Time",
    name: 'Name',
    employee_email: 'Email',
    location: 'Location',
    division: 'Division',
    face_shields: 'Face Shields',
    isolation_masks: 'Isolation Masks',
    n95s: 'N95s',
    paprs: 'PAPRs',
    wipes: 'Wipes',
    gowns: 'Gowns',
    additional_resources: 'Comments'
}

/*
The IDs of open cells above sub tables
*/
const openRowIDs = {}


/**
 * Sets up the document with default filters set and pulls data from database
 */
$(document).ready(function() {
    setDefaultDateRange(new Date(), new Date());
    applyFilter();
    getAllResponses();

    // when the "Apply Filters" button is pressed
    $('#filter-submit').click(function() {
        applyFilter();
    });

    $('#shortage-table').on('click', 'td', function() {
        
        let dataIndex = $(this).attr('id').split("-")[1];
        
        // if we are closing an old sub-table
        if (`${dataIndex}` in openRowIDs) {
            openedId = openRowIDs[`${dataIndex}`];
            $("#"+openedId).removeClass('open');
            $("#"+openedId).removeClass('highlighted');
            $("#"+openedId).addClass('closed');
            delete openRowIDs[`${dataIndex}`];
            $(`#subtable-${dataIndex}`).empty();
            $(`#subtable-${dataIndex}`).append(`<table><tr><td>Loading.....</td></tr></table>`);
        } else
        // else we are opening a new sub-table to fill with data
        {
            let groupBy = $(this).attr('id').split("-")[0];
            $(this).addClass("highlighted");
            $(this).removeClass('closed');
            $(this).addClass('open');
            openRowIDs[`${dataIndex}`] = $(this).attr('id');
            let yAxis = $('#y-axis-filter').val();
            let location = $('#location-filter').val();
            let division = $('#division-filter').val();
            let ppe = $('#ppe-filter').val();
            let startDate = new Date($('#start-date').val());
            startDate = convertDateToString(startDate);
            let endDate = new Date($('#end-date').val());
            endDate = convertDateToString(endDate);
            let additionalResources  = 'no';
            
            if (groupBy in ppeEnum) {
                ppe = [groupBy];
            }
            if (groupBy == 'additional_resources') {
                ppe = [];
                additionalResources = 'yes';
            }
            if (yAxis == "location") {
                location = [$(`#location-${dataIndex}`).text()];
            }
            if (yAxis == "division") {
                division = [$(`#division-${dataIndex}`).text()];
            }
            if (yAxis == "date") {
                startDate = $(`#date-${dataIndex}`).text();
                endDate = startDate;
            }

            let queryConstraints = {
                'query_type': 'select',
                'y_axis': yAxis,
                'additional_resources': additionalResources,
                'location': location,
                'ppe': ppe,
                'division': division,
                'date_range': `${startDate} ${endDate}`
            };
            queryDatabase(queryConstraints, $(`#subtable-${dataIndex}`));
        }
    });

});


function getAllResponses() {
    queryConstraints = {
        'query_type': 'all'
    }

    let lambdaApiUrl = 'https://5alsy89r1j.execute-api.us-east-2.amazonaws.com/prod/data';
    $.ajax({
        type: 'POST',
        url: lambdaApiUrl,
        crossDomain: true,
        data: JSON.stringify(queryConstraints),
        dataType: 'json',
        contentType: 'application/json',
        success: function(response) {
            if (response.constructor == Object && "errorMessage" in response) {
                console.log(response.errorMessage);
                buildAllResponsesTable(response.errorMessage);
            } else {
                result = JSON.parse(response).body;
                buildAllResponsesTable(result);
                console.log(JSON.parse(response))
            }
        },
        timeout: 12000
    });
}

function buildAllResponsesTable(responses) {
    $('#responses-modal-body').empty();

    let table = `<table class='table'><tr>`;
    for (let col in databaseColumns) {
        table += `<th class='main-headers'>${databaseColumns[col]}</th>`
    }
    table += `</tr>`;

    for (let entry in responses) {
        table += `<tr>`
        for (let col in databaseColumns) {
            table += `<td>${responses[entry][col]}</td>`
        }
        table += `</tr>`;
    }

    table += `</table>`;
    $('#responses-modal-body').append(table);
}


/**
 * 
 * @param {array} xAxis the labels for the the x-axis
 * @param {string} yAxis the label for the y-axis
 * @param {array} counts array of dicts with y-axis and all x-axis labels as the keys for 
 *                         the main table rows
 * @param {jQuery Selector} table the table that needs to be rebuilt
 */
function buildTable(xAxis, hasAdditionalResources, yAxis, counts, table) {
    // clear out the table
    table.empty();

    // build the title
    let title = `<tr><th class='y-axis main-headers' colspan="100%"><h4>Number of shortages of`;
    
    // indicating the ppe shortages (and whether they also want comments) that we're looking for
    if ($("#ppe-filter option:not(:selected)").length == 0) {
        title += ` all types of ppe`;
    } else {
        let ppe = $("#ppe-filter").val();
        if (ppe.length == 1){
            title += ` ${ppeEnum[ppe[0]]}`;
        } else {
            title += ` ${ppe.length} types of ppe`;
        }
    }
    if (hasAdditionalResources) {
        title += ", and number of additional comments,";
    }
    title += " reported";

    // what is the date or date range in question?
    if ($("#start-date").val() == $('#end-date').val()) {
        title += ` on ${$("#start-date").val()}`;
    } else {
        title += ` from ${$("#start-date").val()} to ${$("#end-date").val()}`;
    }

    // what location filters were there?
    if ($("#location-filter option:not(:selected)").length == 0) {
        title += ` in all locations and`;
    } else {
        let locations = $("#location-filter").val();
        if (locations.length == 1){
            title += ` in the location ${locations[0]} and`;
        } else {
            title += ` in ${locations.length} locations and`;
        }
    }

    // what division filters were there?
    if ($("#division-filter option:not(:selected)").length == 0) {
        title += ` all divisions.`;
    } else {
        let divisions = $("#division-filter").val();
        if (divisions.length == 1){
            title += ` the division ${divisions[0]}.`;
        } else {
            title += ` ${divisions.length} divisions.`;
        }
    }

    //per PPE type${hasAdditionalResources? " and comments added" : ""}`
    //$("#location-filter option:not(:selected)").length == 0

    title += '</h4></th></tr>';
    table.append(title);

    // build headers
    let headers = `<tr><th class='y-axis main-headers'>${yAxisEnum[yAxis]}</th>`;
    for (let axis in xAxis) {
        headers += `<th class='x-axis main-headers'>${ppeEnum[xAxis[axis]]}</th>`;
    }
    if (hasAdditionalResources == 'yes') {
        headers += `<th class='x-axis main-headers'>Comments</th></tr>`;
    }
    table.append(headers);

    // If the query yielded no shortages
    noResults = true;

    // build data rows (and subdata rows with comments)
    for (let row in counts) {
        
        // we know we got data now
        noResults = false;

        // build main data row
        let tableRow = `<tr><td id='${yAxis}-${row}' class='y-axis accordian-toggle collapsed closed'
            data-toggle='collapse' data-parent='${yAxis}-${row}' href='#subtable-${row}' >${counts[row][yAxis]}</td>`;
        for (let column in xAxis) {
            tableRow += `<td id='${xAxis[column]}-${row}' class='x-axis accordian-toggle collapsed closed' data-toggle='collapse' data-parent='${xAxis[column]}-${row}' href='#subtable-${row}'>${counts[row][xAxis[column]]}</td>`;
        }
        if (hasAdditionalResources == 'yes') {
            tableRow += `<td id='additional_resources-${row}' class='x-axis accordian-toggle collapsed closed' data-toggle='collapse' data-parent='additional_resources-${row}' href='#subtable-${row}'>${counts[row]['additional_resources']}</td>`;
        }
        table.append(tableRow);

        // build subdata row
        let subRow = `<tr class='hide-table-padding'><td style='padding: 0' colspan=9><div id='subtable-${row}' class='collapse'>
            <table class="table"><tr><td>Loading.......</td></tr></table></div></td></tr>`;
        table.append(subRow);
    }

    // Prints a message to let the user know their query yielded no shortages
    if (noResults) {
        table.append(`<tr><th colspan='100%'>No shortages${hasAdditionalResources? " or comments":""} match the specified filters</th></tr>`);
    }

    let width = 70/xAxis.length;
    $('.x-axis').css('width', `${width}%`);                              
}

/**
 * 
 * @param {string} error The error received (probably timeout)
 * @param {jQuery Element} tableDiv the div holding the subtable to build
 */
function buildSubTableError(error, tableDiv) {
    tableDiv.html("<p>Error (Probably from Lambda): "+error+"</p>");
}

/**
 * 
 * @param {array} selectResult the result of the select query which is an array of table rows
 * @param {jQuery Element} tableDiv the div holding the subtable to build
 */
function buildSubTable(selectResult, tableDiv) {
    tableDiv.empty();
    let subTable = `<table class='table subTable'><tr><th>Time</th><th>Name</th><th>Email</th><th>Location</th>`;
    subTable += `<th>Division</th><th>Face Shields</th><th>Isolation Masks</th><th>N95s</th>`;
    subTable += `<th>PAPRs</th><th>Wipes</th><th>Gowns</th><th>Comments</th></tr>`

    for (let row in selectResult) {
        subTable += `<tr>`;
        for (let col in databaseColumns) {
            if (databaseColumns[col] == 'additional_resources') {
                subTable += `<td>${selectResult[row][col]}</td>`;
            }
            else {
                subTable += `<td>${selectResult[row][col]}</td>`;
            }
        }
        subTable += `</tr>`;
    }
    subTable += `</table>`;
    tableDiv.append(subTable);
}

/**
 * 
 * @param {dict} queryConstraints specifies query constraints for supply shortage data
 * @param {jQuery Element} table the place to build the respective table
 */
function queryDatabase(queryConstraints, table) {
    let lambdaApiUrl = 'https://5alsy89r1j.execute-api.us-east-2.amazonaws.com/prod/data';
    let result = '';
    $.ajax({
        type: 'POST',
        url: lambdaApiUrl,
        crossDomain: true,
        data: JSON.stringify(queryConstraints),
        dataType: 'json',
        contentType: 'application/json',
        success: function(response) {
            if (response.constructor == Object && "errorMessage" in response) {
                buildSubTableError(response.errorMessage, table);
            } else {
                result = JSON.parse(response).body;
                if (queryConstraints['query_type'] == 'count') {
                    buildTable(queryConstraints['ppe'], queryConstraints['additional_resources'], queryConstraints['y_axis'], result, table);
                }
                else {
                    buildSubTable(result, table);
                }
            }
        },
        timeout: 12000
    });
    return result;
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
    let additionalResources = 'no';
    if ($('#comments-check').prop("checked") == true) {
        additionalResources = 'yes';
    }

    let queryConstraints = {
        'query_type': 'count',
        'y_axis': yAxis,
        'additional_resources': additionalResources,
        'location': location,
        'ppe': ppe,
        'division': division,
        'date_range': `${convertDateToString(startDate)} ${convertDateToString(endDate)}`
    };

    queryDatabase(queryConstraints, $('#shortage-table'));

    // hide loader
    $('.loader').css('display', 'none');
}

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

