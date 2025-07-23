<?php

namespace App\Http\Controllers;

use App\Models\Friend;
use App\Models\User;
use GrahamCampbell\ResultType\Success;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class FriendController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {

        $friends = Friend::with(['sender', 'receiver'])
            ->where(function ($query) {
                $query->where('sender_id', Auth::id())
                    ->orWhere('receiver_id', Auth::id());
            })
            ->get();

        return Inertia::render('friends', [
            'friends' => $friends,
            'results' => $this->friendRequests(),
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     */


    public function checkExistingrequest($senderId, $receiverId)
    {


        $existing = Friend::where(function ($query) use ($senderId, $receiverId) {
            $query->where('sender_id', $senderId)
                ->where('receiver_id', $receiverId);
        })->orWhere(function ($query) use ($senderId, $receiverId) {
            $query->where('sender_id', $receiverId)
                ->where('receiver_id', $senderId);
        })->first();

        return $existing;
    }
    public function store(Request $request)
    {

        $request->validate([
            'user_id' => 'required|exists:users,id',
        ], [
            'user_id.required' => 'Please select a user.',
            'user_id.exists' => 'The selected user does not exist.',
        ]);
        $senderId = Auth::id();
        $receiverId = $request->user_id;
        $existing = $this->checkExistingrequest($senderId, $receiverId);
        
        if ($existing) {
            return back()->with('error', 'Friend request already exists');
        }

        Friend::create([
            'sender_id' =>  $senderId,
            'receiver_id' => $receiverId,
            'is_accepted' => false
        ]);
        return back()->with('success', 'Request sent successfully');
    }

    /**
     * Display the specified resource.
     */
    public function show()
    {
        $username = request('name');
        $userid = request('user_id');

        $logid = request('logid');
        $sentRequests = Friend::where('sender_id', $userid)
            ->where('is_accepted', false)
            ->count();

        $receivedRequests = Friend::where('receiver_id', $userid)
            ->where('is_accepted', false)
            ->count();

        $friends = Friend::where(function ($query) use ($userid) {
            $query->where('receiver_id', $userid)
                ->orWhere('sender_id', $userid);
        })
            ->where('is_accepted', true)
            ->count();
        $existing = $this->checkExistingrequest($logid, $userid);
        $is_friend =false;
        $has_received = false;
        if ($existing){
            $is_friend = $existing->is_accepted;
          
            $has_received = $existing->receiver_id == $logid;
        }
          Log::info($is_friend);
        return Inertia::render('UserProfile', [
            'reqid'=>  $existing? $existing->id : 1,
            'id' => $userid,
            'name' => $username,
            'sent' => $sentRequests,
            'received' => $receivedRequests,
            'friends' => $friends,
            'existing' => $existing ? true : false,
            'is_friend' => $is_friend,
            'has_received'=> $has_received
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Friend $friend)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Friend $friend)
    {
        //
        if ($friend->sender_id == Auth::id() || $friend->receiver_id == Auth::id()) {
            $friend->is_accepted = true;
            $friend->save();
            $user = $this->getFriend($friend);
            return back()->with('success', 'You are now friends with ' . $user->name);
        }


        return redirect()->route('friends.index')->with('error', 'Action Not Allowed');
    }

    /**
     * Remove the specified resource from storage.
     */

    public function destroy(Friend $friend, Request $request)
    {
        if ($friend->sender_id !== Auth::id() && $friend->receiver_id !== Auth::id()) {
            return redirect()
                ->route('friends.index')
                ->with('error', 'Action Not Allowed');
        }
        if (!$friend){
            return redirect()
                ->route('friends.index')
                ->with('error', 'Request Not Found');
        }
        $user = FriendController::getFriend($friend);
        $friend->delete();

        $action = $request->input('action', 'deleted');
        $messages = [
            'delete' => 'Removed: ' . $user->name,
            'withdraw' => 'Withdrawn',
            'reject' => 'Request rejected'
        ];

        return redirect()
            ->route('friends.index')
            ->with('success', $messages[$action] ?? 'Removed: ' . $user->name);
    }

    public  function getFriend(Friend $friend)
    {

        if ($friend->sender_id !== Auth::id()) {

            $userid = $friend->sender_id;
        }
        if ($friend->receiver_id !== Auth::id()) {

            $userid = $friend->receiver_id;
        }


        $user = User::where('id', $userid)->first();
        return $user;
    }

    public function search(Request $request)
    {

        return Inertia::render('friends', [
            'results' => $this->getUsers($request),
            'friends' => $this->friendRequests()
        ]);
    }

    public function getUsers(Request $request)
    {
        $query = $request->query('query');
        return User::where('id', '!=', Auth::id())
            ->where('name', 'like', '%' . $query . '%')
            ->whereDoesntHave('sentFriendRequests')
            ->whereDoesntHave('receivedFriendRequests')
            ->get();
    }
    public function friendRequests()
    {
        return Friend::with(['sender', 'receiver'])
            ->where(function ($query) {
                $query->where('sender_id', Auth::id())
                    ->orWhere('receiver_id', Auth::id());
            })->get();
    }
}
