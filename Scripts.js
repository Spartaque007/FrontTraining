function initPage() {
    $.getJSON("http://localhost:8080/Data.json",
        function(value) {
            buildingFill(value);
            profileFill(undefined);
            auditoriesFill(undefined);
        });
    $("#BuildingsSelect").on('change', function() {
        profileFill(this.value);

    });
    $("#ProfileSelect").on('change', function() {
        auditoriesFill(this.value);
    });
}


function buildingFill(data) {
    window.data = data;
    var selectList = $("#BuildingsSelect")
    selectList.append($(new Option(" ", "")))
    data.Buildings.forEach(b => selectList.append($(new Option(b.name, b.id))));
    selectList.val(0);

}

function profileFill(buildingId) {
    var selectList = $("#ProfileSelect").find('option')
        .remove()
        .end();
    selectList.append($(new Option("Все", "0")))
    if (buildingId) {
        var profiles = window.data.Buildings.find(e => e.id == buildingId).profiles;
        profiles.forEach(p => selectList.append($(new Option(p.name, p.id))));
    }
    selectList.val();
}

function auditoriesFill(profileId) {
    var selectList = $("#RoomSelect").find('option')
        .remove()
        .end();
    selectList.append($(new Option("Все", "")))
    if (profileId) {
        var currentBuildingId = $("#BuildingsSelect").val();
        var auditories = window.data.Buildings.find(e => e.id == currentBuildingId).profiles.find(p => p.id == profileId).rooms;
        auditories.forEach(a => selectList.append($(new Option(a.number, a.id))));
    }
    selectList.val();
}