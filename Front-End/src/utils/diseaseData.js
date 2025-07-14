// Helper function to create disease entry
const createDiseaseEntry = (name, description, severity, treatment, nameAr, descriptionAr, severityAr, treatmentAr) => ({
  en: {
    name,
    description,
    severity,
    treatment: Array.isArray(treatment) ? treatment : [treatment]
  },
  ar: {
    name: nameAr,
    description: descriptionAr,
    severity: severityAr,
    treatment: Array.isArray(treatmentAr) ? treatmentAr : [treatmentAr]
  }
});

// Base disease data
export const diseaseData = {
  // Apple Diseases
  'Apple___Apple_scab': createDiseaseEntry(
    'Apple Scab',
    'Fungal disease causing dark spots on leaves and fruit.',
    'Severe',
    [
      'Use appropriate fungicides',
      'Remove infected leaves immediately',
      'Improve air circulation',
      'Practice proper sanitation',
      'Clean up fallen leaves in autumn'
    ],
    'جرب التفاح',
    'مرض فطري يسبب بقع داكنة على الأوراق والفواكه.',
    'شديد',
    [
      'استخدم مبيدات الفطريات المناسبة',
      'إزالة الأوراق المصابة فورا',
      'تحسين دوران الهواء',
      'ممارسة النظافة المناسبة',
      'تنظيف الأوراق المتساقطة في الخريف'
    ]
  ),
  'Apple___Black_rot': createDiseaseEntry(
    'Black Rot',
    'Causes dark, sunken spots on apples.',
    'Severe',
    [
      'Prune infected branches',
      'Apply fungicides',
      'Remove mummified fruits',
      'Maintain proper tree spacing',
      'Ensure good air circulation'
    ],
    'العفن الأسود',
    'يسبب بقع داكنة وغائرة على التفاح.',
    'شديد',
    [
      'تقليم الفروع المصابة',
      'استخدام مبيدات الفطريات',
      'إزالة الفواكه المتحجرة',
      'الحفاظ على مسافات مناسبة بين الأشجار',
      'ضمان دوران الهواء الجيد'
    ]
  ),
  'Apple___Cedar_apple_rust': createDiseaseEntry(
    'Cedar Apple Rust',
    'Orange spots on leaves; affects apples and cedars.',
    'Moderate',
    [
      'Remove nearby cedar trees',
      'Apply preventive fungicides',
      'Plant resistant varieties',
      'Monitor trees regularly',
      'Maintain tree health'
    ],
    'صدأ التفاح والأرز',
    'بقع برتقالية على الأوراق؛ يؤثر على التفاح وأشجار الأرز.',
    'متوسط',
    [
      'إزالة أشجار الأرز القريبة',
      'استخدام مبيدات الفطريات الوقائية',
      'زراعة أصناف مقاومة',
      'مراقبة الأشجار بانتظام',
      'الحفاظ على صحة الأشجار'
    ]
  ),
  'Apple___healthy': createDiseaseEntry(
    'Healthy Apple Tree',
    'Tree appears healthy with no visible disease symptoms.',
    'Healthy',
    [
      'Continue regular maintenance',
      'Monitor for early signs of disease',
      'Maintain good air circulation',
      'Practice proper pruning'
    ],
    'شجرة تفاح سليمة',
    'تبدو الشجرة بصحة جيدة بدون أعراض مرضية ظاهرة.',
    'سليم',
    [
      'استمر في الصيانة العادية',
      'راقب العلامات المبكرة للمرض',
      'حافظ على دوران الهواء الجيد',
      'مارس التقليم المناسب'
    ]
  ),

  // Cherry Diseases
  'Cherry___Powdery_mildew': createDiseaseEntry(
    'Powdery Mildew',
    'White powdery fungus on leaves.',
    'Moderate',
    [
      'Apply sulfur-based fungicides',
      'Ensure good airflow',
      'Prune to improve ventilation',
      'Remove infected parts'
    ],
    'البياض الدقيقي',
    'فطر أبيض مسحوقي على الأوراق.',
    'متوسط',
    [
      'استخدام مبيدات الفطريات التي تحتوي على الكبريت',
      'ضمان تدفق الهواء الجيد',
      'التقليم لتحسين التهوية',
      'إزالة الأجزاء المصابة'
    ]
  ),
  'Cherry___healthy': createDiseaseEntry(
    'Healthy Cherry Tree',
    'Tree appears healthy with no visible disease symptoms.',
    'Healthy',
    [
      'Continue regular maintenance',
      'Monitor for disease signs',
      'Maintain proper spacing'
    ],
    'شجرة كرز سليمة',
    'تبدو الشجرة بصحة جيدة بدون أعراض مرضية ظاهرة.',
    'سليم',
    [
      'استمر في الصيانة العادية',
      'راقب علامات المرض',
      'حافظ على المسافات المناسبة'
    ]
  ),

  // Corn Diseases
  'Corn___Cercospora_leaf_spot': createDiseaseEntry(
    'Cercospora Leaf Spot',
    'Gray lesions on leaves.',
    'Moderate to Severe',
    [
      'Use resistant varieties',
      'Apply appropriate fungicides',
      'Improve air circulation',
      'Practice crop rotation'
    ],
    'تبقع الأوراق سيركوسبورا',
    'آفات رمادية على الأوراق.',
    'متوسط إلى شديد',
    [
      'استخدام أصناف مقاومة',
      'تطبيق مبيدات الفطريات المناسبة',
      'تحسين دوران الهواء',
      'ممارسة الدورة الزراعية'
    ]
  ),
  'Corn___Common_rust': createDiseaseEntry(
    'Common Rust',
    'Reddish-brown spots on leaves.',
    'Moderate',
    [
      'Plant resistant hybrids',
      'Apply fungicides if severe',
      'Monitor crop regularly',
      'Time planting to avoid conditions favorable for rust'
    ],
    'الصدأ الشائع',
    'بقع بنية محمرة على الأوراق.',
    'متوسط',
    [
      'زراعة هجن مقاومة',
      'استخدام مبيدات الفطريات إذا كان شديدا',
      'مراقبة المحصول بانتظام',
      'توقيت الزراعة لتجنب الظروف المواتية للصدأ'
    ]
  ),
  'Corn___Northern_Leaf_Blight': createDiseaseEntry(
    'Northern Leaf Blight',
    'Brown, elongated lesions.',
    'Severe',
    [
      'Use resistant varieties',
      'Apply fungicides when needed',
      'Practice crop rotation',
      'Remove crop debris'
    ],
    'لفحة الأوراق الشمالية',
    'آفات بنية متطاولة.',
    'شديد',
    [
      'استخدام أصناف مقاومة',
      'تطبيق مبيدات الفطريات عند الحاجة',
      'ممارسة الدورة الزراعية',
      'إزالة بقايا المحصول'
    ]
  ),
  'Corn___healthy': createDiseaseEntry(
    'Healthy Corn Plant',
    'Plant appears healthy with no visible disease symptoms.',
    'Healthy',
    [
      'Continue regular maintenance',
      'Monitor for disease signs',
      'Maintain proper spacing'
    ],
    'نبات ذرة سليم',
    'يبدو النبات بصحة جيدة بدون أعراض مرضية ظاهرة.',
    'سليم',
    [
      'استمر في الصيانة العادية',
      'راقب علامات المرض',
      'حافظ على المسافات المناسبة'
    ]
  ),

  // Grape Diseases
  'Grape___Black_rot': createDiseaseEntry(
    'Black Rot',
    'Dark spots and fruit shriveling.',
    'Severe',
    [
      'Prune infected areas',
      'Apply fungicides',
      'Remove mummified fruits',
      'Improve air circulation'
    ],
    'العفن الأسود',
    'بقع داكنة وذبول الفاكهة.',
    'شديد',
    [
      'تقليم المناطق المصابة',
      'استخدام مبيدات الفطريات',
      'إزالة الفواكه المتحجرة',
      'تحسين دوران الهواء'
    ]
  ),
  'Grape___Esca_(Black_Measles)': createDiseaseEntry(
    'Esca (Black Measles)',
    'Leaves show tiger stripe patterns.',
    'Severe',
    [
      'Remove infected vines',
      'Apply fungicides',
      'Avoid pruning in wet weather',
      'Protect pruning wounds'
    ],
    'إسكا (الحصبة السوداء)',
    'تظهر الأوراق أنماط خطوط النمر.',
    'شديد',
    [
      'إزالة الكروم المصابة',
      'استخدام مبيدات الفطريات',
      'تجنب التقليم في الطقس الرطب',
      'حماية جروح التقليم'
    ]
  ),
  'Grape___Leaf_blight': createDiseaseEntry(
    'Leaf Blight',
    'Brown leaf spots.',
    'Moderate',
    [
      'Improve airflow',
      'Apply fungicides',
      'Remove infected leaves',
      'Manage canopy density'
    ],
    '  نبات العنب لفحة الأوراق',
    'بقع بنية على الأوراق.',
    'متوسط',
    [
      'تحسين تدفق الهواء',
      'استخدام مبيدات الفطريات',
      'إزالة الأوراق المصابة',
      'إدارة كثافة المظلة'
    ]
  ),
  'Grape___healthy': createDiseaseEntry(
    'Healthy Grape Vine',
    'Vine appears healthy with no visible disease symptoms.',
    'Healthy',
    [
      'Continue regular maintenance',
      'Monitor for disease signs',
      'Maintain proper pruning'
    ],
    'كرمة عنب سليمة',
    'تبدو الكرمة بصحة جيدة بدون أعراض مرضية ظاهرة.',
    'سليم',
    [
      'استمر في الصيانة العادية',
      'راقب علامات المرض',
      'حافظ على التقليم المناسب'
    ]
  ),

  // Tomato Diseases
  'Tomato___Bacterial_spot': createDiseaseEntry(
    'Bacterial Spot',
    'Water-soaked lesions on leaves.',
    'Moderate to Severe',
    [
      'Apply copper-based sprays',
      'Remove infected leaves',
      'Avoid overhead watering',
      'Improve air circulation'
    ],
    'بقعة بكتيرية في الطماطم',
    'آفات مبللة بالماء على الأوراق.',
    'متوسط إلى شديد',
    [
      'استخدام رشاشات تحتوي على النحاس',
      'إزالة الأوراق المصابة',
      'تجنب الري من الأعلى',
      'تحسين دوران الهواء'
    ]
  ),
  'Tomato___Early_blight': createDiseaseEntry(
    'Early Blight',
    'Yellowing with brown spots on lower leaves.',
    'Moderate',
    [
      'Apply fungicides',
      'Remove infected foliage',
      'Mulch around plants',
      'Maintain plant spacing'
    ],
    'اللفحة المبكرة في الطماطم',
    'اصفرار مع بقع بنية على الأوراق السفلية.',
    'متوسط',
    [
      'استخدام مبيدات الفطريات',
      'إزالة الأوراق المصابة',
      'تغطية حول النباتات',
      'الحفاظ على مسافات النباتات'
    ]
  ),
  'Tomato___Late_blight': createDiseaseEntry(
    'Late Blight',
    'Large water-soaked lesions spreading rapidly.',
    'Severe',
    [
      'Remove infected plants immediately',
      'Apply preventive fungicides',
      'Improve air circulation',
      'Avoid overhead watering'
    ],
    ' اللفحة المتأخرة لنبات الطماطم',
    'آفات كبيرة مبللة بالماء تنتشر بسرعة.',
    'شديد',
    [
      'إزالة النباتات المصابة فورا',
      'استخدام مبيدات الفطريات الوقائية',
      'تحسين دوران الهواء',
      'تجنب الري من الأعلى'
    ]
  ),
  'Tomato___Leaf_Mold': createDiseaseEntry(
    'Leaf Mold',
    'Yellow patches turning into brown mold.',
    'Moderate',
    [
      'Improve ventilation',
      'Apply fungicides',
      'Reduce humidity',
      'Space plants properly'
    ],
    'عفن الأوراق في الطماطم',
    'بقع صفراء تتحول إلى عفن بني.',
    'متوسط',
    [
      'تحسين التهوية',
      'استخدام مبيدات الفطريات',
      'تقليل الرطوبة',
      'تباعد النباتات بشكل صحيح'
    ]
  ),
  'Tomato___Septoria_leaf_spot': createDiseaseEntry(
    'Septoria Leaf Spot',
    'Small brown spots with yellow halos.',
    'Moderate',
    [
      'Remove infected leaves',
      'Apply fungicides',
      'Mulch around plants',
      'Improve air circulation'
    ],
    'بقعة أوراق سبتوريا طماطم',
    'بقع بنية صغيرة مع هالات صفراء.',
    'متوسط',
    [
      'إزالة الأوراق المصابة',
      'استخدام مبيدات الفطريات',
      'تغطية حول النباتات',
      'تحسين دوران الهواء'
    ]
  ),
  'Tomato___Spider_mites Two-spotted_spider_mite': createDiseaseEntry(
    'Spider Mites',
    'Tiny yellow spots, webbing on leaves.',
    'Moderate',
    [
      'Spray plants with water',
      'Use insecticidal soap',
      'Increase humidity',
      'Introduce predatory mites'
    ],
    'العث العنكبوتي لنبات الطماطم',
    'بقع صفراء صغيرة، نسيج على الأوراق.',
    'متوسط',
    [
      'رش النباتات بالماء',
      'استخدام صابون مبيد للحشرات',
      'زيادة الرطوبة',
      'إدخال العث المفترس'
    ]
  ),
  'Tomato___Target_Spot': createDiseaseEntry(
    'Target Spot',
    'Circular spots with concentric rings.',
    'Moderate',
    [
      'Apply fungicides',
      'Remove infected leaves',
      'Improve air circulation',
      'Avoid overhead watering'
    ],
    ' تبقع الهدف في الطماطم',
    'مرض فطري يصيب أوراق الطماطم، يسبب ظهور بقع دائرية بنمط يشبه "عين الهدف" أو "عين الطير"، مما يؤدي إلى تساقط الأوراق وتقليل الإنتاجية. ',
    'متوسط',
    [
      'استخدام مبيدات الفطريات',
      'إزالة الأوراق المصابة',
      'تحسين دوران الهواء',
      'تجنب الري من الأعلى'
    ]
  ),
  'Tomato___Yellow_Leaf_Curl_Virus': createDiseaseEntry(
    'Tomato Yellow Leaf Curl Virus',
    'Leaves curl and turn yellow.',
    'Severe',
    [
      'Control whiteflies',
      'Use resistant varieties',
      'Remove infected plants',
      'Use reflective mulch'
    ],
    'فيروس تجعد الأوراق الصفراء في الطماطم',
    'تجعد الأوراق وتتحول إلى اللون الأصفر.',
    'شديد',
    [
      'السيطرة على الذباب الأبيض',
      'استخدام أصناف مقاومة',
      'إزالة النباتات المصابة',
      'استخدام تغطية عاكسة'
    ]
  ),
  'Tomato___Tomato_mosaic_virus': createDiseaseEntry(
    'Tomato Mosaic Virus',
    'Mottled, curled leaves.',
    'Severe',
    [
      'Remove infected plants',
      'Sanitize tools',
      'Control insects',
      'Use resistant varieties'
    ],
    'فيروس موزاييك الطماطم',
    'أوراق مرقطة ومجعدة.',
    'شديد',
    [
      'إزالة النباتات المصابة',
      'تعقيم الأدوات',
      'السيطرة على الحشرات',
      'استخدام أصناف مقاومة'
    ]
  ),
  'Tomato___healthy': createDiseaseEntry(
    'Healthy Tomato Plant',
    'Plant appears healthy with no visible disease symptoms.',
    'Healthy',
    [
      'Continue regular maintenance',
      'Monitor for disease signs',
      'Maintain proper spacing',
      'Water at base of plant'
    ],
    'نبات طماطم سليم',
    'يبدو النبات بصحة جيدة بدون أعراض مرضية ظاهرة.',
    'سليم',
    [
      'استمر في الصيانة العادية',
      'راقب علامات المرض',
      'حافظ على المسافات المناسبة',
      'الري عند قاعدة النبات'
    ]
  ),

  // Add missing diseases
  'Blueberry___healthy': createDiseaseEntry(
    'Healthy Blueberry Plant',
    'Plant appears healthy with no visible disease symptoms.',
    'Healthy',
    [
      'Continue regular maintenance',
      'Monitor for disease signs',
      'Maintain proper soil pH',
      'Ensure good drainage'
    ],
    'نبات توت أزرق سليم',
    'يبدو النبات بصحة جيدة بدون أعراض مرضية ظاهرة.',
    'سليم',
    [
      'استمر في الصيانة العادية',
      'راقب علامات المرض',
      'الحفاظ على درجة حموضة التربة المناسبة',
      'ضمان تصريف جيد'
    ]
  ),

  'Orange___Haunglongbing': createDiseaseEntry(
    'Citrus Greening (Haunglongbing)',
    'Causes yellow leaves and bitter fruit.',
    'Severe',
    [
      'Remove infected trees',
      'Control psyllid insects',
      'Use disease-free planting material',
      'Monitor surrounding trees'
    ],
    'التخضير الحمضي (هاونجلونجبينج)',
    'يسبب اصفرار الأوراق ومرارة الفاكهة.',
    'شديد',
    [
      'إزالة الأشجار المصابة',
      'السيطرة على حشرات البسيلا',
      'استخدام مواد زراعة خالية من الأمراض',
      'مراقبة الأشجار المحيطة'
    ]
  ),

  'Peach___Bacterial_spot': createDiseaseEntry(
    'Bacterial Spot',
    'Small, dark spots on leaves and fruit.',
    'Moderate to Severe',
    [
      'Use copper sprays',
      'Plant resistant varieties',
      'Improve air circulation',
      'Avoid overhead irrigation'
    ],
    'بقعة بكتيرية',
    'بقع صغيرة داكنة على الأوراق والفواكه.',
    'متوسط إلى شديد',
    [
      'استخدام رشاشات النحاس',
      'زراعة أصناف مقاومة',
      'تحسين دوران الهواء',
      'تجنب الري من الأعلى'
    ]
  ),

  'Peach___healthy': createDiseaseEntry(
    'Healthy Peach Tree',
    'Tree appears healthy with no visible disease symptoms.',
    'Healthy',
    [
      'Continue regular maintenance',
      'Monitor for disease signs',
      'Practice proper pruning',
      'Maintain fertilization schedule'
    ],
    'شجرة خوخ سليمة',
    'تبدو الشجرة بصحة جيدة بدون أعراض مرضية ظاهرة.',
    'سليم',
    [
      'استمر في الصيانة العادية',
      'راقب علامات المرض',
      'مارس التقليم المناسب',
      'الحفاظ على جدول التسميد'
    ]
  ),

  'Raspberry___healthy': createDiseaseEntry(
    'Healthy Raspberry Plant',
    'Plant appears healthy with no visible disease symptoms.',
    'Healthy',
    [
      'Continue regular maintenance',
      'Monitor for disease signs',
      'Maintain proper trellising',
      'Ensure good air circulation'
    ],
    'نبات توت العليق سليم',
    'يبدو النبات بصحة جيدة بدون أعراض مرضية ظاهرة.',
    'سليم',
    [
      'استمر في الصيانة العادية',
      'راقب علامات المرض',
      'الحفاظ على التعريش المناسب',
      'ضمان دوران هواء جيد'
    ]
  ),

  'Soybean___healthy': createDiseaseEntry(
    'Healthy Soybean Plant',
    'Plant appears healthy with no visible disease symptoms.',
    'Healthy',
    [
      'Continue regular maintenance',
      'Monitor for pest activity',
      'Maintain proper spacing',
      'Practice crop rotation'
    ],
    'نبات فول الصويا سليم',
    'يبدو النبات بصحة جيدة بدون أعراض مرضية ظاهرة.',
    'سليم',
    [
      'استمر في الصيانة العادية',
      'راقب نشاط الآفات',
      'الحفاظ على المسافات المناسبة',
      'ممارسة الدورة الزراعية'
    ]
  ),

  'Squash___Powdery_mildew': createDiseaseEntry(
    'Powdery Mildew',
    'White powdery spots on leaves.',
    'Moderate',
    [
      'Use sulfur or potassium bicarbonate sprays',
      'Improve air circulation',
      'Remove infected leaves',
      'Plant resistant varieties'
    ],
    'البياض الدقيقي',
    'بقع بيضاء مسحوقية على الأوراق.',
    'متوسط',
    [
      'استخدام رشاشات الكبريت أو بيكربونات البوتاسيوم',
      'تحسين دوران الهواء',
      'إزالة الأوراق المصابة',
      'زراعة أصناف مقاومة'
    ]
  ),

  'Strawberry___Leaf_scorch': createDiseaseEntry(
    'Leaf Scorch',
    'Red spots on leaves that dry up.',
    'Moderate',
    [
      'Remove infected leaves',
      'Apply fungicides',
      'Improve air circulation',
      'Avoid overhead watering'
    ],
    'حرق الأوراق',
    'بقع حمراء على الأوراق تجف.',
    'متوسط',
    [
      'إزالة الأوراق المصابة',
      'استخدام مبيدات الفطريات',
      'تحسين دوران الهواء',
      'تجنب الري من الأعلى'
    ]
  ),

  'Strawberry___healthy': createDiseaseEntry(
    'Healthy Strawberry Plant',
    'Plant appears healthy with no visible disease symptoms.',
    'Healthy',
    [
      'Continue regular maintenance',
      'Monitor for disease signs',
      'Maintain proper mulching',
      'Water at soil level'
    ],
    'نبات فراولة سليم',
    'يبدو النبات بصحة جيدة بدون أعراض مرضية ظاهرة.',
    'سليم',
    [
      'استمر في الصيانة العادية',
      'راقب علامات المرض',
      'الحفاظ على التغطية المناسبة',
      'الري عند مستوى التربة'
    ]
  ),

  // Add Potato Diseases
  'Potato___Early_blight': createDiseaseEntry(
    'Early Blight',
    'Dark brown spots with yellow rings on leaves.',
    'Moderate to Severe',
    [
      'Apply appropriate fungicides',
      'Remove infected leaves immediately',
      'Improve air circulation',
      'Practice crop rotation',
      'Monitor plants regularly'
    ],
    'اللفحة المبكرة للبطاطس',
    'بقع بنية داكنة مع حلقات صفراء على الأوراق.',
    'متوسط إلى شديد',
    [
      'استخدام مبيدات الفطريات المناسبة',
      'إزالة الأوراق المصابة فورا',
      'تحسين دوران الهواء',
      'ممارسة الدورة الزراعية',
      'مراقبة النباتات بانتظام'
    ]
  ),

  'Potato___Late_blight': createDiseaseEntry(
    'Late Blight',
    'Water-soaked lesions spreading rapidly.',
    'Severe',
    [
      'Remove infected plants immediately',
      'Apply protective fungicides',
      'Destroy all infected tubers',
      'Ensure good drainage',
      'Plant resistant varieties'
    ],
    'اللفحة المتأخرة للبطاطس',
    'آفات مبللة بالماء تنتشر بسرعة.',
    'شديد',
    [
      'إزالة النباتات المصابة فورا',
      'استخدام مبيدات الفطريات الوقائية',
      'تدمير جميع الدرنات المصابة',
      'ضمان تصريف جيد',
      'زراعة أصناف مقاومة'
    ]
  ),

  'Potato___healthy': createDiseaseEntry(
    'Healthy Potato Plant',
    'Plant appears healthy with no visible disease symptoms.',
    'Healthy',
    [
      'Continue regular maintenance',
      'Monitor for early signs of disease',
      'Maintain proper spacing',
      'Practice good crop rotation',
      'Keep soil well-drained'
    ],
    'نبات بطاطس سليم',
    'يبدو النبات بصحة جيدة بدون أعراض مرضية ظاهرة.',
    'سليم',
    [
      'استمر في الصيانة العادية',
      'راقب العلامات المبكرة للمرض',
      'حافظ على المسافات المناسبة',
      'ممارسة الدورة الزراعية الجيدة',
      'الحفاظ على تصريف جيد للتربة'
    ]
  )
};

// Add aliases for different naming patterns
Object.keys(diseaseData).forEach(key => {
  const alternativeKey = key.replace('___', '_');
  if (!diseaseData[alternativeKey]) {
    diseaseData[alternativeKey] = diseaseData[key];
  }
});

export const generalTips = {
  en: [
    'Remove infected plant parts immediately',
    'Practice crop rotation yearly',
    'Use disease-resistant varieties when possible',
    'Avoid overhead watering to prevent spread',
    'Maintain good air circulation between plants',
    'Sanitize gardening tools regularly',
    'Monitor plants regularly for early detection',
    'Keep garden clean of plant debris',
    'Test soil and maintain proper pH',
    'Use appropriate fertilization'
  ],
  ar: [
    'إزالة أجزاء النبات المصابة فورا',
    'ممارسة الدورة الزراعية سنوياً',
    'استخدام أصناف مقاومة للأمراض عند الإمكان',
    'تجنب الري من الأعلى لمنع انتشار المرض',
    'الحفاظ على دوران جيد للهواء بين النباتات',
    'تعقيم أدوات البستنة بانتظام',
    'مراقبة النباتات بانتظام للكشف المبكر',
    'الحفاظ على نظافة الحديقة من بقايا النباتات',
    'اختبار التربة والحفاظ على درجة الحموضة المناسبة',
    'استخدام التسميد المناسب'
  ]
};

// Add default severity levels for unknown diseases
export const defaultDisease = {
  en: createDiseaseEntry(
    'Unknown Condition',
    'Condition requires expert assessment.',
    'Unknown',
    [
      'Consult with an agricultural expert',
      'Monitor the affected areas',
      'Document symptoms and changes',
      ...generalTips.en
    ]
  ).en,
  ar: createDiseaseEntry(
    'حالة غير معروفة',
    'الحالة تتطلب تقييم خبير.',
    'غير معروف',
    [
      'استشر خبير زراعي',
      'راقب المناطق المتضررة',
      'وثق الأعراض والتغييرات',
      ...generalTips.ar
    ]
  ).ar
};

// Helper function to get translated condition name
export const getTranslatedConditionName = (predictionClass, language = 'en') => {
  if (!predictionClass) return language === 'ar' ? 'غير معروف' : 'Unknown';
  
  // Log for debugging
  console.log('getTranslatedConditionName called with:', { predictionClass, language });
  
  const diseaseInfo = getDiseaseInfo(predictionClass, language);
  
  // If we found disease info, return the translated name
  if (diseaseInfo.name && diseaseInfo.name !== 'Unknown Condition' && diseaseInfo.name !== 'حالة غير معروفة') {
    console.log('Found disease info:', diseaseInfo.name);
    return diseaseInfo.name;
  }
  
  // Fallback: format the prediction class with translated plant names
  const parts = predictionClass.split('___');
  console.log('Prediction parts:', parts);
  
  if (parts.length >= 2) {
    const plantType = parts[0];
    const condition = parts.slice(1).join(' ').replace(/_/g, ' ');
    
    console.log('Plant type:', plantType, 'Condition:', condition);
    
    // Plant name translations
    const plantTranslations = {
      'Apple': 'التفاح',
      'Cherry': 'الكرز', 
      'Corn': 'الذرة',
      'Grape': 'العنب',
      'Tomato': 'الطماطم',
      'Blueberry': 'التوت الأزرق',
      'Orange': 'البرتقال',
      'Peach': 'الخوخ',
      'Raspberry': 'توت العليق',
      'Soybean': 'فول الصويا',
      'Squash': 'القرع',
      'Strawberry': 'الفراولة',
      'Potato': 'البطاطس'
    };
    
    // Condition translations for common cases
    const conditionTranslations = {
      'healthy': 'سليم',
      'Black rot': 'العفن الأسود',
      'Apple scab': 'جرب التفاح',
      'Cedar apple rust': 'صدأ التفاح والأرز',
      'Powdery mildew': 'البياض الدقيقي',
      'Cercospora leaf spot': 'تبقع الأوراق سيركوسبورا',
      'Common rust': 'الصدأ الشائع',
      'Northern Leaf Blight': 'لفحة الأوراق الشمالية',
      'Esca (Black Measles)': 'إسكا (الحصبة السوداء)',
      'Leaf blight': 'لفحة الأوراق',
      'Bacterial spot': 'بقعة بكتيرية',
      'Early blight': 'اللفحة المبكرة',
      'Late blight': 'اللفحة المتأخرة',
      'Leaf Mold': 'عفن الأوراق',
      'Septoria leaf spot': 'بقعة أوراق سبتوريا',
      'Spider mites Two-spotted spider mite': 'العث العنكبوتي',
      'Target Spot': 'بقعة الهدف',
      'Yellow Leaf Curl Virus': 'فيروس تجعد الأوراق الصفراء',
      'Tomato mosaic virus': 'فيروس موزاييك الطماطم',
      'Haunglongbing': 'التخضير الحمضي',
      'Leaf scorch': 'حرق الأوراق'
    };
    
    if (language === 'ar') {
      const plantTypeAr = plantTranslations[plantType] || plantType;
      const conditionAr = conditionTranslations[condition] || condition;
      
      console.log('Arabic translation:', { plantTypeAr, conditionAr });
      
      // Special handling for healthy plants
      if (condition.toLowerCase() === 'healthy') {
        return `نبات ${plantTypeAr} سليم`;
      }
      
      return `${plantTypeAr} - ${conditionAr}`;
    } else {
      // Special handling for healthy plants in English
      if (condition.toLowerCase() === 'healthy') {
        return `Healthy ${plantType} Plant`;
      }
      
      return `${plantType} - ${condition}`;
    }
  }
  
  return predictionClass.replace(/_/g, ' ');
};

// Add function to find disease info by prediction and language
export const getDiseaseInfo = (prediction, language = 'en') => {
  // Ensure language is either 'en' or 'ar'
  const lang = language && language.toLowerCase() === 'ar' ? 'ar' : 'en';
  
  // Only log in development mode
  const isDevelopment = import.meta?.env?.MODE === 'development' || window.location.hostname === 'localhost';
  if (isDevelopment) {
    console.log(`Getting disease info for prediction: ${prediction} with language: ${lang}`);
  }
  
  // Clean up prediction string
  const cleanPrediction = prediction
    .replace(/[^a-zA-Z_]/g, '') // Remove special characters
    .replace(/__+/g, '_') // Replace multiple underscores with single
    .replace(/^_|_$/g, ''); // Remove leading/trailing underscores

  // Try different variations of the prediction string
  const variations = [
    prediction,
    cleanPrediction,
    `${cleanPrediction.split('_')[0]}___${cleanPrediction.split('_').slice(1).join('_')}`,
    cleanPrediction.replace(/_/g, '___'),
  ];

  // Try to find matching disease info
  for (const variant of variations) {
    if (diseaseData[variant]) {
      return diseaseData[variant][lang];
    }
  }
  // If no match found, return a formatted unknown disease
  const plantType = prediction.split(/[_]/)[0] || 'Unknown';
  const condition = prediction.split(/[_]/).slice(1).join(' ') || 'Condition';

  // Plant name translations
  const plantTranslations = {
    'Apple': 'التفاح',
    'Cherry': 'الكرز',
    'Corn': 'الذرة',
    'Grape': 'العنب',
    'Tomato': 'الطماطم',
    'Blueberry': 'التوت الأزرق',
    'Orange': 'البرتقال',
    'Peach': 'الخوخ',
    'Raspberry': 'توت العليق',
    'Soybean': 'فول الصويا',
    'Squash': 'القرع',
    'Strawberry': 'الفراولة',
    'Potato': 'البطاطس',
    'Unknown': 'غير معروف'
  };

  if (lang === 'ar') {
    const plantTypeAr = plantTranslations[plantType] || plantType;
    
    
    return {
      name: `${plantTypeAr}`,
      description: `تم اكتشاف    ${plantTypeAr}`,
      severity: 'يتطلب تقييم',
      treatment: [
       'استشر خبير زراعي للحصول على تشخيص دقيق',
        'راقب الأعراض وأي تغييرات',
        'التقط صورا واضحة للمناطق المتضررة',
        'راقب النبات عن كثب',
        'عزل النباتات المتضررة إذا أمكن',
        ...generalTips.ar
      ]
    };
  } else {
    return {
      name: `${plantType} - ${condition}`,
      description: `Unrecognized condition detected on ${plantType} plant`,
      severity: 'Requires Assessment',
      treatment: [
        'Consult with an agricultural expert for accurate diagnosis',
        'Document symptoms and any changes',
        'Take clear photos of affected areas',
        'Monitor the plant closely',
        'Isolate affected plants if possible',
        ...generalTips.en
      ]
    };
  }
};

