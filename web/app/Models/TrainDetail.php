<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class TrainDetail extends Model
{
    use HasFactory;

    protected $fillable = [
        'train_type_id',
        'name',
        'number',
        'starting_place',
        'ending_place',
        'starting_time',
        'ending_time',
    ];
}
