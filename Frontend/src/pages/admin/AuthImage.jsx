import { useState, useEffect } from 'react';


const AuthImage = ({ src, alt, className, fallbackLetter }) => {
  const [imageSrc, setImageSrc] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let objectUrl;

    const fetchImage = async () => {
      const token = localStorage.getItem("accessToken");
      
      if (!token) {
        setError(true);
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(src, {
          headers: { 
            Authorization: `Bearer ${token}` 
          }
        });
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }
        
        const blob = await response.blob();
        objectUrl = URL.createObjectURL(blob);
        setImageSrc(objectUrl);
        setLoading(false);
      } catch (err) {
        console.error('Failed to load image:', src, err);
        setError(true);
        setLoading(false);
      }
    };

    fetchImage();


    return () => {
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [src]);

  if (loading) {
    return (
      <div className={`${className} flex items-center justify-center bg-gray-950`}>
        <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error || !imageSrc) {
    return (
      <div className={`${className} flex items-center justify-center text-gray-800 font-black text-5xl bg-gray-950`}>
        {fallbackLetter || "?"}
      </div>
    );
  }

  return <img src={imageSrc} alt={alt} className={className} />;
};

export default AuthImage;