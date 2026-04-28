<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class LearningOutcome extends Model
{
    protected $fillable = ['course_id', 'title', 'description', 'bloom_level', 'order'];

    public function course()
    {
        return $this->belongsTo(Course::class);
    }

    public function modules()
    {
        return $this->belongsToMany(Module::class, 'module_outcomes')
            ->withPivot('weight')
            ->withTimestamps();
    }

    public function studentCompetencies()
    {
        return $this->hasMany(StudentCompetency::class);
    }
}
