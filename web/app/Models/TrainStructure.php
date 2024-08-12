<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class TrainStructure extends Model
{
    use HasFactory;

    protected $fillable = [
        'train_details_id',
        'gen',
        '2s',
        'sl',
        'cc',
        'ec',
        '3a',
        '2a',
        '1a',
        '3e',
    ];
}
