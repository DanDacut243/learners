# ERUDITE QUICK START - TOP FEATURES IMPLEMENTATION

**Purpose:** Copy-paste ready code for implementing Phase 1 features  
**Target:** Get running features in 1-2 weeks  

---

## 📋 PHASE 1 QUICK START CHECKLIST

```
WEEK 1: LEARNING OUTCOMES + ANALYTICS
├─ Day 1: Database migrations
├─ Day 2: Laravel models & controllers
├─ Day 3: React components  
├─ Day 4: Integration testing
└─ Day 5: User testing & refinement

WEEK 2: MESSAGING + POLISH
├─ Day 1: Messaging database & models
├─ Day 2: Messaging API endpoints
├─ Day 3: React chat components
├─ Day 4: Integration testing
└─ Day 5: Production deployment
```

---

## 🔧 IMPLEMENTATION CHECKLIST

### Step 1: Create Database Migrations

```bash
# Run these commands in backend directory
cd backend

# Learning Outcomes Migration
cat > database/migrations/2026_04_28_create_learning_outcomes.php << 'EOF'
<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::create('learning_outcomes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('course_id')->constrained()->cascadeOnDelete();
            $table->string('title');
            $table->text('description');
            $table->enum('bloom_level', ['remember', 'understand', 'apply', 'analyze', 'evaluate', 'create']);
            $table->integer('order')->default(0);
            $table->timestamps();
            $table->index('course_id');
        });

        Schema::create('module_outcomes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('module_id')->constrained()->cascadeOnDelete();
            $table->foreignId('learning_outcome_id')->constrained()->cascadeOnDelete();
            $table->integer('weight')->default(50);
            $table->timestamps();
            $table->unique(['module_id', 'learning_outcome_id']);
        });

        Schema::create('student_competencies', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained();
            $table->foreignId('course_id')->constrained();
            $table->foreignId('learning_outcome_id')->constrained();
            $table->integer('mastery_level')->default(0);
            $table->integer('attempts')->default(0);
            $table->timestamp('last_assessed_at')->nullable();
            $table->timestamps();
            $table->unique(['user_id', 'course_id', 'learning_outcome_id']);
        });
    }

    public function down(): void {
        Schema::dropIfExists('student_competencies');
        Schema::dropIfExists('module_outcomes');
        Schema::dropIfExists('learning_outcomes');
    }
};
EOF

php artisan migrate
```

### Step 2: Create Laravel Models

```bash
# Create models with relationships
php artisan make:model LearningOutcome
php artisan make:model StudentCompetency
```

**File: `app/Models/LearningOutcome.php`**
```php
<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class LearningOutcome extends Model {
    protected $fillable = ['course_id', 'title', 'description', 'bloom_level', 'order'];

    public function course() {
        return $this->belongsTo(Course::class);
    }

    public function modules() {
        return $this->belongsToMany(Module::class, 'module_outcomes')
            ->withPivot('weight')
            ->withTimestamps();
    }

    public function studentCompetencies() {
        return $this->hasMany(StudentCompetency::class);
    }
}
```

**File: `app/Models/StudentCompetency.php`**
```php
<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class StudentCompetency extends Model {
    protected $fillable = ['user_id', 'course_id', 'learning_outcome_id', 'mastery_level', 'attempts'];

    public function user() {
        return $this->belongsTo(User::class);
    }

    public function course() {
        return $this->belongsTo(Course::class);
    }

    public function learningOutcome() {
        return $this->belongsTo(LearningOutcome::class);
    }
}
```

### Step 3: Create API Controller

**File: `app/Http/Controllers/Api/LearningOutcomeController.php`**
```php
<?php
namespace App\Http\Controllers\Api;

use App\Models\{Course, LearningOutcome, StudentCompetency};
use Illuminate\Http\Request;

class LearningOutcomeController {
    // Get all outcomes for a course
    public function index($courseId) {
        return response()->json(
            LearningOutcome::where('course_id', $courseId)
                ->orderBy('order')
                ->get()
        );
    }

    // Create learning outcome (instructor only)
    public function store(Request $request, $courseId) {
        $course = Course::findOrFail($courseId);
        
        if ($course->instructor_id !== $request->user()->id && $request->user()->role !== 'admin') {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'required|string',
            'bloom_level' => 'required|in:remember,understand,apply,analyze,evaluate,create',
        ]);

        $outcome = $course->learningOutcomes()->create($validated);
        return response()->json($outcome, 201);
    }

    // Get student competencies for course
    public function getStudentCompetencies($courseId) {
        $competencies = StudentCompetency::where('course_id', $courseId)
            ->where('user_id', auth()->id())
            ->with('learningOutcome')
            ->get();

        return response()->json([
            'competencies' => $competencies,
            'overall_mastery' => $competencies->avg('mastery_level') ?? 0,
            'competency_count' => $competencies->count(),
        ]);
    }

    // Update competency after quiz (called automatically)
    public function updateCompetency(Request $request, $outcomeId) {
        $outcome = LearningOutcome::findOrFail($outcomeId);
        
        $competency = StudentCompetency::firstOrCreate(
            [
                'user_id' => auth()->id(),
                'learning_outcome_id' => $outcomeId,
                'course_id' => $outcome->course_id,
            ],
            ['mastery_level' => 0]
        );

        $newScore = $request->input('score', 0); // 0-100
        $oldScore = $competency->mastery_level;

        // Exponential moving average: 70% new score, 30% old
        $competency->mastery_level = round(0.7 * $newScore + 0.3 * $oldScore);
        $competency->attempts++;
        $competency->last_assessed_at = now();
        $competency->save();

        return response()->json($competency);
    }
}
```

### Step 4: Add Routes

**File: `routes/api.php` (add these lines)**
```php
Route::middleware('auth:sanctum')->group(function () {
    // Learning Outcomes
    Route::get('/courses/{courseId}/learning-outcomes', [LearningOutcomeController::class, 'index']);
    Route::post('/courses/{courseId}/learning-outcomes', [LearningOutcomeController::class, 'store']);
    Route::get('/courses/{courseId}/student-competencies', [LearningOutcomeController::class, 'getStudentCompetencies']);
    Route::put('/learning-outcomes/{outcomeId}/update-competency', [LearningOutcomeController::class, 'updateCompetency']);
});
```

### Step 5: Create React Components

**File: `app/routes/instructor/learning-outcomes.tsx`**
```typescript
import { useState, useEffect } from 'react';
import { apiClient } from '~/services/api';
import { useParams } from 'react-router-dom';

interface LearningOutcome {
  id: number;
  title: string;
  description: string;
  bloom_level: string;
}

export default function LearningOutcomes() {
  const { courseId } = useParams();
  const [outcomes, setOutcomes] = useState<LearningOutcome[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', bloom_level: 'understand' });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchOutcomes();
  }, [courseId]);

  const fetchOutcomes = async () => {
    try {
      const res = await apiClient.get(`/courses/${courseId}/learning-outcomes`);
      setOutcomes(res.data);
    } catch (error) {
      console.error('Failed to fetch outcomes:', error);
    }
  };

  const handleAdd = async () => {
    setLoading(true);
    try {
      await apiClient.post(`/courses/${courseId}/learning-outcomes`, form);
      setForm({ title: '', description: '', bloom_level: 'understand' });
      setShowModal(false);
      fetchOutcomes();
    } catch (error) {
      console.error('Failed to create outcome:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Learning Outcomes</h2>
        <button 
          onClick={() => setShowModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          + Add Outcome
        </button>
      </div>

      <div className="grid gap-3">
        {outcomes.map(outcome => (
          <div key={outcome.id} className="border rounded-lg p-4 hover:shadow-md transition">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-bold text-lg">{outcome.title}</h3>
                <p className="text-gray-600 text-sm mt-1">{outcome.description}</p>
              </div>
              <span className="bg-blue-100 text-blue-800 text-xs px-3 py-1 rounded-full whitespace-nowrap">
                {outcome.bloom_level.charAt(0).toUpperCase() + outcome.bloom_level.slice(1)}
              </span>
            </div>
          </div>
        ))}
      </div>

      {outcomes.length === 0 && (
        <p className="text-gray-500 text-center py-8">No learning outcomes yet. Add one to get started!</p>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-xl font-bold mb-4">Add Learning Outcome</h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Title</label>
                <input
                  type="text"
                  placeholder="e.g., Students will understand..."
                  value={form.title}
                  onChange={(e) => setForm({...form, title: e.target.value})}
                  className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <textarea
                  placeholder="Describe what students should be able to do..."
                  value={form.description}
                  onChange={(e) => setForm({...form, description: e.target.value})}
                  className="w-full border rounded px-3 py-2 h-24 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Bloom's Level</label>
                <select 
                  value={form.bloom_level}
                  onChange={(e) => setForm({...form, bloom_level: e.target.value})}
                  className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="remember">Remember (Recall facts)</option>
                  <option value="understand">Understand (Explain ideas)</option>
                  <option value="apply">Apply (Use information)</option>
                  <option value="analyze">Analyze (Draw connections)</option>
                  <option value="evaluate">Evaluate (Justify decisions)</option>
                  <option value="create">Create (Produce new work)</option>
                </select>
              </div>
            </div>

            <div className="flex gap-2 mt-6">
              <button 
                onClick={handleAdd}
                disabled={loading || !form.title || !form.description}
                className="flex-1 bg-blue-600 text-white rounded py-2 hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? 'Creating...' : 'Create'}
              </button>
              <button 
                onClick={() => setShowModal(false)}
                className="flex-1 bg-gray-300 text-gray-800 rounded py-2 hover:bg-gray-400"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
```

**File: `app/routes/student/competencies.tsx`**
```typescript
import { useState, useEffect } from 'react';
import { apiClient } from '~/services/api';
import { useParams } from 'react-router-dom';

interface Competency {
  id: number;
  learning_outcome: { title: string };
  mastery_level: number;
  attempts: number;
}

export default function CompetenciesDashboard() {
  const { courseId } = useParams();
  const [data, setData] = useState<{ competencies: Competency[], overall_mastery: number } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCompetencies();
  }, [courseId]);

  const fetchCompetencies = async () => {
    try {
      const res = await apiClient.get(`/courses/${courseId}/student-competencies`);
      setData(res.data);
    } catch (error) {
      console.error('Failed to fetch competencies:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading competencies...</div>;
  }

  if (!data || data.competencies.length === 0) {
    return <div className="text-center py-8 text-gray-500">No competencies yet. Complete quizzes to start tracking!</div>;
  }

  const getMasteryLabel = (level: number) => {
    if (level >= 90) return 'Mastered';
    if (level >= 70) return 'Proficient';
    if (level >= 50) return 'Developing';
    return 'Beginning';
  };

  const getMasteryColor = (level: number) => {
    if (level >= 90) return 'bg-green-500';
    if (level >= 70) return 'bg-yellow-500';
    if (level >= 50) return 'bg-orange-500';
    return 'bg-red-500';
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Your Competencies</h2>
        <p className="text-gray-600">Track your progress across learning outcomes</p>
      </div>

      {/* Overall Progress */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-200">
        <p className="text-sm text-gray-600 mb-2">Overall Mastery</p>
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <div className="w-full bg-gray-200 rounded-full h-4">
              <div 
                className="h-4 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full"
                style={{ width: `${data.overall_mastery}%` }}
              />
            </div>
          </div>
          <span className="text-2xl font-bold text-blue-600">{Math.round(data.overall_mastery)}%</span>
        </div>
      </div>

      {/* Individual Competencies */}
      <div className="space-y-4">
        {data.competencies.map(comp => (
          <div key={comp.id} className="bg-white border rounded-lg p-4 hover:shadow-md transition">
            <div className="flex justify-between items-start mb-2">
              <div>
                <h3 className="font-semibold text-lg">{comp.learning_outcome.title}</h3>
                <p className="text-sm text-gray-500">Attempts: {comp.attempts}</p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-gray-800">{comp.mastery_level}%</p>
                <p className={`text-xs font-semibold ${
                  comp.mastery_level >= 70 ? 'text-green-600' :
                  comp.mastery_level >= 50 ? 'text-orange-600' :
                  'text-red-600'
                }`}>
                  {getMasteryLabel(comp.mastery_level)}
                </p>
              </div>
            </div>

            <div className="w-full bg-gray-200 rounded-full h-3">
              <div 
                className={`h-3 rounded-full ${getMasteryColor(comp.mastery_level)}`}
                style={{ width: `${comp.mastery_level}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
```

---

## 🚀 DEPLOYMENT CHECKLIST

```bash
# 1. Run migrations
cd backend
php artisan migrate

# 2. Test endpoints
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:8000/api/courses/1/learning-outcomes

# 3. Build frontend
cd frontend
npm run build

# 4. Verify no errors
npm run type-check

# 5. Deploy to Vercel
git push  # Auto-deploys
```

---

## ✅ VERIFICATION CHECKLIST

- [ ] All migrations run without errors
- [ ] Models have correct relationships
- [ ] API endpoints return data
- [ ] React components compile without errors
- [ ] Students can view competencies
- [ ] Instructors can define outcomes
- [ ] Competencies update after quizzes
- [ ] All tests pass

---

## 📊 TESTING THE FEATURE

```typescript
// Test: Create learning outcome
POST /api/courses/1/learning-outcomes
{
  "title": "Understand database design",
  "description": "Students will understand relational databases",
  "bloom_level": "understand"
}

// Response: 201 Created
{
  "id": 1,
  "course_id": 1,
  "title": "Understand database design",
  "bloom_level": "understand",
  "order": 0,
  "created_at": "2026-04-28T..."
}

// Test: Get student competencies
GET /api/courses/1/student-competencies

// Response: 200 OK
{
  "competencies": [
    {
      "id": 1,
      "user_id": 5,
      "learning_outcome": {...},
      "mastery_level": 75,
      "attempts": 2,
      "last_assessed_at": "2026-04-28..."
    }
  ],
  "overall_mastery": 75
}
```

---

## 🎯 NEXT: Add to Your Sprint Board

1. **Day 1:** Create migrations & models
2. **Day 2:** Create API controller & routes
3. **Day 3:** Create React components
4. **Day 4:** Integration testing
5. **Day 5:** Polish & deploy

**Estimated Time:** 20-25 developer hours total

---

## 📞 TROUBLESHOOTING

### "Foreign key constraint fails"
```bash
# Ensure courses/modules exist first
# Or disable foreign key checks temporarily
SET FOREIGN_KEY_CHECKS = 0;
php artisan migrate;
SET FOREIGN_KEY_CHECKS = 1;
```

### "Cannot find module '@tiptap/react'"
```bash
# Install TipTap for rich editor (Week 2)
npm install @tiptap/react @tiptap/starter-kit
```

### "Competencies not updating"
Check that quiz grading calls the update endpoint:
```php
// In QuizResultController
$quizResult->save();

// Call competency update for each outcome linked to module
foreach ($module->learningOutcomes as $outcome) {
    $request->user()->post("/learning-outcomes/{$outcome->id}/update-competency", [
        'score' => $score
    ]);
}
```

---

**You're ready to build! Start with Day 1 of the implementation. Questions? Check FEATURE_IMPLEMENTATION_GUIDE.md for detailed explanations.** 🚀
