import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Trash2, User, Plus, Edit3 } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import Header from "@/components/header";
import type { Profile } from "@shared/schema";

export default function ProfilePage() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [editingProfile, setEditingProfile] = useState<Profile | null>(null);
  const [editName, setEditName] = useState("");
  const [editDescription, setEditDescription] = useState("");

  // Fetch user profiles
  const { data: profiles = [], isLoading: profilesLoading } = useQuery<Profile[]>({
    queryKey: ["/api/profiles"],
    enabled: isAuthenticated,
  });

  // Create profile mutation
  const createProfile = useMutation({
    mutationFn: async ({ name, description }: { name: string; description: string }) => {
      const response = await fetch("/api/profiles", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ name, description }),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to create profile");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/profiles"] });
      setIsCreateOpen(false);
      setName("");
      setDescription("");
      toast({
        title: "Profile created",
        description: "Your profile has been saved successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to create profile",
        description: error.message || "Please try again.",
        variant: "destructive",
      });
    },
  });

  // Edit profile mutation
  const editProfile = useMutation({
    mutationFn: async ({ profileId, name, description }: { profileId: string; name: string; description: string }) => {
      const response = await fetch(`/api/profiles/${profileId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ name, description }),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to update profile");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/profiles"] });
      setEditingProfile(null);
      setEditName("");
      setEditDescription("");
      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to update profile",
        description: error.message || "Please try again.",
        variant: "destructive",
      });
    },
  });

  // Delete profile mutation
  const deleteProfile = useMutation({
    mutationFn: async (profileId: string) => {
      const response = await fetch(`/api/profiles/${profileId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to delete profile");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/profiles"] });
      toast({
        title: "Profile deleted",
        description: "The profile has been removed.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to delete profile",
        description: error.message || "Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleCreateProfile = () => {
    if (name.trim() && description.trim()) {
      createProfile.mutate({ name, description });
    }
  };

  const handleEditProfile = (profile: Profile) => {
    setEditingProfile(profile);
    setEditName(profile.name);
    setEditDescription(profile.description);
  };

  const handleSaveEdit = () => {
    if (editingProfile && editName.trim() && editDescription.trim()) {
      editProfile.mutate({
        profileId: editingProfile.id,
        name: editName,
        description: editDescription,
      });
    }
  };

  if (authLoading || profilesLoading) {
    return (
      <div className="min-h-screen bg-background">
        {isMobile && <Header currentPage="profile" />}
        <div className="flex items-center justify-center h-[60vh]">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading profiles...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background">
        {isMobile && <Header currentPage="profile" />}
        <div className="flex items-center justify-center h-[60vh]">
          <Card className="max-w-md">
            <CardHeader>
              <CardTitle>Sign in required</CardTitle>
              <CardDescription>
                Please sign in to create and manage your profiles.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={() => window.location.href = '/api/login'} className="w-full" data-testid="button-signin">
                Sign In
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {isMobile && <Header currentPage="profile" />}
      
      <div className={`${isMobile ? 'px-4 py-4' : ''}`}>
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">My Profiles</h1>
          <p className="text-muted-foreground">
            Create profiles to get personalized action plans from video insights
          </p>
        </div>

        {/* Create Profile Button and Dialog */}
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button className="mb-6" data-testid="button-create-profile">
              <Plus className="w-4 h-4 mr-2" />
              Create Profile
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Create New Profile</DialogTitle>
              <DialogDescription>
                Describe yourself to get personalized recommendations
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="profile-name">Profile Name</Label>
                <Input
                  id="profile-name"
                  placeholder="Webflow Freelancer"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full"
                  data-testid="input-profile-name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="profile-description">Description</Label>
                <Textarea
                  id="profile-description"
                  placeholder="I'm a Webflow freelancer with 2 years of experience, focusing on small business clients. I want to scale my business and improve my pricing strategy."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={6}
                  className="resize-none"
                  data-testid="textarea-profile-description"
                />
              </div>
              <div className="flex justify-end space-x-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsCreateOpen(false);
                    setName("");
                    setDescription("");
                  }}
                  data-testid="button-cancel"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleCreateProfile}
                  disabled={!name.trim() || !description.trim() || createProfile.isPending}
                  data-testid="button-save-profile"
                >
                  {createProfile.isPending ? "Creating..." : "Save Profile"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Edit Profile Dialog */}
        <Dialog open={!!editingProfile} onOpenChange={() => setEditingProfile(null)}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Edit Profile</DialogTitle>
              <DialogDescription>
                Update your profile description
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="edit-profile-name">Profile Name</Label>
                <Input
                  id="edit-profile-name"
                  placeholder="Webflow Freelancer"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full"
                  data-testid="input-edit-profile-name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-profile-description">Description</Label>
                <Textarea
                  id="edit-profile-description"
                  placeholder="I'm a Webflow freelancer with 2 years of experience, focusing on small business clients. I want to scale my business and improve my pricing strategy."
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  rows={6}
                  className="resize-none"
                  data-testid="textarea-edit-description"
                />
              </div>
              <div className="flex justify-end space-x-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setEditingProfile(null);
                    setEditName("");
                    setEditDescription("");
                  }}
                  data-testid="button-cancel-edit"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSaveEdit}
                  disabled={!editName.trim() || !editDescription.trim() || editProfile.isPending}
                  data-testid="button-save-edit"
                >
                  {editProfile.isPending ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Profiles List */}
        {profiles.length === 0 ? (
          <Card>
            <CardContent className="py-12">
              <div className="text-center">
                <User className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No profiles yet</h3>
                <p className="text-muted-foreground mb-4">
                  Create your first profile to get personalized action plans
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {profiles.map((profile: Profile) => (
              <Card key={profile.id} data-testid={`card-profile-${profile.id}`}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <CardTitle className="text-lg">{profile.name}</CardTitle>
                      <CardDescription className="text-xs mt-1">
                        Created {new Date(profile.createdAt!).toLocaleDateString()}
                      </CardDescription>
                    </div>
                    <div className="flex space-x-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditProfile(profile)}
                        data-testid={`button-edit-${profile.id}`}
                      >
                        <Edit3 className="w-4 h-4 text-muted-foreground" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteProfile.mutate(profile.id)}
                        disabled={deleteProfile.isPending}
                        data-testid={`button-delete-${profile.id}`}
                      >
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground line-clamp-3">
                    {profile.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}