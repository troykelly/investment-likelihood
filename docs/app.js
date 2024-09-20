/**
 * Filename: app.js
 * Purpose: Provides functionality for the Likelihood Calculator with category and profile management, supports URL path slugs (e.g., /investment/general-investor-engagement), includes a navigation bar for category change, and handles random selection. Updated to display category and profile descriptions, long descriptions, and disclaimers inline with the existing UI. The disclaimer is now collapsible per category and profile, uses icon in place of bullets where applicable, and is positioned after the profile list and before the metrics table.
 * Description: This script loads categories and profiles from a JSON file, displays categories sorted by weight and name, handles slug-based navigation using URL paths, updates the URL when categories and profiles change, includes a beautifully formatted menu bar, and allows users to calculate likelihood based on selected criteria. Now supports inverting the scoring influence of specific metrics, displays additional information for categories and profiles, and implements a collapsible disclaimer that is unique per category and profile.
 * Author: Troy Kelly
 * Contact: troy@aperim.com
 * Code history:
 * - Initial creation: 18 September 2024
 * - Bootstrap integration: 18 September 2024
 * - Converted to SPA with category selection: 19 September 2024
 * - URL slug and navigation updates: 19 September 2024
 * - Updated savename handling and dynamic labels: 19 September 2024
 * - Refactored with JSDoc annotations and exception handling: 20 September 2024
 * - Added support for inverted scoring: 20 September 2024
 * - Updated to support new fields: 20 September 2024
 * - Implemented collapsible disclaimer per profile: 20 September 2024
 * - Adjusted dotpoints to use icons in place of bullets: 20 September 2024
 * - Moved disclaimer after profile list and before metrics table: 20 September 2024
 */

'use strict';

/**
 * @class LikelihoodCalculator
 * @classdesc Provides the functionality to load categories and profiles,
 * manage entities, support URL path slugs for navigation, handle 404 errors,
 * and compute likelihood. Now supports inverted scoring for specific metrics, displays additional information, and includes a collapsible disclaimer unique per category and profile.
 */
class LikelihoodCalculator {

    /**
     * Creates an instance of LikelihoodCalculator.
     */
    constructor() {
        /** @type {Array<Object>} */
        this.categories = [];
        /** @type {HTMLElement} */
        this.categoryCardsContainer = document.getElementById('categoryCards');
        /** @type {HTMLElement} */
        this.categoryMenu = document.getElementById('categoryMenu');
        /** @type {HTMLElement} */
        this.profileCardsContainer = document.getElementById('profileCards');
        /** @type {HTMLElement} */
        this.criteriaTableBody = document.querySelector('#criteriaTable tbody');
        /** @type {HTMLElement} */
        this.percentageLikelihoodElement = document.getElementById('percentageLikelihood');
        /** @type {HTMLElement} */
        this.copyButton = document.getElementById('copyButton');
        /** @type {HTMLSelectElement} */
        this.investorSelect = document.getElementById('investorSelect');
        /** @type {HTMLElement} */
        this.newInvestorButton = document.getElementById('newInvestorButton');
        /** @type {HTMLElement} */
        this.deleteInvestorButton = document.getElementById('deleteInvestorButton');
        /** @type {HTMLElement} */
        this.investorListElement = document.getElementById('investorList');
        /** @type {HTMLImageElement} */
        this.investorImage = document.getElementById('investorImage');
        /** @type {HTMLElement} */
        this.appContainer = document.getElementById('app');
        /** @type {HTMLElement} */
        this.categorySelectionContainer = document.getElementById('categorySelection');
        /** @type {HTMLElement} */
        this.categoryProfileDetailsElement = document.getElementById('categoryProfileDetails');
        /** @type {number} */
        this.selectedCategoryIndex = 0;
        /** @type {number} */
        this.selectedProfileIndex = 0;
        /** @type {Array<Object>} */
        this.adjustedCriteria = [];
        /** @type {Chart|null} */
        this.likelihoodChart = null;

        // Modal elements
        /** @type {HTMLElement} */
        this.investorEditModal = document.getElementById('investorEditModal');
        /** @type {HTMLInputElement} */
        this.modalInvestorImageInput = document.getElementById('modalInvestorImageInput');
        /** @type {HTMLImageElement} */
        this.modalInvestorImagePreview = document.getElementById('modalInvestorImagePreview');
        /** @type {HTMLFormElement} */
        this.investorEditForm = document.getElementById('investorEditForm');
        /** @type {bootstrap.Modal} */
        this.investorEditModalInstance = null;
        /** @type {string} */
        this.currentEditingInvestorName = '';

        /** @type {string} */
        this.savename = 'Entity'; // Default savename

        // Initialize the application
        this.init();
    }

    /**
     * Initialise the application.
     * @private
     */
    init() {
        this.loadCategories()
            .then(() => {
                this.displayCategoryCards();
                this.displayCategoryMenu();
                // Initialize Bootstrap Modal
                this.investorEditModalInstance = new bootstrap.Modal(this.investorEditModal);
                // Handle URL slug
                this.handleSlugNavigation();
                // Handle explainer display
                this.handleExplainerDisplay();
                // Handle popstate event for browser navigation
                window.addEventListener('popstate', () => {
                    this.handleSlugNavigation();
                });
            })
            .catch((error) => {
                console.error('Error initializing the application:', error);
                alert('Failed to initialise the application. Please try again later.');
            });
    }

    /**
     * Load categories from the JSON file.
     * @return {Promise<void>}
     * @private
     */
    async loadCategories() {
        try {
            const response = await fetch('/profiles.json');
            if (!response.ok) {
                throw new Error('Network response was not ok ' + response.statusText);
            }
            const data = await response.json();
            this.categories = data.categories;
        } catch (error) {
            console.error('Error loading categories:', error);
            alert('Failed to load categories. Please try again later.');
            throw error;
        }
    }

    /**
     * Display category cards for selection, sorted by weight and name.
     * @private
     */
    displayCategoryCards() {
        // Sort categories by weight (ascending) and name
        this.categories.sort((a, b) => {
            if (a.weight !== b.weight) {
                return a.weight - b.weight;
            } else {
                return a.name.localeCompare(b.name);
            }
        });

        // Generate category cards
        this.categories.forEach((category, index) => {
            const colDiv = document.createElement('div');
            colDiv.className = 'col';
            const cardDiv = document.createElement('div');
            cardDiv.className = 'card category-card h-100';
            cardDiv.dataset.index = index.toString();

            const cardBody = document.createElement('div');
            cardBody.className = 'card-body text-center';

            // Icon
            if (category.icon) {
                const iconElement = document.createElement('i');
                category.icon.split(' ').forEach((cls) => iconElement.classList.add(cls));
                iconElement.classList.add('fa-2x');
                cardBody.appendChild(iconElement);
            }

            // Category Name
            const cardTitle = document.createElement('h5');
            cardTitle.className = 'card-title mt-2';
            cardTitle.textContent = category.name;
            cardBody.appendChild(cardTitle);

            // Category Description
            if (category.description) {
                const cardText = document.createElement('p');
                cardText.className = 'card-text';
                cardText.textContent = category.description;
                cardBody.appendChild(cardText);
            }

            cardDiv.appendChild(cardBody);
            colDiv.appendChild(cardDiv);
            this.categoryCardsContainer.appendChild(colDiv);

            // Add event listener for selection
            cardDiv.addEventListener('click', () => this.handleCategoryCardClick(index));
        });
    }

    /**
     * Display category menu bar for navigation.
     * @private
     */
    displayCategoryMenu() {
        this.categories.forEach((category, index) => {
            const menuItem = document.createElement('li');
            menuItem.classList.add('nav-item');

            const link = document.createElement('a');
            link.classList.add('nav-link');
            link.href = `/${category.slug}`;
            link.textContent = category.name;
            link.dataset.index = index.toString();

            menuItem.appendChild(link);
            this.categoryMenu.appendChild(menuItem);

            // Add event listener for click
            link.addEventListener('click', (event) => {
                event.preventDefault();
                this.handleCategoryMenuClick(index);
            });
        });
    }

    /**
     * Handle category menu bar click event.
     * @param {number} index The index of the selected category.
     * @private
     */
    handleCategoryMenuClick(index) {
        this.handleCategoryCardClick(index);
    }

    /**
     * Handle category card click event.
     * @param {number} index Index of the selected category.
     * @private
     */
    handleCategoryCardClick(index) {
        this.selectedCategoryIndex = index;
        const selectedCategory = this.categories[this.selectedCategoryIndex];

        // Update savename
        this.savename = selectedCategory.savename || 'Entity';

        // Update labels with the new savename
        this.updateSavenameLabels();

        // Update URL with slug
        history.pushState({}, '', `/${selectedCategory.slug}`);

        // Update menu bar to highlight selected category
        this.updateMenuBar();

        // Display profiles for the selected category
        this.displayProfiles(selectedCategory);

        // Show the app container and hide category selection
        this.appContainer.style.display = 'block';
        this.categorySelectionContainer.style.display = 'none';

        // Initialize entity management
        this.initInvestorManagement();

        // Handle profile selection (default first profile)
        this.handleProfileCardClick(0);
    }

    /**
     * Update the savename labels throughout the application.
     * @private
     */
    updateSavenameLabels() {
        const savenameElements = {
            savenameLabel: document.getElementById('savenameLabel'),
            savenameLabelNew: document.getElementById('savenameLabelNew'),
            savenameLabelDelete: document.getElementById('savenameLabelDelete'),
            savenameLabelStored: document.getElementById('savenameLabelStored'),
            savenameLabelEditModal: document.getElementById('savenameLabelEditModal'),
            savenameLabelUpload: document.getElementById('savenameLabelUpload'),
        };

        for (const key in savenameElements) {
            if (savenameElements[key]) {
                savenameElements[key].textContent = this.savename;
            }
        }

        // Update alt attributes
        this.investorImage.alt = `${this.savename} Image`;
        this.modalInvestorImagePreview.alt = `${this.savename} Image`;
    }

    /**
     * Update the menu bar to highlight the selected category.
     * @private
     */
    updateMenuBar() {
        const menuLinks = this.categoryMenu.querySelectorAll('.nav-link');
        menuLinks.forEach((link) => {
            link.classList.remove('active');
        });
        const activeLink = this.categoryMenu.querySelector(`.nav-link[data-index="${this.selectedCategoryIndex}"]`);
        if (activeLink) {
            activeLink.classList.add('active');
        }
    }

    /**
     * Display profiles for the selected category.
     * @param {Object} category The selected category.
     * @private
     */
    displayProfiles(category) {
        // Clear existing profiles
        this.profileCardsContainer.innerHTML = '';

        category.profiles.forEach((profile, index) => {
            const colDiv = document.createElement('div');
            colDiv.className = 'col';
            const cardDiv = document.createElement('div');
            cardDiv.className = 'card profile-card h-100';
            cardDiv.dataset.index = index.toString();

            const cardBody = document.createElement('div');
            cardBody.className = 'card-body';

            // Icon
            if (profile.icon) {
                const iconElement = document.createElement('i');
                profile.icon.split(' ').forEach((cls) => iconElement.classList.add(cls));
                iconElement.classList.add('fa-2x');
                cardBody.appendChild(iconElement);
            }

            // Profile Name
            const cardTitle = document.createElement('h5');
            cardTitle.className = 'card-title mt-2';
            cardTitle.textContent = profile.name;
            cardBody.appendChild(cardTitle);

            // Profile Description
            if (profile.description) {
                const cardText = document.createElement('p');
                cardText.className = 'card-text';
                cardText.textContent = profile.description;
                cardBody.appendChild(cardText);
            }

            cardDiv.appendChild(cardBody);
            colDiv.appendChild(cardDiv);
            this.profileCardsContainer.appendChild(colDiv);

            // Add event listener for selection
            cardDiv.addEventListener('click', () => this.handleProfileCardClick(index));
        });
    }

    /**
     * Handle profile card click event.
     * @param {number} index Index of the selected profile.
     * @private
     */
    handleProfileCardClick(index) {
        const previousSelected = this.profileCardsContainer.querySelector('.selected-profile');
        if (previousSelected) {
            previousSelected.classList.remove('selected-profile');
        }
        const selectedCard = this.profileCardsContainer.querySelector(`[data-index="${index}"]`);
        if (selectedCard) {
            selectedCard.classList.add('selected-profile');
        }
        this.selectedProfileIndex = index;
        const selectedCategory = this.categories[this.selectedCategoryIndex];
        const selectedProfile = selectedCategory.profiles[this.selectedProfileIndex];

        // Update URL with profile slug
        const profileSlug = this.generateSlug(selectedProfile.name);
        history.pushState({}, '', `/${selectedCategory.slug}/${profileSlug}`);

        // Update document title
        document.title = `Likelihood Calculator | ${selectedCategory.name} - ${selectedProfile.name}`;

        // Display criteria for the selected profile
        this.displayCriteria(selectedProfile);

        // Display category and profile details
        this.displayCategoryAndProfileDetails(selectedCategory, selectedProfile);

        // Load saved inputs if available
        this.loadSavedInputs();

        // Calculate and display results
        this.calculateAndDisplayResults();
    }

    /**
     * Display criteria for the selected profile.
     * @param {Object} profile The selected calculation profile.
     * @private
     */
    displayCriteria(profile) {
        // Clear existing criteria
        this.criteriaTableBody.innerHTML = '';

        // Calculate total weights
        let totalWeights = profile.criteria.reduce((sum, criterion) => sum + criterion.weight, 0);

        // Display a warning if totalWeights != 100
        const weightWarningElement = document.getElementById('weightWarning');
        if (totalWeights !== 100) {
            weightWarningElement.style.display = 'block';
        } else {
            weightWarningElement.style.display = 'none';
        }

        // Adjust the weights proportionally
        if (totalWeights !== 100) {
            this.adjustedCriteria = profile.criteria.map(criterion => {
                const adjustedWeight = (criterion.weight / totalWeights) * 100;
                return { ...criterion, adjustedWeight: adjustedWeight };
            });
        } else {
            // No adjustment needed
            this.adjustedCriteria = profile.criteria.map(criterion => {
                return { ...criterion, adjustedWeight: criterion.weight };
            });
        }

        // Populate criteria table
        this.adjustedCriteria.forEach((criterion, index) => {
            const row = document.createElement('tr');

            // Metric with icon
            const metricCell = document.createElement('td');
            if (criterion.icon) {
                const iconElement = document.createElement('i');
                criterion.icon.split(' ').forEach((cls) => iconElement.classList.add(cls));
                metricCell.appendChild(iconElement);
                metricCell.appendChild(document.createTextNode(' ' + criterion.metric));
            } else {
                metricCell.textContent = criterion.metric;
            }
            row.appendChild(metricCell);

            // Description
            const descriptionCell = document.createElement('td');
            descriptionCell.textContent = criterion.description;
            row.appendChild(descriptionCell);

            // Score input (slider)
            const scoreCell = document.createElement('td');
            const sliderInput = document.createElement('input');
            sliderInput.type = 'range';
            sliderInput.min = '1';
            sliderInput.max = '5';
            sliderInput.step = '0.25';
            sliderInput.value = '1';
            sliderInput.name = 'score_' + index;
            sliderInput.dataset.weight = criterion.adjustedWeight.toString();
            sliderInput.classList.add('form-range');
            sliderInput.setAttribute('aria-label', `Score for ${criterion.metric}`);
            scoreCell.appendChild(sliderInput);
            row.appendChild(scoreCell);

            // Descriptor
            const descriptorCell = document.createElement('td');
            const descriptorText = document.createElement('div');
            descriptorText.classList.add('score-descriptor');
            descriptorText.textContent = this.getScoreDescriptor(criterion, parseFloat(sliderInput.value));
            descriptorCell.appendChild(descriptorText);
            row.appendChild(descriptorCell);

            // Event listener for slider input
            sliderInput.addEventListener('input', () => {
                descriptorText.textContent = this.getScoreDescriptor(criterion, parseFloat(sliderInput.value));
                this.calculateAndDisplayResults();
            });

            this.criteriaTableBody.appendChild(row);
        });

        // Reset results
        this.percentageLikelihoodElement.textContent = '0%';

        // Load saved inputs if available
        this.loadSavedInputs();
    }

    /**
     * Get the closest score descriptor based on the score.
     * @param {Object} criterion The criterion object.
     * @param {number} score The current score value.
     * @return {string}
     * @private
     */
    getScoreDescriptor(criterion, score) {
        const descriptors = criterion.scoreDescriptors;
        if (!descriptors) {
            return '';
        }
        const scores = Object.keys(descriptors).map(Number);
        // Find the closest score
        let closestScore = scores[0];
        let minDiff = Math.abs(score - closestScore);
        scores.forEach((s) => {
            const diff = Math.abs(score - s);
            if (diff < minDiff) {
                minDiff = diff;
                closestScore = s;
            }
        });
        return descriptors[closestScore.toString()] || '';
    }

    /**
     * Calculate and display results.
     * @private
     */
    calculateAndDisplayResults() {
        try {
            const scores = this.getScores();
            const weightedScores = this.calculateWeightedScores(scores);
            const totalScore = this.calculateTotalScore(weightedScores);
            const percentageLikelihood = (totalScore / 100) * 100;

            // Display results
            this.percentageLikelihoodElement.textContent = percentageLikelihood.toFixed(2) + '%';

            // Update the breakdown table
            this.updateBreakdownTable(scores);

            // Update the chart
            this.updateChart(percentageLikelihood, scores);

            // Save inputs and results
            this.saveInputsAndResults();
        } catch (error) {
            console.error('Error calculating scores:', error);
            alert('An error occurred during calculation. Please check your inputs and try again.');
        }
    }

    /**
     * Get scores input by the user.
     * @return {Array<Object>}
     * @private
     */
    getScores() {
        const scoreInputs = this.criteriaTableBody.querySelectorAll('input[type="range"]');
        const scores = [];
        scoreInputs.forEach((input, index) => {
            const score = parseFloat(input.value);
            const weight = parseFloat(this.adjustedCriteria[index].adjustedWeight);
            scores.push({ score: score, weight: weight, index: index });
        });
        return scores;
    }

    /**
     * Calculate weighted scores for each criterion.
     * @param {Array<Object>} scores The scores and weights for each criterion.
     * @return {Array<number>}
     * @private
     */
    calculateWeightedScores(scores) {
        return scores.map((item) => {
            const criterion = this.adjustedCriteria[item.index];
            const weightedScore = this.calculateCriterionWeightedScore(criterion, item.score);
            return weightedScore;
        });
    }

    /**
     * Calculate the weighted score for a single criterion.
     * @param {Object} criterion The criterion object.
     * @param {number} score The user's score input for this criterion.
     * @return {number} The weighted score.
     * @private
     */
    calculateCriterionWeightedScore(criterion, score) {
        let weightedScore = 0;
        if (criterion.invert) {
            // Inverted criterion: higher scores reduce likelihood
            // Formula: weighted_score = ((5 - score) * adjustedWeight) / 4
            weightedScore = ((5 - score) * criterion.adjustedWeight) / 4;
        } else {
            // Regular criterion
            // Formula: weighted_score = ((score - 1) * adjustedWeight) / 4
            weightedScore = ((score - 1) * criterion.adjustedWeight) / 4;
        }
        return weightedScore;
    }

    /**
     * Calculate the total score by summing weighted scores.
     * @param {Array<number>} weightedScores The weighted scores for each criterion.
     * @return {number}
     * @private
     */
    calculateTotalScore(weightedScores) {
        const totalScore = weightedScores.reduce((accumulator, currentValue) => {
            return accumulator + currentValue;
        }, 0);
        return totalScore;
    }

    /**
     * Update the breakdown table with current scores.
     * @param {Array<Object>} scores The current scores.
     * @private
     */
    updateBreakdownTable(scores) {
        const breakdownTableBody = document.querySelector('#breakdownTable tbody');
        // Clear existing rows
        breakdownTableBody.innerHTML = '';
        // Populate with new scores
        scores.forEach((item) => {
            const criterion = this.adjustedCriteria[item.index];
            const row = document.createElement('tr');
            const metricCell = document.createElement('td');
            metricCell.textContent = criterion.metric;
            row.appendChild(metricCell);
            const scoreCell = document.createElement('td');
            scoreCell.textContent = item.score.toString();
            row.appendChild(scoreCell);
            breakdownTableBody.appendChild(row);
        });
    }

    /**
     * Update the pie chart based on the current scores and options.
     * @param {number} percentageLikelihood The percentage likelihood.
     * @param {Array<Object>} scores The scores and weights.
     * @private
     */
    updateChart(percentageLikelihood, scores) {
        const pieChartOptionElement = document.querySelector('input[name="pieChartOption"]:checked');
        const pieChartOption = pieChartOptionElement.value;

        const labels = [];
        const data = [];
        const backgroundColors = [];

        let totalWeightedScore = 0;
        const weightedScores = [];

        // Calculate weighted scores and total score
        scores.forEach((item, index) => {
            const criterion = this.adjustedCriteria[index];
            const weightedScore = this.calculateCriterionWeightedScore(criterion, item.score);
            weightedScores.push(weightedScore);
            totalWeightedScore += weightedScore;
        });

        if (pieChartOption === '100') {
            // In "Show Full 100%" mode, display each metric's weighted score and the unlikelihood
            scores.forEach((item, index) => {
                const criterion = this.adjustedCriteria[index];
                labels.push(criterion.metric);
                data.push(weightedScores[index]);
                backgroundColors.push(this.getColor(index));
            });
            // Add unlikelihood slice
            const unlikelihood = 100 - totalWeightedScore;
            if (unlikelihood > 0) {
                labels.push('Unlikelihood');
                data.push(unlikelihood);
                backgroundColors.push('#CCCCCC'); // Grey colour for unlikelihood
            }
        } else if (pieChartOption === 'likelihood') {
            // In "Show Percentage Likelihood" mode, display metrics' contributions proportionally
            scores.forEach((item, index) => {
                const criterion = this.adjustedCriteria[index];
                labels.push(criterion.metric);
                data.push(weightedScores[index]);
                backgroundColors.push(this.getColor(index));
            });
        }

        // If the chart already exists, update it; otherwise, create it
        if (this.likelihoodChart) {
            this.likelihoodChart.data.labels = labels;
            this.likelihoodChart.data.datasets[0].data = data;
            this.likelihoodChart.data.datasets[0].backgroundColor = backgroundColors;
            this.likelihoodChart.update();
        } else {
            const ctxElement = document.getElementById('likelihoodChart');
            const ctx = ctxElement.getContext('2d');
            this.likelihoodChart = new Chart(ctx, {
                type: 'pie',
                data: {
                    labels: labels,
                    datasets: [{
                        data: data,
                        backgroundColor: backgroundColors,
                    }],
                },
                options: {
                    plugins: {
                        legend: {
                            display: true,
                            labels: {
                                generateLabels: (chart) => {
                                    const datasets = chart.data.datasets;
                                    return chart.data.labels.map((label, i) => {
                                        return {
                                            text: label,
                                            fillStyle: datasets[0].backgroundColor[i],
                                            index: i,
                                        };
                                    });
                                },
                            },
                        },
                    },
                },
            });
        }
    }

    /**
     * Generate a colour based on the index.
     * @param {number} index The index of the data point.
     * @return {string} The hexadecimal colour code.
     * @private
     */
    getColor(index) {
        const colors = [
            '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0',
            '#9966FF', '#FF9F40', '#C9CBCF', '#FF6384',
            '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF',
            '#FF9F40', '#C9CBCF',
        ];
        return colors[index % colors.length];
    }

    /**
     * Handle copy button click event.
     * @private
     */
    handleCopy() {
        try {
            const resultsHTML = this.generateResultsHTML();

            // Create a Blob from the HTML
            const blob = new Blob([resultsHTML], { type: 'text/html' });

            // Create the ClipboardItem
            const data = [new ClipboardItem({ 'text/html': blob })];

            // Write to clipboard
            navigator.clipboard.write(data).then(() => {
                alert('Results copied to clipboard.');
            }).catch((error) => {
                console.error('Copy failed:', error);
                alert('An error occurred while copying results. Please try again.');
            });
        } catch (error) {
            console.error('Error copying results:', error);
            alert('An error occurred while copying results. Please try again.');
        }
    }

    /**
     * Generate HTML for the results to copy.
     * @return {string}
     * @private
     */
    generateResultsHTML() {
        const entityName = this.investorSelect.value;
        const selectedCategory = this.categories[this.selectedCategoryIndex];
        const profileName = selectedCategory.profiles[this.selectedProfileIndex].name;

        let html = '<div style="font-family: Arial, sans-serif;">';

        // Entity details
        html += `<h2>${this.savename} Name: ${entityName}</h2>`;

        // Entity Image
        const entityImageSrc = this.investorImage.src;
        if (entityImageSrc) {
            html += `<img src="${entityImageSrc}" alt="${this.savename} Image" style="max-width: 200px;"/>`;
        }

        // Profile Name
        html += `<h3>Profile: ${profileName}</h3>`;

        // Main Content Wrapper
        html += '<div style="display: flex; flex-wrap: wrap;">';

        // Pie Chart Column
        html += '<div style="flex: 2;">';
        // Pie Chart as Image
        if (this.likelihoodChart) {
            const chartDataURL = this.likelihoodChart.toBase64Image();
            html += `<img src="${chartDataURL}" alt="Likelihood Chart" style="max-width: 100%; height: auto;" />`;
        }
        html += '</div>';

        // Report Column
        html += '<div style="flex: 1; padding-left: 20px;">';
        // Percentage Likelihood
        html += `<h3>Percentage Likelihood</h3><h1>${this.percentageLikelihoodElement.textContent}</h1>`;

        // Breakdown Table
        html += '<table border="1" cellpadding="5" cellspacing="0" style="border-collapse: collapse; width: 100%;">';
        html += '<tr><th>Metric</th><th>Score</th></tr>';
        const breakdownTableBody = document.querySelector('#breakdownTable tbody');
        const rows = breakdownTableBody.querySelectorAll('tr');
        rows.forEach((row) => {
            const cells = row.cells;
            const metric = cells[0].textContent || '';
            const score = cells[1].textContent || '';
            html += `<tr><td>${metric.trim()}</td><td>${score.trim()}</td></tr>`;
        });
        html += '</table>';
        html += '</div>'; // Close Report Column
        html += '</div>'; // Close Main Content Wrapper

        // Criteria Table
        html += '<h3>Criteria Details</h3>';
        html += '<table border="1" cellpadding="5" cellspacing="0" style="border-collapse: collapse; width: 100%;">';
        html += '<tr><th>Metric</th><th>Description</th><th>Score</th><th>Descriptor</th></tr>';

        const criteriaRows = this.criteriaTableBody.querySelectorAll('tr');
        criteriaRows.forEach((row) => {
            const cells = row.cells;
            const metricCell = cells[0].textContent || '';
            const descriptionCell = cells[1].textContent || '';
            const inputElement = cells[2].querySelector('input[type="range"]');
            const scoreValue = inputElement.value;
            const descriptorCell = cells[3].textContent || '';

            html += `<tr><td>${metricCell.trim()}</td><td>${descriptionCell.trim()}</td><td>${scoreValue}</td><td>${descriptorCell.trim()}</td></tr>`;
        });
        html += '</table>';

        html += '</div>';

        return html;
    }

    /**
     * Handle new entity creation.
     * @private
     */
    handleNewInvestor() {
        const entityName = prompt(`Enter new ${this.savename} name:`);
        if (entityName) {
            const entities = this.getEntitiesFromLocalStorage();
            if (entities[entityName]) {
                alert(`A ${this.savename} with that name already exists.`);
                return;
            }
            entities[entityName] = {};
            this.saveEntitiesToLocalStorage(entities);
            this.populateInvestorSelect(entityName);
            this.loadInvestorList();
        }
    }

    /**
     * Populate the entity select dropdown.
     * @param {string} [selectEntityName] Entity name to select after populating.
     * @private
     */
    populateInvestorSelect(selectEntityName = '') {
        const entities = this.getEntitiesFromLocalStorage();
        // Clear existing options
        this.investorSelect.innerHTML = '';
        // Populate entity select
        Object.keys(entities).forEach((name) => {
            const option = document.createElement('option');
            option.value = name;
            option.textContent = name;
            this.investorSelect.appendChild(option);
        });
        // Select the specified entity
        if (selectEntityName) {
            this.investorSelect.value = selectEntityName;
        }
    }

    /**
     * Load entities from local storage.
     * @private
     */
    loadEntities() {
        this.populateInvestorSelect();
        this.loadInvestorList();
    }

    /**
     * Get entities from local storage for the current category.
     * @return {Object}
     * @private
     */
    getEntitiesFromLocalStorage() {
        const entitiesJson = localStorage.getItem('entities');
        const entitiesData = entitiesJson ? JSON.parse(entitiesJson) : {};
        const categoryName = this.categories[this.selectedCategoryIndex].name;
        if (!entitiesData[categoryName]) {
            entitiesData[categoryName] = {};
        }
        return entitiesData[categoryName];
    }

    /**
     * Save entities to local storage for the current category.
     * @param {Object} entities Entities data to save.
     * @private
     */
    saveEntitiesToLocalStorage(entities) {
        const entitiesJson = localStorage.getItem('entities');
        const entitiesData = entitiesJson ? JSON.parse(entitiesJson) : {};
        const categoryName = this.categories[this.selectedCategoryIndex].name;
        entitiesData[categoryName] = entities;
        localStorage.setItem('entities', JSON.stringify(entitiesData));
    }

    /**
     * Handle entity selection change event.
     * @private
     */
    handleInvestorChange() {
        // Load saved inputs if available
        this.loadSavedInputs();

        // Load entity image
        const entityName = this.investorSelect.value;
        const entities = this.getEntitiesFromLocalStorage();
        const entityData = entities[entityName];
        if (entityData && entityData.image) {
            this.investorImage.src = entityData.image;
            this.investorImage.style.display = 'block';
        } else {
            this.investorImage.src = '';
            this.investorImage.style.display = 'none';
        }
    }

    /**
     * Save user inputs and results to local storage.
     * @private
     */
    saveInputsAndResults() {
        const entityName = this.investorSelect.value;
        if (!entityName) {
            return;
        }
        const selectedCategory = this.categories[this.selectedCategoryIndex];
        const profileName = selectedCategory.profiles[this.selectedProfileIndex].name;
        const scores = this.getScores();
        const percentageLikelihood = this.percentageLikelihoodElement.textContent || '0%';

        const entities = this.getEntitiesFromLocalStorage();
        if (!entities[entityName]) {
            entities[entityName] = {};
        }
        if (!entities[entityName][selectedCategory.name]) {
            entities[entityName][selectedCategory.name] = {};
        }
        entities[entityName][selectedCategory.name][profileName] = {
            scores: scores,
            percentageLikelihood: percentageLikelihood,
        };
        this.saveEntitiesToLocalStorage(entities);
        this.loadInvestorList();
    }

    /**
     * Load saved inputs for the selected entity and profile.
     * @private
     */
    loadSavedInputs() {
        const entityName = this.investorSelect.value;
        if (!entityName) {
            return;
        }
        const selectedCategory = this.categories[this.selectedCategoryIndex];
        const profileName = selectedCategory.profiles[this.selectedProfileIndex].name;

        const entities = this.getEntitiesFromLocalStorage();
        const entityData = entities[entityName];
        if (entityData && entityData[selectedCategory.name] && entityData[selectedCategory.name][profileName]) {
            const savedData = entityData[selectedCategory.name][profileName];
            const savedScores = savedData.scores;
            const scoreInputs = this.criteriaTableBody.querySelectorAll('input[type="range"]');
            scoreInputs.forEach((input, index) => {
                input.value = savedScores[index].score.toString();
                // Update descriptor
                const descriptorCell = input.parentElement.nextElementSibling;
                const criterion = this.adjustedCriteria[index];
                const descriptorText = descriptorCell.querySelector('.score-descriptor');
                descriptorText.textContent = this.getScoreDescriptor(criterion, parseFloat(input.value));
            });
            this.percentageLikelihoodElement.textContent = savedData.percentageLikelihood;
        } else {
            // Reset inputs and results
            const scoreInputs = this.criteriaTableBody.querySelectorAll('input[type="range"]');
            scoreInputs.forEach((input, index) => {
                input.value = '1';
                const descriptorCell = input.parentElement.nextElementSibling;
                const descriptorText = descriptorCell.querySelector('.score-descriptor');
                descriptorText.textContent = this.getScoreDescriptor(this.adjustedCriteria[index], 1);
            });
            this.percentageLikelihoodElement.textContent = '0%';
        }

        // Load entity image
        if (entityData && entityData.image) {
            this.investorImage.src = entityData.image;
            this.investorImage.style.display = 'block';
        } else {
            this.investorImage.src = '';
            this.investorImage.style.display = 'none';
        }
    }

    /**
     * Load entity list with existing calculations.
     * @private
     */
    loadInvestorList() {
        // Clear existing list
        this.investorListElement.innerHTML = '';
        const entities = this.getEntitiesFromLocalStorage();
        Object.keys(entities).forEach((entityName) => {
            const entityData = entities[entityName];
            const listItem = document.createElement('li');
            listItem.classList.add('list-group-item', 'd-flex', 'align-items-center');
            listItem.dataset.name = entityName;

            // Entity Image
            const entityProfiles = entityData;
            const profilesCount = Object.keys(entityProfiles).filter((key) => key !== 'image').length;
            const imageSrc = entityData.image || '';

            if (imageSrc) {
                const imgElement = document.createElement('img');
                imgElement.src = imageSrc;
                imgElement.alt = `${this.savename} Image`;
                imgElement.classList.add('img-thumbnail', 'me-2');
                imgElement.style.width = '50px';
                imgElement.style.height = '50px';
                listItem.appendChild(imgElement);
            }

            // Entity Name and Profile Count
            const textContent = document.createElement('div');
            textContent.textContent = `${entityName} - ${profilesCount} profile(s) saved`;
            listItem.appendChild(textContent);

            this.investorListElement.appendChild(listItem);

            // Add click event to open modal
            listItem.addEventListener('click', () => this.handleInvestorListItemClick(entityName));
        });
    }

    /**
     * Handle delete entity button click event.
     * @private
     */
    handleDeleteInvestor() {
        const entityName = this.investorSelect.value;
        if (!entityName) {
            alert(`Please select a ${this.savename.toLowerCase()} to delete.`);
            return;
        }
        if (confirm(`Are you sure you want to delete ${this.savename.toLowerCase()} "${entityName}"? This action cannot be undone.`)) {
            const entities = this.getEntitiesFromLocalStorage();
            delete entities[entityName];
            this.saveEntitiesToLocalStorage(entities);
            this.populateInvestorSelect();
            this.loadInvestorList();
            // Reset inputs and results
            this.displayCriteria(this.categories[this.selectedCategoryIndex].profiles[this.selectedProfileIndex]);
            this.investorImage.src = '';
            this.investorImage.style.display = 'none';
        }
    }

    /**
     * Handle entity list item click event to open modal.
     * @param {string} entityName The name of the entity to edit.
     * @private
     */
    handleInvestorListItemClick(entityName) {
        this.currentEditingInvestorName = entityName;
        const entities = this.getEntitiesFromLocalStorage();
        const entityData = entities[entityName];

        // Load existing image
        if (entityData && entityData.image) {
            this.modalInvestorImagePreview.src = entityData.image;
            this.modalInvestorImagePreview.style.display = 'block';
        } else {
            this.modalInvestorImagePreview.src = '';
            this.modalInvestorImagePreview.style.display = 'none';
        }

        // Reset the image input
        this.modalInvestorImageInput.value = '';

        // Show modal
        this.investorEditModalInstance.show();
    }

    /**
     * Handle modal entity image upload.
     * @param {Event} event The change event.
     * @private
     */
    handleModalInvestorImageUpload(event) {
        const fileInput = event.target;
        if (fileInput.files && fileInput.files[0]) {
            const reader = new FileReader();
            reader.onload = (e) => {
                const dataURL = e.target.result;
                this.modalInvestorImagePreview.src = dataURL;
                this.modalInvestorImagePreview.style.display = 'block';
            };
            reader.readAsDataURL(fileInput.files[0]);
        }
    }

    /**
     * Handle entity edit form submission.
     * @param {Event} event The submit event.
     * @private
     */
    handleInvestorEditFormSubmit(event) {
        event.preventDefault();

        const entities = this.getEntitiesFromLocalStorage();
        const entityData = entities[this.currentEditingInvestorName];

        // Save image if available
        if (this.modalInvestorImagePreview.src) {
            if (!entityData) {
                entities[this.currentEditingInvestorName] = {};
            }
            entities[this.currentEditingInvestorName].image = this.modalInvestorImagePreview.src;
        }

        this.saveEntitiesToLocalStorage(entities);
        this.loadInvestorList();

        // Update image if the current entity is selected
        if (this.investorSelect.value === this.currentEditingInvestorName) {
            this.investorImage.src = this.modalInvestorImagePreview.src;
            this.investorImage.style.display = 'block';
        }

        // Close modal
        this.investorEditModalInstance.hide();
    }

    /**
     * Handle the display of the explainer section based on visit count.
     * @private
     */
    handleExplainerDisplay() {
        const explainerElement = document.getElementById('explainer');
        const explainerContent = document.getElementById('explainerContent');
        const visitCount = parseInt(localStorage.getItem('visitCount') || '0', 10);

        // Check if user has manually collapsed the explainer
        const explainerCollapsed = localStorage.getItem('explainerCollapsed');
        if (explainerCollapsed === 'true') {
            explainerContent.classList.remove('show');
        } else if (explainerCollapsed === 'false') {
            explainerContent.classList.add('show');
        } else {
            // Display explainer automatically on first three visits
            if (visitCount < 3) {
                explainerContent.classList.add('show');
            } else {
                explainerContent.classList.remove('show');
            }
        }

        // Increment visit count
        localStorage.setItem('visitCount', (visitCount + 1).toString());

        // Add event listener to update localStorage when explainer is toggled
        const toggleButton = explainerElement.querySelector('[data-bs-toggle="collapse"]');
        if (toggleButton) {
            toggleButton.addEventListener('click', () => {
                const isExpanded = explainerContent.classList.contains('show');
                if (isExpanded) {
                    localStorage.setItem('explainerCollapsed', 'true');
                } else {
                    localStorage.setItem('explainerCollapsed', 'false');
                }
            });
        }
    }

    /**
     * Handle URL slug navigation and 404 handling.
     * @private
     */
    handleSlugNavigation() {
        const pathname = window.location.pathname;
        const pathSegments = pathname.split('/').filter(Boolean);

        if (pathSegments.length === 0) {
            // No slug provided, select highest ordered category
            this.selectHighestOrderedCategory();
            return;
        }

        if (pathSegments[0] === 'random') {
            // Implement /random to select a completely random category and profile
            this.selectRandomCategoryAndProfile();
            return;
        }

        const categorySlug = pathSegments[0];
        const categoryIndex = this.categories.findIndex((category) => category.slug === categorySlug);
        if (categoryIndex !== -1) {
            this.handleCategoryCardClick(categoryIndex);
            if (pathSegments.length > 1) {
                const profileSlug = pathSegments[1];
                const category = this.categories[categoryIndex];
                const profileIndex = category.profiles.findIndex((profile) => this.generateSlug(profile.name) === profileSlug);
                if (profileIndex !== -1) {
                    this.handleProfileCardClick(profileIndex);
                } else {
                    // Profile not found
                    alert('The requested profile does not exist.');
                    // Default to first profile
                    this.handleProfileCardClick(0);
                }
            } else {
                // No profile specified, default to first profile
                this.handleProfileCardClick(0);
            }
        } else {
            // Category not found
            alert('The requested category does not exist.');
            // Redirect to highest ordered category
            this.selectHighestOrderedCategory();
        }
    }

    /**
     * Generate a slug from a given string.
     * Convert to lower-case hyphenated format.
     * @param {string} name The string to convert to a slug.
     * @return {string}
     * @private
     */
    generateSlug(name) {
        return name.toLowerCase().replace(/[\s]+/g, '-').replace(/[^\w\-]+/g, '');
    }

    /**
     * Select the highest ordered category (weight 1 is highest, then alphasort).
     * @private
     */
    selectHighestOrderedCategory() {
        // Categories are already sorted
        this.handleCategoryCardClick(0);
        // By default, select first profile
        this.handleProfileCardClick(0);

        // Update the URL
        const selectedCategory = this.categories[0];
        history.replaceState({}, '', `/${selectedCategory.slug}`);
    }

    /**
     * Select a completely random category and profile.
     * @private
     */
    selectRandomCategoryAndProfile() {
        const randomCategoryIndex = Math.floor(Math.random() * this.categories.length);
        const category = this.categories[randomCategoryIndex];

        const randomProfileIndex = Math.floor(Math.random() * category.profiles.length);

        // Simulate category and profile selection
        this.handleCategoryCardClick(randomCategoryIndex);
        this.handleProfileCardClick(randomProfileIndex);

        // Update the URL
        const categorySlug = category.slug;
        const profileSlug = this.generateSlug(category.profiles[randomProfileIndex].name);
        history.pushState({}, '', `/${categorySlug}/${profileSlug}`);
    }

    /**
     * Initialize entity management event listeners.
     * @private
     */
    initInvestorManagement() {
        this.copyButton.addEventListener('click', () => this.handleCopy());
        this.newInvestorButton.addEventListener('click', () => this.handleNewInvestor());
        this.investorSelect.addEventListener('change', () => this.handleInvestorChange());
        this.deleteInvestorButton.addEventListener('click', () => this.handleDeleteInvestor());

        // Modal event listeners
        this.modalInvestorImageInput.addEventListener('change', (event) => this.handleModalInvestorImageUpload(event));
        this.investorEditForm.addEventListener('submit', (event) => this.handleInvestorEditFormSubmit(event));

        // Load entities from local storage
        this.loadEntities();

        // Event listener for pie chart options
        const pieChartOptions = document.querySelectorAll('input[name="pieChartOption"]');
        pieChartOptions.forEach((option) => {
            option.addEventListener('change', () => {
                this.calculateAndDisplayResults();
            });
        });
    }

    /**
     * Display category and profile details, including collapsible disclaimer.
     * @param {Object} category The selected category.
     * @param {Object} profile The selected profile.
     * @private
     */
    displayCategoryAndProfileDetails(category, profile) {
        // Clear existing content
        this.categoryProfileDetailsElement.innerHTML = '';

        // Create and append category longdescription
        if (category.longdescription) {
            const longDescriptionElement = document.createElement('div');
            longDescriptionElement.classList.add('mb-3');
            longDescriptionElement.innerHTML = `<p>${category.longdescription}</p>`;
            this.categoryProfileDetailsElement.appendChild(longDescriptionElement);
        }

        // Create and append profile longdescription
        if (profile.longdescription) {
            const profileDescriptionElement = document.createElement('div');
            profileDescriptionElement.classList.add('mb-3');
            profileDescriptionElement.innerHTML = `<p>${profile.longdescription}</p>`;
            this.categoryProfileDetailsElement.appendChild(profileDescriptionElement);
        }

        // Create and append collapsible disclaimer
        if (category.disclaimer) {
            const disclaimer = category.disclaimer;
            const categorySlug = category.slug;
            const profileSlug = this.generateSlug(profile.name);
            const disclaimerId = `disclaimer-${categorySlug}-${profileSlug}`;

            // Create accordion container
            const accordionDiv = document.createElement('div');
            accordionDiv.classList.add('accordion');
            accordionDiv.id = `disclaimerAccordion-${categorySlug}-${profileSlug}`;

            // Accordion item
            const accordionItemDiv = document.createElement('div');
            accordionItemDiv.classList.add('accordion-item');

            // Accordion header
            const headerId = `disclaimerHeading-${categorySlug}-${profileSlug}`;
            const collapseId = `disclaimerContent-${categorySlug}-${profileSlug}`;

            const accordionHeader = document.createElement('h2');
            accordionHeader.classList.add('accordion-header');
            accordionHeader.id = headerId;

            const accordionButton = document.createElement('button');
            accordionButton.classList.add('accordion-button');
            accordionButton.type = 'button';
            accordionButton.setAttribute('data-bs-toggle', 'collapse');
            accordionButton.setAttribute('data-bs-target', `#${collapseId}`);
            accordionButton.setAttribute('aria-expanded', 'false');
            accordionButton.setAttribute('aria-controls', collapseId);
            accordionButton.textContent = disclaimer.heading || 'Disclaimer';

            accordionHeader.appendChild(accordionButton);

            // Accordion collapse content
            const collapseDiv = document.createElement('div');
            collapseDiv.id = collapseId;
            collapseDiv.classList.add('accordion-collapse', 'collapse');
            collapseDiv.setAttribute('aria-labelledby', headerId);
            collapseDiv.setAttribute('data-bs-parent', `#disclaimerAccordion-${categorySlug}-${profileSlug}`);

            const accordionBody = document.createElement('div');
            accordionBody.classList.add('accordion-body');

            // Disclaimer content
            // Text
            if (disclaimer.text) {
                const textElement = document.createElement('p');
                textElement.textContent = disclaimer.text;
                accordionBody.appendChild(textElement);
            }

            // Dot points
            if (disclaimer.dotpoints && Array.isArray(disclaimer.dotpoints)) {
                const ulElement = document.createElement('ul');
                ulElement.classList.add('list-unstyled');
                disclaimer.dotpoints.forEach((point) => {
                    const liElement = document.createElement('li');
                    liElement.classList.add('d-flex');

                    const iconSpan = document.createElement('span');
                    iconSpan.classList.add('me-2');

                    if (point.icon) {
                        const iconElement = document.createElement('i');
                        point.icon.split(' ').forEach((cls) => iconElement.classList.add(cls));
                        iconSpan.appendChild(iconElement);
                    } else {
                        iconSpan.textContent = '•';
                    }

                    const textSpan = document.createElement('span');
                    textSpan.textContent = point.text;

                    liElement.appendChild(iconSpan);
                    liElement.appendChild(textSpan);

                    ulElement.appendChild(liElement);
                });
                accordionBody.appendChild(ulElement);
            }

            // Links
            if (disclaimer.links && Array.isArray(disclaimer.links)) {
                const linksParagraph = document.createElement('p');
                disclaimer.links.forEach((link, index) => {
                    const linkElement = document.createElement('a');
                    linkElement.href = link.url;
                    linkElement.target = '_blank';
                    linkElement.rel = 'noopener';
                    linkElement.textContent = link.name;
                    linksParagraph.appendChild(linkElement);
                    if (index < disclaimer.links.length - 1) {
                        linksParagraph.appendChild(document.createTextNode(', '));
                    }
                });
                accordionBody.appendChild(linksParagraph);
            }

            // Footer
            if (disclaimer.footer) {
                const footerElement = document.createElement('p');
                footerElement.classList.add('mb-0');
                footerElement.textContent = disclaimer.footer;
                accordionBody.appendChild(footerElement);
            }

            collapseDiv.appendChild(accordionBody);
            accordionItemDiv.appendChild(accordionHeader);
            accordionItemDiv.appendChild(collapseDiv);
            accordionDiv.appendChild(accordionItemDiv);

            this.categoryProfileDetailsElement.appendChild(accordionDiv);

            // Handle collapsible state per category and profile
            const lsKey = `disclaimerCollapsed-${categorySlug}-${profileSlug}`;
            const isCollapsed = localStorage.getItem(lsKey) === 'true';

            if (!isCollapsed) {
                collapseDiv.classList.add('show');
                accordionButton.setAttribute('aria-expanded', 'true');
            } else {
                accordionButton.setAttribute('aria-expanded', 'false');
            }

            // Add event listeners to update localStorage
            collapseDiv.addEventListener('shown.bs.collapse', () => {
                localStorage.setItem(lsKey, 'false');
                accordionButton.setAttribute('aria-expanded', 'true');
            });
            collapseDiv.addEventListener('hidden.bs.collapse', () => {
                localStorage.setItem(lsKey, 'true');
                accordionButton.setAttribute('aria-expanded', 'false');
            });
        }
    }

}

// Initialise the Likelihood Calculator application
window.addEventListener('load', () => {
    new LikelihoodCalculator();
});