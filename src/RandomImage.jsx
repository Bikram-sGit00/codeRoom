import { useMemo } from "react";
export default function getRandomImage() {
  const images = [
    "https://res.cloudinary.com/dzioaomzl/image/upload/v1755435527/WhatsApp_Image_2025-08-17_at_15.21.22_3e96c0ce_eu7p3y.jpg",
    "https://res.cloudinary.com/dzioaomzl/image/upload/v1755435526/WhatsApp_Image_2025-08-17_at_15.21.19_993a5bcd_zlzumh.jpg",
    "https://res.cloudinary.com/dzioaomzl/image/upload/v1755435526/WhatsApp_Image_2025-08-17_at_15.21.20_35615bd4_ucx9ww.jpg",
    "https://res.cloudinary.com/dzioaomzl/image/upload/v1755435526/WhatsApp_Image_2025-08-17_at_15.21.21_9159a746_nkw4sw.jpg",
    "https://res.cloudinary.com/dzioaomzl/image/upload/v1755435526/WhatsApp_Image_2025-08-17_at_15.21.21_546e12ea_rc9ilv.jpg",
    "https://res.cloudinary.com/dzioaomzl/image/upload/v1755435525/WhatsApp_Image_2025-08-17_at_15.22.02_9e864292_svddkb.jpg",
    "https://res.cloudinary.com/dzioaomzl/image/upload/v1755435525/WhatsApp_Image_2025-08-17_at_15.22.19_970e2be4_lrnllr.jpg",
    "https://res.cloudinary.com/dzioaomzl/image/upload/v1755435527/WhatsApp_Image_2025-08-17_at_15.21.22_3e96c0ce_eu7p3y.jpg",
  ];
  const randomIndex = Math.floor(Math.random() * images.length);

  return images[randomIndex];
}
