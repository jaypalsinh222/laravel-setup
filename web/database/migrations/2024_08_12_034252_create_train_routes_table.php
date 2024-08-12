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
        Schema::create('train_routes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('train_details_id')->constrained('train_details')->nullable();
            $table->string('name')->nullable();
            $table->string('from')->nullable();
            $table->string('destination')->nullable();
            $table->string('stations')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('train_routes');
    }
};
