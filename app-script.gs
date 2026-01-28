/**
 * وظيفة استقبال البيانات من استمارة الويب
 * تقوم بفصل المادة والمدرس في أعمدة مستقلة
 */
function doPost(e) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName("سواعد المستقبل");
    if (!sheet) throw new Error("Sheet not found");

    // 1. تجهيز البيانات الأساسية للطالب
    const row = [
      new Date(),                             // الطابع الزمني
      e.parameter.studentName || "",          // اسم الطالب
      e.parameter.studentPhone || "",         // رقم الطالب
      e.parameter.parentName || "",           // اسم ولي الأمر
      e.parameter.parentPhone || "",          // رقم ولي الأمر
      e.parameter.stage || "",                // المرحلة
      e.parameter.year || "",                 // السنة الدراسية
      e.parameter.location || e.parameter["الموقع"] || "" // الموقع
    ];

    // 2. إضافة المواد والمدرسين في أعمدة منفصلة (حتى 10 مواد)
    // الترتيب سيكون: مادة 1 | مدرس 1 | مادة 2 | مدرس 2 ... إلخ
    for (let i = 1; i <= 10; i++) {
      const subj = e.parameter["subject" + i];
      const teach = e.parameter["teacher" + i];
      
      if (subj || teach) {
        row.push(subj || "");  // عمود المادة
        row.push(teach || ""); // عمود المدرس
      } else {
        // دفع قيم فارغة للحفاظ على محاذاة الأعمدة إذا لم توجد مادة
        row.push("");
        row.push("");
      }
    }

    // 3. إضافة الصف إلى الشيت
    sheet.appendRow(row);

    return ContentService.createTextOutput(JSON.stringify({ status: "success" }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ status: "error", message: err.message }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * وظيفة اختيارية لاختبار عمل الرابط
 */
function doGet() {
  return ContentService.createTextOutput("API Running - مركز سواعد المستقبل").setMimeType(ContentService.MimeType.TEXT);
}

/**
 * وظيفة لإنشاء صف العناوين وتنسيقه تلقائياً
 * قم بتشغيل هذه الدالة مرة واحدة فقط من قائمة التشغيل العلوية
 */
function createSheetHeaders() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName("سواعد المستقبل");
  
  if (!sheet) {
    sheet = ss.insertSheet("سواعد المستقبل");
  }

  // العناوين الثابتة
  const headers = [
    "الطابع الزمني", 
    "اسم الطالب", 
    "رقم الطالب", 
    "اسم ولي الأمر", 
    "رقم ولي الأمر", 
    "المرحلة", 
    "السنة الدراسية",
    "الموقع"
  ];

  // إضافة عناوين المواد (10 مواد × 2 عمود لكل مادة = 20 عمود إضافي)
  for (let i = 1; i <= 10; i++) {
    headers.push("المادة " + i);
    headers.push("مدرس المادة " + i);
  }

  // تطبيق العناوين في الصف الأول
  sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  
  // تنسيق احترافي (لون برتقالي وأبيض)
  const headerRange = sheet.getRange(1, 1, 1, headers.length);
  headerRange.setFontWeight("bold")
             .setBackground("#F58220") // لون اللوجو البرتقالي
             .setFontColor("white")
             .setHorizontalAlignment("center")
             .setVerticalAlignment("middle");
            
  sheet.setFrozenRows(1); // تثبيت الصف العلوي
  sheet.autoResizeColumns(1, headers.length); // ضبط عرض الأعمدة تلقائياً
}
