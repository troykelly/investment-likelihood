/**
 * Filename: app.js
 * Purpose: Provides functionality for the Investment Likelihood Calculator with investor management, copy to clipboard, and new UI enhancements.
 * Description: This script allows users to create investors, save and load their inputs locally, calculate the investment likelihood, display a pie chart, and copy results to clipboard. It includes features such as profile selection via cards and investor image upload through a modal.
 * Author: Troy Kelly
 * Contact: troy@aperim.com
 * Code history:
 * - Initial creation: 18 September 2024
 * - Bootstrap integration: 18 September 2024
 * - Added local storage and copy functionality: 18 September 2024
 * - Added fixes and improvements: 18 September 2024
 * - User experience enhancements: 18 September 2024
 * - UI changes: 19 September 2024
 * - Added pie chart and UI enhancements: 19 September 2024
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
        /** @type {?HTMLDivElement} */
        this.profileCardsContainer = document.getElementById('profileCards');
        /** @type {?HTMLElement} */
        this.criteriaTableBody = document.querySelector('#criteriaTable tbody');
        /** @type {?HTMLElement} */
        this.percentageLikelihoodElement = document.getElementById('percentageLikelihood');
        /** @type {?HTMLButtonElement} */
        this.copyButton = document.getElementById('copyButton');
        /** @type {?HTMLSelectElement} */
        this.investorSelect = document.getElementById('investorSelect');
        /** @type {?HTMLButtonElement} */
        this.newInvestorButton = document.getElementById('newInvestorButton');
        /** @type {?HTMLButtonElement} */
        this.deleteInvestorButton = document.getElementById('deleteInvestorButton');
        /** @type {?HTMLElement} */
        this.investorListElement = document.getElementById('investorList');
        /** @type {?HTMLImageElement} */
        this.investorImage = document.getElementById('investorImage');
        /** @type {number} */
        this.selectedProfileIndex = 0;
        /** @type {!Array<!Object>} */
        this.adjustedCriteria = [];
        /** @type {?Chart} */
        this.likelihoodChart = null;

        // Modal elements
        /** @type {?HTMLElement} */
        this.investorEditModal = document.getElementById('investorEditModal');
        /** @type {?HTMLInputElement} */
        this.modalInvestorImageInput = document.getElementById('modalInvestorImageInput');
        /** @type {?HTMLImageElement} */
        this.modalInvestorImagePreview = document.getElementById('modalInvestorImagePreview');
        /** @type {?HTMLFormElement} */
        this.investorEditForm = document.getElementById('investorEditForm');
        /** @type {?bootstrap.Modal} */
        this.investorEditModalInstance = null;
        /** @type {string} */
        this.currentEditingInvestorName = '';

        // Initialize the app
        this.init();
    }

    /**
     * Initialise the application.
     */
    init() {
        this.loadProfiles()
            .then(() => {
                this.displayProfileCards();
                this.copyButton.addEventListener('click', () => this.handleCopy());
                this.newInvestorButton.addEventListener('click', () => this.handleNewInvestor());
                this.investorSelect.addEventListener('change', () => this.handleInvestorChange());
                this.deleteInvestorButton.addEventListener('click', () => this.handleDeleteInvestor());

                // Modal event listeners
                this.modalInvestorImageInput.addEventListener('change', (event) => this.handleModalInvestorImageUpload(event));
                this.investorEditForm.addEventListener('submit', (event) => this.handleInvestorEditFormSubmit(event));

                // Initialize Bootstrap Modal
                this.investorEditModalInstance = new bootstrap.Modal(this.investorEditModal);

                // Load investors from local storage
                this.loadInvestors();
                // Load the first profile by default
                this.displayCriteria(this.profiles[0]);

                // Event listener for pie chart options
                const pieChartOptions = document.querySelectorAll('input[name="pieChartOption"]');
                pieChartOptions.forEach((option) => {
                    option.addEventListener('change', () => {
                        this.calculateAndDisplayResults();
                    });
                });

                // Handle explainer display
                this.handleExplainerDisplay();
            })
            .catch((error) => {
                console.error('Error initializing the application:', error);
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
     * Display profile cards for selection.
     */
    displayProfileCards() {
        this.profiles.forEach((profile, index) => {
            const colDiv = document.createElement('div');
            colDiv.className = 'col';
            const cardDiv = document.createElement('div');
            cardDiv.className = 'card profile-card h-100';
            cardDiv.dataset.index = index.toString();

            const cardBody = document.createElement('div');
            cardBody.className = 'card-body text-center';

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

            cardDiv.appendChild(cardBody);
            colDiv.appendChild(cardDiv);
            this.profileCardsContainer.appendChild(colDiv);

            // Add event listener for selection
            cardDiv.addEventListener('click', () => this.handleProfileCardClick(index));
        });

        // Highlight the first profile by default
        const firstCard = this.profileCardsContainer.querySelector('.card');
        if (firstCard) {
            firstCard.classList.add('selected-profile');
        }
    }

    /**
     * Handle profile card click event.
     * @param {number} index Index of the selected profile.
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
        const selectedProfile = this.profiles[this.selectedProfileIndex];
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

        // Calculate total weights
        let totalWeights = 0;
        profile.criteria.forEach(criterion => {
            totalWeights += criterion.weight;
        });

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
                return Object.assign({}, criterion, { adjustedWeight: adjustedWeight });
            });
        } else {
            // No adjustment needed
            this.adjustedCriteria = profile.criteria.map(criterion => {
                return Object.assign({}, criterion, { adjustedWeight: criterion.weight });
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
     * @param {!Object} criterion The criterion object.
     * @param {number} score The current score value.
     * @return {string}
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
     */
    calculateAndDisplayResults() {
        try {
            const scores = this.getScores();
            const weightedScores = this.calculateWeightedScores(scores);
            const totalScore = this.calculateTotalScore(weightedScores);
            const percentageLikelihood = (totalScore / 100) * 100;

            // Display results
            this.percentageLikelihoodElement.textContent = percentageLikelihood.toFixed(2) + '%';

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
     * @return {!Array<!Object>}
     */
    getScores() {
        const scoreInputs = this.criteriaTableBody.querySelectorAll('input[type="range"]');
        const scores = [];
        scoreInputs.forEach((input, index) => {
            const score = parseFloat(input.value);
            const weight = parseFloat(this.adjustedCriteria[index].adjustedWeight);
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
     * Update the pie chart based on the current scores and options.
     * @param {number} percentageLikelihood The percentage likelihood.
     * @param {!Array<!Object>} scores The scores and weights.
     */
    updateChart(percentageLikelihood, scores) {
        const pieChartOption = document.querySelector('input[name="pieChartOption"]:checked').value;

        const labels = [];
        const data = [];
        const backgroundColors = [];

        // Prepare data for the chart
        scores.forEach((item, index) => {
            const criterion = this.adjustedCriteria[index];
            labels.push(criterion.metric);

            let value = 0;
            if (pieChartOption === '100') {
                // Display based on full 100%
                value = ((item.score - 1) * item.weight) / 4;
            } else if (pieChartOption === 'likelihood') {
                // Display based on percentage likelihood
                const totalWeightedScore = ((item.score - 1) * item.weight) / 4;
                value = (totalWeightedScore / 100) * percentageLikelihood;
            }
            data.push(value);

            // Assign colours
            const color = this.getColor(index);
            backgroundColors.push(color);
        });

        // If the chart already exists, update it; otherwise, create it
        if (this.likelihoodChart) {
            this.likelihoodChart.data.labels = labels;
            this.likelihoodChart.data.datasets[0].data = data;
            this.likelihoodChart.data.datasets[0].backgroundColor = backgroundColors;
            this.likelihoodChart.update();
        } else {
            const ctx = document.getElementById('likelihoodChart').getContext('2d');
            this.likelihoodChart = new Chart(ctx, {
                type: 'pie',
                data: {
                    labels: labels,
                    datasets: [{
                        data: data,
                        backgroundColor: backgroundColors
                    }]
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
                                            index: i
                                        };
                                    });
                                }
                            }
                        }
                    }
                }
            });
        }
    }

    /**
     * Generate a colour based on the index.
     * @param {number} index The index of the data point.
     * @return {string} The hexadecimal colour code.
     */
    getColor(index) {
        const colors = [
            '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0',
            '#9966FF', '#FF9F40', '#C9CBCF', '#FF6384',
            '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF',
            '#FF9F40', '#C9CBCF'
        ];
        return colors[index % colors.length];
    }

    /**
     * Handle copy button click event.
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
     */
    generateResultsHTML() {
        const investorName = this.investorSelect.value;
        const profileName = this.profiles[this.selectedProfileIndex].name;

        let html = '<div>';

        // Investor details
        html += `<h2>Investor Name: ${investorName}</h2>`;

        // Investor Image
        const investorImageSrc = this.investorImage.src;
        if (investorImageSrc) {
            html += `<img src="${investorImageSrc}" alt="Investor Image" style="max-width: 200px;"/>`;
        }

        // Profile Name
        html += `<h3>Profile: ${profileName}</h3>`;

        // Criteria Table
        html += '<table border="1" cellpadding="5" cellspacing="0">';
        html += '<tr><th>Metric</th><th>Description</th><th>Score</th><th>Descriptor</th></tr>';

        const rows = this.criteriaTableBody.querySelectorAll('tr');
        rows.forEach((row) => {
            const cells = row.querySelectorAll('td');
            const metricCell = cells[0].textContent || '';
            const descriptionCell = cells[1].textContent || '';
            const inputElement = cells[2].querySelector('input[type="range"]');
            const scoreValue = inputElement.value;
            const descriptorCell = cells[3].textContent || '';

            html += `<tr><td>${metricCell.trim()}</td><td>${descriptionCell.trim()}</td><td>${scoreValue}</td><td>${descriptorCell.trim()}</td></tr>`;
        });
        html += '</table>';

        // Results
        html += `<p>Percentage Likelihood: ${this.percentageLikelihoodElement.textContent}</p>`;

        // Pie Chart as Image
        if (this.likelihoodChart) {
            const chartDataURL = this.likelihoodChart.toBase64Image();
            html += `<img src="${chartDataURL}" alt="Likelihood Chart" />`;
        }

        html += '</div>';

        return html;
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

        // Load investor image
        const investorName = this.investorSelect.value;
        const investors = this.getInvestorsFromLocalStorage();
        const investorData = investors[investorName];
        if (investorData && investorData.image) {
            this.investorImage.src = investorData.image;
            this.investorImage.style.display = 'block';
        } else {
            this.investorImage.src = '';
            this.investorImage.style.display = 'none';
        }
    }

    /**
     * Save user inputs and results to local storage.
     */
    saveInputsAndResults() {
        const investorName = this.investorSelect.value;
        if (!investorName) {
            return;
        }
        const profileName = this.profiles[this.selectedProfileIndex].name;
        const scores = this.getScores();
        const percentageLikelihood = this.percentageLikelihoodElement.textContent || '0%';

        const investors = this.getInvestorsFromLocalStorage();
        if (!investors[investorName]) {
            investors[investorName] = {};
        }
        investors[investorName][profileName] = {
            scores: scores,
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
        const profileName = this.profiles[this.selectedProfileIndex].name;

        const investors = this.getInvestorsFromLocalStorage();
        const investorData = investors[investorName];
        if (investorData && investorData[profileName]) {
            const savedData = investorData[profileName];
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
                descriptorText.textContent = '';
            });
            this.percentageLikelihoodElement.textContent = '0%';
        }

        // Load investor image
        if (investorData && investorData.image) {
            this.investorImage.src = investorData.image;
            this.investorImage.style.display = 'block';
        } else {
            this.investorImage.src = '';
            this.investorImage.style.display = 'none';
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
            const investorData = investors[investorName];
            const listItem = document.createElement('li');
            listItem.classList.add('list-group-item', 'd-flex', 'align-items-center');
            listItem.dataset.name = investorName;

            // Investor Image
            const investorProfiles = investorData;
            const profilesCount = Object.keys(investorProfiles).filter((key) => key !== 'image').length;
            const imageSrc = investorData.image || '';

            if (imageSrc) {
                const imgElement = document.createElement('img');
                imgElement.src = imageSrc;
                imgElement.alt = 'Investor Image';
                imgElement.classList.add('img-thumbnail', 'me-2');
                imgElement.style.width = '50px';
                imgElement.style.height = '50px';
                listItem.appendChild(imgElement);
            }

            // Investor Name and Profile Count
            const textContent = document.createElement('div');
            textContent.textContent = `${investorName} - ${profilesCount} profile(s) saved`;
            listItem.appendChild(textContent);

            this.investorListElement.appendChild(listItem);

            // Add click event to open modal
            listItem.addEventListener('click', () => this.handleInvestorListItemClick(investorName));
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
            this.displayCriteria(this.profiles[this.selectedProfileIndex]);
            this.investorImage.src = '';
            this.investorImage.style.display = 'none';
        }
    }

    /**
     * Handle investor list item click event to open modal.
     * @param {string} investorName The name of the investor to edit.
     */
    handleInvestorListItemClick(investorName) {
        this.currentEditingInvestorName = investorName;
        const investors = this.getInvestorsFromLocalStorage();
        const investorData = investors[investorName];

        // Load existing image
        if (investorData && investorData.image) {
            this.modalInvestorImagePreview.src = investorData.image;
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
     * Handle modal investor image upload.
     * @param {!Event} event The change event.
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
     * Handle investor edit form submission.
     * @param {!Event} event The submit event.
     */
    handleInvestorEditFormSubmit(event) {
        event.preventDefault();

        const investors = this.getInvestorsFromLocalStorage();
        const investorData = investors[this.currentEditingInvestorName];

        // Save image if available
        if (this.modalInvestorImagePreview.src) {
            if (!investorData) {
                investors[this.currentEditingInvestorName] = {};
            }
            investors[this.currentEditingInvestorName].image = this.modalInvestorImagePreview.src;
        }

        this.saveInvestorsToLocalStorage(investors);
        this.loadInvestorList();

        // Update image if the current investor is selected
        if (this.investorSelect.value === this.currentEditingInvestorName) {
            this.investorImage.src = this.modalInvestorImagePreview.src;
            this.investorImage.style.display = 'block';
        }

        // Close modal
        this.investorEditModalInstance.hide();
    }

    /**
     * Handle the display of the explainer section based on visit count.
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
        explainerElement.querySelector('[data-bs-toggle="collapse"]').addEventListener('click', () => {
            const isExpanded = explainerContent.classList.contains('show');
            if (isExpanded) {
                localStorage.setItem('explainerCollapsed', 'true');
            } else {
                localStorage.setItem('explainerCollapsed', 'false');
            }
        });
    }
}

// Initialise the Investment Likelihood Calculator application
window.addEventListener('load', () => {
    new InvestmentLikelihoodCalculator();
});