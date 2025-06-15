# 🏟️ ClubInfoBoard

Welkom bij **ClubInfoBoard** – dé oplossing voor sportverenigingen om wedstrijdinformatie real-time en overzichtelijk te tonen op schermen binnen de club, zoals in de kantine of op een Smart TV.

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

**ClubInfoBoard** is op drie manieren te gebruiken:

### 🌐 Online (gehoste versie)
De [online versie](https://patrickst1991.github.io/Sportlink.Club.Info.Viewer/) is direct beschikbaar in de browser.  
✅ Automatische updates  
✅ Werkt zonder installatie  

### 🖥️ On-premise (eigen hosting)  
Host de applicatie zelf op je eigen server of Raspberry Pi.  
📦 [Download de meest recente versie](https://github.com/PatrickSt1991/Sportlink.Club.Info.Viewer/releases/latest)  
✅ Volledige controle over hosting en configuratie  
❌ Geen automatische updates beschikbaar  


### 📺 Tizen (Samsung Smart TV-app) 
De Tizen-app kan direct op een Smart TV worden geïnstalleerd.  
📦 [Download de meest recente versie](https://github.com/PatrickSt1991/Sportlink.Club.Info.Viewer/releases/latest)  
✅ Eenmalige installatie  
❌ Geen automatische updates

---

## 🆓 Kosten & Licentie

**ClubInfoBoard is volledig gratis** en beschikbaar onder de **MIT-licentie**.  
Iedereen kan de software gebruiken en aanpassen naar eigen wensen.

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
