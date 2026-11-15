// GROQ API KEY
// API key is never committed: entered once by the user and kept in this browser only.
const GROQ_API_KEY = localStorage.getItem("groq_api_key") || (function(){ const k = prompt("Groq API key:") || ""; if (k) localStorage.setItem("groq_api_key", k); return k; })();

document.addEventListener("DOMContentLoaded", function () {
    const generateAllBtn = document.getElementById("generateAllBtn");
    if (generateAllBtn) {
        generateAllBtn.addEventListener("click", function (e) {
            e.preventDefault();
            
            // FORM VALIDASYONU (Boş alan kontrolü)
            const form = document.getElementById("fitnessForm");
            if (form && !form.checkValidity()) {
                form.reportValidity(); // Tarayıcının eksik alanları uyarmasını sağlar
                return;
            }

            generateFullReport();
        });
    } else {
        console.error("HATA: 'generateAllBtn' ID'li buton HTML sayfasında bulunamadı!");
    }
});

function getFormData() {
    const name = document.getElementById("name")?.value || "Sporcu";
    const age = parseInt(document.getElementById("age")?.value) || 25;
    const gender = document.getElementById("gender")?.value || "Erkek";
    const height = parseFloat(document.getElementById("height")?.value) || 175;
    const weight = parseFloat(document.getElementById("weight")?.value) || 75;
    const waist = parseFloat(document.getElementById("waist")?.value) || 80;
    const neck = parseFloat(document.getElementById("neck")?.value) || 38;
    const job = document.getElementById("job")?.value || "Öğrenci";
    const otherSportsDays = document.getElementById("otherSportsDays")?.value || "Yok";
    const goal = document.getElementById("goal")?.value || "Kilo Almak / Hacimlenme (Bulk)";
    const days = document.getElementById("days")?.value || "Haftada 6 Gün";
    const intensity = document.getElementById("intensity")?.value || "Yüksek (Hardcore)";
    const injuries = document.getElementById("injuries")?.value || "Yok";
    const dislikedExercises = document.getElementById("dislikedExercises")?.value || "Yok";
    const allergies = document.getElementById("allergies")?.value || "Yok";
    const dislikedFoods = document.getElementById("dislikedFoods")?.value || "Yok";
    const likedFoods = document.getElementById("likedFoods")?.value || "Belirtilmemiş";

    let bodyFat = 15;
    if (gender === "Erkek") {
        const diff = waist - neck;
        if (diff > 0) bodyFat = Math.round(495 / (1.0324 - 0.19077 * Math.log10(diff) + 0.15456 * Math.log10(height)) - 450);
    } else {
        bodyFat = Math.round((waist / height) * 50);
    }

    let bmr = (10 * weight) + (6.25 * height) - (5 * age) + (gender === "Erkek" ? 5 : -161);
    let activity = 1.2;
    if (job.toLowerCase().includes("öğrenci") || job.toLowerCase().includes("ayakta")) activity = 1.375;
    if (job.toLowerCase().includes("işçi")) activity = 1.55;
    if (otherSportsDays.includes("2")) activity += 0.05;
    if (otherSportsDays.includes("3")) activity += 0.1;

    let targetCalories = Math.round(bmr * activity);
    if (goal.includes("Almak") || goal.includes("Bulk")) targetCalories += 400;
    if (goal.includes("Yakımı") || goal.includes("Cut")) targetCalories -= 400;

    const proteinGrams = Math.round(weight * 2.0);
    const fatGrams = Math.round(weight * 0.9);
    const carbGrams = Math.max(50, Math.round((targetCalories - (proteinGrams * 4 + fatGrams * 9)) / 4));

    const perMealCal = Math.round(targetCalories / 4);
    const perMealProtein = Math.round(proteinGrams / 4);
    const perMealCarb = Math.round(carbGrams / 4);
    const perMealFat = Math.round(fatGrams / 4);

    return {
        name, age, gender, height, weight, waist, neck, job, goal, days, intensity,
        injuries, dislikedExercises, allergies, dislikedFoods, likedFoods, bodyFat,
        calories: targetCalories, protein: proteinGrams, carbs: carbGrams, fat: fatGrams,
        perMealCal, perMealProtein, perMealCarb, perMealFat
    };
}

async function generateFullReport() {
    const generateBtn = document.getElementById("generateAllBtn");
    
    if (generateBtn) {
        generateBtn.disabled = true;
        generateBtn.style.opacity = "0.6";
        generateBtn.style.cursor = "not-allowed";
        generateBtn.innerText = "⏳ Rapor Hazırlanıyor...";
    }

    const data = getFormData();
    const loading = document.getElementById("loading");
    const resultCard = document.getElementById("resultCard");
    const outputContent = document.getElementById("outputContent");

    if (loading) loading.classList.remove("hidden");
    if (resultCard) resultCard.classList.add("hidden");

    let dietHeaderHTML = `
    <h2>1. Beslenme & Makro Hedef Raporu</h2>
    
    <div style="background-color:#f8fafc; border:1px solid #e2e8f0; border-radius:8px; padding:15px; margin-bottom:20px;">
        <h3 style="color:#1e40af; margin-top:0; font-size:16px;">📊 GÜNLÜK TOPLAM İHTİYAÇ</h3>
        <table style="width:100%; border-collapse:collapse; margin-top:10px;">
          <thead>
            <tr style="background-color:#2563eb; color:white;">
              <th style="padding:10px;">GÜNLÜK KALORİ</th>
              <th style="padding:10px;">TOPLAM PROTEİN</th>
              <th style="padding:10px;">TOPLAM KARBONHİDRAT</th>
              <th style="padding:10px;">TOPLAM YAĞ</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style="padding:10px; text-align:center; border:1px solid #e2e8f0; font-weight:bold; font-size:16px;">${data.calories} kcal</td>
              <td style="padding:10px; text-align:center; border:1px solid #e2e8f0; font-weight:bold; font-size:16px;">${data.protein}g</td>
              <td style="padding:10px; text-align:center; border:1px solid #e2e8f0; font-weight:bold; font-size:16px;">${data.carbs}g</td>
              <td style="padding:10px; text-align:center; border:1px solid #e2e8f0; font-weight:bold; font-size:16px;">${data.fat}g</td>
            </tr>
          </tbody>
        </table>
    </div>

    <div style="background-color:#eff6ff; border:1px solid #bfdbfe; border-radius:8px; padding:15px; margin-bottom:20px;">
        <h3 style="color:#1e3a8a; margin-top:0; font-size:16px;">🍽️ ÖĞÜN BAŞINA DÜŞEN HEDEFLER (GÜNLÜK 4 ÖĞÜN DÜZENİ)</h3>
        <p style="font-size:13px; color:#1e40af; margin-bottom:10px;">Günlük hedeflerinizi tutturmak için beslenmenizi <strong>4 eşit öğüne</strong> bölmeniz tavsiye edilir. Öğün başı almanız gereken ortalama değerler:</p>
        
        <table style="width:100%; border-collapse:collapse;">
          <thead>
            <tr style="background-color:#3b82f6; color:white; font-size:13px;">
              <th style="padding:8px;">ÖĞÜN BAŞI KALORİ</th>
              <th style="padding:8px;">ÖĞÜN BAŞI PROTEİN</th>
              <th style="padding:8px;">ÖĞÜN BAŞI KARBONHİDRAT</th>
              <th style="padding:8px;">ÖĞÜN BAŞI YAĞ</th>
            </tr>
          </thead>
          <tbody>
            <tr style="background-color:white;">
              <td style="padding:8px; text-align:center; border:1px solid #cbd5e1; font-weight:bold;">~${data.perMealCal} kcal</td>
              <td style="padding:8px; text-align:center; border:1px solid #cbd5e1; font-weight:bold;">~${data.perMealProtein}g</td>
              <td style="padding:8px; text-align:center; border:1px solid #cbd5e1; font-weight:bold;">~${data.perMealCarb}g</td>
              <td style="padding:8px; text-align:center; border:1px solid #cbd5e1; font-weight:bold;">~${data.perMealFat}g</td>
            </tr>
          </tbody>
        </table>
    </div>
    `;

    const isLightIntensity = data.intensity.toLowerCase().includes("hafif");

    const prompt = `
    Aşağıdaki sporcu profilini analiz et ve XFIT PLATINUM kalitesinde KİŞİYE ÖZEL SAF HTML RAPOR üret.

    SPORCU PROFİLİ VE SEÇİLEN KRİTERLER:
    - Ad Soyad: ${data.name} | Meslek: ${data.job}
    - Ana Hedef: ${data.goal} 
    - SPORA GİDECEĞİ GÜN SAYISI: ${data.days} -> Seçilen gün sayısına en uygun antrenman sistemini (Örn: 3 günse Fullbody, 4 günse Upper/Lower, 5-6 günse PPL) kendin belirle ve o güne özel program oluştur.
    - İSTENEN ANTRENMAN ŞİDDETİ: ${data.intensity} -> ${isLightIntensity ? 'Kullanıcı HAFİF seviye seçmiştir. Tekrar sayıları yüksek (12-15 tekrar), ağırlıklar kontrollü, eklem dostu olmalıdır.' : 'Kullanıcı YÜKSEK seviye seçmiştir. Ağır yüklenme ve yüksek RPE hedeflenmelidir.'}
    - Sakatlıklar/Kısıtlamalar: ${data.injuries} -> DİKKATE AL!
    - Alerjiler: ${data.allergies} | Sevmediği Besinler: ${data.dislikedFoods} | Sevdiği/Öncelikli Besinler: ${data.likedFoods}

    KESİN KURALLAR VE FORMAT:
    1. ASLA EN ÜSTE GİRİŞ, AÇIKLAMA VEYA "İŞTE PROGRAMINIZ" GİBİ METİNLER YAZMA! Doğrudan <h2>2. Kaliteli Besin & Tüketim Paylaşımı</h2> ile başla.
    2. İKİNCİ BÖLÜMDE (Besin Paylaşımı) düz paragraf metinleri ASLA YAZMA. Kesinlikle alt alta liste (HTML <ul> ve <li> etiketleri) kullanarak net besin isimleri paylaş:
       - 🥩 **Protein Kaynakları:** Tavuk göğsü, yumurta, kırmızı et, lor peyniri vb. net besinler.
       - 🍚 **Kaliteli Karbonhidratlar:** Pirinç, yulaf, makarna, patates vb. net besinler.
       - 🥑 **Sağlıklı Yağlar:** Zeytinyağı, fıstık ezmesi, ceviz, badem vb. net besinler.
    3. ANTRENMAN KISMINDA: Her günün başlığı kas grubunu açıkça içersin (Örn: 1. GÜN - PUSH (Göğüs, Omuz, Triceps)). Asla her yere sadece "İTİŞ" yazma. Gün sayısına (${data.days}) uygun kutu adedince ve her güne KESİNLİKLE TAM 6 HAREKET (4 büyük + 2 küçük kas) yaz. Hareketler <strong>Bench Press</strong> 4x8-12 şeklinde olsun.
    4. 4. BÖLÜMDE (Antrenör Notu): Şablon metinler bırakma. ${data.name} adlı sporcuya ${data.goal} hedefi doğrultusunda 2-3 cümlelik gerçek, motive edici profesyonel bir koç tavsiyesi yaz.

    ÜRETİLECEK BİREBİR HTML YAPISI:

    <h2>2. Kaliteli Besin & Tüketim Paylaşımı</h2>
    <ul style="margin:0; padding-left:20px; line-height:1.8; font-size:14px;">
      <li><strong>Protein Kaynakları:</strong> Tavuk göğsü, hindi, yumurta beyazı, lor peyniri...</li>
      <li><strong>Karbonhidrat Kaynakları:</strong> Yasemin pirinci, yulaf ezmesi, haşlanmış patates, kepekli makarna...</li>
      <li><strong>Sağlıklı Yağ Kaynakları:</strong> Çiğ badem, ceviz, zeytinyağı, fıstık ezmesi...</li>
      <li><strong>Önemli Beslenme Tavsiyesi:</strong> Antrenman öncesi ve sonrası karbonhidrat-protein alımına dikkat edin, günlük su tüketimini 3-4 litre tutun.</li>
    </ul>

    <h2>3. Antrenman Programı (${data.days} - ${data.intensity} Şiddetinde)</h2>

    <div style="margin-bottom:15px; border:1px solid #cbd5e1; border-radius:8px; overflow:hidden;">
      <div style="background-color:#2563eb; color:white; padding:10px 15px; font-weight:bold; font-size:14px;">1. GÜN - ÖRNEK BAŞLIK (Örn: GÖĞÜS & TRİCEPS)</div>
      <div style="padding:15px; background-color:#ffffff; line-height:2.0; font-size:14px;">
        <strong>Bench Press</strong> 4x8-12<br>
        <strong>Incline Dumbbell Press</strong> 3x10-12<br>
        <strong>Chest Dip</strong> 3x10-12<br>
        <strong>Cable Fly</strong> 3x12-15<br>
        <strong>Tricep Pushdown</strong> 3x10-12<br>
        <strong>Skull Crusher</strong> 3x12 <span style="color:#94a3b8; font-size:12px;">(Yorgunluk seviyesine bağlı çıkarılabilir)</span>
      </div>
    </div>
    <!-- Seçilen gün sayısı kadar bu alt alta kutuları (div) çoğalt -->

    <h2>4. XFIT Antrenör Notu & Şiddet Rehberi</h2>
    <p>${data.name} için koçun gerçek motivasyon ve antrenman disiplini tavsiyesi buraya yazılacak...</p>
    
    ${isLightIntensity ? '<p style="color:#d97706; font-size:13px; font-weight:600;">⚠️ <strong>Şiddet Notu:</strong> Hafif seviye antrenman tercih ettiğiniz için aşırı ağır yüklenmelerden kaçının. Ağırlıkları daha hafif/orta seviyede tutarak hareketlerin formunu bozmadan, nizami ve kas-zihin bağlantısını hissederek tamamlamaya özen gösterin.</p>' : ''}

    <div style="background-color:#eff6ff; border-left:4px solid #2563eb; padding:12px; border-radius:6px; margin-top:15px; color:#1e3a8a; font-size:13px; font-weight:600;">
       🤝 Programınızla ilgili her türlü soruyu salondaki XFIT eğitmenlerinize yüz yüze danışabilirsiniz.
    </div>
    `;

    try {
        const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${GROQ_API_KEY}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                model: "llama-3.1-8b-instant",
                messages: [
                    {
                        role: "system",
                        content: "Sen XFIT Platinum baş antrenörü ve diyetisyenisin. Sadece verilen HTML örneğindeki stilde temiz HTML çıktı üretirsin. Asla giriş açıklaması, düşünme metinleri veya markdown yazmazsın."
                    },
                    {
                        role: "user",
                        content: prompt
                    }
                ],
                temperature: 0.1,
                max_tokens: 3500
            })
        });

        const result = await response.json();
        if (loading) loading.classList.add("hidden");

        if (result.choices && result.choices.length > 0) {
            let content = result.choices[0].message.content;
            content = content.replace(/```html/gi, "").replace(/```/gi, "").trim();
            if (content.includes("<h2>")) {
                content = content.substring(content.indexOf("<h2>"));
            }
            outputContent.innerHTML = dietHeaderHTML + content;
            resultCard.classList.remove("hidden");
        } else {
            console.error("Groq Hata Detayı:", result);
            alert("Groq API Hatası: " + (result.error?.message || "Yanıt alınamadı"));
        }
    } catch (err) {
        if (loading) loading.classList.add("hidden");
        alert("Bağlantı hatası: " + err.message);
    } finally {
        if (generateBtn) {
            generateBtn.disabled = false;
            generateBtn.style.opacity = "1";
            generateBtn.style.cursor = "pointer";
            generateBtn.innerText = "🚀 Kişisel XFIT Raporumu Oluştur (Diyet + Antrenman)";
        }
    }
}