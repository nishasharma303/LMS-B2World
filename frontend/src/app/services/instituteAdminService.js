import api from "@/app/lib/api";

const instituteAdminService = {
  getCertificates: async (params = {}) => {
    const { data } = await api.get("/institutes/admin/certificates", { params });
    return data;
  },

  getReportsOverview: async () => {
    const { data } = await api.get("/institutes/admin/reports/overview");
    return data;
  },
  getCertificates: async (params = {}) => {
  const { data } = await api.get("/certificates/institute/all", { params });
  return data;
},
};



export default instituteAdminService;