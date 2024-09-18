/**
 * Filename: app.js
 * Purpose: Provides functionality for the Investment Likelihood Calculator.
 * Description: This script loads calculation profiles from a JSON file,
 * displays criteria, accepts user inputs, and calculates the investment likelihood.
 * Author: Troy Kelly
 * Contact: troy@aperim.com
 * Code history:
 * - Initial creation: 18 September 2024
 * - Bootstrap integration: 18 September 2024
 */

'use strict';

/**
 * Investment Likelihood Calculator Application
 * Provides the functionality to load calculation profiles,
 * display criteria, accept user inputs, and calculate the investment likelihood.
 */
class InvestmentLikelihoodCalculator {
    /**
     * Create the calculator.
     */
    constructor() {
        /** @private {!Array<!Object>} */
        this.profiles_ = [];
        /** @private {?HTMLSelectElement} */
        this.profileSelect_ = /** @type {?HTMLSelectElement} */ (document.getElementById('profileSelect'));
        /** @private {?HTMLElement} */
        this.criteriaTableBody_ = document.querySelector('#criteriaTable tbody');
        /** @private {?HTMLElement} */
        this.totalScoreElement_ = document.getElementById('totalScore');
        /** @private {?HTMLElement} */
        this.percentageLikelihoodElement_ = document.getElementById('percentageLikelihood');
        /** @private {?HTMLButtonElement} */
        this.calculateButton_ = /** @type {?HTMLButtonElement} */ (document.getElementById('calculateButton'));

        // Bind event handlers
        this.handleProfileChange = this.handleProfileChange.bind(this);
        this.handleCalculate = this.handleCalculate.bind(this);

        // Initialize the app
        this.init_();
    }

    /**
     * Initialise the application.
     * @private
     */
    init_() {
        this.loadProfiles_()
            .then(() => {
                this.populateProfileSelect_();
                this.profileSelect_.addEventListener('change', this.handleProfileChange);
                this.calculateButton_.addEventListener('click', this.handleCalculate);
                // Load the first profile by default
                this.displayCriteria_(this.profiles_[0]);
            })
            .catch((error) => {
                console.error('Error initialising the application:', error);
                alert('Failed to initialise the application. Please try again later.');
            });
    }

    /**
     * Load calculation profiles from the JSON file.
     * @return {!Promise<void>}
     * @private
     */
    async loadProfiles_() {
        try {
            const response = await fetch('profiles.json');
            if (!response.ok) {
                throw new Error('Network response was not ok ' + response.statusText);
            }
            const data = await response.json();
            this.profiles_ = data.profiles;
        } catch (error) {
            console.error('Error loading profiles:', error);
            alert('Failed to load calculation profiles. Please try again later.');
            throw error;
        }
    }

    /**
     * Populate the profile select dropdown with loaded profiles.
     * @private
     */
    populateProfileSelect_() {
        this.profiles_.forEach((profile, index) => {
            const option = document.createElement('option');
            option.value = index.toString();
            option.textContent = profile.name;
            this.profileSelect_.appendChild(option);
        });
    }

    /**
     * Handle profile selection change event.
     */
    handleProfileChange() {
        const selectedIndex = parseInt(this.profileSelect_.value, 10);
        const selectedProfile = this.profiles_[selectedIndex];
        this.displayCriteria_(selectedProfile);
    }

    /**
     * Display criteria for the selected profile.
     * @param {!Object} profile The selected calculation profile.
     * @private
     */
    displayCriteria_(profile) {
        // Clear existing criteria
        while (this.criteriaTableBody_.firstChild) {
            this.criteriaTableBody_.removeChild(this.criteriaTableBody_.firstChild);
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
            const tooltipTriggerList = [].slice.call(descriptionCell.querySelectorAll('[data-bs-toggle="tooltip"]'));
            tooltipTriggerList.map(function (tooltipTriggerEl) {
                return new bootstrap.Tooltip(tooltipTriggerEl);
            });

            // Weight
            const weightCell = document.createElement('td');
            weightCell.textContent = criterion.weight.toString();
            row.appendChild(weightCell);

            // Score input
            const scoreCell = document.createElement('td');
            const scoreSelect = document.createElement('select');
            scoreSelect.name = 'score_' + index;
            scoreSelect.dataset.weight = criterion.weight;
            scoreSelect.classList.add('form-select');
            for (let i = 1; i <= 5; i++) {
                const option = document.createElement('option');
                option.value = i.toString();
                option.textContent = i.toString();
                scoreSelect.appendChild(option);
            }
            scoreCell.appendChild(scoreSelect);
            row.appendChild(scoreCell);

            this.criteriaTableBody_.appendChild(row);
        });

        // Reset results
        this.totalScoreElement_.textContent = '0';
        this.percentageLikelihoodElement_.textContent = '0%';
    }

    /**
     * Handle calculate button click event.
     */
    handleCalculate() {
        try {
            const scores = this.getScores_();
            const weightedScores = this.calculateWeightedScores_(scores);
            const totalScore = this.calculateTotalScore_(weightedScores);
            const percentageLikelihood = (totalScore / 100) * 100;

            // Display results
            this.totalScoreElement_.textContent = totalScore.toFixed(2);
            this.percentageLikelihoodElement_.textContent = percentageLikelihood.toFixed(2) + '%';
        } catch (error) {
            console.error('Error calculating scores:', error);
            alert('An error occurred during calculation. Please check your inputs and try again.');
        }
    }

    /**
     * Get scores input by the user.
     * @return {!Array<!Object>}
     * @private
     */
    getScores_() {
        /** @type {!NodeListOf<!HTMLSelectElement>} */
        const scoreSelects = /** @type {!NodeListOf<!HTMLSelectElement>} */ (
            this.criteriaTableBody_.querySelectorAll('select'));
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
     * @private
     */
    calculateWeightedScores_(scores) {
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
     * @private
     */
    calculateTotalScore_(weightedScores) {
        const totalScore = weightedScores.reduce((accumulator, currentValue) => {
            return accumulator + currentValue;
        }, 0);
        return totalScore;
    }
}

// Initialise the Investment Likelihood Calculator application
window.addEventListener('load', () => {
    new InvestmentLikelihoodCalculator();
});
