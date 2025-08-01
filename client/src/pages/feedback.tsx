import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { MessageSquare, Send, CheckCircle, AlertCircle } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";
import { insertFeedbackSchema } from "@shared/schema";

// Extended schema for form validation - email required when not logged in
const feedbackFormSchema = insertFeedbackSchema.extend({
  email: z.string().email("Please enter a valid email address"),
}).refine((data) => {
  // Email validation logic will be handled in the component
  return true;
});

type FeedbackFormData = z.infer<typeof feedbackFormSchema>;

export default function Feedback() {
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [formData, setFormData] = useState<FeedbackFormData>({
    name: user?.firstName && user?.lastName ? `${user.firstName} ${user.lastName}` : "",
    email: user?.email || "",
    message: "",
  });
  const [submitted, setSubmitted] = useState(false);

  const submitFeedbackMutation = useMutation({
    mutationFn: async (data: FeedbackFormData) => {
      // Validate email requirement for non-authenticated users
      if (!isAuthenticated && !data.email) {
        throw new Error("Email is required when not logged in");
      }
      
      return apiRequest("POST", "/api/feedback", data);
    },
    onSuccess: () => {
      setSubmitted(true);
      toast({
        title: "Feedback submitted successfully!",
        description: "Thank you for your feedback. We'll review it and get back to you soon.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error submitting feedback",
        description: error.message || "Please try again later.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields
    if (!formData.name.trim()) {
      toast({
        title: "Name is required",
        description: "Please enter your name.",
        variant: "destructive",
      });
      return;
    }
    
    if (!isAuthenticated && !formData.email.trim()) {
      toast({
        title: "Email is required",
        description: "Please enter your email address.",
        variant: "destructive",
      });
      return;
    }
    
    if (!formData.message.trim()) {
      toast({
        title: "Message is required",
        description: "Please enter your feedback message.",
        variant: "destructive",
      });
      return;
    }

    submitFeedbackMutation.mutate(formData);
  };

  const handleInputChange = (field: keyof FeedbackFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  if (submitted) {
    return (
      <div className="max-w-4xl mx-auto p-4 space-y-6">
        {/* Page Title */}
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <MessageSquare className="w-4 h-4 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[var(--text-main)]">Share Feedback</h1>
            <p className="text-[var(--text-secondary)]">Help us improve VideoInsight AI</p>
          </div>
        </div>

        {/* Success Message */}
        <Card className="modern-card max-w-lg mx-auto">
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="text-xl font-semibold text-[var(--text-main)] mb-2">
              Thank you for your feedback!
            </h2>
            <p className="text-[var(--text-secondary)] mb-6">
              Your feedback has been submitted successfully. We appreciate you taking the time to help us improve VideoInsight AI.
            </p>
            <Button 
              onClick={() => setSubmitted(false)}
              variant="outline"
            >
              Submit Another Feedback
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6">
      {/* Page Title */}
      <div className="flex items-center space-x-3">
        <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
          <MessageSquare className="w-4 h-4 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-main)]">Share Feedback</h1>
          <p className="text-[var(--text-secondary)]">Help us improve VideoInsight AI</p>
        </div>
      </div>

      {/* Feedback Form */}
      <Card className="modern-card max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <MessageSquare className="w-5 h-5 text-primary" />
            <span>Your Feedback</span>
          </CardTitle>
          <p className="text-[var(--text-secondary)] text-sm">
            We value your input! Share your thoughts, feature requests, bug reports, or suggestions to help us improve.
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Name Field */}
            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm font-medium">
                Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="name"
                type="text"
                placeholder="Your full name"
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                className="w-full"
                required
              />
            </div>

            {/* Email Field */}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium">
                Email {!isAuthenticated && <span className="text-red-500">*</span>}
                {isAuthenticated && (
                  <span className="text-xs text-[var(--text-secondary)] ml-1">
                    (from your account)
                  </span>
                )}
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="your.email@example.com"
                value={formData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                className="w-full"
                required={!isAuthenticated}
                disabled={isAuthenticated}
              />
              {!isAuthenticated && (
                <p className="text-xs text-[var(--text-secondary)]">
                  Required for us to follow up on your feedback
                </p>
              )}
            </div>

            {/* Message Field */}
            <div className="space-y-2">
              <Label htmlFor="message" className="text-sm font-medium">
                Message <span className="text-red-500">*</span>
              </Label>
              <Textarea
                id="message"
                placeholder="Tell us about your experience, suggestions for improvement, feature requests, bugs you've encountered, or any other feedback..."
                value={formData.message}
                onChange={(e) => handleInputChange("message", e.target.value)}
                className="w-full min-h-[120px] resize-none"
                required
              />
              <p className="text-xs text-[var(--text-secondary)]">
                Please be as detailed as possible to help us understand and address your feedback
              </p>
            </div>

            {/* Submit Button */}
            <Button 
              type="submit" 
              className="w-full" 
              disabled={submitFeedbackMutation.isPending}
            >
              {submitFeedbackMutation.isPending ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Submitting...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Submit Feedback
                </>
              )}
            </Button>
          </form>

          {/* Additional Info */}
          <div className="mt-6 p-4 bg-[var(--muted)] rounded-lg">
            <div className="flex items-start space-x-3">
              <AlertCircle className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />
              <div className="text-sm">
                <h4 className="font-medium mb-1">What happens next?</h4>
                <ul className="text-[var(--text-secondary)] space-y-1">
                  <li>• We review all feedback carefully</li>
                  <li>• For bug reports, we'll investigate and fix issues</li>
                  <li>• Feature requests are prioritized based on user needs</li>
                  <li>• We may follow up for clarification if needed</li>
                </ul>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}