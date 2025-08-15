import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Settings2, Edit, Trash2, Copy, CheckCircle, Save } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { insertPromptConfigSchema, type PromptConfig } from "../../../shared/schema";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/useAuth";

const formSchema = insertPromptConfigSchema.extend({
  description: z.string().optional(),
});

export default function Settings() {
  const { user, isLoading: userLoading } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedConfig, setSelectedConfig] = useState<PromptConfig | null>(null);
  const [currentConfigType, setCurrentConfigType] = useState<"chat" | "summary" | "quick_action">("chat");

  // Check if user is admin
  const isAdmin = user?.id === "40339057";

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
      systemPrompt: "",
      userPrompt: "",
      type: "chat",
      quickActionType: undefined,
    },
  });

  const { data: configs = [], isLoading, error } = useQuery({
    queryKey: ["/api/admin/prompt-configs", currentConfigType],
    queryFn: async () => {
      const response = await fetch(`/api/admin/prompt-configs?type=${currentConfigType}`, {
        credentials: 'include'
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch');
      }
      
      return response.json();
    },
    enabled: isAdmin && !userLoading,
  });

  const createMutation = useMutation({
    mutationFn: (data: z.infer<typeof formSchema>) => apiRequest("/api/admin/prompt-configs", "POST", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/prompt-configs"] });
      setIsDialogOpen(false);
      form.reset();
      toast({ title: "Success", description: "Configuration created successfully" });
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message || "Failed to create configuration", variant: "destructive" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: z.infer<typeof formSchema> }) => 
      apiRequest(`/api/admin/prompt-configs/${id}`, "PUT", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/prompt-configs"] });
      setIsDialogOpen(false);
      form.reset();
      setSelectedConfig(null);
      toast({ title: "Success", description: "Configuration updated successfully" });
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message || "Failed to update configuration", variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiRequest(`/api/admin/prompt-configs/${id}`, "DELETE"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/prompt-configs"] });
      toast({ title: "Success", description: "Configuration deleted successfully" });
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message || "Failed to delete configuration", variant: "destructive" });
    },
  });

  const activateMutation = useMutation({
    mutationFn: (id: string) => apiRequest(`/api/admin/prompt-configs/${id}/activate`, "POST"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/prompt-configs"] });
      toast({ title: "Success", description: "Configuration activated successfully" });
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message || "Failed to activate configuration", variant: "destructive" });
    },
  });

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({ title: "Copied", description: "Text copied to clipboard" });
    } catch {
      toast({ title: "Error", description: "Failed to copy text", variant: "destructive" });
    }
  };

  const getDefaultPrompts = (type: "chat" | "summary" | "quick_action") => {
    if (type === "chat") {
      return { systemPrompt: defaultSystemPrompt, userPrompt: defaultUserPrompt };
    } else if (type === "summary") {
      return { systemPrompt: defaultSummarySystemPrompt, userPrompt: defaultSummaryUserPrompt };
    } else {
      return {
        systemPrompt: "You are an expert at creating specific, actionable responses. Focus on the most important points that viewers can immediately use. Always include timestamps when available and format any tools or websites as clickable links.",
        userPrompt: 'Analyze "${title}" and provide the requested information. Include timestamps and links where relevant.'
      };
    }
  };

  const handleCreate = () => {
    setIsEditMode(false);
    setSelectedConfig(null);
    const defaults = getDefaultPrompts(currentConfigType);
    form.reset({
      name: "",
      description: "",
      systemPrompt: defaults.systemPrompt,
      userPrompt: defaults.userPrompt,
      type: currentConfigType,
      quickActionType: undefined,
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = (data: z.infer<typeof formSchema>) => {
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
      type: config.type as "chat" | "summary" | "quick_action" || "chat",
      quickActionType: config.quickActionType as "Shorter Summary" | "Detailed Analysis" | "Action Items" | "Key Quotes" | undefined,
    });
    setIsDialogOpen(true);
  };

  const renderConfigurationContent = () => {
    if (isLoading) {
      return <div className="flex justify-center py-8">Loading configurations...</div>;
    }

    if (configs.length === 0) {
      return (
        <Card>
          <CardContent className="p-6">
            <p className="text-muted-foreground">No configurations found. Create your first prompt configuration to get started.</p>
          </CardContent>
        </Card>
      );
    }

    return (
      <div className="grid gap-4">
        {configs.map((config: PromptConfig) => (
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
    );
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

  // Note: Settings page access is now controlled at the sidebar level
  // Non-admin users won't see the Settings link in the sidebar
  if (!isAdmin) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardHeader>
            <CardTitle>Access Restricted</CardTitle>
            <CardDescription>
              This settings page is only accessible to administrators.
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

          {/* Sub-tabs for Chat and Summary configurations */}
          <Tabs value={currentConfigType} onValueChange={(value) => setCurrentConfigType(value as "chat" | "summary" | "quick_action")} className="space-y-4">
            <TabsList>
              <TabsTrigger value="chat">Chat Responses</TabsTrigger>
              <TabsTrigger value="summary">Video Summaries</TabsTrigger>
              <TabsTrigger value="quick_action">Quick Actions</TabsTrigger>
            </TabsList>

            <TabsContent value="chat" className="space-y-4">
              <div className="text-sm text-muted-foreground mb-4">
                Configure AI prompts for chat responses and video Q&A interactions.
              </div>
              {renderConfigurationContent()}
            </TabsContent>

            <TabsContent value="summary" className="space-y-4">
              <div className="text-sm text-muted-foreground mb-4">
                Configure AI prompts for automatic video summarization.
              </div>
              {renderConfigurationContent()}
            </TabsContent>

            <TabsContent value="quick_action" className="space-y-4">
              <div className="text-sm text-muted-foreground mb-4">
                Configure AI prompts for quick action buttons like "Shorter Summary", "Detailed Analysis", "Action Items", and "Key Quotes".
              </div>
              {renderConfigurationContent()}
            </TabsContent>
          </Tabs>
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
                  <h4 className="font-semibold mb-3">For Chat Prompts:</h4>
                  <div className="grid gap-3">
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
                </div>

                <div>
                  <h4 className="font-semibold mb-3">For Summary Prompts:</h4>
                  <div className="grid gap-3">
                    <div>
                      <code className="bg-muted px-2 py-1 rounded">${"{title}"}</code>
                      <p className="text-sm text-muted-foreground mt-1">
                        Title of the video being summarized
                      </p>
                    </div>
                    <div>
                      <code className="bg-muted px-2 py-1 rounded">${"{transcript}"}</code>
                      <p className="text-sm text-muted-foreground mt-1">
                        Full video transcript with timestamps
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6">
                <h4 className="font-semibold mb-2">Example Chat User Prompt Template:</h4>
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

              <div className="mt-6">
                <h4 className="font-semibold mb-2">Example Summary User Prompt Template:</h4>
                <pre className="bg-muted p-3 rounded-md text-sm overflow-x-auto whitespace-pre-wrap">
{`Analyze this video transcript for "\${title}":

\${transcript}`}
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
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Configuration Type</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-config-type">
                          <SelectValue placeholder="Select configuration type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="chat">Chat Responses</SelectItem>
                        <SelectItem value="summary">Video Summaries</SelectItem>
                        <SelectItem value="quick_action">Quick Actions</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Choose whether this configuration is for chat responses, video summaries, or quick actions
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

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

              {form.watch("type") === "quick_action" && (
                <FormField
                  control={form.control}
                  name="quickActionType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Quick Action Type</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-quick-action-type">
                            <SelectValue placeholder="Select quick action type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Shorter Summary">Shorter Summary</SelectItem>
                          <SelectItem value="Detailed Analysis">Detailed Analysis</SelectItem>
                          <SelectItem value="Action Items">Action Items</SelectItem>
                          <SelectItem value="Key Quotes">Key Quotes</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        Choose which quick action this configuration applies to
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
              
              <FormField
                control={form.control}
                name="systemPrompt"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>System Prompt</FormLabel>
                    <FormDescription>
                      Instructions that define the AI's role, behavior, and response format
                    </FormDescription>
                    <FormControl>
                      <Textarea 
                        {...field} 
                        rows={10}
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

// Default prompts for summary configurations
const defaultSummarySystemPrompt = `You are an expert video analyst. Create a comprehensive, well-structured summary following this exact format. Use simple, everyday language that's easy to understand. When mentioning tools, websites, or resources, format them as clickable links using markdown format [text](url).

Respond with JSON in this exact format:
{
  "shortSummary": "A brief 2-3 sentence overview of what this video is about and its main purpose",
  "outline": [
    {
      "title": "Section name (e.g., Introduction, Main Concept, etc.)",
      "items": ["Key point 1", "Key point 2", "Key point 3"]
    }
  ],
  "keyTakeaways": [
    {
      "title": "Simple takeaway title",
      "description": "Clear explanation of why this matters",
      "timestamp": "MM:SS (if specific moment mentioned)"
    }
  ],
  "actionableSteps": [
    {
      "step": "Clear action item",
      "description": "Simple explanation of how to do it",
      "priority": "high" or "medium" or "low"
    }
  ],
  "readingTime": "X min",
  "insights": number_of_insights
}

GUIDELINES:
- Use simple words everyone can understand
- Make takeaways practical and useful
- Include timestamps when referencing specific video moments
- Prioritize action steps: high (do first), medium (do soon), low (do later)
- Keep everything clear and actionable`;

const defaultSummaryUserPrompt = `Analyze this video transcript for "\${title}":

\${transcript}`;