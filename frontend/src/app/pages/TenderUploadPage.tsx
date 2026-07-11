import React, { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router';
import {
  UploadCloud, FileText, Image, X, CheckCircle, ChevronDown,
  AlertCircle, ArrowLeft, ArrowRight, Package, Tag, IndianRupee,
  Info, Loader2,
} from 'lucide-react';
import { tenderService, CreateTenderData } from '../../services/tenderService';
import { useAuth } from '../../contexts/AuthContext';
import { useNotification } from '../../contexts/NotificationContext';

type Step = 1 | 2 | 3 | 4;

interface UploadedFile {
  name: string;
  size: string;
  type: 'pdf' | 'image';
}

function StepIndicator({ current }: { current: Step }) {
  const steps = [
    { n: 1, label: 'Product Info' },
    { n: 2, label: 'Media & Docs' },
    { n: 3, label: 'Pricing' },
    { n: 4, label: 'Review' },
  ];
  return (
    <div className="flex items-center justify-center gap-0 mb-10">
      {steps.map((s, i) => (
        <React.Fragment key={s.n}>
          <div className="flex flex-col items-center z-10">
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all shadow-sm"
              style={
                s.n < current
                  ? { background: '#16A34A', color: 'white', border: 'none' }
                  : s.n === current
                  ? { background: '#111827', color: 'white', boxShadow: '0 0 0 4px rgba(22,163,74,0.15)' }
                  : { background: 'rgba(255,255,255,0.8)', color: '#6B7280', border: '2px solid rgba(22,163,74,0.2)' }
              }
            >
              {s.n < current ? <CheckCircle size={16} /> : s.n}
            </div>
            <span
              className="text-xs font-semibold mt-2 hidden sm:block"
              style={{ color: s.n === current ? '#111827' : '#6B7280' }}
            >
              {s.label}
            </span>
          </div>
          {i < steps.length - 1 && (
            <div
              className="w-12 sm:w-20 h-0.5 mb-6"
              style={{ background: s.n < current ? '#16A34A' : 'rgba(22,163,74,0.15)' }}
            />
          )}
        </React.Fragment>
      ))}
    </div>
  );
}

function DropZone({
  label, accept, hint, onAdd, files, onRemove, icon,
}: {
  label: string;
  accept: string;
  hint: string;
  onAdd: (f: UploadedFile[]) => void;
  files: UploadedFile[];
  onRemove: (i: number) => void;
  icon: React.ReactNode;
}) {
  const [dragging, setDragging] = useState(false);
  const ref = useRef<HTMLInputElement>(null);

  const simulate = () => {
    const names =
      accept === '.pdf'
        ? ['TenderSpec_v2.pdf', 'ProductCatalog.pdf', 'ComplianceCert.pdf']
        : ['product_front.jpg', 'product_side.jpg', 'product_detail.png', 'packaging.jpg'];
    const picked = names[Math.floor(Math.random() * names.length)];
    onAdd([{ name: picked, size: `${(Math.random() * 4 + 0.5).toFixed(1)} MB`, type: accept === '.pdf' ? 'pdf' : 'image' }]);
  };

  return (
    <div className="space-y-3">
      <label className="block text-sm font-bold text-[#111827]">{label}</label>
      <div
        className="rounded-[20px] border-2 border-dashed p-8 text-center cursor-pointer transition-all bg-white hover:bg-emerald-50/50"
        style={{
          borderColor: dragging ? '#16A34A' : 'rgba(22,163,74,0.25)',
          background: dragging ? 'rgba(22,163,74,0.04)' : 'rgba(255,255,255,0.8)',
        }}
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => { e.preventDefault(); setDragging(false); simulate(); }}
        onClick={() => ref.current?.click()}
      >
        <input ref={ref} type="file" accept={accept} className="hidden" multiple onChange={simulate} />
        <div
          className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4"
          style={{ background: 'rgba(22,163,74,0.08)', color: '#16A34A' }}
        >
          {icon}
        </div>
        <p className="font-bold text-[#111827] mb-1">Drag & drop or click to browse</p>
        <p className="text-xs text-gray-500">{hint}</p>
      </div>

      {files.length > 0 && (
        <div className="space-y-2 mt-4">
          {files.map((f, i) => (
            <div
              key={i}
              className="flex items-center gap-3 p-3 rounded-[12px] bg-white shadow-sm"
              style={{ border: '1px solid rgba(22,163,74,0.15)' }}
            >
              <div
                className="w-9 h-9 rounded-[8px] flex items-center justify-center flex-shrink-0"
                style={{ background: f.type === 'pdf' ? '#fee2e2' : '#dcfce7', color: f.type === 'pdf' ? '#dc2626' : '#16A34A' }}
              >
                {f.type === 'pdf' ? <FileText size={16} /> : <Image size={16} />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-[#111827] truncate">{f.name}</p>
                <p className="text-xs text-[#6B7280]">{f.size}</p>
              </div>
              <button
                onClick={(e) => { e.stopPropagation(); onRemove(i); }}
                className="w-7 h-7 rounded-full flex items-center justify-center hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors"
              >
                <X size={14} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function TenderUploadPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { success, error: showError } = useNotification();
  const [step, setStep] = useState<Step>(1);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [pdfFiles, setPdfFiles] = useState<UploadedFile[]>([]);
  const [mediaFiles, setMediaFiles] = useState<UploadedFile[]>([]);
  const [category, setCategory] = useState('');
  const [catOpen, setCatOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    productCode: '',
    quantity: '',
    unit: '',
    specs: '',
    basePrice: '',
    gstRate: '',
    minOrder: '',
    deliveryTime: '',
    validityDate: '',
    bidOpeningDate: '',
    paymentTerms: '',
    shippingNotes: '',
  });

  const categories = [
    'goods', 'services', 'works', 'consultancy', 'it_software',
    'medical', 'construction', 'transportation', 'agriculture', 'education', 'other',
  ];

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleNext = async () => {
    if (step < 4) {
      setStep(s => (s + 1) as Step);
    } else {
      await submitTender();
    }
  };

  const handleBack = () => { 
    if (step > 1) setStep(s => (s - 1) as Step); 
  };

  const submitTender = async () => {
    if (!user?._id) {
      showError('You must be logged in to upload a tender');
      return;
    }

    setLoading(true);
    try {
      const tenderData: CreateTenderData = {
        title: formData.title,
        description: formData.description,
        category: category || 'other',
        submissionDeadline: formData.validityDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        location: 'India',
        tags: formData.specs ? formData.specs.split(',').map(s => s.trim()) : [],
        budget: {
          estimated: formData.basePrice ? parseFloat(formData.basePrice) : 0,
          currency: 'INR',
          budgetType: 'fixed',
        },
      };

      const response = await tenderService.createTender(tenderData);
      
      success('Tender submitted successfully', 'Your tender is now pending admin review');
      setSubmitted(true);
    } catch (err: any) {
      const message = err.response?.data?.message || 'Failed to create tender';
      showError(message);
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-6">
        <div
          className="max-w-md w-full rounded-[24px] p-10 text-center glass-card"
        >
          <div
            className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6"
            style={{ background: 'rgba(22,163,74,0.08)' }}
          >
            <CheckCircle size={40} style={{ color: '#16A34A' }} />
          </div>
          <h2 className="text-2xl font-bold mb-3 text-[#111827]">Tender Submitted!</h2>
          <p className="text-[#6B7280] mb-2 leading-relaxed">
            Your tender has been received and is now queued for admin review. You will be notified within 24–48 hours.
          </p>
          <p className="text-xs font-mono text-[#9CA3AF] mb-8">Reference ID: TND-2024-{Math.floor(Math.random() * 900 + 100)}</p>
          <div className="flex flex-col gap-3">
            <Link
              to="/seller/dashboard"
              className="w-full py-3 rounded-[12px] font-bold text-center transition-all hover:-translate-y-0.5 shadow-md active:scale-95"
              style={{ background: '#16A34A', color: 'white', boxShadow: '0 4px 12px rgba(22,163,74,0.2)' }}
            >
              Go to Dashboard
            </Link>
            <button
              onClick={() => { setSubmitted(false); setStep(1); setPdfFiles([]); setMediaFiles([]); setCategory(''); }}
              className="w-full py-3 rounded-[12px] font-bold transition-all hover:-translate-y-0.5 active:scale-95 bg-white text-[#111827]"
              style={{ border: '1px solid #E5E7EB' }}
            >
              Upload Another Tender
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* Page Header */}
      <div
        className="py-12 relative overflow-hidden bg-white border-b border-gray-100"
      >
        <div
          className="absolute inset-0 pointer-events-none opacity-[0.03]"
          style={{
            backgroundImage:
              'linear-gradient(rgba(22,163,74,1) 1px, transparent 1px), linear-gradient(90deg, rgba(22,163,74,1) 1px, transparent 1px)',
            backgroundSize: '48px 48px',
          }}
        />
        <div className="max-w-[1280px] mx-auto px-6 md:px-8 lg:px-12 relative z-10">
          <Link
            to="/seller/dashboard"
            className="inline-flex items-center gap-2 text-sm text-[#6B7280] hover:text-[#16A34A] transition-colors mb-6 font-medium"
          >
            <ArrowLeft size={16} /> Back to Dashboard
          </Link>
          <div className="flex items-start gap-4">
            <div
              className="w-14 h-14 rounded-[16px] flex items-center justify-center flex-shrink-0"
              style={{ background: 'rgba(22,163,74,0.1)', color: '#16A34A' }}
            >
              <UploadCloud size={28} />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-[#111827] mb-2">Upload New Tender</h1>
              <p className="text-[#6B7280]">List your products and tender documents for government buyers on Phoenix.</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-[860px] mx-auto px-6 md:px-8 py-12">
        <StepIndicator current={step} />

        <div
          className="rounded-[24px] p-8 shadow-sm border border-white bg-white/70 backdrop-blur-[20px]"
        >
          {/* Step 1 — Product Info */}
          {step === 1 && (
            <div className="space-y-6">
              <SectionTitle icon={<Package size={20} />} title="Product Information" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="md:col-span-2">
                  <FormField label="Tender / Product Title" required>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) => handleInputChange('title', e.target.value)}
                      placeholder="e.g. Industrial Safety Helmets — Batch of 500"
                      className="form-input"
                    />
                  </FormField>
                </div>

                {/* Category dropdown */}
                <FormField label="Category" required>
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setCatOpen(!catOpen)}
                      className="w-full flex items-center justify-between px-4 py-3 rounded-[12px] text-sm border bg-white text-left outline-none transition-all focus:ring-4"
                      style={{
                        borderColor: catOpen ? '#16A34A' : '#E5E7EB',
                        color: category ? '#111827' : '#9CA3AF',
                        boxShadow: catOpen ? '0 0 0 4px rgba(22,163,74,0.1)' : 'none',
                      }}
                    >
                      {category ? category.charAt(0).toUpperCase() + category.slice(1) : 'Select a category'}
                      <ChevronDown size={16} className={`transition-transform ${catOpen ? 'rotate-180' : ''}`} style={{ color: '#16A34A' }} />
                    </button>
                    {catOpen && (
                      <div
                        className="absolute top-full left-0 right-0 mt-2 rounded-[12px] shadow-lg z-20 overflow-hidden bg-white border border-gray-100"
                      >
                        {categories.map((c) => (
                          <button
                            key={c}
                            type="button"
                            onClick={() => { setCategory(c); setCatOpen(false); }}
                            className="w-full text-left px-4 py-3 text-sm hover:bg-emerald-50 transition-colors text-[#111827]"
                          >
                            {c.charAt(0).toUpperCase() + c.slice(1)}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </FormField>

                <FormField label="Product / Item Code" hint="Internal SKU or catalog code">
                  <input 
                    type="text" 
                    value={formData.productCode}
                    onChange={(e) => handleInputChange('productCode', e.target.value)}
                    placeholder="e.g. SKU-HELM-500-YLW" 
                    className="form-input" 
                  />
                </FormField>

                <FormField label="Quantity Available" required>
                  <input 
                    type="number" 
                    min="1" 
                    value={formData.quantity}
                    onChange={(e) => handleInputChange('quantity', e.target.value)}
                    placeholder="e.g. 500" 
                    className="form-input" 
                  />
                </FormField>

                <FormField label="Unit of Measurement" required>
                  <input 
                    type="text" 
                    value={formData.unit}
                    onChange={(e) => handleInputChange('unit', e.target.value)}
                    placeholder="e.g. Units, Kg, Litres, Boxes" 
                    className="form-input" 
                  />
                </FormField>

                <div className="md:col-span-2">
                  <FormField label="Product Description" required>
                    <textarea
                      rows={4}
                      value={formData.description}
                      onChange={(e) => handleInputChange('description', e.target.value)}
                      placeholder="Describe the product in detail — specifications, material, compliance standards, condition (new/refurbished), etc."
                      className="form-input resize-none"
                    />
                  </FormField>
                </div>

                <div className="md:col-span-2">
                  <FormField label="Key Specifications">
                    <textarea
                      rows={3}
                      value={formData.specs}
                      onChange={(e) => handleInputChange('specs', e.target.value)}
                      placeholder="e.g. Material: ABS Plastic, Weight: 350g, Color: Yellow, IS Standard: IS 2925 (comma separated)"
                      className="form-input resize-none"
                    />
                  </FormField>
                </div>
              </div>
            </div>
          )}

          {/* Step 2 — Media & Docs */}
          {step === 2 && (
            <div className="space-y-8">
              <SectionTitle icon={<Image size={20} />} title="Media & Documents" />

              <div
                className="flex items-start gap-3 p-4 rounded-[12px] text-sm bg-emerald-50/50 border border-emerald-100"
              >
                <Info size={16} className="flex-shrink-0 mt-0.5 text-[#16A34A]" />
                <p className="text-[#065F46] leading-relaxed">
                  Upload clear product photos and your official tender specification PDF. All files are stored securely and shared only with verified buyers.
                </p>
              </div>

              <DropZone
                label="Product Photos *"
                accept=".jpg,.jpeg,.png,.webp"
                hint="JPG, PNG, WEBP · Max 10 MB per file · Up to 10 images"
                files={mediaFiles}
                onAdd={(f) => setMediaFiles((p) => [...p, ...f])}
                onRemove={(i) => setMediaFiles((p) => p.filter((_, idx) => idx !== i))}
                icon={<Image size={26} />}
              />

              <DropZone
                label="Tender Specification PDF *"
                accept=".pdf"
                hint="PDF only · Include product datasheet, compliance certs, and bid document · Max 25 MB"
                files={pdfFiles}
                onAdd={(f) => setPdfFiles((p) => [...p, ...f])}
                onRemove={(i) => setPdfFiles((p) => p.filter((_, idx) => idx !== i))}
                icon={<FileText size={26} />}
              />

              <div>
                <p className="text-sm font-bold text-[#111827] mb-3">Additional Documents <span className="font-normal text-[#9CA3AF]">(optional)</span></p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {['GST Certificate', 'Quality Test Report', 'ISO / BIS Certificate', 'OEM Authorization Letter'].map((doc) => (
                    <label
                      key={doc}
                      className="flex items-center gap-3 p-4 rounded-[12px] cursor-pointer transition-all hover:bg-gray-50 border border-gray-200 bg-white shadow-sm"
                    >
                      <input type="checkbox" className="accent-[#16A34A] w-4 h-4" />
                      <span className="text-sm font-medium text-[#111827]">{doc}</span>
                    </label>
                  ))}
                </div>
                <p className="text-xs text-[#9CA3AF] mt-2">Check the documents you will upload and attach them above.</p>
              </div>
            </div>
          )}

          {/* Step 3 — Pricing */}
          {step === 3 && (
            <div className="space-y-6">
              <SectionTitle icon={<IndianRupee size={20} />} title="Pricing & Tender Details" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <FormField label="Base Price (₹)" required hint="Per unit before taxes">
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-[#9CA3AF]">₹</span>
                    <input 
                      type="number" 
                      min="0" 
                      value={formData.basePrice}
                      onChange={(e) => handleInputChange('basePrice', e.target.value)}
                      placeholder="0.00" 
                      className="form-input pl-8" 
                    />
                  </div>
                </FormField>

                <FormField label="GST Rate" required>
                  <select 
                    value={formData.gstRate}
                    onChange={(e) => handleInputChange('gstRate', e.target.value)}
                    className="form-input appearance-none bg-white"
                  >
                    <option value="">Select GST rate</option>
                    {['0%', '5%', '12%', '18%', '28%'].map((r) => <option key={r} value={r}>{r}</option>)}
                  </select>
                </FormField>

                <FormField label="Minimum Order Quantity">
                  <input 
                    type="number" 
                    min="1" 
                    value={formData.minOrder}
                    onChange={(e) => handleInputChange('minOrder', e.target.value)}
                    placeholder="e.g. 50" 
                    className="form-input" 
                  />
                </FormField>

                <FormField label="Delivery Timeframe" required>
                  <input 
                    type="text" 
                    value={formData.deliveryTime}
                    onChange={(e) => handleInputChange('deliveryTime', e.target.value)}
                    placeholder="e.g. 15 working days from PO" 
                    className="form-input" 
                  />
                </FormField>

                <FormField label="Tender Validity Date" required>
                  <input 
                    type="date" 
                    value={formData.validityDate}
                    onChange={(e) => handleInputChange('validityDate', e.target.value)}
                    className="form-input" 
                  />
                </FormField>

                <FormField label="Bid Opening Date">
                  <input 
                    type="date" 
                    value={formData.bidOpeningDate}
                    onChange={(e) => handleInputChange('bidOpeningDate', e.target.value)}
                    className="form-input" 
                  />
                </FormField>

                <div className="md:col-span-2">
                  <FormField label="Payment Terms">
                    <textarea
                      rows={3}
                      value={formData.paymentTerms}
                      onChange={(e) => handleInputChange('paymentTerms', e.target.value)}
                      placeholder="e.g. 30% advance on PO, 70% on delivery and inspection acceptance"
                      className="form-input resize-none"
                    />
                  </FormField>
                </div>

                <div className="md:col-span-2">
                  <FormField label="Shipping & Delivery Notes">
                    <textarea
                      rows={2}
                      value={formData.shippingNotes}
                      onChange={(e) => handleInputChange('shippingNotes', e.target.value)}
                      placeholder="e.g. Delivery included within 50 km radius. Extra charges applicable beyond."
                      className="form-input resize-none"
                    />
                  </FormField>
                </div>
              </div>

              {/* Price preview */}
              <div
                className="rounded-[16px] p-6 bg-emerald-50/50 border border-emerald-100"
              >
                <p className="text-xs font-bold uppercase tracking-wider mb-4 text-[#16A34A]">Price Preview</p>
                <div className="grid grid-cols-3 gap-4 text-center">
                  {[
                    { label: 'Base Price', value: '₹0.00' },
                    { label: 'GST Amount', value: '₹0.00' },
                    { label: 'Total per Unit', value: '₹0.00' },
                  ].map((p) => (
                    <div key={p.label}>
                      <div className="text-2xl font-black text-[#111827]">{p.value}</div>
                      <div className="text-xs font-medium text-[#6B7280] mt-1">{p.label}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Step 4 — Review */}
          {step === 4 && (
            <div className="space-y-6">
              <SectionTitle icon={<CheckCircle size={20} />} title="Review & Submit" />
              <div
                className="flex items-start gap-3 p-4 rounded-[12px] text-sm bg-amber-50 border border-amber-200"
              >
                <AlertCircle size={16} className="flex-shrink-0 mt-0.5 text-amber-600" />
                <p className="text-amber-800 leading-relaxed font-medium">
                  Please review all details before submitting. Once submitted your tender will go into admin review and cannot be edited until approved or rejected.
                </p>
              </div>

              <div className="space-y-4">
                {[
                  { label: 'Product Info', items: ['Title: Industrial Safety Helmets — Batch of 500', 'Category: Safety & PPE', 'Quantity: 500 Units'] },
                  { label: 'Media & Documents', items: [`${mediaFiles.length} photo(s) uploaded`, `${pdfFiles.length} PDF document(s) attached`] },
                  { label: 'Pricing', items: ['Base Price: ₹ —', 'GST Rate: —', 'Delivery: —'] },
                ].map((section) => (
                  <div
                    key={section.label}
                    className="rounded-[16px] p-6 border border-gray-100 bg-gray-50/50"
                  >
                    <p className="text-xs font-bold uppercase tracking-wider mb-4 text-[#6B7280]">{section.label}</p>
                    <ul className="space-y-2">
                      {section.items.map((item) => (
                        <li key={item} className="flex items-center gap-2 text-sm font-medium text-[#111827]">
                          <CheckCircle size={14} className="text-[#16A34A] flex-shrink-0" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>

              <label
                className="flex items-start gap-3 p-4 rounded-[12px] cursor-pointer transition-all hover:bg-gray-50 border border-gray-200 bg-white shadow-sm mt-6"
              >
                <input type="checkbox" required className="accent-[#16A34A] w-4 h-4 mt-0.5 flex-shrink-0" />
                <span className="text-sm text-[#4B5563] leading-relaxed">
                  I confirm that all information provided is accurate, the product meets GeM/Government procurement standards, and I agree to Phoenix Tender Tech's{' '}
                  <Link to="/terms" className="font-bold text-[#16A34A] hover:underline">Terms & Conditions</Link>.
                </span>
              </label>
            </div>
          )}

          {/* Navigation */}
          <div className="flex items-center justify-between mt-10 pt-6 border-t border-gray-100">
            <button
              onClick={handleBack}
              disabled={step === 1}
              className="flex items-center gap-2 px-5 py-2.5 rounded-[12px] text-sm font-bold transition-all hover:bg-gray-100 text-[#6B7280] border border-transparent hover:border-gray-200 disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:border-transparent"
            >
              <ArrowLeft size={16} /> Back
            </button>
            <div className="text-xs font-bold text-[#9CA3AF] hidden sm:block uppercase tracking-widest">Step {step} of 4</div>
            <button
              onClick={handleNext}
              disabled={loading}
              className="flex items-center gap-2 px-6 py-3 rounded-[12px] text-sm font-bold text-white transition-all hover:-translate-y-0.5 shadow-md active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-none"
              style={{ background: '#16A34A', boxShadow: '0 4px 12px rgba(22,163,74,0.2)' }}
            >
              {loading ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Submitting...
                </>
              ) : step === 4 ? (
                'Submit Tender'
              ) : (
                <>
                  Continue <ArrowRight size={16} />
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      <style>{`
        .form-input {
          width: 100%;
          padding: 0.75rem 1rem;
          border-radius: 0.75rem;
          border: 1px solid #E5E7EB;
          background: #FFFFFF;
          font-size: 0.875rem;
          color: #111827;
          outline: none;
          transition: all 0.2s;
          box-shadow: 0 1px 2px rgba(0,0,0,0.05);
        }
        .form-input:focus {
          border-color: #16A34A;
          box-shadow: 0 0 0 4px rgba(22,163,74,0.1);
        }
        .form-input::placeholder {
          color: #9CA3AF;
        }
      `}</style>
    </div>
  );
}

function SectionTitle({ icon, title }: { icon: React.ReactNode; title: string }) {
  return (
    <div className="flex items-center gap-3 pb-3 border-b border-gray-100">
      <div className="w-10 h-10 rounded-[12px] flex items-center justify-center bg-emerald-50 text-[#16A34A]">
        {icon}
      </div>
      <h2 className="text-xl font-bold text-[#111827]">{title}</h2>
    </div>
  );
}

function FormField({ label, children, required, hint }: { label: string; children: React.ReactNode; required?: boolean; hint?: string }) {
  return (
    <div>
      <label className="block text-sm font-bold text-[#374151] mb-2">
        {label} {required && <span className="text-[#16A34A] ml-0.5">*</span>}
        {hint && <span className="font-normal text-[#9CA3AF] ml-1">— {hint}</span>}
      </label>
      {children}
    </div>
  );
}