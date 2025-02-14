// Helper function to create disease entry
const createDiseaseEntry = (name, description, severity, treatment) => ({
  name,
  description,
  severity,
  treatment: Array.isArray(treatment) ? treatment : [treatment]
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

export const generalTips = [
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
];

// Add default severity levels for unknown diseases
export const defaultDisease = createDiseaseEntry(
  'Unknown Condition',
  'Condition requires expert assessment.',
  'Unknown',
  [
    'Consult with an agricultural expert',
    'Monitor the affected areas',
    'Document symptoms and changes',
    ...generalTips
  ]
);

// Add function to find disease info by prediction
export const getDiseaseInfo = (prediction) => {
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
      return diseaseData[variant];
    }
  }

  // If no match found, return a formatted unknown disease
  const plantType = prediction.split(/[_]/)[0] || 'Unknown';
  const condition = prediction.split(/[_]/).slice(1).join(' ') || 'Condition';

  return createDiseaseEntry(
    `${plantType} - ${condition}`,
    `Unrecognized condition detected on ${plantType} plant`,
    'Requires Assessment',
    [
      'Consult with an agricultural expert for accurate diagnosis',
      'Document symptoms and any changes',
      'Take clear photos of affected areas',
      'Monitor the plant closely',
      'Isolate affected plants if possible',
      ...generalTips
    ]
  );
};
