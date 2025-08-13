document.addEventListener('DOMContentLoaded', () => {
    // Éléments du DOM
    const startButton = document.getElementById('start-button');
    const resetButton = document.getElementById('reset-button');
    const learnMoreButton = document.getElementById('learn-more-button');
    const numberInput = document.getElementById('number-input');
    const treesContainer = document.getElementById('trees-container');
    const assistantMessage = document.getElementById('assistant-message');
    
    // Sélecteurs pour la fenêtre modale
    const learnMoreModal = document.getElementById('learn-more-modal');
    const learnMoreBackdrop = document.getElementById('learn-more-backdrop');
    const closeModalButton = document.getElementById('close-modal-button');

    let currentNumber = null;

    // --- LANCEURS ---
    startButton.addEventListener('click', handleStart);
    resetButton.addEventListener('click', handleReset);
    learnMoreButton.addEventListener('click', handleLearnMore);
    closeModalButton.addEventListener('click', closeModal);
    learnMoreBackdrop.addEventListener('click', closeModal);

    numberInput.addEventListener('keyup', (e) => {
        if (e.key === 'Enter') handleStart();
    });

    /**
     * Gère l'ouverture de la fenêtre modale.
     */
    function handleLearnMore() {
        learnMoreBackdrop.classList.remove('hidden');
        learnMoreModal.classList.remove('hidden');
    }

    /**
     * Gère la fermeture de la fenêtre modale.
     */
    function closeModal() {
        learnMoreBackdrop.classList.add('hidden');
        learnMoreModal.classList.add('hidden');
    }

    /**
     * Gère le clic sur le bouton de démarrage/ajout.
     */
    function handleStart() {
        let number;
        if (currentNumber !== null && numberInput.disabled) {
            number = currentNumber;
        } else {
            number = parseInt(numberInput.value);
            if (isNaN(number) || number <= 1) {
                updateAssistantMessage("Veuillez entrer un nombre entier supérieur à 1.");
                return;
            }
            if (number !== currentNumber) {
                handleReset();
                currentNumber = number;
            }
        }
        
        if (isPrime(number)) {
            alert(`${number} est un nombre premier ! Il ne peut être décomposé.`);
            updateAssistantMessage(`${number} est un nombre premier. Essayez avec un nombre composé comme 12, 36, ou 72.`);
            return;
        }

        createTree(currentNumber);
        
        numberInput.disabled = true;
        startButton.textContent = `Ajouter un arbre pour ${currentNumber}`;
        resetButton.style.display = 'inline-block';
        learnMoreButton.style.display = 'inline-block';
        updateAssistantMessage(`Nouvel arbre créé pour ${currentNumber}. Cliquez sur une bulle bleue pour la décomposer.`);
    }

    /**
     * Gère la réinitialisation de l'application.
     */
    function handleReset() {
        treesContainer.innerHTML = '';
        currentNumber = null;
        numberInput.value = '';
        numberInput.disabled = false;
        startButton.textContent = "Démarrer l'Analyse";
        resetButton.style.display = 'none';
        learnMoreButton.style.display = 'none';
        updateAssistantMessage("Bienvenue ! Entrez un nouveau nombre pour commencer.");
    }

    /**
     * Gère le clic sur une bulle de nombre premier.
     */
    function handlePrimeClick(event) {
        const num = event.currentTarget.dataset.number;
        alert(`Le nombre ${num} est PREMIER ! C'est une brique fondamentale des mathématiques. Il ne peut plus être décomposé.`);
    }
    
    /**
     * Crée un nouvel arbre de factorisation dans le conteneur.
     */
    function createTree(num) {
        const treeCanvas = document.createElement('div');
        treeCanvas.className = 'tree-canvas';
        treesContainer.appendChild(treeCanvas);
        // Le canevas a une largeur max de 500px, donc son centre est à 250px.
        const startX = 250; 
        createNode(num, startX, 50, 0, treeCanvas);
    }
    
    /**
     * Crée un nœud (bulle) et l'ajoute au canevas.
     */
    function createNode(num, x, y, level, canvas) {
        const node = document.createElement('div');
        node.textContent = num;
        node.className = 'node';
        node.style.position = 'absolute';
        node.style.left = `${x}px`;
        node.style.top = `${y}px`;
        node.dataset.x = x;
        node.dataset.y = y;
        node.dataset.number = num;
        node.dataset.level = level;
        
        if (isPrime(num)) {
            node.classList.add('prime');
            node.addEventListener('click', handlePrimeClick);
        } else {
            node.classList.add('composite');
            node.addEventListener('click', handleNodeClick);
        }
        canvas.appendChild(node);
        return node;
    }

    /**
     * Gère le clic sur un nœud composite pour afficher les choix.
     */
    function handleNodeClick(event) {
        const node = event.currentTarget;
        const num = parseInt(node.dataset.number);
        const treeCanvas = node.parentElement;
        
        const existingPopup = treeCanvas.querySelector('.factor-choice-popup');
        if (existingPopup) existingPopup.remove();

        const factors = findAllFactorPairs(num);
        const popup = document.createElement('div');
        popup.className = 'factor-choice-popup';
        popup.style.left = `${node.offsetLeft + 35}px`;
        popup.style.top = `${node.offsetTop}px`;

        factors.forEach(pair => {
            const button = document.createElement('button');
            button.className = 'factor-choice-button';
            button.textContent = `${pair[0]} × ${pair[1]}`;
            button.onclick = () => selectFactorPair(node, pair, popup);
            popup.appendChild(button);
        });

        treeCanvas.appendChild(popup);
        updateAssistantMessage("Super ! Maintenant, choisissez comment vous voulez décomposer ce nombre.");
    }

    /**
     * Déclenchée quand l'utilisateur choisit une paire de facteurs.
     */
    function selectFactorPair(node, pair, popup) {
        node.classList.add("decomposed");
        node.removeEventListener("click", handleNodeClick);
        popup.remove();
        const level = parseInt(node.dataset.level);
        const x = parseFloat(node.dataset.x);
        const y = parseFloat(node.dataset.y);
        const treeCanvas = node.parentElement;
        const [factor1, factor2] = pair;
        const spread = 130 / (level + 1.5);
        
        const x1 = x - spread;
        const x2 = x + spread;
        const childY = y + 100;
        createNode(pair[0], x1, childY, level + 1, treeCanvas);
        createNode(pair[1], x2, childY, level + 1, treeCanvas);
        drawLine(x, y, x1, childY, treeCanvas);
        drawLine(x, y, x2, childY, treeCanvas);
        checkCompletion(treeCanvas);
    }
    
    /**
     * Dessine une ligne entre deux points.
     */
    function drawLine(x1, y1, x2, y2, canvas) {
        const distance = Math.sqrt((x2 - x1)**2 + (y2 - y1)**2);
        const angle = Math.atan2(y2 - y1, x2 - x1) * 180 / Math.PI;
        const line = document.createElement('div');
        line.className = 'line';
        line.style.left = `${x1}px`;
        line.style.top = `${y1}px`;
        line.style.width = `${distance}px`;
        line.style.transform = `rotate(${angle}deg)`;
        canvas.appendChild(line);
    }
    
    /**
     * Vérifie si l'arbre est complet et affiche le résultat.
     */
    function checkCompletion(canvas) {
        if (canvas.querySelectorAll('.composite:not(.decomposed)').length === 0) {
            const primeFactors = Array.from(canvas.querySelectorAll('.prime'))
                .map(node => parseInt(node.textContent))
                .sort((a, b) => a - b);
            
            const rootNumber = parseInt(canvas.querySelector('.node').dataset.number);
            const expandedResult = `${rootNumber} = ${primeFactors.join(' × ')}`;
            const compactResult = formatWithExponents(primeFactors);

            const resultBox = document.createElement('div');
            resultBox.className = 'tree-result';
            resultBox.innerHTML = `${expandedResult}<br>${compactResult}`;
            canvas.appendChild(resultBox);

            updateAssistantMessage("Arbre complet ! Le résultat final est toujours le même. C'est ça, le théorème fondamental de l'arithmétique !");
        }
    }

    /**
     * Formate un tableau de facteurs en notation avec exposants.
     */
    function formatWithExponents(factors) {
        const counts = factors.reduce((acc, val) => {
            acc[val] = (acc[val] || 0) + 1;
            return acc;
        }, {});
        
        return Object.entries(counts)
            .map(([base, exponent]) => {
                if (exponent === 1) return base;
                return `${base}<sup>${exponent}</sup>`;
            })
            .join(' × ');
    }

    /**
     * Vérifie si un nombre est premier.
     */
    function isPrime(num) {
        for (let i = 2, s = Math.sqrt(num); i <= s; i++) {
            if (num % i === 0) return false;
        }
        return num > 1;
    }

    /**
     * Trouve toutes les paires de facteurs pour un nombre.
     */
    function findAllFactorPairs(num) {
        const pairs = [];
        for (let i = 2; i <= Math.sqrt(num); i++) {
            if (num % i === 0) {
                pairs.push([i, num / i]);
            }
        }
        return pairs;
    }

    /**
     * Met à jour le message de l'assistant.
     */
    function updateAssistantMessage(text) {
        assistantMessage.innerHTML = text;
    }
});