<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class TrainRunningType extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
    ];
}
