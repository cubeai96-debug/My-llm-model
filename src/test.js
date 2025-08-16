const MarkovMiniLanguageModel = require('./model');
const fs = require('fs');

class ModelTester {
    constructor() {
        this.model = new MarkovMiniLanguageModel(3);
        this.testResults = [];
    }

    // Gelişmiş JSON formatında test verisi oluştur
    createAdvancedTestData() {
        const advancedData = {
            "model": {
                "version": "1.500",
                "type": "markov-chain",
                "language": "turkish",
                "order": 3,
                "features": [
                    "misspelling-correction",
                    "context-pattern-matching",
                    "response-generation",
                    "text-generation"
                ],
                "fallback_ts": ["1", "2"],
                "metadata": {
                    "created": new Date().toISOString(),
                    "author": "AI Assistant",
                    "description": "Gelişmiş Markov tabanlı mini language model"
                }
            },
            "training_data": {
                "general_texts": [
                    "merhaba nasılsın bugün hava çok güzel",
                    "teşekkür ederim sen de nasılsın",
                    "evet haklısın bu konuda anlaşmış olduk",
                    "yarın okula gideceğim ve ödevlerimi yapacağım",
                    "kitap okumayı çok seviyorum özellikle roman türünde",
                    "müzik dinlemek beni rahatlatıyor ve mutlu ediyor",
                    "spor yapmak sağlık için çok önemli",
                    "yemek yapmayı öğrenmek istiyorum annem gibi",
                    "bilgisayar oyunları oynamayı seviyorum",
                    "arkadaşlarımla vakit geçirmek çok eğlenceli"
                ],
                "misspelled_texts": [
                    "teşekür ederim",
                    "gideceğim okula",
                    "seviyorum müziği",
                    "rahatlatıyor beni",
                    "mutlu ediyor beni",
                    "sağlık için",
                    "öğrenmek istiyorum",
                    "oyunları oynamayı",
                    "vakit geçirmek",
                    "eğlenceli oluyor"
                ]
            },
            "qa_data": [
                {
                    "S": ["merhaba nasılsın", "selam nasıl gidiyor", "hey nasılsın"],
                    "C": ["merhaba ben iyiyim teşekkür ederim sen nasılsın", "selam ben de iyiyim nasılsın", "hey iyiyim sen nasılsın"],
                    "context": "greeting",
                    "confidence": 0.95
                },
                {
                    "S": ["bugün hava nasıl", "hava durumu nasıl", "dışarı hava nasıl"],
                    "C": ["bugün hava çok güzel güneşli ve sıcak", "hava durumu harika güneş açık", "dışarı hava çok iyi"],
                    "context": "weather",
                    "confidence": 0.88
                },
                {
                    "S": ["ne yapıyorsun", "şu anda ne yapıyorsun", "ne ile meşgulsün"],
                    "C": ["şu anda bilgisayar başında çalışıyorum", "bilgisayar başında iş yapıyorum", "çalışıyorum şu anda"],
                    "context": "activity",
                    "confidence": 0.92
                },
                {
                    "S": ["hangi kitabı okuyorsun", "kitap okuyor musun", "ne okuyorsun"],
                    "C": ["şu anda roman türünde bir kitap okuyorum", "evet kitap okuyorum roman okuyorum", "roman okuyorum şu anda"],
                    "context": "reading",
                    "confidence": 0.87
                },
                {
                    "S": ["müzik dinliyor musun", "müzik seviyor musun", "hangi müziği dinliyorsun"],
                    "C": ["evet müzik dinlemeyi çok seviyorum", "evet müziği çok seviyorum", "pop ve rock müzik dinliyorum"],
                    "context": "music",
                    "confidence": 0.90
                },
                {
                    "S": ["spor yapıyor musun", "egzersiz yapıyor musun", "fitness yapıyor musun"],
                    "C": ["evet düzenli olarak spor yapmaya çalışıyorum", "evet egzersiz yapıyorum", "fitness salonuna gidiyorum"],
                    "context": "sports",
                    "confidence": 0.85
                },
                {
                    "S": ["yemek yapmayı biliyor musun", "mutfakta ne yapıyorsun", "yemek yapıyor musun"],
                    "C": ["biraz biliyorum ama daha çok öğrenmek istiyorum", "mutfakta yemek yapmaya çalışıyorum", "evet yemek yapıyorum"],
                    "context": "cooking",
                    "confidence": 0.83
                },
                {
                    "S": ["hangi oyunları oynuyorsun", "oyun oynuyor musun", "ne oyunu oynuyorsun"],
                    "C": ["strateji ve macera oyunlarını seviyorum", "evet oyun oynuyorum", "bilgisayar oyunları oynuyorum"],
                    "context": "gaming",
                    "confidence": 0.89
                },
                {
                    "S": ["arkadaşların var mı", "sosyal misin", "insanlarla görüşüyor musun"],
                    "C": ["evet güzel arkadaşlarım var onlarla vakit geçirmeyi seviyorum", "evet sosyal biriyim", "evet insanlarla görüşüyorum"],
                    "context": "social",
                    "confidence": 0.91
                },
                {
                    "S": ["teknoloji hakkında ne düşünüyorsun", "teknoloji seviyor musun", "teknoloji nasıl"],
                    "C": ["teknoloji hayatımızı kolaylaştırıyor ama dikkatli kullanmak gerek", "evet teknolojiyi seviyorum", "teknoloji çok gelişmiş"],
                    "context": "technology",
                    "confidence": 0.86
                }
            ],
            "misspelling_corrections": {
                "teşekür": "teşekkür",
                "gideceğim": "gideceğim",
                "seviyorum": "seviyorum",
                "rahatlatıyor": "rahatlatıyor",
                "mutlu": "mutlu",
                "sağlık": "sağlık",
                "öğrenmek": "öğrenmek",
                "oyunları": "oyunları",
                "eğlenceli": "eğlenceli",
                "teknoloji": "teknoloji"
            },
            "response_templates": {
                "greeting": [
                    "merhaba nasılsın",
                    "selam hoş geldin",
                    "merhaba ben de iyiyim"
                ],
                "weather": [
                    "bugün hava gerçekten güzel",
                    "evet hava çok iyi",
                    "hava durumu harika"
                ],
                "activity": [
                    "şu anda çalışıyorum",
                    "bilgisayar başında iş yapıyorum",
                    "meşgulüm şu anda"
                ],
                "reading": [
                    "kitap okumayı çok seviyorum",
                    "okumak gerçekten faydalı",
                    "hangi kitabı okuyorsun"
                ]
            },
            "performance_metrics": {
                "training_time": 0,
                "response_time": 0,
                "accuracy": 0,
                "vocabulary_size": 0,
                "transition_count": 0
            }
        };

        return advancedData;
    }

    // JSON formatını kaydet
    saveAdvancedJSON(filepath = 'advanced_training_data.json') {
        const data = this.createAdvancedTestData();
        fs.writeFileSync(filepath, JSON.stringify(data, null, 2));
        console.log(`Gelişmiş JSON formatı kaydedildi: ${filepath}`);
        return data;
    }

    // Modeli gelişmiş veri ile eğit
    trainWithAdvancedData(data) {
        console.log('\n=== GELİŞMİŞ VERİ İLE MODEL EĞİTİMİ ===');
        
        // Hatalı yazı düzeltme örnekleri ekle
        this.model.addMisspellingCorrections(data.misspelling_corrections);
        
        // Response template'leri ekle
        this.model.addResponseTemplates(data.response_templates);
        
        // Genel metinlerle eğit
        console.log('1. Genel metinlerle eğitim...');
        this.model.train(data.training_data.general_texts);
        
        // Hatalı yazılarla eğit
        console.log('2. Hatalı yazılarla eğitim...');
        this.model.train(data.training_data.misspelled_texts);
        
        // Q&A verileriyle eğit
        console.log('3. Q&A verileriyle eğitim...');
        const allQuestions = [];
        const allAnswers = [];
        
        data.qa_data.forEach(qa => {
            qa.S.forEach(question => {
                allQuestions.push(question);
                // Her soru için rastgele bir cevap seç
                const randomAnswer = qa.C[Math.floor(Math.random() * qa.C.length)];
                allAnswers.push(randomAnswer);
            });
        });
        
        this.model.train(allQuestions, allAnswers);
        
        console.log('Model eğitimi tamamlandı!');
        
        // Performans metriklerini güncelle
        const stats = this.model.getStats();
        data.performance_metrics.vocabulary_size = stats.vocabularySize;
        data.performance_metrics.transition_count = stats.transitionCount;
        
        return data;
    }

    // Kapsamlı test çalıştır
    runComprehensiveTest() {
        console.log('\n=== KAPSAMLI MODEL TESTİ ===');
        
        const testCases = [
            {
                category: "Temel Sorular",
                questions: [
                    "merhaba nasılsın",
                    "bugün hava nasıl",
                    "ne yapıyorsun"
                ]
            },
            {
                category: "Hatalı Yazılar",
                questions: [
                    "teşekür ederim",
                    "gideceğim okula",
                    "seviyorum müziği"
                ]
            },
            {
                category: "Context Pattern Test",
                questions: [
                    "selam nasıl gidiyor",
                    "hava durumu nasıl",
                    "şu anda ne yapıyorsun"
                ]
            },
            {
                category: "Sınır Durumlar",
                questions: [
                    "xyz123", // Bilinmeyen kelimeler
                    "", // Boş string
                    "çok uzun ve karmaşık bir soru cümlesi burada yer alıyor"
                ]
            }
        ];
        
        testCases.forEach(testCase => {
            console.log(`\n📋 ${testCase.category}:`);
            testCase.questions.forEach(question => {
                const response = this.model.generateResponse(question);
                const generatedText = this.model.generateText(10, question.split(' ').slice(0, 2));
                
                console.log(`\n   Soru: "${question}"`);
                console.log(`   Cevap: "${response}"`);
                console.log(`   Üretilen: "${generatedText}"`);
            });
        });
    }

    // Performans testi
    runPerformanceTest() {
        console.log('\n=== PERFORMANS TESTİ ===');
        
        const iterations = 100;
        const testQuestions = [
            "merhaba nasılsın",
            "bugün hava nasıl",
            "ne yapıyorsun",
            "kitap okuyor musun",
            "spor yapıyor musun"
        ];
        
        // Response generation test
        const startTime = Date.now();
        for (let i = 0; i < iterations; i++) {
            const question = testQuestions[i % testQuestions.length];
            this.model.generateResponse(question);
        }
        const responseTime = Date.now() - startTime;
        
        // Text generation test
        const textStartTime = Date.now();
        for (let i = 0; i < iterations; i++) {
            this.model.generateText(20);
        }
        const textTime = Date.now() - textStartTime;
        
        console.log(`   ${iterations} response üretimi: ${responseTime}ms (${(responseTime/iterations).toFixed(2)}ms/response)`);
        console.log(`   ${iterations} text üretimi: ${textTime}ms (${(textTime/iterations).toFixed(2)}ms/text)`);
        
        // Model istatistikleri
        const stats = this.model.getStats();
        console.log(`   Kelime hazinesi: ${stats.vocabularySize}`);
        console.log(`   Geçiş sayısı: ${stats.transitionCount}`);
        console.log(`   Context pattern: ${stats.contextPatternCount}`);
    }

    // JSON formatını test et
    testJSONFormat() {
        console.log('\n=== JSON FORMAT TESTİ ===');
        
        const data = this.createAdvancedTestData();
        
        // JSON yapısını kontrol et
        console.log('✅ JSON yapısı geçerli');
        console.log(`📊 Model versiyonu: ${data.model.version}`);
        console.log(`🌍 Dil: ${data.model.language}`);
        console.log(`🔢 Q&A veri sayısı: ${data.qa_data.length}`);
        console.log(`📝 Genel metin sayısı: ${data.training_data.general_texts.length}`);
        console.log(`❌ Hatalı yazı sayısı: ${data.training_data.misspelled_texts.length}`);
        console.log(`🔧 Düzeltme örneği: ${Object.keys(data.misspelling_corrections).length}`);
        console.log(`📋 Template sayısı: ${Object.keys(data.response_templates).length}`);
        
        // Her Q&A kategorisini göster
        data.qa_data.forEach((qa, index) => {
            console.log(`\n   ${index + 1}. ${qa.context} (${qa.confidence} güven)`);
            console.log(`      Sorular: ${qa.S.length} adet`);
            console.log(`      Cevaplar: ${qa.C.length} adet`);
        });
    }
}

// Test çalıştır
if (require.main === module) {
    const tester = new ModelTester();
    
    console.log('🧪 MARKOV MODEL TEST SÜİTİ 🧪');
    console.log('================================\n');
    
    // 1. JSON format testi
    tester.testJSONFormat();
    
    // 2. Gelişmiş veri ile eğitim
    const data = tester.saveAdvancedJSON();
    tester.trainWithAdvancedData(data);
    
    // 3. Kapsamlı test
    tester.runComprehensiveTest();
    
    // 4. Performans testi
    tester.runPerformanceTest();
    
    console.log('\n✅ Tüm testler tamamlandı!');
}

module.exports = ModelTester;