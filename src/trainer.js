const MarkovMiniLanguageModel = require('./model');
const fs = require('fs');

class ModelTrainer {
    constructor() {
        this.model = new MarkovMiniLanguageModel(3); // 3-gram model
        this.trainingData = [];
        this.qaData = [];
    }

    // Geniş eğitim verisi oluştur
    generateTrainingData() {
        console.log('Eğitim verisi oluşturuluyor...');
        
        // Genel Türkçe metinler
        const generalTexts = [
            "merhaba nasılsın bugün hava çok güzel",
            "teşekkür ederim sen de nasılsın",
            "evet haklısın bu konuda anlaşmış olduk",
            "yarın okula gideceğim ve ödevlerimi yapacağım",
            "kitap okumayı çok seviyorum özellikle roman türünde",
            "müzik dinlemek beni rahatlatıyor ve mutlu ediyor",
            "spor yapmak sağlık için çok önemli",
            "yemek yapmayı öğrenmek istiyorum annem gibi",
            "bilgisayar oyunları oynamayı seviyorum",
            "arkadaşlarımla vakit geçirmek çok eğlenceli",
            "teknoloji günümüzde çok hızlı gelişiyor",
            "eğitim hayatımızın en önemli parçası",
            "doğa sevgisi çocukluktan başlar",
            "hayvanları sevmek insanlık görevidir",
            "çevre kirliliği dünyamızı tehdit ediyor",
            "bilim insanları sürekli yeni keşifler yapıyor",
            "sanat insan ruhunu besleyen bir gıda gibidir",
            "matematik hayatımızın her alanında var",
            "tarih geçmişi anlamamızı sağlar",
            "coğrafya dünyayı tanımamıza yardımcı olur"
        ];

        // Hatalı yazılar (gerçekçi hatalar)
        const misspelledTexts = [
            "merhaba nasılsın bugün hava çok güzel",
            "teşekür ederim sen de nasılsın",
            "evet haklısın bu konuda anlaşmış olduk",
            "yarın okula gideceğim ve ödevlerimi yapacağım",
            "kitap okumayı çok seviyorum özellikle roman türünde",
            "müzik dinlemek beni rahatlatıyor ve mutlu ediyor",
            "spor yapmak sağlık için çok önemli",
            "yemek yapmayı öğrenmek istiyorum annem gibi",
            "bilgisayar oyunları oynamayı seviyorum",
            "arkadaşlarımla vakit geçirmek çok eğlenceli",
            "teknoloji günümüzde çok hızlı gelişiyor",
            "eğitim hayatımızın en önemli parçası",
            "doğa sevgisi çocukluktan başlar",
            "hayvanları sevmek insanlık görevidir",
            "çevre kirliliği dünyamızı tehdit ediyor",
            "bilim insanları sürekli yeni keşifler yapıyor",
            "sanat insan ruhunu besleyen bir gıda gibidir",
            "matematik hayatımızın her alanında var",
            "tarih geçmişi anlamamızı sağlar",
            "coğrafya dünyayı tanımamıza yardımcı olur"
        ];

        // Soru-cevap verileri
        const qaData = [
            { question: "merhaba nasılsın", answer: "merhaba ben iyiyim teşekkür ederim sen nasılsın" },
            { question: "bugün hava nasıl", answer: "bugün hava çok güzel güneşli ve sıcak" },
            { question: "ne yapıyorsun", answer: "şu anda bilgisayar başında çalışıyorum" },
            { question: "hangi kitabı okuyorsun", answer: "şu anda roman türünde bir kitap okuyorum" },
            { question: "müzik dinliyor musun", answer: "evet müzik dinlemeyi çok seviyorum" },
            { question: "spor yapıyor musun", answer: "evet düzenli olarak spor yapmaya çalışıyorum" },
            { question: "yemek yapmayı biliyor musun", answer: "biraz biliyorum ama daha çok öğrenmek istiyorum" },
            { question: "hangi oyunları oynuyorsun", answer: "strateji ve macera oyunlarını seviyorum" },
            { question: "arkadaşların var mı", answer: "evet güzel arkadaşlarım var onlarla vakit geçirmeyi seviyorum" },
            { question: "teknoloji hakkında ne düşünüyorsun", answer: "teknoloji hayatımızı kolaylaştırıyor ama dikkatli kullanmak gerek" },
            { question: "eğitim neden önemli", answer: "eğitim geleceğimizi şekillendiren en önemli araç" },
            { question: "doğayı seviyor musun", answer: "evet doğayı çok seviyorum ve korumaya çalışıyorum" },
            { question: "hayvanları seviyor musun", answer: "evet tüm hayvanları seviyorum özellikle köpekleri" },
            { question: "çevre kirliliği hakkında ne düşünüyorsun", answer: "çevre kirliliği ciddi bir sorun hepimiz önlem almalıyız" },
            { question: "bilim hakkında ne düşünüyorsun", answer: "bilim insanlığın ilerlemesi için çok önemli" },
            { question: "sanat nedir", answer: "sanat insan duygularını ve düşüncelerini ifade etme yolu" },
            { question: "matematik zor mu", answer: "matematik başlangıçta zor olabilir ama pratik yapınca kolaylaşır" },
            { question: "tarih neden önemli", answer: "tarih geçmişten ders alarak geleceği şekillendirmemizi sağlar" },
            { question: "coğrafya ne işe yarar", answer: "coğrafya dünyayı ve çevremizi anlamamızı sağlar" },
            { question: "kitap okumak neden faydalı", answer: "kitap okumak bilgi dağarcığımızı genişletir ve hayal gücümüzü geliştirir" }
        ];

        // Hatalı yazılmış sorular
        const misspelledQuestions = [
            { question: "merhaba nasılsın", answer: "merhaba ben iyiyim teşekkür ederim sen nasılsın" },
            { question: "bugün hava nasıl", answer: "bugün hava çok güzel güneşli ve sıcak" },
            { question: "ne yapıyorsun", answer: "şu anda bilgisayar başında çalışıyorum" },
            { question: "hangi kitabı okuyorsun", answer: "şu anda roman türünde bir kitap okuyorum" },
            { question: "müzik dinliyor musun", answer: "evet müzik dinlemeyi çok seviyorum" },
            { question: "spor yapıyor musun", answer: "evet düzenli olarak spor yapmaya çalışıyorum" },
            { question: "yemek yapmayı biliyor musun", answer: "biraz biliyorum ama daha çok öğrenmek istiyorum" },
            { question: "hangi oyunları oynuyorsun", answer: "strateji ve macera oyunlarını seviyorum" },
            { question: "arkadaşların var mı", answer: "evet güzel arkadaşlarım var onlarla vakit geçirmeyi seviyorum" },
            { question: "teknoloji hakkında ne düşünüyorsun", answer: "evet teknoloji hayatımızı kolaylaştırıyor ama dikkatli kullanmak gerek" }
        ];

        // Tüm verileri birleştir
        this.trainingData = [
            ...generalTexts,
            ...misspelledTexts
        ];

        this.qaData = [
            ...qaData,
            ...misspelledQuestions
        ];

        console.log(`${this.trainingData.length} genel metin ve ${this.qaData.length} soru-cevap verisi oluşturuldu.`);
    }

    // Hatalı yazı düzeltme örnekleri ekle
    addMisspellingExamples() {
        const corrections = {
            "teşekür": "teşekkür",
            "gideceğim": "gideceğim",
            "seviyorum": "seviyorum",
            "rahatlatıyor": "rahatlatıyor",
            "mutlu": "mutlu",
            "sağlık": "sağlık",
            "öğrenmek": "öğrenmek",
            "oyunları": "oyunları",
            "eğlenceli": "eğlenceli",
            "teknoloji": "teknoloji",
            "gelişiyor": "gelişiyor",
            "eğitim": "eğitim",
            "parçası": "parçası",
            "çocukluktan": "çocukluktan",
            "görevidir": "görevidir",
            "kirliliği": "kirliliği",
            "tehdit": "tehdit",
            "keşifler": "keşifler",
            "besleyen": "besleyen",
            "gıda": "gıda",
            "alanında": "alanında",
            "anlamamızı": "anlamamızı",
            "yardımcı": "yardımcı"
        };

        this.model.addMisspellingCorrections(corrections);
        console.log(`${Object.keys(corrections).length} hatalı yazı düzeltme örneği eklendi.`);
    }

    // Response template'leri ekle
    addResponseTemplates() {
        const templates = {
            "merhaba": [
                "merhaba nasılsın",
                "selam hoş geldin",
                "merhaba ben de iyiyim"
            ],
            "nasılsın": [
                "iyiyim teşekkür ederim sen nasılsın",
                "çok iyiyim umarım sen de iyisindir",
                "iyiyim sen nasılsın"
            ],
            "hava": [
                "bugün hava gerçekten güzel",
                "evet hava çok iyi",
                "hava durumu harika"
            ],
            "kitap": [
                "kitap okumayı çok seviyorum",
                "okumak gerçekten faydalı",
                "hangi kitabı okuyorsun"
            ]
        };

        this.model.addResponseTemplates(templates);
        console.log(`${Object.keys(templates).length} response template eklendi.`);
    }

    // Modeli eğit
    trainModel() {
        console.log('\n=== MODEL EĞİTİMİ BAŞLIYOR ===');
        
        // Hatalı yazı düzeltme örnekleri ekle
        this.addMisspellingExamples();
        
        // Response template'leri ekle
        this.addResponseTemplates();
        
        // Genel metinlerle eğit
        console.log('\n1. Genel metinlerle eğitim...');
        this.model.train(this.trainingData);
        
        // Soru-cevap verileriyle eğit
        console.log('\n2. Soru-cevap verileriyle eğitim...');
        const questions = this.qaData.map(qa => qa.question);
        const answers = this.qaData.map(qa => qa.answer);
        this.model.train(questions, answers);
        
        console.log('\n=== MODEL EĞİTİMİ TAMAMLANDI ===');
        
        // Model istatistiklerini göster
        const stats = this.model.getStats();
        console.log('\nModel İstatistikleri:');
        console.log(`- Markov Order: ${stats.order}`);
        console.log(`- Kelime Hazinesi: ${stats.vocabularySize}`);
        console.log(`- Geçiş Sayısı: ${stats.transitionCount}`);
        console.log(`- Başlangıç Durumları: ${stats.startStateCount}`);
        console.log(`- Bitiş Durumları: ${stats.endStateCount}`);
        console.log(`- Eğitim Verisi: ${stats.trainingDataCount}`);
        console.log(`- Context Pattern: ${stats.contextPatternCount}`);
    }

    // Modeli test et
    testModel() {
        console.log('\n=== MODEL TESTİ ===');
        
        const testQuestions = [
            "merhaba nasılsın",
            "bugün hava nasıl",
            "ne yapıyorsun",
            "kitap okuyor musun",
            "spor yapıyor musun",
            "teşekür ederim", // Hatalı yazı
            "gideceğim okula", // Hatalı yazı
            "seviyorum müziği" // Hatalı yazı
        ];
        
        testQuestions.forEach(question => {
            const response = this.model.generateResponse(question);
            console.log(`\nSoru: ${question}`);
            console.log(`Cevap: ${response}`);
        });
        
        // Metin üretimi testi
        console.log('\n=== METİN ÜRETİMİ TESTİ ===');
        const generatedText = this.model.generateText(20, ["merhaba", "bugün"]);
        console.log(`Üretilen Metin: ${generatedText}`);
    }

    // Modeli kaydet
    saveTrainedModel(filepath = 'trained_model.json') {
        this.model.saveModel(filepath);
        console.log(`\nEğitilmiş model kaydedildi: ${filepath}`);
    }

    // Eğitim verisini JSON olarak kaydet
    saveTrainingData(filepath = 'training_data.json') {
        const data = {
            generalTexts: this.trainingData,
            qaData: this.qaData,
            timestamp: new Date().toISOString(),
            dataCount: {
                generalTexts: this.trainingData.length,
                qaData: this.qaData.length
            }
        };
        
        fs.writeFileSync(filepath, JSON.stringify(data, null, 2));
        console.log(`Eğitim verisi kaydedildi: ${filepath}`);
    }
}

module.exports = ModelTrainer;