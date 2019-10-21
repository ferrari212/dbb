//Global variables
var currentBlock,
currentBH,
currentBHid,
shipset,
blockset,
nbulkheads,
pbulkheads,
ndecks,
pdecks,
gs,
gsm,
aAndc,
proximities,
adj,
deckOutlines,
deckOutlinesTop,
deckOutlines2,
DC,
cline,
waterlinesHull,
waterlinesHS,
GZtsTotal,
PeaTotal,
PsSeaTotal;

//Loaded when you open the page
on_load();

//Function that is called whenever page is loaded or sliders are altered
function on_change(){

//+ in front of a variable convert String to Number

//Sets maximum s_xAft / s_xFwd slider value equal to LOA
document.getElementById("s_xFwd").max = +document.getElementById("canv_x").value;
document.getElementById("s_xAft").max = +document.getElementById("canv_x").value;
document.getElementById("s_bulkhead_p").max = +document.getElementById("canv_x").value;

//Sets maximum s_yCentre slider value equal to BOA/2
document.getElementById("s_yCentre").max = Math.round((+document.getElementById("canv_y").value/2)/gsm)*gsm;
//Sets minimum s_yCentre slider value equal to -BOA/2
document.getElementById("s_yCentre").min = -document.getElementById("s_yCentre").max;

//Sets maximum s_ySize slider value equal to BOA
document.getElementById("s_ySize").max = +document.getElementById("canv_y").value + 2;

//Variables used in the grid dimensions
var canvas_x = +document.getElementById("canv_x").value * (gs/gsm);
var canvas_y = +document.getElementById("canv_y").value * (gs/gsm);

//s_text is the size of the text, in pixels    
s_text = gs*3

//Deck centreline
cline = canvas_y/2;

//Sets maximum s_zHeight and s_zBase sliders equal to heighest deck position
document.getElementById("s_zHeight").max = Math.max(...pdecks);
document.getElementById("s_zBase").max = Math.max(...pdecks);

//Wrtiting grid in SVG
svgid = "svg"

//Grid created in SVG (placed in the DIV created above)
grid_comm = '<svg id="'+ svgid +'" width='+canvas_x+' height='+((Math.round(1.25*canvas_y/gs)*gs)*(ndecks.length)-(Math.round(0.25*canvas_y/gs)*gs))+' version="1.1" xmlns="http://www.w3.org/2000/svg"><defs><pattern id="smallGrid" width="8" height="8" patternUnits="userSpaceOnUse"><pattern id="grid" width="'+gs+'" height="'+gs+'" patternUnits="userSpaceOnUse"><path d="M '+gs+' 0 L 0 0 0 '+gs+'" fill="none" stroke="gray" stroke-width="1"/></pattern></defs><rect width="100%" height="100%" fill="url(#grid)" /></svg>'
//console.log(grid_comm);

//Place grid in html
document.getElementById("grid_here").innerHTML = grid_comm;

//Use snap.svg to write text and place blocks inside SVG grid
var s = Snap("#"+ svgid);
//Origin
var orig = {
    x: 0,
    y: 0
};

/*//Deck names and outlines
doutline = [];
dcurves = [];
hullGen(); //Calls hullGen function
var deckOutlinesR; //New variable for port deck curve
for (i=0; i < ndecks.length; i++){
    coordinates = [s.text(3, (s_text+(Math.round(1.25*canvas_y/gs)*gs)*(i)), ndecks[i] + " (" + pdecks[i] + "m)").attr({"font-size": s_text+"px", fontWeight: '700'})]; //Type deck names
    doutline.push = s.rect(0,(Math.round(1.25*canvas_y/gs)*gs)*(i),canvas_x,canvas_y).attr({ stroke: 'black', 'strokeWidth': 2, fill: 'none' }); //Plot deck outlines
    
    deckOutlinesR = JSON.parse(JSON.stringify(deckOutlines[i])); //http://stackoverflow.com/questions/122102/what-is-the-most-efficient-way-to-clone-an-object, https://davidwalsh.name/javascript-clone-array
    for (j=0; j<deckOutlines[i].length; j++) { //Move curves to each deck
        deckOutlinesR[j][1] = -deckOutlines[i][j][1] + (Math.round(1.25*canvas_y/gs)*gs)*(i) + 0.5*canvas_y;
        deckOutlines[i][j][1] = deckOutlines[i][j][1] + (Math.round(1.25*canvas_y/gs)*gs)*(i) + 0.5*canvas_y;
    }
    dcurves.push = s.polyline(deckOutlines[i]).attr({ stroke: 'blue', 'strokeWidth': 1, fill: 'none' }); //Plot deck curves stbd
    dcurves.push = s.polyline(deckOutlinesR).attr({ stroke: 'blue', 'strokeWidth': 1, fill: 'none' }); //Plot deck curves port
}
//Plot deck roof
doutline2 = [];
dcurves2 = [];
for (i=0; i < ndecks.length - 1; i++){
    deckOutlinesTopR = JSON.parse(JSON.stringify(deckOutlinesTop[i])); //http://stackoverflow.com/questions/122102/what-is-the-most-efficient-way-to-clone-an-object, https://davidwalsh.name/javascript-clone-array
    for (j=0; j<deckOutlinesTop[i].length; j++) { //Move curves to each deck
        deckOutlinesTopR[j][1] = -deckOutlinesTop[i][j][1] + (Math.round(1.25*canvas_y/gs)*gs)*(i) + 0.5*canvas_y + (Math.round(1.25*canvas_y/gs)*gs);
        deckOutlinesTop[i][j][1] = deckOutlinesTop[i][j][1] + (Math.round(1.25*canvas_y/gs)*gs)*(i) + 0.5*canvas_y + (Math.round(1.25*canvas_y/gs)*gs);
    }
    dcurves2.push = s.polyline(deckOutlinesTop[i]).attr({ stroke: 'blue', strokeDasharray: "1", 'strokeWidth': 1, fill: 'none' }); //Plot deck curves stbd
    dcurves2.push = s.polyline(deckOutlinesTopR).attr({ stroke: 'blue', strokeDasharray: "1", 'strokeWidth': 1, fill: 'none' }); //Plot deck curves port
}*/

//We now start a loop on every block. First we add property "colour". Then we add property "deck", checking which decks each DBB is on
for (i in blockset){
    
    //Creating property "decks"
    blockset[i].decks = [];
    
    //Round dimensions to the nearest gs
    var xFwdR = Math.round(+blockset[i].xFwd*(gs/gsm)/gs)*gs;
    var xAftR = Math.round(+blockset[i].xAft*(gs/gsm)/gs)*gs;
    var yCentreR = Math.round(+blockset[i].yCentre*(gs/gsm)/gs)*gs;
    var ySizeR = Math.round(+blockset[i].ySize*(gs/gsm)/gs)*gs;
    
    //Changes yCentreR to snap with grid
    if (oddEven(ySizeR/gs)) {
        yCentreR = yCentreR;                
    }
    else {
        yCentreR = yCentreR - gs/2;
    }
    
    //adding colour
    //if (+blockset[i].SpaceClaim <= ((xFwdR/(gs/gsm)) - (xAftR/(gs/gsm))) * (ySizeR/(gs/gsm))) {
        if (blockset[i].Group === "FLOAT") {blockset[i].colour = "rgba(31, 119, 180, 0.8)";}
        else if (blockset[i].Group === "MOVE") {blockset[i].colour = "rgba(255, 127, 14, 0.8)";}
        else if (blockset[i].Group === "FIGHT") {blockset[i].colour = "rgba(44, 160, 44, 0.8)";}
        else if (blockset[i].Group === "INFRA") {blockset[i].colour = "rgba(214, 39, 40, 0.8)";}
        else {blockset[i].colour = "rgba(148, 103, 189, 0.8)";};
    //}
    //else {
    //    blockset[i].colour = "rgba(105, 105, 105, 0.8)";
    //}
    
    //Font colour red if weight DBB
    var fontc;
    if (ySizeR == 0 || xFwdR == xAftR || +blockset[i].zHeight < 0.05) {fontc = "red";}
    else {fontc = "black";}
    
    //check if block is in deck, add deck to .decks and plot it on the grid
    for (j=0; j < ndecks.length; j++){
        if (j==0){
            //Creating a deck above the highest deck. The if bellow just works if the function check_block_in_deck returns true
            if(check_block_in_deck(1000000, pdecks[j], Math.round(+blockset[i].zBase*10)/10, Math.round(+blockset[i].zHeight*10)/10)){
                blockset[i].decks.push({deck:ndecks[j], pdeck:pdecks[j], block:s.rect(xAftR, (cline)-yCentreR-ySizeR/2, xFwdR-xAftR, ySizeR, 1, 1).attr({//all attributes here are insisde node
                    fill: blockset[i].colour,
                    stroke: "black",
                    id: blockset[i].Classification,
                    strokeWidth: 2
                }).click(clickCallBack), textid:s.text(xAftR+4, (cline)-yCentreR, blockset[i].Classification + ' ' + blockset[i].Name).attr({
                    "font-size": (2/3)*s_text+"px",
                    "fill": fontc,
                    id: blockset[i].Classification
                }).click(clickCallBack)
                                       });
            }
        }
        else if(check_block_in_deck(pdecks[j-1], pdecks[j], Math.round(+blockset[i].zBase*10)/10, Math.round(+blockset[i].zHeight*10)/10)){
            blockset[i].decks.push({deck:ndecks[j], pdeck:pdecks[j], block:s.rect(xAftR, (cline+(Math.round(1.25*canvas_y/gs)*gs)*j)-yCentreR-ySizeR/2, xFwdR-xAftR, ySizeR, 1, 1).attr({
                fill: blockset[i].colour,
                stroke: "black",
                id: blockset[i].Classification,
                strokeWidth: 2
            }).click(clickCallBack), textid:s.text(xAftR+4, (cline+(Math.round(1.25*canvas_y/gs)*gs)*j)-yCentreR, blockset[i].Classification + ' ' + blockset[i].Name).attr({
                "font-size": (2/3)*s_text+"px",
                "fill": fontc,
                id: blockset[i].Classification
            }).click(clickCallBack)
                                   });
        }
    }
    
    //Adjacency variables
    var xStart = xAftR / gs + 1; //First x coordinate
    var xFinish = xFwdR / gs; //Last x coordinate
    var yStart = yCentreR / gs - ySizeR / (2*gs) + cline / gs +1; //First y coordinate
    var yFinish = yCentreR / gs + ySizeR / (2*gs) + cline / gs; //Last y coordinate
    // z coordinates
    //var deckarray1 = []; //Array with deck positions per DBB
    //for (m in blockset[i].decks) {
    //    deckarray1.push(blockset[i].decks[m].pdeck);
    //};
    //var deckarray2 = []; //Array with z coordinates per DBB
    //for (n in pdecks) {
    //    for (o in deckarray1) {
    //        if (pdecks[n] == deckarray1[o]) {
    //            deckarray2.push(+n + 1);
    //        }
    //    }
    //}
    blockset[i].grCoo = []; //Creating property "gridCoordinates"
    //for (p in deckarray2) {
        for (y=yStart; y<=yFinish; y++) {
            for (x=xStart; x<=xFinish; x++) {
                //blockset[i].grCoo.push([x, y, deckarray2[p]]);
                blockset[i].grCoo.push([x, y]);
            }
        }
    }
//}

//Deck names and outlines
doutline = [];
dcurves = [];
hullGen(); //Calls hullGen function
var deckOutlinesR; //New variable for port deck curve
for (i=0; i < ndecks.length; i++){
    coordinates = [s.text(3, (s_text+(Math.round(1.25*canvas_y/gs)*gs)*(i)), ndecks[i] + " (" + pdecks[i] + "m)").attr({"font-size": s_text+"px", fontWeight: '700'})]; //Type deck names
    doutline.push = s.rect(0,(Math.round(1.25*canvas_y/gs)*gs)*(i),canvas_x,canvas_y).attr({ stroke: 'black', 'strokeWidth': 2, fill: 'none' }); //Plot deck outlines
    
    deckOutlinesR = JSON.parse(JSON.stringify(deckOutlines[i])); //http://stackoverflow.com/questions/122102/what-is-the-most-efficient-way-to-clone-an-object, https://davidwalsh.name/javascript-clone-array
    for (j=0; j<deckOutlines[i].length; j++) { //Move curves to each deck
        deckOutlinesR[j][1] = -deckOutlines[i][j][1] + (Math.round(1.25*canvas_y/gs)*gs)*(i) + 0.5*canvas_y;
        deckOutlines[i][j][1] = deckOutlines[i][j][1] + (Math.round(1.25*canvas_y/gs)*gs)*(i) + 0.5*canvas_y;
    }
    dcurves.push = s.polyline(deckOutlines[i]).attr({ stroke: 'blue', 'strokeWidth': 1, fill: 'none' }); //Plot deck curves stbd
    dcurves.push = s.polyline(deckOutlinesR).attr({ stroke: 'blue', 'strokeWidth': 1, fill: 'none' }); //Plot deck curves port
}
//Plot deck roof
doutline2 = [];
dcurves2 = [];
for (i=0; i < ndecks.length - 1; i++){
    deckOutlinesTopR = JSON.parse(JSON.stringify(deckOutlinesTop[i])); //http://stackoverflow.com/questions/122102/what-is-the-most-efficient-way-to-clone-an-object, https://davidwalsh.name/javascript-clone-array
    for (j=0; j<deckOutlinesTop[i].length; j++) { //Move curves to each deck
        deckOutlinesTopR[j][1] = -deckOutlinesTop[i][j][1] + (Math.round(1.25*canvas_y/gs)*gs)*(i) + 0.5*canvas_y + (Math.round(1.25*canvas_y/gs)*gs);
        deckOutlinesTop[i][j][1] = deckOutlinesTop[i][j][1] + (Math.round(1.25*canvas_y/gs)*gs)*(i) + 0.5*canvas_y + (Math.round(1.25*canvas_y/gs)*gs);
    }
    dcurves2.push = s.polyline(deckOutlinesTop[i]).attr({ stroke: 'blue', strokeDasharray: "1", 'strokeWidth': 1, fill: 'none' }); //Plot deck curves stbd
    dcurves2.push = s.polyline(deckOutlinesTopR).attr({ stroke: 'blue', strokeDasharray: "1", 'strokeWidth': 1, fill: 'none' }); //Plot deck curves port
}

//Bulkhead names and outlines
boutline = [];
for (k in nbulkheads){
    boutline.push = s.line(pbulkheads[k]*(gs/gsm), 0, pbulkheads[k]*(gs/gsm), (Math.round(1.25*canvas_y/gs)*gs)*(ndecks.length)-(Math.round(0.25*canvas_y/gs)*gs)).attr({stroke: 'FireBrick', 'strokeWidth': 2, fill: 'none'}); //Plot bulkhead outlines
    
    for (l in ndecks){
        bcoordinates = s.text(pbulkheads[k]*(gs/gsm) + 0.1*s_text, Math.round(1.25*canvas_y/gs)*gs*l - 0.125*canvas_y + 0.3*s_text, nbulkheads[k]).attr({
            "font-size": s_text+"px",
            fontWeight: '700',
            fill: 'FireBrick',
            id: nbulkheads[k]
        }).click(clickCallBackBH); //Type bulkhead names
    }
}

//Calls updateDBBData function
updateDBBData();
}

//Function that is called when page loaded
function on_load(){
d3.csv("data/shipd.csv", function(error, shipsetf){
d3.csv("data/blockd.csv", function(error, blocksetf){
//d3.csv("shipd.csv", function(error, shipsetf){

//Above converts .csv rows to objects
//console.log(shipsetf);
//console.log(blocksetf);

//Set values of global variables
shipset = shipsetf;
blockset = blocksetf;
    
//gs is the grid size of a cell, in pixels
//Reminder to make gridsize scaled to the screen width
gs = 5;
    
//gsm is the cell size in meters
gsm = 0.5;

//Round LAO BOA to gsm
shipset[0].LOA = Math.round(+shipset[0].LOA/gsm)*gsm;
shipset[0].BOA = Math.round(+shipset[0].BOA/gsm)*gsm;
    
//Set LOA BOA slider step equal to one cell length
document.getElementById("canv_x").step = gsm;
document.getElementById("canv_y").step = gsm;
//Sets DBB dimensions sliders steps to one cell length
document.getElementById("s_xFwd").step = gsm;
document.getElementById("s_xAft").step = gsm;
document.getElementById("s_yCentre").step = gsm;
document.getElementById("s_ySize").step = gsm;
document.getElementById("s_bulkhead_p").step = gsm;

//Sets sliders equal to LOA and BOA (and ship name)
document.getElementById("canv_x").value = +shipset[0].LOA;
document.getElementById("loa_val").innerHTML = +shipset[0].LOA;
document.getElementById("canv_y").value = +shipset[0].BOA;
document.getElementById("boa_val").innerHTML = +shipset[0].BOA;
document.getElementById("draft_s").value = +shipset[0].D;
document.getElementById("draft_val").innerHTML = +shipset[0].D;
document.getElementById("shipname").innerHTML = shipset[0].Name;

//Sets numerical and slider values for hullform data from shipd file
document.getElementById("ms_s").value = +shipset[0].HullData.split(" ").map(parseFloat)[0];
document.getElementById("ms_val").innerHTML = +shipset[0].HullData.split(" ").map(parseFloat)[0];
document.getElementById("bow_s").value = +shipset[0].HullData.split(" ").map(parseFloat)[1];
document.getElementById("bow_val").innerHTML = +shipset[0].HullData.split(" ").map(parseFloat)[1];
document.getElementById("tr_s").value = +shipset[0].HullData.split(" ").map(parseFloat)[2];
document.getElementById("tr_val").innerHTML = +shipset[0].HullData.split(" ").map(parseFloat)[2];
document.getElementById("deck_s").value = +shipset[0].HullData.split(" ").map(parseFloat)[3];
document.getElementById("deck_val").innerHTML = +shipset[0].HullData.split(" ").map(parseFloat)[3];
document.getElementById("tb_s").value = +shipset[0].HullData.split(" ").map(parseFloat)[4];
document.getElementById("tb_val").innerHTML = +shipset[0].HullData.split(" ").map(parseFloat)[4];
document.getElementById("td_s").value = +shipset[0].HullData.split(" ").map(parseFloat)[5];
document.getElementById("td_val").innerHTML = +shipset[0].HullData.split(" ").map(parseFloat)[5];
document.getElementById("acu_s").value = +shipset[0].HullData.split(" ").map(parseFloat)[6];
document.getElementById("acu_val").innerHTML = +shipset[0].HullData.split(" ").map(parseFloat)[6];
document.getElementById("kf_s").value = +shipset[0].HullData.split(" ").map(parseFloat)[7];
document.getElementById("kf_val").innerHTML = +shipset[0].HullData.split(" ").map(parseFloat)[7];
document.getElementById("sa_s").value = +shipset[0].HullData.split(" ").map(parseFloat)[8];
document.getElementById("sa_val").innerHTML = +shipset[0].HullData.split(" ").map(parseFloat)[8];

document.getElementById("sp_s").value = +shipset[0].HullData.split(" ").map(parseFloat)[9];
document.getElementById("sp_val").innerHTML = +shipset[0].HullData.split(" ").map(parseFloat)[9];
document.getElementById("cwl_s").value = +shipset[0].HullData.split(" ").map(parseFloat)[10];
document.getElementById("cwl_val").innerHTML =+shipset[0].HullData.split(" ").map(parseFloat)[10];
document.getElementById("lcb_s").value = +shipset[0].HullData.split(" ").map(parseFloat)[11];
document.getElementById("lcb_val").innerHTML = +shipset[0].HullData.split(" ").map(parseFloat)[11];
document.getElementById("cb_s").value = +shipset[0].HullData.split(" ").map(parseFloat)[12];
document.getElementById("cb_val").innerHTML = +shipset[0].HullData.split(" ").map(parseFloat)[12];
document.getElementById("mc_s").value = +shipset[0].HullData.split(" ").map(parseFloat)[13];
document.getElementById("mc_val").innerHTML = +shipset[0].HullData.split(" ").map(parseFloat)[13];
document.getElementById("bb_s").value = +shipset[0].HullData.split(" ").map(parseFloat)[14];
document.getElementById("bb_val").innerHTML = +shipset[0].HullData.split(" ").map(parseFloat)[14];
document.getElementById("tran_s").value = +shipset[0].HullData.split(" ").map(parseFloat)[15];
document.getElementById("tran_val").innerHTML = +shipset[0].HullData.split(" ").map(parseFloat)[15];
document.getElementById("ab_s").value = +shipset[0].HullData.split(" ").map(parseFloat)[16];
document.getElementById("ab_val").innerHTML = +shipset[0].HullData.split(" ").map(parseFloat)[16];

document.getElementById("lwl_s").value = +shipset[0].HullData.split(" ").map(parseFloat)[17];
document.getElementById("lwl_val").innerHTML = +shipset[0].HullData.split(" ").map(parseFloat)[17];
document.getElementById("bwl_s").value = +shipset[0].HullData.split(" ").map(parseFloat)[18];
document.getElementById("bwl_val").innerHTML = +shipset[0].HullData.split(" ").map(parseFloat)[18];
document.getElementById("tf_s").value = +shipset[0].HullData.split(" ").map(parseFloat)[19];
document.getElementById("tf_val").innerHTML = +shipset[0].HullData.split(" ").map(parseFloat)[19];
document.getElementById("ta_s").value = +shipset[0].HullData.split(" ").map(parseFloat)[20];
document.getElementById("ta_val").innerHTML = +shipset[0].HullData.split(" ").map(parseFloat)[20];

document.getElementById("slider_app1").value = +shipset[0].HullData.split(" ").map(parseFloat)[21];
document.getElementById("app1").innerHTML = +shipset[0].HullData.split(" ").map(parseFloat)[21];
document.getElementById("slider_area_app1").value = +shipset[0].HullData.split(" ").map(parseFloat)[22];
document.getElementById("area_app1").innerHTML = +shipset[0].HullData.split(" ").map(parseFloat)[22];
document.getElementById("slider_app2").value = +shipset[0].HullData.split(" ").map(parseFloat)[23];
document.getElementById("app2").innerHTML = +shipset[0].HullData.split(" ").map(parseFloat)[23];
document.getElementById("slider_area_app2").value = +shipset[0].HullData.split(" ").map(parseFloat)[24];
document.getElementById("area_app2").innerHTML = +shipset[0].HullData.split(" ").map(parseFloat)[24];
document.getElementById("slider_area_app3").value = +shipset[0].HullData.split(" ").map(parseFloat)[25];
document.getElementById("area_app3").innerHTML = +shipset[0].HullData.split(" ").map(parseFloat)[25];
document.getElementById("slider_area_app4").value = +shipset[0].HullData.split(" ").map(parseFloat)[26];
document.getElementById("area_app4").innerHTML = +shipset[0].HullData.split(" ").map(parseFloat)[26];
document.getElementById("slider_app5").value = +shipset[0].HullData.split(" ").map(parseFloat)[27];
document.getElementById("app5").innerHTML = +shipset[0].HullData.split(" ").map(parseFloat)[27];
document.getElementById("slider_area_app5").value = +shipset[0].HullData.split(" ").map(parseFloat)[28];
document.getElementById("area_app5").innerHTML = +shipset[0].HullData.split(" ").map(parseFloat)[28];
document.getElementById("slider_area_app6").value = +shipset[0].HullData.split(" ").map(parseFloat)[29];
document.getElementById("area_app6").innerHTML = +shipset[0].HullData.split(" ").map(parseFloat)[29];
document.getElementById("slider_area_app7").value = +shipset[0].HullData.split(" ").map(parseFloat)[30];
document.getElementById("area_app7").innerHTML = +shipset[0].HullData.split(" ").map(parseFloat)[30];
document.getElementById("slider_app8").value = +shipset[0].HullData.split(" ").map(parseFloat)[31];
document.getElementById("app8").innerHTML = +shipset[0].HullData.split(" ").map(parseFloat)[31];
document.getElementById("slider_area_app8").value = +shipset[0].HullData.split(" ").map(parseFloat)[32];
document.getElementById("area_app8").innerHTML = +shipset[0].HullData.split(" ").map(parseFloat)[32];
document.getElementById("slider_area_app9").value = +shipset[0].HullData.split(" ").map(parseFloat)[33];
document.getElementById("area_app9").innerHTML = +shipset[0].HullData.split(" ").map(parseFloat)[33];
document.getElementById("slider_area_app10").value = +shipset[0].HullData.split(" ").map(parseFloat)[34];
document.getElementById("area_app10").innerHTML = +shipset[0].HullData.split(" ").map(parseFloat)[34];
document.getElementById("slider_area_app11").value = +shipset[0].HullData.split(" ").map(parseFloat)[35];
document.getElementById("area_app11").innerHTML = +shipset[0].HullData.split(" ").map(parseFloat)[35];

document.getElementById("cg_s").value = +shipset[0].HullData.split(" ").map(parseFloat)[36];
document.getElementById("cg_val").innerHTML = +shipset[0].HullData.split(" ").map(parseFloat)[36];
document.getElementById("heading_s").value = +shipset[0].HullData.split(" ").map(parseFloat)[37];
document.getElementById("heading_val").innerHTML = +shipset[0].HullData.split(" ").map(parseFloat)[37];
document.getElementById("amplitude_s").value = +shipset[0].HullData.split(" ").map(parseFloat)[38];
document.getElementById("amplitude_val").innerHTML = +shipset[0].HullData.split(" ").map(parseFloat)[38];
document.getElementById("roll_s").value = +shipset[0].HullData.split(" ").map(parseFloat)[39];
document.getElementById("roll_val").innerHTML = +shipset[0].HullData.split(" ").map(parseFloat)[39];
document.getElementById("damping_s").value = +shipset[0].HullData.split(" ").map(parseFloat)[40];
document.getElementById("damping_val").innerHTML = +shipset[0].HullData.split(" ").map(parseFloat)[40];
document.getElementById("plr_s").value = +shipset[0].HullData.split(" ").map(parseFloat)[41];
document.getElementById("plr_val").innerHTML = +shipset[0].HullData.split(" ").map(parseFloat)[41];
document.getElementById("gmt_s").value = +shipset[0].HullData.split(" ").map(parseFloat)[42];
document.getElementById("gmt_val").innerHTML = +shipset[0].HullData.split(" ").map(parseFloat)[42];


//Get bulkheads
nbulkheadsf = shipset[0].Bulkheads.split(" "); //Array with bulkhead names as strings
pbulkheadsf = shipset[0].BHPos.split(" ").map(parseFloat); //Array with positions as numbers
var pbhf; //Stores each bulkhead position
var pbhfa = []; //Array with bulkhead positions
for (i in pbulkheadsf) {
    pbhf = Math.round(pbulkheadsf[i]/gsm)*gsm; //Rounds bulkhead positions to 0.5m
    pbhfa.push(pbhf);
}
nbulkheads = nbulkheadsf;
pbulkheads = pbhfa;
shipset[0].BHPos = pbulkheads.toString().replace(/,/g, " "); //Updates bulkhead position data in shipd file
    
//Get decks
ndecksf = shipset[0].Decks.split(" "); //Array with deck names as strings
pdecksf = shipset[0].DeckPos.split(" ").map(parseFloat); //Array with positions as numbers
var pdf; //Stores each deck position
var pdfa = []; //Array with deck positions
for (i in pdecksf) {
    pdf = Math.round(pdecksf[i]*10)/10; //Rounds deck positions to 0.1m
    pdfa.push(pdf);
}
ndecks = ndecksf;
pdecks = pdfa;
shipset[0].DeckPos = pdecks.toString().replace(/,/g, " "); //Updates deck position data in shipd file

//Round depth to 0.1m
shipset[0].D = Math.round(shipset[0].D*10)/10;

//Calls on_change function
on_change();
plotGZ();
offsets();
plotPower();
Holtrop_calculate();
calculate_jensen();


//End of reading .csv
})})
}

//Function that is called whenever LOA and BOA sliders are altered
function update_loaboa() {
//Sets numerical values equal to slider values
document.getElementById("loa_val").innerHTML = +document.getElementById("canv_x").value;
document.getElementById("boa_val").innerHTML = +document.getElementById("canv_y").value;
document.getElementById("draft_val").innerHTML = +document.getElementById("draft_s").value;

shipset[0].LOA = document.getElementById("loa_val").innerHTML; //Updates LOA in shipd file
shipset[0].BOA = document.getElementById("boa_val").innerHTML; //Updates BOA in shipd file
shipset[0].D = document.getElementById("draft_val").innerHTML;

//Calls on_change function
on_change();
}

//Function that changes LOA slider
function change_number(){
var canvas_x = +document.getElementById("canv_x").value;
document.getElementById("loa_val").innerHTML = canvas_x;
}

//Function that checks which deck each DBB is located on
function check_block_in_deck(deckAbove, deck, zBase, zHeight){
if (zBase >= deckAbove){return}
if (zBase < deck && (zBase+zHeight)<= deck){return}
if ((zBase+zHeight) >= deck) {return true}
}

//Function that rounds and updates DBB data
function updateDBBData() {
//Updates in blockset array
for (i in blockset){
    blockset[i].xAft = Math.round(blockset[i].xAft/gsm)*gsm;
    blockset[i].xFwd = Math.round(blockset[i].xFwd/gsm)*gsm;
    blockset[i].zHeight = Math.round(blockset[i].zHeight*10)/10;
    blockset[i].zBase = Math.round(blockset[i].zBase*10)/10;
    
    if (oddEven(Math.round((blockset[i].ySize/gsm)/1)*1)) {
        blockset[i].yCentre = Math.round(blockset[i].yCentre/gsm)*gsm;
    }
    else {
        blockset[i].yCentre = Math.round(blockset[i].yCentre/gsm)*gsm - gsm/2;
    }
    
    blockset[i].ySize = Math.round(blockset[i].ySize/gsm)*gsm;
}
}

//Function that is called whenever a DBB is clicked on, and gets data of selected block
function clickCallBack(){
currentBlock = return_block(this.node.id);
document.getElementById("block_g").innerHTML = currentBlock.Group;
document.getElementById("block_id").innerHTML = currentBlock.Classification;
document.getElementById("block_n").innerHTML = currentBlock.Name;

//Sets number before slider equal to DBB xAft
document.getElementById("b_xAft").innerHTML = currentBlock.xAft;
//Sets s_xAft slider equal to xAft of selected DBB
document.getElementById("s_xAft").value = currentBlock.xAft;

//Same as above
document.getElementById("b_xFwd").innerHTML = currentBlock.xFwd;
document.getElementById("s_xFwd").value = currentBlock.xFwd;
document.getElementById("b_yCentre").innerHTML = currentBlock.yCentre;
document.getElementById("s_yCentre").value = currentBlock.yCentre;
document.getElementById("b_ySize").innerHTML = currentBlock.ySize;
document.getElementById("s_ySize").value = currentBlock.ySize;
document.getElementById("b_zHeight").innerHTML = currentBlock.zHeight;
document.getElementById("s_zHeight").value = currentBlock.zHeight;
document.getElementById("b_zBase").innerHTML = currentBlock.zBase;
document.getElementById("s_zBase").value = currentBlock.zBase;

DBBAreas(currentBlock.Classification); //Calls DBBAreas function
var passFailA
var passFailV
if (+currentBlock.AreaRequired <= +currentBlock.DBBArea) {passFailA = "Pass";}
else {passFailA = "Fail";}
if (+currentBlock.VolRequired <= +currentBlock.DBBVol) {passFailV = "Pass";}
else {passFailV = "Fail";}
document.getElementById("block_a").innerHTML = currentBlock.DBBAreaTop + " | "  + currentBlock.DBBArea + " | "  + currentBlock.AreaRequired  + " | "  + passFailA;
document.getElementById("block_v").innerHTML = currentBlock.DBBVol + " | "  + currentBlock.VolRequired  + " | "  + passFailV;
}

//Function that searches which DBB is selected in blockset array
function return_block(id_b){
for (i in blockset){
    if (blockset[i].Classification == id_b){return blockset[i]}
}
}

//Function that is called whenever x and z DBB sliders are altered
function update_block(){
//Sets xAft of selected DBB equal to slider value
currentBlock.xAft = document.getElementById("s_xAft").value;
//Sets number before slider equal to DBB xAft
document.getElementById("b_xAft").innerHTML = currentBlock.xAft;

//Same as above
currentBlock.xFwd = document.getElementById("s_xFwd").value;
document.getElementById("b_xFwd").innerHTML = currentBlock.xFwd;
currentBlock.zHeight = document.getElementById("s_zHeight").value;
document.getElementById("b_zHeight").innerHTML = currentBlock.zHeight;
currentBlock.zBase = document.getElementById("s_zBase").value;
document.getElementById("b_zBase").innerHTML = currentBlock.zBase;
//Calls on_change function to redraw GA with updated dimensions
on_change();

DBBAreas(currentBlock.Classification); //Calls DBBAreas function
var passFailA
var passFailV
if (+currentBlock.AreaRequired <= +currentBlock.DBBArea) {passFailA = "Pass";}
else {passFailA = "Fail";}
if (+currentBlock.VolRequired <= +currentBlock.DBBVol) {passFailV = "Pass";}
else {passFailV = "Fail";}
document.getElementById("block_a").innerHTML = currentBlock.DBBAreaTop + " | "  + currentBlock.DBBArea + " | "  + currentBlock.AreaRequired  + " | "  + passFailA;
document.getElementById("block_v").innerHTML = currentBlock.DBBVol + " | "  + currentBlock.VolRequired  + " | "  + passFailV;
}

//Function that is called whenever yCentre DBB slider is altered
function update_block2(){
currentBlock.yCentre = document.getElementById("s_yCentre").value;

if (oddEven(Math.round((currentBlock.ySize/gsm)/1)*1)) {
    currentBlock.yCentre = currentBlock.yCentre;
}
else {
    currentBlock.yCentre = currentBlock.yCentre - gsm/2;
}

document.getElementById("b_yCentre").innerHTML = currentBlock.yCentre
//Calls on_change function to redraw GA with updated dimensions
on_change();

DBBAreas(currentBlock.Classification); //Calls DBBAreas function
var passFailA
var passFailV
if (+currentBlock.AreaRequired <= +currentBlock.DBBArea) {passFailA = "Pass";}
else {passFailA = "Fail";}
if (+currentBlock.VolRequired <= +currentBlock.DBBVol) {passFailV = "Pass";}
else {passFailV = "Fail";}
document.getElementById("block_a").innerHTML = currentBlock.DBBAreaTop + " | "  + currentBlock.DBBArea + " | "  + currentBlock.AreaRequired  + " | "  + passFailA;
document.getElementById("block_v").innerHTML = currentBlock.DBBVol + " | "  + currentBlock.VolRequired  + " | "  + passFailV;
}

//Function that is called whenever ySize DBB slider is altered
function update_block3(){
currentBlock.yCentre = document.getElementById("s_yCentre").value;

if (oddEven(Math.round((currentBlock.ySize/gsm)/1)*1)) {
    currentBlock.yCentre = currentBlock.yCentre - gsm/2;
}

document.getElementById("b_yCentre").innerHTML = currentBlock.yCentre
currentBlock.ySize = document.getElementById("s_ySize").value;
document.getElementById("b_ySize").innerHTML = currentBlock.ySize;
//Calls on_change function to redraw GA with updated dimensions
on_change();

DBBAreas(currentBlock.Classification); //Calls DBBAreas function
var passFailA
var passFailV
if (+currentBlock.AreaRequired <= +currentBlock.DBBArea) {passFailA = "Pass";}
else {passFailA = "Fail";}
if (+currentBlock.VolRequired <= +currentBlock.DBBVol) {passFailV = "Pass";}
else {passFailV = "Fail";}
document.getElementById("block_a").innerHTML = currentBlock.DBBAreaTop + " | "  + currentBlock.DBBArea + " | "  + currentBlock.AreaRequired  + " | "  + passFailA;
document.getElementById("block_v").innerHTML = currentBlock.DBBVol + " | "  + currentBlock.VolRequired  + " | "  + passFailV;
}

//Function that calculates if the number of cells in the Beam and ySize of the DBBs is odd or even
function oddEven(ySize){
if ((((document.getElementById("canv_y").value * (gs/gsm)) / gs) % 2 == 0) && ((ySize) % 2 == 0)) { //If number of cells in beam and in DBB are even
    return true;
}
else if ((((document.getElementById("canv_y").value * (gs/gsm)) / gs) % 2 != 0) && ((ySize) % 2 != 0)) { //If number of cells in beam and in DBB are odd
    return true;
}
}

//Function that is called whenever a bulkhead label is clicked on, and gets data of selected bulkhead
function clickCallBackBH(){
currentBH = return_bh(this.node.id);
currentBHid = this.node.id
document.getElementById("bulkhead_n").innerHTML = currentBHid;
document.getElementById("bulkhead_p").innerHTML = Math.round(currentBH/gsm)*gsm;
document.getElementById("s_bulkhead_p").value = Math.round(currentBH/gsm)*gsm;
}

//Function that searches which bulkhead is selected in nbulkheads array
function return_bh(id_bh){
for (i in nbulkheads){
    if (nbulkheads[i] == id_bh){return pbulkheads[i]}
}
}

//Function that is called whenever the bulkhead slider is altered
function update_bh(){
currentBH = document.getElementById("s_bulkhead_p").value;
document.getElementById("bulkhead_p").innerHTML = currentBH;

for (i in nbulkheads){
    if (nbulkheads[i] == currentBHid){
        pbulkheads[i] = currentBH;
    };
}

//Creates new BHPos entry for shipd.csv file
var pBHUpdated = [];
var BHPosUpdated;
for (j in pbulkheads){
    pBHUpdated.push(+pbulkheads[j]);
};
BHPosUpdated = pBHUpdated.toString().replace(/,/g, " ");
shipset[0].BHPos = BHPosUpdated; //Updates bulkhead position data in shipd file

//Calls on_change function
on_change();
}

//Function that creates DBB objects with areas and centres
function areasCentres(Classification, Name, AreaTop, AreaBase, AreaRequired, AreaCriteria, Volume, VolRequired, VolCriteria, LightshipsWeight, WeightCond1, WeightCond2, xCentre, yCentre, zCentre){
this.Classification = Classification;                
this.Name = Name;
this.AreaTop = AreaTop;
this.AreaBase = AreaBase;
this.AreaRequired = AreaRequired;
this.AreaCriteria = AreaCriteria;
this.Volume = Volume;
this.VolRequired = VolRequired;
this.VolCriteria = VolCriteria;
this.LightshipsWeight = LightshipsWeight;
this.WeightCond1 = WeightCond1;
this.WeightCond2 = WeightCond2;
this.xCentre = xCentre;
this.yCentre = yCentre;
this.zCentre = zCentre;
}

//Function that creates DBB objects with proximities
function DBBProximities(Classification1, Name1, Classification2, Name2, EuclideanDistance, ManhattanDistance){
this.Classification1 = Classification1;
this.Name1 = Name1;
this.Classification2 = Classification2;
this.Name2 = Name2;
this.EuclideanDistance = EuclideanDistance;
this.ManhattanDistance = ManhattanDistance;
}

//Function that creates DBB objects with adjacencies
function DBBAdjacencies(Classification1, Name1, Classification2, Name2, xCentre1, yCentre1, zCentre1, xCentre2, yCentre2, zCentre2){
this.Classification1 = Classification1;
this.Name1 = Name1;
this.Classification2 = Classification2;
this.Name2 = Name2;
this.xCentre1 = xCentre1;
this.yCentre1 = yCentre1;
this.zCentre1 = zCentre1;
this.xCentre2 = xCentre2;
this.yCentre2 = yCentre2;
this.zCentre2 = zCentre2;
}

//Function that calculates areas, centres and proximities and inputs them into the DBB objects
function areasCentresProximities(){
//Calculates areas and centres and inputs them into the new DBB objects
aAndc =[];

var topAreas = [];
var baseAreas = [];
var aPassFail = [];
var volDBB = [];
var vPassFail = [];
var Weight1 = [];
var Weight2 = [];
for (m in blockset) {
    DBBAreas(blockset[m].Classification); //Calls DBBAreas function and inputs data into above arrays
    topAreas.push(+blockset[m].DBBAreaTop);
    baseAreas.push(+blockset[m].DBBArea);
    if (+blockset[m].AreaRequired <= +blockset[m].DBBArea) {aPassFail.push("Pass");}
    else {aPassFail.push("Fail");}
    volDBB.push(+blockset[m].DBBVol);      
    if (+blockset[m].VolRequired <= +blockset[m].DBBVol) {vPassFail.push("Pass");}
    else {vPassFail.push("Fail");}
    if (+blockset[m].FluidDensity > 0) { //Calculates fluid weights
        Weight1.push(+blockset[m].FixedWeight_lightships + +blockset[m].VariableWeight_cond1 * (+blockset[m].DBBVol * +blockset[m].FluidDensity));
        Weight2.push(+blockset[m].FixedWeight_lightships + +blockset[m].VariableWeight_cond2 * (+blockset[m].DBBVol * +blockset[m].FluidDensity));
    }
    else { //Calculates solid weights
        Weight1.push(+blockset[m].FixedWeight_lightships + +blockset[m].VariableWeight_cond1);
        Weight2.push(+blockset[m].FixedWeight_lightships + +blockset[m].VariableWeight_cond2);
    }
};

var xC = [];
var yC = [];
var zC = [];
for (n in blockset) {
    DBBCentres1(blockset[n].Classification); //Calls DBBCentres1 function (DBBAreas already called above)
};
for (o in blockset) {
    DBBCentres2(blockset[o].Classification); //Calls DBBCentres2 function (DBBAreas already called above)
};
for (p in blockset) { //Inputs data into above arrays
    xC.push((+blockset[p].xyCentreBase[0] + +blockset[p].xyCentreTop[0])/2);
    yC.push((+blockset[p].xyCentreBase[1] + +blockset[p].xyCentreTop[1])/2);
    zC.push(+blockset[p].zCentre);
};

for (i in blockset) {
    aAndc[i] = new areasCentres(blockset[i].Classification, blockset[i].Name, topAreas[i], baseAreas[i], blockset[i].AreaRequired, aPassFail[i], volDBB[i], blockset[i].VolRequired, vPassFail[i], blockset[i].FixedWeight_lightships, Weight1[i], Weight2[i], xC[i], yC[i], zC[i]);
};

//Calculates proximities and inputs them into the new DBB objects
proximities =[];
/*
for (i=0; i<aAndc.length; i++) {
    for (j=0; j<aAndc.length; j++) {
        k = i * aAndc.length + j;
        proximities[k] = new DBBProximities(aAndc[i].Classification, aAndc[i].Name, aAndc[j].Classification, aAndc[j].Name, Math.sqrt(Math.pow((aAndc[i].xCentre - aAndc[j].xCentre), 2) + Math.pow((aAndc[i].yCentre - aAndc[j].yCentre), 2) + Math.pow((aAndc[i].zCentre - aAndc[j].zCentre), 2)), Math.abs(aAndc[i].xCentre - aAndc[j].xCentre) + Math.abs(aAndc[i].yCentre - aAndc[j].yCentre) + Math.abs(aAndc[i].zCentre - aAndc[j].zCentre));
    }
};
*/
for (i=0; i<aAndc.length; i++) {
    for (l=0,j=0; j<aAndc.length; j++,l+=aAndc.length) {
        k = i * aAndc.length + j - 1;
        if (k < (l + i - 1)) {
            proximities[k] = new DBBProximities(aAndc[i].Classification, aAndc[i].Name, aAndc[j].Classification, aAndc[j].Name, Math.sqrt(Math.pow((+aAndc[i].xCentre - +aAndc[j].xCentre), 2) + Math.pow((+aAndc[i].yCentre - +aAndc[j].yCentre), 2) + Math.pow((+aAndc[i].zCentre - +aAndc[j].zCentre), 2)), Math.abs(+aAndc[i].xCentre - +aAndc[j].xCentre) + Math.abs(+aAndc[i].yCentre - +aAndc[j].yCentre) + Math.abs(+aAndc[i].zCentre - +aAndc[j].zCentre));
        }
    }
};
}

//Function that calculates adjacencies and inputs them into the DBB objects
function adjacencies(){
var adjArray = []; //Array with adjacencies
loop1:
for (i in blockset) {
loop2:
    for (j in blockset) {
        if (blockset[i].Classification != blockset[j].Classification) {
loop3:
            for (k in blockset[i].grCoo) {
loop4:                
                for (l in blockset[j].grCoo) { //Goes through x, y and z coordinates per DBB pair to check for adjacencies
                    //if (blockset[i].grCoo[k][0] == blockset[j].grCoo[l][0] && blockset[i].grCoo[k][1] == blockset[j].grCoo[l][1] && blockset[i].grCoo[k][2] == (blockset[j].grCoo[l][2] - 1)) {
                    if (blockset[i].grCoo[k][0] == blockset[j].grCoo[l][0] && blockset[i].grCoo[k][1] == blockset[j].grCoo[l][1] && (+blockset[i].zBase + +blockset[i].zHeight) == +blockset[j].zBase && +blockset[i].zHeight > 0 && +blockset[j].zHeight > 0) {
                        adjArray.push([blockset[i].Classification, blockset[i].Name, blockset[j].Classification, blockset[j].Name]);
                        break loop3;
                    }
                    //else if (blockset[i].grCoo[k][1] == blockset[j].grCoo[l][1] && blockset[i].grCoo[k][2] == blockset[j].grCoo[l][2] && blockset[i].grCoo[k][0] == (blockset[j].grCoo[l][0] - 1)) {
                    else if (blockset[i].grCoo[k][1] == blockset[j].grCoo[l][1] && (((+blockset[j].zBase + +blockset[j].zHeight) > +blockset[i].zBase && +blockset[i].zBase >= +blockset[j].zBase) || ((+blockset[j].zBase + +blockset[j].zHeight) >= (+blockset[i].zBase + +blockset[i].zHeight) && (+blockset[i].zBase + +blockset[i].zHeight) > +blockset[j].zBase) || ((+blockset[i].zBase + +blockset[i].zHeight) > +blockset[j].zBase && +blockset[j].zBase >= +blockset[i].zBase) || ((+blockset[i].zBase + +blockset[i].zHeight) >= (+blockset[j].zBase + +blockset[j].zHeight) && (+blockset[j].zBase + +blockset[j].zHeight) > +blockset[i].zBase))  && blockset[i].grCoo[k][0] == (blockset[j].grCoo[l][0] - 1) && +blockset[i].zHeight > 0 && +blockset[j].zHeight > 0) {
                        adjArray.push([blockset[i].Classification, blockset[i].Name, blockset[j].Classification, blockset[j].Name]);
                        break loop3;
                    }
                    //else if (blockset[i].grCoo[k][2] == blockset[j].grCoo[l][2] && blockset[i].grCoo[k][0] == blockset[j].grCoo[l][0] && blockset[i].grCoo[k][1] == (blockset[j].grCoo[l][1] - 1)) {
                    else if ((((+blockset[j].zBase + +blockset[j].zHeight) > +blockset[i].zBase && +blockset[i].zBase >= +blockset[j].zBase) || ((+blockset[j].zBase + +blockset[j].zHeight) >= (+blockset[i].zBase + +blockset[i].zHeight) && (+blockset[i].zBase + +blockset[i].zHeight) > +blockset[j].zBase) || ((+blockset[i].zBase + +blockset[i].zHeight) > +blockset[j].zBase && +blockset[j].zBase >= +blockset[i].zBase) || ((+blockset[i].zBase + +blockset[i].zHeight) >= (+blockset[j].zBase + +blockset[j].zHeight) && (+blockset[j].zBase + +blockset[j].zHeight) > +blockset[i].zBase)) && blockset[i].grCoo[k][0] == blockset[j].grCoo[l][0] && blockset[i].grCoo[k][1] == (blockset[j].grCoo[l][1] - 1) && +blockset[i].zHeight > 0 && +blockset[j].zHeight > 0) {
                        adjArray.push([blockset[i].Classification, blockset[i].Name, blockset[j].Classification, blockset[j].Name]);
                        break loop3;
                    }
                }
            }
        }
    }   
};

areasCentresProximities(); //Calls areasCentresProximities function to get DBB centres
adj = [];
for (m in adjArray) {
    for (p in aAndc) {
        if (adjArray[m][0] == aAndc[p].Classification) { //Centres of first DBB
            for (q in aAndc) {
                if (adjArray[m][2] == aAndc[q].Classification) { //Centres of second DBB
                    adj[m] = new DBBAdjacencies(adjArray[m][0], adjArray[m][1], adjArray[m][2], adjArray[m][3], aAndc[p].xCentre, aAndc[p].yCentre, aAndc[p].zCentre, aAndc[q].xCentre, aAndc[q].yCentre, aAndc[q].zCentre);
                }
            }
        }
    }
};

//Deletes duplicated adjacent DBB pairs
for (n in adj) {
    for (o in adj) {
        if (adj[n].Classification1 == adj[o].Classification2 && adj[n].Classification2 == adj[o].Classification1) {
            delete adj[o];
        }
    }
};
}

//Hullform generator
function hullGen(){
//Sets hullform data to slider values
var midshipsM = document.getElementById("ms_val").innerHTML; //Constant m in JC equation
var bowRakeM = document.getElementById("bow_val").innerHTML; //Constant m in JC equation
var transomM = document.getElementById("tr_val").innerHTML; //Constant m in JC equation
var fwdDeckM = document.getElementById("deck_val").innerHTML; //Constant m in JC equation

var transomBeamMax = (shipset[0].BOA * document.getElementById("tb_val").innerHTML) / 2; //Transom half beam
var transomTip = shipset[0].D * document.getElementById("td_val").innerHTML;
var ACU = shipset[0].LOA * document.getElementById("acu_val").innerHTML;
var keelFwd = shipset[0].LOA * document.getElementById("kf_val").innerHTML;
var slope = document.getElementById("sa_val").innerHTML;

var midBeam = []; //Array with midships half beam per deck
var bowRake = []; //Array with bow rake per deck
var bowRakeS = []; //Array with bow rake per deck in superstructure
var TB; //Transom half beam of a deck
var transomBeam = []; //Array with transom half beam per deck
var fwdDeckMArray = []; //Array with constants m in JC equation for deck outlines
var AE; //Aft end of a deck
var aftEnd = []; //Array with aft end of each deck
var aftEndS = []; //Array with aft end of each deck in superstructure
var noseConeBaseRadius = []; //See excel tool
var ogiveRadius = []; //See excel tool
var pdecks2 = []; //Array with deck positions of hull decks
var pdecks3 = []; //Array with deck positions of superstructure decks

for (i in pdecks) { //Assign values to variables above
    if (pdecks[i] <= shipset[0].D) { //For each deck that is in the hull
        midBeam.push((Math.acosh((pdecks[i] / shipset[0].D) * (Math.cosh(midshipsM * Math.PI) - 1) + 1) / (midshipsM * Math.PI)) * (shipset[0].BOA / 2));
        bowRake.push((Math.acosh((pdecks[i] / shipset[0].D) * (Math.cosh(bowRakeM * Math.PI) - 1) + 1) / (bowRakeM * Math.PI)) * (shipset[0].LOA - keelFwd));
        if (pdecks[i] > transomTip) {
            TB = ((Math.acosh(((pdecks[i] - transomTip) / (shipset[0].D - transomTip)) * (Math.cosh(transomM * Math.PI) - 1) + 1) / (transomM * Math.PI)) * (transomBeamMax));
        }
        else {
            TB = 0;
        }
        transomBeam.push(TB);
        fwdDeckMArray.push(fwdDeckM * (pdecks[i] / (shipset[0].D)) + 0.001); //Changes constant m in JC equation to make deck outlines becomes slimmer with decreasing z position (see below)
        if (pdecks[i] >= transomTip) {
            AE = (shipset[0].D - pdecks[i]) * Math.tan(slope);
        }
        else {
            AE = (shipset[0].D - transomTip) * Math.tan(slope) + (transomTip - pdecks[i]) * ((ACU - (shipset[0].D - transomTip) * Math.tan(slope)) / transomTip);
        }
        aftEnd.push(AE);
        pdecks2.push(pdecks[i]);
    }
    else { //For each deck that is in the superstructure
        aftEndS.push((pdecks[i] - shipset[0].D) * Math.tan(slope));
        bowRakeS.push(shipset[0].LOA - ((pdecks[i] - shipset[0].D) * Math.tan(slope)) - keelFwd);
        pdecks3.push(pdecks[i]);
    }
};
for (i in midBeam) { //Assign values to variables above cont.
    noseConeBaseRadius.push(midBeam[i] - transomBeam[i]);
    if (noseConeBaseRadius[i] > 0) {
            ogiveRadius.push((Math.pow(noseConeBaseRadius[i], 2) + Math.pow((shipset[0].LOA / 2) - aftEnd[i], 2)) / (2 * noseConeBaseRadius[i]));
        }
        else {
            ogiveRadius.push(0);
        }
};

var deckOutlinesHull = []; //Array with hull deck outline x, y coordinates
//Get y points for every x
for (j in midBeam) { //For each deck in hull
    deckOutlinesHull[j] = []; //For each deck create array
    if (pdecks2[j] != 0) { //If not keel
        if (transomBeam[j] > 0) { //Add vertical hull line at transom
            deckOutlinesHull[j].push([Math.ceil((aftEnd[j])/gsm)*gsm * (gs/gsm), 0]);
        }
        for (k=Math.ceil((aftEnd[j])/gsm)*gsm; k<Math.round((shipset[0].LOA/2)/gsm)*gsm; k+=gsm) { //For aft half of each deck in the hull
            deckOutlinesHull[j].push([k * (gs/gsm), (Math.sqrt(Math.pow(ogiveRadius[j], 2) - Math.pow(k - shipset[0].LOA/2, 2)) + noseConeBaseRadius[j] - ogiveRadius[j] + transomBeam[j]) * (gs/gsm)]);
        }
        for (k=Math.round((shipset[0].LOA/2)/gsm)*gsm; k<=(keelFwd + bowRake[j]); k+=gsm) { //For forward half of each deck in the hull
            var eqX = (k - shipset[0].LOA/2) / (keelFwd + bowRake[j] - (shipset[0].LOA/2)); //Value of x in JC equation
            deckOutlinesHull[j].push([k * (gs/gsm), (1- ((Math.cosh(eqX * fwdDeckMArray[j] * Math.PI) - 1) / (Math.cosh(fwdDeckMArray[j] * Math.PI) - 1))) * midBeam[j] * (gs/gsm)]);
        }
    }
    else { //If keel draw top
        //for (k=Math.ceil((aftEnd[j-1])/gsm)*gsm; k<Math.round((shipset[0].LOA/2)/gsm)*gsm; k+=gsm) { //For aft half of each deck in the hull
        //    deckOutlinesHull[j].push([k * (gs/gsm), (Math.sqrt(Math.pow(ogiveRadius[j-1], 2) - Math.pow(k - shipset[0].LOA/2, 2)) + noseConeBaseRadius[j-1] - ogiveRadius[j-1] + transomBeam[j-1]) * (gs/gsm)]);
        //}
        //for (k=Math.round((shipset[0].LOA/2)/gsm)*gsm; k<=(keelFwd + bowRake[j-1]); k+=gsm) { //For forward half of each deck in the hull
        //    var eqX = (k - shipset[0].LOA/2) / (keelFwd + bowRake[j-1] - (shipset[0].LOA/2)); //Value of x in JC equation
        //    deckOutlinesHull[j].push([k * (gs/gsm), (1- ((Math.cosh(eqX * fwdDeckMArray[j-1] * Math.PI) - 1) / (Math.cosh(fwdDeckMArray[j-1] * Math.PI) - 1))) * midBeam[j-1] * (gs/gsm)]);
        //}
        for (k=Math.ceil((aftEnd[j])/gsm)*gsm; k<=(keelFwd + bowRake[j]); k+=gsm) {
            deckOutlinesHull[j].push([k * (gs/gsm), 0]); //Straight line
        }
    }
};

var deckOutlinesS = []; //Array with superstructure deck outline x, y coordinates
var tumblehome; //Superstructure tumblehome
for (n in aftEndS) { //For each deck in superstructure
    deckOutlinesS[n] = []; //For each deck create array
    tumblehome = (pdecks3[n] - shipset[0].D) * Math.tan(slope) //Calculate tumblehome y offset to subtract below
    deckOutlinesS[n].push([Math.ceil((aftEndS[n])/gsm)*gsm * (gs/gsm), 0]); //Add vertical hull line at transom
    for (k=Math.ceil((aftEndS[n])/gsm)*gsm; k<Math.round((shipset[0].LOA/2)/gsm)*gsm; k+=gsm) { //For aft half of each deck in the superstructure (same equation as above with tumblehome y offset subtracted)
            deckOutlinesS[n].push([k * (gs/gsm), (Math.sqrt(Math.pow(ogiveRadius[0], 2) - Math.pow(k - shipset[0].LOA/2, 2)) + noseConeBaseRadius[0] - ogiveRadius[0] + transomBeam[0] - tumblehome) * (gs/gsm)]);
    }
    for (k=Math.round((shipset[0].LOA/2)/gsm)*gsm; k<=(keelFwd + bowRakeS[n]); k+=gsm) { //For forward half of each deck in the superstructure (same equation as above with tumblehome y offset subtracted) 
        var eqX = (k - shipset[0].LOA/2) / (keelFwd + bowRakeS[n] - (shipset[0].LOA/2)); //Value of x in JC equation
        deckOutlinesS[n].push([k * (gs/gsm), (1- ((Math.cosh(eqX * fwdDeckMArray[0] * Math.PI) - 1) / (Math.cosh(fwdDeckMArray[0] * Math.PI) - 1))) * (midBeam[0] - tumblehome) * (gs/gsm)]);
    }
};

//Adds hull and superstrucutre deck outline coordinates into a single global array
deckOutlines = deckOutlinesS.concat(deckOutlinesHull);
deckOutlinesTop = JSON.parse(JSON.stringify(deckOutlines)); //http://stackoverflow.com/questions/122102/what-is-the-most-efficient-way-to-clone-an-object, https://davidwalsh.name/javascript-clone-array
deckOutlines2 = JSON.parse(JSON.stringify(deckOutlines)); //http://stackoverflow.com/questions/122102/what-is-the-most-efficient-way-to-clone-an-object, https://davidwalsh.name/javascript-clone-array
}

//Function that gets called when hullform data sliders are altered
function hullSliders() {

Holtrop_calculate();

//Sets numerical values equal to slider values
document.getElementById("ms_val").innerHTML = +document.getElementById("ms_s").value;
document.getElementById("bow_val").innerHTML = +document.getElementById("bow_s").value;
document.getElementById("tr_val").innerHTML = +document.getElementById("tr_s").value;
document.getElementById("deck_val").innerHTML = +document.getElementById("deck_s").value;
document.getElementById("tb_val").innerHTML = +document.getElementById("tb_s").value;
document.getElementById("td_val").innerHTML = +document.getElementById("td_s").value;
document.getElementById("acu_val").innerHTML = +document.getElementById("acu_s").value;
document.getElementById("kf_val").innerHTML = +document.getElementById("kf_s").value;
document.getElementById("sa_val").innerHTML = +document.getElementById("sa_s").value;
document.getElementById("sp_val").innerHTML = +document.getElementById("sp_s").value;
document.getElementById("cwl_val").innerHTML = +document.getElementById("cwl_s").value;
document.getElementById("lcb_val").innerHTML = +document.getElementById("lcb_s").value;
document.getElementById("cb_val").innerHTML = +document.getElementById("cb_s").value;
document.getElementById("mc_val").innerHTML = +document.getElementById("mc_s").value;
document.getElementById("bb_val").innerHTML = +document.getElementById("bb_s").value;
document.getElementById("tran_val").innerHTML = +document.getElementById("tran_s").value;
document.getElementById("ab_val").innerHTML = +document.getElementById("ab_s").value;
document.getElementById("lwl_val").innerHTML = +document.getElementById("lwl_s").value;
document.getElementById("bwl_val").innerHTML = +document.getElementById("bwl_s").value;
document.getElementById("tf_val").innerHTML = +document.getElementById("tf_s").value;
document.getElementById("ta_val").innerHTML = +document.getElementById("ta_s").value;

document.getElementById("app1").innerHTML = +document.getElementById("slider_app1").value;
document.getElementById("area_app1").innerHTML = +document.getElementById("slider_area_app1").value;
document.getElementById("app2").innerHTML = +document.getElementById("slider_app2").value;
document.getElementById("area_app2").innerHTML = +document.getElementById("slider_area_app2").value;
document.getElementById("area_app3").innerHTML = +document.getElementById("slider_area_app3").value;
document.getElementById("area_app4").innerHTML = +document.getElementById("slider_area_app4").value;
document.getElementById("app5").innerHTML = +document.getElementById("slider_app5").value;
document.getElementById("area_app5").innerHTML = +document.getElementById("slider_area_app5").value;
document.getElementById("area_app6").innerHTML = +document.getElementById("slider_area_app6").value;
document.getElementById("area_app7").innerHTML = +document.getElementById("slider_area_app7").value;
document.getElementById("app8").innerHTML = +document.getElementById("slider_app8").value;
document.getElementById("area_app8").innerHTML = +document.getElementById("slider_area_app8").value;
document.getElementById("area_app9").innerHTML = +document.getElementById("slider_area_app5").value;
document.getElementById("area_app10").innerHTML = +document.getElementById("slider_area_app6").value;
document.getElementById("area_app11").innerHTML = +document.getElementById("slider_area_app7").value;

document.getElementById("cg_val").innerHTML = +document.getElementById("cg_s").value;
document.getElementById("heading_val").innerHTML = +document.getElementById("heading_s").value;
document.getElementById("amplitude_val").innerHTML = +document.getElementById("amplitude_s").value;
document.getElementById("roll_val").innerHTML = +document.getElementById("roll_s").value;
document.getElementById("damping_val").innerHTML = +document.getElementById("damping_s").value;
document.getElementById("plr_val").innerHTML = +document.getElementById("plr_s").value;
document.getElementById("gmt_val").innerHTML = +document.getElementById("gmt_s").value;


//Creates new HullData entry for shipd.csv file
var HDUpdated = [];
var HullDataUpdated;
HDUpdated = [document.getElementById("ms_val").innerHTML, document.getElementById("bow_val").innerHTML, document.getElementById("tr_val").innerHTML, document.getElementById("deck_val").innerHTML, document.getElementById("tb_val").innerHTML, document.getElementById("td_val").innerHTML, document.getElementById("acu_val").innerHTML, document.getElementById("kf_val").innerHTML, document.getElementById("sa_val").innerHTML, document.getElementById("sp_val").innerHTML, document.getElementById("cwl_val").innerHTML, document.getElementById("lcb_val").innerHTML, document.getElementById("cb_val").innerHTML, document.getElementById("mc_val").innerHTML, document.getElementById("bb_val").innerHTML, document.getElementById("tran_val").innerHTML, document.getElementById("ab_val").innerHTML, document.getElementById("lwl_val").innerHTML, document.getElementById("bwl_val").innerHTML, document.getElementById("tf_val").innerHTML, document.getElementById("ta_val").innerHTML, document.getElementById("app1").innerHTML, document.getElementById("area_app1").innerHTML, document.getElementById("app2").innerHTML, document.getElementById("area_app2").innerHTML, document.getElementById("area_app3").innerHTML, document.getElementById("area_app4").innerHTML, document.getElementById("app5").innerHTML, document.getElementById("area_app5").innerHTML, document.getElementById("area_app6").innerHTML, document.getElementById("area_app7").innerHTML, document.getElementById("app8").innerHTML, document.getElementById("area_app8").innerHTML, document.getElementById("area_app9").innerHTML, document.getElementById("area_app10").innerHTML, document.getElementById("area_app11").innerHTML, document.getElementById("cg_val").innerHTML, document.getElementById("heading_val").innerHTML, document.getElementById("amplitude_val").innerHTML, document.getElementById("roll_val").innerHTML, document.getElementById("damping_val").innerHTML, document.getElementById("plr_val").innerHTML, document.getElementById("gmt_val").innerHTML];
HullDataUpdated = HDUpdated.toString().replace(/,/g, " ");
shipset[0].HullData = HullDataUpdated; //Updates hull data in shipd file

//Calls on_change function
on_change();

calculate_jensen();
}

//Function that creates deck objects
function Decks(DeckName){
this.DeckName = DeckName;
}

//Function that adds deck edge coordinates to deck objects
function DeckCoordinates() {
DC = []; //Array with deck objects
for (i in deckOutlines2) { //For each deck
    DC[i] = new Decks(ndecks[i]); //Create new object
    DC[i].CoordinatesStart = []; //Create coordinates entry in deck object
    DC[i].CoordinatesEnd = []; //Create coordinates entry in deck object
    for (j=0; j<deckOutlines2[i].length - 1; j++) { //For each point in deck curve
        if (deckOutlines2[i][j][1] > 0) { //To avoid transom point, y coordinate has to be > 0
            if (Math.round(((deckOutlines2[i][j][1] + deckOutlines2[i][j+1][1]) / gs) / 2) > 0) { //Not take into account cells of which less than 0.5 of area is in deck
                DC[i].CoordinatesEnd.push([deckOutlines2[i][j][0] / gs + 1, Math.round(((deckOutlines2[i][j][1] + deckOutlines2[i][j+1][1] + (cline/gsm)) / gs) / 2)]); //Push deck edge coordinates
                DC[i].CoordinatesStart.push([deckOutlines2[i][j][0] / gs + 1, Math.round(((-deckOutlines2[i][j][1] - deckOutlines2[i][j+1][1] + (cline/gsm)) / gs) / 2) + 1]); //Push deck edge coordinates
            }
        }
    }
}
}

//Function that calculates DBB areas
function DBBAreas(ClasA) {
DeckCoordinates(); //Calls DeckCoordinates function

var DBBDeck; //Name of deck at base of each DBB
var DBBDeckNo; //Number of deck at base of each DBB
var DBBDeckTop; //Name of deck at top of each DBB
var DBBDeckNoTop; //Number of deck at top of each DBB

for (i in blockset) { //For each DBB
    
    if (blockset[i].Classification == ClasA) { //So does not calculate all areas continuously
    
    DBBDeck = blockset[i].decks[blockset[i].decks.length - 1].deck; //DBB base deck name
    DBBDeckTop = blockset[i].decks[0].deck; //DBB top deck name
    blockset[i].areaCells = []; //Creating property "areaCells" with coordinates of all cells in DBB base, within the deck outline
    blockset[i].areaCellsTop = []; //Creating property "areaCellsTop" with coordinates of all cells in DBB top, within the deck outline
    blockset[i].DBBArea; //Creating property "DBBArea" with base area of each DBB
    blockset[i].DBBAreaTop; //Creating property "DBBAreaTop" with top area of each DBB
    blockset[i].DBBVol; //Creating property "DBBVol" with approx volume of each DBB
    
    for (j in DC) { //For each deck
        if (DBBDeck == DC[j].DeckName) { //If DBB base deck name is equal to deck name
            DBBDeckNo = ndecks.indexOf(DBBDeck); //Get number of DBB base deck
        }
                        
        if (DBBDeckTop == DC[j].DeckName && j != 0) { //If DBB top deck name is equal to deck name
            DBBDeckNoTop = ndecks.indexOf(DBBDeckTop) - 1; //Get number of DBB top deck
        }
        else if (DBBDeckTop == DC[j].DeckName && j == 0) { //If heighest deck
            DBBDeckNoTop = ndecks.indexOf(DBBDeckTop);
        }
    }
    
    for (k in blockset[i].grCoo) {
    //for (k=0; k<(blockset[i].grCoo.length / blockset[i].decks.length); k++) { //For each cell coordinate of the DBB that is in the base deck
        for (l in DC[DBBDeckNo].CoordinatesEnd) { //For each cell coordinate of the DBB base deck
            if (blockset[i].grCoo[k][0] == DC[DBBDeckNo].CoordinatesEnd[l][0] && blockset[i].grCoo[k][1] >= DC[DBBDeckNo].CoordinatesStart[l][1] && blockset[i].grCoo[k][1] <= DC[DBBDeckNo].CoordinatesEnd[l][1]) {
                blockset[i].areaCells.push(blockset[i].grCoo[k]); //Push coordinates of DBB base that are within deck outlines
            }
        }
    }
    blockset[i].DBBArea = blockset[i].areaCells.length / 4; //Calculate DBB base area
    
    for (k in blockset[i].grCoo) {
    //for (k=0; k<(blockset[i].grCoo.length / blockset[i].decks.length); k++) { //For each cell coordinate of the DBB that is in the top deck
        for (l in DC[DBBDeckNoTop].CoordinatesEnd) { //For each cell coordinate of the DBB top deck
            if (blockset[i].grCoo[k][0] == DC[DBBDeckNoTop].CoordinatesEnd[l][0] && blockset[i].grCoo[k][1] >= DC[DBBDeckNoTop].CoordinatesStart[l][1] && blockset[i].grCoo[k][1] <= DC[DBBDeckNoTop].CoordinatesEnd[l][1]) {
                blockset[i].areaCellsTop.push(blockset[i].grCoo[k]); //Push coordinates of DBB top that are within deck outlines
            }
        }
    }
    blockset[i].DBBAreaTop = blockset[i].areaCellsTop.length / 4; //Calculate DBB top area
    
    blockset[i].DBBVol = (((blockset[i].DBBArea + blockset[i].DBBAreaTop) / 2) * blockset[i].zHeight).toFixed(2); //Calculate DBB top area
    
    //console.log(blockset[i].Name, blockset[i].DBBArea, blockset[i].DBBAreaTop, blockset[i].DBBVol);
    }
}
}

//Function that calculates DBB x and y base centres and z centre////////////////////////////////////////////////////////////////////////////////////////////////////
function DBBCentres1(ClasC) { //DBBAreas() has to be called before

var xCent; //DBB xCentre
var yCent; //DBB yCentre
var zCent; //DBB zCentre

for (i in blockset) {
    if (blockset[i].Classification == ClasC) {
        blockset[i].xyCentreBase = []; //Creating property "xyCentreBase"
        blockset[i].zCentre; //Creating property "zCentre"
        
        if (blockset[i].DBBArea > 0) { //For non weights DBBs
            //X CENTRE
            var yArray = []; //Array with y positions of all cells in DBB
            var yMin; //Minimum y cell position of DBB
            var yMax; //Maximum y cell position of DBB
            var xArrayLen = []; //Array with number of cells in x axis for every y for each DBB
            var xArrayInd = []; //Array with sum of indexes of cells in x axis for every y for each DBB
            
            for (j in blockset[i].areaCells) {
                yArray.push(blockset[i].areaCells[j][1]);
            }
            yMin = Math.min( ...yArray );
            yMax = Math.max( ...yArray );
            
            for (l=yMin; l<=yMax; l++) {
                var xArray = []; //Array with x positions of all cells in DBB
                for (k in blockset[i].areaCells) {
                    if(blockset[i].areaCells[k][1] == l) {
                        xArray.push(blockset[i].areaCells[k][0]);
                    }
                }
                xArrayLen.push(xArray.length);
                var xArraySum = 0; //Calculates sum of x index per cell of each DBB
                for (m in xArray) {
                    xArraySum = xArraySum + +xArray[m];
                }
                xArrayInd.push(xArraySum);
            }
            
            //Calculates sums of two arrays
            var xArrayIndSum = 0;
            var xArrayLenSum = 0;
            for (n in xArrayInd) {
                xArrayIndSum = xArrayIndSum + +xArrayInd[n];
                xArrayLenSum = xArrayLenSum + +xArrayLen[n];
            }
            xCent = (xArrayIndSum / xArrayLenSum) * gsm - gsm/2; //Calculates DBB xCentre
            
            //Y CENTRE
            var xArray = []; //Array with x positions of all cells in DBB
            var xMin; //Minimum x cell position of DBB
            var xMax; //Maximum x cell position of DBB
            var yArrayLen = []; //Array with number of cells in y axis for every x for each DBB
            var yArrayInd = []; //Array with sum of indexes of cells in y axis for every x for each DBB
            
            for (j in blockset[i].areaCells) {
                xArray.push(blockset[i].areaCells[j][0]);
            }
            xMin = Math.min( ...xArray );
            xMax = Math.max( ...xArray );
            
            for (l=xMin; l<=xMax; l++) {
                var yArray = []; //Array with y positions of all cells in DBB
                for (k in blockset[i].areaCells) {
                    if(blockset[i].areaCells[k][0] == l) {
                        yArray.push(blockset[i].areaCells[k][1]);
                    }
                }
                yArrayLen.push(yArray.length);
                var yArraySum = 0; //Calculates sum of y index per cell of each DBB
                for (m in yArray) {
                    yArraySum = yArraySum + +yArray[m];
                }
                yArrayInd.push(yArraySum);
            }
            
            //Calculates sums of two arrays
            var yArrayIndSum = 0;
            var yArrayLenSum = 0;
            for (n in yArrayInd) {
                yArrayIndSum = yArrayIndSum + +yArrayInd[n];
                yArrayLenSum = yArrayLenSum + +yArrayLen[n];
            }
            yCent = (yArrayIndSum / yArrayLenSum) * gsm - gsm/2 - cline/(gs/gsm); //Calculates DBB yCentre
        }
        
        else if ((blockset[i].DBBArea == 0) && (blockset[i].DBBAreaTop == 0)) { //For weight DBBs or DBBs out of hull
            xCent = (blockset[i].xAft + blockset[i].xFwd) / 2;
            yCent = blockset[i].yCentre;
        }
        
        else { //For DBBs with volume but zero area on one end
            var yMin; //Minimum y
            var yMax; //Maximum y
            
            yMin = blockset[i].yCentre - blockset[i].ySize/2;
            yMax = blockset[i].yCentre + blockset[i].ySize/2
            if ((yMin <= 0) && (yMax >= 0)) {
                yCent = 0
            }
            else if (blockset[i].yCentre < 0) { //If DBB doesn't pass through zero and is on stbd side
                yCent = yMax;
            }
            else { //If DBB doesn't pass through zero and is on port side
                yCent = yMin;
            }
            //xCent = (blockset[i].xAft + blockset[i].xFwd) / 2;
            xCent = "NA";
        }
        
        //Z CENTRE
        if ((blockset[i].DBBArea == 0) && (blockset[i].DBBAreaTop == 0)) { //For weight DBBs
            zCent = +blockset[i].zBase + (+blockset[i].zHeight/2);
        }
        else { //For non weight DBBs
            zCent = ((blockset[i].DBBArea * (+blockset[i].zBase + +blockset[i].zHeight * (1/3))) + (blockset[i].DBBAreaTop * (+blockset[i].zBase + +blockset[i].zHeight * (2/3)))) / (blockset[i].DBBArea + blockset[i].DBBAreaTop);
        }
        
        //Adds DBB centre data to blockset
        blockset[i].xyCentreBase = [xCent, yCent];
        blockset[i].zCentre = zCent;
    }
}
}
//Identical function to above that calculates DBB x and y top centres
function DBBCentres2(ClasC) {

var xCent; //DBB xCentre
var yCent; //DBB yCentre

for (i in blockset) {
    if (blockset[i].Classification == ClasC) {
        blockset[i].xyCentreTop = []; //Creating property "xyCentreTop"
        
        if (blockset[i].DBBAreaTop > 0) { //For non weights DBBs
            //X CENTRE
            var yArray = []; //Array with y positions of all cells in DBB
            var yMin; //Minimum y cell position of DBB
            var yMax; //Maximum y cell position of DBB
            var xArrayLen = []; //Array with number of cells in x axis for every y for each DBB
            var xArrayInd = []; //Array with sum of indexes of cells in x axis for every y for each DBB
            
            for (j in blockset[i].areaCellsTop) {
                yArray.push(blockset[i].areaCellsTop[j][1]);
            }
            yMin = Math.min( ...yArray );
            yMax = Math.max( ...yArray );
            
            for (l=yMin; l<=yMax; l++) {
                var xArray = []; //Array with x positions of all cells in DBB
                for (k in blockset[i].areaCellsTop) {
                    if(blockset[i].areaCellsTop[k][1] == l) {
                        xArray.push(blockset[i].areaCellsTop[k][0]);
                    }
                }
                xArrayLen.push(xArray.length);
                var xArraySum = 0; //Calculates sum of x index per cell of each DBB
                for (m in xArray) {
                    xArraySum = xArraySum + +xArray[m];
                }
                xArrayInd.push(xArraySum);
            }
            
            //Calculates sums of two arrays
            var xArrayIndSum = 0;
            var xArrayLenSum = 0;
            for (n in xArrayInd) {
                xArrayIndSum = xArrayIndSum + +xArrayInd[n];
                xArrayLenSum = xArrayLenSum + +xArrayLen[n];
            }
            xCent = (xArrayIndSum / xArrayLenSum) * gsm - gsm/2; //Calculates DBB xCentre
            
            //Y CENTRE
            var xArray = []; //Array with x positions of all cells in DBB
            var xMin; //Minimum x cell position of DBB
            var xMax; //Maximum x cell position of DBB
            var yArrayLen = []; //Array with number of cells in y axis for every x for each DBB
            var yArrayInd = []; //Array with sum of indexes of cells in y axis for every x for each DBB
            
            for (j in blockset[i].areaCellsTop) {
                xArray.push(blockset[i].areaCellsTop[j][0]);
            }
            xMin = Math.min( ...xArray );
            xMax = Math.max( ...xArray );
            
            for (l=xMin; l<=xMax; l++) {
                var yArray = []; //Array with y positions of all cells in DBB
                for (k in blockset[i].areaCellsTop) {
                    if(blockset[i].areaCellsTop[k][0] == l) {
                        yArray.push(blockset[i].areaCellsTop[k][1]);
                    }
                }
                yArrayLen.push(yArray.length);
                var yArraySum = 0; //Calculates sum of y index per cell of each DBB
                for (m in yArray) {
                    yArraySum = yArraySum + +yArray[m];
                }
                yArrayInd.push(yArraySum);
            }
            
            //Calculates sums of two arrays
            var yArrayIndSum = 0;
            var yArrayLenSum = 0;
            for (n in yArrayInd) {
                yArrayIndSum = yArrayIndSum + +yArrayInd[n];
                yArrayLenSum = yArrayLenSum + +yArrayLen[n];
            }
            yCent = (yArrayIndSum / yArrayLenSum) * gsm - gsm/2 - cline/(gs/gsm); //Calculates DBB yCentre
        }
        
        else if ((blockset[i].DBBArea == 0) && (blockset[i].DBBAreaTop == 0)) { //For weight DBBs or DBBs out of hull
            xCent = (blockset[i].xAft + blockset[i].xFwd) / 2;
            yCent = blockset[i].yCentre;
        }
        
        else { //For DBBs with volume but zero area on one end
            var yMin; //Minimum y
            var yMax; //Maximum y
            
            yMin = blockset[i].yCentre - blockset[i].ySize/2;
            yMax = blockset[i].yCentre + blockset[i].ySize/2
            if ((yMin <= 0) && (yMax >= 0)) {
                yCent = 0
            }
            else if (blockset[i].yCentre < 0) { //If DBB doesn't pass through zero and is on stbd side
                yCent = yMax;
            }
            else { //If DBB doesn't pass through zero and is on port side
                yCent = yMin;
            }
            //xCent = (blockset[i].xAft + blockset[i].xFwd) / 2;
            xCent = "NA";
        }
        
        //Adds DBB centre data to blockset
        blockset[i].xyCentreTop = [xCent, yCent];
        
        //For DBBs with volume but zero area on one end, the x centre of that end is equal to the x centre of the end with area 
        if (blockset[i].xyCentreBase[0] == "NA") {
            blockset[i].xyCentreBase[0] = blockset[i].xyCentreTop[0];
        }
        else if (blockset[i].xyCentreTop[0] == "NA") {
            blockset[i].xyCentreTop[0] = blockset[i].xyCentreBase[0];
        }
    }
}    
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

//Copy of hullGen function with different initial and final conditions
function waterlines(){
//Sets hullform data to slider values
var midshipsM = document.getElementById("ms_val").innerHTML; //Constant m in JC equation
var bowRakeM = document.getElementById("bow_val").innerHTML; //Constant m in JC equation
var transomM = document.getElementById("tr_val").innerHTML; //Constant m in JC equation
var fwdDeckM = document.getElementById("deck_val").innerHTML; //Constant m in JC equation
var serviceSpeed =document.getElementById("sp_val").innerHTML;
var transomBeamMax = (shipset[0].BOA * document.getElementById("tb_val").innerHTML) / 2; //Transom half beam
var transomTip = shipset[0].D * document.getElementById("td_val").innerHTML;
var ACU = shipset[0].LOA * document.getElementById("acu_val").innerHTML;
var keelFwd = shipset[0].LOA * document.getElementById("kf_val").innerHTML;
var slope = document.getElementById("sa_val").innerHTML;

var midBeam = []; //Array with midships half beam per waterline
var bowRake = []; //Array with bow rake per waterline
var bowRakeS = []; //Array with bow rake per waterline in superstructure
var TB; //Transom half beam of a waterline
var transomBeam = []; //Array with transom half beam per waterline
var fwdDeckMArray = []; //Array with constants m in JC equation for waterlines
var AE; //Aft end of a waterline
var aftEnd = []; //Array with aft end of each waterline
var aftEndS = []; //Array with aft end of each waterline in superstructure
var noseConeBaseRadius = []; //See excel tool
var ogiveRadius = []; //See excel tool
var pdecks2 = []; //Array with waterline positions of hull
var pdecks3 = []; //Array with waterline positions of superstructure

for (i=Math.max(...pdecks); i>=0; i-=0.1) { //Assign values to variables above            
    i = Math.round(i*10)/10; //Rounds i to 0.1
    if (i <= shipset[0].D) { //For each waterline that is in the hull
        midBeam.push((Math.acosh((i / shipset[0].D) * (Math.cosh(midshipsM * Math.PI) - 1) + 1) / (midshipsM * Math.PI)) * (shipset[0].BOA / 2));
        bowRake.push((Math.acosh((i / shipset[0].D) * (Math.cosh(bowRakeM * Math.PI) - 1) + 1) / (bowRakeM * Math.PI)) * (shipset[0].LOA - keelFwd));
        if (i > transomTip) {
            TB = ((Math.acosh(((i - transomTip) / (shipset[0].D - transomTip)) * (Math.cosh(transomM * Math.PI) - 1) + 1) / (transomM * Math.PI)) * (transomBeamMax));
        }
        else {
            TB = 0;
        }
        transomBeam.push(TB);
        fwdDeckMArray.push(fwdDeckM * (i / (shipset[0].D)) + 0.001); //Changes constant m in JC equation to make waterlines becomes slimmer with decreasing z position (see below)
        if (i >= transomTip) {
            AE = (shipset[0].D - i) * Math.tan(slope);
        }
        else {
            AE = (shipset[0].D - transomTip) * Math.tan(slope) + (transomTip - i) * ((ACU - (shipset[0].D - transomTip) * Math.tan(slope)) / transomTip);
        }
        aftEnd.push(AE);
        pdecks2.push(i);
    }
    else { //For each waterline that is in the superstructure
        aftEndS.push((i - shipset[0].D) * Math.tan(slope));
        bowRakeS.push(shipset[0].LOA - ((i - shipset[0].D) * Math.tan(slope)) - keelFwd);
        pdecks3.push(i);
    }
};
for (i in midBeam) { //Assign values to variables above cont.
    noseConeBaseRadius.push(midBeam[i] - transomBeam[i]);
    if (noseConeBaseRadius[i] > 0) {
            ogiveRadius.push((Math.pow(noseConeBaseRadius[i], 2) + Math.pow((shipset[0].LOA / 2) - aftEnd[i], 2)) / (2 * noseConeBaseRadius[i]));
        }
        else {
            ogiveRadius.push(0);
        }
};

waterlinesHull = []; //Array with hull waterline x, y coordinates
//Get y points for every x
for (j in midBeam) { //For each waterline
    waterlinesHull[j] = []; //For each waterline create array
    if (pdecks2[j] != 0) { //If not keel
        for (k=Math.ceil((aftEnd[j])/gsm)*gsm + gsm/2; k<Math.round((shipset[0].LOA/2)/gsm)*gsm; k+=gsm) { //For aft half of each waterline in the hull
            waterlinesHull[j].push([k, (Math.sqrt(Math.pow(ogiveRadius[j], 2) - Math.pow(k - shipset[0].LOA/2, 2)) + noseConeBaseRadius[j] - ogiveRadius[j] + transomBeam[j])]);
        }
        for (k=Math.round((shipset[0].LOA/2)/gsm)*gsm + gsm/2; k<=(keelFwd + bowRake[j]); k+=gsm) { //For forward half of each waterline in the hull
            var eqX = (k - shipset[0].LOA/2) / (keelFwd + bowRake[j] - (shipset[0].LOA/2)); //Value of x in JC equation
            waterlinesHull[j].push([k, (1- ((Math.cosh(eqX * fwdDeckMArray[j] * Math.PI) - 1) / (Math.cosh(fwdDeckMArray[j] * Math.PI) - 1))) * midBeam[j]]);
        }
    }
    else { //If keel
        for (k=Math.ceil((aftEnd[j])/gsm)*gsm + gsm/2; k<=(keelFwd + bowRake[j]); k+=gsm) {
            waterlinesHull[j].push([k, 0]); //y = 0
        }
    }
};

var waterlinesS = []; //Array with superstructure waterline x, y coordinates
var tumblehome; //Superstructure tumblehome
for (n in aftEndS) { //For each waterline in superstructure
    waterlinesS[n] = []; //For each waterline create array
    tumblehome = (pdecks3[n] - shipset[0].D) * Math.tan(slope) //Calculate tumblehome y offset to subtract below
    for (k=Math.ceil((aftEndS[n])/gsm)*gsm + gsm/2; k<Math.round((shipset[0].LOA/2)/gsm)*gsm; k+=gsm) { //For aft half of each waterline in the superstructure (same equation as above with tumblehome y offset subtracted)
            waterlinesS[n].push([k, (Math.sqrt(Math.pow(ogiveRadius[0], 2) - Math.pow(k - shipset[0].LOA/2, 2)) + noseConeBaseRadius[0] - ogiveRadius[0] + transomBeam[0] - tumblehome)]);
    }
    for (k=Math.round((shipset[0].LOA/2)/gsm)*gsm + gsm/2; k<=(keelFwd + bowRakeS[n]); k+=gsm) { //For forward half of each waterline in the superstructure (same equation as above with tumblehome y offset subtracted) 
        var eqX = (k - shipset[0].LOA/2) / (keelFwd + bowRakeS[n] - (shipset[0].LOA/2)); //Value of x in JC equation
        waterlinesS[n].push([k, (1- ((Math.cosh(eqX * fwdDeckMArray[0] * Math.PI) - 1) / (Math.cosh(fwdDeckMArray[0] * Math.PI) - 1))) * (midBeam[0] - tumblehome)]);
    }
};

//Adds hull and superstrucutre waterline coordinates into a single array
waterlinesHS = waterlinesS.concat(waterlinesHull);
}

//Function that creates weight condition objects with hydrostatics
function hydroObj(Condition, Displacement_te, CoGx_m, CoGy_m, CoGz_m, Tlcf_m, Aw_m2_levelTrimList, DisplacedVolume_m3, LWL_m_levelTrimList, BWL_m_levelTrimList, Am_m2_levelTrimList, CircM_levelTrimList, Cwp_levelTrimList, Cm_levelTrimList, Cb_levelTrimList, Cp_levelTrimList, Cvp_levelTrimList, LCF_m_levelTrimList, VCB_m_levelTrimList, LCB_m_levelTrimList, TPI_te_per_m_levelTrimList, BMts_m_levelTrimList, BMls_m_levelTrimList, KMts_m_levelTrimList, KMls_m_levelTrimList, GMts_m_levelTrimList, GMls_m_levelTrimList, MCTs_te_m_levelTrimList, TrimSolid_m, TsFwd_m, TsAft_m, TsMean_m, ListSolid_deg, KMtf_m_levelTrimList, KMlf_m_levelTrimList, GMtf_m_levelTrimList, GMlf_m_levelTrimList, MCTf_te_m_levelTrimList, TrimFluid_m, TfFwd_m, TfAft_m, TfMean_m, ListFluid_deg, Kf_deg){
this.Condition = Condition;
this.Displacement_te = Displacement_te;
this.CoGx_m = CoGx_m;
this.CoGy_m = CoGy_m;
this.CoGz_m = CoGz_m;
this.Tlcf_m = Tlcf_m;
this.Aw_m2_levelTrimList = Aw_m2_levelTrimList;
this.DisplacedVolume_m3 = DisplacedVolume_m3;
this.LWL_m_levelTrimList = LWL_m_levelTrimList;
this.BWL_m_levelTrimList = BWL_m_levelTrimList;
this.Am_m2_levelTrimList = Am_m2_levelTrimList;
this.CircM_levelTrimList = CircM_levelTrimList;
this.Cwp_levelTrimList = Cwp_levelTrimList;
this.Cm_levelTrimList = Cm_levelTrimList;
this.Cb_levelTrimList = Cb_levelTrimList;
this.Cp_levelTrimList = Cp_levelTrimList;
this.Cvp_levelTrimList = Cvp_levelTrimList;
this.LCF_m_levelTrimList = LCF_m_levelTrimList;
this.VCB_m_levelTrimList = VCB_m_levelTrimList;
this.LCB_m_levelTrimList = LCB_m_levelTrimList;
this.TPI_te_per_m_levelTrimList = TPI_te_per_m_levelTrimList;
this.BMts_m_levelTrimList = BMts_m_levelTrimList;
this.BMls_m_levelTrimList = BMls_m_levelTrimList;
this.KMts_m_levelTrimList = KMts_m_levelTrimList;
this.KMls_m_levelTrimList = KMls_m_levelTrimList;
this.GMts_m_levelTrimList = GMts_m_levelTrimList;
this.GMls_m_levelTrimList = GMls_m_levelTrimList;
this.MCTs_te_m_levelTrimList = MCTs_te_m_levelTrimList;
this.TrimSolid_m = TrimSolid_m;
this.TsFwd_m = TsFwd_m;
this.TsAft_m = TsAft_m;
this.TsMean_m = TsMean_m;
this.ListSolid_deg = ListSolid_deg;
this.KMtf_m_levelTrimList = KMtf_m_levelTrimList;
this.KMlf_m_levelTrimList = KMlf_m_levelTrimList;
this.GMtf_m_levelTrimList = GMtf_m_levelTrimList;
this.GMlf_m_levelTrimList = GMlf_m_levelTrimList;
this.MCTf_te_m_levelTrimList = MCTf_te_m_levelTrimList;
this.TrimFluid_m = TrimFluid_m;
this.TfFwd_m = TfFwd_m;
this.TfAft_m = TfAft_m;
this.TfMean_m = TfMean_m;
this.ListFluid_deg = ListFluid_deg;
this.Kf_deg = Kf_deg;
}

//Function that uses waterlinesHull global array to carry out hydrostatics
function hydrostatics() {
waterlines(); //Calls waterlines function
areasCentresProximities(); //Calls areasCentresProximities function

var LS = []; //Array with lightships weights of all DBBs
var WC1 = []; //Array with WeightCond1 weights of all DBBs
var WC2 = []; //Array with WeightCond2 weights of all DBBs

var LSx = []; //Array with lightships weights * xPos of all DBBs
var WC1x = []; //Array with WeightCond1 weights * xPos of all DBBs
var WC2x = []; //Array with WeightCond2 weights * xPos of all DBBs

var LSy = []; //Array with lightships weights * yPos of all DBBs
var WC1y = []; //Array with WeightCond1 weights * yPos of all DBBs
var WC2y = []; //Array with WeightCond2 weights * yPos of all DBBs

var LSz = []; //Array with lightships weights * zPos of all DBBs
var WC1z = []; //Array with WeightCond1 weights * zPos of all DBBs
var WC2z = []; //Array with WeightCond2 weights * zPos of all DBBs

for (i in aAndc) {
    LS.push(+aAndc[i].LightshipsWeight);
    WC1.push(+aAndc[i].WeightCond1);
    WC2.push(+aAndc[i].WeightCond2);
    
    LSx.push(+aAndc[i].LightshipsWeight * +aAndc[i].xCentre);
    WC1x.push(+aAndc[i].WeightCond1 * +aAndc[i].xCentre);
    WC2x.push(+aAndc[i].WeightCond2 * +aAndc[i].xCentre);
    
    LSy.push(+aAndc[i].LightshipsWeight * +aAndc[i].yCentre);
    WC1y.push(+aAndc[i].WeightCond1 * +aAndc[i].yCentre);
    WC2y.push(+aAndc[i].WeightCond2 * +aAndc[i].yCentre);
    
    LSz.push(+aAndc[i].LightshipsWeight * +aAndc[i].zCentre);
    WC1z.push(+aAndc[i].WeightCond1 * +aAndc[i].zCentre);
    WC2z.push(+aAndc[i].WeightCond2 * +aAndc[i].zCentre);
}

var dispLS = 0; //Lightships displacement
var dispWC1 = 0; //WeightCond1 displacement
var dispWC2 = 0; //WeightCond2 displacement

var sumLSx = 0; //Lightships displacement * xPos
var sumWC1x = 0; //WeightCond1 displacement * xPos
var sumWC2x = 0; //WeightCond2 displacement * xPos

var sumLSy = 0; //Lightships displacement * yPos
var sumWC1y = 0; //WeightCond1 displacement * yPos
var sumWC2y = 0; //WeightCond2 displacement * yPos

var sumLSz = 0; //Lightships displacement * zPos
var sumWC1z = 0; //WeightCond1 displacement * zPos
var sumWC2z = 0; //WeightCond2 displacement * zPos

for (i in aAndc) {
    dispLS = dispLS + LS[i];
    dispWC1 = dispWC1 + WC1[i];
    dispWC2 = dispWC2 + WC2[i];
    
    sumLSx = sumLSx + LSx[i];
    sumWC1x = sumWC1x + WC1x[i];
    sumWC2x = sumWC2x + WC2x[i];
    
    sumLSy = sumLSy + LSy[i];
    sumWC1y = sumWC1y + WC1y[i];
    sumWC2y = sumWC2y + WC2y[i];
    
    sumLSz = sumLSz + LSz[i];
    sumWC1z = sumWC1z + WC1z[i];
    sumWC2z = sumWC2z + WC2z[i];
}

var cond = ["Lightships", "WeightCond1", "WeightCond2"]; //Array with weight condition names
var dispTotal = [dispLS, dispWC1, dispWC2]; //Array with displacements
var CoGLS = [sumLSx/dispLS, sumLSy/dispLS, sumLSz/dispLS]; //Array with x, y, z CoG in LS
var CoGWC1 = [sumWC1x/dispWC1, sumWC1y/dispWC1, sumWC1z/dispWC1]; //Array with x, y, z CoG in WC1
var CoGWC2 = [sumWC2x/dispWC2, sumWC2y/dispWC2, sumWC2z/dispWC2]; //Array with x, y, z CoG in WC2
var CoGtotal = [CoGLS, CoGWC1, CoGWC2]; 

var Aw = []; //Waterplane area from z=0m to z=D, every 0.1m
var AwStripTotal = [];
var AwStripXPosTotal = [];
for (j = waterlinesHull.length-1; j>=0 ; j--) {
    var AwStrip = []; //Waterplane area per 0.5m strip at each waterline
    var AwStripXPos = [];
    for (k in waterlinesHull[j]) {
        AwStrip.push(2 * waterlinesHull[j][k][1] * gsm)
        AwStripXPos.push(waterlinesHull[j][k][0]);
    }
    AwStripTotal.push(AwStrip);
    AwStripXPosTotal.push(AwStripXPos);
    
    var AwWL = 0; //Waterplane area per waterline
    for (l in AwStrip) {
        AwWL = AwWL + AwStrip[l];
    }
    Aw.push(AwWL);
}

var dispV = []; //Displaced volume from z=0m to z=D, every 0.1m
for (m=1; m<=Aw.length-1; m++) {
    dispV.push(((Aw[m]+Aw[m-1])/2) * 0.1);
}

var TlsfTotal = []; //Array with lcf draft at each condition
var AwTotal = []; //Array with Aw at each condition
var dispVolTotal = []; //Array with displaced volume at each condition
var LWLTotal = []; //Array with LWL at each condition
var BWLTotal = []; //Array with BWL at each condition
var AmTotal = []; //Array with Am at each condition
var CircMTotal = []; //Array with CircM at each condition
var CwpTotal = []; //Array with Cwp at each condition
var CmTotal = []; //Array with Cm at each condition
var CbTotal = []; //Array with Cb at each condition
var CpTotal = []; //Array with Cp at each condition
var CvpTotal = []; //Array with Cvp at each condition
var LCFTotal = []; //Array with LCF at each condition
var VCBTotal = []; //Array with VCB at each condition
var LCBTotal = []; //Array with LCB at each condition
var TPITotal = []; //Array with TPI at each condition
var BMtsTotal = []; //Array with BMts at each condition
var BMlsTotal = []; //Array with BMls at each condition
var KMtsTotal = []; //Array with KMts at each condition
var KMlsTotal = []; //Array with KMls at each condition
var GMtsTotal = []; //Array with GMts at each condition
var GMlsTotal = []; //Array with GMls at each condition
var MCTsTotal = []; //Array with MCTs at each condition
var TrimTotalS = []; //Array with tirm at each condition
var TsFwdTotal = []; //Array with tirm fwd at each condition
var TsAftTotal = []; //Array with tirm aft at each condition
var TsMeanTotal = []; //Array with tirm mean at each condition
var ListTotalS = []; //Array with list at each condition
var KMtfTotal = []; //Array with KMtf at each condition
var KMlfTotal = []; //Array with KMlf at each condition
var GMtfTotal = []; //Array with GMtf at each condition
var GMlfTotal = []; //Array with GMlf at each condition
var MCTfTotal = []; //Array with MCTf at each condition
var TrimTotalF = []; //Array with tirm at each condition
var TfFwdTotal = []; //Array with tirm fwd at each condition
var TfAftTotal = []; //Array with tirm aft at each condition
var TfMeanTotal = []; //Array with tirm mean at each condition
var ListTotalF = []; //Array with list at each condition
var KfTotal = []; //Array with angle of flare
GZtsTotal = []; //Array with GZts points
PeaTotal = []; //Array with effective power points
PsSeaTotal = []; //Array with shaft power points
for (o in dispTotal) {
    var disp = 0; //Incremental displacement at waterlines
    for (n in dispV) {
        disp = disp + dispV[n] * shipset[0].MediumDensity;
        if (disp > dispTotal[o]) {
            var TBelow = n*0.1;
            var TAbove = 0.1 + n*0.1;
            var dispBelow = disp - dispV[n] * shipset[0].MediumDensity;
            var dispAbove = disp;
            break;
        }
    }
    var Tlcf = ((((TAbove-TBelow)/TBelow) * ((dispTotal[o]-dispBelow)/dispBelow)) / ((dispAbove-dispBelow)/dispBelow)) * TBelow + TBelow; //Calculate draft lcf
    TlsfTotal.push(Tlcf);
    ///////////////////////////////////////////
    var AwBelow = Aw[n];
    var AwAbove = Aw[+n + 1];
    var AwTlcf = ((((AwAbove-AwBelow)/AwBelow) * ((dispTotal[o]-dispBelow)/dispBelow)) / ((dispAbove-dispBelow)/dispBelow)) * AwBelow + AwBelow; //Calculate Aw
    AwTotal.push(AwTlcf);
    ///////////////////////////////////////////
    var dispVol = dispTotal[o] / shipset[0].MediumDensity; //Calculate displaced volume
    dispVolTotal.push(dispVol);
    ///////////////////////////////////////////
    var transomTip = shipset[0].D * document.getElementById("td_val").innerHTML;
    var slope = document.getElementById("sa_val").innerHTML;
    var ACU = shipset[0].LOA * document.getElementById("acu_val").innerHTML;
    var bowRakeM = document.getElementById("bow_val").innerHTML;
    var keelFwd = shipset[0].LOA * document.getElementById("kf_val").innerHTML;
    if (Tlcf >= transomTip) {
        var AE = (shipset[0].D - Tlcf) * Math.tan(slope);
    }
    else {
        var AE = (shipset[0].D - transomTip) * Math.tan(slope) + (transomTip - Tlcf) * ((ACU - (shipset[0].D - transomTip) * Math.tan(slope)) / transomTip);
    }
    var bowRake = (Math.acosh((Tlcf / shipset[0].D) * (Math.cosh(bowRakeM * Math.PI) - 1) + 1) / (bowRakeM * Math.PI)) * (shipset[0].LOA - keelFwd);
    //var LWL = Math.floor(bowRake/gsm)*gsm - Math.ceil(AE/gsm)*gsm; //Calculate LWL
    var LWL = bowRake - AE + keelFwd; //Calculate LWL
    LWLTotal.push(LWL);  
    ///////////////////////////////////////////
    var midshipsM = document.getElementById("ms_val").innerHTML;
    var midBeam = (Math.acosh((Tlcf / shipset[0].D) * (Math.cosh(midshipsM * Math.PI) - 1) + 1) / (midshipsM * Math.PI)) * (shipset[0].BOA / 2); //Calculate BWL
    BWLTotal.push(midBeam*2);
    ///////////////////////////////////////////
    var AmBelow = 0;
    for (p=0.05; p<TBelow; p+=0.1) {
        var AmBelow = AmBelow + ((Math.acosh((p / shipset[0].D) * (Math.cosh(midshipsM * Math.PI) - 1) + 1) / (midshipsM * Math.PI)) * shipset[0].BOA * 0.1);
    }
    var AmAbove = AmBelow + ((Math.acosh(((TAbove-0.05) / shipset[0].D) * (Math.cosh(midshipsM * Math.PI) - 1) + 1) / (midshipsM * Math.PI)) * shipset[0].BOA * 0.1);
    var AmTlcf = ((((AmAbove-AmBelow)/AmBelow) * ((dispTotal[o]-dispBelow)/dispBelow)) / ((dispAbove-dispBelow)/dispBelow)) * AmBelow + AmBelow; //Calculate Aw
    AmTotal.push(AmTlcf);
    ///////////////////////////////////////////
    var CircM = LWL / Math.pow(dispVol, 1/3); //Calculate CircM
    CircMTotal.push(CircM);
    ///////////////////////////////////////////
    var Cwp = AwTlcf / (LWL*midBeam*2); //Calculate Cwp
    CwpTotal.push(Cwp);
    ///////////////////////////////////////////
    var Cm = AmTlcf / (Tlcf*midBeam*2); //Calculate Cm
    CmTotal.push(Cm);
    ///////////////////////////////////////////
    var Cb = dispVol / (Tlcf*LWL*midBeam*2); //Calculate Cb
    CbTotal.push(Cb);
    ///////////////////////////////////////////
    var Cp = dispVol / (LWL*AmTlcf); //Calculate Cp
    CpTotal.push(Cp);
    ///////////////////////////////////////////
    var Cvp = dispVol / (Tlcf*AwTlcf); //Calculate Cvp
    CvpTotal.push(Cvp);
    ///////////////////////////////////////////
    var transomM = document.getElementById("tr_val").innerHTML;
    var transomBeamMax = (shipset[0].BOA * document.getElementById("tb_val").innerHTML) / 2;
    var fwdDeckM = document.getElementById("deck_val").innerHTML;
    if (Tlcf > transomTip) {
        var TB = ((Math.acosh(((Tlcf - transomTip) / (shipset[0].D - transomTip)) * (Math.cosh(transomM * Math.PI) - 1) + 1) / (transomM * Math.PI)) * (transomBeamMax));
    }
    else {
        var TB = 0;
    }
    var noseConeBaseRadius = midBeam - TB;
    var ogiveRadius = (Math.pow(noseConeBaseRadius, 2) + Math.pow((shipset[0].LOA / 2) - AE, 2)) / (2 * noseConeBaseRadius);
    var fwdDeckMArray = fwdDeckM * (Tlcf / (shipset[0].D)) + 0.001;
    
    var waterplaneTlcf = []; //Array with x and y coordinatres of waterplane at Tlcf
    for (k=Math.ceil(AE/gsm)*gsm + gsm/2; k<Math.round((shipset[0].LOA/2)/gsm)*gsm; k+=gsm) { //For aft half of waterplane
        waterplaneTlcf.push([k, (Math.sqrt(Math.pow(ogiveRadius, 2) - Math.pow(k - shipset[0].LOA/2, 2)) + noseConeBaseRadius - ogiveRadius + TB)]);
    }
    for (k=Math.round((shipset[0].LOA/2)/gsm)*gsm + gsm/2; k<=(keelFwd + bowRake); k+=gsm) { //For forward half of each waterline in the hull
        var eqX = (k - shipset[0].LOA/2) / (keelFwd + bowRake - (shipset[0].LOA/2)); //Value of x in JC equation
        waterplaneTlcf.push([k, (1- ((Math.cosh(eqX * fwdDeckMArray * Math.PI) - 1) / (Math.cosh(fwdDeckMArray * Math.PI) - 1))) * midBeam]);
    }
    
    var areaWaterplane = 0; //Incremental area
    for (q in waterplaneTlcf) {
        areaWaterplane = areaWaterplane + (2 * gsm) * waterplaneTlcf[q][1];
        if (areaWaterplane > (AwTlcf / 2)) {
            var LCFaft = waterplaneTlcf[q-1][0] + gsm/2;
            var LCFfwd = waterplaneTlcf[q][0] + gsm/2;
            var areaWaterplaneAft = areaWaterplane - (2 * gsm) * waterplaneTlcf[q-1][1];
            var areaWaterplaneFwd = areaWaterplane;
            break;
        }
    }
    var LCF = ((((LCFfwd-LCFaft)/LCFaft) * (((AwTlcf / 2)-areaWaterplaneAft)/areaWaterplaneAft)) / ((areaWaterplaneFwd-areaWaterplaneAft)/areaWaterplaneAft)) * LCFaft + LCFaft; //Calculate LCF
    LCFTotal.push(LCF);
    ///////////////////////////////////////////
    var dispVSum = 0; //Incremental displaced volume at waterlines
    for (r in dispV) {
        dispVSum = dispVSum + dispV[r];
        if (dispVSum > (dispVol / 2)) {
            var VCBBelow = r*0.1;
            var VCBAbove = 0.1 + r*0.1;
            var dispVBelow = dispVSum - dispV[r];
            var dispVAbove = dispVSum;
            break;
        }
    }
    var VCB = ((((VCBAbove-VCBBelow)/VCBBelow) * (((dispVol/2)-dispVBelow)/dispVBelow)) / ((dispVAbove-dispVBelow)/dispVBelow)) * VCBBelow + VCBBelow; //Calculate vcb
    VCBTotal.push(VCB);
    ///////////////////////////////////////////
    var verticalSlices = []; //Array with all y offsets for each x position below draft
    for (t=gsm/2; t<shipset[0].LOA; t+=gsm) { //For all x positions from 0.25m to LOA-0.25m
        verticalSlices[t] = []; //Array for each x position
        for (s=shipset[0].D*10; s>=(shipset[0].D - Math.round(Tlcf*10)/10)*10; s--) { //For each waterline below draft
            for (u in waterlinesHull[s]) { //For each waterline coordinate
                if (waterlinesHull[s][u][0] == t) { //If waterline x coordinate = x position
                    verticalSlices[t].push(waterlinesHull[s][u][1]); //Push the y coordinate into the x position array
                }
            }
        }
    }
    
    var verticalSliceVolume = []; //Array with the volume of each 0.5m slice in the y direction below the draft
    for (v in verticalSlices) {
        if (verticalSlices[v].length == 0) { //No y offsets
            VSV = 0; //Vertical slice volume
        }
        else if (verticalSlices[v].length == 1) { //One y offset
            VSV = (verticalSlices[v][0]/2) * 0.1 * gsm * 2; //Vertical slice volume
        }
        else {
            var VSV = 0; //Vertical slice volume
            for (w=0; w<verticalSlices[v].length-1; w++) { //Multiple y offsets
                VSV = VSV + ((verticalSlices[v][w] + verticalSlices[v][w+1])/2) * 0.1 * gsm * 2; //Vertical slice volume
            }
        }
        verticalSliceVolume.push(VSV);
    }
    
    var dispVSum3 = 0; //Incremental volume at each slice
    for (b in verticalSliceVolume) {
        dispVSum3 = dispVSum3 + verticalSliceVolume[b]; //Calculates total displaced volume approximation for the draft at which the slices are taken
    }
    
    var dispVSum2 = 0; //Incremental volume at each slice
    for (a in verticalSliceVolume) {
        dispVSum2 = dispVSum2 + verticalSliceVolume[a];
        if (dispVSum2 > (dispVSum3 / 2)) {
            var LCBAft = a*gsm;
            var LCBFwd = a*gsm + gsm;
            var dispVAft = dispVSum2 - verticalSliceVolume[a];
            var dispVFwd = dispVSum2;
            break;
        }
    }
    var LCB = ((((LCBFwd-LCBAft)/LCBAft) * (((dispVSum3/2)-dispVAft)/dispVAft)) / ((dispVFwd-dispVAft)/dispVAft)) * LCBAft + LCBAft; //Calculate lcb
    LCBTotal.push(LCB);
    ///////////////////////////////////////////
    var TPI = AwTlcf * shipset[0].MediumDensity; //Calculate TPI
    TPITotal.push(TPI);
    ///////////////////////////////////////////
    var momentInetriaT = 0; //Moment of inertia per full waterplane about x axis
    for (b in waterplaneTlcf) {
        momentInetriaT = momentInetriaT + (gsm * Math.pow(waterplaneTlcf[b][1], 3));
    }
    momentInetriaT = (2 / 3) * momentInetriaT;
    var BMts = momentInetriaT / dispVol; //Calculate BMts
    BMtsTotal.push(BMts);
    ///////////////////////////////////////////
    var momentInetriaYY = 0; //Moment of inertia per full waterplane about y axis
    for (b in waterplaneTlcf) {
        momentInetriaYY = momentInetriaYY + (gsm * Math.pow(waterplaneTlcf[b][0], 2) * waterplaneTlcf[b][1]);
    }
    momentInetriaYY = 2 * momentInetriaYY;
    var momentInetriaL = momentInetriaYY - AwTlcf * Math.pow(LCF, 2);
    var BMls = momentInetriaL / dispVol; //Calculate BMls
    BMlsTotal.push(BMls);
    ///////////////////////////////////////////
    var KMts = BMts + VCB; //Calculate KMts
    KMtsTotal.push(KMts);
    ///////////////////////////////////////////
    var KMls = BMls + VCB; //Calculate KMls
    KMlsTotal.push(KMls);
    ///////////////////////////////////////////
    var GMts = KMts - CoGtotal[o][2]; //Calculate GMts
    GMtsTotal.push(GMts);
    ///////////////////////////////////////////
    var GMls = KMls - CoGtotal[o][2]; //Calculate GMls
    GMlsTotal.push(GMls);
    ///////////////////////////////////////////
    var MCTs = (dispTotal[o] * GMls) / LWL; //Calculate MCTs
    MCTsTotal.push(MCTs);
    ///////////////////////////////////////////
    var TrimS = dispTotal[o] * (LCB - CoGtotal[o][0]) / MCTs; //Calculate trim solid
    TrimTotalS.push(TrimS);
    ///////////////////////////////////////////
    var TsFwd = Tlcf - TrimS * (0.5 + (LCF - (LWL/2))/LWL); //Calculate trim solid fwd
    TsFwdTotal.push(TsFwd);
    ///////////////////////////////////////////
    var TsAft = TsFwd + TrimS; //Calculate trim solid aft
    TsAftTotal.push(TsAft);
    ///////////////////////////////////////////
    var TsMean = (TsFwd + TsAft) / 2; //Calculate trim solid mean
    TsMeanTotal.push(TsMean);
    ///////////////////////////////////////////
    var ListS = Math.atan(CoGtotal[o][1] / GMts) * (-180 / Math.PI); //Calculate list solid
    ListTotalS.push(ListS);
    ///////////////////////////////////////////
    var freeSurfaceData = freeSurface(); //Calls freeSurface function and assigns returned array to variable
    if (o == 0) { //Lightships, no fluids
        var MtsReduction = 0;
        var MlsReduction = 0;
        var KMtf = KMts;
        var KMlf = KMls;
        var GMtf = GMts;
        var GMlf = GMls;
        var MCTf = MCTs;
        var TrimF = TrimS;
        var TfFwd = TsFwd;
        var TfAft = TsAft;
        var TfMean = TsMean;
        var ListF = ListS;
    }
    else {
        if (o == 1) { //Weight condition 1
            var MtsReduction = 0;
            var MlsReduction = 0;
            for (c in freeSurfaceData) {
                MtsReduction = MtsReduction + (((Math.pow(freeSurfaceData[c][1], 3) * (freeSurfaceData[c][0])) / 12) / dispVol) * (freeSurfaceData[c][2] / shipset[0].MediumDensity);
                MlsReduction = MlsReduction + (((Math.pow(freeSurfaceData[c][0], 3) * (freeSurfaceData[c][1])) / 12) / dispVol) * (freeSurfaceData[c][2] / shipset[0].MediumDensity);
            }
        }
        else { //Weight condition 2
            var MtsReduction = 0;
            var MlsReduction = 0;
            for (c in freeSurfaceData) {
                MtsReduction = MtsReduction + (((Math.pow(freeSurfaceData[c][4], 3) * (freeSurfaceData[c][3])) / 12) / dispVol) * (freeSurfaceData[c][2] / shipset[0].MediumDensity);
                MlsReduction = MlsReduction + (((Math.pow(freeSurfaceData[c][3], 3) * (freeSurfaceData[c][4])) / 12) / dispVol) * (freeSurfaceData[c][2] / shipset[0].MediumDensity);
            }
        }
        var KMtf = KMts - MtsReduction; //Calculate KMtf
        ///////////////////////////////////////////
        var KMlf = KMls - MlsReduction; //Calculate KMlf
        ///////////////////////////////////////////
        var GMtf = GMts - MtsReduction; //Calculate GMtf
        ///////////////////////////////////////////
        var GMlf = GMls - MlsReduction; //Calculate GMlf
        ///////////////////////////////////////////
        var MCTf = (dispTotal[o] * GMlf) / LWL; //Calculate MCTf
        ///////////////////////////////////////////
        var TrimF = dispTotal[o] * (LCB - CoGtotal[o][0]) / MCTf; //Calculate trim fluid
        ///////////////////////////////////////////
        var TfFwd = Tlcf - TrimF * (0.5 + (LCF - (LWL/2))/LWL); //Calculate trim fluid fwd
        ///////////////////////////////////////////
        var TfAft = TfFwd + TrimF; //Calculate trim fluid aft
        ///////////////////////////////////////////
        var TfMean = (TfFwd + TfAft) / 2; //Calculate trim fluid mean
        ///////////////////////////////////////////
        var ListF = Math.atan(CoGtotal[o][1] / GMtf) * (-180 / Math.PI); //Calculate list solid
    }
    KMtfTotal.push(KMtf);
    KMlfTotal.push(KMlf);
    GMtfTotal.push(GMtf);
    GMlfTotal.push(GMlf);
    MCTfTotal.push(MCTf);
    TrimTotalF.push(TrimF);
    TfFwdTotal.push(TfFwd);
    TfAftTotal.push(TfAft);
    TfMeanTotal.push(TfMean);
    ListTotalF.push(ListF);

            
    //GZ curve using method in "GZ Curves of warships from form parameters" by Lt Hasnain Ali, PN, MSc Dissertation 2003
    var Kf = Math.atan((((+shipset[0].BOA - (midBeam*2)))/ 2) / (+shipset[0].D - Tlcf)) ; //Angle of flare in radians
    KfTotal.push(Kf * (180/Math.PI));
    var ToD = Tlcf / +shipset[0].D; //T/D
    var BoT = (midBeam*2) / Tlcf; //B/T
    var BWL = midBeam*2;
    var KG = CoGtotal[o][2]
    var GZts = []; //In m, every 5deg
    for (d=0; d<1.58; d+=(5*(Math.PI/180))) { //From 0 to 90deg, every 5 deg
        SZts = (-7.532-1.5582*d+8.856*BoT+1.67768*Math.pow(d, 2)-3.8858*Math.pow(BoT, 2)-0.54635*Math.pow(d, 3)+0.7545*Math.pow(BoT, 3)+0.06337*Math.pow(d, 4)-0.05472*Math.pow(BoT, 4)+0.117719*d*BoT+8.4796*d*Cb-0.54067*d*Math.pow(Kf, 2)-13.898*d*Math.pow(Cb, 2)+0.350715*Kf*Math.pow(d, 2)-0.345274*BoT*Math.pow(d, 2)-2.1596*Cb*Math.pow(d, 2)+0.066487*ToD*Math.pow(d, 3)+1.44872*d*Math.pow(Kf, 3)+7.3249*d*Math.pow(Cb, 3)-0.162857*Kf*Math.pow(d, 3)+0.078312*BoT*Math.pow(d, 3)-0.19632*BoT*Math.pow(Kf, 3)+1.2655*Cb*Math.pow(Kf, 3)-0.148953*Math.pow(ToD, 2)*Math.pow(d, 2)+0.0143684*Math.pow(d, 2)*Math.pow(BoT, 2)+2.0094*Math.pow(d, 2)*Math.pow(Cb, 2)-0.10736*ToD*Kf*Math.pow(d, 2))*BWL;
        GZts.push(SZts - KG * Math.sin(d));
    }
    GZtsTotal.push(GZts);
    
    //Powering using "Simple Holtrop - Monohull" spreadsheet tool by J van Griethuysen (2001) / D Fellows (2003)
    var BoL = (midBeam*2) / LWL; //B/L
    var ToL = Tlcf / LWL; //T/L
    var LCBoL = LCB / LWL; //LCB/L
    var AbulboBT = +shipset[0].BulbArea / ((midBeam*2) * Tlcf); //BulbArea/(B*T)
    //Viscous resistance
    var LroL = 1 - Cp + ((0.06 * Cp * LCBoL) / (4 * Cp - 1));
    var L3oV = Math.pow(CircM, 3);
    var onepk = 0.93 + 0.4871 * (Math.pow(BoL, 1.0681)) * (Math.pow(ToL, 0.4611)) * (Math.pow((1/LroL), 0.1216)) * (Math.pow(CircM, (3*0.3649))) * (Math.pow((1-Cp), (-0.6042)));
    var SS = LWL * ((2 * Tlcf) + (midBeam*2)) * (Math.pow(Cm, 0.5)) * (0.453 + (0.4425 * Cb) - (0.2862 * Cm) - (0.003467 * BoT) + (0.3696 * Cwp)) + (2.38 * (+shipset[0].BulbArea) / Cb);
    //Wave resistance
    var C4;
    if (BoL > 0.25) {
        C4 = 0.5 - (0.0625 * (LWL / (midBeam*2)));
    }
    else if (BoL > 0.11) {
        C4 = BoL;
    }
    else {
        C4 = 0.2296 * Math.pow(BoL, 0.3333);
    }
    var ie = 1 + 89 * Math.exp(-Math.pow((1/BoL), 0.80856) * Math.pow((1-Cwp), 0.3048) * Math.pow((1-Cp-0.0225*LCBoL), 0.6367) * Math.pow(((LroL*LWL)/(midBeam*2)), 0.34574) * Math.pow((100/L3oV), 0.16302));
    var C1FnHigh = 6919 * Math.pow(Cm, (-1.3346)) * Math.pow((1/Math.pow(CircM, 3)), 2.0098) * Math.pow(((LWL/(midBeam*2))-2), 1.4069);
    var C1FnLow = 2223105 * Math.pow(C4, 3.7861) * Math.pow((1/BoT), 1.0796) * Math.pow((90-ie), (-1.3757));
    var dd = -0.9;
    var C5;
    if (Cp > 0.8) {
        C5 = 1.7301 - (0.7067 * Cp);
    }
    else {
        C5 = (8.0798 * Cp) - (13.8673 * Math.pow(Cp, 2)) + (6.9844 * Math.pow(Cp, 3));
    }
    var m1low = (0.01404 * (LWL / Tlcf)) - (1.7525 / CircM) - (4.7932 * BoL) - C5;
    var m1high = -7.2035 * Math.pow(BoL, 0.3269) * Math.pow((Tlcf/(midBeam*2)), 0.6054);
    var C6;
    if (L3oV > 1727) {
        C6 = 0;
    }
    else if (L3oV > 512) {
        C6 = -1.69385 + ((CircM - 8) / 2.36);
    }
    else {
        C6 = -1.69385;
    }
    var m2_04 = C6 * 0.4 * Math.exp(-0.034 * Math.pow(0.4, (-3.29)));
    var m2_055 = C6 * 0.4 * Math.exp(-0.034 * Math.pow(0.55, (-3.29)));
    var lamda;
    if ((LWL/(midBeam*2)) > 12) {
        lamda = (1.446 * Cp) - 0.36;
    }
    else {
        lamda = (1.446 * Cp) - (0.03 * (LWL / (midBeam*2)));
    }
    var rbulb = 1;
    var ibulb = Tlcf - (1.446 * rbulb);
    var C2 = Math.exp(-1.89 * Math.pow(((AbulboBT*rbulb)/(rbulb+ibulb)), 0.5));
    var Ctransom = 0.05;
    var C3 = 1 - 0.8 * Ctransom;
    var RwoW_04 = (C1FnLow * C2 * C3) * Math.exp((m1low * Math.pow(0.4, dd)) + (m2_04 * Math.cos(lamda * Math.pow(0.4, (-2)))));
    var RwoW_055 = (C1FnHigh * C2 * C3) * Math.exp((m1high * Math.pow(0.55, dd)) + (m2_055 * Math.cos(lamda * Math.pow(0.55, (-2)))));
    //Viscous resistance 2
    var Ca;
    if (ToL > 0.04) {
        Ca = 0.006 * Math.pow((LWL+100), -0.16) - 0.00205;
    }
    else {
        Ca = 0.006 * Math.pow((LWL+100), -0.16) - 0.00205 + (0.003 * Math.pow((LWL/7.5), 0.5) * Math.pow(Cb, 4) * C2 * (0.04 - ToL));
    }
    var AppMargin = shipset[0].AppMargin_SeaMargin_PropCoeff.split(" ").map(parseFloat)[0];
    var SeaMargin = shipset[0].AppMargin_SeaMargin_PropCoeff.split(" ").map(parseFloat)[1];
    var PropCoeff = shipset[0].AppMargin_SeaMargin_PropCoeff.split(" ").map(parseFloat)[2];
    var PeaArr = [0]; //In kW, every 1kn
    var PsSeaArr = [0]; //In kW, every 1kn
    for (e=1; e<=+shipset[0].MaxSpeed; e++) {
        var Fn_displ = (e * 0.514) / (Math.pow(9.81 * (Math.pow(dispTotal[o] / +shipset[0].MediumDensity, 1/3)), 0.5));
        //Viscous resistance
        var Rn = LWL * e * 0.514 / +shipset[0].MediumKinematicViscosity;
        var Cfo = 0.075 / (Math.pow((Math.log10(Rn) - 2), 2));
        var Rv = 0.5 * +shipset[0].MediumDensity * Math.pow((e*0.514), 2) * SS * Cfo * onepk;
        //Wave resistance
        var Fn = e * 0.514 / Math.pow((9.81*LWL), 0.5);
        var m2 = C6 * 0.4 * Math.exp(-0.034 * Math.pow(Fn, (-3.29)));
        var RwoW_low = (C1FnLow * C2 * C3) * Math.exp((m1low * Math.pow(Fn, dd)) + (m2 * Math.cos(lamda * Math.pow(Fn, (-2)))));
        var RwoW_high = (C1FnHigh * C2 * C3) * Math.exp((m1high * Math.pow(Fn, dd)) + (m2 * Math.cos(lamda * Math.pow(Fn, (-2)))));
        var RwoW;
        if (Fn > 0.55) {
            RwoW = RwoW_high;
        }
        else if (Fn > 0.4) {
            RwoW = RwoW_04 + ((10 * Fn - 4) * (RwoW_055 - RwoW_04) / 1.5);
        }
        else {
            RwoW = RwoW_low;
        }
        var Rw = dispVol * +shipset[0].MediumDensity * RwoW * 9.81;
        //Viscous resistance 2
        var Rv2 = 0.5 * +shipset[0].MediumDensity * Math.pow((e*0.514), 2) * SS * (Cfo * onepk + Ca);
        //Total resistance
        var Rt = Rw + Rv2; //Resistance (kN)
        //Power
        var Pe = Rt * e * 0.514 / 1000; //Effective power (MW)
        var Pea = Pe * (1 + AppMargin); // Effective power appended (MW)
        var Ps = Pea / PropCoeff; //Shaft power (MW)
        var PsSea = Ps * (1 + SeaMargin); //Shaft power with sea margin (MW)
        PeaArr.push(Pea);
        PsSeaArr.push(PsSea);
    }
    PeaTotal.push(PeaArr);
    PsSeaTotal.push(PsSeaArr);
}
hydroData = []; //Hydrostatics data at each weight condition as objects
for (h in cond) {
     hydroData[h] = new hydroObj(cond[h], +dispTotal[h].toFixed(2), +CoGtotal[h][0].toFixed(2), +CoGtotal[h][1].toFixed(2), +CoGtotal[h][2].toFixed(2), +TlsfTotal[h].toFixed(2), +AwTotal[h].toFixed(2), +dispVolTotal[h].toFixed(2), +LWLTotal[h].toFixed(2), +BWLTotal[h].toFixed(2), +AmTotal[h].toFixed(2), +CircMTotal[h].toFixed(2), +CwpTotal[h].toFixed(2), +CmTotal[h].toFixed(2), +CbTotal[h].toFixed(2), +CpTotal[h].toFixed(2), +CvpTotal[h].toFixed(2), +LCFTotal[h].toFixed(2), +VCBTotal[h].toFixed(2), +LCBTotal[h].toFixed(2), +TPITotal[h].toFixed(2), +BMtsTotal[h].toFixed(2), +BMlsTotal[h].toFixed(2), +KMtsTotal[h].toFixed(2), +KMlsTotal[h].toFixed(2), +GMtsTotal[h].toFixed(2), +GMlsTotal[h].toFixed(2), +MCTsTotal[h].toFixed(2), +TrimTotalS[h].toFixed(2), +TsFwdTotal[h].toFixed(2), +TsAftTotal[h].toFixed(2), +TsMeanTotal[h].toFixed(2), +ListTotalS[h].toFixed(2), +KMtfTotal[h].toFixed(2), +KMlfTotal[h].toFixed(2), +GMtfTotal[h].toFixed(2), +GMlfTotal[h].toFixed(2), +MCTfTotal[h].toFixed(2), +TrimTotalF[h].toFixed(2), +TfFwdTotal[h].toFixed(2), +TfAftTotal[h].toFixed(2), +TfMeanTotal[h].toFixed(2), +ListTotalF[h].toFixed(2), +KfTotal[h].toFixed(2));
}

loadCondition = document.getElementById("load_condition").value;

$('.lwl_calc').html((LWLTotal[loadCondition]).toFixed(2)+"m")
$('.lwl_val').html((LWLTotal[loadCondition]).toFixed(2))
$('.bwl_calc').html((BWLTotal[loadCondition]).toFixed(2)+"m")
$('.ta_calc').html((TfFwdTotal[loadCondition]).toFixed(2)+"m")
$('.tf_calc').html((TfAftTotal[loadCondition]).toFixed(2)+"m")
$('.disp_calc').html((dispVolTotal[loadCondition]).toFixed(2)+"m3")
$('.cwp_calc').html((CwpTotal[loadCondition]).toFixed(2))
$('.cm_calc').html((CmTotal[loadCondition]).toFixed(2))
$('.cp_calc').html((CpTotal[loadCondition]).toFixed(2))
$('.cb_calc').html((CbTotal[loadCondition]).toFixed(2))
$('.bmt_calc').html((BMtsTotal[loadCondition]).toFixed(2)+"m")
$('.kmt_calc').html((KMtsTotal[loadCondition]).toFixed(2)+"m")
$('.gmt_calc').html((GMtsTotal[loadCondition]).toFixed(2)+"m")

}

//Function that plots GZ curve
function plotGZ() {
hydrostatics() //Calls hydrostatics function

var LSLeverArm = GZtsTotal[0]; //Lightships y coordinates
var WC1LeverArm = GZtsTotal[1];//Weight condition 1 y coordinates
var WC2LeverArm = GZtsTotal[2];//Weight condition 2 y coordinates
LSLeverArm[0] = 0;
WC1LeverArm[0] = 0;
WC2LeverArm[0] = 0;
var heelAng = [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60, 65, 70, 75, 80, 85, 90];//X coordinates

//https://plot.ly/javascript/
var trace3 = {
    x: heelAng,
    y: LSLeverArm,
    line: {shape: 'spline'},
    type: 'scatter',
    name: 'Light Wheight',
    mode:'lines'
    };

var trace2 = {
    x: heelAng,
    y: WC1LeverArm,
    line: {shape: 'spline'},
    type: 'scatter',
    name: 'Weight Cond 1',
    mode:'lines'
};

var trace1 = {
    x: heelAng,
    y: WC2LeverArm,
    line: {shape: 'spline'},
    type: 'scatter',
    name: 'Weight Cond 2',
    mode:'lines'
};

var data = [trace1, trace2, trace3];

var layout = {
    xaxis: {
        title: 'Angle of heel [<SUP>o</SUP>]'
    },
    yaxis: {
        title: 'Righting Lever [m]'
    },
    legend: {
        x: 0.1,
        y: 1
    },
    margin: {
        r: 0,
        t: 0,
        b: 50,
        l: 50
    },
};

Plotly.newPlot('myDiv1', data, layout);
}

//Function that plots power curve
function plotPower() {
hydrostatics() //Calls hydrostatics function

var LSPe = PeaTotal[0];
var WC1Pe = PeaTotal[1];
var WC2Pe = PeaTotal[2];
var LSPsSea = PsSeaTotal[0];
var WC1PsSea = PsSeaTotal[1];
var WC2PsSea = PsSeaTotal[2];
var speedKn = [];
for (i=0; i<=+shipset[0].MaxSpeed; i++) {
    speedKn.push(i);
}

//https://plot.ly/javascript/
var trace6 = {
    x: speedKn,
    y: LSPe,
    line: {shape: 'spline'},
    type: 'scatter',
    name: 'Pe, Light Ship',
    mode:'lines'
    };

var trace5 = {
    x: speedKn,
    y: WC1Pe,
    line: {shape: 'spline'},
    type: 'scatter',
    name: 'Pe, Weight Cond 1',
    mode:'lines'
};

var trace4 = {
    x: speedKn,
    y: WC2Pe,
    line: {shape: 'spline'},
    type: 'scatter',
    name: 'Pe, Weight Cond 2',
    mode:'lines'
};

var trace3 = {
    x: speedKn,
    y: LSPsSea,
    line: {shape: 'spline'},
    type: 'scatter',
    name: 'Ps, Light Ship',
    mode:'lines'
};

var trace2 = {
    x: speedKn,
    y: WC1PsSea,
    line: {shape: 'spline'},
    type: 'scatter',
    name: 'Ps, Weight Cond 1',
    mode:'lines'
};

var trace1 = {
    x: speedKn,
    y: WC2PsSea,
    line: {shape: 'spline'},
    type: 'scatter',
    name: 'Ps, Weight Cond 2',
    mode:'lines'
};

var data = [trace1, trace2, trace3, trace4, trace5, trace6];

var layout = {
    xaxis: {
        title: 'Speed [kn]'
    },
    yaxis: {
        title: 'Power [MW]'
    },
    legend: {
        x: 0,
        y: 1
    },
    margin: {
        r: 0,
        t: 0,
        b: 50,
        l: 50
    },
};

Plotly.newPlot('powerResistance', data, layout);
}


//Function that calculates free surface area approximation
function freeSurface() {
var FSData = []; //Array with x size, y size and fluid density per tank
for (i in blockset) {
    if ((+blockset[i].FluidDensity > 0) && (+blockset[i].xAft < +blockset[i].xFwd) && (+blockset[i].ySize != 0) && (+blockset[i].zHeight != 0) && (+blockset[i].zBase < Math.max(...pdecks)) && ((+blockset[i].DBBAreaTop + +blockset[i].DBBArea) > 0)) { //If DBB is a valid tank
        
        FSData[i] = []; //Creates entry in array above
        
        var maxVol = ((+blockset[i].DBBAreaTop + +blockset[i].DBBArea)/2) * +blockset[i].zHeight; //Maximum tank volume
        var zIncrements = +blockset[i].zHeight / 0.1; //Number of waterlines through tank
        var areaIncrement = [+blockset[i].DBBArea]; //Array with surface area at each z increment
        for (j=1; j<=zIncrements; j++) {
            areaIncrement.push(+blockset[i].DBBArea + ((+blockset[i].DBBAreaTop - +blockset[i].DBBArea)/zIncrements)*j);
        }
        
        ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////Weight condition 1
        
        var volumeIncrement = 0; //volume at each z increment
        for (k=1; k<areaIncrement.length; k++) {
            volumeIncrement = volumeIncrement + ((areaIncrement[k-1] + areaIncrement[k])/2)*0.1;
            if (volumeIncrement >= 0.99*(+blockset[i].VariableWeight_cond1 * maxVol)) {
                var FSzHeight = k*0.1; //Free surface z height
                var FSArea = areaIncrement[k]; //Free surface area
                break;
            }
        }
        
        var tankMidZ = Math.round((+blockset[i].zBase + FSzHeight)*10)/10; //Free surface z position
        var waterlinesHSNo = Math.round((Math.max(...pdecks) - tankMidZ)*10) //Number of required waterline in waterlinesHS global array
        var waterlinesMidTank = JSON.parse(JSON.stringify(waterlinesHS[waterlinesHSNo])); //http://stackoverflow.com/questions/122102/what-is-the-most-efficient-way-to-clone-an-object, https://davidwalsh.name/javascript-clone-array
        var xMini; //Minimum x location of tank
        var xMaxi; //Maximum x location of tank
        if ((waterlinesMidTank[0][0] - gsm/2) > +blockset[i].xAft) {
            xMini = waterlinesMidTank[0][0] - gsm/2;
        }
        else {
            xMini = +blockset[i].xAft
        }
        if ((waterlinesMidTank[waterlinesMidTank.length - 1][0] + gsm/2) < +blockset[i].xFwd) {
            xMaxi = waterlinesMidTank[waterlinesMidTank.length - 1][0] + gsm/2;
        }
        else {
            xMaxi = +blockset[i].xFwd
        }
        
        var surfaceX; //Tank x size approximation
        var surfaceY; //Tank y size approximation
        if ((+blockset[i].VariableWeight_cond1 <= 0) || (+blockset[i].VariableWeight_cond1 >= 1)) { //If tank is completelt empty or full
            surfaceX = 0;
            surfaceY = 0;
        }
        else {
            surfaceX = xMaxi - xMini;
            surfaceY = FSArea / surfaceX;
        }
        
        ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////Weight condition 2
        
        var volumeIncrement = 0; //volume at each z increment
        for (l=1; l<areaIncrement.length; l++) {
            volumeIncrement = volumeIncrement + ((areaIncrement[l-1] + areaIncrement[l])/2)*0.1;
            if (volumeIncrement >= 0.99*(+blockset[i].VariableWeight_cond2 * maxVol)) {
                var FSzHeight1 = l*0.1; //Free surface z height
                var FSArea1 = areaIncrement[l]; //Free surface area
                break;
            }
        }
        
        var tankMidZ1 = Math.round((+blockset[i].zBase + FSzHeight1)*10)/10; //Free surface z position
        var waterlinesHSNo1 = Math.round((Math.max(...pdecks) - tankMidZ1)*10) //Number of required waterline in waterlinesHS global array
        var waterlinesMidTank1 = JSON.parse(JSON.stringify(waterlinesHS[waterlinesHSNo1])); //http://stackoverflow.com/questions/122102/what-is-the-most-efficient-way-to-clone-an-object, https://davidwalsh.name/javascript-clone-array
        var xMini1; //Minimum x location of tank
        var xMaxi1; //Maximum x location of tank
        if ((waterlinesMidTank1[0][0] - gsm/2) > +blockset[i].xAft) {
            xMini1 = waterlinesMidTank1[0][0] - gsm/2;
        }
        else {
            xMini1 = +blockset[i].xAft
        }
        if ((waterlinesMidTank1[waterlinesMidTank1.length - 1][0] + gsm/2) < +blockset[i].xFwd) {
            xMaxi1 = waterlinesMidTank1[waterlinesMidTank1.length - 1][0] + gsm/2;
        }
        else {
            xMaxi1 = +blockset[i].xFwd
        }
        
        var surfaceX1; //Tank x size approximation
        var surfaceY1; //Tank y size approximation
        if ((+blockset[i].VariableWeight_cond2 <= 0) || (+blockset[i].VariableWeight_cond2 >= 1)) { //If tank is completelt empty or full
            surfaceX1 = 0;
            surfaceY1 = 0;
        }
        else {
            surfaceX1 = xMaxi1 - xMini1;
            surfaceY1 = FSArea1 / surfaceX1;
        }
        ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
        
        FSData[i].push(surfaceX, surfaceY, +blockset[i].FluidDensity, surfaceX1, surfaceY1);
    }
}
return FSData;
}

//Function that plots 3D hullform model
function offsets() {
waterlines(); //Calls waterlines function

/*var zSpacing = Math.round((waterlinesHull.length-1) / 10); //Offsets from eleven waterlines
var xSpacing = Math.round((waterlinesHull[0].length-1) / 20); //Twenty points from each waterline
var plotCoo = []; //Array with coordinates of points
for (i=waterlinesHull.length-1; i>=0; i-=zSpacing) { //From keel to top
    plotCoo[i] = []; //For each waterline
    for (j=0; j<=(waterlinesHull[0].length-1); j+=xSpacing) { //From aft to fwd
        for (k in waterlinesHull[i]) { //For each point in waterline
            if (waterlinesHull[i][k][0] == (j*gsm + 0.25)) { //Find if that point should be used in lines plan
                plotCoo[i].push([(waterlinesHull.length-1-i)*0.1, waterlinesHull[i][k][0], waterlinesHull[i][k][1]]); //Push into array
            }
        }
    }
}
console.log(plotCoo);*/

//var modal = document.getElementById('myDiv'); //Get the modal, http://www.w3schools.com/howto/howto_css_modals.asp
//modal.style.display = "block"; //When the user clicks on the button, open the modal, http://www.w3schools.com/howto/howto_css_modals.asp

var xOffsets = []; //Array with x coordinates
var yOffsets = []; //Array with y coordinates
var zOffsets = []; //Array with z coordinates

for (i in waterlinesHull) {
    xOffsets[i] = []; //Array with x coordinates for each waterline
    yOffsets[i] = []; //Array with y coordinates for each waterline
    zOffsets[i] = []; //Array with z coordinates for each waterline
    for (j in waterlinesHull[i]){
        xOffsets[i].push(waterlinesHull[i][j][0]);
        yOffsets[i].push(waterlinesHull[i][j][1]);
        zOffsets[i].push(+shipset[0].D - i*0.1);  
    }
}

//https://plot.ly/javascript/
var data = [
    {
        x: xOffsets,
        y: yOffsets,
        z: zOffsets,
        type: 'surface',
        showscale: false,
        colorscale: [
            ['0.0', 'rgb(165,0,38)']
        ],
        
        }
    ];
var layout = {
    //width: 1000,
    //height: 1000,
    //title: "3D Hullfrom Model",
    //autozize: false,
    
    scene: {
        xaxis: {
            title : 'Length [m]',
            range: [0, +shipset[0].LOA],
            zeroline: true},
        yaxis: {
            title : 'Beam [m]',
            range: [- +shipset[0].LOA / 2, +shipset[0].LOA / 2],
            zeroline: true},
        zaxis:{
            title : 'Height [m]',
            range: [- +shipset[0].LOA / 2, +shipset[0].LOA / 2],
            zeroline: true},
        camera: {
            eye: {x: 1, y: 1, z: 0.1},
        }
    },
    margin: {
        l: 0,
        r: 0,
        b: 0,
        t: 0,
        pad: 4
    },
    
};

Plotly.newPlot('3dhullform', data, layout);
}

//Function that trims GA visualisation//////////////////////////////////////////NOT IN USE
function trimDBB() {
//hullGen(); //Calls hullGen function
DeckCoordinates(); //Calls DeckCoordinates function

var hullMin = []; //Array with minimum x coordinate per deck
var hullMax = []; //Array with maximum x coordinate per deck
for (a=0; a<DC.length-1; a++) {
    hullMin.push(DC[a].CoordinatesEnd[0][0])
    hullMax.push(DC[a].CoordinatesEnd[DC[a].CoordinatesEnd.length-1][0])
}

//Copied from on_change
//Use snap.svg to write text and place blocks inside SVG grid
var s = Snap("#"+ svgid);
var canvas_y = +document.getElementById("canv_y").value * (gs/gsm);

//Coppied from DBBAreas(ClasA)
for (i in blockset) { //For each DBB
    
    var DBBDeck = []; //Name of decks each DBB is on
    for (m in blockset[i].decks) {
        DBBDeck.push(blockset[i].decks[m].deck);
    }
    //////////////////////////////////////////////////////////////////////////SUPERSTRUCTURE
    var DBBDeckNo = []; //Number of deck each DBB is on
    for (j in DC) { //For each deck
        for (n in DBBDeck) { //For each DBB deck
            if (DBBDeck[n] == DC[j].DeckName && (pdecks[ndecks.indexOf(DBBDeck[n])] >= shipset[0].D)) { //If DBB deck name is equal to deck name and above hull
                DBBDeckNo.push(ndecks.indexOf(DBBDeck[n])); //Get number of DBB deck
            }
        }
    }
    for (k in blockset[i].grCoo) {
        for (o in DBBDeckNo) {
            for (l in DC[DBBDeckNo[o]].CoordinatesEnd) { //For each cell coordinate of the DBB deck
                if (blockset[i].grCoo[k][0] == DC[DBBDeckNo[o]].CoordinatesEnd[l][0] && (blockset[i].grCoo[k][1] < DC[DBBDeckNo[o]].CoordinatesStart[l][1] || blockset[i].grCoo[k][1] > DC[DBBDeckNo[o]].CoordinatesEnd[l][1])) {
                    s.rect(blockset[i].grCoo[k][0] * gs - gs, ((Math.round(canvas_y/gs)*gs)*(DBBDeckNo[o] + 1)) + ((Math.round(0.25*canvas_y/gs)*gs)*(DBBDeckNo[o])) - (blockset[i].grCoo[k][1] * gs), gs, gs).attr({ /*stroke: 'black', 'strokeWidth': 2,*/ fill: 'GhostWhite' }); //Plot rectangles
                }
                else if ((blockset[i].grCoo[k][0] > hullMax[DBBDeckNo[o]]) || (blockset[i].grCoo[k][0] < hullMin[DBBDeckNo[o]])) { //If DBB is fwd or aft of deck outline
                    s.rect(blockset[i].grCoo[k][0] * gs - gs, ((Math.round(canvas_y/gs)*gs)*(DBBDeckNo[o] + 1)) + ((Math.round(0.25*canvas_y/gs)*gs)*(DBBDeckNo[o])) - (blockset[i].grCoo[k][1] * gs), gs, gs).attr({ /*stroke: 'black', 'strokeWidth': 2,*/ fill: 'GhostWhite' }); //Plot rectangles
                }
            }
        }
    }
    //////////////////////////////////////////////////////////////////////////HULL
    var DBBDeckNo = []; //Number of deck each DBB is on
    for (j in DC) { //For each deck
        for (n in DBBDeck) { //For each DBB deck
            if (DBBDeck[n] == DC[j].DeckName && (pdecks[ndecks.indexOf(DBBDeck[n])] < shipset[0].D)) { //If DBB deck name is equal to deck name and in hull
                DBBDeckNo.push(ndecks.indexOf(DBBDeck[n]) - 1); //Get number of DBB deck
            }
        }
    }
    for (k in blockset[i].grCoo) {
        for (o in DBBDeckNo) {
            for (l in DC[DBBDeckNo[o]].CoordinatesEnd) { //For each cell coordinate of the DBB deck
                if (blockset[i].grCoo[k][0] == DC[DBBDeckNo[o]].CoordinatesEnd[l][0] && (blockset[i].grCoo[k][1] < DC[DBBDeckNo[o]].CoordinatesStart[l][1] || blockset[i].grCoo[k][1] > DC[DBBDeckNo[o]].CoordinatesEnd[l][1])) {
                    s.rect(blockset[i].grCoo[k][0] * gs - gs, ((Math.round(canvas_y/gs)*gs)*(DBBDeckNo[o] + 2)) + ((Math.round(0.25*canvas_y/gs)*gs)*(DBBDeckNo[o] + 1)) - (blockset[i].grCoo[k][1] * gs), gs, gs).attr({ /*stroke: 'black', 'strokeWidth': 2,*/ fill: 'GhostWhite' }); //Plot rectangles
                }
                else if ((blockset[i].grCoo[k][0] > hullMax[DBBDeckNo[o]]) || (blockset[i].grCoo[k][0] < hullMin[DBBDeckNo[o]])) { //If DBB is fwd or aft of deck outline
                    s.rect(blockset[i].grCoo[k][0] * gs - gs, ((Math.round(canvas_y/gs)*gs)*(DBBDeckNo[o] + 2)) + ((Math.round(0.25*canvas_y/gs)*gs)*(DBBDeckNo[o] + 1)) - (blockset[i].grCoo[k][1] * gs), gs, gs).attr({ /*stroke: 'black', 'strokeWidth': 2,*/ fill: 'GhostWhite' }); //Plot rectangles
                }
            }
        }
    }
    //////////////////////////////////////////////////////////////////////////
}
//////////////////////////////////////////////////////////////////////////
//Coppied from on_change()
var canvas_x = +document.getElementById("canv_x").value * (gs/gsm);
//Deck names and outlines
doutline = [];
dcurves = [];
hullGen(); //Calls hullGen function
var deckOutlinesR; //New variable for port deck curve
for (i=0; i < ndecks.length; i++){
    coordinates = [s.text(3, (s_text+(Math.round(1.25*canvas_y/gs)*gs)*(i)), ndecks[i] + " (" + pdecks[i] + "m)").attr({"font-size": s_text+"px", fontWeight: '700'})]; //Type deck names
    doutline.push = s.rect(0,(Math.round(1.25*canvas_y/gs)*gs)*(i),canvas_x,canvas_y).attr({ stroke: 'black', 'strokeWidth': 2, fill: 'none' }); //Plot deck outlines
    
    deckOutlinesR = JSON.parse(JSON.stringify(deckOutlines[i])); //http://stackoverflow.com/questions/122102/what-is-the-most-efficient-way-to-clone-an-object, https://davidwalsh.name/javascript-clone-array
    for (j=0; j<deckOutlines[i].length; j++) { //Move curves to each deck
        deckOutlinesR[j][1] = -deckOutlines[i][j][1] + (Math.round(1.25*canvas_y/gs)*gs)*(i) + 0.5*canvas_y;
        deckOutlines[i][j][1] = deckOutlines[i][j][1] + (Math.round(1.25*canvas_y/gs)*gs)*(i) + 0.5*canvas_y;
    }
    dcurves.push = s.polyline(deckOutlines[i]).attr({ stroke: 'blue', 'strokeWidth': 1, fill: 'none' }); //Plot deck curves stbd
    dcurves.push = s.polyline(deckOutlinesR).attr({ stroke: 'blue', 'strokeWidth': 1, fill: 'none' }); //Plot deck curves port
}
//Plot deck roof
doutline2 = [];
dcurves2 = [];
for (i=0; i < ndecks.length - 1; i++){
    deckOutlinesTopR = JSON.parse(JSON.stringify(deckOutlinesTop[i])); //http://stackoverflow.com/questions/122102/what-is-the-most-efficient-way-to-clone-an-object, https://davidwalsh.name/javascript-clone-array
    for (j=0; j<deckOutlinesTop[i].length; j++) { //Move curves to each deck
        deckOutlinesTopR[j][1] = -deckOutlinesTop[i][j][1] + (Math.round(1.25*canvas_y/gs)*gs)*(i) + 0.5*canvas_y + (Math.round(1.25*canvas_y/gs)*gs);
        deckOutlinesTop[i][j][1] = deckOutlinesTop[i][j][1] + (Math.round(1.25*canvas_y/gs)*gs)*(i) + 0.5*canvas_y + (Math.round(1.25*canvas_y/gs)*gs);
    }
    dcurves2.push = s.polyline(deckOutlinesTop[i]).attr({ stroke: 'blue', strokeDasharray: "1", 'strokeWidth': 1, fill: 'none' }); //Plot deck curves stbd
    dcurves2.push = s.polyline(deckOutlinesTopR).attr({ stroke: 'blue', strokeDasharray: "1", 'strokeWidth': 1, fill: 'none' }); //Plot deck curves port
}

//Bulkhead names and outlines
boutline = [];
for (k in nbulkheads){
    boutline.push = s.line(pbulkheads[k]*(gs/gsm), 0, pbulkheads[k]*(gs/gsm), (Math.round(1.25*canvas_y/gs)*gs)*(ndecks.length)-(Math.round(0.25*canvas_y/gs)*gs)).attr({stroke: 'FireBrick', 'strokeWidth': 2, fill: 'none'}); //Plot bulkhead outlines
    
    for (l in ndecks){
        bcoordinates = s.text(pbulkheads[k]*(gs/gsm) + 0.1*s_text, Math.round(1.25*canvas_y/gs)*gs*l - 0.125*canvas_y + 0.3*s_text, nbulkheads[k]).attr({
            "font-size": s_text+"px",
            fontWeight: '700',
            fill: 'FireBrick',
            id: nbulkheads[k]
        }).click(clickCallBackBH); //Type bulkhead names
    }
}
}

//Function that trims GA visualisation//////////////////////////////////////////NOT IN USE
function trimGA() {
//hullGen(); //Calls hullGen function
DeckCoordinates(); //Calls DeckCoordinates function
var xCooMin = 1;
var xCooMax = Math.round(+shipset[0].LOA/gsm)*gsm / gsm;
var yCooMin = 1;
var yCooMax = Math.round(1.25 * +shipset[0].BOA/gsm)*gsm / gsm;
//var yCooMax = Math.round(+shipset[0].BOA/gsm)*gsm / gsm;

var hullMin = []; //Array with minimum x coordinate per deck
var hullMax = []; //Array with maximum x coordinate per deck
for (i=0; i<DC.length-1; i++) {
    hullMin.push(DC[i].CoordinatesEnd[0][0])
    hullMax.push(DC[i].CoordinatesEnd[DC[i].CoordinatesEnd.length-1][0])
}

//Copied from on_change
//Use snap.svg to write text and place blocks inside SVG grid
var s = Snap("#"+ svgid);
var canvas_y = +document.getElementById("canv_y").value * (gs/gsm);

//////////////////////////////////////////////////////////////////////////SUPERSTRUCTURE
for (a=0; a<DC.length; a++) {
    if (pdecks[a] >= shipset[0].D) {
        for (b=xCooMin; b<=xCooMax; b++) {
            for (c=yCooMin; c<=yCooMax; c++) {
                for (l in DC[a].CoordinatesEnd) { //For each cell coordinate of the DBB deck
                    if ((b == DC[a].CoordinatesEnd[l][0] && (c < DC[a].CoordinatesStart[l][1] || c > DC[a].CoordinatesEnd[l][1])) || ((b > hullMax[a]) || (b < hullMin[a]))) {
                        s.rect(b * gs - gs, ((Math.round(canvas_y/gs)*gs)*(a + 1)) + ((Math.round(0.25*canvas_y/gs)*gs)*(a)) - (c * gs), gs, gs).attr({ /*stroke: 'black', 'strokeWidth': 2,*/ fill: 'GhostWhite' }); //Plot rectangles
                    }
                    //else if ((b > hullMax[a]) || (b < hullMin[a])) { //If DBB is fwd or aft of deck outline
                        //s.rect(b * gs - gs, ((Math.round(canvas_y/gs)*gs)*(a + 1)) + ((Math.round(0.25*canvas_y/gs)*gs)*(a)) - (c * gs), gs, gs).attr({ stroke: 'black', 'strokeWidth': 2, fill: 'GhostWhite' }); //Plot rectangles
                    //}
                }
            }
        }
    }
}
//////////////////////////////////////////////////////////////////////////HULL
for (a=0; a<DC.length; a++) {
    if (pdecks[a] <= shipset[0].D) {
        for (b=xCooMin; b<=xCooMax; b++) {
            for (c=yCooMin; c<=yCooMax; c++) {
                for (l in DC[a].CoordinatesEnd) { //For each cell coordinate of the DBB deck
                    if ((b == DC[a].CoordinatesEnd[l][0] && (c < DC[a].CoordinatesStart[l][1] || c > DC[a].CoordinatesEnd[l][1])) || ((b > hullMax[a]) || (b < hullMin[a]))) {
                        s.rect(b * gs - gs, ((Math.round(canvas_y/gs)*gs)*(a + 2)) + ((Math.round(0.25*canvas_y/gs)*gs)*(a + 1)) - (c * gs), gs, gs).attr({ /*stroke: 'black', 'strokeWidth': 2,*/ fill: 'GhostWhite' }); //Plot rectangles
                    }
                    //else if ((b > hullMax[a]) || (b < hullMin[a])) { //If DBB is fwd or aft of deck outline
                        //s.rect(b * gs - gs, ((Math.round(canvas_y/gs)*gs)*(a + 2)) + ((Math.round(0.25*canvas_y/gs)*gs)*(a + 1)) - (c * gs), gs, gs).attr({ stroke: 'black', 'strokeWidth': 2, fill: 'GhostWhite' }); //Plot rectangles
                    //}
                }
            }
        }
    }
}
//////////////////////////////////////////////////////////////////////////
//Coppied from on_change()
var canvas_x = +document.getElementById("canv_x").value * (gs/gsm);
//Deck names and outlines
doutline = [];
dcurves = [];
hullGen(); //Calls hullGen function
var deckOutlinesR; //New variable for port deck curve
for (i=0; i < ndecks.length; i++){
    coordinates = [s.text(3, (s_text+(Math.round(1.25*canvas_y/gs)*gs)*(i)), ndecks[i] + " (" + pdecks[i] + "m)").attr({"font-size": s_text+"px", fontWeight: '700'})]; //Type deck names
    doutline.push = s.rect(0,(Math.round(1.25*canvas_y/gs)*gs)*(i),canvas_x,canvas_y).attr({ stroke: 'black', 'strokeWidth': 2, fill: 'none' }); //Plot deck outlines
    
    deckOutlinesR = JSON.parse(JSON.stringify(deckOutlines[i])); //http://stackoverflow.com/questions/122102/what-is-the-most-efficient-way-to-clone-an-object, https://davidwalsh.name/javascript-clone-array
    for (j=0; j<deckOutlines[i].length; j++) { //Move curves to each deck
        deckOutlinesR[j][1] = -deckOutlines[i][j][1] + (Math.round(1.25*canvas_y/gs)*gs)*(i) + 0.5*canvas_y;
        deckOutlines[i][j][1] = deckOutlines[i][j][1] + (Math.round(1.25*canvas_y/gs)*gs)*(i) + 0.5*canvas_y;
    }
    dcurves.push = s.polyline(deckOutlines[i]).attr({ stroke: 'blue', 'strokeWidth': 1, fill: 'none' }); //Plot deck curves stbd
    dcurves.push = s.polyline(deckOutlinesR).attr({ stroke: 'blue', 'strokeWidth': 1, fill: 'none' }); //Plot deck curves port
}
//Plot deck roof
doutline2 = [];
dcurves2 = [];
for (i=0; i < ndecks.length - 1; i++){
    deckOutlinesTopR = JSON.parse(JSON.stringify(deckOutlinesTop[i])); //http://stackoverflow.com/questions/122102/what-is-the-most-efficient-way-to-clone-an-object, https://davidwalsh.name/javascript-clone-array
    for (j=0; j<deckOutlinesTop[i].length; j++) { //Move curves to each deck
        deckOutlinesTopR[j][1] = -deckOutlinesTop[i][j][1] + (Math.round(1.25*canvas_y/gs)*gs)*(i) + 0.5*canvas_y + (Math.round(1.25*canvas_y/gs)*gs);
        deckOutlinesTop[i][j][1] = deckOutlinesTop[i][j][1] + (Math.round(1.25*canvas_y/gs)*gs)*(i) + 0.5*canvas_y + (Math.round(1.25*canvas_y/gs)*gs);
    }
    dcurves2.push = s.polyline(deckOutlinesTop[i]).attr({ stroke: 'blue', strokeDasharray: "1", 'strokeWidth': 1, fill: 'none' }); //Plot deck curves stbd
    dcurves2.push = s.polyline(deckOutlinesTopR).attr({ stroke: 'blue', strokeDasharray: "1", 'strokeWidth': 1, fill: 'none' }); //Plot deck curves port
}

//Bulkhead names and outlines
boutline = [];
for (k in nbulkheads){
    boutline.push = s.line(pbulkheads[k]*(gs/gsm), 0, pbulkheads[k]*(gs/gsm), (Math.round(1.25*canvas_y/gs)*gs)*(ndecks.length)-(Math.round(0.25*canvas_y/gs)*gs)).attr({stroke: 'FireBrick', 'strokeWidth': 2, fill: 'none'}); //Plot bulkhead outlines
    
    for (l in ndecks){
        bcoordinates = s.text(pbulkheads[k]*(gs/gsm) + 0.1*s_text, Math.round(1.25*canvas_y/gs)*gs*l - 0.125*canvas_y + 0.3*s_text, nbulkheads[k]).attr({
            "font-size": s_text+"px",
            fontWeight: '700',
            fill: 'FireBrick',
            id: nbulkheads[k]
        }).click(clickCallBackBH); //Type bulkhead names
    }
}
}

//Function that trims GA visualisation
function trimGA2() {
//Copied from on_change
var s = Snap("#"+ svgid); //Use snap.svg to write text and place blocks inside SVG grid
var canvas_y = +document.getElementById("canv_y").value * (gs/gsm);

var corr; //Correction for beam if not integer
if ((Math.round(+shipset[0].BOA/gsm)*gsm) % 1 == 0) { //If beam is integer
    corr = 0;
}
else { //if beam is not integer
    corr = gs/2;
}

var polyArr; //Array with stbd polygon coordinates
var polyArrMirror; //Array with port polygon coordinates
for (a=0; a<deckOutlines2.length; a++) {
    if (pdecks[a] >= shipset[0].D) { //If deck is in superstructure
        polyArr = JSON.parse(JSON.stringify(deckOutlines2[a])); //Stbd
        polyArrMirror = JSON.parse(JSON.stringify(deckOutlines2[a])); //Port
    }
    else { //If deck is in hull
        polyArr = JSON.parse(JSON.stringify(deckOutlines2[a-1])); //Stbd
        polyArrMirror = JSON.parse(JSON.stringify(deckOutlines2[a-1])); //Port
    }
    for (g in polyArr) {
        polyArr[g][1] = polyArr[g][1] + (Math.round(1.25*canvas_y/gs)*gs)*a + (Math.round(0.5*canvas_y/gs)*gs) - corr;
    }
    polyArr.unshift([0, (a+1)*(Math.round(canvas_y/gs)*gs) + a*(Math.round(0.25*canvas_y/gs)*gs) + (Math.round(0.25*canvas_y/gs)*gs)], [0, polyArr[0][1] - (Math.round(0.5*canvas_y/gs)*gs)]); //Adds two entries at beginning of array
    polyArr.push([(Math.round(+shipset[0].LOA/gsm)*gsm)  * gs / gsm, polyArr[polyArr.length-1][1] - (Math.round(0.5*canvas_y/gs)*gs)], [(Math.round(+shipset[0].LOA/gsm)*gsm)  * gs / gsm, (a+1)*(Math.round(canvas_y/gs)*gs) + a*(Math.round(0.25*canvas_y/gs)*gs) + (Math.round(0.25*canvas_y/gs)*gs)]); //Adds two entries at end of array
    s.polygon(polyArr).attr({fill: 'GhostWhite'}); //http://www.w3schools.com/svg/svg_polygon.asp
    for (g in polyArrMirror) {
        polyArrMirror[g][1] = -polyArrMirror[g][1] + ((Math.round(1.25*canvas_y/gs)*gs)*a + (Math.round(0.5*canvas_y/gs)*gs) - corr);
    }
    polyArrMirror.unshift([0, a*(Math.round(canvas_y/gs)*gs) + a*(Math.round(0.25*canvas_y/gs)*gs)], [0, polyArrMirror[0][1] + (Math.round(0.5*canvas_y/gs)*gs)]); //Adds two entries at beginning of array
    polyArrMirror.push([(Math.round(+shipset[0].LOA/gsm)*gsm)  * gs / gsm, polyArrMirror[polyArrMirror.length-1][1] + (Math.round(0.5*canvas_y/gs)*gs)], [(Math.round(+shipset[0].LOA/gsm)*gsm)  * gs / gsm, a*(Math.round(canvas_y/gs)*gs) + a*(Math.round(0.25*canvas_y/gs)*gs)]); //Adds two entries at end of array
    s.polygon(polyArrMirror).attr({fill: 'GhostWhite'}); //http://www.w3schools.com/svg/svg_polygon.asp
}

//////////////////////////////////////////////////////////////////////////
//Coppied from on_change()
var canvas_x = +document.getElementById("canv_x").value * (gs/gsm);
//Deck names and outlines
doutline = [];
dcurves = [];
hullGen(); //Calls hullGen function
var deckOutlinesR; //New variable for port deck curve
for (i=0; i < ndecks.length; i++){
    coordinates = [s.text(3, (s_text+(Math.round(1.25*canvas_y/gs)*gs)*(i)), ndecks[i] + " (" + pdecks[i] + "m)").attr({"font-size": s_text+"px", fontWeight: '700'})]; //Type deck names
    doutline.push = s.rect(0,(Math.round(1.25*canvas_y/gs)*gs)*(i),canvas_x,canvas_y).attr({ stroke: 'black', 'strokeWidth': 2, fill: 'none' }); //Plot deck outlines
    
    deckOutlinesR = JSON.parse(JSON.stringify(deckOutlines[i])); //http://stackoverflow.com/questions/122102/what-is-the-most-efficient-way-to-clone-an-object, https://davidwalsh.name/javascript-clone-array
    for (j=0; j<deckOutlines[i].length; j++) { //Move curves to each deck
        deckOutlinesR[j][1] = -deckOutlines[i][j][1] + (Math.round(1.25*canvas_y/gs)*gs)*(i) + 0.5*canvas_y;
        deckOutlines[i][j][1] = deckOutlines[i][j][1] + (Math.round(1.25*canvas_y/gs)*gs)*(i) + 0.5*canvas_y;
    }
    dcurves.push = s.polyline(deckOutlines[i]).attr({ stroke: 'blue', 'strokeWidth': 1, fill: 'none' }); //Plot deck curves stbd
    dcurves.push = s.polyline(deckOutlinesR).attr({ stroke: 'blue', 'strokeWidth': 1, fill: 'none' }); //Plot deck curves port
}
//Plot deck roof
doutline2 = [];
dcurves2 = [];
for (i=0; i < ndecks.length - 1; i++){
    deckOutlinesTopR = JSON.parse(JSON.stringify(deckOutlinesTop[i])); //http://stackoverflow.com/questions/122102/what-is-the-most-efficient-way-to-clone-an-object, https://davidwalsh.name/javascript-clone-array
    for (j=0; j<deckOutlinesTop[i].length; j++) { //Move curves to each deck
        deckOutlinesTopR[j][1] = -deckOutlinesTop[i][j][1] + (Math.round(1.25*canvas_y/gs)*gs)*(i) + 0.5*canvas_y + (Math.round(1.25*canvas_y/gs)*gs);
        deckOutlinesTop[i][j][1] = deckOutlinesTop[i][j][1] + (Math.round(1.25*canvas_y/gs)*gs)*(i) + 0.5*canvas_y + (Math.round(1.25*canvas_y/gs)*gs);
    }
    dcurves2.push = s.polyline(deckOutlinesTop[i]).attr({ stroke: 'blue', strokeDasharray: "1", 'strokeWidth': 1, fill: 'none' }); //Plot deck curves stbd
    dcurves2.push = s.polyline(deckOutlinesTopR).attr({ stroke: 'blue', strokeDasharray: "1", 'strokeWidth': 1, fill: 'none' }); //Plot deck curves port
}

//Bulkhead names and outlines
boutline = [];
for (k in nbulkheads){
    boutline.push = s.line(pbulkheads[k]*(gs/gsm), 0, pbulkheads[k]*(gs/gsm), (Math.round(1.25*canvas_y/gs)*gs)*(ndecks.length)-(Math.round(0.25*canvas_y/gs)*gs)).attr({stroke: 'FireBrick', 'strokeWidth': 2, fill: 'none'}); //Plot bulkhead outlines
    
    for (l in ndecks){
        bcoordinates = s.text(pbulkheads[k]*(gs/gsm) + 0.1*s_text, Math.round(1.25*canvas_y/gs)*gs*l - 0.125*canvas_y + 0.3*s_text, nbulkheads[k]).attr({
            "font-size": s_text+"px",
            fontWeight: '700',
            fill: 'FireBrick',
            id: nbulkheads[k]
        }).click(clickCallBackBH); //Type bulkhead names
    }
}
}

