$(document).ready(initPage);

var buildings = null;
var dictionary = null;


function initPage() {
    $.getJSON("https://lyceumexams.herokuapp.com/api/dictionary", onDictionaryRecieved);
    $.getJSON("https://lyceumexams.herokuapp.com/api/corpses", onCorpusesRecieved);
    $(document).on("click", "#SideBarButton", showSideBar);
    $(document).on("click", "#CloseBtn", hideSideBar);

}

function onCorpusesRecieved(value) {
    buildings = value;
    fillMenu()
}

function onDictionaryRecieved(value) {
    dictionary = value;
}

function fillMenu() {
    var buildingList = $("#SideBarList");
    var rows = "";
    buildings.forEach(e => rows += `<li class="list-group-item list-group-item-action">${e.name}`);
    buildingList.append(rows);

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