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
            window.sortParam = {};
            sortStudentsByColumn(1, false)
            fillStudentsTable();
        });

    $("#BuildingsSelect").on('change', function() {
        profilesRefresh(this.value);
        auditoriesRefresh();
    });

    $("#ProfileSelect").on('change', function() {
        auditoriesRefresh(this.value);
    });

    $("#StudentsTable thead tr").on('click', function(event) {
        sortTable(event)
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



function fillStudentsTable() {

    let tableBody = $("#StudentsTable").find("tbody").empty();

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

function sortTable(event) {

    var currentIndex = event.target.cellIndex;
    var prevIndex = sortParam.currentCell;

    if (currentIndex == 0) return;

    if (currentIndex == prevIndex) {

        sortParam.descDirection = !sortParam.descDirection;
        sortStudentsByColumn(currentIndex, sortParam.descDirection)

    } else {
        sortParam.descDirection = false;
        sortStudentsByColumn(currentIndex, sortParam.descDirection);

    }
    fillStudentsTable();
    if (sortParam.descDirection) {

    }



    event.target.getElementsByClassName(sortParam.descDirection ? "sort-desc" : "sort-asc")[0].classList.remove("hidden");

}

function sortStudentsByColumn(sortColumn, desc = false) {

    var propertyName = Object.keys(students[0])[sortColumn - 1];

    students.sort(function(a, b) {
        let tmpValA = a[propertyName];
        let tmpValB = b[propertyName];

        if (tmpValA > tmpValB) return desc ? -1 : 1;
        if (tmpValA == tmpValB) return 0;
        if (tmpValA < tmpValB) return desc ? 1 : -1;
    });

    window.sortParam.currentCell = sortColumn;
    window.sortParam.descDirection = desc;
}