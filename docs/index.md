# 🏟️ ClubInfoBoard

Welkom bij **ClubInfoBoard** – dé oplossing voor sportverenigingen om wedstrijdinformatie real-time en overzichtelijk te tonen op schermen binnen de club, zoals in de kantine of op een Smart TV.

---

## ⚙️ Wat is ClubInfoBoard?

**ClubInfoBoard** is een moderne webapplicatie, gebouwd met Vue 3 en Vite. De applicatie haalt automatisch sportgegevens op en presenteert deze visueel aantrekkelijk op schermen. Denk aan:

- 🗓️ **Komende wedstrijden**
- ✅ **Uitslagen**
- 🧾 **Wedstrijdinformatie**, inclusief kleedkamer- en veldindeling (voor de komende 3 uur)

De app is geoptimaliseerd voor gebruik op Smart TVs, tablets en andere displays binnen sportaccommodaties.

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

- **Configuratie op maat**  
  Stel eenvoudig parameters in zoals het aantal getoonde dagen of de startweergave.

- **Styling op maat**  
  Pas eenvoudig de kleuren aan zodat de weergave perfect aansluit bij de huisstijl van de club. Ook is het mogelijk om een eigen achtergrondafbeelding in te stellen.

- **Sponsoring**  
  Voeg sponsors toe die automatisch zichtbaar worden in de lay-out.

---

## 🔓 Beschikbare versies

**ClubInfoBoard** is op drie manieren te gebruiken:

### 🌐 Online (gehoste versie)
De [online versie](https://patrickst1991.github.io/Sportlink.Club.Info.Viewer/) is direct beschikbaar in de browser.  
✅ Automatische updates  
✅ Werkt zonder installatie  

### 🖥️ On-premise (eigen hosting)
Host de applicatie zelf op een eigen server of Raspberry Pi.  
❌ Geen automatische updates  
✅ Volledige controle over hosting en configuratie  

### 📺 Tizen (Samsung Smart TV-app) *(in ontwikkeling)*
De [Tizen-app](https://github.com/PatrickSt1991/Sportlink.Club.Info.Viewer.Tizen) kan direct op een Smart TV worden geïnstalleerd.  
⚠️ Let op: de huidige versie is verouderd en bevat nog een oude build.  
✅ Eenmalige installatie  
❌ Geen automatische updates

---

## 🆓 Kosten & Licentie

**ClubInfoBoard is volledig gratis** en beschikbaar onder de **MIT-licentie**.  
Iedereen kan de software gebruiken en aanpassen naar eigen wensen.

---

## 🔐 Ondersteunde gegevensbronnen

De applicatie ondersteunt meerdere methoden om sportgegevens op te halen:

- **Sportlink API**  
  Vereist een Client ID vanuit Sportlink.

- **Sportlink Proxy**  
  Vereist e-mailadres en wachtwoord van een bestaand Sportlink-account.  
  _Er is ook een optie om ingebouwde gegevens (fake credentials) te gebruiken._

- **Nevobo Proxy**  
  Vereist een Identifier (clubcode) van jouw volleybalvereniging zoals geregistreerd bij Nevobo.

---

Veel plezier met het gebruik van **ClubInfoBoard**! 🎉
