import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

/**
 * صفحة تتيح للمستخدمين الإبلاغ عن الأخطاء أو المشاكل
 */
const ErrorReportPage = () => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    page: '',
    description: '',
    screenshot: null,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState('');

  // معالجة تغييرات الحقول
  const handleChange = (e) => {
    const { name, value, files } = e.target;
    
    if (name === 'screenshot' && files && files[0]) {
      // التعامل مع ملفات الصور
      setFormData(prev => ({
        ...prev,
        screenshot: files[0]
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  // تقديم النموذج
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');
    
    try {
      // إنشاء FormData لإرسال الملفات
      const reportData = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        if (value !== null) {
          reportData.append(key, value);
        }
      });
      
      // إضافة معلومات إضافية عن المتصفح والنظام
      reportData.append('userAgent', navigator.userAgent);
      reportData.append('timestamp', new Date().toISOString());
      
      // في بيئة الإنتاج الفعلية، سيتم إرسال البيانات إلى الخادم
      // على سبيل المثال:
      // await axios.post(`${API_URL}/report-error`, reportData);
      
      // محاكاة التأخير للاختبار
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setIsSubmitted(true);
    } catch (err) {
      setError(t('common.error_submitting_form'));
      console.error('Error submitting report:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // عرض رسالة نجاح بعد التقديم
  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-green-50 flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-lg bg-white rounded-lg shadow-md p-8">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 mb-4">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">{t('error_report.thank_you')}</h2>
            <p className="text-gray-600 mb-6">{t('error_report.submission_received')}</p>
            <Link to="/" className="inline-block px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
              {t('common.back_to_home')}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // نموذج الإبلاغ عن الخطأ
  return (
    <div className="min-h-screen bg-green-50 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-lg bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-6 text-center">{t('error_report.report_issue')}</h1>
        
        {error && (
          <div className="bg-red-50 text-red-700 p-3 rounded-lg mb-4">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              {t('error_report.your_name')}
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
              required
            />
          </div>
          
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              {t('error_report.your_email')}
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
              required
            />
          </div>
          
          <div>
            <label htmlFor="page" className="block text-sm font-medium text-gray-700 mb-1">
              {t('error_report.page_with_issue')}
            </label>
            <input
              type="text"
              id="page"
              name="page"
              value={formData.page}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
              placeholder={t('error_report.example_page')}
              required
            />
          </div>
          
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
              {t('error_report.issue_description')}
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows="4"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
              required
            ></textarea>
          </div>
          
          <div>
            <label htmlFor="screenshot" className="block text-sm font-medium text-gray-700 mb-1">
              {t('error_report.screenshot')} ({t('error_report.optional')})
            </label>
            <input
              type="file"
              id="screenshot"
              name="screenshot"
              accept="image/*"
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
            />
            <p className="text-xs text-gray-500 mt-1">{t('error_report.image_help')}</p>
          </div>
          
          <div className="flex items-center justify-between pt-4">
            <Link to="/" className="text-green-600 hover:text-green-700">
              {t('common.cancel')}
            </Link>
            <button
              type="submit"
              disabled={isSubmitting}
              className={`px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors ${isSubmitting ? 'opacity-70 cursor-not-allowed' : ''}`}
            >
              {isSubmitting ? t('common.submitting') : t('common.submit')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ErrorReportPage;
