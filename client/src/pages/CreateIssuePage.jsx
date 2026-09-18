import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, Link } from 'react-router-dom';
import api, { parseApiError } from '../api/client';
import { useToast } from '../context/ToastContext';
import {
  Wrench,
  UploadCloud,
  X,
  Loader2,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  FileImage
} from 'lucide-react';
import { FlowButton } from '../components/ui/flow-button';

const CATEGORIES = [
  { value: 'wifi', label: 'Wi-Fi / Internet' },
  { value: 'electricity', label: 'Electricity / Lighting' },
  { value: 'water', label: 'Plumbing / Water Supply' },
  { value: 'mess', label: 'Mess / Food Facilities' },
  { value: 'furniture', label: 'Furniture / Bed / Table' },
  { value: 'cleanliness', label: 'Sanitation & Cleanliness' },
  { value: 'security', label: 'Security & Doors' },
  { value: 'other', label: 'Other Infrastructure' }
];

const PRIORITIES = [
  { value: 'low', label: 'Low — Non-urgent request' },
  { value: 'medium', label: 'Medium — Normal maintenance' },
  { value: 'high', label: 'High — Urgent priority' }
];

const CreateIssuePage = () => {
  const toast = useToast();
  const navigate = useNavigate();

  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [generalError, setGeneralError] = useState('');

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting }
  } = useForm({
    defaultValues: {
      title: '',
      description: '',
      category: 'wifi',
      location: '',
      priority: 'medium'
    }
  });

  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please select a valid image file (JPEG, PNG, WebP)');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size must be less than 5MB');
      return;
    }

    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const removeImage = () => {
    if (imagePreview) {
      URL.revokeObjectURL(imagePreview);
    }
    setImageFile(null);
    setImagePreview(null);
  };

  const onSubmit = async (data) => {
    setGeneralError('');

    try {
      const formData = new FormData();
      formData.append('title', data.title);
      formData.append('description', data.description);
      formData.append('category', data.category);
      formData.append('location', data.location);
      formData.append('priority', data.priority);

      if (imageFile) {
        formData.append('image', imageFile);
      }

      const response = await api.post('/issues', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      toast.success('Issue reported successfully!');
      const newIssue = response.data.data;
      navigate(newIssue?._id ? `/issues/${newIssue._id}` : '/');
    } catch (err) {
      const parsed = parseApiError(err);
      if (parsed.fieldErrors && Object.keys(parsed.fieldErrors).length > 0) {
        Object.entries(parsed.fieldErrors).forEach(([field, msg]) => {
          setError(field, { type: 'server', message: msg });
        });
      }
      setGeneralError(parsed.message || 'Failed to submit issue. Please check your input.');
      toast.error(parsed.message || 'Error submitting report');
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Back Button & Title */}
      <div className="flex items-center gap-3">
        <Link
          to="/"
          className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 bg-white dark:bg-slate-900 transition-colors shadow-xs"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100">Report a New Issue</h1>
          <p className="text-xs text-slate-600 dark:text-slate-400">
            Submit details and maintenance photos for prompt resolution
          </p>
        </div>
      </div>

      {/* Form Container */}
      <div className="bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 backdrop-blur-md shadow-xl">
        {generalError && (
          <div className="mb-6 p-4 rounded-xl bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 text-rose-700 dark:text-rose-300 text-xs sm:text-sm font-medium">
            {generalError}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
          {/* Issue Title */}
          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300">Issue Title *</label>
            <input
              type="text"
              placeholder="e.g., Wi-Fi disconnected in Room 204"
              {...register('title', {
                required: 'Title is required',
                minLength: { value: 5, message: 'Title must be at least 5 characters' },
                maxLength: { value: 120, message: 'Title cannot exceed 120 characters' }
              })}
              className={`w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950/80 border rounded-xl text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30 dark:focus:ring-sky-500/50 transition-all ${
                errors.title ? 'border-rose-400 dark:border-rose-500/80' : 'border-slate-200 dark:border-slate-800'
              }`}
            />
            {errors.title && (
              <p className="text-xs text-rose-600 dark:text-rose-400 mt-1 font-medium">{errors.title.message}</p>
            )}
          </div>

          {/* Category & Priority Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Category */}
            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300">Category *</label>
              <select
                {...register('category', { required: 'Category is required' })}
                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 rounded-xl text-sm text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/30 dark:focus:ring-sky-500/50 cursor-pointer"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat.value} value={cat.value}>
                    {cat.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Priority */}
            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300">Priority Level</label>
              <select
                {...register('priority')}
                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 rounded-xl text-sm text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/30 dark:focus:ring-sky-500/50 cursor-pointer"
              >
                {PRIORITIES.map((pri) => (
                  <option key={pri.value} value={pri.value}>
                    {pri.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Location */}
          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300">Specific Location *</label>
            <input
              type="text"
              placeholder="e.g., Hostel Block B, 2nd Floor, Room 204"
              {...register('location', {
                required: 'Location is required',
                minLength: { value: 2, message: 'Location is required' }
              })}
              className={`w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950/80 border rounded-xl text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30 dark:focus:ring-sky-500/50 transition-all ${
                errors.location ? 'border-rose-400 dark:border-rose-500/80' : 'border-slate-200 dark:border-slate-800'
              }`}
            />
            {errors.location && (
              <p className="text-xs text-rose-600 dark:text-rose-400 mt-1 font-medium">{errors.location.message}</p>
            )}
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300">Description *</label>
            <textarea
              rows={4}
              placeholder="Describe the issue in detail (e.g., when it started, symptoms, impact)..."
              {...register('description', {
                required: 'Description is required',
                minLength: { value: 10, message: 'Description must be at least 10 characters' },
                maxLength: { value: 2000, message: 'Description cannot exceed 2000 characters' }
              })}
              className={`w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950/80 border rounded-xl text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30 dark:focus:ring-sky-500/50 transition-all ${
                errors.description ? 'border-rose-400 dark:border-rose-500/80' : 'border-slate-200 dark:border-slate-800'
              }`}
            />
            {errors.description && (
              <p className="text-xs text-rose-600 dark:text-rose-400 mt-1 font-medium">{errors.description.message}</p>
            )}
          </div>

          {/* Image Upload with Instant Preview */}
          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300">
              Attach Photo <span className="text-slate-400 dark:text-slate-500">(Optional, max 5MB)</span>
            </label>

            {imagePreview ? (
              <div className="relative rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-950 max-h-64 flex items-center justify-center group">
                <img
                  src={imagePreview}
                  alt="Upload preview"
                  className="w-full h-auto max-h-64 object-contain"
                />
                <button
                  type="button"
                  onClick={removeImage}
                  className="absolute top-3 right-3 p-1.5 bg-slate-900/80 hover:bg-rose-500 text-white rounded-xl backdrop-blur-sm transition-colors border border-slate-700"
                  aria-label="Remove image preview"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-slate-300 dark:border-slate-800 hover:border-blue-400 dark:hover:border-sky-500/50 rounded-2xl bg-slate-50 dark:bg-slate-950/40 hover:bg-slate-100 dark:hover:bg-slate-950/80 cursor-pointer transition-all group">
                <UploadCloud className="w-8 h-8 text-slate-400 dark:text-slate-500 group-hover:text-blue-600 dark:group-hover:text-sky-400 mb-2 transition-colors" />
                <p className="text-xs text-slate-700 dark:text-slate-300 font-medium">Click or drag image to upload</p>
                <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">PNG, JPG, WebP up to 5MB</p>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageSelect}
                  className="hidden"
                />
              </label>
            )}
          </div>

          {/* Submit Button */}
          <div className="pt-2 flex justify-center">
            <FlowButton 
              type="submit" 
              disabled={isSubmitting} 
              text={isSubmitting ? "Submitting Report..." : "Submit Issue Report"}
              className="w-full"
            />
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateIssuePage;
