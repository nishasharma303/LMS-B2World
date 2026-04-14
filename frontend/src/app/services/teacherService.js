import api from "@/app/lib/api";

const teacherService = {
  getDashboard: async () => {
    const { data } = await api.get("/teacher/dashboard");
    return data;
  },

  getCourses: async () => {
    const { data } = await api.get("/teacher/courses");
    return data;
  },

  getCourseById: async (courseId) => {
    const { data } = await api.get(`/teacher/courses/${courseId}`);
    return data;
  },

  createModule: async (courseId, payload) => {
    const { data } = await api.post(`/teacher/courses/${courseId}/modules`, payload);
    return data;
  },

  updateModule: async (moduleId, payload) => {
    const { data } = await api.put(`/teacher/modules/${moduleId}`, payload);
    return data;
  },

  deleteModule: async (moduleId) => {
    const { data } = await api.delete(`/teacher/modules/${moduleId}`);
    return data;
  },

  createLesson: async (moduleId, payload) => {
    const { data } = await api.post(`/teacher/modules/${moduleId}/lessons`, payload);
    return data;
  },

  updateLesson: async (lessonId, payload) => {
    const { data } = await api.put(`/teacher/lessons/${lessonId}`, payload);
    return data;
  },

  deleteLesson: async (lessonId) => {
    const { data } = await api.delete(`/teacher/lessons/${lessonId}`);
    return data;
  },

  uploadPdf: async (file) => {
    const formData = new FormData();
    formData.append("file", file);

    const { data } = await api.post("/teacher/upload/pdf", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    return data;
  },

  // ← NEW: mirrors uploadPdf exactly, just hits the video endpoint
  uploadVideo: async (file, onUploadProgress) => {
    const formData = new FormData();
    formData.append("file", file);

    const { data } = await api.post("/teacher/upload/video", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
      // optional: pass a progress callback so the UI can show % uploaded
      onUploadProgress,
    });

    return data;
  },

  getCourseStudentsProgress: async (courseId) => {
    const { data } = await api.get(`/teacher/courses/${courseId}/students`);
    return data;
  },
};

export default teacherService;