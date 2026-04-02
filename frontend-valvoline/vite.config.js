import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    minify: "terser",
    terserOptions: {
      compress: {
        drop_console: true, // 👈 هذي تفسخ كل console.log أوتوماتيكياً
        drop_debugger: true,
      },
    },
  },
});
