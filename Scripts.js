function initPage() {
    $.getJSON("http://localhost:8080/Buildings.json",
        function(value) {
            buildingsRefresh(value);
            profileRefresh();
            auditoriesRefresh();
        });

    $("#BuildingsSelect").on('change', function() {
        profileRefresh(this.value);
        auditoriesRefresh();
    });

    $("#ProfileSelect").on('change', function() {
        auditoriesRefresh(this.value);
    });
}

function buildingsRefresh(data) {
    var selectList = $("#BuildingsSelect")
    selectList.append($(new Option(" ", "")))
    $.each(data, function(key, value) {
        selectList.append($(new Option(value.Name, value.Id)));
    })
    selectList.val(0);
}

function profileRefresh(selectedBuiding) {

    if (!window.Profiles) {
        $.getJSON("http://localhost:8080/Profiles.json",
            function(value) {
                window.Profiles = value;
                fillProfiles(selectedBuiding);
            });
    } else {
        fillProfiles(selectedBuiding);
    }
}

function fillProfiles(selectedBuiding) {
    var selectList = $("#ProfileSelect").find('option')
        .remove()
        .end();
    selectList.append($(new Option("Все", "")))
    if (selectedBuiding) {
        $.each(window.Profiles[selectedBuiding], function(key, value) {
            selectList.append($(new Option(value.Name, value.Id)));
        })
    }
    selectList.val();
}


function auditoriesRefresh(selProfileId) {

    if (!window.Auditories) {
        $.getJSON("http://localhost:8080/Rooms.json",
            function(value) {
                window.Auditories = value;
                fillAuditories(selProfileId);
            });
    } else {
        fillAuditories(selProfileId);
    }
}

function fillAuditories(selProfileId) {
    var selectList = $("#RoomSelect").find('option')
        .remove()
        .end();
    selectList.append($(new Option("Все", "")))

    if (selProfileId) {
        $.each(window.Auditories[selProfileId], function(key, value) {
            selectList.append($(new Option(value.Number, value.Id)));
        })
    }
    selectList.val();
}