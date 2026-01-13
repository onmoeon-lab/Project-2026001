
import React, { useState, useEffect } from 'react';
import { DossierInput } from './components/DossierInput';
import { Login } from './components/Login';
import { AdminDashboard } from './components/AdminDashboard';
import { 
  DossierProfile, 
  INITIAL_DOSSIER, 
  EnhancementType, 
  DEFAULT_AI_CONFIG, 
  AppSettings, 
  User,
  DEFAULT_USERS
} from './types';
import { generateDossierDocx } from './services/docxService';
import { FileDown, Sprout, LayoutTemplate, User as UserIcon, Quote, GraduationCap, PenTool, LogOut, Loader2 } from 'lucide-react';

export const App: React.FC = () => {
  // --- Global App Settings (Simulated Persistence) ---
  const [appSettings, setAppSettings] = useState<AppSettings>(() => {
    // In a real app, this would come from an API or LocalStorage
    const saved = localStorage.getItem('adra_app_settings');
    let loadedSettings: AppSettings | null = null;
    
    if (saved) {
        try {
            loadedSettings = JSON.parse(saved);
        } catch(e) { 
            console.error("Failed to parse settings", e);
        }
    }

    // Safety check: ensure loaded config has the new keys. 
    // If we changed Enums, old localStorage data might miss 'CHILD_NARRATIVE'.
    const hasValidAiConfig = loadedSettings?.aiConfig && 
                             loadedSettings.aiConfig[EnhancementType.CHILD_NARRATIVE] &&
                             loadedSettings.aiConfig[EnhancementType.TEACHER_EVALUATION];

    if (loadedSettings && hasValidAiConfig) {
        return loadedSettings;
    }

    // Fallback: merge existing users/defaults but reset AI Config to new structure
    return {
        aiConfig: DEFAULT_AI_CONFIG,
        defaultDossierValues: loadedSettings?.defaultDossierValues || {
            schoolName: 'Tongi Children Education Program',
            donorAgency: 'ADRA Czech',
            academicYear: '2025',
            sponsorshipCategory: 'Day',
        },
        users: loadedSettings?.users || DEFAULT_USERS
    };
  });

  // Save settings when they change
  useEffect(() => {
    localStorage.setItem('adra_app_settings', JSON.stringify(appSettings));
  }, [appSettings]);


  // --- Authentication State ---
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loginError, setLoginError] = useState<string>('');
  
  // --- Navigation State ---
  // If admin logs in, they see Dashboard. If they click "Open Builder", this becomes 'BUILDER'.
  // If user logs in, this is always 'BUILDER'.
  const [view, setView] = useState<'LOGIN' | 'DASHBOARD' | 'BUILDER'>('LOGIN');

  // --- Builder Data State ---
  const [data, setData] = useState<DossierProfile>(INITIAL_DOSSIER);
  
  // --- UI State ---
  const [isGenerating, setIsGenerating] = useState(false);

  // --- Auth Handlers ---
  const handleLogin = (u: string, p: string) => {
    const user = appSettings.users.find(usr => usr.username === u && usr.password === p);
    if (user) {
        setCurrentUser(user);
        setLoginError('');
        
        // Initialize builder with defaults
        setData(prev => ({
            ...prev,
            ...appSettings.defaultDossierValues,
            // Override preparedBy with the logged-in user's actual Name
            preparedBy: user.name,
            // Ensure prepared date is set if not default
            preparedDate: appSettings.defaultDossierValues.preparedDate || new Date().toLocaleDateString('en-GB').replace(/\//g, '.')
        }));

        if (user.role === 'ADMIN') {
            setView('DASHBOARD');
        } else {
            setView('BUILDER');
        }
    } else {
        setLoginError('Invalid credentials');
    }
  };

  const handleLogout = () => {
      setCurrentUser(null);
      setView('LOGIN');
      setData(INITIAL_DOSSIER); // Reset form
  };

  // --- Builder Handlers ---
  const updateField = (field: keyof DossierProfile, value: string) => {
    setData(prev => ({ ...prev, [field]: value }));
  };

  const handleExport = async () => {
    setIsGenerating(true);
    try {
        // Small delay to allow UI to render the loader even if operation is fast
        await new Promise(resolve => setTimeout(resolve, 500));
        await generateDossierDocx(data);
    } catch (error) {
        console.error("Export failed", error);
        alert("Failed to generate document. Please try again.");
    } finally {
        setIsGenerating(false);
    }
  };

  const childContext = `Child Name: ${data.childName}, Age/Grade: ${data.grade}, Aim: ${data.aimInLife}`;

  // --- Render Logic ---

  if (view === 'LOGIN') {
      return <Login onLogin={handleLogin} error={loginError} />;
  }

  if (view === 'DASHBOARD' && currentUser?.role === 'ADMIN') {
      return (
          <AdminDashboard 
            settings={appSettings}
            onUpdateSettings={setAppSettings}
            onLogout={handleLogout}
            onOpenBuilder={() => setView('BUILDER')}
          />
      );
  }

  // --- BUILDER VIEW ---
  return (
    <div className="min-h-screen bg-slate-50 py-6 px-4 sm:px-6 lg:px-8 relative">
      
      {/* Loading Overlay */}
      {isGenerating && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
            <div className="bg-white p-8 rounded-xl shadow-2xl flex flex-col items-center animate-in fade-in zoom-in duration-200 max-w-sm w-full mx-4">
                <Loader2 className="w-12 h-12 text-green-600 animate-spin mb-4" />
                <h3 className="text-lg font-bold text-slate-900">Generating Report</h3>
                <p className="text-slate-500 text-sm mt-2 text-center">Fetching assets and compiling your document. This may take a moment...</p>
            </div>
        </div>
      )}

      {/* Top Navigation / Action Bar */}
      <div className="max-w-[1600px] mx-auto mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="bg-green-700 p-2 rounded-md text-white shadow-lg">
            <Sprout className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">ADRA Report Builder</h1>
            <p className="text-sm text-slate-500">
                Logged in as <span className="font-semibold">{currentUser?.name || currentUser?.username}</span>
                {currentUser?.role === 'ADMIN' && <span className="ml-2 px-2 py-0.5 bg-purple-100 text-purple-700 text-xs rounded-full">Admin Mode</span>}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          {currentUser?.role === 'ADMIN' && (
             <button
                onClick={() => setView('DASHBOARD')}
                className="text-slate-600 hover:text-slate-900 px-3 py-2 text-sm font-medium transition-colors"
            >
                Back to Dashboard
            </button>
          )}
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 text-red-600 hover:text-red-700 px-3 py-2 text-sm font-medium transition-colors border border-transparent hover:bg-red-50 rounded"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
          <button
            onClick={handleExport}
            disabled={isGenerating}
            className={`flex items-center justify-center gap-2 bg-green-700 hover:bg-green-800 text-white px-5 py-2.5 rounded shadow-sm transition-all font-medium text-sm ${isGenerating ? 'opacity-70 cursor-wait' : ''}`}
          >
            <FileDown className="w-4 h-4" />
            {isGenerating ? 'Exporting...' : 'Export Report (.docx)'}
          </button>
        </div>
      </div>

      {/* Main Split Layout: 50/50 */}
      <div className="max-w-[1600px] mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Left Column - Form Inputs */}
        <div className="space-y-6 h-full overflow-y-auto pr-2 pb-20">
          
          {/* Header Info */}
          <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
             <div className="bg-slate-50 px-6 py-3 border-b border-slate-100">
               <h2 className="text-xs font-bold text-green-700 uppercase tracking-wide">General Info</h2>
             </div>
             <div className="p-6">
                <DossierInput 
                  label="Name of School" 
                  value={data.schoolName} 
                  onChange={(v) => updateField('schoolName', v)}
                />
             </div>
          </div>

          {/* Child Bio Data */}
          <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
            <div className="bg-slate-50 px-6 py-3 border-b border-slate-100 flex items-center gap-2">
              <UserIcon className="w-4 h-4 text-green-600" />
              <h2 className="text-xs font-bold text-green-700 uppercase tracking-wide">Child Information</h2>
            </div>
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3">
              {/* Left Column Fields */}
              <div className="space-y-3">
                 <DossierInput label="Name of Child" value={data.childName} onChange={(v) => updateField('childName', v)} />
                 <DossierInput label="Date of Birth" value={data.dob} onChange={(v) => updateField('dob', v)} placeholder="DD/MM/YYYY" />
                 <DossierInput label="Sponsorship Category" value={data.sponsorshipCategory} onChange={(v) => updateField('sponsorshipCategory', v)} />
                 <div className="grid grid-cols-2 gap-2">
                    <DossierInput label="Gender" value={data.gender} onChange={(v) => updateField('gender', v)} />
                    <DossierInput label="Height (cm)" value={data.height} onChange={(v) => updateField('height', v)} />
                 </div>
                 <DossierInput label="Personality" value={data.personality} onChange={(v) => updateField('personality', v)} placeholder="e.g. Polite, Active" />
                 <DossierInput label="Father's Name" value={data.fathersName} onChange={(v) => updateField('fathersName', v)} />
                 <DossierInput label="Father's Status" value={data.fathersStatus} onChange={(v) => updateField('fathersStatus', v)} placeholder="e.g. Cook helper" />
                 <DossierInput label="Family Income Source" value={data.familyIncomeSource} onChange={(v) => updateField('familyIncomeSource', v)} />
              </div>

              {/* Right Column Fields */}
              <div className="space-y-3">
                 <DossierInput label="Aid No" value={data.aidNo} onChange={(v) => updateField('aidNo', v)} placeholder="AC-TON-XXXX" />
                 <DossierInput label="Donor Agency" value={data.donorAgency} onChange={(v) => updateField('donorAgency', v)} />
                 <DossierInput label="Aim in Life" value={data.aimInLife} onChange={(v) => updateField('aimInLife', v)} placeholder="e.g. Teacher, Doctor" />
                 <div className="grid grid-cols-2 gap-2">
                    <DossierInput label="Grade" value={data.grade} onChange={(v) => updateField('grade', v)} />
                    <DossierInput label="Weight (kg)" value={data.weight} onChange={(v) => updateField('weight', v)} />
                 </div>
                 <DossierInput label="Academic Year" value={data.academicYear} onChange={(v) => updateField('academicYear', v)} />
                 <DossierInput label="Mother's Name" value={data.mothersName} onChange={(v) => updateField('mothersName', v)} />
                 <DossierInput label="Mother's Status" value={data.mothersStatus} onChange={(v) => updateField('mothersStatus', v)} placeholder="e.g. Housewife" />
                 <DossierInput label="Monthly Income (BDT)" value={data.monthlyIncome} onChange={(v) => updateField('monthlyIncome', v)} />
              </div>
            </div>
          </div>

          {/* Descriptive Sections */}
          <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
             <div className="bg-slate-50 px-6 py-3 border-b border-slate-100 flex items-center gap-2">
              <Quote className="w-4 h-4 text-green-600" />
              <h2 className="text-xs font-bold text-green-700 uppercase tracking-wide">Child's Narrative</h2>
            </div>
            <div className="p-6 space-y-4">
              <DossierInput 
                label="Write about yourself and your future" 
                value={data.aboutSelfAndFuture} 
                onChange={(v) => updateField('aboutSelfAndFuture', v)}
                type="textarea"
                enableAI={true}
                aiConfig={appSettings.aiConfig[EnhancementType.CHILD_NARRATIVE]}
                context={childContext}
                placeholder="My name is... I want to become..."
              />
              
              <DossierInput 
                label="Brief description about your home in the village and surroundings" 
                value={data.homeDescription} 
                onChange={(v) => updateField('homeDescription', v)}
                type="textarea"
                enableAI={true}
                aiConfig={appSettings.aiConfig[EnhancementType.CHILD_NARRATIVE]}
                context={childContext}
                placeholder="I live with my parents in..."
              />

              <DossierInput 
                label="Short description of your school and study environment" 
                value={data.schoolDescription} 
                onChange={(v) => updateField('schoolDescription', v)}
                type="textarea"
                enableAI={true}
                aiConfig={appSettings.aiConfig[EnhancementType.CHILD_NARRATIVE]}
                context={childContext}
                placeholder="My school has a big playground..."
              />

              <DossierInput 
                label="What interesting story/experience has happened in your life/family?" 
                value={data.interestingStory} 
                onChange={(v) => updateField('interestingStory', v)}
                type="textarea"
                enableAI={true}
                aiConfig={appSettings.aiConfig[EnhancementType.CHILD_NARRATIVE]}
                context={childContext}
                placeholder="One interesting experience..."
              />
            </div>
          </div>

           <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
             <div className="bg-slate-50 px-6 py-3 border-b border-slate-100 flex items-center gap-2">
              <GraduationCap className="w-4 h-4 text-green-600" />
              <h2 className="text-xs font-bold text-green-700 uppercase tracking-wide">Teacher's Evaluation</h2>
            </div>
            <div className="p-6">
              <DossierInput 
                label="Teacher's remarks about the child" 
                value={data.teachersRemarks} 
                onChange={(v) => updateField('teachersRemarks', v)}
                type="textarea"
                enableAI={true}
                aiConfig={appSettings.aiConfig[EnhancementType.TEACHER_EVALUATION]}
                context={childContext}
                placeholder="He/She is a polite student..."
              />
            </div>
          </div>

          {/* Footer Info */}
          <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
             <div className="bg-slate-50 px-6 py-3 border-b border-slate-100 flex items-center gap-2">
              <PenTool className="w-4 h-4 text-green-600" />
              <h2 className="text-xs font-bold text-green-700 uppercase tracking-wide">Signatories</h2>
            </div>
             <div className="p-6 grid grid-cols-2 gap-8">
                <DossierInput 
                  label="Prepared By" 
                  value={data.preparedBy} 
                  onChange={(v) => updateField('preparedBy', v)}
                />
                 <DossierInput 
                  label="Prepared Date" 
                  value={data.preparedDate} 
                  onChange={(v) => updateField('preparedDate', v)}
                />
             </div>
          </div>

        </div>

        {/* Right Column - Live Preview */}
        <div className="space-y-6">
          <div className="sticky top-6">
            <div className="bg-white rounded-lg shadow-lg border border-slate-200 p-6">
              <div className="flex items-center gap-2 mb-4 text-slate-900">
                <LayoutTemplate className="w-5 h-5 text-green-700" />
                <h3 className="font-bold">Live Preview</h3>
              </div>
              
              <div className="bg-white border border-slate-200 p-6 rounded-sm text-[10px] leading-snug font-serif text-black h-[85vh] overflow-y-auto shadow-inner relative">
                {/* Simulated ADRA Document View */}
                
                <div className="text-center mb-4">
                  <div className="flex items-center justify-center gap-3 mb-1">
                    <img 
                      src="https://adra.org.nz/wp-content/uploads/2021/08/ADRA-Horizontal-Logo.png" 
                      alt="ADRA Logo" 
                      className="h-10 w-auto object-contain"
                    />
                    <div className="text-[10px] font-bold text-slate-800">
                      Adventist Development and Relief Agency Bangladesh
                    </div>
                  </div>
                  <h4 className="font-bold text-sm mt-3">Child Annual Progress Report (APR) 2025</h4>
                </div>

                <div className="mb-4 font-bold">
                  Name of School: <span className="font-normal">{data.schoolName}</span>
                </div>

                <div className="flex gap-2 mb-6">
                  {/* Left Col */}
                  <div className="w-[45%] space-y-1">
                    <p><strong>Name of Child:</strong> {data.childName}</p>
                    <p><strong>Date of Birth:</strong> {data.dob}</p>
                    <p><strong>Sponsorship Category:</strong> {data.sponsorshipCategory}</p>
                    <p><strong>Gender:</strong> {data.gender}</p>
                    <p><strong>Height:</strong> {data.height} cm</p>
                    <p><strong>Personality:</strong> {data.personality}</p>
                    <p><strong>Father's Name:</strong> {data.fathersName}</p>
                    <p><strong>Father's Status:</strong> {data.fathersStatus}</p>
                    <p><strong>Income Source:</strong> {data.familyIncomeSource}</p>
                  </div>
                   {/* Middle Col */}
                   <div className="w-[45%] space-y-1">
                    <p><strong>Aid No:</strong> {data.aidNo}</p>
                    <p><strong>Donor Agency:</strong> {data.donorAgency}</p>
                    <p><strong>Aim in Life:</strong> {data.aimInLife}</p>
                    <p><strong>Grade:</strong> {data.grade}</p>
                    <p><strong>Weight:</strong> {data.weight} kg</p>
                    <p><strong>Academic Year:</strong> {data.academicYear}</p>
                    <p><strong>Mother's Name:</strong> {data.mothersName}</p>
                    <p><strong>Mother's Status:</strong> {data.mothersStatus}</p>
                    <p><strong>Income (BDT):</strong> {data.monthlyIncome}</p>
                  </div>
                   {/* Photo Box */}
                  <div className="w-[10%]">
                     <div className="border border-black h-24 w-full flex items-center justify-center text-[8px] text-gray-400">
                       Picture
                     </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <p className="font-bold">Write about yourself and your future:</p>
                    <p>{data.aboutSelfAndFuture}</p>
                  </div>
                  <div>
                    <p className="font-bold">Write a brief description about your home in the village and surroundings:</p>
                    <p>{data.homeDescription}</p>
                  </div>
                  <div>
                    <p className="font-bold">Give a short description of your school and of the study environment:</p>
                    <p>{data.schoolDescription}</p>
                  </div>
                  <div>
                    <p className="font-bold">What interesting story/experience has happened in your life/family?</p>
                    <p>{data.interestingStory}</p>
                  </div>
                   <div>
                    <p className="font-bold">Teacher's remarks about the child:</p>
                    <p>{data.teachersRemarks}</p>
                  </div>
                </div>

                <div className="mt-8 flex justify-between pt-4">
                  <p><strong>Prepared By:</strong> {data.preparedBy}</p>
                  <p><strong>Prepared Date:</strong> {data.preparedDate}</p>
                </div>

              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
