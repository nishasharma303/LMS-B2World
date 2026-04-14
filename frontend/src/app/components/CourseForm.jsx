"use client";

import { useState } from "react";

const initialState = {
  title: "",
  description: "",
  thumbnail: "",
  category: "",
  status: "DRAFT",
};

export default function CourseForm({
  onSubmit,
  loading = false,
  primaryColor = "#111827",
}) {
  const [formData, setFormData] = useState(initialState);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await onSubmit(formData);
    setFormData(initialState);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-[28px] border border-stone-200 bg-white/90 p-5 shadow-sm backdrop-blur sm:p-6"
    >
      <div className="mb-6">
        <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-stone-400">
          Create Course
        </p>
        <h3 className="mt-2 text-2xl font-black tracking-tight text-neutral-900">
          Add a new course
        </h3>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="md:col-span-2">
          <label className="mb-2 block text-sm font-semibold text-neutral-700">
            Course Title
          </label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            required
            placeholder="Enter course title"
            className="w-full rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm outline-none transition focus:border-stone-400 focus:bg-white"
          />
        </div>

        <div className="md:col-span-2">
          <label className="mb-2 block text-sm font-semibold text-neutral-700">
            Description
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows={4}
            placeholder="Write a short description"
            className="w-full rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm outline-none transition focus:border-stone-400 focus:bg-white"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-semibold text-neutral-700">
            Category
          </label>
          <input
            type="text"
            name="category"
            value={formData.category}
            onChange={handleChange}
            placeholder="e.g. Web Development"
            className="w-full rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm outline-none transition focus:border-stone-400 focus:bg-white"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-semibold text-neutral-700">
            Status
          </label>
          <select
            name="status"
            value={formData.status}
            onChange={handleChange}
            className="w-full rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm outline-none transition focus:border-stone-400 focus:bg-white"
          >
            <option value="DRAFT">DRAFT</option>
            <option value="PUBLISHED">PUBLISHED</option>
            <option value="ARCHIVED">ARCHIVED</option>
          </select>
        </div>

        <div className="md:col-span-2">
          <label className="mb-2 block text-sm font-semibold text-neutral-700">
            Thumbnail URL
          </label>
          <input
            type="text"
            name="thumbnail"
            value={formData.thumbnail}
            onChange={handleChange}
            placeholder="https://..."
            className="w-full rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm outline-none transition focus:border-stone-400 focus:bg-white"
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="mt-6 inline-flex rounded-full px-6 py-3 text-sm font-semibold text-white transition-all hover:-translate-y-0.5 hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-70"
        style={{ backgroundColor: primaryColor }}
      >
        {loading ? "Creating..." : "Create Course"}
      </button>
    </form>
  );
}