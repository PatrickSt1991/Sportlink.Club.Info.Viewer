# 🏟️ ClubInfoBoard

![Support Ukraine](https://img.shields.io/badge/Support-Ukraine-FFD500?style=flat&labelColor=005BBB)

Welkom bij **ClubInfoBoard** – dé oplossing voor sportverenigingen om wedstrijdinformatie real-time en overzichtelijk te tonen op schermen binnen de club, zoals in de kantine of op een Smart TV.   
Neem een kijkje in de [online versie](https://patrickst1991.github.io/Sportlink.Club.Info.Viewer/#/settings)
---

## ⚙️ Wat is ClubInfoBoard?

**ClubInfoBoard** is een moderne webapplicatie, gebouwd met Vue 3 en Vite. De applicatie haalt automatisch sportgegevens op en presenteert deze visueel aantrekkelijk op schermen. Denk aan:

- 🗓️ **Komende wedstrijden**
- ✅ **Uitslagen**
- 🧾 **Wedstrijdinformatie**, inclusief kleedkamer- en veldindeling (voor de komende 3 uur)

De app is geoptimaliseerd voor gebruik op Smart TV's, tablets én computers of laptops – ideaal voor elk scherm binnen uw vereniging!

---

## 🚀 Belangrijkste functies

- **Automatische verversing**  
  Gegevens worden periodiek opgehaald en bijgewerkt, volledig automatisch.

- **Responsief ontwerp**  
  Werkt naadloos op grote schermen én mobiele apparaten.

- **Automatisch scrollende weergave**  
  Lange lijsten met informatie worden soepel gescrold.

- **Fallback voor teamlogo's**  
  Indien een specifiek teamlogo ontbreekt, wordt het standaard clublogo getoond.

- **Volledig configureerbaar**  
  Van weergave-opties en huisstijl tot data-instellingen – alles is naar wens aan te passen.  
  👉 Zie [Instellingen](./settings.md) voor een compleet overzicht van alle opties.

---

## 🔓 Beschikbare versies

**ClubInfoBoard** is beschikbaar in vier vormen, afhankelijk van jouw voorkeur:

---

### 🌐 Online (gehoste versie)

Gebruik de [online versie](https://patrickst1991.github.io/Sportlink.Club.Info.Viewer/) direct in je browser.  
✅ Altijd up-to-date  
✅ Geen installatie nodig  
❌ Geen offline ondersteuning  

---

### 🖥️ On-premise (eigen hosting)

Host de applicatie zelf op je server of Raspberry Pi.  
📦 [Download de nieuwste versie (.zip)](https://github.com/PatrickSt1991/Sportlink.Club.Info.Viewer/releases/latest)  
🛠️ Pak het zip-bestand uit en plaats `index.html` en de `assets`-map op je webserver.  
✅ Volledige controle over hosting en configuratie  
❌ Geen automatische updates  
🚧 Beperkte offline ondersteuning  

### 📺 Samsung Smart TV-app (Tizen)

Installeer de app rechtstreeks op een Samsung Smart TV.  
📦 [Download de nieuwste versie (.wgt)](https://github.com/PatrickSt1991/Sportlink.Club.Info.Viewer/releases/latest)  
📖 [Bekijk de installatiehandleiding](https://github.com/PatrickSt1991/Sportlink.Club.Info.Viewer/blob/main/docs/tizen_install.md)  
✅ Native ervaring op TV  
❌ Geen automatische updates  
🚧 Beperkte offline ondersteuning  

### 🧱 Zelf bouwen (ontwikkelaarsoptie)

Kloon de repository en bouw je eigen versie van de app.  
🔗 [Bekijk de broncode op GitHub](https://github.com/PatrickSt1991/Sportlink.Club.Info.Viewer)  
🛠️ Benodigdheden: Node.js, npm, en een build tool Vite
📦 Bouw de app met het build-commando (`npm run build`)  
✅ Volledige controle over de code en features  
❌ Technische kennis vereist  

---

## 🆓 Kosten & Licentie

**ClubInfoBoard is volledig gratis** en beschikbaar onder de **MIT-licentie**.  
Iedereen kan de software gebruiken en aanpassen naar eigen wensen.
[![ko-fi](https://ko-fi.com/img/githubbutton_sm.svg)](https://ko-fi.com/M4M71JOT9R)

---

## 🔐 Ondersteunde gegevensbronnen

De applicatie ondersteunt meerdere methoden om sportgegevens op te halen:

| Methode             | Beschrijving                                                                 | Toegang         |
|---------------------|------------------------------------------------------------------------------|-----------------|
| **Sportlink API**   | Koppeling via Sportlink Club.DataService                                     | **Betaald**     |
| **Sportlink Proxy** | Inloggen met gebruikersnaam en wachtwoord, zoals bij de Voetbal.nl app       | **Gratis**      |
| **Nevobo Proxy**    | Publieke data, geen inlog vereist                                            | **Gratis**      |

Meer uitleg over het instellen van deze gegevensbronnen vindt u op de [instellingenpagina](./settings.md),  
of neem een kijkje bij de [voorbeelden](./preview.md) voor een visuele indruk van de mogelijkheden.

---

Veel plezier met het gebruik van **ClubInfoBoard**! 🎉
