
# 📺 Samsung TV (Tizen) Installatiehandleiding

Deze handleiding beschrijft stap voor stap hoe je een Tizen-app installeert op een Samsung Smart TV (Tizen 5.0 of hoger).

## 📦 Vereisten

- Samsung Smart TV met Tizen OS 5.0 of hoger
- Laptop of Computer met Windows 10 of hoger
- De tool [Jellyfin2Samsung]([https://developer.samsung.com](https://github.com/PatrickSt1991/Samsung-Jellyfin-Installer/releases/latest))

---

## 🔍 Stap 1: Laptop of computer
1. ![image](https://github.com/user-attachments/assets/128f6580-368f-4099-ac7c-be930a6a42d5)   
Zoek naar Command prompt
2. ![image](https://github.com/user-attachments/assets/06563c6b-80e6-4a10-95b3-680746d4d5f8)   
Open Command prompt
3. ![image](https://github.com/user-attachments/assets/b49e8ede-8f77-48e8-9290-7224d4a834c1)   
In Command prompt typ het command  `ipconfig`
4. ![image](https://github.com/user-attachments/assets/83978fe6-e9a8-483f-8f73-8fb78b372ebb)   
Schrijf dit IP adres ergens op, je bent het later nodig bij stap 2


## 🔧 Stap 2: Ontwikkelaarsmodus inschakelen op je TV

1. Zet je TV aan.
2. Open de Smart Hub.
3. Selecteer **Apps**.
4. Gebruik de afstandsbediening om `1 2 3 4 5` in te voeren (snel achter elkaar).
5. Het **Developer Mode** scherm verschijnt.
6. Zet **Developer Mode** op **ON**.
7. Vul het IP-adres van je PC in wat je in stap 1 hebt opgeschreven.
8. Herstart je TV.

---

## 🔌 Stap 3: Installeren van de app op je TV

1. Ga naar de [ClubInfoViewer](https://github.com/PatrickSt1991/Sportlink.Club.Info.Viewer/releases/latest) en download de meest recente WGT file.
2. Download de tool [Jellyfin2Samsung]([https://developer.samsung.com](https://github.com/PatrickSt1991/Samsung-Jellyfin-Installer/releases/latest)).
3. Pak het zip bestand uit en open Samsung-Jellyfin-Installer.exe
4. Windows Defender zal een melding geven maar klik op **meer info** en vervolgens op **toch uitvoeren**. (De applicatie heeft geen certificaat want het is open-source en gratis en certificaten zijn duur)
5. Wanneer je de Stap 2 stappen goed hebt gedaan zal je TV verschijnen in de lijst van Select TV
   ![image](https://github.com/user-attachments/assets/bc0075ce-8890-4290-907b-b259f1647aea)   
6. Klik nu rechts onderin op het tandwiel
7. ![image](https://github.com/user-attachments/assets/020af177-d8c6-4857-b471-89b8d765c130)   
   Klik bij de regel Custom WGT op het foldertje en kies dan de WGT file die je gedownload hebt.
8. ![image](https://github.com/user-attachments/assets/8ba2a33e-1d9e-423b-9733-e6629a286b22)   
   Daarna kan je het Instellingen venster sluiten en klik je op
9. ![image](https://github.com/user-attachments/assets/777a7168-377c-4a06-a2c5-37f21359a35e)   
   Klik op de knop Download & Install

---

## 📝 Opmerkingen

- Zorg ervoor dat je TV niet automatisch wordt uitgeschakeld tijdens ontwikkeling.
- Nieuwe Samsung TVs vereisen een Samsung Account, die kun je hier aanmaken [Samsung Account](https://v3.account.samsung.com/dashboard/intro)
- Vragen en/of problemen ga eerst naar de [Wiki](https://github.com/PatrickSt1991/Samsung-Jellyfin-Installer/wiki) of maak een Issue aan, of mail mij rechtstreeks
