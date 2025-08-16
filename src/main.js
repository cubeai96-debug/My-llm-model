const MarkovMiniLanguageModel = require('./model');
const ModelTrainer = require('./trainer');
const ModelTester = require('./test');
const fs = require('fs');

class MarkovLanguageModelApp {
    constructor() {
        this.model = new MarkovMiniLanguageModel(3);
        this.trainer = new ModelTrainer();
        this.tester = new ModelTester();
    }

    // Ana uygulama menüsü
    async showMainMenu() {
        console.log('\n🚀 MARKOV TABANLI MİNİ LANGUAGE MODEL 🚀');
        console.log('==========================================');
        console.log('1. Modeli eğit ve test et');
        console.log('2. Sadece test çalıştır');
        console.log('3. İnteraktif demo');
        console.log('4. JSON format örneği oluştur');
        console.log('5. Model istatistikleri');
        console.log('6. Çıkış');
        
        const readline = require('readline');
        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });

        return new Promise((resolve) => {
            rl.question('\nSeçiminizi yapın (1-6): ', (choice) => {
                rl.close();
                resolve(choice);
            });
        });
    }

    // Ana uygulama döngüsü
    async run() {
        while (true) {
            const choice = await this.showMainMenu();
            
            switch (choice) {
                case '1':
                    await this.fullTrainingAndTest();
                    break;
                case '2':
                    await this.runTestsOnly();
                    break;
                case '3':
                    await this.runInteractiveDemo();
                    break;
                case '4':
                    this.createJSONExample();
                    break;
                case '5':
                    this.showModelStats();
                    break;
                case '6':
                    console.log('\n👋 Uygulama kapatılıyor...');
                    return;
                default:
                    console.log('\n❌ Geçersiz seçim! Lütfen 1-6 arası bir sayı girin.');
            }
            
            console.log('\n' + '='.repeat(50));
        }
    }

    // Tam eğitim ve test
    async fullTrainingAndTest() {
        console.log('\n🎯 TAM EĞİTİM VE TEST BAŞLIYOR...');
        
        try {
            // 1. Eğitim verisi oluştur
            console.log('\n📚 Eğitim verisi oluşturuluyor...');
            this.trainer.generateTrainingData();
            
            // 2. Modeli eğit
            console.log('\n🎯 Model eğitiliyor...');
            this.trainer.trainModel();
            
            // 3. Modeli test et
            console.log('\n🧪 Model test ediliyor...');
            this.trainer.testModel();
            
            // 4. Modeli kaydet
            console.log('\n💾 Model kaydediliyor...');
            this.trainer.saveTrainedModel();
            this.trainer.saveTrainingData();
            
            console.log('\n✅ Tam eğitim ve test tamamlandı!');
            
        } catch (error) {
            console.error('\n❌ Hata oluştu:', error.message);
        }
    }

    // Sadece test çalıştır
    async runTestsOnly() {
        console.log('\n🧪 SADECE TEST ÇALIŞTIRILIYOR...');
        
        try {
            // Önce modeli yükle
            if (fs.existsSync('trained_model.json')) {
                console.log('📂 Eğitilmiş model yükleniyor...');
                this.model.loadModel('trained_model.json');
            } else {
                console.log('⚠️  Eğitilmiş model bulunamadı! Önce eğitim yapın.');
                return;
            }
            
            // Testleri çalıştır
            this.tester.model = this.model;
            this.tester.runComprehensiveTest();
            this.tester.runPerformanceTest();
            
            console.log('\n✅ Testler tamamlandı!');
            
        } catch (error) {
            console.error('\n❌ Test hatası:', error.message);
        }
    }

    // İnteraktif demo
    async runInteractiveDemo() {
        console.log('\n🎮 İNTERAKTİF DEMO BAŞLIYOR...');
        
        try {
            // Önce modeli yükle
            if (fs.existsSync('trained_model.json')) {
                console.log('📂 Eğitilmiş model yükleniyor...');
                this.model.loadModel('trained_model.json');
            } else {
                console.log('⚠️  Eğitilmiş model bulunamadı! Önce eğitim yapın.');
                return;
            }
            
            // İnteraktif demo başlat
            const readline = require('readline');
            const rl = readline.createInterface({
                input: process.stdin,
                output: process.stdout
            });

            console.log('\n💬 Artık modelle konuşabilirsiniz! (Çıkmak için "quit" yazın)');
            console.log('💡 Hatalı yazılar yazabilirsiniz, model anlamaya çalışacak!');
            console.log('💡 Örnek: "teşekür ederim", "gideceğim okula", "seviyorum müziği"');
            
            const askQuestion = () => {
                rl.question('\n👤 Siz: ', (input) => {
                    if (input.toLowerCase() === 'quit') {
                        console.log('\n👋 Demo sonlandırılıyor...');
                        rl.close();
                        return;
                    }
                    
                    // Modelden cevap al
                    const response = this.model.generateResponse(input);
                    console.log(`🤖 Model: ${response}`);
                    
                    // Metin üretimi de göster
                    const generatedText = this.model.generateText(15, input.split(' ').slice(0, 2));
                    console.log(`📝 Üretilen Metin: ${generatedText}`);
                    
                    // Sonraki soru için bekle
                    askQuestion();
                });
            };
            
            askQuestion();
            
        } catch (error) {
            console.error('\n❌ Demo hatası:', error.message);
        }
    }

    // JSON format örneği oluştur
    createJSONExample() {
        console.log('\n📋 JSON FORMAT ÖRNEĞİ OLUŞTURULUYOR...');
        
        try {
            const data = this.tester.createAdvancedTestData();
            const filename = 'example_training_data.json';
            
            fs.writeFileSync(filename, JSON.stringify(data, null, 2));
            console.log(`✅ JSON örneği oluşturuldu: ${filename}`);
            
            // JSON yapısını göster
            console.log('\n📊 JSON Yapısı:');
            console.log('├── model: Model bilgileri ve versiyon');
            console.log('├── training_data: Eğitim verileri');
            console.log('│   ├── general_texts: Genel metinler');
            console.log('│   └── misspelled_texts: Hatalı yazılar');
            console.log('├── qa_data: Soru-cevap verileri');
            console.log('│   ├── S: Sorular (array)');
            console.log('│   ├── C: Cevaplar (array)');
            console.log('│   ├── context: Bağlam kategorisi');
            console.log('│   └── confidence: Güven skoru');
            console.log('├── misspelling_corrections: Hatalı yazı düzeltmeleri');
            console.log('├── response_templates: Cevap şablonları');
            console.log('└── performance_metrics: Performans metrikleri');
            
        } catch (error) {
            console.error('\n❌ JSON oluşturma hatası:', error.message);
        }
    }

    // Model istatistikleri
    showModelStats() {
        console.log('\n📊 MODEL İSTATİSTİKLERİ');
        console.log('========================');
        
        try {
            if (fs.existsSync('trained_model.json')) {
                this.model.loadModel('trained_model.json');
                const stats = this.model.getStats();
                
                console.log(`🔢 Markov Order: ${stats.order}`);
                console.log(`📚 Kelime Hazinesi: ${stats.vocabularySize}`);
                console.log(`🔄 Geçiş Sayısı: ${stats.transitionCount}`);
                console.log(`🚀 Başlangıç Durumları: ${stats.startStateCount}`);
                console.log(`🏁 Bitiş Durumları: ${stats.endStateCount}`);
                console.log(`📝 Eğitim Verisi: ${stats.trainingDataCount}`);
                console.log(`🎯 Context Pattern: ${stats.contextPatternCount}`);
                
                // Dosya boyutu
                const fileStats = fs.statSync('trained_model.json');
                const fileSizeInMB = (fileStats.size / (1024 * 1024)).toFixed(2);
                console.log(`💾 Model Dosya Boyutu: ${fileSizeInMB} MB`);
                
            } else {
                console.log('⚠️  Eğitilmiş model bulunamadı!');
                console.log('📚 Model henüz eğitilmemiş veya kaydedilmemiş.');
            }
            
        } catch (error) {
            console.error('\n❌ İstatistik hatası:', error.message);
        }
    }
}

// Uygulamayı çalıştır
if (require.main === module) {
    const app = new MarkovLanguageModelApp();
    
    console.log('🎉 Markov Tabanlı Mini Language Model Uygulamasına Hoş Geldiniz!');
    console.log('Bu uygulama gelişmiş hatalı yazı anlama ve soru-cevap üretimi yapabilir.');
    
    app.run().catch(console.error);
}

module.exports = MarkovLanguageModelApp;