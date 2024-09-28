# Sportlink Club Info Viewer

## Overview

The **Sportlink Club Info Viewer** is a Vue.js application that provides users with real-time information about upcoming matches over the next week, match results over the last week and pre match information containing information of the dressing room and field to play. Built using **Vue 3** and **Vite**, this app fetches match data from an external (Sportlink) API and displays it in a user-friendly interface. The app allows sports enthusiasts, team members, and fans to stay updated on match schedules, and more.

## Disclaimer
This version isn't currently active at my old soccer club, cause I don't play there anymore but it could be easly implemented there and for any other soccer club or and other sports club that fetches information from Sportlink API

Please bear in mind, the API's called are with the clientId of my previous soccer club, you will need to replace that for your own to get the correct data.

Our Samsung Smart TVs were to old to handle Vue3 + Vite so I've backed it into a [Sportlink Club Info Viewer Tizen app](
https://github.com/PatrickSt1991/Sportlink.Club.Info.Viewer.Tizen/tree/main) that way it can pull the required resources and still work.

## Features

- **Real-time Data Fetching**: Automatically retrieves match schedules for the next 7 days for match program information, past 7 days for match results information and next three hours for post match information.
- **Responsive Design**: Adapts to various screen sizes for an optimal viewing experience on desktops, tablets, and mobile devices.
- **User Notifications**: Displays loading messages and error alerts to keep users informed about the data retrieval status.
- **Scrolling Match Information**: Automatically scrolls through match information for easy viewing.
- **Fallbacks**: Provides default club logos in case specific team logos are unavailable.

## Installation

To set up this project locally, follow these steps:

1. **Clone the repository**:
   ```bash
   git clone https://github.com/PatrickSt1991/Sportlink.Club.Info.Viewer.git
   cd Sportlink.Club.Info.Viewer

2. **Install dependencies**:
   ```bash
    npm install

 3. Change the settings in config.js
    - BASE_URL -> Should be empty if you want to run it in the Tizen app
    - CLIENT_ID -> Should be the clientId of your club
    - PROGRAMMA_DAGEN -> Used for MatchInfo, shows the amount of days ahead for upcomming matches
    - UITSLAG_DAGEN -> Used for MatchResults, shows the amount of days in the past for match results
    - HOMESCREEN -> Used for what screen should be visable if you go to http://localhost

4. **Run the development server:**:
   ```bash
    npm run dev

5. **Open your browser and navigate to http://localhost:5173 (or the specified port in the terminal) to view the application.**

## Usage

Upon launching the application, the main screen will display the upcoming match schedules for the next week. Users can view:

 - Match date and time
 - Home and away team details
 - Competition type (e.g., league, cup, friendly)

If there are no matches scheduled or if an error occurs during data fetching, appropriate messages will be displayed to the user.

## Example Workflow

 1. Loading State: While the app fetches match data, a loading message will be displayed.
 2. 2Data Display: Once the data is loaded, matches will be displayed in a scrollable list.
 3. Error Handling: If an error occurs, the app will inform users about the issue and suggest possible actions.

## Technology Stack

 - Vue 3: A progressive JavaScript framework for building user interfaces.
 - Vite: A build tool that significantly improves the development experience.
 - JavaScript: The primary programming language used for application logic.

## API Reference

The application fetches match data from the following endpoints:
- [MatchInfo - Sportlink API with client_id](https://data.sportlink.com/programma?gebruiklokaleteamgegevens=NEE&aantaldagen=7&eigenwedstrijden=JA&thuis=JA&uit=JA&client_id=iLqhgc5Npa)
- [MatchResults - Sportlink API with client_id](https://data.sportlink.com/uitslagen?gebruiklokaleteamgegevens=NEE&thuis=JA&uit=JA&client_id=iLqhgc5Npa)
- [PreMatchInfo - Sportlink API with client_id](https://data.sportlink.com/programma?gebruiklokaleteamgegevens=NEE&eigenwedstrijden=JA&thuis=JA&uit=NEE&client_id=iLqhgc5Npa)

## Data Structure

The API response includes the following fields for each match:

 - wedstrijddatum: The date and time of the match.
 - thuisteam: Name of the home team.
 - uitteam: Name of the away team.
 - competitiesoort: Type of competition.
 - thuisteamclubrelatiecode: Code for the home team's logo.
 - uitteamclubrelatiecode: Code for the away team's logo.

## Contributing

Contributions are welcome! If you have suggestions or improvements, please create a pull request or open an issue.

## License

This project is licensed under the MIT License - see the [LICENSE](/LICENSE) file for details.

## Acknowledgements

 - Thanks to the Vue.js and Vite communities for their resources and support.
 - Special thanks to the data providers for the sports data API.

## Contact

For questions or feedback, please reach out to via an issue.

## Screenshots
![Screenshot of the PreMatch Section.](/.screenshots/PreMatchInfo.png)
![Screenshot of the comming matches](/.screenshots/matchProgram.png)
![Screenshot of the match results](/.screenshots/matchResults.png)
