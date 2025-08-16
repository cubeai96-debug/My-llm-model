# 🚀 Markov Tabanlı Mini Language Model

Gelişmiş hatalı yazıları anlayabilen ve binlerce soru-cevap ile eğitilebilen JavaScript tabanlı mini language model.

## ✨ Özellikler

- **Markov Chain Tabanlı**: 3-gram model ile doğal dil üretimi
- **Hatalı Yazı Anlama**: Levenshtein distance ile yazım hatalarını düzeltme
- **Context Pattern Matching**: Soru-cevap bağlamlarını anlama
- **Çoklu Dil Desteği**: Türkçe karakterler dahil
- **JSON Format**: Eğitim verilerini JSON formatında saklama
- **Performans Optimizasyonu**: Hızlı cevap üretimi
- **Model Persistence**: Eğitilmiş modelleri kaydetme/yükleme

## 🏗️ Proje Yapısı

```
src/
├── model.js          # Ana Markov model sınıfı
├── trainer.js        # Model eğitim sınıfı
├── test.js          # Test ve değerlendirme
├── demo.js          # İnteraktif demo
└── main.js          # Ana uygulama
```

## 🚀 Kurulum

```bash
# Projeyi klonlayın
git clone <repository-url>
cd markov-mini-language-model

# Bağımlılıkları yükleyin
npm install

# Uygulamayı çalıştırın
npm start
```

## 📚 Kullanım

### 1. Ana Uygulama
```bash
npm start
```

### 2. Sadece Eğitim
```bash
npm run train
```

### 3. Test Çalıştırma
```bash
npm run test
```

### 4. Demo
```bash
npm run demo
```

## 🔧 JSON Format

Proje, gelişmiş bir JSON formatı kullanır:

```json
{
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
    "fallback_ts": ["1", "2"]
  },
  "training_data": {
    "general_texts": ["metin1", "metin2"],
    "misspelled_texts": ["hatalı1", "hatalı2"]
  },
  "qa_data": [
    {
      "S": ["soru1", "soru2"],
      "C": ["cevap1", "cevap2"],
      "context": "greeting",
      "confidence": 0.95
    }
  ],
  "misspelling_corrections": {
    "teşekür": "teşekkür"
  },
  "response_templates": {
    "greeting": ["merhaba", "selam"]
  }
}
```

## 🎯 Örnek Kullanım

### Basit Model Oluşturma
```javascript
const MarkovMiniLanguageModel = require('./src/model');

const model = new MarkovMiniLanguageModel(3);

// Eğitim verileri
const texts = ["merhaba nasılsın", "bugün hava güzel"];
model.train(texts);

// Metin üretimi
const generatedText = model.generateText(10);
console.log(generatedText);
```

### Hatalı Yazı Düzeltme
```javascript
// Hatalı yazı düzeltme örnekleri ekle
model.addMisspellingCorrections({
  "teşekür": "teşekkür",
  "gideceğim": "gideceğim"
});

// Hatalı yazıyı düzelt
const corrected = model.correctMisspellings(["teşekür", "ederim"]);
console.log(corrected); // ["teşekkür", "ederim"]
```

### Soru-Cevap Üretimi
```javascript
// Soru-cevap verileriyle eğit
const questions = ["merhaba nasılsın"];
const answers = ["merhaba ben iyiyim"];
model.train(questions, answers);

// Cevap üret
const response = model.generateResponse("merhaba nasılsın");
console.log(response);
```

## 🧪 Test

### Kapsamlı Test
```bash
npm run test
```

### Performans Testi
```javascript
const tester = new ModelTester();
tester.runPerformanceTest();
```

## 📊 Model İstatistikleri

```javascript
const stats = model.getStats();
console.log(stats);
// {
//   order: 3,
//   vocabularySize: 150,
//   transitionCount: 300,
//   startStateCount: 50,
//   endStateCount: 45,
//   trainingDataCount: 100,
//   contextPatternCount: 25
// }
```

## 🔍 Özellik Detayları

### 1. Markov Chain Model
- **Order**: 3-gram (3 kelimelik durumlar)
- **Transition Matrix**: Kelime geçiş olasılıkları
- **Start/End States**: Cümle başlangıç ve bitiş durumları

### 2. Hatalı Yazı Düzeltme
- **Levenshtein Distance**: Kelime benzerliği hesaplama
- **Correction Map**: Bilinen hatalı yazı düzeltmeleri
- **Threshold**: Maksimum 2 karakter farkı

### 3. Context Pattern Matching
- **Sliding Window**: 3 kelimelik bağlam penceresi
- **Response Selection**: Rastgele cevap seçimi
- **Fallback**: Context bulunamazsa Markov üretimi

### 4. Performance Optimizations
- **Map Data Structures**: Hızlı arama
- **Weighted Random Choice**: Ağırlıklı rastgele seçim
- **Memory Management**: Verimli bellek kullanımı

## 🚀 Gelişmiş Özellikler

### 1. Model Persistence
```javascript
// Modeli kaydet
model.saveModel('my_model.json');

// Modeli yükle
model.loadModel('my_model.json');
```

### 2. Response Templates
```javascript
model.addResponseTemplates({
  "greeting": ["merhaba", "selam", "hey"],
  "weather": ["hava güzel", "güneşli", "yağmurlu"]
});
```

### 3. Custom Training Data
```javascript
// Kendi eğitim verilerinizi ekleyin
const customTexts = ["özel metin 1", "özel metin 2"];
model.train(customTexts);
```

## 📈 Performans

- **Eğitim Süresi**: ~1000 örnek için <1 saniye
- **Cevap Üretimi**: ~1-5ms
- **Metin Üretimi**: ~10-20ms
- **Bellek Kullanımı**: ~1-5MB (1000 örnek için)

## 🔧 Geliştirme

### Yeni Özellik Ekleme
1. `model.js` dosyasına yeni metod ekleyin
2. `trainer.js` dosyasında eğitim verilerini güncelleyin
3. `test.js` dosyasında test senaryoları ekleyin

### Test Ekleme
```javascript
// Yeni test senaryosu
testCases.push({
  category: "Yeni Kategori",
  questions: ["yeni soru 1", "yeni soru 2"]
});
```

## 📝 Lisans

MIT License

## 🤝 Katkıda Bulunma

1. Fork yapın
2. Feature branch oluşturun (`git checkout -b feature/amazing-feature`)
3. Commit yapın (`git commit -m 'Add amazing feature'`)
4. Push yapın (`git push origin feature/amazing-feature`)
5. Pull Request oluşturun

## 📞 İletişim

- **Proje**: Markov Mini Language Model
- **Versiyon**: 1.500
- **Dil**: JavaScript (Node.js)
- **Framework**: Vanilla JavaScript

## 🎉 Teşekkürler

Bu proje, doğal dil işleme ve makine öğrenmesi alanındaki gelişmeleri takip ederek, basit ama etkili bir language model oluşturmayı hedeflemektedir.

---

**Not**: Bu model eğitim amaçlıdır ve gerçek üretim ortamlarında kullanılmadan önce kapsamlı test edilmelidir.
