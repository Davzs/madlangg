'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Card } from '@/components/ui/card';
import { toast } from 'sonner';

interface UserProfile {
  name: string;
  email: string;
  bio: string;
  profilePicture: string;
  level: number;
  experience: number;
  achievements: Array<{
    name: string;
    description: string;
    icon: string;
    earnedAt: string;
  }>;
}

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const [loading, setLoading] = useState(true);
  const [bio, setBio] = useState('');
  const [profilePicture, setProfilePicture] = useState('/default-avatar.png');
  const [isEditing, setIsEditing] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      if (status === 'loading') return;
      
      if (!session?.user?.email) {
        setLoading(false);
        return;
      }

      try {
        const res = await fetch('/api/profile');
        if (!res.ok) throw new Error('Failed to fetch profile');
        
        const data = await res.json();
        if (data.user) {
          setUserProfile(data.user);
          setBio(data.user.bio || '');
          setProfilePicture(data.user.profilePicture || '/default-avatar.png');
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
        toast.error('Failed to load profile');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [session, status]);

  const handleUpdateProfile = async () => {
    try {
      const res = await fetch('/api/profile/update', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bio, profilePicture }),
      });

      if (!res.ok) throw new Error('Failed to update profile');

      const data = await res.json();
      if (data.user) {
        setUserProfile(data.user);
        setBio(data.user.bio || '');
        setProfilePicture(data.user.profilePicture || '/default-avatar.png');
        setIsEditing(false);
        toast.success('Profile updated successfully');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
    }
  };

  if (status === 'loading' || loading) {
    return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
  }

  if (!session) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        Please sign in to view your profile
      </div>
    );
  }

  if (!userProfile) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        Error loading profile. Please try again later.
      </div>
    );
  }

  const experienceToNextLevel = Math.pow(userProfile.level, 1.5) * 100;
  const progressPercentage = (userProfile.experience / experienceToNextLevel) * 100;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto space-y-8">
        <div className="flex items-center space-x-4">
          <div className="relative w-24 h-24">
            <Image
              src={profilePicture}
              alt="Profile"
              fill
              className="rounded-full object-cover"
            />
          </div>
          <div>
            <h1 className="text-2xl font-bold">{userProfile.name}</h1>
            <p className="text-gray-500">{userProfile.email}</p>
          </div>
        </div>

        <Card className="p-6">
          <div className="space-y-4">
            <div>
              <h2 className="text-xl font-semibold mb-2">Level {userProfile.level}</h2>
              <Progress value={progressPercentage} className="w-full" />
              <p className="text-sm text-gray-500 mt-1">
                {userProfile.experience} / {experienceToNextLevel} XP to next level
              </p>
            </div>

            {isEditing ? (
              <>
                <div className="space-y-2">
                  <label className="block text-sm font-medium">Bio</label>
                  <Textarea
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    maxLength={500}
                    rows={4}
                    placeholder="Tell us about yourself..."
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-medium">Profile Picture URL</label>
                  <Input
                    type="text"
                    value={profilePicture}
                    onChange={(e) => setProfilePicture(e.target.value)}
                    placeholder="https://example.com/your-image.jpg"
                  />
                </div>
                <div className="flex space-x-2">
                  <Button onClick={handleUpdateProfile}>Save Changes</Button>
                  <Button variant="outline" onClick={() => setIsEditing(false)}>
                    Cancel
                  </Button>
                </div>
              </>
            ) : (
              <>
                <div>
                  <h3 className="font-medium mb-2">Bio</h3>
                  <p className="text-gray-600">{bio || 'No bio yet'}</p>
                </div>
                <Button onClick={() => setIsEditing(true)}>Edit Profile</Button>
              </>
            )}
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Achievements</h2>
          {userProfile.achievements && userProfile.achievements.length > 0 ? (
            <div className="grid grid-cols-2 gap-4">
              {userProfile.achievements.map((achievement) => (
                <div
                  key={achievement.name}
                  className="flex items-center space-x-3 p-3 rounded-lg bg-gray-50"
                >
                  <div className="w-10 h-10 flex items-center justify-center rounded-full bg-primary/10">
                    <span className="text-xl">{achievement.icon}</span>
                  </div>
                  <div>
                    <h3 className="font-medium">{achievement.name}</h3>
                    <p className="text-sm text-gray-500">{achievement.description}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">No achievements yet. Keep learning to earn badges!</p>
          )}
        </Card>
      </div>
    </div>
  );
}
