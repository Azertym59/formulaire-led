/**
 * Configurateur d'Écrans LED - Main JavaScript file
 * 
 * Ce fichier gère toutes les interactions utilisateur du configurateur d'écrans LED,
 * y compris la recherche de clients dans KARLIA, la gestion du formulaire, et
 * le calcul des configurations.
 */

// ==========================================================================
// CONSTANTES ET CONFIGURATION
// ==========================================================================

// Configuration KARLIA - URL correcte
const KARLIA_API_KEY = 'polopq-kpjsos-213914-1bj1ck-ppgwe2';
const KARLIA_API_BASE_URL = '/api-proxy/app/api/v2'; // URL correcte avec version v2

// Configuration de débogage
const DEBUG = true; // Mettre à false en production

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
    
    // Afficher un message dans la console pour le débogage
    if (DEBUG) {
        console.log("Pour tester l'API KARLIA, exécutez window.testKarliaAPI() dans la console");
    }
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
    document.getElementById('searchClientBtn').addEventListener('click', searchClient);
}

/**
 * Rechercher un client dans KARLIA
 */
async function searchClient() {
    const searchTerm = document.getElementById('clientSearch').value.trim();
    
    if (searchTerm.length < 2) {
        alert('Veuillez saisir au moins 2 caractères pour la recherche.');
        return;
    }
    
    // Afficher un indicateur de chargement
    document.getElementById('clientResults').innerHTML = '<p>Recherche en cours...</p>';
    document.getElementById('searchResults').style.display = 'block';
    
    try {
        // Effectuer la recherche
        const contacts = await searchKarliaClients(searchTerm);
        
        // Afficher les résultats
        if (!contacts || contacts.length === 0) {
            document.getElementById('clientResults').innerHTML = '<p>Aucun contact trouvé.</p>';
        } else {
            displaySearchResults(contacts);
        }
    } catch (error) {
        document.getElementById('clientResults').innerHTML = `<p class="error">Erreur lors de la recherche: ${error.message}</p>`;
    }
}

/**
 * Affiche les résultats de recherche dans l'interface
 * @param {Array} contacts - Liste des contacts trouvés
 */
function displaySearchResults(contacts) {
    let resultsHtml = '<div class="client-list">';
    
    contacts.forEach(contact => {
        // Adapter ces propriétés à la structure réelle de KARLIA
        const name = contact.first_name || contact.firstName || '';
        const lastName = contact.last_name || contact.lastName || '';
        const company = contact.company || '';
        const email = contact.email || '';
        const id = contact.id || '';
        
        resultsHtml += `
            <div class="client-item" data-client-id="${id}">
                <div class="client-name">${company ? company : `${name} ${lastName}`}</div>
                <div class="client-detail">
                    ${company ? `${name} ${lastName} | ` : ''}
                    ${email}
                </div>
            </div>
        `;
    });
    
    resultsHtml += '</div>';
    document.getElementById('clientResults').innerHTML = resultsHtml;
    
    // Ajouter les événements de clic pour sélectionner un client
    document.querySelectorAll('.client-item').forEach(item => {
        item.addEventListener('click', selectClient);
    });
}

/**
 * Sélectionner un client dans les résultats de recherche
 */
async function selectClient() {
    const clientId = this.getAttribute('data-client-id');
    
    try {
        // Afficher un indicateur de chargement
        this.classList.add('loading');
        
        const clientDetails = await getKarliaClientDetails(clientId);
        
        if (clientDetails) {
            populateClientFields(clientDetails);
            document.getElementById('searchResults').style.display = 'none';
            document.getElementById('clientSearch').value = '';
        } else {
            alert('Impossible de récupérer les détails du contact.');
        }
    } catch (error) {
        alert(`Erreur: ${error.message}`);
    } finally {
        this.classList.remove('loading');
    }
}

/**
 * Recherche de contacts dans KARLIA
 * @param {string} query - Terme de recherche
 * @returns {Array} Liste des contacts correspondants
 */
async function searchKarliaClients(query) {
    try {
        const encodedQuery = encodeURIComponent(query);
        
        // Utilisation de l'URL correcte avec v2
        const response = await fetch(`${KARLIA_API_BASE_URL}/contacts?q=${encodedQuery}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${KARLIA_API_KEY}`,
                'Accept': 'application/json'
            }
        });
        
        if (!response.ok) {
            throw new Error(`Erreur API: ${response.status}`);
        }
        
        const data = await response.json();
        if (DEBUG) console.log("Données contacts reçues:", data);
        
        // Adapter selon la structure réelle de l'API v2
        return data.items || data.contacts || data.data || data;
    } catch (error) {
        console.error('Erreur lors de la recherche de contacts:', error);
        handleApiError(error, "recherche de contacts");
        return [];
    }
}

/**
 * Obtention des détails d'un contact KARLIA
 * @param {string} contactId - ID du contact
 * @returns {Object} Détails du contact
 */
async function getKarliaClientDetails(contactId) {
    try {
        // Utilisation de l'URL correcte avec v2
        const response = await fetch(`${KARLIA_API_BASE_URL}/contacts/${contactId}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${KARLIA_API_KEY}`,
                'Accept': 'application/json'
            }
        });
        
        if (!response.ok) {
            throw new Error(`Erreur API: ${response.status}`);
        }
        
        const data = await response.json();
        if (DEBUG) console.log("Détails contact reçus:", data);
        
        // Adapter selon la structure réelle de l'API v2
        return data.contact || data.data || data;
    } catch (error) {
        console.error('Erreur lors de la récupération des détails du contact:', error);
        handleApiError(error, "récupération des détails du contact");
        return null;
    }
}

/**
 * Remplit les champs du formulaire avec les données du contact
 * @param {Object} contact - Données du contact KARLIA
 */
function populateClientFields(contact) {
    if (DEBUG) console.log("Remplissage des champs avec:", contact);
    
    // Adaptation basée sur la structure probable des données de l'API KARLIA
    // Ces champs peuvent nécessiter des ajustements selon la structure réelle
    document.getElementById('clientName').value = contact.company 
        ? `${contact.first_name || contact.firstName} ${contact.last_name || contact.lastName} - ${contact.company}` 
        : `${contact.first_name || contact.firstName} ${contact.last_name || contact.lastName}`;
    
    document.getElementById('clientEmail').value = contact.email || '';
    document.getElementById('clientPhone').value = contact.phone || contact.phone_number || '';
    
    // Formater l'adresse selon la structure KARLIA
    const addressParts = [];
    
    // Si l'adresse est un objet complet
    if (contact.address && typeof contact.address === 'object') {
        if (contact.address.street) addressParts.push(contact.address.street);
        if (contact.address.postal_code || contact.address.city) {
            addressParts.push(`${contact.address.postal_code || ''} ${contact.address.city || ''}`.trim());
        }
        if (contact.address.country) addressParts.push(contact.address.country);
    } 
    // Si l'adresse est en propriétés distinctes
    else {
        if (contact.street || contact.address) addressParts.push(contact.street || contact.address);
        if (contact.postal_code || contact.postalCode || contact.city) {
            addressParts.push(`${contact.postal_code || contact.postalCode || ''} ${contact.city || ''}`.trim());
        }
        if (contact.country) addressParts.push(contact.country);
    }
    
    document.getElementById('clientAddress').value = addressParts.join('\n');
    
    // Afficher l'indicateur de source
    document.getElementById('clientSourceIndicator').style.display = 'block';
}

/**
 * Gestion des erreurs API
 * @param {Error} error - Erreur survenue
 * @param {string} operation - Description de l'opération en cours
 */
function handleApiError(error, operation) {
    console.error(`Erreur lors de ${operation}:`, error);
    
    let message = "Une erreur est survenue lors de la communication avec KARLIA.";
    
    if (error.message.includes('401')) {
        message = "Erreur d'authentification. Vérifiez votre clé API KARLIA.";
    } else if (error.message.includes('404')) {
        message = "Ressource non trouvée. Vérifiez les identifiants et URLs.";
    } else if (error.message.includes('5')) {
        message = "Erreur serveur KARLIA. Veuillez réessayer plus tard.";
    }
    
    alert(message);
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

// ==========================================================================
// FONCTIONS DE TEST ET DE DÉBOGAGE
// ==========================================================================

/**
 * Fonction de test pour l'API KARLIA v2
 * À utiliser dans la console du navigateur
 */
window.testKarliaAPI = async function() {
    try {
        console.log("Test de connexion à l'API KARLIA v2...");
        
        // Test simple pour vérifier l'authentification
        const response = await fetch(`${KARLIA_API_BASE_URL}/contacts?limit=1`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${KARLIA_API_KEY}`,
                'Accept': 'application/json'
            }
        });
        
        if (!response.ok) {
            throw new Error(`Erreur API: ${response.status} - ${response.statusText}`);
        }
        
        const data = await response.json();
        console.log("Test de connexion réussi - Réponse:", data);
        
        // Test de récupération des contacts (limité à 5)
        const contactsResponse = await fetch(`${KARLIA_API_BASE_URL}/contacts?limit=5`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${KARLIA_API_KEY}`,
                'Accept': 'application/json'
            }
        });
        
        if (!contactsResponse.ok) {
            throw new Error(`Erreur API contacts: ${contactsResponse.status} - ${contactsResponse.statusText}`);
        }
        
        const contactsData = await contactsResponse.json();
        console.log("Exemple de contacts récupérés:", contactsData);
        
        // Analyse de la structure pour comprendre le format des données dans v2
        console.log("Structure de la réponse:", {
            "Type de données": typeof contactsData,
            "Clés principales": Object.keys(contactsData),
            "Format des contacts": contactsData.items || contactsData.contacts || contactsData.data 
                ? "Collection d'objets" 
                : "Format inconnu"
        });
        
        // Affiche la structure d'un contact pour comprendre le format
        const contactsArray = contactsData.items || contactsData.contacts || contactsData.data || [];
        if (contactsArray.length > 0) {
            console.log("Structure d'un contact:", contactsArray[0]);
            console.log("Clés disponibles dans un contact:", Object.keys(contactsArray[0]));
        }
        
        return "Test terminé, voir console pour les détails";
    } catch (error) {
        console.error("Erreur lors du test de l'API KARLIA:", error);
        return `Erreur: ${error.message}`;
    }
};

/**
 * Fonction utilitaire de journalisation
 */
function log(...args) {
    if (DEBUG) {
        console.log(...args);
    }
}