<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('train_structures', function (Blueprint $table) {
            $table->id();
            $table->foreignId('train_details_id')->constrained('train_details')->nullable();
            $table->tinyInteger('gen')->nullable();
            $table->tinyInteger('2s')->nullable();
            $table->tinyInteger('sl')->nullable();
            $table->tinyInteger('cc')->nullable();
            $table->tinyInteger('ec')->nullable();
            $table->tinyInteger('3a')->nullable();
            $table->tinyInteger('2a')->nullable();
            $table->tinyInteger('1a')->nullable();
            $table->tinyInteger('3e')->nullable();        
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('train_structures');
    }
};
