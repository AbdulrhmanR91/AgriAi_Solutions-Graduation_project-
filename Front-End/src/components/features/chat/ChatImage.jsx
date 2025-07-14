
import PropTypes from 'prop-types';
import { useState } from 'react';
import { createPortal } from 'react-dom';

const ChatImage = ({ imageUrl, getImageUrl, message }) => {
  const [showModal, setShowModal] = useState(false);
  
  // Debug: Log when component renders
  console.log('🖼️ ChatImage Component Rendered:', {
    imageUrl,
    messageContent: message?.content,
    messageType: message?.messageType,
    hasGetImageUrl: typeof getImageUrl === 'function'
  });
  
  // Fallback: if imageUrl is null but we have a recent message, try to construct URL from timestamp
  const getFallbackImageUrl = () => {
    if (imageUrl) {
      console.log('✅ Using provided imageUrl:', imageUrl);
      return getImageUrl(imageUrl);
    }
    
    // If no imageUrl but message type is image, this might be a backend issue
    console.warn('❌ ChatImage: imageUrl is null for image message:', message);
    return null;
  };
  const finalImageUrl = getFallbackImageUrl();
  
  console.log('🔍 ChatImage Debug:', {
    finalImageUrl,
    showModal,
    hasImageUrl: !!imageUrl,
    messageType: message?.messageType
  });
  
  if (!finalImageUrl) {
    console.warn('⚠️ No image URL found, showing placeholder');
    // Show a placeholder for broken image messages
    return (
      <div className="mb-2 image-message">
        <div className="max-w-full rounded-lg max-h-[300px] bg-gray-100 border border-gray-300 p-4 text-center text-gray-500">
          <p>🖼️ صورة غير متاحة</p>
          <p className="text-xs">خطأ في تحميل الصورة</p>
        </div>
      </div>
    );
  }

  // Extract text content that isn't just "صورة"
  const imageCaption = message?.content && message.content !== 'صورة' ? message.content.trim() : null;

  return (
    <>      <div className="mb-2 image-message" style={{ pointerEvents: 'auto' }}>
        {/* Show caption/description above the image if it exists */}
        {imageCaption && (
          <div className="mb-2 text-sm text-gray-700 bg-gray-50 rounded-lg p-2 border-l-4 border-blue-400">
            {imageCaption}
          </div>
        )}
          <div className="relative group" style={{ pointerEvents: 'auto' }}><img 
            src={finalImageUrl} 
            alt={imageCaption || "صورة"} 
            className="max-w-full rounded-lg max-h-[300px] shadow-md hover:shadow-lg transition-shadow duration-200 cursor-pointer pointer-events-auto"
            loading="lazy"            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              console.log('🎯 Image clicked! Opening modal...');
              setShowModal(true);
            }}
            onMouseDown={() => {
              console.log('🖱️ Mouse down on image');
            }}
            onMouseUp={() => {
              console.log('🖱️ Mouse up on image');
            }}
            onError={(e) => {
              console.error('❌ Chat image failed to load:', {
                src: e.target.src,
                originalUrl: imageUrl,
                error: e
              });
              // Replace with placeholder on error
              e.target.style.display = 'none';
              e.target.parentElement.innerHTML = `
                <div class="max-w-full rounded-lg max-h-[300px] bg-gray-100 border border-gray-300 p-4 text-center text-gray-500">
                  <p>🖼️ صورة غير متاحة</p>
                  <p class="text-xs">فشل في تحميل الصورة</p>
                </div>
              `;
            }}
            onLoad={() => {
              console.log('✅ Chat image loaded successfully:', finalImageUrl);
            }}
          />
            {/* Hover overlay - FIXED: Added pointer-events-none to prevent blocking clicks */}
          <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-10 transition-all duration-200 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 pointer-events-none">
            <div className="text-white bg-black bg-opacity-50 rounded-full p-2 text-sm pointer-events-none">
              👁️ اضغط للعرض الكامل
            </div>
          </div>
        </div>        {/* Show image name/filename if available */}
        {message?.imageName && (
          <div className="mt-1 text-xs text-gray-500 italic">
            📎 {message.imageName}
          </div>
        )}
      </div>      {/* Modal for full image view */}
      {showModal && createPortal(
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black bg-opacity-75 z-[9998] cursor-pointer"
            onClick={() => {
              setShowModal(false);
            }}
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              width: '100vw',
              height: '100vh',
              zIndex: 9998
            }}
          />
          
          {/* Modal content */}
          <div 
            className="fixed inset-0 flex items-center justify-center z-[9999] p-4 pointer-events-none"
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              width: '100vw',
              height: '100vh',
              zIndex: 9999
            }}
          >
            <div className="relative max-w-4xl max-h-full pointer-events-auto">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowModal(false);
                }}
                className="absolute top-4 right-4 text-white bg-red-600 hover:bg-red-700 rounded-full w-10 h-10 flex items-center justify-center transition-all z-10 text-xl font-bold shadow-lg"
              >
                ✕
              </button>
              <img
                src={finalImageUrl}
                alt={imageCaption || "صورة"}
                className="max-w-full max-h-full rounded-lg shadow-2xl"
                onClick={(e) => {
                  e.stopPropagation();
                }}
                onLoad={() => console.log('Modal image loaded successfully')}
                onError={() => console.error('Modal image failed to load')}
              />
            </div>
          </div>
        </>,
        document.body
      )}
    </>
  );
};

ChatImage.propTypes = {
  imageUrl: PropTypes.string,
  getImageUrl: PropTypes.func.isRequired,
  message: PropTypes.object
};

export default ChatImage;
