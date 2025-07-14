class EmbeddedService {
  constructor() {
    this.socket = null;
    this.isConnected = false; 
    this.isStreaming = false;
    this.liveImageCallback = null;
    this.mockInterval = null;
    this.captureCallback = null;
  }

  startStreaming(callback) {
    if (this.socket && this.isConnected) {
      this.liveImageCallback = callback;
      return; 
    }

    try {
      this.socket = new WebSocket('ws://192.168.93.58:81'); // Replace with your ESP32CAM IP address
      this.socket.binaryType = 'blob'; // Set binary type to blob for image data
      
      this.socket.onopen = () => {
        console.log('WebSocket connected to ESP32CAM');
        this.isConnected = true;
        this.isStreaming = true;
        this.socket.send("START_MONITORING");
      };
      
      this.socket.onmessage = (event) => {
        if (event.data instanceof Blob) {
          const reader = new FileReader();
          reader.onload = () => {
            const base64 = reader.result.split(',')[1];
            if (this.liveImageCallback) {
              this.liveImageCallback(base64);
            }
          };
          reader.readAsDataURL(event.data);
        }
      };
      
      this.socket.onclose = () => {
        console.log('WebSocket disconnected from ESP32CAM');
        this.isConnected = false;
        this.isStreaming = false;
      };
      
      this.socket.onerror = (error) => {
        console.error('WebSocket error:', error);
        this.useMockData(callback);
      };
      
      this.liveImageCallback = callback;
    } catch (error) {
      console.error('Failed to connect to ESP32CAM:', error);
      this.useMockData(callback);
    }
  }
    // Use demo images for development/testing
  useMockData(callback) {
    // تسجيل فقط في وضع التطوير
    const isDevelopment = import.meta?.env?.MODE === 'development' || window.location.hostname === 'localhost';
    if (isDevelopment) {
      console.log('Using mock data for ESP32CAM demo');
    }
    
    // Fallback demo image as base64 string
    const fallbackImage = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIwIiBoZWlnaHQ9IjI0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZGRkIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtc2l6ZT0iMTgiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5QbGFudCBJbWFnZTwvdGV4dD48L3N2Zz4=';
    
    // Base64 encoded demo plant image - صورة نبات أكثر واقعية للاختبار
    const demoImages = [
      // Fallback to a simple generated image if assets are not available
      fallbackImage,
      fallbackImage,
      fallbackImage
    ];
    
    // نبدأ بتحميل الصور المحلية كبديل للصور المضمنة بالـ Base64
    let currentImageIndex = 0;
    let imageCache = [];
    
    // Try to load local images, fallback to base64 if failed
    const imagePromises = [
      '/src/assets/images/demo-plant-1.jpg',
      '/src/assets/images/demo-plant-2.jpg', 
      '/src/assets/images/demo-plant-3.jpg'
    ].map(path => 
      fetch(path)
        .then(response => {
          if (!response.ok) throw new Error('Image not found');
          return response.blob();
        })
        .then(blob => {
          return new Promise(resolve => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result.split(',')[1]);
            reader.readAsDataURL(blob);
          });
        })
        .catch(() => {
          // إذا فشل تحميل الصورة، نستخدم صورة احتياطية بسيطة
          return fallbackImage.split(',')[1];
        })
    );
    
    // تحميل الصور المحلية أولاً إلى كاش
    Promise.all(imagePromises).then(images => {
      imageCache = images.filter(Boolean);
      
      if (imageCache.length === 0) {
        imageCache = [fallbackImage.split(',')[1]];
      }
      
      // محاكاة بث الفيديو مع 3 إطارات في الثانية
      this.mockInterval = setInterval(() => {
        if (callback && imageCache.length > 0) {
          // تبادل الصور لمحاكاة فيديو حي
          currentImageIndex = (currentImageIndex + 1) % imageCache.length;
          callback(imageCache[currentImageIndex]);
        }
      }, 333); // ~3 FPS
    });
  }

  // Stop streaming
  stopStreaming() {
    if (this.socket && this.isConnected) {
      this.socket.close();
    }
    
    if (this.mockInterval) {
      clearInterval(this.mockInterval);
      this.mockInterval = null;
    }
    
    this.isStreaming = false;
  }

  // Capture a single image and return it via callback
  captureImage(callback) {
    return new Promise((resolve, reject) => {
      try {
        // If we already have a live stream, use the latest frame
        if (this.isStreaming && this.liveImageCallback) {
          // Store the callback for later
          this.captureCallback = callback;
          
          // For demo/development, use mock data if no real connection
          if (!this.isConnected) {
            const demoImageBase64 = 'iVBORw0KGgoAAAANSUhEUgAAAGQAAABkCAYAAABw4pVUAAAApElEQVR42u3RAQ0AAAjDMO5fNCCDkC5z0HTVrisFCBABASIgQAQEiIAAAQJEQIAICBABASIgQIAAERAgAgJEQIAICBAgQAQEiIAAERAgAgIECBABASIgQAQEiIAAASIgQAQEiIAAERAgQIAICBABASIgQAQECBABASIgQAQEiIAAESAgQAQEiIAAERAgAgIECBABASIgQAQEiIAAAdIuqrA59ae16w5UWnrFYAAAAABJRU5ErkJggg==';
            callback(demoImageBase64);
            resolve();
          } else if (this.socket) {
            // Request a high-quality capture from the ESP32
            this.socket.send("CAPTURE");
            // The response will come back via the onmessage handler
            // We'll temporarily override it to catch this specific frame
            const originalOnMessage = this.socket.onmessage;
            this.socket.onmessage = (event) => {
              if (event.data instanceof Blob) {
                const reader = new FileReader();
                reader.onload = () => {
                  const base64 = reader.result.split(',')[1];
                  callback(base64);
                  // Restore the original handler
                  this.socket.onmessage = originalOnMessage;
                  resolve();
                };
                reader.readAsDataURL(event.data);
              }
            };
            // Set a timeout in case the capture doesn't return
            setTimeout(() => {
              if (this.captureCallback === callback) {
                // Use the mock data as fallback
                const demoImageBase64 = 'iVBORw0KGgoAAAANSUhEUgAAAGQAAABkCAYAAABw4pVUAAAApElEQVR42u3RAQ0AAAjDMO5fNCCDkC5z0HTVrisFCBABASIgQAQEiIAAAQJEQIAICBABASIgQIAAERAgAgJEQIAICBAgQAQEiIAAERAgAgIECBABASIgQAQEiIAAASIgQAQEiIAAERAgQIAICBABASIgQAQECBABASIgQAQEiIAAESAgQAQEiIAAERAgAgIECBABASIgQAQEiIAAAdIuqrA59ae16w5UWnrFYAAAAABJRU5ErkJggg==';
                callback(demoImageBase64);
                // Restore the original handler
                this.socket.onmessage = originalOnMessage;
                resolve();
              }
            }, 3000);
          }
        } else {
          // No active stream, use mock data
          const demoImageBase64 = 'iVBORw0KGgoAAAANSUhEUgAAAGQAAABkCAYAAABw4pVUAAAApElEQVR42u3RAQ0AAAjDMO5fNCCDkC5z0HTVrisFCBABASIgQAQEiIAAAQJEQIAICBABASIgQIAAERAgAgJEQIAICBAgQAQEiIAAERAgAgIECBABASIgQAQEiIAAASIgQAQEiIAAERAgQIAICBABASIgQAQECBABASIgQAQEiIAAESAgQAQEiIAAERAgAgIECBABASIgQAQEiIAAAdIuqrA59ae16w5UWnrFYAAAAABJRU5ErkJggg==';
          callback(demoImageBase64);
          resolve();
        }
      } catch (error) {
        console.error('Error capturing image:', error);
        reject(error);
      }
    });
  }

  // Set callback for receiving live images
  setLiveImageCallback(callback) {
    this.liveImageCallback = callback;
  }

  // Clean up resources
  cleanup() {
    this.stopStreaming();
    this.liveImageCallback = null;
    this.captureCallback = null;
  }
}

export default new EmbeddedService();
