function initPage() {
    $.getJSON("http://localhost:8080/Data.json", buildingFill);
    $("#BuildingsSelect").on('change', function() {
        profileFill(this.value);
    });
}


function buildingFill(data) {

    window.data = data;
    var selectList = $("#BuildingsSelect")
    selectList.append($(new Option(" ", " ")))
    data.Buildings.forEach(b => selectList.append($(new Option(b.name, b.id))));
    selectList.val(0);

}

function profileFill(buildingId) {
    var profiles = window.data.Buildings.find(e => e.id == buildingId).profiles;
    var selectList = $("#profileSelect").find('option')
        .remove()
        .end();
    profiles.forEach(p => selectList.append($(new Option(p.name, p.id))))
}