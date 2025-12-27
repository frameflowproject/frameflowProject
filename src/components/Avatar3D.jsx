import React, { useState, useEffect } from "react";

const Avatar3D = ({ style = "adventurer", seed, size = 100, className = "" }) => {
  const [avatarUrl, setAvatarUrl] = useState("");

  useEffect(() => {
    // Using DiceBear API for 3D-style avatars
    // You can also use ReadyPlayerMe or other 3D avatar services
    const generateAvatar = () => {
      // DiceBear 3D avatars with different styles
      const styles = [
        "adventurer",
        "adventurer-neutral",
        "avataaars",
        "big-ears",
        "big-ears-neutral",
        "big-smile",
        "bottts",
        "croodles",
        "croodles-neutral",
        "fun-emoji",
        "icons",
        "identicon",
        "lorelei",
        "lorelei-neutral",
        "micah",
        "miniavs",
        "notionists",
        "notionists-neutral",
        "open-peeps",
        "personas",
        "pixel-art",
        "pixel-art-neutral",
        "shapes",
        "thumbs",
      ];

      const selectedStyle = style || styles[Math.floor(Math.random() * styles.length)];
      const avatarSeed = seed || Math.random().toString(36).substring(7);
      
      // Using DiceBear API v7
      const url = `https://api.dicebear.com/7.x/${selectedStyle}/svg?seed=${avatarSeed}&size=${size}&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf`;
      
      setAvatarUrl(url);
    };

    generateAvatar();
  }, [style, seed, size]);

  return (
    <div
      className={`avatar-3d ${className}`}
      style={{
        width: `${size}px`,
        height: `${size}px`,
        borderRadius: "50%",
        overflow: "hidden",
        position: "relative",
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        boxShadow: "0 10px 30px rgba(0, 0, 0, 0.2)",
        ...{
          animation: "float 3s ease-in-out infinite",
        },
      }}
    >
      {avatarUrl && (
        <img
          src={avatarUrl}
          alt="3D Avatar"
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
          }}
        />
      )}
    </div>
  );
};

export default Avatar3D;
