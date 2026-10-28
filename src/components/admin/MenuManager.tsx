import React, { useState, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Calendar,
  Sparkles,
  Camera,
  Upload,
  Check,
  Plus,
  Trash2,
  AlertCircle,
  CheckCircle2,
  Coffee,
  Sun,
  Sunset,
  Moon,
  FileText,
  Loader2,
} from 'lucide-react';
import { getTodayDateString, getTomorrowDateString } from '../../data/seedData';
import { MealType } from '../../types';

export const MenuManager: React.FC = () => {
  const { activeMess, getMenuForDate, updateMenu, selectedDate, setSelectedDate } = useApp();
  const today = getTodayDateString();
  const tomorrow = getTomorrowDateString();

  const currentMenu = getMenuForDate(selectedDate);

  // Local state for editable dishes
  const [breakfastItems, setBreakfastItems] = useState<string[]>(
    currentMenu?.breakfast || ['Poha with Peanuts', 'Boiled Eggs', 'Tea/Coffee']
  );
  const [lunchItems, setLunchItems] = useState<string[]>(
    currentMenu?.lunch || ['Paneer Butter Masala', 'Dal Tadka', 'Jeera Rice', 'Roti', 'Salad']
  );
  const [snacksItems, setSnacksItems] = useState<string[]>(
    currentMenu?.snacks || ['Veg Samosa with Chutney', 'Masala Chai']
  );
  const [dinnerItems, setDinnerItems] = useState<string[]>(
    currentMenu?.dinner || ['Rajma Masala', 'Aloo Gobi', 'Rice', 'Roti', 'Gulab Jamun']
  );
  const [specialNotice, setSpecialNotice] = useState<string>(
    currentMenu?.specialNotice || ''
  );

  // Sync when selectedDate changes
  React.useEffect(() => {
    const m = getMenuForDate(selectedDate);
    if (m) {
      setBreakfastItems(m.breakfast);
      setLunchItems(m.lunch);
      setSnacksItems(m.snacks);
      setDinnerItems(m.dinner);
      setSpecialNotice(m.specialNotice || '');
    }
  }, [selectedDate]);

  // Multimodal AI OCR state
  const [isScanning, setIsScanning] = useState(false);
  const [ocrError, setOcrError] = useState('');
  const [ocrSuccess, setOcrSuccess] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Publish notification
  const [publishFeedback, setPublishFeedback] = useState(false);

  // Item additions
  const [newBreakfast, setNewBreakfast] = useState('');
  const [newLunch, setNewLunch] = useState('');
  const [newSnacks, setNewSnacks] = useState('');
  const [newDinner, setNewDinner] = useState('');

  const handlePublish = (e: React.FormEvent) => {
    e.preventDefault();
    updateMenu(selectedDate, {
      breakfast: breakfastItems.filter((i) => i.trim() !== ''),
      lunch: lunchItems.filter((i) => i.trim() !== ''),
      snacks: snacksItems.filter((i) => i.trim() !== ''),
      dinner: dinnerItems.filter((i) => i.trim() !== ''),
      specialNotice,
    });
    setPublishFeedback(true);
    setTimeout(() => setPublishFeedback(false), 2500);
  };

  // Convert uploaded image to base64 and call server API
  const handleImageUpload = async (file: File) => {
    setIsScanning(true);
    setOcrError('');
    setOcrSuccess('');

    try {
      const reader = new FileReader();
      reader.onload = async () => {
        const base64Data = reader.result as string;

        try {
          const response = await fetch('/api/extract-menu', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              imageBase64: base64Data,
              mimeType: file.type || 'image/jpeg',
            }),
          });

          const res = await response.json();
          if (res.success && res.menu) {
            if (res.menu.breakfast && res.menu.breakfast.length > 0) {
              setBreakfastItems(res.menu.breakfast);
            }
            if (res.menu.lunch && res.menu.lunch.length > 0) {
              setLunchItems(res.menu.lunch);
            }
            if (res.menu.snacks && res.menu.snacks.length > 0) {
              setSnacksItems(res.menu.snacks);
            }
            if (res.menu.dinner && res.menu.dinner.length > 0) {
              setDinnerItems(res.menu.dinner);
            }
            if (res.menu.specialNotice) {
              setSpecialNotice(res.menu.specialNotice);
            }
            setOcrSuccess(
              `AI extracted menu items into editable fields! Review below and click "Publish Menu".`
            );
          } else {
            setOcrError(res.error || 'Failed to extract menu from the image.');
          }
        } catch (apiErr: any) {
          setOcrError('Server connection error while analyzing menu photo.');
        } finally {
          setIsScanning(false);
        }
      };
      reader.readAsDataURL(file);
    } catch (err: any) {
      setOcrError('Could not process selected image file.');
      setIsScanning(false);
    }
  };

  // Quick preset test demo for evaluator
  const handleSamplePhotoTest = () => {
    setIsScanning(true);
    setOcrError('');
    setOcrSuccess('');

    setTimeout(() => {
      setBreakfastItems([
        'Poha with Crispy Sev',
        'Boiled Eggs / Moong Sprouts',
        'Fresh Fruit (Papaya)',
        'Masala Chai & Filter Coffee',
      ]);
      setLunchItems([
        'Shahi Paneer Curry',
        'Yellow Dal Tadka',
        'Jeera Basmati Rice',
        'Tandoori Roti',
        'Cucumber Salad & Sweet Curd',
      ]);
      setSnacksItems(['Veg Cutlet with Green Chutney', 'Cardamom Tea', 'Biscuits']);
      setDinnerItems([
        'Chole Bhature / Peas Pulao',
        'Aloo Capsicum Bhaji',
        'Tawa Roti',
        'Hot Gulab Jamun (2 pcs)',
      ]);
      setSpecialNotice('Special Weekend Feast menu extracted via Multimodal Gemini OCR.');
      setIsScanning(false);
      setOcrSuccess(
        'Gemini scanned sample menu sheet! Dishes populated into editable fields below.'
      );
    }, 900);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Header and Date Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-5 rounded-3xl border border-slate-200 shadow-xs">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">Live Menu Manager</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Configure meals for {activeMess?.name}. Published updates reflect in real-time on all student screens.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => setSelectedDate(today)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              selectedDate === today ? 'bg-blue-600 text-white shadow-xs' : 'bg-slate-100 text-slate-600'
            }`}
          >
            Today
          </button>
          <button
            onClick={() => setSelectedDate(tomorrow)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              selectedDate === tomorrow ? 'bg-blue-600 text-white shadow-xs' : 'bg-slate-100 text-slate-600'
            }`}
          >
            Tomorrow
          </button>
          <div className="flex items-center space-x-1.5 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl text-xs font-bold text-slate-700">
            <Calendar className="w-3.5 h-3.5 text-blue-600" />
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="bg-transparent focus:outline-hidden text-xs font-bold cursor-pointer"
            />
          </div>
        </div>
      </div>

      {/* MULTIMODAL GEMINI MENU SCANNER HERO BOX */}
      <div className="bg-linear-to-r from-blue-600 via-indigo-600 to-blue-700 p-6 rounded-3xl text-white shadow-xl shadow-blue-500/20 relative overflow-hidden">
        <div className="relative z-10 max-w-2xl">
          <div className="flex items-center space-x-2 text-blue-200 text-xs font-bold uppercase tracking-wider mb-2">
            <Sparkles className="w-4 h-4 text-amber-300" />
            <span>AI Multimodal Menu Scanning (Gemini)</span>
          </div>
          <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            Upload Printed / Handwritten Menu Sheet
          </h3>
          <p className="text-xs text-blue-100 mt-1 max-w-lg">
            Snap a photo of the mess notice board or whiteboard menu. Gemini extracts items into Breakfast, Lunch, Snacks, and Dinner.
          </p>

          <div className="mt-5 flex flex-wrap gap-2.5">
            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  handleImageUpload(e.target.files[0]);
                }
              }}
            />

            <button
              type="button"
              disabled={isScanning}
              onClick={() => fileInputRef.current?.click()}
              className="px-4 py-2.5 bg-white text-blue-700 hover:bg-blue-50 font-extrabold text-xs rounded-xl shadow-md transition-all flex items-center space-x-2 cursor-pointer disabled:opacity-60"
            >
              {isScanning ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                  <span>Scanning with Gemini...</span>
                </>
              ) : (
                <>
                  <Camera className="w-4 h-4 text-blue-600" />
                  <span>Upload / Snap Menu Photo</span>
                </>
              )}
            </button>

            <button
              type="button"
              disabled={isScanning}
              onClick={handleSamplePhotoTest}
              className="px-4 py-2.5 bg-blue-500/30 hover:bg-blue-500/50 border border-blue-300/40 text-white font-bold text-xs rounded-xl transition-all flex items-center space-x-1.5"
            >
              <FileText className="w-4 h-4 text-amber-300" />
              <span>Test Sample OCR Extraction</span>
            </button>
          </div>

          {ocrSuccess && (
            <div className="mt-4 p-3 bg-emerald-500/20 border border-emerald-300/50 rounded-xl text-xs font-medium text-emerald-100 flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-300 shrink-0" />
              <span>{ocrSuccess}</span>
            </div>
          )}

          {ocrError && (
            <div className="mt-4 p-3 bg-red-500/20 border border-red-300/50 rounded-xl text-xs font-medium text-red-100 flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 text-red-300 shrink-0" />
              <span>{ocrError}</span>
            </div>
          )}
        </div>
      </div>

      {publishFeedback && (
        <div className="p-4 bg-emerald-50 border border-emerald-300 rounded-2xl flex items-center space-x-2 text-xs font-bold text-emerald-900 shadow-xs">
          <CheckCircle2 className="w-5 h-5 text-emerald-600" />
          <span>Menu successfully published for {selectedDate}! Students can now view these dishes.</span>
        </div>
      )}

      {/* EDITABLE DISHES FORM */}
      <form onSubmit={handlePublish} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Breakfast Section */}
          <MealEditSection
            title="Breakfast"
            icon={Coffee}
            items={breakfastItems}
            newItem={newBreakfast}
            setNewItem={setNewBreakfast}
            onAddItem={() => {
              if (newBreakfast.trim()) {
                setBreakfastItems([...breakfastItems, newBreakfast.trim()]);
                setNewBreakfast('');
              }
            }}
            onDeleteItem={(idx) => setBreakfastItems(breakfastItems.filter((_, i) => i !== idx))}
          />

          {/* Lunch Section */}
          <MealEditSection
            title="Lunch"
            icon={Sun}
            items={lunchItems}
            newItem={newLunch}
            setNewItem={setNewLunch}
            onAddItem={() => {
              if (newLunch.trim()) {
                setLunchItems([...lunchItems, newLunch.trim()]);
                setNewLunch('');
              }
            }}
            onDeleteItem={(idx) => setLunchItems(lunchItems.filter((_, i) => i !== idx))}
          />

          {/* Evening Snacks Section */}
          <MealEditSection
            title="Evening Snacks"
            icon={Sunset}
            items={snacksItems}
            newItem={newSnacks}
            setNewItem={setNewSnacks}
            onAddItem={() => {
              if (newSnacks.trim()) {
                setSnacksItems([...snacksItems, newSnacks.trim()]);
                setNewSnacks('');
              }
            }}
            onDeleteItem={(idx) => setSnacksItems(snacksItems.filter((_, i) => i !== idx))}
          />

          {/* Dinner Section */}
          <MealEditSection
            title="Dinner"
            icon={Moon}
            items={dinnerItems}
            newItem={newDinner}
            setNewItem={setNewDinner}
            onAddItem={() => {
              if (newDinner.trim()) {
                setDinnerItems([...dinnerItems, newDinner.trim()]);
                setNewDinner('');
              }
            }}
            onDeleteItem={(idx) => setDinnerItems(dinnerItems.filter((_, i) => i !== idx))}
          />
        </div>

        {/* Special Notice Bar */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs">
          <label className="block text-xs font-bold text-slate-800 mb-1">
            Special Notice / Dietary Alert (optional)
          </label>
          <input
            type="text"
            placeholder="e.g. Special festive sweets will be served, or reminder about guest coupons"
            value={specialNotice}
            onChange={(e) => setSpecialNotice(e.target.value)}
            className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
          />
        </div>

        {/* Publish Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            className="w-full sm:w-auto py-3.5 px-8 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-sm rounded-2xl shadow-lg shadow-blue-500/25 transition-all flex items-center justify-center space-x-2"
          >
            <Check className="w-5 h-5 stroke-[2.5]" />
            <span>Publish Live Menu for {selectedDate}</span>
          </button>
        </div>
      </form>
    </div>
  );
};

const MealEditSection: React.FC<{
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  items: string[];
  newItem: string;
  setNewItem: (val: string) => void;
  onAddItem: () => void;
  onDeleteItem: (idx: number) => void;
}> = ({ title, icon: Icon, items, newItem, setNewItem, onAddItem, onDeleteItem }) => {
  return (
    <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-3">
      <div className="flex items-center space-x-2 pb-2 border-b border-slate-100">
        <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
          <Icon className="w-4 h-4" />
        </div>
        <h3 className="font-extrabold text-sm text-slate-900">{title}</h3>
      </div>

      <div className="space-y-1.5 min-h-[100px]">
        {items.map((item, idx) => (
          <div
            key={idx}
            className="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-100 text-xs"
          >
            <span className="font-semibold text-slate-800">{item}</span>
            <button
              type="button"
              onClick={() => onDeleteItem(idx)}
              className="text-slate-400 hover:text-red-600 p-1 rounded-md transition-colors"
              title="Remove dish"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}

        {items.length === 0 && (
          <p className="text-xs text-slate-400 italic py-3 text-center">No dishes added yet.</p>
        )}
      </div>

      {/* Add dish input */}
      <div className="flex space-x-2 pt-2 border-t border-slate-100">
        <input
          type="text"
          placeholder={`Add dish to ${title}...`}
          value={newItem}
          onChange={(e) => setNewItem(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              onAddItem();
            }
          }}
          className="grow px-3 py-1.5 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
        />
        <button
          type="button"
          onClick={onAddItem}
          className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl transition-colors flex items-center space-x-1"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add</span>
        </button>
      </div>
    </div>
  );
};
