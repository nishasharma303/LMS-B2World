"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import useAuthStore from "../../store/authStore";
import {
  createInstituteUser,
  deleteInstituteUser,
  getInstituteUsers,
  toggleInstituteUserStatus,
  updateInstituteUser,
} from "../../services/userManagementService";
import { getMyInstitute } from "../../services/instituteService";
import { getCourses } from "../../services/courseService";

const emptyForm = {
  name: "",
  email: "",
  password: "",
  role: "TEACHER",
  courseIds: [],
};

function CourseSelector({
  courses,
  selectedCourseIds,
  onChange,
  primaryColor,
}) {
  const [query, setQuery] = useState("");

  const filteredCourses = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return courses;

    return courses.filter((course) => {
      const title = course.title?.toLowerCase() || "";
      const category = course.category?.toLowerCase() || "";
      return title.includes(q) || category.includes(q);
    });
  }, [courses, query]);

  const selectedCourses = useMemo(
    () => courses.filter((course) => selectedCourseIds.includes(course.id)),
    [courses, selectedCourseIds]
  );

  const toggleCourse = (courseId) => {
    if (selectedCourseIds.includes(courseId)) {
      onChange(selectedCourseIds.filter((id) => id !== courseId));
    } else {
      onChange([...selectedCourseIds, courseId]);
    }
  };

  return (
    <div>
      <label className="mb-1.5 block text-sm font-semibold text-slate-700">
        Assign Courses
      </label>

      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search existing courses..."
        className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-slate-400"
      />

      <div className="mt-3 max-h-64 overflow-y-auto rounded-2xl border border-slate-200 bg-white">
        {filteredCourses.length === 0 ? (
          <div className="px-4 py-4 text-sm text-slate-500">
            No matching courses found.
          </div>
        ) : (
          filteredCourses.map((course) => {
            const isSelected = selectedCourseIds.includes(course.id);

            return (
              <button
                type="button"
                key={course.id}
                onClick={() => toggleCourse(course.id)}
                className="flex w-full items-start justify-between gap-3 border-b border-slate-100 px-4 py-3 text-left last:border-b-0 hover:bg-slate-50"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-slate-800">
                    {course.title}
                  </p>
                  <p className="mt-0.5 text-xs text-slate-500">
                    {course.category || "Uncategorized"} • {course.status}
                  </p>
                </div>

                <span
                  className="rounded-full px-3 py-1 text-[11px] font-semibold"
                  style={
                    isSelected
                      ? {
                          backgroundColor: `${primaryColor}18`,
                          color: primaryColor,
                        }
                      : {
                          backgroundColor: "#f1f5f9",
                          color: "#475569",
                        }
                  }
                >
                  {isSelected ? "Selected" : "Select"}
                </span>
              </button>
            );
          })
        )}
      </div>

      {selectedCourses.length > 0 ? (
        <div className="mt-3 flex flex-wrap gap-2">
          {selectedCourses.map((course) => (
            <span
              key={course.id}
              className="inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold"
              style={{
                backgroundColor: `${primaryColor}12`,
                color: primaryColor,
              }}
            >
              {course.title}
              <button
                type="button"
                onClick={() =>
                  onChange(selectedCourseIds.filter((id) => id !== course.id))
                }
                className="text-[13px] leading-none"
              >
                ×
              </button>
            </span>
          ))}
        </div>
      ) : (
        <p className="mt-2 text-xs text-slate-500">
          No courses assigned yet.
        </p>
      )}
    </div>
  );
}

export default function InstituteUsersPage() {
  const router = useRouter();
  const { token, user, institute, setInstitute } = useAuthStore();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [teachers, setTeachers] = useState([]);
  const [students, setStudents] = useState([]);
  const [courses, setCourses] = useState([]);
  const [activeTab, setActiveTab] = useState("TEACHER");
  const [formData, setFormData] = useState(emptyForm);
  const [editingUser, setEditingUser] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const primaryColor = institute?.primaryColor || "#111827";
  const secondaryColor = institute?.secondaryColor || "#f59e0b";

  const accentStyle = useMemo(
    () => ({
      background: `linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%)`,
    }),
    [primaryColor, secondaryColor]
  );

  const softStyle = useMemo(
    () => ({
      backgroundColor: `${primaryColor}10`,
      borderColor: `${primaryColor}22`,
      color: primaryColor,
    }),
    [primaryColor]
  );

  const fetchAllData = async () => {
    const [teachersResponse, studentsResponse, coursesResponse] = await Promise.all([
      getInstituteUsers(token, "TEACHER"),
      getInstituteUsers(token, "STUDENT"),
      getCourses(token),
    ]);

    setTeachers(teachersResponse?.data || []);
    setStudents(studentsResponse?.data || []);
    setCourses(coursesResponse?.data || []);
  };

  useEffect(() => {
    const init = async () => {
      if (!token) {
        router.push("/login");
        return;
      }

      if (user?.role !== "INSTITUTE_ADMIN") {
        router.push("/login");
        return;
      }

      try {
        setLoading(true);

        const instituteResponse = await getMyInstitute(token);
        if (instituteResponse?.data) {
          setInstitute(instituteResponse.data);
        }

        await fetchAllData();
      } catch (err) {
        console.error(err);
        setError(err.message || "Failed to load users");
      } finally {
        setLoading(false);
      }
    };

    init();
  }, [token, user, router, setInstitute]);

  const resetMessages = () => {
    setError("");
    setSuccess("");
  };

  const handleChange = (e) => {
    resetMessages();
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleCourseChange = (courseIds) => {
    setFormData((prev) => ({
      ...prev,
      courseIds,
    }));
  };

  const openCreate = (role) => {
    resetMessages();
    setEditingUser(null);
    setActiveTab(role);
    setFormData({
      name: "",
      email: "",
      password: "",
      role,
      courseIds: [],
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const openEdit = (person) => {
    resetMessages();
    setEditingUser(person);
    setActiveTab(person.role);
    setFormData({
      name: person.name || "",
      email: person.email || "",
      password: "",
      role: person.role,
      courseIds:
        person.role === "TEACHER"
          ? (person.teachingCourses || []).map((course) => course.id)
          : [],
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const clearForm = () => {
    setEditingUser(null);
    setFormData({
      name: "",
      email: "",
      password: "",
      role: activeTab,
      courseIds: [],
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    resetMessages();

    try {
      setSaving(true);

      if (editingUser) {
        const payload = {
          name: formData.name,
          email: formData.email,
        };

        if (formData.password.trim()) {
          payload.password = formData.password;
        }

        if (formData.role === "TEACHER") {
          payload.courseIds = formData.courseIds;
        }

        await updateInstituteUser(token, editingUser.id, payload);
        setSuccess(`${formData.role === "TEACHER" ? "Teacher" : "Student"} updated successfully`);
      } else {
        const payload = {
          name: formData.name,
          email: formData.email,
          password: formData.password,
          role: formData.role,
        };

        if (formData.role === "TEACHER") {
          payload.courseIds = formData.courseIds;
        }

        await createInstituteUser(token, payload);
        setSuccess(`${formData.role === "TEACHER" ? "Teacher" : "Student"} created successfully`);
      }

      clearForm();
      await fetchAllData();
    } catch (err) {
      console.error(err);
      setError(err.message || "Action failed");
    } finally {
      setSaving(false);
    }
  };

  const handleToggleStatus = async (person) => {
    resetMessages();

    try {
      await toggleInstituteUserStatus(token, person.id);
      setSuccess(`${person.role === "TEACHER" ? "Teacher" : "Student"} status updated`);
      await fetchAllData();
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to update status");
    }
  };

  const handleDelete = async (person) => {
    const confirmed = window.confirm(`Delete ${person.name}?`);
    if (!confirmed) return;

    resetMessages();

    try {
      await deleteInstituteUser(token, person.id);
      setSuccess(`${person.role === "TEACHER" ? "Teacher" : "Student"} deleted successfully`);

      if (editingUser?.id === person.id) {
        clearForm();
      }

      await fetchAllData();
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to delete user");
    }
  };

  const currentList = activeTab === "TEACHER" ? teachers : students;

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f5f7fb] flex items-center justify-center px-6">
        <div className="rounded-2xl border border-slate-200 bg-white px-6 py-4 text-sm font-semibold text-slate-600 shadow-sm">
          Loading users...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f5f7fb] text-neutral-900">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <div className="rounded-[28px] p-1 shadow-[0_18px_60px_rgba(0,0,0,0.08)]" style={accentStyle}>
          <div className="rounded-[24px] bg-white/10 p-6 backdrop-blur sm:p-8">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-white/70">
                  Institute Admin
                </p>
                <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
                  Students & Teachers
                </h1>
                <p className="mt-2 text-sm text-white/85">
                  Manage faculty and learners for your institute with course-aware teacher assignment.
                </p>
              </div>

              <button
                onClick={() => router.push("/institute-admin")}
                className="rounded-2xl bg-white px-5 py-3 text-sm font-semibold text-neutral-900 shadow-sm"
              >
                Back to Dashboard
              </button>
            </div>
          </div>
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
          <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => openCreate("TEACHER")}
                className={`rounded-2xl px-4 py-2.5 text-sm font-semibold border ${activeTab === "TEACHER" ? "" : "bg-white text-slate-700 border-slate-200"}`}
                style={activeTab === "TEACHER" ? softStyle : {}}
              >
                Teachers
              </button>

              <button
                onClick={() => openCreate("STUDENT")}
                className={`rounded-2xl px-4 py-2.5 text-sm font-semibold border ${activeTab === "STUDENT" ? "" : "bg-white text-slate-700 border-slate-200"}`}
                style={activeTab === "STUDENT" ? softStyle : {}}
              >
                Students
              </button>
            </div>

            <div className="mt-6">
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-400">
                {editingUser ? "Edit User" : `Add ${activeTab === "TEACHER" ? "Teacher" : "Student"}`}
              </p>
              <h2 className="mt-2 text-2xl font-extrabold text-neutral-900">
                {editingUser
                  ? `Update ${editingUser.name}`
                  : activeTab === "TEACHER"
                  ? "Create Teacher Account"
                  : "Create Student Account"}
              </h2>
            </div>

            {error ? (
              <div className="mt-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            ) : null}

            {success ? (
              <div className="mt-5 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                {success}
              </div>
            ) : null}

            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              <div>
                <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                  Full Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-slate-400"
                  placeholder={`Enter ${activeTab === "TEACHER" ? "teacher" : "student"} name`}
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-slate-400"
                  placeholder="Enter email address"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                  Password {editingUser ? "(leave blank to keep unchanged)" : ""}
                </label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required={!editingUser}
                  className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-slate-400"
                  placeholder={editingUser ? "Optional new password" : "Enter password"}
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                  Role
                </label>
                <input
                  type="text"
                  value={formData.role}
                  readOnly
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-600"
                />
              </div>

              {activeTab === "TEACHER" ? (
                <CourseSelector
                  courses={courses}
                  selectedCourseIds={formData.courseIds}
                  onChange={handleCourseChange}
                  primaryColor={primaryColor}
                />
              ) : null}

              <div className="flex flex-wrap gap-3 pt-2">
                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-2xl px-5 py-3 text-sm font-semibold text-white shadow-sm disabled:opacity-70"
                  style={{ backgroundColor: primaryColor }}
                >
                  {saving
                    ? "Saving..."
                    : editingUser
                    ? "Update User"
                    : `Create ${activeTab === "TEACHER" ? "Teacher" : "Student"}`}
                </button>

                {editingUser ? (
                  <button
                    type="button"
                    onClick={() => {
                      clearForm();
                      resetMessages();
                    }}
                    className="rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700"
                  >
                    Cancel Edit
                  </button>
                ) : null}
              </div>
            </form>
          </section>

          <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-400">
                  Directory
                </p>
                <h2 className="mt-2 text-2xl font-extrabold text-neutral-900">
                  {activeTab === "TEACHER" ? "Teachers" : "Students"}
                </h2>
              </div>

              <div
                className="rounded-full border px-3 py-1.5 text-xs font-semibold"
                style={softStyle}
              >
                {currentList.length} total
              </div>
            </div>

            <div className="mt-6 space-y-4">
              {currentList.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-5 py-10 text-center text-sm text-slate-500">
                  No {activeTab === "TEACHER" ? "teachers" : "students"} found yet.
                </div>
              ) : (
                currentList.map((person) => (
                  <div
                    key={person.id}
                    className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm"
                  >
                    <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="truncate text-lg font-bold text-neutral-900">
                            {person.name}
                          </h3>
                          <span
                            className="rounded-full border px-2.5 py-1 text-[11px] font-semibold"
                            style={{
                              backgroundColor: person.isActive ? "#ecfdf5" : "#fef2f2",
                              borderColor: person.isActive ? "#a7f3d0" : "#fecaca",
                              color: person.isActive ? "#047857" : "#b91c1c",
                            }}
                          >
                            {person.isActive ? "Active" : "Inactive"}
                          </span>
                        </div>

                        <p className="mt-1 text-sm text-slate-600">{person.email}</p>

                        {person.role === "TEACHER" ? (
                          <div className="mt-3">
                            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-400">
                              Assigned Courses
                            </p>

                            {person.teachingCourses?.length > 0 ? (
                              <div className="mt-2 flex flex-wrap gap-2">
                                {person.teachingCourses.map((course) => (
                                  <span
                                    key={course.id}
                                    className="inline-flex items-center rounded-full px-3 py-1.5 text-xs font-semibold"
                                    style={{
                                      backgroundColor: `${primaryColor}12`,
                                      color: primaryColor,
                                    }}
                                  >
                                    {course.title}
                                  </span>
                                ))}
                              </div>
                            ) : (
                              <p className="mt-2 text-sm text-slate-500">
                                No courses assigned yet.
                              </p>
                            )}
                          </div>
                        ) : null}

                        <p className="mt-3 text-xs text-slate-400">
                          Created: {new Date(person.createdAt).toLocaleString()}
                        </p>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        <button
                          onClick={() => openEdit(person)}
                          className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700"
                        >
                          Edit
                        </button>

                        <button
                          onClick={() => handleToggleStatus(person)}
                          className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700"
                        >
                          {person.isActive ? "Deactivate" : "Activate"}
                        </button>

                        <button
                          onClick={() => handleDelete(person)}
                          className="rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-sm font-semibold text-red-700"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}