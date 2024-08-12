<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class TrainCoachDetail extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'train_coach_id',
        'seat_limit',
        'seat_type',
    ];
}
