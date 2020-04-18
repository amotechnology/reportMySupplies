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

/**
 * Sets up the document with default filters set and pulls data from database
 */
$(document).ready(function() {
    setDefaultDateRange(new Date(), new Date());
    applyFilter();

    // when the "Apply Filters" button is pressed
    $('#filter-submit').click(function() {
        applyFilter();
    });

    $('#shortage-table').on('click', 'td', function() {
        let yAxis = $('#y-axis-filter').val();
        let location = $('#location-filter').val();
        let division = $('#division-filter').val();
        let ppe = $('#ppe-filter').val();
        let startDate = new Date($('#start-date').val());
        let endDate = new Date($('#end-date').val());

        let groupBy = $(this).attr('id').split("-")[0];
        let dataIndex = $(this).attr('id').split("-")[1];
        if (groupBy in ppeEnum) {
            ppe = [String(groupBy)];
        }
        if (yAxis == "location") {
            location = [$(`#location-${dataIndex}`).text()];
        }
        if (yAxis == "division") {
            division = [$(`#division-${dataIndex}`).text()];
        }

        let queryConstraints = {
            'query_type': 'select',
            'y_axis': yAxis,
            'additional_resources': 'yes',
            'location': location,
            'ppe': ppe,
            'division': division,
            'date_range': `${convertDateToString(startDate)} ${convertDateToString(endDate)}`
        };
        let lambdaApiUrl = 'https://5alsy89r1j.execute-api.us-east-2.amazonaws.com/prod/data';
        console.log(queryConstraints);
        $.ajax({
            type: 'POST',
            url: lambdaApiUrl,
            crossDomain: true,
            data: JSON.stringify(queryConstraints),
            dataType: 'json',
            contentType: 'application/json',
            success: function(selectStats) {
                console.log(selectStats)
                subTableData = setUpSubData(selectStats.body, queryConstraints['y_axis'])
                $(`#subtable-${dataIndex}`).empty();
                let subRow = `<table class="table"><tr><th>Name</th><th>Email</th><th>Comments</th></tr>`;

                for (let c in subTableData[location]) {
                    subRow += `<tr><td>${subTableData[location][c]['Name']}</td>`;
                    subRow += `<td>${subTableData[location][c]['Email']}</td>`;
                    subRow += `<td>${subTableData[location][c]['Comments']}</td></tr>`;
                }
                subRow += `</table>`;
                $(`#subtable-${dataIndex}`).append(subRow);
            }
        });
    })
});

/**
 * 
 * @param {array} xAxis the labels for the the x-axis
 * @param {string} yAxis the label for the y-axis
 * @param {array} counts array of dicts with y-axis and all x-axis labels as the keys for 
 *                         the main table rows
 * @param {jQuery Selector} table the table that needs to be rebuilt
 */
function buildTable(xAxis, yAxis, counts, table) {
    // clear out the table
    table.empty();

    // build headers
    let headers = `<tr><th class='main-headers toggle'></th><th class='y-axis main-headers'>${yAxisEnum[yAxis]}</th>`;
    for (let axis in xAxis) {
        headers += `<th class='x-axis main-headers'>${ppeEnum[xAxis[axis]]}</th>`;
    }
    headers += `<th class='x-axis main-headers'>Comments</th></tr>`;
    table.append(headers);

    // build data rows (and subdata rows with comments)
    for (let row in counts) {
        
        // build main data row
        let tableRow = 
            `<tr><td class='expand-button'>+</td>
            <td id='${yAxis}-${row}' class='y-axis accordian-toggle collapsed'
            data-toggle='collapse' data-parent='${yAxis}-${row}' href='#subtable-${row}' >${counts[row][yAxis]}</td>`;
        for (let column in xAxis) {
            tableRow += `<td id='${xAxis[column]}-${row}' class='x-axis accordian-toggle collapsed' data-toggle='collapse' data-parent='${xAxis[column]}-${row}' href='#subtable-${row}'>${counts[row][xAxis[column]]}</td>`;
        }
        tableRow += `<td class='x-axis'>${counts[row]['additional_resources']}</td></tr>`; 
        table.append(tableRow);

        // build subdata row
        let subRow = `<tr class='hide-table-padding'><td style='padding: 0' colspan=9><div id='subtable-${row}' class='collapse'>
            <table class="table"><tr><td>Loading.......</td></tr></table></div></td></tr>`;
        // let subRow = `<tr class='hide-table-padding'><td style='padding: 0' colspan=9><div>
        //     <table class="table"><tr><td>Loading.......</td></tr></table></div></td></tr>`;
        table.append(subRow);
    }

    $('.x-axis').css('width', `30px`);                              
}

/**
 * This function takes the queried database rows and organizes by the yAxis
 * so they can be put as the subrows in the main database table
 * @param {array} selectData array of dictionaries that were the queried rows
 * @param {string} yAxis the specified y-axis from the filter in which to organize the queries by
 */
function setUpSubData(selectData, yAxis) {
    reportedComments = {};
    for (let row in selectData) {
        if (selectData[row]['additional_resources'] != '') {
            comment = {
                'Name': selectData[row]['name'],
                'Email': selectData[row]['employee_email'],
                'Comments': selectData[row]['additional_resources']
            }
            if (selectData[row][yAxis] in reportedComments) {
                reportedComments[selectData[row][yAxis]].push(comment)
            }
            else {
                reportedComments[selectData[row][yAxis]] = [comment]
            }
        }
    }
    return reportedComments;
}

/**
 * 
 * @param {dict} queryConstraints specifies query constraints for supply shortage data
 */
function queryDatabase(queryConstraints) {
    let lambdaApiUrl = 'https://5alsy89r1j.execute-api.us-east-2.amazonaws.com/prod/data';
    $.ajax({
        type: 'POST',
        url: lambdaApiUrl,
        crossDomain: true,
        data: JSON.stringify(queryConstraints),
        dataType: 'json',
        contentType: 'application/json',
        success: function(countingStats) {
            buildTable(queryConstraints['ppe'], queryConstraints['y_axis'], countingStats.body, $('#shortage-table'));
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

    let queryConstraints = {
        'query_type': 'count',
        'y_axis': yAxis,
        'additional_resources': 'yes',
        'location': location,
        'ppe': ppe,
        'division': division,
        'date_range': `${convertDateToString(startDate)} ${convertDateToString(endDate)}`
    };

    queryDatabase(queryConstraints);

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

