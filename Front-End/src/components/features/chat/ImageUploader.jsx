
import PropTypes from 'prop-types';

const ImageUploader = ({ selectedImage, setSelectedImage, fileInputRef, isUploading }) => {
  return (
    <>
      {selectedImage && (
        <div className="flex items-center gap-2 p-2 bg-green-50 rounded-lg border border-green-200">
          <div className="relative">
            <img 
              src={URL.createObjectURL(selectedImage)} 
              alt="Selected" 
              className="h-16 w-16 object-cover rounded-md" 
            />
            <button 
              type="button" 
              onClick={() => setSelectedImage(null)}
              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 w-5 h-5 flex items-center justify-center text-xs"
            >
              ×
            </button>
          </div>
          <span className="text-sm text-gray-700">
            {selectedImage.name.length > 25 
              ? selectedImage.name.substring(0, 22) + '...' 
              : selectedImage.name}
          </span>
        </div>
      )}
      
      <button 
        type="button"
        onClick={() => fileInputRef.current?.click()}
        className="bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white p-3 rounded-xl text-sm md:text-base transition-all duration-300 font-semibold shadow-md hover:shadow-lg transform hover:scale-[1.02]" 
        title="إرسال صورة"
        disabled={isUploading}
      >
        {isUploading ? (
          <div className="w-5 h-5 border-t-2 border-white border-solid rounded-full animate-spin"></div>
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
            <circle cx="8.5" cy="8.5" r="1.5"></circle>
            <polyline points="21 15 16 10 5 21"></polyline>
          </svg>
        )}
        <input 
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/jpg,image/png" 
          onChange={(e) => {
            const file = e.target.files[0];
            if (!file) return;
            
            // Validate file type
            const validTypes = ['image/jpeg', 'image/jpg', 'image/png'];
            if (!validTypes.includes(file.type)) {
              alert('يرجى اختيار صورة بصيغة JPG أو PNG فقط');
              return;
            }
            
            // Validate file size (5MB max)
            if (file.size > 5 * 1024 * 1024) {
              alert('حجم الصورة كبير جدًا. الحد الأقصى هو 5 ميجابايت');
              return;
            }
            
            setSelectedImage(file);
          }}
          className="hidden" 
        />
      </button>
    </>
  );
};

ImageUploader.propTypes = {
  selectedImage: PropTypes.object,
  setSelectedImage: PropTypes.func.isRequired,
  fileInputRef: PropTypes.object.isRequired,
  isUploading: PropTypes.bool
};

export default ImageUploader;
