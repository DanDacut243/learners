<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class StudentCompetency extends Model
{
    protected $fillable = ['user_id', 'course_id', 'learning_outcome_id', 'mastery_level', 'attempts'];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function course()
    {
        return $this->belongsTo(Course::class);
    }

    public function learningOutcome()
    {
        return $this->belongsTo(LearningOutcome::class);
    }
}
