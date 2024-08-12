<?php

namespace App\Http\Controllers;

use App\Models\Station;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class StationController extends Controller
{
    public function getSuggetions(Request $request)
    {
        $stations = Station::where('name', 'like', '%' . $request->get('search') . '%')
            ->pluck('name')
            ->all();

        if (!empty($stations)) {
            return response()->json([
                "status" => 200,
                "message" => "stations list get successfully",
                "data" => $stations
            ]);
        } else {
            return response()->json([
                "status" => 404,
                "message" => "Please enter correct keyword for search station.",
                "data" => []
            ]);
        }
    }

    public function searchTrains(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'from_station' => 'required',
            'to_station' => 'required',
            'dateOfJourney' => 'required',
        ]);
        if ($validator->fails()) {
            return redirect()->back()
                ->withErrors($validator)
                ->withInput();
        }
        dd($request->all());
    }
}
