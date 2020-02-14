$(document).ready(initPage);

var dictionary = null;
var buildings = null;
var students = null;

var state = {
    currentBuildingIndex: null,
    currentBuildingId: null
}

function initPage() {
    $.getJSON("https://lyceumexams.herokuapp.com/api/dictionary", onDictionaryRecieved);
    $.getJSON("https://lyceumexams.herokuapp.com/api/corpses", onCorpusesRecieved);
    $(document).on("click", "#SideBarButton", showSideBar);
    $(document).on("click", "#CloseBtn", hideSideBar);
    $(document).on("click", "#SideBarList li", onChangeBuilding);
}

function onCorpusesRecieved(value) {
    buildings = value;
    fillMenu()
    profilesRefresh();
    auditoriesRefresh()
}

function onDictionaryRecieved(value) {
    dictionary = value;
}

function fillMenu() {
    var buildingList = $("#SideBarList");
    var rows = "";
    buildings.forEach(e => rows += `<li data-building="${e.alias}" class="list-group-item list-group-item-action">${e.name}`);
    buildingList.append(rows);

}

function profilesRefresh() {
    var profileSelect = $("#ProfileSelect");
    profileSelect.find('option')
        .remove()
        .end();
    profileSelect.append($(new Option("All", "")))

    if (state.currentBuilding) {
        var places = buildings[state.currentBuilding].places;
        $.each(places, function(key, value) {
            profileSelect.append($(new Option(value.code, key)));
        });
    }
    profileSelect.val();
}

function auditoriesRefresh() {

    var auditories = null;
    if (state.currentBuilding && state.currentProfile) {
        auditories = buildings[state.currentBuilding].places[state.currentProfile].audience;
    } else if (state.currentBuilding) {
        auditories = [];
        buildings[state.currentBuilding].places.forEach(function(item, i, arr) {
            auditories = auditories.concat(item.audience);
        });
    }

    var roomSelect = $("#RoomSelect");
    roomSelect.find('option')
        .remove()
        .end();
    roomSelect.append($(new Option("All", "")));
    if (auditories != null) {
        $.each(auditories, function(key, value) {
            roomSelect.append($(new Option(value.name, value._id)));
        })
    }
    roomSelect.val();

}


function showSideBar() {
    var sideBar = document.getElementById("SideBar");
    if (sideBar.classList.contains("sidebar-show")) {
        hideSideBar();
    } else {
        sideBar.classList.add("sidebar-show");
    }

}

function hideSideBar() {
    var sideBar = document.getElementById("SideBar");
    sideBar.classList.remove("sidebar-show");
}

function onChangeBuilding(event) {
    let newBuildingId = event.target.dataset.building;
    if (newBuildingId == state.currentBuildingId) {
        return
    }
    state.currentBuildingId = newBuildingId;
    fillStudentsTable();
}

function fillStudentsTable() {
    let tableBody = $("#StudentsTable").find("tbody").empty();

    var filteredStudents = applyFilters();

    if (filteredStudents != null) {
        var rows = "";
        $.each(filteredStudents, function(key, value) {
            let auditoryId = value.audience;
            let auditoryNumber = dictionary.audiences[auditoryId];
            let profileId = value.profile;
            let name = `${value.firstName} ${value.lastName} ${value.parentName}`;
            let bel = value.needBel;

            rows += `<tr class="draggable" data-name="${name}" data-auditory="${auditoryId}" data-bel="${bel}">+
            <td>${++key}</td>
            <td>${name}</td>
            <td>${auditoryNumber}</td>
            <td>${dictionary.profiles[profileId]}</td>
            <td ${bel ? "class=\"bel\"":"" }></td>
        </tr>`
        });
        tableBody.append(rows);
    }

}

function setStudents() {
    if (state.currentBuildingIndex) {
        building = buildings[state.currentBuildingIndex];
        var alias = building.alias;
        var place = state.currentProfile ? building.places[state.currentProfile]._id : "";
        $.getJSON(`https://lyceumexams.herokuapp.com/api/pupils?corps=${alias}&place=${place} `,
            function(value) {
                students = value;
                fillStudentsTable(students);
            });
    } else {
        students = null;
        fillStudentsTable(students);
    }
}





function applyFilters() {
    return students;
}