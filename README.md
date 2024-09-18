# Investment Likelihood Calculator

[![License: LGPL v2.1](https://img.shields.io/badge/License-LGPL%20v2.1-blue.svg)](https://www.gnu.org/licenses/old-licenses/lgpl-2.1)

The Investment Likelihood Calculator is a web-based application designed to help entrepreneurs and businesses assess the likelihood of securing investment based on various criteria. This tool allows users to evaluate different metrics, select scores, and calculate an overall likelihood percentage. It is fully customisable, enabling users to add or modify calculation profiles and criteria to suit specific needs.

Hosted using [GitHub Pages](https://pages.github.com/), the application is easily accessible and can be customised through forking and personalisation.

---

## Table of Contents

- [Features](#features)
- [Demo](#demo)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Forking the Repository](#forking-the-repository)
  - [Cloning the Repository](#cloning-the-repository)
  - [Hosting on GitHub Pages](#hosting-on-github-pages)
- [Customisation](#customisation)
  - [Adding Calculation Profiles](#adding-calculation-profiles)
  - [Modifying Criteria](#modifying-criteria)
  - [Custom Domain](#custom-domain)
- [Contributing](#contributing)
  - [Submitting Profiles via Pull Requests](#submitting-profiles-via-pull-requests)
- [License](#license)
- [Contact](#contact)

---

## Features

- **User-Friendly Interface**: Leveraging Bootstrap 5 for a responsive and clean design.
- **Multiple Calculation Profiles**: Supports different profiles to cater to various industries or investment types.
- **Customisable Criteria**: Easily modify criteria and weights by editing a JSON file.
- **Interactive Tooltips**: Provides detailed descriptions for each metric using tooltips.
- **Real-Time Calculations**: Calculates total scores and likelihood percentages instantly.
- **Accessible**: Designed with accessibility in mind, ensuring compatibility with assistive technologies.
- **Open Source**: Distributed under the GNU Lesser General Public License v2.1.

---

## Demo

You can view a live demo of the Investment Likelihood Calculator [here](https://troykelly.github.io/investment-likelihood/).

*Note: Replace `troykelly` with your GitHub username if you've forked the repository.*

---

## Getting Started

### Prerequisites

- A web browser (Google Chrome, Mozilla Firefox, Safari, etc.)
- A GitHub account (for forking and hosting your own version)

### Forking the Repository

To create your own copy of the Investment Likelihood Calculator:

1. **Sign In to GitHub**: Ensure you are logged into your GitHub account.

2. **Fork the Repository**:
   - Navigate to the [Investment Likelihood Calculator repository](https://github.com/troykelly/investment-likelihood).
   - Click on the **Fork** button in the top-right corner of the page.
   - GitHub will create a copy of the repository under your account.

### Cloning the Repository

To make changes to the code locally:

1. **Clone the Repository**:
   - Open your terminal or command prompt.
   - Run the following command:

     ```bash
     git clone https://github.com/troykelly/investment-likelihood.git
     ```

2. **Navigate to the Project Directory**:

   ```bash
   cd investment-likelihood
   ```

3. **Open the Project**:
   - You can now open and edit the files using your preferred code editor (e.g., Visual Studio Code, Sublime Text).

### Hosting on GitHub Pages

After forking the repository, you can host your own version using GitHub Pages:

1. **Navigate to Repository Settings**:
   - Go to your forked repository on GitHub.
   - Click on the **Settings** tab.

2. **Enable GitHub Pages**:
   - Scroll down to the **Pages** section on the left-hand side menu.
   - Under **Source**, select the `main` branch and set the folder to `/docs (docs)`.
   - Click **Save**.

3. **Access Your Hosted Application**:
   - After saving, GitHub will provide a URL where your application is hosted, such as `https://troykelly.github.io/investment-likelihood/`.
   - It may take a few minutes for the site to become available.

---

## Customisation

### Adding Calculation Profiles

The application uses a `profiles.json` file to load calculation profiles. You can add new profiles by editing this file.

1. **Open `profiles.json`**:
   - Locate the `profiles.json` file in the project directory.

2. **Add a New Profile**:
   - Structure your new profile as shown below:

     ```json
     {
       "name": "Your Profile Name",
       "criteria": [
         {
           "metric": "Metric Name",
           "description": "Detailed description of the metric.",
           "weight": 20
         },
         // Add more criteria as needed
       ]
     }
     ```

   - Ensure that the sum of the `weight` values for all criteria in a profile equals **100**.

3. **Example**:

   ```json
   {
     "profiles": [
       {
         "name": "Default Profile",
         "criteria": [
           // ... existing criteria
         ]
       },
       {
         "name": "Environmental Impact Profile",
         "criteria": [
           {
             "metric": "Sustainability",
             "description": "Assesses the environmental sustainability of the project.",
             "weight": 30
           },
           {
             "metric": "Carbon Footprint",
             "description": "Measures the carbon footprint associated with the project.",
             "weight": 25
           },
           {
             "metric": "Resource Efficiency",
             "description": "Evaluates how efficiently resources are utilised.",
             "weight": 25
           },
           {
             "metric": "Regulatory Compliance",
             "description": "Checks compliance with environmental regulations.",
             "weight": 20
           }
         ]
       }
     ]
   }
   ```

4. **Save Changes**:
   - Save the `profiles.json` file after making your changes.
   - If hosting via GitHub Pages, commit and push the changes to your repository.

### Modifying Criteria

You can modify existing criteria within profiles:

1. **Edit Criteria**:
   - In the `profiles.json` file, locate the profile and criterion you wish to modify.
   - Change the `metric`, `description`, or `weight` as needed.

2. **Ensure Valid Weights**:
   - After modifications, confirm that the total weight equals **100** for each profile.

### Custom Domain

If you wish to use a custom domain for your hosted application:

1. **Configure DNS**:
   - Set up a CNAME record with your domain registrar pointing to `YOUR_USERNAME.github.io`. (use your username if you are forking)

2. **Add `CNAME` File**:
   - In your repository, create a file named `CNAME` (no file extension).
   - Add your custom domain name inside the file, e.g.:

     ```
     www.yourcustomdomain.com
     ```

3. **Update GitHub Pages Settings**:
   - In the repository settings under **Pages**, specify your custom domain.

---

## Contributing

Contributions are welcome! You can contribute by adding new calculation profiles, enhancing functionality, or improving documentation.

### Submitting Profiles via Pull Requests

If you have created a new calculation profile that you believe would benefit others:

1. **Fork the Repository**:
   - If you haven't already, fork the repository to your GitHub account.

2. **Create a New Branch**:

   ```bash
   git checkout -b new-profile-name
   ```

3. **Add Your Profile**:
   - Edit the `profiles.json` file and add your new profile.
   - Ensure that the profile is properly formatted and that the weights sum to 100.

4. **Commit Changes**:

   ```bash
   git add profiles.json
   git commit -m "Add new calculation profile: [Profile Name]"
   ```

5. **Push to GitHub**:

   ```bash
   git push origin new-profile-name
   ```

6. **Create a Pull Request**:
   - Go to your forked repository on GitHub.
   - Click on **Compare & pull request**.
   - Provide a descriptive title and commentary for your pull request.
   - Submit the pull request.

7. **Review**:
   - Your pull request will be reviewed, and any feedback or requested changes will be communicated.

---

## License

The Investment Likelihood Calculator is licensed under the **GNU Lesser General Public License v2.1**.

This means you can redistribute and/or modify the software under certain conditions. The full license text can be found in the [LICENSE](LICENSE) file.

[Read the GNU LGPL v2.1 License](https://www.gnu.org/licenses/old-licenses/lgpl-2.1.en.html)

---

## Contact

**Author**: Troy Kelly  
**Email**: [troy@aperim.com](mailto:troy@aperim.com)  
**GitHub**: [@troykelly](https://github.com/troykelly)

If you have any questions, suggestions, or issues, feel free to contact me.

---

*This README was last updated on Wednesday, 18 September 2024.*