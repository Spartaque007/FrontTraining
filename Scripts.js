let Buidings;


class Building {



}


function InitPage() {
    BuildingFill();
}


function BuildingFill() {
    let buildingsSel = $("#BuildingsSelect");
    buildingsSel.append($(new Option("Building1", "Building1")));
    buildingsSel.append($(new Option("Building2", "Building2")));

}