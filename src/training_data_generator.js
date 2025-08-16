const fs = require('fs');

class TrainingDataGenerator {
    constructor() {
        this.qaData = [];
        this.categories = [
            'greeting', 'weather', 'activity', 'reading', 'music', 
            'sports', 'cooking', 'gaming', 'social', 'technology',
            'education', 'nature', 'animals', 'environment', 'science',
            'art', 'mathematics', 'history', 'geography', 'literature',
            'movies', 'travel', 'food', 'health', 'work', 'family',
            'shopping', 'transportation', 'entertainment', 'politics', 'economy'
        ];
    }

    // Geniş soru-cevap eğitim seti oluştur
    generateLargeTrainingDataset() {
        console.log('🚀 Büyük ölçekli eğitim verisi oluşturuluyor...');
        
        // Her kategori için çoklu soru-cevap çiftleri oluştur
        this.categories.forEach(category => {
            const categoryData = this.generateCategoryData(category);
            this.qaData.push(...categoryData);
        });

        // Hatalı yazılmış sorular ekle
        this.addMisspelledQuestions();

        // Karmaşık sorular ekle
        this.addComplexQuestions();

        // Çoklu dil varyasyonları ekle
        this.addLanguageVariations();

        console.log(`✅ Toplam ${this.qaData.length} soru-cevap çifti oluşturuldu!`);
        return this.qaData;
    }

    // Kategori bazında veri oluştur
    generateCategoryData(category) {
        const categoryData = [];
        
        switch(category) {
            case 'greeting':
                categoryData.push(
                    {
                        "S": ["merhaba nasılsın", "selam nasıl gidiyor", "hey nasılsın", "günaydın nasılsın", "iyi akşamlar nasılsın"],
                        "C": ["merhaba ben iyiyim teşekkür ederim sen nasılsın", "selam ben de iyiyim nasılsın", "hey iyiyim sen nasılsın", "günaydın ben de iyiyim nasılsın", "iyi akşamlar ben de iyiyim nasılsın"],
                        "context": "greeting",
                        "confidence": 0.95
                    },
                    {
                        "S": ["nasılsın bugün", "bugün nasıl gidiyor", "nasıl hissediyorsun", "kendini nasıl hissediyorsun"],
                        "C": ["bugün çok iyiyim teşekkür ederim sen nasılsın", "bugün harika gidiyor nasılsın", "bugün kendimi çok iyi hissediyorum", "bugün çok enerjik hissediyorum"],
                        "context": "greeting",
                        "confidence": 0.93
                    }
                );
                break;

            case 'weather':
                categoryData.push(
                    {
                        "S": ["bugün hava nasıl", "hava durumu nasıl", "dışarı hava nasıl", "hava güzel mi", "yağmur yağıyor mu"],
                        "C": ["bugün hava çok güzel güneşli ve sıcak", "hava durumu harika güneş açık", "dışarı hava çok iyi", "evet hava gerçekten güzel", "hayır bugün yağmur yok güneşli"],
                        "context": "weather",
                        "confidence": 0.88
                    },
                    {
                        "S": ["sıcaklık kaç derece", "kaç derece bugün", "hava soğuk mu", "sıcak mı bugün"],
                        "C": ["bugün sıcaklık 25 derece çok güzel", "şu anda 23 derece ideal hava", "hayır bugün soğuk değil ılık", "evet bugün oldukça sıcak"],
                        "context": "weather",
                        "confidence": 0.85
                    }
                );
                break;

            case 'activity':
                categoryData.push(
                    {
                        "S": ["ne yapıyorsun", "şu anda ne yapıyorsun", "ne ile meşgulsün", "ne yapıyorsun şu anda"],
                        "C": ["şu anda bilgisayar başında çalışıyorum", "bilgisayar başında iş yapıyorum", "çalışıyorum şu anda", "meşgulüm şu anda iş yapıyorum"],
                        "context": "activity",
                        "confidence": 0.92
                    },
                    {
                        "S": ["boş zamanında ne yapıyorsun", "hobilerin neler", "ne yapmayı seviyorsun", "favori aktiviten ne"],
                        "C": ["boş zamanımda kitap okumayı ve müzik dinlemeyi seviyorum", "hobilerim arasında spor yapmak ve resim çizmek var", "yeni şeyler öğrenmeyi ve seyahat etmeyi seviyorum", "favori aktivitem doğada yürüyüş yapmak"],
                        "context": "activity",
                        "confidence": 0.90
                    }
                );
                break;

            case 'reading':
                categoryData.push(
                    {
                        "S": ["hangi kitabı okuyorsun", "kitap okuyor musun", "ne okuyorsun", "şu anda ne okuyorsun"],
                        "C": ["şu anda roman türünde bir kitap okuyorum", "evet kitap okuyorum roman okuyorum", "roman okuyorum şu anda", "şu anda bilim kurgu kitabı okuyorum"],
                        "context": "reading",
                        "confidence": 0.87
                    },
                    {
                        "S": ["hangi tür kitapları seviyorsun", "favori kitap türün ne", "ne tür kitaplar okuyorsun", "hangi yazarları seviyorsun"],
                        "C": ["roman ve bilim kurgu kitaplarını çok seviyorum", "favori türüm macera ve polisiye romanlar", "genellikle kurgu ve tarih kitapları okuyorum", "Orhan Pamuk ve Ahmet Hamdi Tanpınar'ı çok seviyorum"],
                        "context": "reading",
                        "confidence": 0.85
                    }
                );
                break;

            case 'music':
                categoryData.push(
                    {
                        "S": ["müzik dinliyor musun", "müzik seviyor musun", "hangi müziği dinliyorsun", "ne tür müzik dinliyorsun"],
                        "C": ["evet müzik dinlemeyi çok seviyorum", "evet müziği çok seviyorum", "pop ve rock müzik dinliyorum", "klasik ve caz müziği dinliyorum"],
                        "context": "music",
                        "confidence": 0.90
                    },
                    {
                        "S": ["favori şarkın ne", "hangi sanatçıları seviyorsun", "en sevdiğin müzik türü ne", "müzik dinlerken ne yapıyorsun"],
                        "C": ["favori şarkım 'Bohemian Rhapsody'", "Sezen Aksu ve Barış Manço'yu çok seviyorum", "en sevdiğim tür alternatif rock", "müzik dinlerken genellikle çalışıyorum veya yürüyüş yapıyorum"],
                        "context": "music",
                        "confidence": 0.88
                    }
                );
                break;

            case 'sports':
                categoryData.push(
                    {
                        "S": ["spor yapıyor musun", "egzersiz yapıyor musun", "fitness yapıyor musun", "hangi sporu yapıyorsun"],
                        "C": ["evet düzenli olarak spor yapmaya çalışıyorum", "evet egzersiz yapıyorum", "fitness salonuna gidiyorum", "futbol ve basketbol oynuyorum"],
                        "context": "sports",
                        "confidence": 0.85
                    },
                    {
                        "S": ["kaç kez spor yapıyorsun", "spor yapmak zor mu", "spor yaparken ne hissediyorsun", "spor yapmak neden önemli"],
                        "C": ["haftada 3-4 kez spor yapmaya çalışıyorum", "başlangıçta zor olabilir ama alışınca kolaylaşır", "spor yaparken kendimi çok enerjik hissediyorum", "spor yapmak sağlık için çok önemli"],
                        "context": "sports",
                        "confidence": 0.83
                    }
                );
                break;

            case 'cooking':
                categoryData.push(
                    {
                        "S": ["yemek yapmayı biliyor musun", "mutfakta ne yapıyorsun", "yemek yapıyor musun", "hangi yemekleri yapabiliyorsun"],
                        "C": ["biraz biliyorum ama daha çok öğrenmek istiyorum", "mutfakta yemek yapmaya çalışıyorum", "evet yemek yapıyorum", "makarna ve basit yemekler yapabiliyorum"],
                        "context": "cooking",
                        "confidence": 0.83
                    },
                    {
                        "S": ["favori yemeğin ne", "hangi mutfakları seviyorsun", "yemek yapmak zor mu", "yemek yaparken ne yapıyorsun"],
                        "C": ["favori yemeğim mantı ve kebap", "Türk ve İtalyan mutfağını çok seviyorum", "başlangıçta zor olabilir ama pratik yapınca kolaylaşır", "yemek yaparken müzik dinliyorum"],
                        "context": "cooking",
                        "confidence": 0.80
                    }
                );
                break;

            case 'gaming':
                categoryData.push(
                    {
                        "S": ["hangi oyunları oynuyorsun", "oyun oynuyor musun", "ne oyunu oynuyorsun", "bilgisayar oyunları oynuyor musun"],
                        "C": ["strateji ve macera oyunlarını seviyorum", "evet oyun oynuyorum", "bilgisayar oyunları oynuyorum", "evet bilgisayar oyunları oynamayı seviyorum"],
                        "context": "gaming",
                        "confidence": 0.89
                    },
                    {
                        "S": ["favori oyunun ne", "hangi tür oyunları seviyorsun", "oyun oynamak faydalı mı", "kaç saat oyun oynuyorsun"],
                        "C": ["favori oyunum 'The Witcher 3'", "rpg ve strateji oyunlarını çok seviyorum", "oyun oynamak el-göz koordinasyonunu geliştirir", "günde 1-2 saat oyun oynuyorum"],
                        "context": "gaming",
                        "confidence": 0.86
                    }
                );
                break;

            case 'social':
                categoryData.push(
                    {
                        "S": ["arkadaşların var mı", "sosyal misin", "insanlarla görüşüyor musun", "kaç arkadaşın var"],
                        "C": ["evet güzel arkadaşlarım var onlarla vakit geçirmeyi seviyorum", "evet sosyal biriyim", "evet insanlarla görüşüyorum", "yaklaşık 10-15 yakın arkadaşım var"],
                        "context": "social",
                        "confidence": 0.91
                    },
                    {
                        "S": ["arkadaşlarınla ne yapıyorsun", "sosyal medya kullanıyor musun", "yeni insanlarla tanışmayı seviyor musun", "parti yapmayı seviyor musun"],
                        "C": ["arkadaşlarımla sinemaya gidiyor ve yemek yiyoruz", "evet Instagram ve Twitter kullanıyorum", "evet yeni insanlarla tanışmayı çok seviyorum", "evet parti yapmayı ve eğlenmeyi seviyorum"],
                        "context": "social",
                        "confidence": 0.88
                    }
                );
                break;

            case 'technology':
                categoryData.push(
                    {
                        "S": ["teknoloji hakkında ne düşünüyorsun", "teknoloji seviyor musun", "teknoloji nasıl", "hangi teknolojileri kullanıyorsun"],
                        "C": ["teknoloji hayatımızı kolaylaştırıyor ama dikkatli kullanmak gerek", "evet teknolojiyi seviyorum", "teknoloji çok gelişmiş", "akıllı telefon ve bilgisayar kullanıyorum"],
                        "context": "technology",
                        "confidence": 0.86
                    },
                    {
                        "S": ["yapay zeka hakkında ne düşünüyorsun", "gelecekte teknoloji nasıl olacak", "teknoloji bağımlılığı var mı", "hangi teknoloji şirketlerini takip ediyorsun"],
                        "C": ["yapay zeka gelecekte çok önemli olacak", "gelecekte daha akıllı ve küçük cihazlar olacak", "evet biraz teknoloji bağımlılığım var", "Apple ve Google'ı takip ediyorum"],
                        "context": "technology",
                        "confidence": 0.84
                    }
                );
                break;

            default:
                // Diğer kategoriler için genel soru-cevap çiftleri
                categoryData.push(
                    {
                        "S": [`${category} hakkında ne düşünüyorsun`, `${category} seviyor musun`, `${category} nasıl`, `${category} ile ilgili ne biliyorsun`],
                        "C": [`${category} hakkında çok şey bilmiyorum ama öğrenmek istiyorum`, `evet ${category} ile ilgileniyorum`, `${category} çok ilginç`, `${category} hakkında temel bilgilerim var`],
                        "context": category,
                        "confidence": 0.75
                    }
                );
        }

        return categoryData;
    }

    // Hatalı yazılmış sorular ekle
    addMisspelledQuestions() {
        const misspelledVariations = [
            {
                "S": ["teşekür ederim", "gideceğim okula", "seviyorum müziği", "rahatlatıyor beni", "mutlu ediyor beni"],
                "C": ["teşekkür ederim ben de", "gideceğim okula yarın", "seviyorum müziği çok", "rahatlatıyor beni müzik", "mutlu ediyor beni bu"],
                "context": "misspelled",
                "confidence": 0.70
            },
            {
                "S": ["sağlık için", "öğrenmek istiyorum", "oyunları oynamayı", "vakit geçirmek", "eğlenceli oluyor"],
                "C": ["sağlık için spor yapmalıyız", "öğrenmek istiyorum yeni şeyler", "oyunları oynamayı seviyorum", "vakit geçirmek güzel", "eğlenceli oluyor birlikte"],
                "context": "misspelled",
                "confidence": 0.70
            }
        ];

        this.qaData.push(...misspelledVariations);
    }

    // Karmaşık sorular ekle
    addComplexQuestions() {
        const complexQuestions = [
            {
                "S": ["bugün hava nasıl ve ne yapmayı planlıyorsun", "kitap okumayı ve müzik dinlemeyi aynı anda yapabiliyor musun", "spor yaparken hangi müziği dinliyorsun ve neden"],
                "C": ["bugün hava çok güzel ve parkta yürüyüş yapmayı planlıyorum", "evet aynı anda yapabiliyorum ama kitaba odaklanmak zor oluyor", "spor yaparken hızlı tempolu müzik dinliyorum çünkü enerji veriyor"],
                "context": "complex",
                "confidence": 0.80
            },
            {
                "S": ["teknoloji ve doğa arasında denge nasıl kurulabilir", "gelecekte hangi meslekler popüler olacak ve neden", "eğitim sisteminde ne gibi değişiklikler yapılmalı"],
                "C": ["teknoloji ve doğa arasında denge sürdürülebilir gelişim ile kurulabilir", "yapay zeka ve çevre teknolojileri popüler olacak çünkü geleceğin ihtiyaçları bunlar", "eğitim sisteminde pratik eğitim ve kişiselleştirilmiş öğrenme artırılmalı"],
                "context": "complex",
                "confidence": 0.75
            }
        ];

        this.qaData.push(...complexQuestions);
    }

    // Dil varyasyonları ekle
    addLanguageVariations() {
        const languageVariations = [
            {
                "S": ["selam", "hey", "hi", "hello", "merhaba"],
                "C": ["selam nasılsın", "hey nasıl gidiyor", "hi how are you", "hello how are you", "merhaba nasılsın"],
                "context": "multilingual",
                "confidence": 0.85
            },
            {
                "S": ["nasılsın", "how are you", "comment allez-vous", "wie geht es dir"],
                "C": ["iyiyim teşekkür ederim", "I'm fine thank you", "je vais bien merci", "es geht mir gut danke"],
                "context": "multilingual",
                "confidence": 0.80
            }
        ];

        this.qaData.push(...languageVariations);
    }

    // JSON formatında kaydet
    saveTrainingData(filepath = 'large_training_dataset.json') {
        const trainingData = {
            "model": {
                "version": "1.500",
                "type": "markov-chain",
                "language": "turkish",
                "order": 3,
                "features": [
                    "misspelling-correction",
                    "context-pattern-matching",
                    "response-generation",
                    "text-generation",
                    "multilingual-support"
                ],
                "fallback_ts": ["1", "2"],
                "metadata": {
                    "created": new Date().toISOString(),
                    "author": "AI Assistant",
                    "description": "Büyük ölçekli soru-cevap eğitim seti",
                    "total_qa_pairs": this.qaData.length,
                    "categories": this.categories.length
                }
            },
            "training_data": {
                "qa_data": this.qaData,
                "categories": this.categories,
                "statistics": {
                    "total_questions": this.qaData.reduce((sum, qa) => sum + qa.S.length, 0),
                    "total_answers": this.qaData.reduce((sum, qa) => sum + qa.C.length, 0),
                    "average_confidence": (this.qaData.reduce((sum, qa) => sum + qa.confidence, 0) / this.qaData.length).toFixed(3)
                }
            },
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
            }
        };

        fs.writeFileSync(filepath, JSON.stringify(trainingData, null, 2));
        console.log(`✅ Büyük eğitim veri seti kaydedildi: ${filepath}`);
        console.log(`📊 Toplam ${this.qaData.length} Q&A kategorisi`);
        console.log(`🔢 Toplam ${trainingData.training_data.statistics.total_questions} soru`);
        console.log(`💬 Toplam ${trainingData.training_data.statistics.total_answers} cevap`);
        console.log(`📈 Ortalama güven skoru: ${trainingData.training_data.statistics.average_confidence}`);
        
        return trainingData;
    }

    // Eğitim verisi istatistiklerini göster
    showDatasetStats() {
        console.log('\n📊 EĞİTİM VERİ SETİ İSTATİSTİKLERİ');
        console.log('=====================================');
        
        const totalQuestions = this.qaData.reduce((sum, qa) => sum + qa.S.length, 0);
        const totalAnswers = this.qaData.reduce((sum, qa) => sum + qa.C.length, 0);
        const avgConfidence = this.qaData.reduce((sum, qa) => sum + qa.confidence, 0) / this.qaData.length;
        
        console.log(`📚 Toplam Kategori: ${this.categories.length}`);
        console.log(`🔢 Toplam Q&A Çifti: ${this.qaData.length}`);
        console.log(`❓ Toplam Soru: ${totalQuestions}`);
        console.log(`💬 Toplam Cevap: ${totalAnswers}`);
        console.log(`📈 Ortalama Güven: ${avgConfidence.toFixed(3)}`);
        
        // Kategori bazında istatistikler
        console.log('\n📋 Kategori Bazında Dağılım:');
        this.categories.forEach(category => {
            const categoryData = this.qaData.filter(qa => qa.context === category);
            if (categoryData.length > 0) {
                const categoryQuestions = categoryData.reduce((sum, qa) => sum + qa.S.length, 0);
                const categoryAnswers = categoryData.reduce((sum, qa) => sum + qa.C.length, 0);
                console.log(`   ${category}: ${categoryData.length} Q&A, ${categoryQuestions} soru, ${categoryAnswers} cevap`);
            }
        });
    }
}

// Eğitim verisi oluşturucu çalıştır
if (require.main === module) {
    const generator = new TrainingDataGenerator();
    
    console.log('🚀 BÜYÜK ÖLÇEKLİ EĞİTİM VERİ SETİ OLUŞTURUCU 🚀');
    console.log('=====================================================\n');
    
    // Büyük veri seti oluştur
    generator.generateLargeTrainingDataset();
    
    // İstatistikleri göster
    generator.showDatasetStats();
    
    // JSON olarak kaydet
    generator.saveTrainingData();
    
    console.log('\n✅ Eğitim veri seti oluşturma tamamlandı!');
}

module.exports = TrainingDataGenerator;