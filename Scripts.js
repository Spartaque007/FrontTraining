$(document).ready(initPage);


function initPage() {
    $.getJSON("http://localhost:8080/Buildings.json",
        function(value) {
            window.buildings = value;
            buildingsRefresh(value);
            profilesRefresh();
            auditoriesRefresh();
        });
    $.getJSON("http://localhost:8080/Students.json",
        function(value) {
            window.students = value;
            fillStudentsTable(value);
        });

    $("#BuildingsSelect").on('change', function() {
        profilesRefresh(this.value);
        auditoriesRefresh();
    });

    $("#ProfileSelect").on('change', function() {
        auditoriesRefresh(this.value);
    });
}

function buildingsRefresh(buildings) {
    var buildingSelect = $("#BuildingsSelect");
    buildingSelect.append($(new Option(" ", "")))
    $.each(buildings, function(key) {
        buildingSelect.append($(new Option(key, key)));
    });
    buildingSelect.val(0);
}

function profilesRefresh(selectedBuiding) {
    var profileSelect = $("#ProfileSelect");
    profileSelect.find('option')
        .remove()
        .end();
    profileSelect.append($(new Option("Все", "")))
    if (selectedBuiding) {
        $.each(window.buildings[selectedBuiding], function(key) {
            profileSelect.append($(new Option(key, key)));
        })
    }
    profileSelect.val();
}


function auditoriesRefresh(selProfileId) {
    var roomSelect = $("#RoomSelect");
    var buildingSelect = $("#BuildingsSelect");
    roomSelect.find('option')
        .remove()
        .end();
    roomSelect.append($(new Option("Все", "")))

    if (selProfileId) {
        $.each(window.buildings[buildingSelect.val()][selProfileId], function(key, value) {
            roomSelect.append($(new Option(value, value)));
        })
    }
    roomSelect.val();
}

function fillStudentsTable(students) {
    let tableBody = $("#StudentsTable").find("tbody");
    $.each(students, function(key, value) {
        tableBody.append(`<tr>+
            <td>${++key}</td>
            <td>${value.name}</td>
            <td>${value.room}</td>
            <td>${value.profile}</td>
            <td>${value.isBel}</td>
        </tr>`)
    });
}

function createUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = Math.random() * 16 | 0,
            v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

function sortTableByColumn(colNumber) {
    window.currentsortindex = colNumber;
    var rows = $("#StudentsTable tbody").children('tr');
    rows.sort(function(a, b) {
        if (a.cells[colNumber].innerText > b.cells[colNumber].innerText) return 1;
        if (a.cells[colNumber].innerText == b.cells[colNumber].innerText) return 0;
        if (a.cells[colNumber].innerText < b.cells[colNumber].innerText) return -1;
    });
    fillStudentsTable(rows);
}