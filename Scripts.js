$(document).ready(initPage);

var state = {
    currentBuilding: "",
    currentProfile: "",
    currentAuditoryId: "",
};
var students = null;

var sortParam = {
    descDirection: true,
    sortIndex: "",
    activeDirectionElement: null,
    filterText: ""
};
var sortDictionary = {
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
            buildingsRefresh();
            profilesRefresh();
            auditoriesRefresh()
        });
    $("#BuildingsSelect").on('change', function(event) {
        state.currentBuilding = event.target.value;
        state.currentProfile = "";
        state.currentAuditoryId = "";

        profilesRefresh();
        auditoriesRefresh()
        setStudents();
        hidePrevDirectionElement();
    });
    $("#ProfileSelect").on('change', function(event) {
        state.currentProfile = event.target.value;
        auditoriesRefresh();
        setStudents();
        hidePrevDirectionElement();
    });
    $("#RoomSelect").on('change', function(event) {
        state.currentAuditoryId = event.target.value;
        fillStudentsTable(students);
    });
    $("#StudentsTable thead tr").on('click', function(event) {
        sortTable(event)
    });

    $("#SearchInput").on('input', function(event) {
        sortParam.filterText = event.target.value;
        fillStudentsTable(students);
    });

    $("#StudentsTable tbody").mousedown(function(event) {
        dragStudent(event);
    });

}

function buildingsRefresh() {
    var buildingSelect = $("#BuildingsSelect");
    buildingSelect.append($(new Option(" ", "")));
    $.each(buildings, function(index, element) {
        buildingSelect.append($(new Option(element.name, index)));
    });
    buildingSelect.val();
}

function profilesRefresh() {
    var profileSelect = $("#ProfileSelect");
    profileSelect.find('option')
        .remove()
        .end();
    profileSelect.append($(new Option("Все", "")))

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
    fillAuditoriesSelect(auditories);
    fillAuditoriesTable(auditories);
}

function fillAuditoriesSelect(auditories) {
    var roomSelect = $("#RoomSelect");
    roomSelect.find('option')
        .remove()
        .end();
    roomSelect.append($(new Option("Все", "")));
    if (auditories != null) {
        $.each(auditories, function(key, value) {
            roomSelect.append($(new Option(value.name, value._id)));
        })
    }
    roomSelect.val();
}

function fillAuditoriesTable(auditories) {
    let tableBody = $("#AuditoriesTable").find("tbody").empty();
    var rows = "";

    $.each(auditories, function(key, value) {
        let roomNumber = value.name;
        let roomId = value._id;
        let bel = value.bel;
        rows += `<tr class="droppable" data-auditory="${roomId}" data-bel="${bel}">+
        <td>${roomNumber}</td>
        <td>${value.count}</td>
        <td>${value.max}</td>
        <td ${bel ? "class=\"bel\"":"" }></td>
    </tr>`
    });
    tableBody.append(rows);
}

function setStudents() {
    if (state.currentBuilding) {
        building = buildings[state.currentBuilding];
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

function fillStudentsTable(students) {
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

function sortTable(event) {
    if (students == null) return;
    var currentElement = event.target.cellIndex == undefined ? event.target.parentElement : event.target;
    var currentIndex = currentElement.cellIndex;
    if (currentIndex == 0) return;

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

    sortParam.sortIndex = sortColumn;
    sortParam.descDirection = desc;
}

function applyFilters() {

    var filteredStudents = filterStudentsTableByRoom(state.currentAuditoryId);

    var filteredStudents = filterTableByName(sortParam.filterText, filteredStudents);
    return filteredStudents;
}

function filterTableByName(inputText, students) {
    if (students == null) return null;

    if (!inputText) {
        return students;
    }

    let tmpStudentsArray = [];
    inputText = inputText.toLowerCase();

    students.forEach(function(item) {
        if (item.firstName.toLowerCase().includes(inputText)) {
            tmpStudentsArray.push(item);
        }
    });
    return tmpStudentsArray;
}

function filterStudentsTableByRoom(roomId) {
    if (roomId) {
        let tmpStudents = [];
        students.forEach(function(item, index) {
            if (item.audience == roomId) {
                tmpStudents.push(item);
            }
        });
        return tmpStudents;

    } else {
        return students;
    }
}

function dragStudent(event) {

    var currentRow = event.target.parentElement;
    if (!currentRow.classList.contains("draggable")) return;
    var dragElement = createDragElement(currentRow);
    currentRow.classList.add("activeOnDrag");

    var auditoriesTable = document.getElementById("AuditoriesTableBody");
    auditoriesTable.classList.add("activeOnDrag");


    move(event.pageX, event.pageY);

    document.addEventListener('mousemove', onMouseMove);

    function move(x, y) {
        dragElement.style.left = x - dragElement.offsetLeft / 2 + 'px';
        dragElement.style.top = y - dragElement.offsetHeight / 2 + 'px';
    }

    var destinationElement = null;


    function onMouseMove(event) {
        move(event.pageX, event.pageY);
        dragElement.style.visibility = "hidden";
        let elemBelow = document.elementFromPoint(event.clientX, event.clientY);
        dragElement.style.visibility = "visible";

        if (destinationElement) {
            destinationElement.classList.remove("underDrag");
        }

        if (elemBelow == null) return;

        let droppableBelow = elemBelow.closest('.droppable');


        if (!droppableBelow) {
            dragElement.style.cursor = "not-allowed";
            destinationElement = null;
        } else {
            dragElement.style.cursor = "move";
            destinationElement = droppableBelow;
            destinationElement.classList.add("underDrag");
        }

    }

    dragElement.onmouseup = function() {
        dragElement.onmouseup = null;

        auditoriesTable.classList.remove("activeOnDrag");
        currentRow.classList.remove("activeOnDrag");

        if (destinationElement) {
            destinationElement.classList.remove("underDrag");
            let prevRoomId = currentRow.dataset.auditory;
            let newRoomId = destinationElement.dataset.auditory;
            let belAccept = currentRow.dataset.bel == destinationElement.dataset.bel;
            let roomChanged = prevRoomId != newRoomId;
            let name = currentRow.dataset.name;
            if (belAccept) {
                let prevRoomNumber = dictionary.audiences[prevRoomId];
                let newRoomNumber = dictionary.audiences[newRoomId];
                console.log(roomChanged ? `${name} переехал(а) из аудитории ${prevRoomNumber} в аудиторию ${newRoomNumber}` : `${name} никуда не переехал(а) из аудитории ${prevRoomNumber}`);
            } else {
                alert(currentRow.isBel ? "попытка посадить белоруса к не беларусам" : "попытка посадить не белоруса к беларусам")
            }
        }
        dragElement.remove();
        document.removeEventListener('mousemove', onMouseMove);
    };
}

function createDragElement(element) {

    var dragElement = document.createElement("table");
    dragElement.classList.add("table");
    dragElement.classList.add("main-table");
    dragElement.classList.add("activeOnDrag");
    dragElement.style.opacity = "0.5";
    dragElement.append(element.cloneNode(true));
    dragElement.style.position = 'absolute';
    dragElement.style.zIndex = 1000;
    document.body.append(dragElement);
    return dragElement;
}