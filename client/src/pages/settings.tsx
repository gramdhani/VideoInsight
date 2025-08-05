import { useQuery, useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Settings, Plus, Edit, Trash2, Power, Info } from "lucide-react";
import type { PromptConfig, InsertPromptConfig } from "@shared/schema";

export default function SettingsPage() {
  const { toast } = useToast();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingConfig, setEditingConfig] = useState<PromptConfig | null>(null);

  // Query for all prompt configs
  const { data: configs, isLoading: isLoadingConfigs } = useQuery({
    queryKey: ["/api/admin/prompt-configs"],
  });

  // Query for active config
  const { data: activeConfig, isLoading: isLoadingActive } = useQuery<PromptConfig | null>({
    queryKey: ["/api/admin/prompt-configs/active"],
  });

  // Create config mutation
  const createConfigMutation = useMutation({
    mutationFn: async (data: InsertPromptConfig) => {
      const response = await fetch("/api/admin/prompt-configs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("Failed to create config");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/prompt-configs"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/prompt-configs/active"] });
      setIsCreateDialogOpen(false);
      toast({ title: "Prompt config created successfully" });
    },
    onError: (error: any) => {
      toast({
        title: "Error creating prompt config",
        description: error?.message || "Something went wrong",
        variant: "destructive",
      });
    },
  });

  // Update config mutation
  const updateConfigMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<InsertPromptConfig> }) => {
      const response = await fetch(`/api/admin/prompt-configs/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("Failed to update config");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/prompt-configs"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/prompt-configs/active"] });
      setEditingConfig(null);
      toast({ title: "Prompt config updated successfully" });
    },
    onError: (error: any) => {
      toast({
        title: "Error updating prompt config",
        description: error?.message || "Something went wrong",
        variant: "destructive",
      });
    },
  });

  // Delete config mutation
  const deleteConfigMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/admin/prompt-configs/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Failed to delete config");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/prompt-configs"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/prompt-configs/active"] });
      toast({ title: "Prompt config deleted successfully" });
    },
    onError: (error: any) => {
      toast({
        title: "Error deleting prompt config",
        description: error?.message || "Something went wrong",
        variant: "destructive",
      });
    },
  });

  // Activate config mutation
  const activateConfigMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/admin/prompt-configs/${id}/activate`, {
        method: "POST",
      });
      if (!response.ok) throw new Error("Failed to activate config");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/prompt-configs"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/prompt-configs/active"] });
      toast({ title: "Prompt config activated successfully" });
    },
    onError: (error: any) => {
      toast({
        title: "Error activating prompt config",
        description: error?.message || "Something went wrong",
        variant: "destructive",
      });
    },
  });

  const handleCreateConfig = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = {
      name: formData.get("name") as string,
      systemPrompt: formData.get("systemPrompt") as string,
      userPrompt: formData.get("userPrompt") as string,
      description: formData.get("description") as string,
      isActive: "false",
    };
    createConfigMutation.mutate(data);
  };

  const handleUpdateConfig = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editingConfig) return;
    
    const formData = new FormData(e.currentTarget);
    const data = {
      name: formData.get("name") as string,
      systemPrompt: formData.get("systemPrompt") as string,
      userPrompt: formData.get("userPrompt") as string,
      description: formData.get("description") as string,
    };
    updateConfigMutation.mutate({ id: editingConfig.id, data });
  };

  const availableVariables = [
    { name: "${context}", description: "Previous conversation history" },
    { name: "${transcript}", description: "Full video transcript with timestamps" },
    { name: "${videoDuration}", description: "Video duration (e.g., '16:59')" },
    { name: "${question}", description: "User's current question" },
    { name: "${title}", description: "Video title (only for system prompt)" },
  ];

  if (isLoadingConfigs || isLoadingActive) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center gap-3 mb-8">
          <Settings className="h-8 w-8 text-violet-600" />
          <h1 className="text-3xl font-bold">Admin Settings</h1>
        </div>
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="flex items-center gap-3 mb-8">
        <Settings className="h-8 w-8 text-violet-600" />
        <h1 className="text-3xl font-bold">Admin Settings</h1>
      </div>

      <Tabs defaultValue="configs" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="configs">Prompt Configurations</TabsTrigger>
          <TabsTrigger value="variables">Available Variables</TabsTrigger>
        </TabsList>

        <TabsContent value="configs" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-semibold">AI Chat Prompt Configurations</h2>
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button data-testid="button-create-config">
                  <Plus className="h-4 w-4 mr-2" />
                  Create New Config
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Create New Prompt Configuration</DialogTitle>
                  <DialogDescription>
                    Create a new AI prompt configuration for video chat responses.
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleCreateConfig} className="space-y-4">
                  <div>
                    <Label htmlFor="name">Configuration Name</Label>
                    <Input
                      id="name"
                      name="name"
                      placeholder="e.g., Default Chat Prompts"
                      required
                      data-testid="input-config-name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="description">Description (Optional)</Label>
                    <Input
                      id="description"
                      name="description"
                      placeholder="Brief description of this configuration"
                      data-testid="input-config-description"
                    />
                  </div>
                  <div>
                    <Label htmlFor="systemPrompt">System Prompt</Label>
                    <Textarea
                      id="systemPrompt"
                      name="systemPrompt"
                      placeholder="Enter the system prompt..."
                      className="min-h-[200px] font-mono text-sm"
                      required
                      data-testid="textarea-system-prompt"
                    />
                  </div>
                  <div>
                    <Label htmlFor="userPrompt">User Prompt</Label>
                    <Textarea
                      id="userPrompt"
                      name="userPrompt"
                      placeholder="Enter the user prompt template..."
                      className="min-h-[150px] font-mono text-sm"
                      required
                      data-testid="textarea-user-prompt"
                    />
                  </div>
                  <DialogFooter>
                    <Button
                      type="submit"
                      disabled={createConfigMutation.isPending}
                      data-testid="button-save-config"
                    >
                      {createConfigMutation.isPending ? "Creating..." : "Create Config"}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          {activeConfig && (
            <Alert>
              <Power className="h-4 w-4" />
              <AlertDescription>
                <strong>Active Configuration:</strong> {activeConfig.name}
                {activeConfig.description && ` - ${activeConfig.description}`}
              </AlertDescription>
            </Alert>
          )}

          <div className="grid gap-4">
            {(configs as PromptConfig[])?.map((config: PromptConfig) => (
              <Card key={config.id} className={config.isActive === "true" ? "border-green-500 bg-green-50 dark:bg-green-950" : ""}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        {config.name}
                        {config.isActive === "true" && (
                          <Badge variant="default" className="bg-green-600">
                            Active
                          </Badge>
                        )}
                      </CardTitle>
                      {config.description && (
                        <CardDescription>{config.description}</CardDescription>
                      )}
                    </div>
                    <div className="flex gap-2">
                      {config.isActive !== "true" && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => activateConfigMutation.mutate(config.id)}
                          disabled={activateConfigMutation.isPending}
                          data-testid={`button-activate-${config.id}`}
                        >
                          <Power className="h-4 w-4 mr-1" />
                          Activate
                        </Button>
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setEditingConfig(config)}
                        data-testid={`button-edit-${config.id}`}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => deleteConfigMutation.mutate(config.id)}
                        disabled={deleteConfigMutation.isPending || config.isActive === "true"}
                        data-testid={`button-delete-${config.id}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <Label className="text-sm font-medium">System Prompt:</Label>
                      <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded-md text-sm font-mono max-h-32 overflow-y-auto">
                        {config.systemPrompt.substring(0, 200)}...
                      </div>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">User Prompt:</Label>
                      <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded-md text-sm font-mono max-h-32 overflow-y-auto">
                        {config.userPrompt.substring(0, 200)}...
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Edit Dialog */}
          <Dialog open={!!editingConfig} onOpenChange={(open) => !open && setEditingConfig(null)}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Edit Prompt Configuration</DialogTitle>
                <DialogDescription>
                  Modify the AI prompt configuration.
                </DialogDescription>
              </DialogHeader>
              {editingConfig && (
                <form onSubmit={handleUpdateConfig} className="space-y-4">
                  <div>
                    <Label htmlFor="edit-name">Configuration Name</Label>
                    <Input
                      id="edit-name"
                      name="name"
                      defaultValue={editingConfig.name}
                      required
                      data-testid="input-edit-config-name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="edit-description">Description (Optional)</Label>
                    <Input
                      id="edit-description"
                      name="description"
                      defaultValue={editingConfig.description || ""}
                      data-testid="input-edit-config-description"
                    />
                  </div>
                  <div>
                    <Label htmlFor="edit-systemPrompt">System Prompt</Label>
                    <Textarea
                      id="edit-systemPrompt"
                      name="systemPrompt"
                      defaultValue={editingConfig.systemPrompt}
                      className="min-h-[200px] font-mono text-sm"
                      required
                      data-testid="textarea-edit-system-prompt"
                    />
                  </div>
                  <div>
                    <Label htmlFor="edit-userPrompt">User Prompt</Label>
                    <Textarea
                      id="edit-userPrompt"
                      name="userPrompt"
                      defaultValue={editingConfig.userPrompt}
                      className="min-h-[150px] font-mono text-sm"
                      required
                      data-testid="textarea-edit-user-prompt"
                    />
                  </div>
                  <DialogFooter>
                    <Button
                      type="submit"
                      disabled={updateConfigMutation.isPending}
                      data-testid="button-update-config"
                    >
                      {updateConfigMutation.isPending ? "Updating..." : "Update Config"}
                    </Button>
                  </DialogFooter>
                </form>
              )}
            </DialogContent>
          </Dialog>
        </TabsContent>

        <TabsContent value="variables" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Info className="h-5 w-5" />
                Available Template Variables
              </CardTitle>
              <CardDescription>
                You can use these variables in your prompt templates. They will be replaced with actual values when the AI processes a chat request.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                {availableVariables.map((variable) => (
                  <div key={variable.name} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <code className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded text-sm font-mono">
                        {variable.name}
                      </code>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        {variable.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Current User Prompt Example</CardTitle>
              <CardDescription>
                This is the current user prompt template being used (if no custom config is active):
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg font-mono text-sm">
                Previous conversation:\n$&#123;context&#125;\n\nVideo Duration: $&#123;videoDuration&#125;\n\nFull Video Transcript with Timestamps:\n$&#123;transcript&#125;\n\nUser Question: $&#123;question&#125;\n\nIMPORTANT: Only provide timestamps that exist in the transcript above. Do not generate or guess timestamps. If you cannot find the exact information with a timestamp in the transcript, say so honestly. Make sure any timestamps you reference do not exceed the video duration.
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}