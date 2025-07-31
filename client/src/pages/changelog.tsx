
import { Calendar, GitBranch, Zap, Home, HelpCircle, Play } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import Header from "../components/header";

export default function Changelog() {
  const menuItems = [
    {
      title: "Summarize",
      icon: Home,
      url: "/",
      isActive: false,
    },
    {
      title: "Changelog",
      icon: Calendar,
      url: "/changelog",
      isActive: true,
    },
    {
      title: "Help",
      icon: HelpCircle,
      url: "#",
      isActive: false,
    },
  ];

  return (
    <SidebarProvider>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-indigo-50 flex">
        {/* Sidebar */}
        <Sidebar variant="inset">
          <SidebarHeader>
            <div className="flex items-center space-x-3 px-2 py-2">
              <div className="w-6 h-6 bg-primary rounded flex items-center justify-center">
                <Play className="w-3 h-3 text-white" />
              </div>
              <span className="font-medium text-foreground">
                VideoInsight AI
              </span>
            </div>
          </SidebarHeader>
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel>NAVIGATE</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {menuItems.map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton
                        asChild
                        isActive={item.isActive}
                        className="w-full"
                      >
                        <a href={item.url} className="flex items-center space-x-3">
                          <item.icon className="w-4 h-4" />
                          <span>{item.title}</span>
                        </a>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
        </Sidebar>

        {/* Main Content */}
        <SidebarInset className="flex-1">
          <div className="flex h-14 shrink-0 items-center gap-2 border-b px-4">
            <SidebarTrigger className="-ml-1" />
            <div className="flex-1">
              <Header currentPage="changelog" hideLogo={true} />
            </div>
          </div>

          {/* Page Title Section */}
          <div className="bg-white border-b border-gray-200">
            <div className="max-w-4xl mx-auto px-6 py-8">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-primary rounded flex items-center justify-center">
                  <GitBranch className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Changelog</h1>
                  <p className="text-gray-600">Track new features and improvements</p>
                </div>
              </div>
            </div>
          </div>

          {/* Content */}
          <main className="max-w-4xl mx-auto px-6 py-8">
            <div className="space-y-8">
              {/* Version 0.1.1 */}
              <Card className="bg-white rounded-xl shadow-sm border border-gray-200">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      <h2 className="text-xl font-semibold text-gray-900">v0.1.1</h2>
                      <span className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full">
                        Latest
                      </span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-gray-500">
                      <Calendar className="w-4 h-4" />
                      <span>January 31, 2025</span>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded-r-lg">
                      <h3 className="font-medium text-blue-900 mb-2">🔧 User Experience Improvements</h3>
                      <p className="text-blue-800 text-sm">
                        Enhanced interface organization and fixed key functionality issues.
                      </p>
                    </div>

                    <ul className="space-y-2 ml-4">
                      <li className="flex items-start space-x-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-2"></div>
                        <span className="text-gray-700">Removed all box-shadow properties for cleaner visual design</span>
                      </li>
                      <li className="flex items-start space-x-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-2"></div>
                        <span className="text-gray-700">Cleaned up footer section from home page</span>
                      </li>
                      <li className="flex items-start space-x-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-2"></div>
                        <span className="text-gray-700">Improved overall page layout and spacing</span>
                      </li>
                    </ul>
                  </div>
                </CardContent>
              </Card>

              {/* Version 0.2.0 */}
              <Card className="bg-white rounded-xl shadow-sm border border-gray-200">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                      <h2 className="text-xl font-semibold text-gray-900">v0.2.0</h2>
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-gray-500">
                      <Calendar className="w-4 h-4" />
                      <span>January 30, 2025</span>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="bg-green-50 border-l-4 border-green-400 p-4 rounded-r-lg">
                      <h3 className="font-medium text-green-900 mb-2">🔐 Authentication Integration</h3>
                      <p className="text-green-800 text-sm">
                        Added comprehensive user authentication and session management.
                      </p>
                    </div>

                    <ul className="space-y-2 ml-4">
                      <li className="flex items-start space-x-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-green-500 mt-2"></div>
                        <span className="text-gray-700">Integrated Replit OpenID Connect authentication</span>
                      </li>
                      <li className="flex items-start space-x-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-green-500 mt-2"></div>
                        <span className="text-gray-700">Added PostgreSQL session storage</span>
                      </li>
                      <li className="flex items-start space-x-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-green-500 mt-2"></div>
                        <span className="text-gray-700">Protected API routes with authentication</span>
                      </li>
                      <li className="flex items-start space-x-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-green-500 mt-2"></div>
                        <span className="text-gray-700">Enhanced header with user profile management</span>
                      </li>
                    </ul>
                  </div>
                </CardContent>
              </Card>

              {/* Version 0.1.0 */}
              <Card className="bg-white rounded-xl shadow-sm border border-gray-200">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                      <h2 className="text-xl font-semibold text-gray-900">v0.1.0</h2>
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-gray-500">
                      <Calendar className="w-4 h-4" />
                      <span>January 30, 2025</span>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="bg-purple-50 border-l-4 border-purple-400 p-4 rounded-r-lg">
                      <h3 className="font-medium text-purple-900 mb-2">🚀 Initial Release</h3>
                      <p className="text-purple-800 text-sm">
                        Core video analysis and AI-powered insights functionality.
                      </p>
                    </div>

                    <ul className="space-y-2 ml-4">
                      <li className="flex items-start space-x-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-purple-500 mt-2"></div>
                        <span className="text-gray-700">YouTube URL analysis with transcript extraction</span>
                      </li>
                      <li className="flex items-start space-x-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-purple-500 mt-2"></div>
                        <span className="text-gray-700">AI-powered video summaries with key insights</span>
                      </li>
                      <li className="flex items-start space-x-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-purple-500 mt-2"></div>
                        <span className="text-gray-700">Interactive chat interface with timestamp navigation</span>
                      </li>
                      <li className="flex items-start space-x-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-purple-500 mt-2"></div>
                        <span className="text-gray-700">Quick Actions for instant analysis</span>
                      </li>
                      <li className="flex items-start space-x-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-purple-500 mt-2"></div>
                        <span className="text-gray-700">Professional Indigo/Purple design theme</span>
                      </li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </div>
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
