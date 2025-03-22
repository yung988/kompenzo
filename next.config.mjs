/** @type {import('next').NextConfig} */
const nextConfig = {
  // Vypnout statickou optimalizaci stránek a místo toho
  // vygenerovat stránky na straně klienta
  output: 'export',
  images: {
    unoptimized: true,
  }
};

export default nextConfig;
