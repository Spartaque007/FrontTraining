$(document).ready(initPage);

var dictionary = null;
var buildings = null;
var students = null;
var downloadCounter = 2;

var state = {
    currentBuildingIndex: null,
    currentBuildingId: null,
    currentProfile: null,
    currentAuditoryId: null
}

var sortParam = {
    descDirection: true,
    sortIndex: "",
    activeDirectionElement: null,
    filterText: ""
};
var sortDictionary = {
    0: "name",
    1: "audience",
}

function initPage() {
    $.getJSON("https://lyceumexams.herokuapp.com/api/dictionary", onDictionaryRecieved);
    $.getJSON("https://lyceumexams.herokuapp.com/api/corpses", onCorpusesRecieved);
    $(document).on("click", "#SideBarButton", showSideBar);
    $(document).on("click", "#CloseBtn", hideSideBar);
    $(document).on("click", "#SideBarList li a", onChangeBuilding);
    $(document).on('change', "#ProfileSelect", onProfileSelectChanged);
    $(document).on('change', "#RoomSelect", onRoomSelectChanged);
    $(document).on('click', "#StudentsTable thead tr h3", sortTable);
}

function checkAllDownloads() {
    if (downloadCounter == 0) {
        restorePrevState();
    }

}

function onCorpusesRecieved(value) {
    buildings = value;
    downloadCounter = --downloadCounter;
    checkAllDownloads();
    fillMenu();
    profilesRefresh();
    auditoriesRefresh()
}

function onDictionaryRecieved(value) {
    dictionary = value;
    downloadCounter = --downloadCounter;
    checkAllDownloads();
}

function restorePrevState() {
    if (!location.hash) {
        return;
    }

    var params = location.hash.split((/[\/,#]/)).filter(e => e);
    if (params[1]) {
        buildings.forEach((value, key) => {

            if (value.alias != params[1]) return;

            state.currentBuildingId = params[1];
            state.currentBuildingIndex = key;
            setStudents();
            document.getElementById("CurrentCorpText").innerHTML = dictionary.corpses[state.currentBuildingId];
        });
    }
}

function onChangeBuilding(event) {
    let newBuildingId = event.target.dataset.buildingid;
    hideSideBar()
    if (newBuildingId === state.currentBuildingId) {
        return
    }
    state.currentBuildingId = newBuildingId;
    state.currentBuildingIndex = event.target.dataset.buildingindex;
    state.currentAuditoryId = null;
    document.getElementById("CurrentCorpText").innerHTML = dictionary.corpses[state.currentBuildingId];
    profilesRefresh();
    auditoriesRefresh();
    setStudents()
}

function onProfileSelectChanged(event) {
    state.currentProfile = event.target.value;
    auditoriesRefresh();
    setStudents();
    hidePrevDirectionElement();
}

function onRoomSelectChanged(event) {
    state.currentAuditoryId = event.target.value;
    fillStudentsTable(students);
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

function fillMenu() {
    var buildingList = $("#SideBarList");
    var rows = "";
    buildings.forEach((e, index) => rows += `<li class="list-group-item list-group-item-action"> <a href="#table/${e.alias}/all" data-buildingid="${e.alias}" data-buildingindex="${index}">${e.name}</a></li>`);
    buildingList.append(rows);
}

function auditoriesRefresh() {

    var auditories = null;
    if (state.currentBuildingIndex && state.currentProfile) {
        auditories = buildings[state.currentBuildingIndex].places[state.currentProfile].audience;
    } else if (state.currentBuildingIndex) {
        auditories = [];
        buildings[state.currentBuildingIndex].places.forEach(function(item, i, arr) {
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

function profilesRefresh() {
    var profileSelect = $("#ProfileSelect");
    profileSelect.find('option')
        .remove()
        .end();
    profileSelect.append($(new Option("All", "")))

    if (state.currentBuildingId) {
        var places = buildings[state.currentBuildingIndex].places;
        $.each(places, function(key, value) {
            profileSelect.append($(new Option(value.code, key)));
        });
    }
    profileSelect.val();
}

function setStudents() {
    hidePrevDirectionElement()
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


function fillStudentsTable() {
    let tableBody = $("#StudentsTable").find("tbody").empty();

    var filteredStudents = applyFilters();

    if (filteredStudents.length > 0) {
        var rows = "";
        $.each(filteredStudents, function(key, value) {
            let auditoryId = value.audience;
            let auditoryNumber = dictionary.audiences[auditoryId];
            let profileId = value.profile;
            let name = `${value.firstName} ${value.lastName} ${value.parentName}`;
            let bel = value.needBel;


            rows += `<tr data-toggle="collapse" data-target="#studinfo${key}" class="accordion-toggle" aria-expanded="true">
                            <td><h3>${name}</h3></td>
                            <td><h3>${auditoryNumber}</h3></td>
                            <td></td>
                        </tr>
                        <tr>
                            <td colspan="3 " class="hiddenRow ">
                                <div class="accordian-body collapse" id="studinfo${key}" data-parent="#StudentsTableBody" aria-labelledby="StudentsTableBody">
                                <h3><span class="badge badge-secondary">Профиль: </span> ${dictionary.profiles[value.profile]} </h3>
                                <h3><span class="badge badge-secondary">Телефон:</span>  <a href="tel://${value.phone}" class=""badge badge-info"">  ${value.phone} </a></h3>
                                <h3><span class="badge badge-secondary">Email:</span> <a href="mailto: ${value.email} class="badge badge-light"> ${value.email}</a> </h3>
                                </div>
                            </td>
                        </tr>`

        });
        tableBody.append(rows);
    }
}

function applyFilters() {

    var filteredStudents = filterStudentsTableByRoom(state.currentAuditoryId);


    return filteredStudents;
}

function filterStudentsTableByRoom(roomId) {
    if (roomId) {
        let tmpStudents = students.filter(item => item.audience == roomId);

        return tmpStudents;

    } else {
        return students;
    }
}

function sortTable(event) {
    if (students == null) return;
    var currentElement = event.currentTarget.parentElement;
    var currentIndex = currentElement.cellIndex;
    if (currentIndex > 1) return;

    hidePrevDirectionElement()
    var isColumnNotChanged = (sortParam.sortIndex == currentIndex);
    sortParam.descDirection = isColumnNotChanged ? !sortParam.descDirection : isColumnNotChanged;
    sortStudentsByColumn(currentIndex, sortParam.descDirection);
    fillStudentsTable(students);

    currentDirectionElement = currentElement.getElementsByTagName("span")[0];
    currentDirectionElement.classList.remove("hidden");
    currentDirectionElement.classList.add(sortParam.descDirection ? "directn-desc" : "directn-asc");
    sortParam.activeDirectionElement = currentDirectionElement;
}

function hidePrevDirectionElement() {
    if (sortParam.activeDirectionElement != null) {
        sortParam.activeDirectionElement.classList.remove(sortParam.descDirection ? "directn-desc" : "directn-asc");
        sortParam.activeDirectionElement.classList.add("hidden");
    }
}

function sortStudentsByColumn(sortColumn, desc = false) {
    var propertyName = sortDictionary[sortColumn];

    students.sort(function(a, b) {
        let tmpValA;
        let tmpValB;
        if (propertyName == "name") {
            tmpValA = a["firstName"] + a["lastName"] + a["parentName"];
            tmpValB = b["firstName"] + b["lastName"] + b["parentName"];
        } else {
            tmpValA = dictionary[propertyName + "s"][a[propertyName]];
            tmpValB = dictionary[propertyName + "s"][b[propertyName]];
        }

        if (tmpValA > tmpValB) return desc ? -1 : 1;
        if (tmpValA == tmpValB) return 0;
        if (tmpValA < tmpValB) return desc ? 1 : -1;
    });

    sortParam.sortIndex = sortColumn;
    sortParam.descDirection = desc;
}