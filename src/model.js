const fs = require('fs');

class MarkovMiniLanguageModel {
    constructor(order = 2) {
        this.order = order; // Markov chain order
        this.transitions = new Map(); // Transition probabilities
        this.startStates = new Map(); // Starting states
        this.endStates = new Map(); // Ending states
        this.vocabulary = new Set(); // All unique words
        this.wordFrequency = new Map(); // Word frequency
        this.contextPatterns = new Map(); // Context patterns for Q&A
        this.misspellingCorrections = new Map(); // Common misspellings
        this.responseTemplates = new Map(); // Response templates
        this.trainingData = []; // Training data storage
    }

    // Metni temizle ve tokenize et
    preprocessText(text) {
        return text
            .toLowerCase()
            .replace(/[^\w\sğüşıöç]/g, ' ')
            .replace(/\s+/g, ' ')
            .trim()
            .split(' ');
    }

    // Hatalı yazıları düzeltmeye çalış
    correctMisspellings(tokens) {
        return tokens.map(token => {
            if (this.misspellingCorrections.has(token)) {
                return this.misspellingCorrections.get(token);
            }
            // Levenshtein distance ile en yakın kelimeyi bul
            let bestMatch = token;
            let minDistance = Infinity;
            
            for (let correctWord of this.vocabulary) {
                const distance = this.levenshteinDistance(token, correctWord);
                if (distance < minDistance && distance <= 2) {
                    minDistance = distance;
                    bestMatch = correctWord;
                }
            }
            
            return bestMatch;
        });
    }

    // Levenshtein distance hesapla
    levenshteinDistance(str1, str2) {
        const matrix = [];
        
        for (let i = 0; i <= str2.length; i++) {
            matrix[i] = [i];
        }
        
        for (let j = 0; j <= str1.length; j++) {
            matrix[0][j] = j;
        }
        
        for (let i = 1; i <= str2.length; i++) {
            for (let j = 1; j <= str1.length; j++) {
                if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
                    matrix[i][j] = matrix[i - 1][j - 1];
                } else {
                    matrix[i][j] = Math.min(
                        matrix[i - 1][j - 1] + 1,
                        matrix[i][j - 1] + 1,
                        matrix[i - 1][j] + 1
                    );
                }
            }
        }
        
        return matrix[str2.length][str1.length];
    }

    // Modeli eğit
    train(texts, responses = null) {
        console.log('Model eğitiliyor...');
        
        for (let i = 0; i < texts.length; i++) {
            const text = texts[i];
            const response = responses ? responses[i] : null;
            
            // Metni temizle
            let tokens = this.preprocessText(text);
            
            // Hatalı yazıları düzelt
            tokens = this.correctMisspellings(tokens);
            
            // Kelime frekansını güncelle
            tokens.forEach(token => {
                this.vocabulary.add(token);
                this.wordFrequency.set(token, (this.wordFrequency.get(token) || 0) + 1);
            });
            
            // Markov chain geçişlerini hesapla
            for (let j = 0; j <= tokens.length - this.order; j++) {
                const state = tokens.slice(j, j + this.order).join(' ');
                const nextWord = tokens[j + this.order] || null;
                
                if (!this.transitions.has(state)) {
                    this.transitions.set(state, new Map());
                }
                
                if (nextWord) {
                    const stateTransitions = this.transitions.get(state);
                    stateTransitions.set(nextWord, (stateTransitions.get(nextWord) || 0) + 1);
                }
            }
            
            // Başlangıç ve bitiş durumlarını kaydet
            if (tokens.length >= this.order) {
                const startState = tokens.slice(0, this.order).join(' ');
                const endState = tokens.slice(-this.order).join(' ');
                
                this.startStates.set(startState, (this.startStates.get(startState) || 0) + 1);
                this.endStates.set(endState, (this.endStates.get(endState) || 0) + 1);
            }
            
            // Q&A context pattern'lerini kaydet
            if (response) {
                const contextKey = tokens.slice(0, Math.min(3, tokens.length)).join(' ');
                if (!this.contextPatterns.has(contextKey)) {
                    this.contextPatterns.set(contextKey, []);
                }
                this.contextPatterns.get(contextKey).push(response);
            }
            
            // Training data'yı sakla
            this.trainingData.push({
                input: text,
                processed: tokens,
                response: response
            });
        }
        
        console.log(`Model eğitildi! ${texts.length} örnek ile.`);
        console.log(`Kelime hazinesi: ${this.vocabulary.size} kelime`);
        console.log(`Geçiş sayısı: ${this.transitions.size} durum`);
    }

    // Metin üret
    generateText(maxLength = 50, startWords = null) {
        if (this.transitions.size === 0) {
            return "Model henüz eğitilmedi!";
        }
        
        let currentState;
        
        if (startWords) {
            currentState = startWords.join(' ');
        } else {
            // Başlangıç durumunu seç
            const startStates = Array.from(this.startStates.keys());
            const weights = Array.from(this.startStates.values());
            currentState = this.weightedRandomChoice(startStates, weights);
        }
        
        const result = currentState.split(' ');
        
        for (let i = 0; i < maxLength; i++) {
            if (!this.transitions.has(currentState)) {
                break;
            }
            
            const stateTransitions = this.transitions.get(currentState);
            const nextWords = Array.from(stateTransitions.keys());
            const weights = Array.from(stateTransitions.values());
            
            if (nextWords.length === 0) {
                break;
            }
            
            const nextWord = this.weightedRandomChoice(nextWords, weights);
            result.push(nextWord);
            
            // Durumu güncelle
            const stateWords = currentState.split(' ');
            stateWords.shift();
            stateWords.push(nextWord);
            currentState = stateWords.join(' ');
        }
        
        return result.join(' ');
    }

    // Ağırlıklı rastgele seçim
    weightedRandomChoice(items, weights) {
        const totalWeight = weights.reduce((sum, weight) => sum + weight, 0);
        let random = Math.random() * totalWeight;
        
        for (let i = 0; i < items.length; i++) {
            random -= weights[i];
            if (random <= 0) {
                return items[i];
            }
        }
        
        return items[items.length - 1];
    }

    // Soruya cevap üret
    generateResponse(question, maxLength = 30) {
        const tokens = this.preprocessText(question);
        const correctedTokens = this.correctMisspellings(tokens);
        
        // Context pattern'e göre cevap ara
        for (let i = 0; i < correctedTokens.length; i++) {
            const contextKey = correctedTokens.slice(i, Math.min(i + 3, correctedTokens.length)).join(' ');
            if (this.contextPatterns.has(contextKey)) {
                const responses = this.contextPatterns.get(contextKey);
                const randomResponse = responses[Math.floor(Math.random() * responses.length)];
                return randomResponse;
            }
        }
        
        // Eğer context pattern bulunamazsa, Markov chain ile cevap üret
        return this.generateText(maxLength, correctedTokens.slice(0, Math.min(this.order, correctedTokens.length)));
    }

    // Modeli kaydet
    saveModel(filepath) {
        const modelData = {
            order: this.order,
            transitions: Object.fromEntries(this.transitions),
            startStates: Object.fromEntries(this.startStates),
            endStates: Object.fromEntries(this.endStates),
            vocabulary: Array.from(this.vocabulary),
            wordFrequency: Object.fromEntries(this.wordFrequency),
            contextPatterns: Object.fromEntries(this.contextPatterns),
            misspellingCorrections: Object.fromEntries(this.misspellingCorrections),
            responseTemplates: Object.fromEntries(this.responseTemplates),
            trainingData: this.trainingData
        };
        
        fs.writeFileSync(filepath, JSON.stringify(modelData, null, 2));
        console.log(`Model kaydedildi: ${filepath}`);
    }

    // Modeli yükle
    loadModel(filepath) {
        try {
            const modelData = JSON.parse(fs.readFileSync(filepath, 'utf8'));
            
            this.order = modelData.order;
            this.transitions = new Map(Object.entries(modelData.transitions));
            this.startStates = new Map(Object.entries(modelData.startStates));
            this.endStates = new Map(Object.entries(modelData.endStates));
            this.vocabulary = new Set(modelData.vocabulary);
            this.wordFrequency = new Map(Object.entries(modelData.wordFrequency));
            this.contextPatterns = new Map(Object.entries(modelData.contextPatterns));
            this.misspellingCorrections = new Map(Object.entries(modelData.misspellingCorrections));
            this.responseTemplates = new Map(Object.entries(modelData.responseTemplates));
            this.trainingData = modelData.trainingData;
            
            console.log(`Model yüklendi: ${filepath}`);
            return true;
        } catch (error) {
            console.error(`Model yüklenemedi: ${error.message}`);
            return false;
        }
    }

    // Model istatistiklerini göster
    getStats() {
        return {
            order: this.order,
            vocabularySize: this.vocabulary.size,
            transitionCount: this.transitions.size,
            startStateCount: this.startStates.size,
            endStateCount: this.endStates.size,
            trainingDataCount: this.trainingData.length,
            contextPatternCount: this.contextPatterns.size
        };
    }

    // Hatalı yazı düzeltme örnekleri ekle
    addMisspellingCorrections(corrections) {
        for (const [misspelled, correct] of Object.entries(corrections)) {
            this.misspellingCorrections.set(misspelled, correct);
        }
    }

    // Response template'leri ekle
    addResponseTemplates(templates) {
        for (const [pattern, responses] of Object.entries(templates)) {
            this.responseTemplates.set(pattern, responses);
        }
    }
}

module.exports = MarkovMiniLanguageModel;