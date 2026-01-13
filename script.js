class ModelPricingApp {
    constructor() {
        this.models = [];
        this.inputTokens = 0;
        this.outputTokens = 0;
        this.cacheKey = 'ai-model-pricing-cache';
        this.cacheExpiry = 24 * 60 * 60 * 1000;
        this.activeProvider = 'all';
        this.activeType = 'all';
        this.activeTable = 'pricing';
        
        this.init();
    }

    async init() {
        await this.loadPricing();
        this.setupEventListeners();
        this.setupTabListeners();
        this.setupTableTabListeners();
        this.renderModels();
        this.createMindMap();
        this.updateLastUpdated();
    }

    async loadPricing() {
        // Always use fresh data for now to avoid cache issues
        this.models = this.getStaticPricingData();
        this.setCachedData(this.models);
    }

    getCachedData() {
        try {
            const cached = localStorage.getItem(this.cacheKey);
            return cached ? JSON.parse(cached) : null;
        } catch {
            return null;
        }
    }

    setCachedData(data) {
        const cacheData = {
            data: data,
            timestamp: Date.now()
        };
        localStorage.setItem(this.cacheKey, JSON.stringify(cacheData));
    }

    isCacheExpired(timestamp) {
        return Date.now() - timestamp > this.cacheExpiry;
    }

    getStaticPricingData() {
        return [
            // OpenAI Models
            { name: "GPT-5.2", provider: "OpenAI", providerClass: "openai", contextLength: "256K", inputPrice: 0.025, outputPrice: 0.08, currency: "USD", per: "1K tokens", featured: true, symbol: "G52", docUrl: "https://openai.com/gpt-4" },
            { name: "GPT-4 Turbo", provider: "OpenAI", providerClass: "openai", contextLength: "128K", inputPrice: 0.01, outputPrice: 0.03, currency: "USD", per: "1K tokens", symbol: "G4T", docUrl: "https://platform.openai.com/docs/models/gpt-4-and-gpt-4-turbo" },
            { name: "GPT-4", provider: "OpenAI", providerClass: "openai", contextLength: "8K", inputPrice: 0.03, outputPrice: 0.06, currency: "USD", per: "1K tokens", symbol: "GP4", docUrl: "https://platform.openai.com/docs/models/gpt-4-and-gpt-4-turbo" },
            { name: "GPT-3.5 Turbo", provider: "OpenAI", providerClass: "openai", contextLength: "16K", inputPrice: 0.0015, outputPrice: 0.002, currency: "USD", per: "1K tokens", symbol: "G35", docUrl: "https://platform.openai.com/docs/models/gpt-3-5" },
            
            // Anthropic Models
            { name: "Claude 3 Opus", provider: "Anthropic", providerClass: "anthropic", contextLength: "200K", inputPrice: 0.015, outputPrice: 0.075, currency: "USD", per: "1K tokens", symbol: "C3O", docUrl: "https://docs.anthropic.com/claude/docs/models-overview#claude-3-a-new-generation-of-ai" },
            { name: "Claude 3 Sonnet", provider: "Anthropic", providerClass: "anthropic", contextLength: "200K", inputPrice: 0.003, outputPrice: 0.015, currency: "USD", per: "1K tokens", symbol: "C3S", docUrl: "https://docs.anthropic.com/claude/docs/models-overview#claude-3-a-new-generation-of-ai" },
            { name: "Claude 3 Haiku", provider: "Anthropic", providerClass: "anthropic", contextLength: "200K", inputPrice: 0.00025, outputPrice: 0.00125, currency: "USD", per: "1K tokens", symbol: "C3H", docUrl: "https://docs.anthropic.com/claude/docs/models-overview#claude-3-a-new-generation-of-ai" },
            { name: "Claude 2.1", provider: "Anthropic", providerClass: "anthropic", contextLength: "200K", inputPrice: 0.008, outputPrice: 0.024, currency: "USD", per: "1K tokens", symbol: "C21", docUrl: "https://docs.anthropic.com/claude/docs/models-overview#legacy-models" },
            { name: "Claude Instant", provider: "Anthropic", providerClass: "anthropic", contextLength: "100K", inputPrice: 0.0008, outputPrice: 0.0024, currency: "USD", per: "1K tokens", symbol: "CIN", docUrl: "https://docs.anthropic.com/claude/docs/models-overview#legacy-models" },
            
            // AWS Bedrock Models
            { name: "Titan Text G1", provider: "AWS Bedrock", providerClass: "aws", contextLength: "8K", inputPrice: 0.0008, outputPrice: 0.0016, currency: "USD", per: "1K tokens", symbol: "TT1", docUrl: "https://docs.aws.amazon.com/bedrock/latest/userguide/titan-text-models.html" },
            { name: "Titan Text Lite", provider: "AWS Bedrock", providerClass: "aws", contextLength: "4K", inputPrice: 0.0003, outputPrice: 0.0004, currency: "USD", per: "1K tokens", symbol: "TTL", docUrl: "https://docs.aws.amazon.com/bedrock/latest/userguide/titan-text-models.html" },
            { name: "Titan Embeddings", provider: "AWS Bedrock", providerClass: "aws", contextLength: "8K", inputPrice: 0.0001, outputPrice: 0, currency: "USD", per: "1K tokens", symbol: "TEM", docUrl: "https://docs.aws.amazon.com/bedrock/latest/userguide/titan-embedding-models.html" },
            { name: "Claude 3 Opus (AWS)", provider: "AWS Bedrock", providerClass: "aws", contextLength: "200K", inputPrice: 0.015, outputPrice: 0.075, currency: "USD", per: "1K tokens", symbol: "C3A", docUrl: "https://docs.aws.amazon.com/bedrock/latest/userguide/model-parameters-anthropic-claude-3.html" },
            { name: "Claude 3 Sonnet (AWS)", provider: "AWS Bedrock", providerClass: "aws", contextLength: "200K", inputPrice: 0.003, outputPrice: 0.015, currency: "USD", per: "1K tokens", symbol: "C3B", docUrl: "https://docs.aws.amazon.com/bedrock/latest/userguide/model-parameters-anthropic-claude-3.html" },
            { name: "Claude 3 Haiku (AWS)", provider: "AWS Bedrock", providerClass: "aws", contextLength: "200K", inputPrice: 0.00025, outputPrice: 0.00125, currency: "USD", per: "1K tokens", symbol: "C3C", docUrl: "https://docs.aws.amazon.com/bedrock/latest/userguide/model-parameters-anthropic-claude-3.html" },
            { name: "Llama 2 70B", provider: "AWS Bedrock", providerClass: "aws", contextLength: "4K", inputPrice: 0.00195, outputPrice: 0.00256, currency: "USD", per: "1K tokens", symbol: "L70", docUrl: "https://docs.aws.amazon.com/bedrock/latest/userguide/model-parameters-meta.html" },
            { name: "Llama 2 13B", provider: "AWS Bedrock", providerClass: "aws", contextLength: "4K", inputPrice: 0.00075, outputPrice: 0.001, currency: "USD", per: "1K tokens", symbol: "L13", docUrl: "https://docs.aws.amazon.com/bedrock/latest/userguide/model-parameters-meta.html" },
            { name: "Llama 2 7B", provider: "AWS Bedrock", providerClass: "aws", contextLength: "4K", inputPrice: 0.0003, outputPrice: 0.0004, currency: "USD", per: "1K tokens", symbol: "L7B", docUrl: "https://docs.aws.amazon.com/bedrock/latest/userguide/model-parameters-meta.html" },
            { name: "Cohere Command", provider: "AWS Bedrock", providerClass: "aws", contextLength: "4K", inputPrice: 0.0015, outputPrice: 0.002, currency: "USD", per: "1K tokens", symbol: "COC", docUrl: "https://docs.aws.amazon.com/bedrock/latest/userguide/model-parameters-cohere-command.html" },
            { name: "Cohere Command Light", provider: "AWS Bedrock", providerClass: "aws", contextLength: "4K", inputPrice: 0.0003, outputPrice: 0.0006, currency: "USD", per: "1K tokens", symbol: "CCL", docUrl: "https://docs.aws.amazon.com/bedrock/latest/userguide/model-parameters-cohere-command.html" },
            { name: "AI21 Jurassic-2 Ultra", provider: "AWS Bedrock", providerClass: "aws", contextLength: "8K", inputPrice: 0.0188, outputPrice: 0.0188, currency: "USD", per: "1K tokens", symbol: "J2U", docUrl: "https://docs.aws.amazon.com/bedrock/latest/userguide/model-parameters-jurassic2.html" },
            { name: "AI21 Jurassic-2 Mid", provider: "AWS Bedrock", providerClass: "aws", contextLength: "8K", inputPrice: 0.0125, outputPrice: 0.0125, currency: "USD", per: "1K tokens", symbol: "J2M", docUrl: "https://docs.aws.amazon.com/bedrock/latest/userguide/model-parameters-jurassic2.html" },
            { name: "Stability Diffusion XL", provider: "AWS Bedrock", providerClass: "aws", contextLength: "N/A", inputPrice: 0.04, outputPrice: 0, currency: "USD", per: "image", symbol: "SDX", docUrl: "https://docs.aws.amazon.com/bedrock/latest/userguide/model-parameters-stability-diffusion.html" },
            
            // Azure Models
            { name: "GPT-4 Turbo (Azure)", provider: "Azure OpenAI", providerClass: "azure", contextLength: "128K", inputPrice: 0.01, outputPrice: 0.03, currency: "USD", per: "1K tokens", symbol: "G4A", docUrl: "https://learn.microsoft.com/en-us/azure/ai-services/openai/concepts/models#gpt-4-and-gpt-4-turbo-preview-models" },
            { name: "GPT-4 (Azure)", provider: "Azure OpenAI", providerClass: "azure", contextLength: "8K", inputPrice: 0.03, outputPrice: 0.06, currency: "USD", per: "1K tokens", symbol: "GP4A", docUrl: "https://learn.microsoft.com/en-us/azure/ai-services/openai/concepts/models#gpt-4-and-gpt-4-turbo-preview-models" },
            { name: "GPT-3.5 Turbo (Azure)", provider: "Azure OpenAI", providerClass: "azure", contextLength: "16K", inputPrice: 0.0015, outputPrice: 0.002, currency: "USD", per: "1K tokens", symbol: "G3A", docUrl: "https://learn.microsoft.com/en-us/azure/ai-services/openai/concepts/models#gpt-35" },
            { name: "GPT-3.5 Instruct (Azure)", provider: "Azure OpenAI", providerClass: "azure", contextLength: "4K", inputPrice: 0.0015, outputPrice: 0.002, currency: "USD", per: "1K tokens", symbol: "G3I", docUrl: "https://learn.microsoft.com/en-us/azure/ai-services/openai/concepts/models#gpt-35" },
            { name: "DALL-E 3 (Azure)", provider: "Azure OpenAI", providerClass: "azure", contextLength: "N/A", inputPrice: 0.04, outputPrice: 0, currency: "USD", per: "image", symbol: "DA3", docUrl: "https://learn.microsoft.com/en-us/azure/ai-services/openai/concepts/models#dall-e-models" },
            { name: "DALL-E 2 (Azure)", provider: "Azure OpenAI", providerClass: "azure", contextLength: "N/A", inputPrice: 0.02, outputPrice: 0, currency: "USD", per: "image", symbol: "DA2", docUrl: "https://learn.microsoft.com/en-us/azure/ai-services/openai/concepts/models#dall-e-models" },
            { name: "Whisper (Azure)", provider: "Azure OpenAI", providerClass: "azure", contextLength: "N/A", inputPrice: 0.006, outputPrice: 0, currency: "USD", per: "minute", symbol: "WHI", docUrl: "https://learn.microsoft.com/en-us/azure/ai-services/openai/concepts/models#whisper-models" },
            
            // Google Cloud Models
            { name: "Gemini Pro", provider: "Google Cloud", providerClass: "gcp", contextLength: "32K", inputPrice: 0.00025, outputPrice: 0.0005, currency: "USD", per: "1K tokens", symbol: "GMP", docUrl: "https://cloud.google.com/vertex-ai/docs/generative-ai/model-reference/gemini" },
            { name: "Gemini Pro Vision", provider: "Google Cloud", providerClass: "gcp", contextLength: "16K", inputPrice: 0.00025, outputPrice: 0.0005, currency: "USD", per: "1K tokens", symbol: "GMV", docUrl: "https://cloud.google.com/vertex-ai/docs/generative-ai/model-reference/gemini" },
            { name: "PaLM 2 Text", provider: "Google Cloud", providerClass: "gcp", contextLength: "8K", inputPrice: 0.001, outputPrice: 0.001, currency: "USD", per: "1K tokens", symbol: "P2T", docUrl: "https://cloud.google.com/vertex-ai/docs/generative-ai/model-reference/text" },
            { name: "PaLM 2 Chat", provider: "Google Cloud", providerClass: "gcp", contextLength: "8K", inputPrice: 0.001, outputPrice: 0.001, currency: "USD", per: "1K tokens", symbol: "P2C", docUrl: "https://cloud.google.com/vertex-ai/docs/generative-ai/model-reference/text-chat" },
            { name: "Codey Code", provider: "Google Cloud", providerClass: "gcp", contextLength: "6K", inputPrice: 0.001, outputPrice: 0.001, currency: "USD", per: "1K tokens", symbol: "CDC", docUrl: "https://cloud.google.com/vertex-ai/docs/generative-ai/model-reference/code-generation" },
            { name: "Codey Chat", provider: "Google Cloud", providerClass: "gcp", contextLength: "6K", inputPrice: 0.001, outputPrice: 0.001, currency: "USD", per: "1K tokens", symbol: "CDH", docUrl: "https://cloud.google.com/vertex-ai/docs/generative-ai/model-reference/code-chat" },
            { name: "Text Embedding", provider: "Google Cloud", providerClass: "gcp", contextLength: "3K", inputPrice: 0.0001, outputPrice: 0, currency: "USD", per: "1K tokens", symbol: "TEB", docUrl: "https://cloud.google.com/vertex-ai/docs/generative-ai/embeddings/get-text-embeddings" },
            { name: "Imagen", provider: "Google Cloud", providerClass: "gcp", contextLength: "N/A", inputPrice: 0.02, outputPrice: 0, currency: "USD", per: "image", symbol: "IMG", docUrl: "https://cloud.google.com/vertex-ai/docs/generative-ai/image/overview" }
        ];
    }

    setupEventListeners() {
        const inputText = document.getElementById('input-text');
        const outputText = document.getElementById('output-text');

        inputText.addEventListener('input', () => this.calculateTokens());
        outputText.addEventListener('input', () => this.calculateTokens());
    }

    calculateTokens() {
        const inputText = document.getElementById('input-text').value;
        const outputText = document.getElementById('output-text').value;

        // Rough token estimation (1 token ≈ 4 characters)
        this.inputTokens = Math.ceil(inputText.length / 4);
        this.outputTokens = Math.ceil(outputText.length / 4);

        document.getElementById('input-tokens').textContent = this.inputTokens;
        document.getElementById('output-tokens').textContent = this.outputTokens;

        this.updatePricing();
    }

    updatePricing() {
        const modelElements = document.querySelectorAll('.model-element');
        let filteredModels = this.models;
        
        // Apply same filters as renderModels
        if (this.activeProvider !== 'all') {
            filteredModels = filteredModels.filter(model => model.providerClass === this.activeProvider);
        }
        if (this.activeType !== 'all') {
            filteredModels = filteredModels.filter(model => this.getModelType(model) === this.activeType);
        }
        
        modelElements.forEach((element, index) => {
            const model = filteredModels[index];
            if (model) {
                const inputCost = (this.inputTokens / 1000) * model.inputPrice;
                const outputCost = (this.outputTokens / 1000) * model.outputPrice;
                const totalCost = inputCost + outputCost;

                const totalCostEl = element.querySelector('.cost-amount');
                if (totalCostEl) totalCostEl.textContent = `$${totalCost.toFixed(6)}`;
            }
        });
    }

    renderModels() {
        const grid = document.getElementById('models-periodic');
        let filteredModels = this.models;
        
        // Filter by provider
        if (this.activeProvider !== 'all') {
            filteredModels = filteredModels.filter(model => model.providerClass === this.activeProvider);
        }
        
        // Filter by model type
        if (this.activeType !== 'all') {
            filteredModels = filteredModels.filter(model => this.getModelType(model) === this.activeType);
        }
        
        // Find lowest and highest costs
        const inputPrices = filteredModels.map(m => m.inputPrice).filter(p => p > 0);
        const outputPrices = filteredModels.map(m => m.outputPrice).filter(p => p > 0);
        const minInput = Math.min(...inputPrices);
        const maxInput = Math.max(...inputPrices);
        const minOutput = Math.min(...outputPrices);
        const maxOutput = Math.max(...outputPrices);
        
        grid.innerHTML = filteredModels.map(model => {
            const isLowestInput = model.inputPrice === minInput && model.inputPrice > 0;
            const isHighestInput = model.inputPrice === maxInput;
            const isLowestOutput = model.outputPrice === minOutput && model.outputPrice > 0;
            const isHighestOutput = model.outputPrice === maxOutput;
            
            return `
            <div class="model-element ${model.providerClass} ${model.featured ? 'featured' : ''}">
                <a href="${model.docUrl}" target="_blank" class="element-name-link">
                    <div class="element-name">${model.name || 'Unknown'}</div>
                </a>
                <div class="element-provider">${model.provider || 'Unknown'}</div>
                <div class="element-specs">
                    <div class="spec-line">Context: ${model.contextLength || 'N/A'}</div>
                    <div class="spec-line ${isLowestInput ? 'lowest-price' : ''} ${isHighestInput ? 'highest-price' : ''}">Input: $${model.inputPrice || 0}/${model.per || '1K tokens'}</div>
                    <div class="spec-line ${isLowestOutput ? 'lowest-price' : ''} ${isHighestOutput ? 'highest-price' : ''}">Output: $${model.outputPrice || 0}/${model.per || '1K tokens'}</div>
                </div>
                <div class="element-cost">
                    <div class="cost-label">Your Cost</div>
                    <div class="cost-amount">$0.000000</div>
                </div>
            </div>
        `;
        }).join('');
        
        this.updatePricing();
    }

    updateLastUpdated() {
        const cached = this.getCachedData();
        const timestamp = cached ? cached.timestamp : Date.now();
        const date = new Date(timestamp).toLocaleString();
        document.getElementById('last-updated').textContent = date;
    }

    setupTabListeners() {
        const tabButtons = document.querySelectorAll('.tab-button');
        tabButtons.forEach(button => {
            button.addEventListener('click', () => {
                tabButtons.forEach(btn => btn.classList.remove('active'));
                button.classList.add('active');
                this.activeProvider = button.dataset.provider;
                this.renderModels();
            });
        });
    }

    setupTableTabListeners() {
        const tableTabs = document.querySelectorAll('.table-tab');
        tableTabs.forEach(tab => {
            tab.addEventListener('click', () => {
                tableTabs.forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
                
                const tableType = tab.dataset.table;
                document.querySelectorAll('.table-container').forEach(container => {
                    container.classList.add('hidden');
                });
                document.getElementById(`${tableType}-table`).classList.remove('hidden');
                
                this.activeTable = tableType;
            });
        });
    }

    createMindMap() {
        const svg = document.getElementById('services-mindmap');
        const width = 1400;
        const height = 1200;
        const centerX = width / 2;
        const centerY = height / 2;
        
        svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
        
        // Create gradients and filters
        this.createSVGDefinitions(svg);
        
        const services = {
            'AI Services': {
                'AWS': ['Amazon Bedrock', 'Amazon SageMaker', 'Amazon Comprehend', 'Amazon Rekognition', 'Amazon Textract'],
                'Azure': ['Azure OpenAI Service', 'Azure ML Studio', 'Azure Cognitive Services', 'Azure Computer Vision'],
                'GCP': ['Vertex AI Platform', 'Google AutoML', 'Cloud Vision API', 'Cloud Natural Language'],
                'OpenAI': ['GPT-4 Models', 'DALL-E 3', 'Whisper API', 'Text Embeddings'],
                'Anthropic': ['Claude 3 Models', 'Claude API', 'Constitutional AI']
            }
        };
        
        // Central node with enhanced design
        const centralGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        centralGroup.classList.add('mindmap-node');
        
        // Central glow effect
        const centralGlow = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        centralGlow.setAttribute('cx', centerX);
        centralGlow.setAttribute('cy', centerY);
        centralGlow.setAttribute('r', 85);
        centralGlow.setAttribute('fill', 'url(#centralGlow)');
        centralGlow.setAttribute('opacity', '0.3');
        
        const centralCircle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        centralCircle.setAttribute('cx', centerX);
        centralCircle.setAttribute('cy', centerY);
        centralCircle.setAttribute('r', 70);
        centralCircle.classList.add('mindmap-central');
        
        const centralText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        centralText.setAttribute('x', centerX);
        centralText.setAttribute('y', centerY);
        centralText.classList.add('mindmap-text', 'central');
        centralText.textContent = 'AI Services';
        
        centralGroup.appendChild(centralGlow);
        centralGroup.appendChild(centralCircle);
        centralGroup.appendChild(centralText);
        svg.appendChild(centralGroup);
        
        // Provider branches with enhanced design
        const providers = Object.keys(services['AI Services']);
        const angleStep = (2 * Math.PI) / providers.length;
        
        providers.forEach((provider, index) => {
            const angle = index * angleStep - Math.PI / 2;
            const branchX = centerX + Math.cos(angle) * 380;
            const branchY = centerY + Math.sin(angle) * 380;
            
            // Enhanced connection line - FIXED
            const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
            line.setAttribute('x1', centerX + Math.cos(angle) * 70);
            line.setAttribute('y1', centerY + Math.sin(angle) * 70);
            line.setAttribute('x2', branchX - Math.cos(angle) * 50);
            line.setAttribute('y2', branchY - Math.sin(angle) * 50);
            line.classList.add('mindmap-line');
            svg.appendChild(line);
            
            // Provider node with glow
            const providerGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
            providerGroup.classList.add('mindmap-node');
            
            // Provider glow
            const providerGlow = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
            providerGlow.setAttribute('cx', branchX);
            providerGlow.setAttribute('cy', branchY);
            providerGlow.setAttribute('r', 60);
            providerGlow.setAttribute('fill', `url(#${provider.toLowerCase()}Glow)`);
            providerGlow.setAttribute('opacity', '0.2');
            
            const providerCircle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
            providerCircle.setAttribute('cx', branchX);
            providerCircle.setAttribute('cy', branchY);
            providerCircle.setAttribute('r', 50);
            providerCircle.classList.add('mindmap-branch', `provider-${provider.toLowerCase()}`);
            
            const providerText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            providerText.setAttribute('x', branchX);
            providerText.setAttribute('y', branchY);
            providerText.classList.add('mindmap-text', 'branch');
            providerText.textContent = provider;
            
            providerGroup.appendChild(providerGlow);
            providerGroup.appendChild(providerCircle);
            providerGroup.appendChild(providerText);
            svg.appendChild(providerGroup);
            
            // Service leaves with enhanced positioning
            const serviceList = services['AI Services'][provider];
            const serviceAngleSpread = Math.PI * 1.4;
            const startAngle = angle - serviceAngleSpread / 2;
            
            serviceList.forEach((service, serviceIndex) => {
                const serviceAngle = startAngle + (serviceIndex / (serviceList.length - 1)) * serviceAngleSpread;
                const serviceDistance = 220 + (serviceIndex % 2) * 50;
                const serviceX = branchX + Math.cos(serviceAngle) * serviceDistance;
                const serviceY = branchY + Math.sin(serviceAngle) * serviceDistance;
                
                // Service connection with curve
                const servicePath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
                const serviceControlX = branchX + Math.cos(serviceAngle) * 105;
                const serviceControlY = branchY + Math.sin(serviceAngle) * 105;
                const serviceStartX = branchX + Math.cos(serviceAngle) * 50;
                const serviceStartY = branchY + Math.sin(serviceAngle) * 50;
                const serviceEndX = serviceX - Math.cos(serviceAngle) * 45;
                const serviceEndY = serviceY - Math.sin(serviceAngle) * 15;
                
                servicePath.setAttribute('d', `M ${serviceStartX} ${serviceStartY} Q ${serviceControlX} ${serviceControlY} ${serviceEndX} ${serviceEndY}`);
                servicePath.classList.add('mindmap-connection');
                svg.appendChild(servicePath);
                
                // Service node with modern design
                const serviceGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
                serviceGroup.classList.add('mindmap-node');
                
                // Service background with rounded rectangle
                const serviceRect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
                const textWidth = service.length * 9;
                serviceRect.setAttribute('x', serviceX - textWidth/2 - 15);
                serviceRect.setAttribute('y', serviceY - 18);
                serviceRect.setAttribute('width', textWidth + 30);
                serviceRect.setAttribute('height', 36);
                serviceRect.setAttribute('rx', 18);
                serviceRect.setAttribute('ry', 18);
                serviceRect.classList.add('mindmap-leaf');
                
                const serviceText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
                serviceText.setAttribute('x', serviceX);
                serviceText.setAttribute('y', serviceY);
                serviceText.classList.add('mindmap-text', 'leaf');
                serviceText.textContent = service;
                
                serviceGroup.appendChild(serviceRect);
                serviceGroup.appendChild(serviceText);
                svg.appendChild(serviceGroup);
                
                // Add hover interaction for documentation
                serviceGroup.addEventListener('mouseenter', () => {
                    this.showDocumentation(provider, service);
                });
                
                serviceGroup.addEventListener('mouseleave', () => {
                    this.hideDocumentation();
                });
            });
        });
    }
    
    createSVGDefinitions(svg) {
        const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
        
        // Central gradient
        const centralGradient = document.createElementNS('http://www.w3.org/2000/svg', 'radialGradient');
        centralGradient.setAttribute('id', 'centralGradient');
        centralGradient.innerHTML = `
            <stop offset="0%" stop-color="#667eea"/>
            <stop offset="100%" stop-color="#4c51bf"/>
        `;
        
        // Central glow
        const centralGlow = document.createElementNS('http://www.w3.org/2000/svg', 'radialGradient');
        centralGlow.setAttribute('id', 'centralGlow');
        centralGlow.innerHTML = `
            <stop offset="0%" stop-color="#667eea" stop-opacity="0.6"/>
            <stop offset="100%" stop-color="#667eea" stop-opacity="0"/>
        `;
        
        // Branch gradient
        const branchGradient = document.createElementNS('http://www.w3.org/2000/svg', 'radialGradient');
        branchGradient.setAttribute('id', 'branchGradient');
        branchGradient.innerHTML = `
            <stop offset="0%" stop-color="#ffffff"/>
            <stop offset="100%" stop-color="#f7fafc"/>
        `;
        
        // Leaf gradient
        const leafGradient = document.createElementNS('http://www.w3.org/2000/svg', 'linearGradient');
        leafGradient.setAttribute('id', 'leafGradient');
        leafGradient.innerHTML = `
            <stop offset="0%" stop-color="#ffffff"/>
            <stop offset="100%" stop-color="#edf2f7"/>
        `;
        
        // Line gradients
        const lineGradient = document.createElementNS('http://www.w3.org/2000/svg', 'linearGradient');
        lineGradient.setAttribute('id', 'lineGradient');
        lineGradient.innerHTML = `
            <stop offset="0%" stop-color="#a0aec0"/>
            <stop offset="100%" stop-color="#cbd5e0"/>
        `;
        
        const connectionGradient = document.createElementNS('http://www.w3.org/2000/svg', 'linearGradient');
        connectionGradient.setAttribute('id', 'connectionGradient');
        connectionGradient.innerHTML = `
            <stop offset="0%" stop-color="#e2e8f0"/>
            <stop offset="100%" stop-color="#cbd5e0"/>
        `;
        
        // Provider gradients
        const providerGradients = {
            aws: ['#ff9900', '#e68900'],
            azure: ['#0078d4', '#106ebe'],
            gcp: ['#4285f4', '#3367d6'],
            openai: ['#10a37f', '#0d8f72'],
            anthropic: ['#d97706', '#c2680a']
        };
        
        Object.entries(providerGradients).forEach(([provider, colors]) => {
            const gradient = document.createElementNS('http://www.w3.org/2000/svg', 'radialGradient');
            gradient.setAttribute('id', `${provider}Gradient`);
            gradient.innerHTML = `
                <stop offset="0%" stop-color="${colors[0]}"/>
                <stop offset="100%" stop-color="${colors[1]}"/>
            `;
            defs.appendChild(gradient);
            
            const glow = document.createElementNS('http://www.w3.org/2000/svg', 'radialGradient');
            glow.setAttribute('id', `${provider}Glow`);
            glow.innerHTML = `
                <stop offset="0%" stop-color="${colors[0]}" stop-opacity="0.4"/>
                <stop offset="100%" stop-color="${colors[0]}" stop-opacity="0"/>
            `;
            defs.appendChild(glow);
        });
        
        defs.appendChild(centralGradient);
        defs.appendChild(centralGlow);
        defs.appendChild(branchGradient);
        defs.appendChild(leafGradient);
        defs.appendChild(lineGradient);
        defs.appendChild(connectionGradient);
        
        svg.appendChild(defs);
    }
    
    showDocumentation(provider, service) {
        const docUrls = {
            'AWS': {
                'Amazon Bedrock': 'https://docs.aws.amazon.com/bedrock/',
                'Amazon SageMaker': 'https://docs.aws.amazon.com/sagemaker/',
                'Amazon Comprehend': 'https://docs.aws.amazon.com/comprehend/',
                'Amazon Rekognition': 'https://docs.aws.amazon.com/rekognition/',
                'Amazon Textract': 'https://docs.aws.amazon.com/textract/'
            },
            'Azure': {
                'Azure OpenAI Service': 'https://docs.microsoft.com/en-us/azure/cognitive-services/openai/',
                'Azure ML Studio': 'https://docs.microsoft.com/en-us/azure/machine-learning/',
                'Azure Cognitive Services': 'https://docs.microsoft.com/en-us/azure/cognitive-services/',
                'Azure Computer Vision': 'https://docs.microsoft.com/en-us/azure/cognitive-services/computer-vision/'
            },
            'GCP': {
                'Vertex AI Platform': 'https://cloud.google.com/vertex-ai/docs',
                'Google AutoML': 'https://cloud.google.com/automl/docs',
                'Cloud Vision API': 'https://cloud.google.com/vision/docs',
                'Cloud Natural Language': 'https://cloud.google.com/natural-language/docs'
            },
            'OpenAI': {
                'GPT-4 Models': 'https://platform.openai.com/docs/models/gpt-4',
                'DALL-E 3': 'https://platform.openai.com/docs/guides/images',
                'Whisper API': 'https://platform.openai.com/docs/guides/speech-to-text',
                'Text Embeddings': 'https://platform.openai.com/docs/guides/embeddings'
            },
            'Anthropic': {
                'Claude 3 Models': 'https://docs.anthropic.com/claude/docs',
                'Claude API': 'https://docs.anthropic.com/claude/reference',
                'Constitutional AI': 'https://www.anthropic.com/research/constitutional-ai-harmlessness-from-ai-feedback'
            }
        };
        
        this.updateOfficialSources(docUrls[provider] || {});
    }
    
    hideDocumentation() {
        this.updateOfficialSources({
            'AWS Bedrock': 'https://aws.amazon.com/bedrock/pricing/',
            'Azure OpenAI': 'https://azure.microsoft.com/en-us/pricing/details/cognitive-services/openai-service/',
            'OpenAI': 'https://openai.com/pricing',
            'Anthropic': 'https://www.anthropic.com/pricing',
            'Google Cloud': 'https://cloud.google.com/vertex-ai/pricing'
        });
    }
    
    updateOfficialSources(sources) {
        const sourcesGrid = document.querySelector('.sources-grid');
        sourcesGrid.innerHTML = Object.entries(sources).map(([name, url]) => 
            `<a href="${url}" target="_blank" class="source-link">${name}</a>`
        ).join('');
    }

    getModelType(model) {
        const name = model.name.toLowerCase();
        if (name.includes('gpt-4') || name.includes('gpt4')) return 'gpt4';
        if (name.includes('gpt-3.5') || name.includes('gpt3')) return 'gpt35';
        if (name.includes('claude 3')) return 'claude3';
        if (name.includes('llama 2') || name.includes('llama2')) return 'llama2';
        if (name.includes('dall-e') || name.includes('imagen') || name.includes('stability') || name.includes('diffusion')) return 'image';
        return 'other';
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new ModelPricingApp();
});