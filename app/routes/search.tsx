import { useState, useEffect } from "react";
import { useToast } from "../components/shared/Toast";
import apiClient from "~/services/api";

export function meta() {
  return [{ title: "ERUDITE - Search" }];
}

export default function Search() {
  const { toast } = useToast();
  const [query, setQuery] = useState("");
  const [courses, setCourses] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchDone, setSearchDone] = useState(false);
  const [filter, setFilter] = useState("courses"); // courses or students

  async function handleSearch() {
    if (query.trim().length < 2) {
      toast("Enter at least 2 characters", "info");
      return;
    }

    try {
      setLoading(true);
      setSearchDone(false);

      if (filter === "courses") {
        const res = await apiClient.get(`/search/courses?q=${encodeURIComponent(query)}`);
        setCourses(res.data.data || res.data);
      } else {
        const res = await apiClient.get(`/search/students?q=${encodeURIComponent(query)}`);
        setStudents(res.data.data || res.data);
      }

      setSearchDone(true);
    } catch (error) {
      console.error('Search failed:', error);
      toast('Search failed', 'error');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <div className="mb-12">
        <h1 className="text-display-lg text-4xl font-extrabold text-primary tracking-tight mb-2">Search</h1>
        <p className="text-on-surface-variant font-body">Find courses and students across the platform.</p>
      </div>

      <div className="max-w-4xl mx-auto">
        {/* Search Bar */}
        <div className="bg-surface-container-lowest rounded-xl shadow-sm border border-slate-100 p-8 mb-8">
          <div className="flex gap-4">
            <div className="flex-1">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                placeholder="Search..."
                className="w-full px-6 py-4 bg-surface-container-low border-none rounded-lg text-sm outline-none focus:ring-2 focus:ring-secondary/50"
              />
            </div>
            <button
              onClick={handleSearch}
              disabled={loading}
              className="bg-primary text-white px-8 py-4 rounded-lg font-bold hover:bg-primary/90 transition-colors cursor-pointer disabled:opacity-50 flex items-center gap-2"
            >
              <span className="material-symbols-outlined">search</span>
              {loading ? 'Searching...' : 'Search'}
            </button>
          </div>

          {/* Filter Tabs */}
          <div className="flex gap-4 mt-6 border-t border-slate-100 pt-6">
            <button
              onClick={() => {
                setFilter('courses');
                setCourses([]);
                setStudents([]);
                setSearchDone(false);
              }}
              className={`px-4 py-2 text-sm font-bold rounded-lg transition-colors ${
                filter === 'courses'
                  ? 'bg-primary text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Courses
            </button>
            <button
              onClick={() => {
                setFilter('students');
                setCourses([]);
                setStudents([]);
                setSearchDone(false);
              }}
              className={`px-4 py-2 text-sm font-bold rounded-lg transition-colors ${
                filter === 'students'
                  ? 'bg-primary text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Students
            </button>
          </div>
        </div>

        {/* Results */}
        <div>
          {searchDone && filter === 'courses' && courses.length === 0 && (
            <div className="text-center py-12 text-slate-500">
              <p>No courses found matching "{query}"</p>
            </div>
          )}

          {filter === 'courses' && courses.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-primary mb-4">{courses.length} Courses Found</h3>
              {courses.map((course) => (
                <div key={course.id} className="bg-surface-container-lowest rounded-xl shadow-sm border border-slate-100 p-6 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="text-lg font-bold text-primary">{course.name}</h4>
                      <p className="text-sm text-slate-500 mt-1">{course.description}</p>
                      <div className="flex items-center gap-4 mt-4">
                        <span className={`text-xs font-bold px-3 py-1 rounded-full ${
                          course.status === 'active'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {course.status.charAt(0).toUpperCase() + course.status.slice(1)}
                        </span>
                        <span className="text-xs text-slate-500">
                          👥 {course.enrollments?.length || 0} students
                        </span>
                        <span className="text-xs text-slate-500">
                          📚 {course.modules?.length || 0} modules
                        </span>
                      </div>
                    </div>
                    <button className="bg-primary text-white px-6 py-2 rounded-lg text-sm font-bold hover:bg-primary/90 transition-colors cursor-pointer">
                      View Course
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {searchDone && filter === 'students' && students.length === 0 && (
            <div className="text-center py-12 text-slate-500">
              <p>No students found matching "{query}"</p>
            </div>
          )}

          {filter === 'students' && students.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-lg font-bold text-primary mb-4">{students.length} Students Found</h3>
              {students.map((student) => (
                <div key={student.id} className="bg-surface-container-lowest rounded-xl shadow-sm border border-slate-100 p-6 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 flex-1">
                      <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="material-symbols-outlined text-primary">person</span>
                      </div>
                      <div>
                        <div className="font-bold text-primary">{student.name}</div>
                        <div className="text-sm text-slate-500">{student.email}</div>
                      </div>
                    </div>
                    <span className="text-xs font-bold bg-blue-50 text-blue-600 px-3 py-1 rounded-full">
                      {student.role}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {!searchDone && query.length > 0 && (
            <div className="text-center py-12 text-slate-500">
              <p>Click Search to find results</p>
            </div>
          )}

          {!searchDone && query.length === 0 && (
            <div className="text-center py-12 text-slate-500">
              <p>Start typing to search...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
