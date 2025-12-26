import { useState, useEffect, useCallback } from "react";
import { 
  Download, Check, Search, Package, Star, ChevronLeft, ChevronRight,
  Sparkles, Shield, Gamepad2, Wrench, Cpu, Globe, Camera, Music,
  MessageSquare, BookOpen, Trash2, RefreshCw, HardDrive, Eye,
  TrendingUp, Clock, Users, Award, X, Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface AppReview {
  user: string;
  rating: number;
  comment: string;
  date: string;
}

interface StoreApp {
  id: string;
  name: string;
  category: string;
  description: string;
  version: string;
  size: string;
  rating: number;
  downloads: string;
  featured?: boolean;
  new?: boolean;
  reviews?: AppReview[];
  permissions?: string[];
  lastUpdate?: string;
}

const CATEGORY_ICONS: Record<string, typeof Package> = {
  Productivity: BookOpen,
  Graphics: Camera,
  Entertainment: Music,
  Utilities: Wrench,
  Security: Shield,
  Communication: MessageSquare,
  Network: Globe,
  System: Cpu,
  Games: Gamepad2,
  Reference: BookOpen,
  Navigation: Globe,
  Science: Sparkles,
};

const generateReviews = (appName: string): AppReview[] => {
  const reviewers = ['Alex_Dev', 'CyberUser99', 'TechEnthusiast', 'ProUser2024', 'SiteAdmin'];
  const comments = [
    'Works flawlessly! Exactly what I needed.',
    'Great app, but could use more features.',
    'Essential tool for daily operations.',
    'Exceeded my expectations. Highly recommend!',
    'Good but a bit slow on older systems.',
    'Perfect for SCP containment work.',
    'Clean interface, easy to use.',
  ];
  
  return reviewers.slice(0, 3 + Math.floor(Math.random() * 3)).map((user, i) => ({
    user,
    rating: 3 + Math.floor(Math.random() * 3),
    comment: comments[Math.floor(Math.random() * comments.length)],
    date: `${Math.floor(Math.random() * 30) + 1} days ago`,
  }));
};

const AVAILABLE_APPS: StoreApp[] = [
  { id: "notepad", name: "Notepad", category: "Productivity", description: "Simple text editor for quick notes and documentation", version: "2.1.0", size: "1.2 MB", rating: 4.5, downloads: "12.5K", featured: true, permissions: ['File Access'], lastUpdate: '2024-01-15' },
  { id: "paint", name: "Paint Tool", category: "Graphics", description: "Professional image editing and digital art creation suite", version: "3.0.1", size: "2.8 MB", rating: 4.2, downloads: "8.3K", new: true, permissions: ['File Access', 'Graphics'], lastUpdate: '2024-01-20' },
  { id: "music-player", name: "Media Player", category: "Entertainment", description: "Premium audio and video playback with equalizer", version: "5.2.0", size: "8.4 MB", rating: 4.7, downloads: "25.1K", featured: true, permissions: ['Audio', 'File Access'], lastUpdate: '2024-01-18' },
  { id: "weather", name: "Weather Monitor", category: "Utilities", description: "Real-time weather tracking with facility alerts", version: "1.8.3", size: "3.1 MB", rating: 4.3, downloads: "15.2K", permissions: ['Network'], lastUpdate: '2024-01-10' },
  { id: "clock", name: "World Clock", category: "Utilities", description: "Multi-timezone clock with alarms and timers", version: "2.5.0", size: "1.5 MB", rating: 4.4, downloads: "9.8K", permissions: ['Notifications'], lastUpdate: '2024-01-12' },
  { id: "calendar", name: "Event Calendar", category: "Productivity", description: "Advanced scheduling with SCP event integration", version: "4.1.2", size: "4.7 MB", rating: 4.6, downloads: "18.4K", featured: true, permissions: ['Notifications', 'File Access'], lastUpdate: '2024-01-08' },
  { id: "notes", name: "Advanced Notes", category: "Productivity", description: "Rich text note-taking with encryption support", version: "3.3.0", size: "5.2 MB", rating: 4.8, downloads: "22.7K", new: true, permissions: ['File Access', 'Encryption'], lastUpdate: '2024-01-22' },
  { id: "vpn", name: "Secure VPN", category: "Security", description: "Military-grade encrypted network tunneling", version: "2.0.4", size: "6.3 MB", rating: 4.5, downloads: "31.2K", permissions: ['Network', 'System'], lastUpdate: '2024-01-05' },
  { id: "firewall", name: "Network Firewall", category: "Security", description: "Advanced packet filtering and intrusion prevention", version: "7.1.0", size: "12.5 MB", rating: 4.7, downloads: "28.9K", featured: true, permissions: ['Network', 'System', 'Admin'], lastUpdate: '2024-01-03' },
  { id: "antivirus", name: "Virus Scanner", category: "Security", description: "Real-time threat detection with anomaly scanning", version: "9.2.1", size: "45.8 MB", rating: 4.9, downloads: "45.3K", permissions: ['Full System'], lastUpdate: '2024-01-01' },
  { id: "backup", name: "Data Backup", category: "Utilities", description: "Automated backup with cloud sync support", version: "3.4.0", size: "7.9 MB", rating: 4.6, downloads: "19.5K", permissions: ['File Access', 'Network'], lastUpdate: '2024-01-14' },
  { id: "compression", name: "File Compressor", category: "Utilities", description: "High-ratio compression for all archive formats", version: "4.0.2", size: "2.3 MB", rating: 4.4, downloads: "14.1K", permissions: ['File Access'], lastUpdate: '2024-01-11' },
  { id: "pdf-reader", name: "PDF Viewer", category: "Productivity", description: "Read, annotate, and sign PDF documents", version: "6.1.0", size: "8.7 MB", rating: 4.5, downloads: "20.8K", permissions: ['File Access'], lastUpdate: '2024-01-09' },
  { id: "spreadsheet", name: "Data Sheets", category: "Productivity", description: "Powerful spreadsheet with formula engine", version: "5.3.1", size: "15.2 MB", rating: 4.7, downloads: "16.4K", new: true, permissions: ['File Access'], lastUpdate: '2024-01-21' },
  { id: "presentation", name: "Slide Maker", category: "Productivity", description: "Create stunning presentations with templates", version: "4.2.0", size: "11.4 MB", rating: 4.3, downloads: "11.2K", permissions: ['File Access', 'Graphics'], lastUpdate: '2024-01-07' },
  { id: "video-editor", name: "Video Editor", category: "Graphics", description: "Professional video editing with effects library", version: "8.0.3", size: "78.5 MB", rating: 4.8, downloads: "8.9K", featured: true, permissions: ['File Access', 'Graphics', 'Audio'], lastUpdate: '2024-01-19' },
  { id: "image-viewer", name: "Photo Gallery", category: "Graphics", description: "Browse and organize images with filters", version: "3.1.5", size: "4.8 MB", rating: 4.4, downloads: "13.7K", permissions: ['File Access'], lastUpdate: '2024-01-13' },
  { id: "chat", name: "Instant Chat", category: "Communication", description: "Secure real-time messaging with encryption", version: "7.4.2", size: "9.8 MB", rating: 4.7, downloads: "35.2K", permissions: ['Network', 'Notifications'], lastUpdate: '2024-01-16' },
  { id: "ssh", name: "SSH Terminal", category: "Network", description: "Secure shell with key management", version: "4.5.2", size: "6.4 MB", rating: 4.8, downloads: "12.3K", permissions: ['Network', 'File Access'], lastUpdate: '2024-01-04' },
  { id: "disk-manager", name: "Disk Utility", category: "System", description: "Partition and manage storage devices", version: "6.0.1", size: "8.9 MB", rating: 4.5, downloads: "10.1K", permissions: ['System', 'Admin'], lastUpdate: '2024-01-06' },
  { id: "game-center", name: "Game Hub", category: "Games", description: "Collection of retro and modern mini-games", version: "2.0.0", size: "34.2 MB", rating: 4.5, downloads: "42.8K", new: true, permissions: ['Graphics', 'Audio'], lastUpdate: '2024-01-23' },
  { id: "encryption", name: "File Encryptor", category: "Security", description: "AES-256 encryption for sensitive files", version: "6.2.0", size: "4.8 MB", rating: 4.9, downloads: "27.4K", permissions: ['File Access', 'Encryption'], lastUpdate: '2024-01-02' },
  { id: "password-manager", name: "Password Vault", category: "Security", description: "Secure password storage with autofill", version: "7.1.3", size: "5.6 MB", rating: 4.7, downloads: "38.1K", featured: true, permissions: ['Encryption', 'System'], lastUpdate: '2024-01-17' },
  { id: "img-editor", name: ".Img Editor", category: "System", description: "Edit recovery images and system snapshots", version: "1.0.0", size: "2.1 MB", rating: 4.6, downloads: "5.2K", permissions: ['System', 'File Access'], lastUpdate: '2024-01-20' },
].map(app => ({ ...app, reviews: generateReviews(app.name) }));

interface DownloadState {
  appId: string;
  progress: number;
  status: 'downloading' | 'installing' | 'complete';
}

export const AppStore = ({ onInstall }: { onInstall?: (appId: string) => void }) => {
  const [installedApps, setInstalledApps] = useState<string[]>([]);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [selectedApp, setSelectedApp] = useState<StoreApp | null>(null);
  const [downloads, setDownloads] = useState<DownloadState[]>([]);
  const [featuredIndex, setFeaturedIndex] = useState(0);
  const [activeTab, setActiveTab] = useState("browse");

  const featuredApps = AVAILABLE_APPS.filter(app => app.featured);

  useEffect(() => {
    const installed = localStorage.getItem("urbanshade_installed_apps");
    if (installed) setInstalledApps(JSON.parse(installed));
  }, []);

  // Auto-rotate featured carousel
  useEffect(() => {
    const interval = setInterval(() => {
      setFeaturedIndex(prev => (prev + 1) % featuredApps.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [featuredApps.length]);

  const categories = ["All", ...Array.from(new Set(AVAILABLE_APPS.map(app => app.category)))];

  const filteredApps = AVAILABLE_APPS.filter(app => {
    const matchesSearch = app.name.toLowerCase().includes(search.toLowerCase()) || 
                         app.description.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = selectedCategory === "All" || app.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleInstall = useCallback((app: StoreApp) => {
    // Start download animation
    setDownloads(prev => [...prev, { appId: app.id, progress: 0, status: 'downloading' }]);

    // Simulate download progress
    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.random() * 15 + 5;
      if (progress >= 100) {
        progress = 100;
        clearInterval(interval);
        
        // Switch to installing
        setDownloads(prev => prev.map(d => 
          d.appId === app.id ? { ...d, progress: 100, status: 'installing' } : d
        ));

        // Complete installation
        setTimeout(() => {
          setDownloads(prev => prev.map(d => 
            d.appId === app.id ? { ...d, status: 'complete' } : d
          ));

          // Add to downloads folder
          const dlList = JSON.parse(localStorage.getItem('downloads_installers') || '[]');
          dlList.push({
            id: Date.now().toString(),
            name: `${app.name} Installer.exe`,
            appId: app.id,
            appName: app.name,
            size: app.size,
            downloaded: new Date().toISOString()
          });
          localStorage.setItem('downloads_installers', JSON.stringify(dlList));

          toast.success(`${app.name} downloaded! Run installer from Downloads.`);
          onInstall?.(app.id);
          window.dispatchEvent(new Event('storage'));

          // Remove from downloads list after a moment
          setTimeout(() => {
            setDownloads(prev => prev.filter(d => d.appId !== app.id));
          }, 2000);
        }, 800);
      } else {
        setDownloads(prev => prev.map(d => 
          d.appId === app.id ? { ...d, progress } : d
        ));
      }
    }, 150);
  }, [onInstall]);

  const handleUninstall = (appId: string, appName: string) => {
    if (!window.confirm(`Uninstall ${appName}?`)) return;
    const newInstalled = installedApps.filter(id => id !== appId);
    setInstalledApps(newInstalled);
    localStorage.setItem("urbanshade_installed_apps", JSON.stringify(newInstalled));
    toast.success(`${appName} uninstalled successfully!`);
    window.dispatchEvent(new Event('storage'));
  };

  const isInstalled = (appId: string) => installedApps.includes(appId);
  const isDownloading = (appId: string) => downloads.some(d => d.appId === appId);
  const getDownloadState = (appId: string) => downloads.find(d => d.appId === appId);

  const renderStars = (rating: number) => (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map(star => (
        <Star 
          key={star}
          className={cn(
            "w-3 h-3",
            star <= Math.floor(rating) 
              ? "fill-amber-400 text-amber-400" 
              : star <= rating 
                ? "fill-amber-400/50 text-amber-400" 
                : "text-muted-foreground"
          )}
        />
      ))}
    </div>
  );

  const CategoryIcon = ({ category }: { category: string }) => {
    const Icon = CATEGORY_ICONS[category] || Package;
    return <Icon className="w-4 h-4" />;
  };

  return (
    <div className="flex flex-col h-full bg-gradient-to-br from-background via-background to-primary/5">
      {/* Header */}
      <div className="border-b border-border bg-background/80 backdrop-blur-sm p-4">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2.5 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20">
            <Package className="w-6 h-6 text-primary" />
          </div>
          <div className="flex-1">
            <h1 className="text-xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">
              Urbanshade Store
            </h1>
            <p className="text-xs text-muted-foreground">Discover amazing apps</p>
          </div>
          <Badge variant="outline" className="gap-1.5 px-3 py-1.5">
            <Package className="w-3 h-3" />
            {AVAILABLE_APPS.length} Apps
          </Badge>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="w-full grid grid-cols-3">
            <TabsTrigger value="browse" className="gap-2">
              <Sparkles className="w-4 h-4" />
              Browse
            </TabsTrigger>
            <TabsTrigger value="installed" className="gap-2">
              <Check className="w-4 h-4" />
              Installed ({installedApps.length})
            </TabsTrigger>
            <TabsTrigger value="updates" className="gap-2">
              <RefreshCw className="w-4 h-4" />
              Updates
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <ScrollArea className="flex-1">
        {activeTab === "browse" && (
          <div className="p-4 space-y-6">
            {/* Featured Carousel */}
            <div className="relative rounded-xl overflow-hidden bg-gradient-to-br from-primary/20 via-primary/10 to-background border border-primary/20">
              <div className="p-6 flex items-center gap-6">
                <div className="flex-1">
                  <Badge className="mb-2 bg-primary/20 text-primary border-primary/30">
                    <Sparkles className="w-3 h-3 mr-1" />
                    Featured
                  </Badge>
                  <h2 className="text-2xl font-bold mb-2">{featuredApps[featuredIndex]?.name}</h2>
                  <p className="text-sm text-muted-foreground mb-4">
                    {featuredApps[featuredIndex]?.description}
                  </p>
                  <div className="flex items-center gap-4">
                    {renderStars(featuredApps[featuredIndex]?.rating || 0)}
                    <span className="text-sm text-muted-foreground">
                      {featuredApps[featuredIndex]?.downloads} downloads
                    </span>
                  </div>
                </div>
                <Button 
                  size="lg"
                  className="shrink-0"
                  onClick={() => featuredApps[featuredIndex] && handleInstall(featuredApps[featuredIndex])}
                  disabled={isInstalled(featuredApps[featuredIndex]?.id || '') || isDownloading(featuredApps[featuredIndex]?.id || '')}
                >
                  {isInstalled(featuredApps[featuredIndex]?.id || '') ? (
                    <>
                      <Check className="w-4 h-4 mr-2" />
                      Installed
                    </>
                  ) : (
                    <>
                      <Download className="w-4 h-4 mr-2" />
                      Get App
                    </>
                  )}
                </Button>
              </div>
              
              {/* Carousel dots */}
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                {featuredApps.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setFeaturedIndex(i)}
                    className={cn(
                      "w-2 h-2 rounded-full transition-all",
                      i === featuredIndex ? "bg-primary w-6" : "bg-primary/30"
                    )}
                  />
                ))}
              </div>

              {/* Navigation arrows */}
              <button 
                onClick={() => setFeaturedIndex(prev => prev === 0 ? featuredApps.length - 1 : prev - 1)}
                className="absolute left-2 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-background/80 hover:bg-background transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button 
                onClick={() => setFeaturedIndex(prev => (prev + 1) % featuredApps.length)}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-background/80 hover:bg-background transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search apps..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 h-11"
              />
            </div>

            {/* Categories */}
            <ScrollArea className="w-full">
              <div className="flex gap-2 pb-2">
                {categories.map(cat => (
                  <Button
                    key={cat}
                    variant={selectedCategory === cat ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedCategory(cat)}
                    className="gap-1.5 shrink-0"
                  >
                    {cat !== "All" && <CategoryIcon category={cat} />}
                    {cat}
                  </Button>
                ))}
              </div>
            </ScrollArea>

            {/* New Apps Section */}
            {selectedCategory === "All" && !search && (
              <div>
                <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-green-400" />
                  New & Updated
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  {AVAILABLE_APPS.filter(a => a.new).slice(0, 4).map(app => (
                    <AppCard 
                      key={app.id} 
                      app={app} 
                      compact
                      isInstalled={isInstalled(app.id)}
                      isDownloading={isDownloading(app.id)}
                      downloadState={getDownloadState(app.id)}
                      onInstall={() => handleInstall(app)}
                      onView={() => setSelectedApp(app)}
                      renderStars={renderStars}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* All Apps Grid */}
            <div>
              <h3 className="text-sm font-semibold mb-3">
                {selectedCategory === "All" ? "All Apps" : selectedCategory}
              </h3>
              <div className="grid gap-3">
                {filteredApps.map(app => (
                  <AppCard 
                    key={app.id} 
                    app={app}
                    isInstalled={isInstalled(app.id)}
                    isDownloading={isDownloading(app.id)}
                    downloadState={getDownloadState(app.id)}
                    onInstall={() => handleInstall(app)}
                    onUninstall={() => handleUninstall(app.id, app.name)}
                    onView={() => setSelectedApp(app)}
                    renderStars={renderStars}
                  />
                ))}
              </div>

              {filteredApps.length === 0 && (
                <div className="text-center py-12 text-muted-foreground">
                  <Package className="w-12 h-12 mx-auto mb-3 opacity-30" />
                  <p className="font-medium">No apps found</p>
                  <p className="text-sm">Try adjusting your search</p>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === "installed" && (
          <InstalledAppsTab 
            installedApps={installedApps}
            allApps={AVAILABLE_APPS}
            onUninstall={handleUninstall}
            onView={setSelectedApp}
            renderStars={renderStars}
          />
        )}

        {activeTab === "updates" && (
          <UpdatesTab 
            installedApps={installedApps}
            allApps={AVAILABLE_APPS}
          />
        )}
      </ScrollArea>

      {/* App Detail Modal */}
      {selectedApp && (
        <AppDetailModal 
          app={selectedApp}
          isInstalled={isInstalled(selectedApp.id)}
          isDownloading={isDownloading(selectedApp.id)}
          downloadState={getDownloadState(selectedApp.id)}
          onClose={() => setSelectedApp(null)}
          onInstall={() => handleInstall(selectedApp)}
          onUninstall={() => handleUninstall(selectedApp.id, selectedApp.name)}
          renderStars={renderStars}
        />
      )}

      {/* Active Downloads Bar */}
      {downloads.length > 0 && (
        <div className="border-t border-border bg-background p-3">
          <div className="text-xs text-muted-foreground mb-2">
            Downloading {downloads.length} app(s)
          </div>
          {downloads.map(dl => {
            const app = AVAILABLE_APPS.find(a => a.id === dl.appId);
            return (
              <div key={dl.appId} className="flex items-center gap-3">
                <span className="text-sm font-medium truncate flex-1">{app?.name}</span>
                <div className="w-32">
                  <Progress value={dl.progress} className="h-1.5" />
                </div>
                <span className="text-xs text-muted-foreground w-20 text-right">
                  {dl.status === 'downloading' && `${Math.round(dl.progress)}%`}
                  {dl.status === 'installing' && 'Installing...'}
                  {dl.status === 'complete' && '✓ Done'}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

// App Card Component
interface AppCardProps {
  app: StoreApp;
  compact?: boolean;
  isInstalled: boolean;
  isDownloading: boolean;
  downloadState?: DownloadState;
  onInstall: () => void;
  onUninstall?: () => void;
  onView: () => void;
  renderStars: (rating: number) => React.ReactNode;
}

const AppCard = ({ 
  app, compact, isInstalled, isDownloading, downloadState, 
  onInstall, onUninstall, onView, renderStars 
}: AppCardProps) => {
  const CategoryIcon = CATEGORY_ICONS[app.category] || Package;

  if (compact) {
    return (
      <button
        onClick={onView}
        className="flex items-center gap-3 p-3 rounded-xl border border-border bg-card hover:bg-accent/50 transition-all text-left"
      >
        <div className="p-2 rounded-lg bg-primary/10">
          <CategoryIcon className="w-5 h-5 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-medium text-sm truncate">{app.name}</div>
          <div className="flex items-center gap-2">
            {renderStars(app.rating)}
            {app.new && (
              <Badge variant="secondary" className="text-[10px] px-1.5 py-0">NEW</Badge>
            )}
          </div>
        </div>
      </button>
    );
  }

  return (
    <div className="group flex items-start gap-4 p-4 rounded-xl border border-border bg-card hover:border-primary/30 transition-all">
      <button onClick={onView} className="p-3 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 shrink-0">
        <CategoryIcon className="w-6 h-6 text-primary" />
      </button>
      
      <div className="flex-1 min-w-0">
        <button onClick={onView} className="text-left">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-semibold group-hover:text-primary transition-colors">{app.name}</h3>
            {app.new && <Badge className="bg-green-500/20 text-green-400 text-[10px]">NEW</Badge>}
            {app.featured && <Badge className="bg-amber-500/20 text-amber-400 text-[10px]">⭐</Badge>}
          </div>
          <p className="text-sm text-muted-foreground line-clamp-1 mb-2">{app.description}</p>
        </button>
        
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            {renderStars(app.rating)}
            <span className="ml-1">{app.rating}</span>
          </div>
          <span>{app.downloads}</span>
          <span>{app.size}</span>
        </div>
      </div>

      <div className="flex gap-2 shrink-0">
        {isDownloading ? (
          <Button size="sm" disabled className="gap-2 w-24">
            <Loader2 className="w-3 h-3 animate-spin" />
            {Math.round(downloadState?.progress || 0)}%
          </Button>
        ) : isInstalled ? (
          <>
            <Button variant="outline" size="sm" className="gap-1" disabled>
              <Check className="w-3 h-3" />
            </Button>
            {onUninstall && (
              <Button variant="ghost" size="sm" onClick={onUninstall} className="text-destructive hover:text-destructive">
                <Trash2 className="w-3 h-3" />
              </Button>
            )}
          </>
        ) : (
          <Button size="sm" onClick={onInstall} className="gap-2">
            <Download className="w-3 h-3" />
            Get
          </Button>
        )}
      </div>
    </div>
  );
};

// Installed Apps Tab
const InstalledAppsTab = ({ 
  installedApps, allApps, onUninstall, onView, renderStars 
}: {
  installedApps: string[];
  allApps: StoreApp[];
  onUninstall: (id: string, name: string) => void;
  onView: (app: StoreApp) => void;
  renderStars: (rating: number) => React.ReactNode;
}) => {
  const installed = allApps.filter(app => installedApps.includes(app.id));
  const totalSize = installed.reduce((sum, app) => {
    const size = parseFloat(app.size.replace(/[^\d.]/g, ''));
    return sum + size;
  }, 0);

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between p-4 rounded-xl bg-muted/50 border border-border">
        <div className="flex items-center gap-3">
          <HardDrive className="w-5 h-5 text-primary" />
          <div>
            <div className="font-medium">Storage Used</div>
            <div className="text-sm text-muted-foreground">{installed.length} apps installed</div>
          </div>
        </div>
        <div className="text-right">
          <div className="text-xl font-bold">{totalSize.toFixed(1)} MB</div>
          <div className="text-xs text-muted-foreground">of 500 MB</div>
        </div>
      </div>

      {installed.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <Package className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p className="font-medium">No apps installed</p>
          <p className="text-sm">Browse the store to find apps</p>
        </div>
      ) : (
        <div className="space-y-2">
          {installed.map(app => {
            const CategoryIcon = CATEGORY_ICONS[app.category] || Package;
            return (
              <div key={app.id} className="flex items-center gap-3 p-3 rounded-lg border border-border bg-card">
                <div className="p-2 rounded-lg bg-primary/10">
                  <CategoryIcon className="w-4 h-4 text-primary" />
                </div>
                <div className="flex-1">
                  <div className="font-medium">{app.name}</div>
                  <div className="text-xs text-muted-foreground">{app.size} • v{app.version}</div>
                </div>
                <Button variant="ghost" size="sm" onClick={() => onView(app)}>
                  <Eye className="w-4 h-4" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => onUninstall(app.id, app.name)}
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

// Updates Tab
const UpdatesTab = ({ installedApps, allApps }: { installedApps: string[]; allApps: StoreApp[] }) => {
  const installed = allApps.filter(app => installedApps.includes(app.id));
  // Simulate some apps having updates
  const hasUpdates = installed.filter((_, i) => i % 3 === 0);

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">Available Updates</h3>
        {hasUpdates.length > 0 && (
          <Button size="sm" className="gap-2">
            <RefreshCw className="w-3 h-3" />
            Update All
          </Button>
        )}
      </div>

      {hasUpdates.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <Check className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p className="font-medium">All apps are up to date</p>
          <p className="text-sm">Check back later for updates</p>
        </div>
      ) : (
        <div className="space-y-2">
          {hasUpdates.map(app => (
            <div key={app.id} className="flex items-center gap-3 p-3 rounded-lg border border-border bg-card">
              <div className="flex-1">
                <div className="font-medium">{app.name}</div>
                <div className="text-xs text-muted-foreground">
                  v{app.version} → v{(parseFloat(app.version) + 0.1).toFixed(1)}.0
                </div>
              </div>
              <Button size="sm" className="gap-2">
                <RefreshCw className="w-3 h-3" />
                Update
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// App Detail Modal
const AppDetailModal = ({ 
  app, isInstalled, isDownloading, downloadState,
  onClose, onInstall, onUninstall, renderStars 
}: {
  app: StoreApp;
  isInstalled: boolean;
  isDownloading: boolean;
  downloadState?: DownloadState;
  onClose: () => void;
  onInstall: () => void;
  onUninstall: () => void;
  renderStars: (rating: number) => React.ReactNode;
}) => {
  const CategoryIcon = CATEGORY_ICONS[app.category] || Package;

  return (
    <div className="absolute inset-0 bg-background/95 backdrop-blur-sm z-50 flex flex-col">
      <div className="flex items-center justify-between p-4 border-b border-border">
        <button onClick={onClose} className="p-2 hover:bg-muted rounded-lg transition-colors">
          <ChevronLeft className="w-5 h-5" />
        </button>
        <h2 className="font-semibold">App Details</h2>
        <div className="w-9" />
      </div>

      <ScrollArea className="flex-1">
        <div className="p-6 space-y-6">
          {/* Header */}
          <div className="flex items-start gap-4">
            <div className="p-4 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20">
              <CategoryIcon className="w-10 h-10 text-primary" />
            </div>
            <div className="flex-1">
              <h1 className="text-2xl font-bold">{app.name}</h1>
              <p className="text-sm text-muted-foreground">{app.category}</p>
              <div className="flex items-center gap-3 mt-2">
                {renderStars(app.rating)}
                <span className="text-sm">{app.rating}</span>
                <span className="text-sm text-muted-foreground">({app.reviews?.length} reviews)</span>
              </div>
            </div>
          </div>

          {/* Install Button */}
          <div className="flex gap-3">
            {isDownloading ? (
              <Button size="lg" disabled className="flex-1 gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                Downloading... {Math.round(downloadState?.progress || 0)}%
              </Button>
            ) : isInstalled ? (
              <>
                <Button size="lg" variant="outline" disabled className="flex-1 gap-2">
                  <Check className="w-4 h-4" />
                  Installed
                </Button>
                <Button size="lg" variant="destructive" onClick={onUninstall}>
                  <Trash2 className="w-4 h-4" />
                </Button>
              </>
            ) : (
              <Button size="lg" onClick={onInstall} className="flex-1 gap-2">
                <Download className="w-4 h-4" />
                Download ({app.size})
              </Button>
            )}
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-3 rounded-lg bg-muted/50">
              <div className="text-lg font-bold">{app.downloads}</div>
              <div className="text-xs text-muted-foreground">Downloads</div>
            </div>
            <div className="text-center p-3 rounded-lg bg-muted/50">
              <div className="text-lg font-bold">v{app.version}</div>
              <div className="text-xs text-muted-foreground">Version</div>
            </div>
            <div className="text-center p-3 rounded-lg bg-muted/50">
              <div className="text-lg font-bold">{app.size}</div>
              <div className="text-xs text-muted-foreground">Size</div>
            </div>
          </div>

          {/* Description */}
          <div>
            <h3 className="font-semibold mb-2">Description</h3>
            <p className="text-sm text-muted-foreground">{app.description}</p>
          </div>

          {/* Permissions */}
          {app.permissions && (
            <div>
              <h3 className="font-semibold mb-2">Permissions</h3>
              <div className="flex flex-wrap gap-2">
                {app.permissions.map(perm => (
                  <Badge key={perm} variant="outline">{perm}</Badge>
                ))}
              </div>
            </div>
          )}

          {/* Reviews */}
          <div>
            <h3 className="font-semibold mb-3">Reviews</h3>
            <div className="space-y-3">
              {app.reviews?.map((review, i) => (
                <div key={i} className="p-3 rounded-lg bg-muted/30 border border-border">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-xs font-medium">
                        {review.user[0]}
                      </div>
                      <span className="text-sm font-medium">{review.user}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {renderStars(review.rating)}
                      <span className="text-xs text-muted-foreground">{review.date}</span>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">{review.comment}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </ScrollArea>
    </div>
  );
};
