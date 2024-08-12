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
        Schema::create('train_coach_details', function (Blueprint $table) {
            $table->id();
            $table->foreignId('train_coach_id')->constrained('train_coach_types')->nullable();
            $table->integer('seat_limit')->nullable();
            $table->string('seat_type')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('train_coach_details');
    }
};
