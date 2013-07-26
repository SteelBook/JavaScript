var Farben = ["Herz", "Karo", "Kreuz", "Pik"];
var Werte  = new Array("2", "3", "4", "5", "6", "7", "8", "9", "10", "Bube", "Dame", "Koenig", "As");// alternative Array-Definition

var Farbe = "";
var Wert  = "";
var KartenIndex = 0;
var Karten = new Object;// 4 Reihen á 13 Karten, je eine für jede Farbe; Properties als "Index"
const ANZAHL_KARTEN = 5;
var Hand = new Array(ANZAHL_KARTEN);// Object[]

// Analyse-Resultate:
var HaeufigkeitFarbe = new Object;
var HaeufigkeitWert = new Object;

//----------------------------
function initHand() { 
	for(var i=0; i<ANZAHL_KARTEN; i++) {
		var cardName = "Card" + (i+1);
		document.getElementById(cardName).src = "img/Poker-Karte-leer.jpg";

		Hand[i] = null;
	};
}


//----------------------------
function initHaeufigkeit(haeufigkeit_array, index_array) {
	for(var i=0; i < index_array.length; i++) {
		var index = index_array[i];

		haeufigkeit_array[index] = 0;
	};
}


//----------------------------
function initVerfuegbarkeit() {
	// Verfügbarkeit aller Karten initialisieren:
	for(var i=0; i < Farben.length; i++) {
		var farbe = Farben[i];

		Karten[farbe] = new Object;// 13 Karten einer Farbe
		for(var j=0; j < Werte.length; j++) {
			var wert = Werte[j];
			Karten[farbe][wert] = false;// false = verfügbar, true = ausgeteilt
		};
	};
}

//----------------------------
function createWerteButton(wert) {
//	return document.createTextNode(wert);
	var button = document.createElement("button"); 
	button.value = wert;
	
	var img = document.createElement("img");
	img.src = "img/" + wert + ".png";
	img.height = 46;
	img.alt = wert;
	button.appendChild(img);
	
	button.onclick = new Function("Wert_setzen(this);");
	
	return button;
}

//----------------------------
// erzeugt Tabelle mit 13 Zeilen, 1 Spalte
function initTableWerteButtons() {
	var table = document.getElementById("TableWerteButtons");

	//todo: Tabelle leeren
	
	for(var i=0; i < Werte.length; i++) {
		var row = document.createElement("tr");
		var col = document.createElement("td");
		
		var button = createWerteButton(Werte[i]); 
		col.appendChild(button);
		
		row.appendChild(col);
		table.appendChild(row);
	}
}


//----------------------------
function initAnalyseResultate() {
	initHaeufigkeit(HaeufigkeitFarbe, Farben);
	initHaeufigkeit(HaeufigkeitWert,  Werte);
}

//----------------------------
function init() {
	initHand();
	initVerfuegbarkeit();
	initTableWerteButtons();
	
	initAnalyseResultate();
}


//----------------------------
// aus JSvKbF
function knotenTextErsetzen(id, text){
	var knoten = document.getElementById(id);
	while(knoten.firstChild)
		knoten.removeChild(knoten.firstChild);
	knoten.appendChild(document.createTextNode(text));
}


//----------------------------
function wertAlsZahl(karte) {
	var ret = -1;
	if(karte != null) {
		var wert = karte["Wert"];
	
		for(var i=0; i < Werte.length; i++) {
			if(wert == Werte[i]) {
				ret = i;
				break;
			}
		}
	}
	
	return ret;
}


//----------------------------
function wertVergleich(karte1, karte2) {
	var wert1 = wertAlsZahl(karte1);
	var wert2 = wertAlsZahl(karte2);
	//alert("Werte: " + wert1 + " , " + wert2);	
	if(wert1 != -1 && wert2 != -1)
		return wert1 - wert2;
	else
		return 0;
}


//----------------------------
// funktioniert auch für weniger als 5 Karten, außer für Straight/Royal Flush
function analysiereHand() {
	var ret = "";
	
	initAnalyseResultate();
	
	// Farben zählen:
	for(var i=0; i < Hand.length; i++) {
		if(Hand[i] != null) {
			var farbe = Hand[i]["Farbe"];
			HaeufigkeitFarbe[farbe]++;
//			alert("res: " + farbe + "=" + HaeufigkeitFarbe[farbe]); break;
		}	
	}

	// Werte zählen:
	for(var i=0; i < Hand.length; i++) {
		if(Hand[i] != null) {
			var val = Hand[i]["Wert"];
			HaeufigkeitWert[val]++;
//			alert("res: " + val + "=" + HaeufigkeitWert[val]); break;
		}
	}
	
	// Paare etc. suchen und zählen:
	var wertPair1 = "";
	var wertPair2 = "";
	var wertTriple= "";
	var wertQuadruple= "";
	for(var wert in HaeufigkeitWert) {
		if(wertPair1 == "") {
			if(HaeufigkeitWert[wert] == 2)
				wertPair1 = wert;
		} else
		if(wertPair2 == "") {
			if(HaeufigkeitWert[wert] == 2)
				wertPair2 = wert;
		}
		if(HaeufigkeitWert[wert] == 3)
			wertTriple = wert;
		if(HaeufigkeitWert[wert] == 4)
			wertQuadruple = wert;
	}
	
	if(wertPair1 != "")
		ret = "One Pair";
	
	if(wertPair2 != "")
		ret = "Two Pairs";

	if(wertTriple != "")
		ret = "Three of a Kind";

	// Straight
	var sortedHand = new Array();
	sortedHand = Hand; // kopiert Referenzen
	sortedHand.sort(wertVergleich);// sortiert nur die Kopie, nicht das Original
	var straight = -1; // höchster Wert eines Straight

	var i=-1;
	for(i=0; i < ANZAHL_KARTEN; i++) {
		if(sortedHand[i] == null)
			break; // ist KEIN Straight,  denn es sind 5 Karten erforderlich
		var v = wertAlsZahl(sortedHand[i]);
		if(v > straight)
			straight = v;
		else
			break;// ist KEIN Straight
	}
	if(i != ANZAHL_KARTEN)
		straight = -1; // Flag, dass es kein Straight ist
	
	if(straight >= 0)
		ret = "Straight";


	// Flush suchen:
	var farbeFlush = "";
	for(var i=0; i < Farben.length; i++) {
		var farbe = Farben[i];
		if(HaeufigkeitFarbe[farbe] == 5) {
			farbeFlush = farbe;
			ret = "Flush";
			break;
		}
	}
	
	if(wertPair1 != "" && wertTriple != "")
		ret = "Full House";

	if(wertQuadruple != "")
		ret = "Four of a Kind";
	
	// Straight Flush
	if(straight >= 0 && farbeFlush != "")
		ret = "Straight Flush";
	
	// Royal Flush
	if(straight == 12 && farbeFlush != "")
		ret = "Royal Flush";

	return ret;
}


//----------------------------
function Karte_zeigen() {
	if(Wert != "" && Farbe != "") {
		if(KartenIndex == 0) {
			initHand();
			initVerfuegbarkeit();
		}
		if(Karten[Farbe][Wert] == false) {
			document.getElementById("Card" + (KartenIndex+1)).src = "img/Poker-Karte-" + Wert + "-" + Farbe + ".jpg"; // Bild anzeigen

			Karten[Farbe][Wert] = true;
			
			// Karte in "Hand" aufnahmen:
			Hand[KartenIndex] = new Object;
			Hand[KartenIndex]["Farbe"] = Farbe;
			Hand[KartenIndex]["Wert"]  = Wert;
		
			KartenIndex++;
			if(KartenIndex > (ANZAHL_KARTEN-1)) {
				KartenIndex = 0;
			}
			
			var resultat = analysiereHand();
			knotenTextErsetzen("TextAusgabe", resultat);
		} else
			alert("Karte nicht mehr verfügbar: " + Farbe + " " + Wert);
		Wert  = "";
		Farbe = "";
	}
}

//----------------------------
function Farbe_setzen(button) {
	Farbe = button.value;
	Karte_zeigen();
}

//----------------------------
function Wert_setzen(button) {
	Wert = button.value;
	Karte_zeigen();
}
