<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Assignment extends Model
{
    protected $fillable = [
        'module_id', 'course_id', 'title', 'description', 
        'instructions', 'due_date', 'points', 'rubric', 'allow_submissions'
    ];

    protected $casts = [
        'rubric' => 'array',
        'due_date' => 'datetime',
    ];

    public function module()
    {
        return $this->belongsTo(Module::class);
    }

    public function course()
    {
        return $this->belongsTo(Course::class);
    }

    public function submissions()
    {
        return $this->hasMany(Submission::class);
    }
}
