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
        Schema::create('train_details', function (Blueprint $table) {
            $table->id();
            $table->foreignId('train_type_id')->constrained('train_types')->nullable();
            $table->foreignId('train_running_type_id')->constrained('train_running_types')->nullable();
            $table->string('name')->nullable();
            $table->string('number')->nullable();
            $table->string('starting_place')->nullable();
            $table->string('ending_place')->nullable();
            $table->string('starting_time')->nullable();
            $table->string('ending_time')->nullable();
            $table->string('running_days')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('train_details');
    }
};
