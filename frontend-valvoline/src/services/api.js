import axios from "axios";

const apiClient = axios.create({
  baseURL: "http://localhost:5000/api",
  headers: { "Content-Type": "application/json" },
});

export const spinService = {
  // 1. هذي تعيطلها App.jsx باش تسجل الكليون قبل ما يدور العجلة
  handleSpin: async (formData) => {
    const response = await apiClient.post("/spin", formData);
    return response.data;
  },

  // 2. هذي تعيطلها LuckyWheel.jsx وقت تاقف العجلة باش تقيد الكادو وتنقص الستوك
  submitSpin: async (payload) => {
    // 🚨 التغيير هنا: لازمها تكون PUT كيما في الباكاند، والـ route هو /update-prize
    const response = await apiClient.put("/update-prize", payload);
    return response.data;
  },
};
