$(document).ready(initPage);

window.sortParam = {};
window.sortDictionary = {
    1: "name",
    2: "audience",
    3: "profile",
    4: "needBel"
}


function initPage() {
    $.getJSON("https://lyceumexams.herokuapp.com/api/dictionary",
        function(value) {
            window.dictionary = value;
        });



    $.getJSON("https://lyceumexams.herokuapp.com/api/corpses",
        function(value) {
            window.buildings = value;
            buildingsRefresh(value);
            profilesRefresh();
            auditoriesRefresh();
        });

    $("#BuildingsSelect").on('change', function(event) {
        var index = event.target.value;

        window.currentBuildingIndex = index;
        setStudents()
        profilesRefresh(this.value);
        auditoriesRefresh();
    });

    $("#ProfileSelect").on('change', function() {
        window.currentProfileIndex = this.value;
        auditoriesRefresh(this.value);
        setStudents()
    });
    $("#RoomSelect").on('change', function() {
        window.currentRoomIndex = this.value;
    });

    $("#StudentsTable thead tr").on('click', function(event) {
        sortTable(event)
    });
}

function setStudents() {
    if (currentBuildingIndex) {
        var currentBuildg = buildings[currentBuildingIndex];
        var alias = currentBuildg.alias;
        var place = currentProfileIndex ? currentBuildg.places[currentProfileIndex]._id : "";
        $.getJSON(`https://lyceumexams.herokuapp.com/api/pupils?corps=${alias}&place=${place} `,
            function(value) {
                window.students = value;
                fillStudentsTable();
            });
    } else {
        students = null;
        fillStudentsTable();
    }
}

function buildingsRefresh(buildings) {
    var buildingSelect = $("#BuildingsSelect");
    buildingSelect.append($(new Option(" ", "")));

    $.each(buildings, function(index, element) {
        buildingSelect.append($(new Option(element.name, index)));
    });
    buildingSelect.val();
}

function profilesRefresh(selectedBuiding) {

    var profileSelect = $("#ProfileSelect");
    profileSelect.find('option')
        .remove()
        .end();
    profileSelect.append($(new Option("Все", "")))

    if (selectedBuiding) {
        var places = buildings[selectedBuiding].places;

        $.each(places, function(key, value) {
            profileSelect.append($(new Option(value.code, key)));
        })
    } else {
        currentProfileIndex = "";
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
        $.each(buildings[currentBuildingIndex].places[currentProfileIndex].audience, function(key, value) {
            roomSelect.append($(new Option(value.name, value._id)));
        })
    } else {
        currentRoomIndex = "";
    }
    roomSelect.val();
}



function fillStudentsTable() {

    let tableBody = $("#StudentsTable").find("tbody").empty();
    if (students != null) {
        var rows = "";
        $.each(students, function(key, value) {
            var auditoryId = value.audience;
            var profileId = value.profile;

            rows += `<tr draggable="true" >+
            <td>${++key}</td>
            <td>${value.firstName} ${value.lastName} ${value.parentName}</td>
            <td>${dictionary.audiences[auditoryId]}</td>
            <td>${dictionary.profiles[profileId]}</td>
            <td ${value.needBel ? "class=\"bel\"":"" }></td>
        </tr>`
        });
        tableBody.append(rows);
    }
}

function fillAuditoriesTable() {

    let tableBody = $("#AuditoriesTable").find("tbody").empty();



}

function sortTable(event) {

    var currentElement = event.target.cellIndex == undefined ? event.target.parentElement : event.target;
    var currentIndex = currentElement.cellIndex;
    if (currentIndex == 0) return;

    var prevIndex = sortParam.currentCell;

    var prevDirectionElement = document.querySelector("span[data-active='1']");
    if (prevDirectionElement != null) {
        prevDirectionElement.dataset.active = 0;
        prevDirectionElement.classList.remove(sortParam.descDirection ? "directn-desc" : "directn-asc");
        prevDirectionElement.classList.add("hidden");
    }

    if (currentIndex == prevIndex) {

        sortParam.descDirection = !sortParam.descDirection;


    } else {
        sortParam.descDirection = false;

    }

    sortStudentsByColumn(currentIndex, sortParam.descDirection);
    fillStudentsTable();

    currentDirectionElement = currentElement.getElementsByTagName("span")[0];
    currentDirectionElement.dataset.active = 1;
    currentDirectionElement.classList.remove("hidden");
    currentDirectionElement.classList.add(sortParam.descDirection ? "directn-desc" : "directn-asc");
}

function sortStudentsByColumn(sortColumn, desc = false) {

    var propertyName = sortDictionary[sortColumn];

    students.sort(function(a, b) {
        let tmpValA;
        let tmpValB;
        if (propertyName == "name") {
            tmpValA = a["firstName"] + a["lastName"] + a["parentName"];
            tmpValB = b["firstName"] + b["lastName"] + b["parentName"];

        } else if (propertyName == "needBel") {
            tmpValA = a[propertyName];
            tmpValB = b[propertyName];
        } else {
            tmpValA = dictionary[propertyName + "s"][a[propertyName]];
            tmpValB = dictionary[propertyName + "s"][b[propertyName]];
        }


        if (tmpValA > tmpValB) return desc ? -1 : 1;
        if (tmpValA == tmpValB) return 0;
        if (tmpValA < tmpValB) return desc ? 1 : -1;
    });

    window.sortParam.currentCell = sortColumn;
    window.sortParam.descDirection = desc;
}