/**
 * Configurateur d'Écrans LED - Main JavaScript file
 * 
 * Ce fichier gère toutes les interactions utilisateur du configurateur d'écrans LED,
 * y compris la recherche de clients dans KARLIA, la gestion du formulaire, et
 * le calcul des configurations.
 */

// ==========================================================================
// INITIALISATION
// ==========================================================================

document.addEventListener('DOMContentLoaded', function() {
    // Initialisation de la progression
    updateProgress();
    
    // Associer les événements pour les champs conditionnels
    initConditionalFields();
    
    // Associer les événements pour les sliders
    initRangeSliders();
    
    // Associer les événements pour les options d'écran spécial
    initScreenTypeOptions();
    
    // Associer les événements pour la mise à jour automatique de la luminosité
    initBrightnessUpdates();
    
    // Associer l'événement pour le pitch recommandé en fonction de la distance
    initPitchRecommendation();
    
    // Initialiser la recherche de clients KARLIA
    initKarliaSearch();
    
    // Initialiser le formulaire de configuration
    initConfigForm();
    
    // Initialiser les actions des boutons de résultat
    initResultButtons();
    
    console.log("Configurateur d'écrans LED initialisé avec succès.");
});

// ==========================================================================
// FONCTIONS D'INITIALISATION
// ==========================================================================

/**
 * Mise à jour de la barre de progression
 */
function updateProgress() {
    const totalSections = 10; // 10 sections au total (0-9)
    const visibleSections = totalSections;
    const progress = (visibleSections / totalSections) * 100;
    document.getElementById('progressFill').style.width = `${progress}%`;
}

/**
 * Initialisation des champs conditionnels qui apparaissent/disparaissent
 * en fonction d'autres sélections.
 */
function initConditionalFields() {
    // Afficher/masquer le champ "Précisez l'usage"
    document.getElementById('screenPurpose').addEventListener('change', function() {
        document.getElementById('otherPurposeGroup').style.display = 
            this.value === 'autre' ? 'block' : 'none';
    });
    
    // Afficher/masquer le champ "Précisez la méthode d'installation"
    document.getElementById('mountingMethod').addEventListener('change', function() {
        document.getElementById('otherMountingGroup').style.display = 
            this.value === 'autre' ? 'block' : 'none';
    });
}

/**
 * Initialisation des sliders avec affichage en temps réel des valeurs
 */
function initRangeSliders() {
    // Rayon de courbure (écrans flex)
    document.getElementById('flexCurveRadius').addEventListener('input', function() {
        document.getElementById('flexRadiusValue').textContent = `${this.value} m`;
    });
    
    // Transparence (écrans transparents)
    document.getElementById('transparencyLevel').addEventListener('input', function() {
        const value = this.value;
        document.getElementById('transparencyValue').textContent = `${value}%`;
        document.getElementById('transparencyOverlay').style.opacity = (100 - value) / 100;
    });
    
    // Semi-transparence (écrans semi-transparents)
    document.getElementById('semiTransparencyLevel').addEventListener('input', function() {
        const value = this.value;
        document.getElementById('semiTransparencyValue').textContent = `${value}%`;
        document.getElementById('semiTransparencyOverlay').style.opacity = (100 - value) / 100;
    });
}

/**
 * Initialisation des options spécifiques au type d'écran
 */
function initScreenTypeOptions() {
    const screenTypes = [
        { id: 'screenTypeStandard', options: null },
        { id: 'screenTypeCubic', options: 'cubicOptions' },
        { id: 'screenTypeFlex', options: 'flexOptions' },
        { id: 'screenTypeTransparent', options: 'transparentOptions' },
        { id: 'screenTypeSemiTransparent', options: 'semiTransparentOptions' }
    ];
    
    screenTypes.forEach(type => {
        document.getElementById(type.id).addEventListener('change', function() {
            if (!this.checked) return;
            
            // Masquer toutes les options spéciales
            screenTypes.forEach(t => {
                if (t.options) {
                    document.getElementById(t.options).style.display = 'none';
                }
            });
            
            // Afficher les options correspondantes au type sélectionné
            if (type.options) {
                document.getElementById(type.options).style.display = 'block';
            }
        });
    });
}

/**
 * Initialisation de la mise à jour automatique de la luminosité en fonction
 * de l'environnement et de l'exposition au soleil
 */
function initBrightnessUpdates() {
    function updateBrightness() {
        const environment = document.querySelector('input[name="environment"]:checked').value;
        const sunExposure = document.querySelector('input[name="sunExposure"]:checked').value;
        const brightnessSelect = document.getElementById('brightness');
        
        if (environment === 'outdoor') {
            if (sunExposure === 'yes') {
                brightnessSelect.value = '7500';
            } else if (sunExposure === 'partial') {
                brightnessSelect.value = '5000';
            } else {
                brightnessSelect.value = '2500';
            }
        } else { // indoor
            if (sunExposure === 'yes') {
                brightnessSelect.value = '2500';
            } else if (sunExposure === 'partial') {
                brightnessSelect.value = '1000';
            } else {
                brightnessSelect.value = '800';
            }
        }
    }
    
    // Associer les événements pour la mise à jour automatique de la luminosité
    document.querySelectorAll('input[name="environment"], input[name="sunExposure"]').forEach(function(elem) {
        elem.addEventListener('change', updateBrightness);
    });
}

/**
 * Initialisation de la recommandation de pitch en fonction de la distance de visualisation
 */
function initPitchRecommendation() {
    document.getElementById('viewingDistance').addEventListener('change', function() {
        const pitchSelect = document.getElementById('pitchPreference');
        
        if (this.value === 'proche') {
            pitchSelect.value = '1.9';
        } else if (this.value === 'moyen') {
            pitchSelect.value = '2.6';
        } else if (this.value === 'loin') {
            pitchSelect.value = '3.9';
        } else if (this.value === 'très loin') {
            pitchSelect.value = '5.9';
        }
    });
}

// ==========================================================================
// INTÉGRATION AVEC KARLIA
// ==========================================================================

/**
 * Initialisation de la recherche client KARLIA
 */
function initKarliaSearch() {
    // Récupération des éléments du DOM
    const searchInput = document.getElementById('clientSearch');
    const searchButton = document.getElementById('searchClientBtn');
    const searchResults = document.getElementById('searchResults');
    const clientResults = document.getElementById('clientResults');
    const clientSourceIndicator = document.getElementById('clientSourceIndicator');
    
    // Fonction de debounce pour limiter les appels
    function debounce(func, wait) {
        let timeout;
        return function() {
            const context = this, args = arguments;
            clearTimeout(timeout);
            timeout = setTimeout(() => {
                func.apply(context, args);
            }, wait);
        };
    }
    
    // Fonction pour effectuer la recherche
    function performSearch() {
        const query = searchInput.value.trim();
        
        // Ne pas rechercher si moins de 3 caractères
        if (query.length < 3) {
            searchResults.style.display = 'none';
            return;
        }
        
        // Afficher l'indicateur de chargement
        clientResults.innerHTML = '<div class="loading-indicator"><div class="spinner"></div><p>Recherche en cours...</p></div>';
        searchResults.style.display = 'block';
        
        // Appel au proxy PHP
        fetch(`karlia-contacts.php?q=${encodeURIComponent(query)}`)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Erreur de communication avec le serveur');
                }
                return response.json();
            })
            .then(data => {
                displayResults(data);
            })
            .catch(error => {
                console.error('Erreur de recherche:', error);
                clientResults.innerHTML = `<div class="error-message"><i class="fas fa-exclamation-circle"></i> ${error.message}</div>`;
            });
    }
    
    // Fonction pour afficher les résultats
    function displayResults(data) {
        // Vider les résultats précédents
        clientResults.innerHTML = '';
        
        // Vérifier si des résultats sont disponibles
        if (!data.items || data.items.length === 0) {
            clientResults.innerHTML = '<div class="no-results">Aucun client trouvé. Veuillez créer un nouveau client.</div>';
            return;
        }
        
        // Créer une liste pour les résultats
        const resultsList = document.createElement('ul');
        resultsList.className = 'clients-list';
        
        // Ajouter chaque client à la liste
        data.items.forEach(client => {
            const listItem = document.createElement('li');
            listItem.className = 'client-item';
            
            // Créer le contenu de l'élément
            listItem.innerHTML = `
                <div class="client-name">${client.name || 'Sans nom'}</div>
                <div class="client-details">
                    ${client.email ? `<div><i class="fas fa-envelope"></i> ${client.email}</div>` : ''}
                    ${client.phone ? `<div><i class="fas fa-phone"></i> ${client.phone}</div>` : ''}
                    ${client.company ? `<div><i class="fas fa-building"></i> ${client.company}</div>` : ''}
                </div>
            `;
            
            // Ajouter un gestionnaire d'événements pour la sélection du client
            listItem.addEventListener('click', () => {
                selectClient(client);
            });
            
            resultsList.appendChild(listItem);
        });
        
        clientResults.appendChild(resultsList);
    }
    
    // Fonction pour sélectionner un client
    function selectClient(client) {
        // Remplir les champs du formulaire
        document.getElementById('clientName').value = client.name || client.company || '';
        document.getElementById('clientEmail').value = client.email || '';
        document.getElementById('clientPhone').value = client.phone || '';
        document.getElementById('clientAddress').value = client.address || '';
        
        // Afficher l'indicateur "Importé de KARLIA"
        clientSourceIndicator.style.display = 'block';
        
        // Masquer les résultats de recherche
        searchResults.style.display = 'none';
        
        // Réinitialiser le champ de recherche
        searchInput.value = '';
    }
    
    // Attacher les événements
    searchInput.addEventListener('input', debounce(performSearch, 300));
    searchButton.addEventListener('click', performSearch);
    
    // Permettre la recherche avec la touche Entrée
    searchInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            e.preventDefault();
            performSearch();
        }
    });
}

// ==========================================================================
// TRAITEMENT DU FORMULAIRE
// ==========================================================================

/**
 * Initialisation du formulaire
 */
function initConfigForm() {
    document.getElementById('configForm').addEventListener('submit', submitForm);
}

/**
 * Soumission du formulaire
 * @param {Event} e - Événement de soumission
 */
function submitForm(e) {
    e.preventDefault();
    
    // Afficher le chargement
    document.getElementById('loading').style.display = 'block';
    document.getElementById('results').style.display = 'none';
    
    // Récupérer toutes les données du formulaire
    const formData = new FormData(this);
    const formObject = {};
    
    formData.forEach((value, key) => {
        // Conversion des valeurs booléennes
        if (value === 'true') value = true;
        if (value === 'false') value = false;
        
        // Conversion des valeurs numériques
        if (key === 'width' || key === 'height' || key === 'numScreens' || 
            key === 'pitch' || key === 'brightness' || key === 'flexCurveRadius' ||
            key === 'cubeFaces' || key === 'flexAngle' || key === 'transparencyLevel' ||
            key === 'semiTransparencyLevel') {
            value = parseFloat(value);
        }
        
        formObject[key] = value;
    });
    
    // Récupérer l'état des toggles
    formObject.separateDisplays = document.getElementById('separateDisplaysYes').checked;
    formObject.redundancy = document.getElementById('redundancyYes').checked;
    formObject.allInOne = document.getElementById('allInOneYes').checked ? "yes" : "no";
    formObject.maintenanceContract = document.getElementById('maintenanceYes').checked ? "yes" : "no";
    formObject.rapidSAV = document.getElementById('rapidSAVYes').checked ? "yes" : "no";
    formObject.rearProjection = document.getElementById('rearProjection')?.checked || false;
    
    // URL de l'API (webhook N8N)
    const webhookUrl = 'https://n8n.tecaled.fr/webhook-test/led-config';
    
    // Simulation d'une réponse pour la démonstration (à remplacer par l'appel API réel)
    setTimeout(() => {
        processConfigResults(formObject);
    }, 1500); // Simuler un délai de chargement
    
    // Pour un vrai appel API, utilisez le code suivant:
    /*
    fetch(webhookUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(formObject)
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Erreur réseau');
        }
        return response.json();
    })
    .then(data => {
        processConfigResults(data);
    })
    .catch(error => {
        console.error('Erreur:', error);
        document.getElementById('loading').style.display = 'none';
        alert('Une erreur est survenue lors du traitement de votre demande. Veuillez réessayer.');
    });
    */
}

/**
 * Traitement des résultats de configuration
 * @param {Object} formData - Données du formulaire
 */
function processConfigResults(formData) {
    // Masquer le chargement
    document.getElementById('loading').style.display = 'none';
    
    // Simuler une réponse (à remplacer par la vraie réponse de l'API)
    const data = simulateResponse(formData);
    
    // Projet résumé
    const clientName = document.getElementById('clientName').value;
    document.getElementById('projectSummary').textContent = 
        `Client: ${clientName} | Type: ${formData.screenPurpose} | Environnement: ${formData.environment}`;
    
    // Dimensions
    document.getElementById('dimensions').textContent = 
        `Dimensions réelles: ${data.dimensions.actualWidth}×${data.dimensions.actualHeight} m`;
    
    // Panneaux et résolution
    document.getElementById('panels').textContent = 
        `Configuration: ${data.panels.configuration}, Total: ${data.panels.total} dalles`;
    
    document.getElementById('resolution').textContent = 
        `Pitch: ${formData.pitchPreference || "3.9"}mm | Pixels par écran: ${data.resolution.perScreen.toLocaleString()}, 
        Pixels totaux: ${data.resolution.total.toLocaleString()}`;
    
    // Matériel
    let hardwareHtml = '<h4>Processeurs</h4><ul class="processor-list">';
    data.hardware.processors.forEach(proc => {
        hardwareHtml += `
            <li class="processor-item">
                <div class="processor-info">
                    <div class="processor-model">${proc.model}</div>
                    <div class="processor-screen">Écran ${proc.screen || 'Tous'}</div>
                </div>
                <div class="processor-usage">${proc.capacityUtilization}</div>
            </li>`;
    });
    hardwareHtml += `</ul>`;
    hardwareHtml += `<p>Bumpers nécessaires: ${data.hardware.bumpers}</p>`;
    hardwareHtml += `<p>Câbles RJ45: ${data.hardware.cables}</p>`;
    hardwareHtml += `<p>Alimentations: ${data.hardware.powerSupplies}</p>`;
    
    // Ajouter des informations spécifiques pour les écrans spéciaux si nécessaire
    if (data.specialScreenInfo) {
        hardwareHtml += `<h4>Configuration spéciale</h4>`;
        hardwareHtml += `<p>${data.specialScreenInfo}</p>`;
    }
    
    document.getElementById('hardware').innerHTML = hardwareHtml;
    
    // Tarification
    const pricingBody = document.getElementById('pricingBody');
    pricingBody.innerHTML = '';
    
    data.pricing.items.forEach(item => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${item.description}</td>
            <td>${item.quantity}</td>
            <td class="price">${item.unitPrice.toLocaleString()}€</td>
            <td class="price">${item.total.toLocaleString()}€</td>
        `;
        pricingBody.appendChild(row);
    });
    
    document.getElementById('totalPrice').textContent = `${data.pricing.totalPrice.toLocaleString()}€ HT`;
    
    // Afficher les résultats
    document.getElementById('results').style.display = 'block';
    
    // Faire défiler jusqu'aux résultats
    document.getElementById('results').scrollIntoView({ behavior: 'smooth' });
}

/**
 * Initialisation des boutons d'action dans les résultats
 */
function initResultButtons() {
    document.getElementById('generatePdf').addEventListener('click', function() {
        alert('La génération de PDF sera implémentée dans la version complète.');
    });
    
    document.getElementById('saveConfig').addEventListener('click', function() {
        alert('L\'enregistrement de la configuration sera implémenté dans la version complète.');
    });
    
    document.getElementById('sendByEmail').addEventListener('click', function() {
        alert('L\'envoi par email sera implémenté dans la version complète.');
    });
}

// ==========================================================================
// FONCTIONS DE SIMULATION (À REMPLACER PAR DE VRAIES APIS)
// ==========================================================================

/**
 * Simulation de réponse API pour démonstration
 * @param {Object} formData - Données du formulaire
 * @returns {Object} Données de configuration calculées
 */
function simulateResponse(formData) {
    // Cette fonction simule la réponse que vous obtiendriez de N8N
    // À remplacer par le vrai appel API quand vous serez prêt
    
    const screenType = formData.screenType || "standard";
    const width = formData.width;
    const height = formData.height;
    const numScreens = formData.numScreens;
    const pitch = formData.pitchPreference || 3.9;
    const panelSize = formData.panelSize || "500x500";
    const [panelWidth, panelHeight] = panelSize.split("x").map(dim => parseInt(dim, 10));
    
    // Calculs de base similaires à ceux du backend
    let panelsWide = Math.ceil(width * 1000 / panelWidth);
    let panelsHigh = Math.ceil(height * 1000 / panelHeight);
    let panelsPerScreen = panelsWide * panelsHigh;
    let totalPanels = panelsPerScreen * numScreens;
    
    const pixelsPerPanelW = Math.round(panelWidth / pitch);
    const pixelsPerPanelH = Math.round(panelHeight / pitch);
    const pixelsPerPanel = pixelsPerPanelW * pixelsPerPanelH;
    const pixelsPerScreen = pixelsPerPanel * panelsPerScreen;
    const totalPixels = pixelsPerScreen * numScreens;
    
    // Facteur de prix selon le type d'écran
    let priceMultiplier = 1;
    let specialScreenInfo = null;
    
    if (screenType === "cubic") {
        priceMultiplier = 1.4;
        specialScreenInfo = `Structure cubique avec ${formData.cubeFaces} faces visibles par cube. `;
        specialScreenInfo += `Disposition en ${formData.cubeArrangement === "grid" ? "grille régulière" : 
                          formData.cubeArrangement === "pyramid" ? "pyramide" : 
                          formData.cubeArrangement === "random" ? "arrangement irrégulier" : "configuration personnalisée"}.`;
    } else if (screenType === "flex") {
        priceMultiplier = formData.flexAngle > 180 ? 1.5 : 1.3;
        specialScreenInfo = `Écran flexible avec un rayon de ${formData.flexCurveRadius}m et un angle de ${formData.flexAngle}°. `;
        specialScreenInfo += `Montage sur ${formData.flexMounting === "wall" ? "mur courbe" : 
                          formData.flexMounting === "column" ? "colonne/pilier" : 
                          formData.flexMounting === "suspended" ? "structure suspendue" : "structure autoportante"}.`;
    } else if (screenType === "transparent") {
        priceMultiplier = 2.2;
        specialScreenInfo = `Écran transparent avec ${formData.transparencyLevel}% de transparence. `;
        specialScreenInfo += `Application: ${formData.transparentApplication}. `;
        if (formData.rearProjection) {
            specialScreenInfo += "Compatible avec l'arrière-projection.";
        }
    } else if (screenType === "semitransparent") {
        priceMultiplier = 1.8;
        specialScreenInfo = `Écran semi-transparent avec ${formData.semiTransparencyLevel}% de transparence. `;
        specialScreenInfo += `Densité de pixels: ${formData.pixelDensity}.`;
    }
    
    // Base de prix simulée
    let panelBasePrice = 120;
    
    // Ajuster le prix des dalles selon l'environnement et la luminosité
    if (formData.environment === "outdoor") {
        if (formData.brightness >= 5000) {
            panelBasePrice = 250;
        } else {
            panelBasePrice = 180;
        }
    } else { // indoor
        if (formData.brightness >= 2500) {
            panelBasePrice = 150;
        }
    }
    
    // Ajuster le prix pour le pitch plus fin
    if (pitch <= 2.6) {
        panelBasePrice *= 1.5;
    } else if (pitch <= 1.9) {
        panelBasePrice *= 2.2;
    }
    
    // Appliquer le multiplicateur pour les écrans spéciaux
    panelBasePrice *= priceMultiplier;
    
    // Calculer le prix total
    const totalPrice = Math.round(totalPanels * panelBasePrice) + 
                       (numScreens * 1200) + 
                       (Math.ceil(totalPanels * (screenType === "standard" ? 0.5 : 0.7)) * 45) + 
                       ((formData.redundancy ? 2 : 1) * numScreens * 12) + 
                       (numScreens * 85);
    
    // Générer la réponse
    return {
        dimensions: {
            actualWidth: (panelsWide * panelWidth / 1000).toFixed(2),
            actualHeight: (panelsHigh * panelHeight / 1000).toFixed(2)
        },
        panels: {
            perScreen: panelsPerScreen,
            total: totalPanels,
            configuration: `${panelsWide}×${panelsHigh} par écran`
        },
        resolution: {
            perPanel: pixelsPerPanel,
            perScreen: pixelsPerScreen,
            total: totalPixels
        },
        hardware: {
            processors: [
                {
                    screen: 1,
                    model: "VX400",
                    portsUsed: formData.redundancy ? 2 : 1,
                    capacityUtilization: "9.5%"
                },
                {
                    screen: 2,
                    model: "VX400",
                    portsUsed: formData.redundancy ? 2 : 1,
                    capacityUtilization: "9.5%"
                }
            ],
            bumpers: Math.ceil(totalPanels * (screenType === "standard" ? 0.5 : 0.7)),
            cables: (formData.redundancy ? 2 : 1) * numScreens,
            powerSupplies: numScreens
        },
        specialScreenInfo: specialScreenInfo,
        pricing: {
            items: [
                {
                    description: `Dalles LED ${pitch}mm (${formData.environment === "outdoor" ? "Extérieur" : "Intérieur"}, ${formData.brightness} nits)${screenType !== "standard" ? " - " + 
                    (screenType === "cubic" ? "Cubique" : 
                     screenType === "flex" ? "Flexible" : 
                     screenType === "transparent" ? "Transparent" : "Semi-transparent") : ""}`,
                    quantity: totalPanels,
                    unitPrice: Math.round(panelBasePrice),
                    total: Math.round(totalPanels * panelBasePrice)
                },
                {
                    description: "Processeurs",
                    quantity: numScreens,
                    unitPrice: 1200,
                    total: numScreens * 1200
                },
                {
                    description: "Bumpers",
                    quantity: Math.ceil(totalPanels * (screenType === "standard" ? 0.5 : 0.7)),
                    unitPrice: 45,
                    total: Math.ceil(totalPanels * (screenType === "standard" ? 0.5 : 0.7)) * 45
                },
                {
                    description: "Câbles RJ45",
                    quantity: (formData.redundancy ? 2 : 1) * numScreens,
                    unitPrice: 12,
                    total: (formData.redundancy ? 2 : 1) * numScreens * 12
                },
                {
                    description: "Alimentations",
                    quantity: numScreens,
                    unitPrice: 85,
                    total: numScreens * 85
                }
            ],
            totalPrice: totalPrice
        }
    };
}