/**
 * Filename: app.js
 * Purpose: Provides functionality for the Investment Likelihood Calculator with investor management and copy to clipboard.
 * Description: This script allows users to create investors, save and load their inputs locally, and copy results to clipboard.
 * Author: Troy Kelly
 * Contact: troy@aperim.com
 * Code history:
 * - Initial creation: 18 September 2024
 * - Bootstrap integration: 18 September 2024
 * - Added local storage and copy functionality: 18 September 2024
 */

'use strict';

/**
 * Investment Likelihood Calculator Application
 * Provides the functionality to load calculation profiles,
 * manage investors, save inputs locally, and copy results to clipboard.
 */
class InvestmentLikelihoodCalculator {
    /**
     * Create the calculator.
     */
    constructor() {
        /** @type {!Array<!Object>} */
        this.profiles = [];
        /** @type {?HTMLSelectElement} */
        this.profileSelect = /** @type {?HTMLSelectElement} */ (document.getElementById('profileSelect'));
        /** @type {?HTMLElement} */
        this.criteriaTableBody = document.querySelector('#criteriaTable tbody');
        /** @type {?HTMLElement} */
        this.totalScoreElement = document.getElementById('totalScore');
        /** @type {?HTMLElement} */
        this.percentageLikelihoodElement = document.getElementById('percentageLikelihood');
        /** @type {?HTMLButtonElement} */
        this.calculateButton = /** @type {?HTMLButtonElement} */ (document.getElementById('calculateButton'));
        /** @type {?HTMLButtonElement} */
        this.copyButton = /** @type {?HTMLButtonElement} */ (document.getElementById('copyButton'));
        /** @type {?HTMLSelectElement} */
        this.investorSelect = /** @type {?HTMLSelectElement} */ (document.getElementById('investorSelect'));
        /** @type {?HTMLButtonElement} */
        this.newInvestorButton = /** @type {?HTMLButtonElement} */ (document.getElementById('newInvestorButton'));
        /** @type {?HTMLButtonElement} */
        this.deleteInvestorButton = /** @type {?HTMLButtonElement} */ (document.getElementById('deleteInvestorButton'));
        /** @type {?HTMLElement} */
        this.investorListElement = document.getElementById('investorList');

        // Bind event handlers
        this.handleProfileChange = this.handleProfileChange.bind(this);
        this.handleCalculate = this.handleCalculate.bind(this);
        this.handleCopy = this.handleCopy.bind(this);
        this.handleNewInvestor = this.handleNewInvestor.bind(this);
        this.handleInvestorChange = this.handleInvestorChange.bind(this);
        this.handleDeleteInvestor = this.handleDeleteInvestor.bind(this);

        // Initialize the app
        this.init();
    }

    /**
     * Initialise the application.
     */
    init() {
        this.loadProfiles()
            .then(() => {
                this.populateProfileSelect();
                this.profileSelect.addEventListener('change', this.handleProfileChange);
                this.calculateButton.addEventListener('click', this.handleCalculate);
                this.copyButton.addEventListener('click', this.handleCopy);
                this.newInvestorButton.addEventListener('click', this.handleNewInvestor);
                this.investorSelect.addEventListener('change', this.handleInvestorChange);
                this.deleteInvestorButton.addEventListener('click', this.handleDeleteInvestor);
                // Load investors from local storage
                this.loadInvestors();
                // Load the first profile by default
                this.displayCriteria(this.profiles[0]);
            })
            .catch((error) => {
                console.error('Error initialising the application:', error);
                alert('Failed to initialise the application. Please try again later.');
            });
    }

    /**
     * Load calculation profiles from the JSON file.
     * @return {!Promise<void>}
     */
    async loadProfiles() {
        try {
            const response = await fetch('profiles.json');
            if (!response.ok) {
                throw new Error('Network response was not ok ' + response.statusText);
            }
            const data = await response.json();
            this.profiles = data.profiles;
        } catch (error) {
            console.error('Error loading profiles:', error);
            alert('Failed to load calculation profiles. Please try again later.');
            throw error;
        }
    }

    /**
     * Populate the profile select dropdown with loaded profiles.
     */
    populateProfileSelect() {
        this.profiles.forEach((profile, index) => {
            const option = document.createElement('option');
            option.value = index.toString();
            option.textContent = profile.name;
            this.profileSelect.appendChild(option);
        });
    }

    /**
     * Handle profile selection change event.
     */
    handleProfileChange() {
        const selectedIndex = parseInt(this.profileSelect.value, 10);
        const selectedProfile = this.profiles[selectedIndex];
        this.displayCriteria(selectedProfile);
        // Load saved inputs if available
        this.loadSavedInputs();
    }

    /**
     * Display criteria for the selected profile.
     * @param {!Object} profile The selected calculation profile.
     */
    displayCriteria(profile) {
        // Clear existing criteria
        while (this.criteriaTableBody.firstChild) {
            this.criteriaTableBody.removeChild(this.criteriaTableBody.firstChild);
        }

        // Populate criteria table
        profile.criteria.forEach((criterion, index) => {
            const row = document.createElement('tr');

            // Metric
            const metricCell = document.createElement('td');
            metricCell.textContent = criterion.metric;
            row.appendChild(metricCell);

            // Description with tooltip
            const descriptionCell = document.createElement('td');
            const descriptionLink = document.createElement('a');
            descriptionLink.href = '#';
            descriptionLink.setAttribute('data-bs-toggle', 'tooltip');
            descriptionLink.setAttribute('title', criterion.description);
            descriptionLink.textContent = criterion.metric;
            descriptionCell.appendChild(descriptionLink);
            row.appendChild(descriptionCell);

            // Initialise Bootstrap tooltip
            const tooltip = new bootstrap.Tooltip(descriptionLink);

            // Weight
            const weightCell = document.createElement('td');
            weightCell.textContent = criterion.weight.toString();
            row.appendChild(weightCell);

            // Score input
            const scoreCell = document.createElement('td');
            const scoreSelect = document.createElement('select');
            scoreSelect.name = 'score_' + index;
            scoreSelect.dataset.weight = criterion.weight.toString();
            scoreSelect.classList.add('form-select');
            for (let i = 1; i <= 5; i++) {
                const option = document.createElement('option');
                option.value = i.toString();
                option.textContent = i.toString();
                scoreSelect.appendChild(option);
            }
            scoreCell.appendChild(scoreSelect);
            row.appendChild(scoreCell);

            this.criteriaTableBody.appendChild(row);
        });

        // Reset results
        this.totalScoreElement.textContent = '0';
        this.percentageLikelihoodElement.textContent = '0%';

        // Load saved inputs if available
        this.loadSavedInputs();
    }

    /**
     * Handle calculate button click event.
     */
    handleCalculate() {
        try {
            const scores = this.getScores();
            const weightedScores = this.calculateWeightedScores(scores);
            const totalScore = this.calculateTotalScore(weightedScores);
            const percentageLikelihood = (totalScore / 100) * 100;

            // Display results
            this.totalScoreElement.textContent = totalScore.toFixed(2);
            this.percentageLikelihoodElement.textContent = percentageLikelihood.toFixed(2) + '%';

            // Save inputs and results
            this.saveInputsAndResults();
        } catch (error) {
            console.error('Error calculating scores:', error);
            alert('An error occurred during calculation. Please check your inputs and try again.');
        }
    }

    /**
     * Get scores input by the user.
     * @return {!Array<!Object>}
     */
    getScores() {
        /** @type {!NodeListOf<!HTMLSelectElement>} */
        const scoreSelects = /** @type {!NodeListOf<!HTMLSelectElement>} */ (
            this.criteriaTableBody.querySelectorAll('select'));
        const scores = [];
        scoreSelects.forEach((select) => {
            const score = parseInt(select.value, 10);
            const weight = parseFloat(select.dataset.weight);
            scores.push({ score: score, weight: weight });
        });
        return scores;
    }

    /**
     * Calculate weighted scores for each criterion.
     * @param {!Array<!Object>} scores The scores and weights for each criterion.
     * @return {!Array<number>}
     */
    calculateWeightedScores(scores) {
        return scores.map((item) => {
            // Formula: weighted_score = ((score - 1) * weight) / 4
            const weightedScore = ((item.score - 1) * item.weight) / 4;
            return weightedScore;
        });
    }

    /**
     * Calculate the total score by summing weighted scores.
     * @param {!Array<number>} weightedScores The weighted scores for each criterion.
     * @return {number}
     */
    calculateTotalScore(weightedScores) {
        const totalScore = weightedScores.reduce((accumulator, currentValue) => {
            return accumulator + currentValue;
        }, 0);
        return totalScore;
    }

    /**
     * Handle copy button click event.
     */
    handleCopy() {
        try {
            const tableHtml = this.generateResultsTableHtml();
            this.copyToClipboard(tableHtml);
            alert('Results copied to clipboard.');
        } catch (error) {
            console.error('Error copying results:', error);
            alert('An error occurred while copying results. Please try again.');
        }
    }

    /**
     * Generate HTML for the results table.
     * @return {string}
     */
    generateResultsTableHtml() {
        const table = document.createElement('table');
        table.border = '1';
        const thead = document.createElement('thead');
        const tbody = document.createElement('tbody');
        table.appendChild(thead);
        table.appendChild(tbody);

        // Header row
        const headerRow = document.createElement('tr');
        ['Metric', 'Weight (%)', 'Score'].forEach((text) => {
            const th = document.createElement('th');
            th.textContent = text;
            headerRow.appendChild(th);
        });
        thead.appendChild(headerRow);

        // Data rows
        /** @type {!NodeListOf<!HTMLTableRowElement>} */
        const rows = /** @type {!NodeListOf<!HTMLTableRowElement>} */ (
            this.criteriaTableBody.querySelectorAll('tr'));
        rows.forEach((row) => {
            const dataRow = document.createElement('tr');
            const metricCell = row.cells[0].cloneNode(true);
            const weightCell = row.cells[2].cloneNode(true);
            const scoreCell = document.createElement('td');
            const selectElement = /** @type {!HTMLSelectElement} */ (
                row.cells[3].querySelector('select'));
            scoreCell.textContent = selectElement.value;

            dataRow.appendChild(metricCell);
            dataRow.appendChild(weightCell);
            dataRow.appendChild(scoreCell);

            tbody.appendChild(dataRow);
        });

        // Results row
        const resultsRow = document.createElement('tr');
        const totalCell = document.createElement('td');
        totalCell.colSpan = 2;
        totalCell.textContent = 'Total Score';
        const totalValueCell = document.createElement('td');
        totalValueCell.textContent = this.totalScoreElement.textContent;
        resultsRow.appendChild(totalCell);
        resultsRow.appendChild(totalValueCell);
        tbody.appendChild(resultsRow);

        const percentageRow = document.createElement('tr');
        const percentageCell = document.createElement('td');
        percentageCell.colSpan = 2;
        percentageCell.textContent = 'Percentage Likelihood';
        const percentageValueCell = document.createElement('td');
        percentageValueCell.textContent = this.percentageLikelihoodElement.textContent;
        percentageRow.appendChild(percentageCell);
        percentageRow.appendChild(percentageValueCell);
        tbody.appendChild(percentageRow);

        return table.outerHTML;
    }

    /**
     * Copy given HTML content to clipboard.
     * @param {string} html The HTML content to copy.
     */
    copyToClipboard(html) {
        const blob = new Blob([html], { type: 'text/html' });
        const data = [new ClipboardItem({ 'text/html': blob })];
        navigator.clipboard.write(data).catch((error) => {
            console.error('Copy failed:', error);
        });
    }

    /**
     * Handle new investor creation.
     */
    handleNewInvestor() {
        const investorName = prompt('Enter new investor name:');
        if (investorName) {
            const investors = this.getInvestorsFromLocalStorage();
            if (investors[investorName]) {
                alert('An investor with that name already exists.');
                return;
            }
            investors[investorName] = {};
            this.saveInvestorsToLocalStorage(investors);
            this.populateInvestorSelect(investorName);
            this.loadInvestorList();
        }
    }

    /**
     * Populate the investor select dropdown.
     * @param {string=} selectInvestorName Investor name to select after populating.
     */
    populateInvestorSelect(selectInvestorName) {
        const investors = this.getInvestorsFromLocalStorage();
        // Clear existing options
        while (this.investorSelect.firstChild) {
            this.investorSelect.removeChild(this.investorSelect.firstChild);
        }
        // Populate investor select
        Object.keys(investors).forEach((name) => {
            const option = document.createElement('option');
            option.value = name;
            option.textContent = name;
            this.investorSelect.appendChild(option);
        });
        // Select the specified investor
        if (selectInvestorName) {
            this.investorSelect.value = selectInvestorName;
        }
    }

    /**
     * Load investors from local storage.
     */
    loadInvestors() {
        this.populateInvestorSelect();
        this.loadInvestorList();
    }

    /**
     * Get investors from local storage.
     * @return {!Object}
     */
    getInvestorsFromLocalStorage() {
        const investorsJson = localStorage.getItem('investors');
        return investorsJson ? JSON.parse(investorsJson) : {};
    }

    /**
     * Save investors to local storage.
     * @param {!Object} investors Investors data to save.
     */
    saveInvestorsToLocalStorage(investors) {
        localStorage.setItem('investors', JSON.stringify(investors));
    }

    /**
     * Handle investor selection change event.
     */
    handleInvestorChange() {
        // Load saved inputs if available
        this.loadSavedInputs();
    }

    /**
     * Save user inputs and results to local storage.
     */
    saveInputsAndResults() {
        const investorName = this.investorSelect.value;
        if (!investorName) {
            return;
        }
        const selectedProfileIndex = parseInt(this.profileSelect.value, 10);
        const profileName = this.profiles[selectedProfileIndex].name;
        const scores = this.getScores();
        const totalScore = this.totalScoreElement.textContent;
        const percentageLikelihood = this.percentageLikelihoodElement.textContent;

        const investors = this.getInvestorsFromLocalStorage();
        if (!investors[investorName]) {
            investors[investorName] = {};
        }
        investors[investorName][profileName] = {
            scores: scores,
            totalScore: totalScore,
            percentageLikelihood: percentageLikelihood
        };
        this.saveInvestorsToLocalStorage(investors);
        this.loadInvestorList();
    }

    /**
     * Load saved inputs for the selected investor and profile.
     */
    loadSavedInputs() {
        const investorName = this.investorSelect.value;
        if (!investorName) {
            return;
        }
        const selectedProfileIndex = parseInt(this.profileSelect.value, 10);
        const profileName = this.profiles[selectedProfileIndex].name;

        const investors = this.getInvestorsFromLocalStorage();
        const investorData = investors[investorName];
        if (investorData && investorData[profileName]) {
            const savedScores = investorData[profileName].scores;
            /** @type {!NodeListOf<!HTMLSelectElement>} */
            const scoreSelects = /** @type {!NodeListOf<!HTMLSelectElement>} */ (
                this.criteriaTableBody.querySelectorAll('select'));
            scoreSelects.forEach((select, index) => {
                select.value = savedScores[index].score.toString();
            });
            this.totalScoreElement.textContent = investorData[profileName].totalScore;
            this.percentageLikelihoodElement.textContent = investorData[profileName].percentageLikelihood;
        } else {
            // Reset inputs and results
            /** @type {!NodeListOf<!HTMLSelectElement>} */
            const scoreSelects = /** @type {!NodeListOf<!HTMLSelectElement>} */ (
                this.criteriaTableBody.querySelectorAll('select'));
            scoreSelects.forEach((select) => {
                select.value = '1';
            });
            this.totalScoreElement.textContent = '0';
            this.percentageLikelihoodElement.textContent = '0%';
        }
    }

    /**
     * Load investor list with existing calculations.
     */
    loadInvestorList() {
        // Clear existing list
        while (this.investorListElement.firstChild) {
            this.investorListElement.removeChild(this.investorListElement.firstChild);
        }
        const investors = this.getInvestorsFromLocalStorage();
        Object.keys(investors).forEach((investorName) => {
            const listItem = document.createElement('li');
            listItem.classList.add('list-group-item');
            const investorProfiles = investors[investorName];
            const profilesCount = Object.keys(investorProfiles).length;
            listItem.textContent = `${investorName} - ${profilesCount} profile(s) saved`;
            this.investorListElement.appendChild(listItem);
        });
    }

    /**
     * Handle delete investor button click event.
     */
    handleDeleteInvestor() {
        const investorName = this.investorSelect.value;
        if (!investorName) {
            alert('Please select an investor to delete.');
            return;
        }
        if (confirm(`Are you sure you want to delete investor "${investorName}"? This action cannot be undone.`)) {
            const investors = this.getInvestorsFromLocalStorage();
            delete investors[investorName];
            this.saveInvestorsToLocalStorage(investors);
            this.populateInvestorSelect();
            this.loadInvestorList();
            // Reset inputs and results
            this.displayCriteria(this.profiles[parseInt(this.profileSelect.value, 10)]);
        }
    }
}

// Initialise the Investment Likelihood Calculator application
window.addEventListener('load', () => {
    new InvestmentLikelihoodCalculator();
});