# Likelihood Calculator

[![License: LGPL v2.1](https://img.shields.io/badge/License-LGPL%20v2.1-blue.svg)](https://www.gnu.org/licenses/old-licenses/lgpl-2.1)

---

## Foreword

*Why does this even exist*

Let me preface this with if anybody that works with me ever brings this up as an example that I over engineer things, I will be annoyed. It's simply not true.

This started as a simple web page to get some very real "gut feel" calculations being used for investor conversations being made in spreadsheets into a copy pastey format for our CRM. (We use [Odoo](https://www.odoo.com) by the way - it's awesome)

I wanted to put the [o1-preview-2024-09-12](https://community.openai.com/t/introducing-openai-o1-preview-new-openai-announcement/937861) model to the test, seeing if I can just use plain english instructions to generate operable code.

This... is (mostly) the result of that.

Clearly - don't make decisions based on the code, the calculations, or really anything here.

Have fun.

### How I talk to the LLM

I generate a markdown file from the repo uing [llm.sh](https://github.com/troykelly/investment-likelihood/blob/main/llm.sh) and then put my instructions above the output of that script. Nothign too tricky.

---

## Table of Contents

- [Introduction](#introduction)
- [Features](#features)
- [Demo](#demo)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Forking the Repository](#forking-the-repository)
  - [Cloning the Repository](#cloning-the-repository)
  - [Hosting on GitHub Pages](#hosting-on-github-pages)
- [Usage](#usage)
  - [Selecting Categories and Profiles](#selecting-categories-and-profiles)
  - [Evaluating Criteria](#evaluating-criteria)
  - [Interpreting Results](#interpreting-results)
- [Customisation](#customisation)
  - [Adding New Categories and Profiles](#adding-new-categories-and-profiles)
  - [Modifying Criteria](#modifying-criteria)
- [Contributing](#contributing)
- [License](#license)
- [Acknowledgments](#acknowledgments)
- [Contact](#contact)

---

## Introduction

The **Likelihood Calculator** is a versatile, web-based application designed to help users assess and enhance their prospects across various domains such as **Investment**, **Health**, **Fitness**, **Travel**, **The Arts**, and more. This tool allows individuals and businesses to evaluate different criteria, input personalised information, and calculate an overall likelihood percentage to guide decision-making.

---

## Features

- **Comprehensive Categories**: Explore multiple areas like Investment, Health, Fitness, Travel, and The Arts.
- **Customisable Calculation Profiles**: Tailor profiles to suit specific needs or create new ones.
- **User-Friendly Interface**: Intuitive design powered by Bootstrap 5 for seamless user experience.
- **Real-Time Calculations**: Immediate feedback on likelihood percentages based on your inputs.
- **Privacy Assurance**: All data is stored locally in your browser; your information remains private and secure.
- **Shareable Reports**: Easily copy and share your results with others or integrate them into your workflow.
- **Open Source**: Distributed under the GNU Lesser General Public License v2.1, encouraging community contributions.

---

## Demo

You can view a live demo of the Likelihood Calculator [here](https://likelihood.tools/).

---

## Getting Started

### Prerequisites

- A modern web browser (Google Chrome, Mozilla Firefox, Safari, etc.)
- A GitHub account (for forking and hosting your own version)

### Forking the Repository

1. **Sign In to GitHub**: Ensure you are logged into your GitHub account.

2. **Fork the Repository**:
   - Navigate to the [Likelihood Calculator repository](https://github.com/troykelly/investment-likelihood).
   - Click on the **Fork** button in the top-right corner of the page.
   - GitHub will create a copy of the repository under your account.

### Cloning the Repository

1. **Clone the Repository**:
   - Open your terminal or command prompt.
   - Run the following command:

     ```bash
     git clone https://github.com/your-username/investment-likelihood.git
     ```

     *Replace `your-username` with your GitHub username.*

2. **Navigate to the Project Directory**:

   ```bash
   cd investment-likelihood
   ```

3. **Open the Project**:
   - You can now open and edit the files using your preferred code editor (e.g., Visual Studio Code, Sublime Text).

### Hosting on GitHub Pages

1. **Navigate to Repository Settings**:
   - Go to your forked repository on GitHub.
   - Click on the **Settings** tab.

2. **Enable GitHub Pages**:
   - Scroll down to the **Pages** section on the left-hand side menu.
   - Under **Source**, select the `main` branch and set the folder to `/docs`.
   - Click **Save**.

3. **Access Your Hosted Application**:
   - After saving, GitHub will provide a URL where your application is hosted, such as `https://your-username.github.io/investment-likelihood/`.
   - It may take a few minutes for the site to become available.

---

## Usage

### Selecting Categories and Profiles

- **Navigate Through Categories**: Use the navigation bar at the top to select from various categories like Investment, Health, Fitness, etc.
- **Choose a Profile**: Within each category, select a calculation profile that best suits your needs.

### Evaluating Criteria

- **Enter Personal or Business Information**: Adjust the sliders for each criterion based on your specific situation.
- **Understand Descriptors**: As you adjust the sliders, descriptors provide contextual feedback to guide your selection.
- **Weights and Warnings**: The criteria weights are adjusted to total 100%. A warning will appear if they do not.

### Interpreting Results

- **Percentage Likelihood**: View your overall likelihood score prominently displayed.
- **Breakdown Table**: Examine how each criterion contributes to your total score.
- **Pie Chart**: Visualise your results with an interactive pie chart.
- **Copy Results**: Use the "Copy Results to Clipboard" button to save and share your outcomes.

---

## Customisation

### Adding New Categories and Profiles

The application uses a `profiles.json` file to load categories and calculation profiles. You can add new categories or profiles by editing this file.

1. **Open `profiles.json`**:
   - Locate the `profiles.json` file in the `docs` directory.

2. **Add a New Category**:
   - Structure your new category as follows:

     ```json
     {
       "name": "Your Category Name",
       "slug": "your-category-slug",
       "description": "Description of the category",
       "icon": "fas fa-icon-name",
       "weight": 1,
       "savename": "Entity",
       "profiles": [
         // Add profiles here
       ]
     }
     ```

3. **Add a New Profile**:

   ```json
   {
     "name": "Your Profile Name",
     "icon": "fas fa-icon-name",
     "criteria": [
       // Add criteria here
     ]
   }
   ```

### Modifying Criteria

1. **Edit Criteria**:
   - Within a profile, add or modify criteria:

     ```json
     {
       "metric": "Criterion Name",
       "description": "Detailed description of the criterion.",
       "weight": 20,
       "icon": "fas fa-icon-name",
       "scoreDescriptors": {
         "1": "Descriptor for score 1",
         "2": "Descriptor for score 2",
         "3": "Descriptor for score 3",
         "4": "Descriptor for score 4",
         "5": "Descriptor for score 5"
       }
     }
     ```

2. **Ensure Valid Weights**:
   - Confirm that the total weights of all criteria in a profile equal **100**.

3. **Save Changes**:
   - After editing, save the `profiles.json` file.
   - Commit and push the changes to your repository if hosting via GitHub Pages.

---

## Contributing

Contributions are welcomed and encouraged! You can contribute by:

- Adding new categories or profiles.
- Enhancing existing functionality.
- Improving documentation.
- Providing translations.

### How to Contribute

1. **Fork the Repository**:
   - Click the **Fork** button at the top-right corner of the repository page.

2. **Create a New Branch**:

   ```bash
   git checkout -b feature/your-feature-name
   ```

3. **Make Your Changes**:
   - Implement your enhancements or additions.

4. **Commit Changes**:

   ```bash
   git add .
   git commit -m "Add new feature: [Your Feature Name]"
   ```

5. **Push to GitHub**:

   ```bash
   git push origin feature/your-feature-name
   ```

6. **Create a Pull Request**:
   - Navigate to your forked repository.
   - Click on **Compare & pull request**.
   - Provide a descriptive title and description.
   - Submit the pull request.

---

## License

The Likelihood Calculator is licensed under the **GNU Lesser General Public License v2.1**.

This means you can redistribute and/or modify the software under certain conditions. The full license text can be found in the [LICENSE](LICENSE) file.

[Read the GNU LGPL v2.1 License](https://www.gnu.org/licenses/old-licenses/lgpl-2.1.en.html)

---

## Acknowledgments

- **Bootstrap**: For the responsive and sleek front-end framework.
- **Font Awesome**: For the extensive icon library enhancing the user interface.
- **Chart.js**: For the interactive and informative charts.
- **Community Contributors**: Thank you to everyone who has contributed to this project by adding profiles, fixing issues, or improving documentation.

---

## Contact

**Author**: Troy Kelly  
**Email**: [troy@aperim.com](mailto:troy@aperim.com)  
**Website**: [https://troykelly.com/](https://troykelly.com/)  
**GitHub**: [@troykelly](https://github.com/troykelly)

Feel free to reach out if you have any questions, suggestions, or feedback. Your input is highly valued!

---

*This README was last updated on Thursday, 19 September 2024.*