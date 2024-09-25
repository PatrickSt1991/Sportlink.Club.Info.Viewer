# Sportlink Club Info Viewer

## Overview

The **Match Results Viewer** is a Vue.js application that provides users with real-time information about upcoming matches over the next week. Built using **Vue 3** and **Vite**, this app fetches match data from an external API and displays it in a user-friendly interface. The app allows sports enthusiasts, team members, and fans to stay updated on match schedules, team lineups, and more.

## Features

- **Real-time Data Fetching**: Automatically retrieves match schedules for the next 7 days.
- **Responsive Design**: Adapts to various screen sizes for an optimal viewing experience on desktops, tablets, and mobile devices.
- **User Notifications**: Displays loading messages and error alerts to keep users informed about the data retrieval status.
- **Scrolling Match Information**: Automatically scrolls through match information for easy viewing.
- **Fallbacks**: Provides default club logos in case specific team logos are unavailable.

## Installation

To set up this project locally, follow these steps:

1. **Clone the repository**:
   ```bash
   git clone <repository-url>
   cd match-results-viewer

2. **Install dependencies**:
    npm install

3. **Run the development server:**:
    npm run dev

4. **Open your browser and navigate to http://localhost:5173 (or the specified port in the terminal) to view the application.**

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
- MatchInfo: https://data.sportlink.com/programma?gebruiklokaleteamgegevens=NEE&aantaldagen=7&eigenwedstrijden=JA&thuis=JA&uit=JA&client_id=iLqhgc5Npa
- MatchResults: https://data.sportlink.com/uitslagen?gebruiklokaleteamgegevens=NEE&thuis=JA&uit=JA&client_id=iLqhgc5Npa
- PreMatchInfo: https://data.sportlink.com/programma?gebruiklokaleteamgegevens=NEE&eigenwedstrijden=JA&thuis=JA&uit=NEE&client_id=iLqhgc5Npa

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

This project is licensed under the MIT License - see the [LICENSE](https://github.com/PatrickSt1991/match-info-app/tree/main) file for details.

## Acknowledgements

 - Thanks to the Vue.js and Vite communities for their resources and support.
 - Special thanks to the data providers for the sports data API.

## Contact

For questions or feedback, please reach out to via an issue.
