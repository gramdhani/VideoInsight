import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Settings2, Plus, Edit, Trash2, CheckCircle, Copy, Save } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import type { PromptConfig } from "@shared/schema";

const promptConfigSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  systemPrompt: z.string().min(1, "System prompt is required"),
  userPrompt: z.string().min(1, "User prompt is required"),
});

type PromptConfigFormData = z.infer<typeof promptConfigSchema>;

export default function SettingsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedConfig, setSelectedConfig] = useState<PromptConfig | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);

  // Fetch all prompt configurations
  const { data: configs = [], isLoading } = useQuery<PromptConfig[]>({
    queryKey: ["/api/admin/prompt-configs"],
    enabled: !!user,
  });

  // Fetch active configuration
  const { data: activeConfig } = useQuery<PromptConfig>({
    queryKey: ["/api/admin/prompt-configs/active"],
  });

  const form = useForm<PromptConfigFormData>({
    resolver: zodResolver(promptConfigSchema),
    defaultValues: {
      name: "",
      description: "",
      systemPrompt: "",
      userPrompt: "",
    },
  });

  // Create prompt configuration
  const createMutation = useMutation({
    mutationFn: async (data: PromptConfigFormData) => {
      const response = await fetch("/api/admin/prompt-configs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("Failed to create configuration");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/prompt-configs"] });
      toast({ title: "Configuration created successfully" });
      setIsDialogOpen(false);
      form.reset();
    },
    onError: () => {
      toast({ title: "Failed to create configuration", variant: "destructive" });
    },
  });

  // Update prompt configuration
  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: PromptConfigFormData }) => {
      const response = await fetch(`/api/admin/prompt-configs/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("Failed to update configuration");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/prompt-configs"] });
      toast({ title: "Configuration updated successfully" });
      setIsDialogOpen(false);
      form.reset();
    },
    onError: () => {
      toast({ title: "Failed to update configuration", variant: "destructive" });
    },
  });

  // Delete prompt configuration
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/admin/prompt-configs/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Failed to delete configuration");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/prompt-configs"] });
      toast({ title: "Configuration deleted successfully" });
    },
    onError: () => {
      toast({ title: "Failed to delete configuration", variant: "destructive" });
    },
  });

  // Activate prompt configuration
  const activateMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/admin/prompt-configs/${id}/activate`, {
        method: "POST",
      });
      if (!response.ok) throw new Error("Failed to activate configuration");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/prompt-configs"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/prompt-configs/active"] });
      toast({ title: "Configuration activated successfully" });
    },
    onError: () => {
      toast({ title: "Failed to activate configuration", variant: "destructive" });
    },
  });

  const handleSubmit = (data: PromptConfigFormData) => {
    if (isEditMode && selectedConfig) {
      updateMutation.mutate({ id: selectedConfig.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleEdit = (config: PromptConfig) => {
    setSelectedConfig(config);
    setIsEditMode(true);
    form.reset({
      name: config.name,
      description: config.description || "",
      systemPrompt: config.systemPrompt,
      userPrompt: config.userPrompt,
    });
    setIsDialogOpen(true);
  };

  const handleCreate = () => {
    setSelectedConfig(null);
    setIsEditMode(false);
    form.reset({
      name: "",
      description: "",
      systemPrompt: defaultSystemPrompt,
      userPrompt: defaultUserPrompt,
    });
    setIsDialogOpen(true);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: "Copied to clipboard" });
  };

  if (!user) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardHeader>
            <CardTitle>Authentication Required</CardTitle>
            <CardDescription>
              Please sign in to access the settings page
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Settings2 className="h-8 w-8" />
          AI Prompt Settings
        </h1>
        <p className="text-muted-foreground mt-2">
          Manage and customize AI prompt configurations for video analysis
        </p>
      </div>

      <Tabs defaultValue="configurations" className="space-y-4">
        <TabsList>
          <TabsTrigger value="configurations">Prompt Configurations</TabsTrigger>
          <TabsTrigger value="variables">Template Variables</TabsTrigger>
        </TabsList>

        <TabsContent value="configurations" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-semibold">Prompt Configurations</h2>
            <Button onClick={handleCreate} data-testid="button-create-config">
              <Plus className="mr-2 h-4 w-4" />
              Create Configuration
            </Button>
          </div>

          {isLoading ? (
            <Card>
              <CardContent className="p-6">
                <p>Loading configurations...</p>
              </CardContent>
            </Card>
          ) : configs.length === 0 ? (
            <Card>
              <CardContent className="p-6">
                <p className="text-muted-foreground">No configurations found. Create your first prompt configuration to get started.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {configs.map((config) => (
                <Card key={config.id} className={config.isActive ? "border-primary" : ""}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          {config.name}
                          {config.isActive && (
                            <Badge variant="default" className="ml-2">
                              Active
                            </Badge>
                          )}
                        </CardTitle>
                        {config.description && (
                          <CardDescription className="mt-2">
                            {config.description}
                          </CardDescription>
                        )}
                      </div>
                      <div className="flex gap-2">
                        {!config.isActive && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => activateMutation.mutate(config.id)}
                            data-testid={`button-activate-${config.id}`}
                          >
                            <CheckCircle className="mr-1 h-4 w-4" />
                            Activate
                          </Button>
                        )}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(config)}
                          data-testid={`button-edit-${config.id}`}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="outline" size="sm" data-testid={`button-delete-${config.id}`}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Configuration</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete "{config.name}"? This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => deleteMutation.mutate(config.id)}
                                className="bg-destructive text-destructive-foreground"
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <Label>System Prompt</Label>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyToClipboard(config.systemPrompt)}
                          data-testid={`button-copy-system-${config.id}`}
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                      </div>
                      <pre className="bg-muted p-3 rounded-md text-sm overflow-x-auto whitespace-pre-wrap">
                        {config.systemPrompt.substring(0, 200)}...
                      </pre>
                    </div>
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <Label>User Prompt Template</Label>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyToClipboard(config.userPrompt)}
                          data-testid={`button-copy-user-${config.id}`}
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                      </div>
                      <pre className="bg-muted p-3 rounded-md text-sm overflow-x-auto whitespace-pre-wrap">
                        {config.userPrompt.substring(0, 200)}...
                      </pre>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="variables" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Available Template Variables</CardTitle>
              <CardDescription>
                Use these variables in your user prompt template to dynamically insert content
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <code className="bg-muted px-2 py-1 rounded">${"{context}"}</code>
                  <p className="text-sm text-muted-foreground mt-1">
                    Previous conversation history with questions and answers
                  </p>
                </div>
                <div>
                  <code className="bg-muted px-2 py-1 rounded">${"{transcript}"}</code>
                  <p className="text-sm text-muted-foreground mt-1">
                    Full video transcript with timestamps
                  </p>
                </div>
                <div>
                  <code className="bg-muted px-2 py-1 rounded">${"{videoDuration}"}</code>
                  <p className="text-sm text-muted-foreground mt-1">
                    Total duration of the video (e.g., "10:23")
                  </p>
                </div>
                <div>
                  <code className="bg-muted px-2 py-1 rounded">${"{question}"}</code>
                  <p className="text-sm text-muted-foreground mt-1">
                    Current question from the user
                  </p>
                </div>
                <div>
                  <code className="bg-muted px-2 py-1 rounded">${"{title}"}</code>
                  <p className="text-sm text-muted-foreground mt-1">
                    Title of the video being analyzed
                  </p>
                </div>
                <div>
                  <code className="bg-muted px-2 py-1 rounded">${"{webSearchInfo}"}</code>
                  <p className="text-sm text-muted-foreground mt-1">
                    Additional web search information when applicable
                  </p>
                </div>
              </div>

              <div className="mt-6">
                <h4 className="font-semibold mb-2">Example User Prompt Template:</h4>
                <pre className="bg-muted p-3 rounded-md text-sm overflow-x-auto whitespace-pre-wrap">
{`Previous conversation:
\${context}

Video Duration: \${videoDuration}

Full Video Transcript with Timestamps:
\${transcript}\${webSearchInfo}

User Question: \${question}

IMPORTANT: Only provide timestamps that exist in the transcript above.`}
                </pre>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {isEditMode ? "Edit Configuration" : "Create Configuration"}
            </DialogTitle>
            <DialogDescription>
              {isEditMode ? "Update the prompt configuration settings" : "Create a new prompt configuration for AI responses"}
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="e.g., Enhanced Video Analysis" data-testid="input-config-name" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description (Optional)</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Brief description of this configuration" data-testid="input-config-description" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="systemPrompt"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>System Prompt</FormLabel>
                    <FormDescription>
                      Define the AI's role and behavior
                    </FormDescription>
                    <FormControl>
                      <Textarea 
                        {...field} 
                        rows={8}
                        placeholder="You are an AI assistant helping users understand videos..."
                        className="font-mono text-sm"
                        data-testid="textarea-system-prompt"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="userPrompt"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>User Prompt Template</FormLabel>
                    <FormDescription>
                      Template for constructing the user message. Use variables like ${"{context}"}, ${"{transcript}"}, etc.
                    </FormDescription>
                    <FormControl>
                      <Textarea 
                        {...field} 
                        rows={8}
                        placeholder="Previous conversation:\n${context}\n\nVideo transcript:\n${transcript}..."
                        className="font-mono text-sm"
                        data-testid="textarea-user-prompt"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending} data-testid="button-save-config">
                  <Save className="mr-2 h-4 w-4" />
                  {isEditMode ? "Update" : "Create"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Default prompts for new configurations
const defaultSystemPrompt = `You are an AI assistant helping users understand videos. You have access to the complete video transcript with timestamps and can supplement with current web information when needed.

RESPONSE STYLE:
- Use bullet points for clarity
- Include timestamps in [MM:SS] format when referencing specific moments
- Keep responses concise and easy to understand
- Use simple, everyday language

JSON RESPONSE FORMAT:
{
  "answer": "Your response here",
  "timestamps": ["MM:SS"] (if applicable)
}`;

const defaultUserPrompt = `Previous conversation:
\${context}

Video Duration: \${videoDuration}

Full Video Transcript with Timestamps:
\${transcript}\${webSearchInfo}

User Question: \${question}

IMPORTANT: Only provide timestamps that exist in the transcript above. Do not generate or guess timestamps.`;