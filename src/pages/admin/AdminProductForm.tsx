import { useState, useRef, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate, useParams } from 'react-router-dom';
import { X, Upload, ImagePlus, Loader2 } from 'lucide-react';
import api from '../../api/api';
import { useAppSelector } from '../../hooks/hooks';
import { selectCurrentUser } from '../../store/authSlice';

// ── Schema ─────────────────────────────────────────────────────────────────

const productSchema = z.object({
  name:        z.string().min(3,  'Product name is required'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  price:       z.string().regex(/^[0-9]+(\.[0-9]{1,2})?$/, 'Price must be a valid number'),
  discount:    z.string().optional(),
  stock:       z.string().optional(),
  category:    z.string().min(2,  'Category is required'),
});

type ProductFormData = z.infer<typeof productSchema>;

// ── Image entry type ─────────────────────────────────────────────────────

interface ImageEntry {
  file:     File | null;
  preview:  string;
  existing: boolean;
}

// ── Component ─────────────────────────────────────────────────────────────

const AdminProductForm = () => {
  const navigate  = useNavigate();
  const { id }    = useParams<{ id: string }>();
  const isEdit    = Boolean(id);

  const user = useAppSelector(selectCurrentUser);

  const [serverError,    setServerError]    = useState<string>('');
  const [success,        setSuccess]        = useState<string>('');
  const [loadingProduct, setLoadingProduct] = useState<boolean>(isEdit);
  const [mainImage,      setMainImage]      = useState<File | null>(null);
  const [mainPreview,    setMainPreview]    = useState<string>('');
  const [addlImages,     setAddlImages]     = useState<ImageEntry[]>([]);

  const mainInputRef = useRef<HTMLInputElement>(null);
  const addlInputRef = useRef<HTMLInputElement>(null);

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } =
    useForm<ProductFormData>({
      resolver: zodResolver(productSchema),
      defaultValues: { name: '', description: '', price: '', discount: '', stock: '', category: '' },
    });

  useEffect(() => {
    if (!isEdit || !id) return;
    (async () => {
      try {
        const res = await api.get(`/api/products/${id}`);
        const p   = (res as unknown as { product: Record<string, unknown> }).product;
        reset({
          name:        String(p.name        ?? ''),
          description: String(p.description ?? ''),
          price:       String(p.price       ?? ''),
          discount:    String(p.discount    ?? '0'),
          stock:       String(p.stock       ?? '0'),
          category:    String(p.category    ?? ''),
        });
        if (p.image)  setMainPreview(String(p.image));
        if (Array.isArray(p.images) && p.images.length > 0) {
          setAddlImages((p.images as string[]).map((url) => ({ file: null, preview: url, existing: true })));
        }
      } catch (err) {
        setServerError(err instanceof Error ? err.message : 'Failed to load product');
      } finally {
        setLoadingProduct(false);
      }
    })();
  }, [id, isEdit, reset]);

  const handleMainImageChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (mainPreview && mainPreview.startsWith('blob:')) URL.revokeObjectURL(mainPreview);
    setMainImage(file);
    setMainPreview(URL.createObjectURL(file));
  };

  const removeMainImage = (): void => {
    if (mainPreview && mainPreview.startsWith('blob:')) URL.revokeObjectURL(mainPreview);
    setMainImage(null);
    setMainPreview('');
    if (mainInputRef.current) mainInputRef.current.value = '';
  };

  const handleAddlImagesChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const files = Array.from(e.target.files ?? []);
    const entries: ImageEntry[] = files.map((file) => ({
      file,
      preview:  URL.createObjectURL(file),
      existing: false,
    }));
    setAddlImages((prev) => [...prev, ...entries]);
    if (addlInputRef.current) addlInputRef.current.value = '';
  };

  const removeAddlImage = (index: number): void => {
    setAddlImages((prev) => {
      const entry = prev[index];
      if (!entry.existing && entry.preview.startsWith('blob:')) URL.revokeObjectURL(entry.preview);
      return prev.filter((_, i) => i !== index);
    });
  };

  const onSubmit = async (data: ProductFormData): Promise<void> => {
    setServerError('');
    setSuccess('');

    const formData = new FormData();
    formData.append('name',        data.name);
    formData.append('description', data.description);
    formData.append('price',       data.price);
    formData.append('discount',    data.discount || '0');
    formData.append('stock',       data.stock    || '0');
    formData.append('category',    data.category);

    if (mainImage)        formData.append('image',          mainImage);
    else if (mainPreview) formData.append('existingImage',  mainPreview);

    const existingUrls = addlImages.filter((e) => e.existing).map((e) => e.preview);
    const newFiles     = addlImages.filter((e) => !e.existing);
    formData.append('existingImages', JSON.stringify(existingUrls));
    newFiles.forEach(({ file }) => { if (file) formData.append('images', file); });

    try {
      if (isEdit) {
        await api.put(`/api/products/${id}`, formData);
        setSuccess('Product updated successfully. Redirecting...');
      } else {
        await api.post('/api/products', formData);
        setSuccess('Product created successfully. Redirecting...');
      }
      setTimeout(() => navigate('/store'), 1400);
    } catch (err) {
      setServerError(err instanceof Error ? err.message : `Failed to ${isEdit ? 'update' : 'create'} product`);
    }
  };

  if (!user || user.role !== 'ADMIN') return (
    <div className="max-w-4xl mx-auto px-4 py-16 text-center">
      <h1 className="text-2xl font-semibold mb-4">Access denied</h1>
      <p className="text-gray-600">You must be an admin to view this page.</p>
    </div>
  );

  if (loadingProduct) return (
    <div className="max-w-4xl mx-auto px-4 py-16 flex items-center justify-center">
      <Loader2 size={32} className="animate-spin text-blue-600" />
      <span className="ml-3 text-gray-600">Loading product...</span>
    </div>
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">{isEdit ? 'Edit Product' : 'Add New Product'}</h1>
        <button aria-label="Back to store" onClick={() => navigate('/store')}
          className="text-sm text-gray-500 hover:text-gray-700 underline">
          ← Back to store
        </button>
      </div>

      {serverError && <div className="mb-4 rounded-lg bg-red-50 border border-red-200 p-4 text-red-700">{serverError}</div>}
      {success     && <div className="mb-4 rounded-lg bg-green-50 border border-green-200 p-4 text-green-700">{success}</div>}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 bg-white p-6 rounded-xl shadow-sm">

        <div>
          <label className="block text-sm font-medium mb-2">Product Name</label>
          <input {...register('name')} className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
          {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Description</label>
          <textarea {...register('description')} rows={5} className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
          {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description.message}</p>}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {([
            { field: 'price'    as const, label: 'Price (₹)',    placeholder: '99.99'      },
            { field: 'discount' as const, label: 'Discount (%)', placeholder: '0'          },
            { field: 'stock'    as const, label: 'Stock',        placeholder: '50'         },
            { field: 'category' as const, label: 'Category',     placeholder: 'Electronics'},
          ]).map(({ field, label, placeholder }) => (
            <div key={field}>
              <label className="block text-sm font-medium mb-2">{label}</label>
              <input {...register(field)} placeholder={placeholder}
                className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
              {errors[field] && <p className="text-red-500 text-sm mt-1">{errors[field]?.message}</p>}
            </div>
          ))}
        </div>

        {/* Main Image */}
        <div>
          <label className="block text-sm font-medium mb-2">Main Image</label>
          {mainPreview ? (
            <div className="relative inline-block">
              <img src={mainPreview} alt="Main preview" className="w-40 h-40 object-cover rounded-lg border" loading="lazy" />
              <button aria-label="Remove main image" type="button" onClick={removeMainImage}
                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-0.5 hover:bg-red-600">
                <X size={14} />
              </button>
              <button aria-label="Change main image" type="button" onClick={() => mainInputRef.current?.click()}
                className="absolute bottom-1 right-1 bg-white border text-gray-600 rounded px-1.5 py-0.5 text-xs hover:bg-gray-50">
                Change
              </button>
            </div>
          ) : (
            <button aria-label="Upload main image" type="button" onClick={() => mainInputRef.current?.click()}
              className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition-colors text-gray-500 hover:text-blue-500">
              <Upload size={28} className="mb-2" />
              <span className="text-xs text-center">Click to upload<br />main image</span>
            </button>
          )}
          <input ref={mainInputRef} type="file" accept="image/*" className="hidden" onChange={handleMainImageChange} />
        </div>

        {/* Additional Images */}
        <div>
          <label className="block text-sm font-medium mb-2">Additional Images</label>
          <div className="flex flex-wrap gap-3">
            {addlImages.map(({ preview, existing }, i) => (
              <div key={i} className="relative">
                <img src={preview} alt={`img-${i}`} loading="lazy" className="w-28 h-28 object-cover rounded-lg border" />
                {existing && (
                  <span className="absolute bottom-1 left-1 bg-black bg-opacity-50 text-white text-xs px-1 rounded">saved</span>
                )}
                <button aria-label="Remove additional image" type="button" onClick={() => removeAddlImage(i)}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-0.5 hover:bg-red-600">
                  <X size={14} />
                </button>
              </div>
            ))}
            <button aria-label="Upload additional images" type="button" onClick={() => addlInputRef.current?.click()}
              className="flex flex-col items-center justify-center w-full h-28 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition-colors text-gray-500 hover:text-blue-500">
              <ImagePlus size={24} className="mb-1" />
              <span className="text-xs">Add images</span>
            </button>
          </div>
          <input ref={addlInputRef} type="file" accept="image/*" multiple className="hidden" onChange={handleAddlImagesChange} />
          <p className="text-xs text-gray-500 mt-2">Up to 10 images · Max 5 MB each · JPG, PNG, WebP</p>
        </div>

        <button aria-label="Submit form" type="submit" disabled={isSubmitting}
          className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2">
          {isSubmitting && <Loader2 size={16} className="animate-spin" />}
          {isSubmitting
            ? (isEdit ? 'Updating...' : 'Saving...')
            : (isEdit ? 'Update product' : 'Create product')}
        </button>
      </form>
    </div>
  );
};

export default AdminProductForm;
