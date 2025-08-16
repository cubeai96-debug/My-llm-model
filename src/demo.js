const ModelTrainer = require('./trainer');
const MarkovMiniLanguageModel = require('./model');

class ModelDemo {
    constructor() {
        this.trainer = new ModelTrainer();
        this.model = null;
    }

    // Ana demo fonksiyonu
    async runDemo() {
        console.log('🚀 MARKOV TABANLI MİNİ LANGUAGE MODEL DEMO 🚀');
        console.log('================================================\n');
        
        // 1. Eğitim verisi oluştur
        console.log('📚 1. Eğitim verisi oluşturuluyor...');
        this.trainer.generateTrainingData();
        
        // 2. Modeli eğit
        console.log('\n🎯 2. Model eğitiliyor...');
        this.trainer.trainModel();
        
        // 3. Modeli test et
        console.log('\n🧪 3. Model test ediliyor...');
        this.trainer.testModel();
        
        // 4. Modeli kaydet
        console.log('\n💾 4. Model kaydediliyor...');
        this.trainer.saveTrainedModel();
        this.trainer.saveTrainingData();
        
        // 5. İnteraktif demo
        console.log('\n🎮 5. İnteraktif demo başlıyor...');
        await this.interactiveDemo();
    }

    // İnteraktif demo
    async interactiveDemo() {
        const readline = require('readline');
        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });

        console.log('\n💬 Artık modelle konuşabilirsiniz! (Çıkmak için "quit" yazın)');
        console.log('💡 Hatalı yazılar yazabilirsiniz, model anlamaya çalışacak!');
        
        const askQuestion = () => {
            rl.question('\n👤 Siz: ', (input) => {
                if (input.toLowerCase() === 'quit') {
                    console.log('\n👋 Demo sonlandırılıyor...');
                    rl.close();
                    return;
                }
                
                // Modelden cevap al
                const response = this.trainer.model.generateResponse(input);
                console.log(`🤖 Model: ${response}`);
                
                // Metin üretimi de göster
                const generatedText = this.trainer.model.generateText(15, input.split(' ').slice(0, 2));
                console.log(`📝 Üretilen Metin: ${generatedText}`);
                
                // Sonraki soru için bekle
                askQuestion();
            });
        };
        
        askQuestion();
    }

    // Gelişmiş özellikler demo
    showAdvancedFeatures() {
        console.log('\n🔬 GELİŞMİŞ ÖZELLİKLER DEMO');
        console.log('==============================');
        
        // Hatalı yazı düzeltme demo
        console.log('\n1. Hatalı Yazı Düzeltme:');
        const misspelledTexts = [
            "teşekür ederim",
            "gideceğim okula",
            "seviyorum müziği",
            "rahatlatıyor beni",
            "mutlu ediyor beni"
        ];
        
        misspelledTexts.forEach(text => {
            const tokens = this.trainer.model.preprocessText(text);
            const corrected = this.trainer.model.correctMisspellings(tokens);
            console.log(`   "${text}" → "${corrected.join(' ')}"`);
        });
        
        // Context pattern demo
        console.log('\n2. Context Pattern Eşleştirme:');
        const testContexts = ["merhaba", "hava", "kitap", "spor"];
        testContexts.forEach(context => {
            if (this.trainer.model.contextPatterns.has(context)) {
                const responses = this.trainer.model.contextPatterns.get(context);
                console.log(`   "${context}": ${responses.length} farklı cevap`);
            }
        });
        
        // Kelime frekans demo
        console.log('\n3. En Sık Kullanılan Kelimeler:');
        const sortedWords = Array.from(this.trainer.model.wordFrequency.entries())
            .sort((a, b) => b[1] - a[1])
            .slice(0, 10);
        
        sortedWords.forEach(([word, freq]) => {
            console.log(`   "${word}": ${freq} kez`);
        });
    }

    // Performans testi
    runPerformanceTest() {
        console.log('\n⚡ PERFORMANS TESTİ');
        console.log('====================');
        
        const startTime = Date.now();
        
        // 1000 kez cevap üret
        const testQuestions = [
            "merhaba nasılsın",
            "bugün hava nasıl",
            "ne yapıyorsun",
            "kitap okuyor musun",
            "spor yapıyor musun"
        ];
        
        for (let i = 0; i < 200; i++) {
            const question = testQuestions[i % testQuestions.length];
            this.trainer.model.generateResponse(question);
        }
        
        const endTime = Date.now();
        const duration = endTime - startTime;
        
        console.log(`   200 cevap üretimi: ${duration}ms`);
        console.log(`   Ortalama: ${(duration / 200).toFixed(2)}ms/cevap`);
        
        // Bellek kullanımı
        const stats = this.trainer.model.getStats();
        console.log(`   Kelime hazinesi: ${stats.vocabularySize} kelime`);
        console.log(`   Geçiş sayısı: ${stats.transitionCount} durum`);
        console.log(`   Toplam eğitim verisi: ${stats.trainingDataCount} örnek`);
    }
}

// Demo çalıştır
if (require.main === module) {
    const demo = new ModelDemo();
    
    // Ana demo
    demo.runDemo().catch(console.error);
    
    // Gelişmiş özellikler demo (ana demo tamamlandıktan sonra)
    setTimeout(() => {
        demo.showAdvancedFeatures();
        demo.runPerformanceTest();
    }, 5000);
}

module.exports = ModelDemo;