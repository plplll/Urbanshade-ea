import { useState, useEffect } from "react";
import { 
  Puzzle, Download, Check, Palette, Terminal, Zap, Search, 
  Sparkles, Layout, Shield, Code, Star, Trash2, ChevronLeft,
  Eye, Users, Clock, ExternalLink
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface Plugin {
  id: string;
  name: string;
  category: "theme" | "command" | "widget" | "defdev" | "utility";
  description: string;
  version: string;
  author: string;
  downloads: string;
  rating: number;
  featured?: boolean;
  new?: boolean;
  config?: Record<string, unknown>;
}

const CATEGORY_CONFIG: Record<string, { icon: typeof Puzzle; label: string; color: string }> = {
  theme: { icon: Palette, label: "Themes", color: "text-pink-400" },
  command: { icon: Terminal, label: "Commands", color: "text-green-400" },
  widget: { icon: Layout, label: "Widgets", color: "text-blue-400" },
  defdev: { icon: Code, label: "DEF-DEV", color: "text-purple-400" },
  utility: { icon: Zap, label: "Utilities", color: "text-amber-400" },
};

const AVAILABLE_PLUGINS: Plugin[] = [
  // Themes
  { id: "dark-neon", name: "Dark Neon", category: "theme", description: "Cyberpunk-inspired neon theme with glowing accents", version: "1.0.0", author: "ThemeStudio", downloads: "12.4K", rating: 4.8, featured: true },
  { id: "ocean-blue", name: "Ocean Blue", category: "theme", description: "Calming deep ocean underwater theme", version: "1.2.0", author: "ColorCraft", downloads: "8.9K", rating: 4.5 },
  { id: "blood-red", name: "Blood Red", category: "theme", description: "Intense crimson horror aesthetic", version: "1.0.1", author: "DarkDesigns", downloads: "6.2K", rating: 4.3 },
  { id: "forest-green", name: "Forest Green", category: "theme", description: "Natural earth tones with organic feel", version: "1.1.0", author: "NatureUI", downloads: "5.1K", rating: 4.4, new: true },
  { id: "midnight-purple", name: "Midnight Purple", category: "theme", description: "Deep violet gradient luxury theme", version: "2.0.0", author: "ThemeStudio", downloads: "9.7K", rating: 4.7, featured: true },
  
  // Commands
  { id: "cmd-sysinfo", name: "sysinfo", category: "command", description: "Display detailed system specs and diagnostics", version: "2.0.0", author: "SysTech", downloads: "15.3K", rating: 4.9, featured: true },
  { id: "cmd-netstat", name: "netstat", category: "command", description: "Show active network connections and ports", version: "1.5.0", author: "NetTools", downloads: "11.2K", rating: 4.6 },
  { id: "cmd-hack", name: "hack", category: "command", description: "Fun movie-style hacking simulation", version: "1.0.0", author: "HackSim", downloads: "22.8K", rating: 4.8 },
  { id: "cmd-matrix", name: "matrix", category: "command", description: "Classic falling code animation", version: "1.1.0", author: "RetroFX", downloads: "18.4K", rating: 4.7, new: true },
  { id: "cmd-weather", name: "weather", category: "command", description: "Check weather from terminal", version: "1.3.0", author: "CliWeather", downloads: "7.5K", rating: 4.4 },
  { id: "cmd-cowsay", name: "cowsay", category: "command", description: "ASCII art cow with custom messages", version: "1.0.0", author: "FunCLI", downloads: "4.2K", rating: 4.5 },
  
  // Widgets
  { id: "widget-spotify", name: "Music Widget", category: "widget", description: "Mini music player widget for desktop", version: "1.2.0", author: "AudioLabs", downloads: "14.1K", rating: 4.6, featured: true },
  { id: "widget-crypto", name: "Crypto Ticker", category: "widget", description: "Real-time cryptocurrency prices", version: "2.1.0", author: "FinanceUI", downloads: "9.8K", rating: 4.3 },
  { id: "widget-todo", name: "Todo Widget", category: "widget", description: "Quick task list on desktop", version: "1.5.0", author: "ProductivityPro", downloads: "16.7K", rating: 4.7, new: true },
  { id: "widget-pomodoro", name: "Pomodoro Timer", category: "widget", description: "Focus timer with break reminders", version: "1.0.0", author: "FocusApps", downloads: "8.3K", rating: 4.5 },
  
  // DEF-DEV
  { id: "defdev-react-inspector", name: "React Inspector", category: "defdev", description: "Enhanced component tree visualization", version: "3.0.0", author: "DevToolsPro", downloads: "5.4K", rating: 4.9, featured: true },
  { id: "defdev-network-mock", name: "Network Mocker", category: "defdev", description: "Mock API responses for testing", version: "1.2.0", author: "TestingLib", downloads: "3.8K", rating: 4.6 },
  { id: "defdev-perf-monitor", name: "Performance Monitor", category: "defdev", description: "Advanced performance profiling", version: "2.0.0", author: "OptimizeJS", downloads: "4.2K", rating: 4.7, new: true },
  
  // Utilities
  { id: "quick-notes", name: "Quick Notes Widget", category: "utility", description: "Sticky notes overlay on desktop", version: "2.1.0", author: "ProductivityPro", downloads: "19.5K", rating: 4.6 },
  { id: "auto-backup", name: "Auto Backup", category: "utility", description: "Automatic scheduled backups", version: "3.0.0", author: "BackupTools", downloads: "13.2K", rating: 4.5 },
  { id: "screen-recorder", name: "Screen Recorder", category: "utility", description: "Record screen with audio", version: "1.4.0", author: "MediaSuite", downloads: "8.9K", rating: 4.4, new: true },
  { id: "clipboard-history", name: "Clipboard Manager", category: "utility", description: "Access clipboard history", version: "2.2.0", author: "UtilityMaster", downloads: "11.7K", rating: 4.8, featured: true },
];

export const PluginStore = () => {
  const [installedPlugins, setInstalledPlugins] = useState<string[]>(() => {
    const saved = localStorage.getItem('installed_plugins');
    return saved ? JSON.parse(saved) : [];
  });
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedPlugin, setSelectedPlugin] = useState<Plugin | null>(null);
  const [activeTab, setActiveTab] = useState("browse");

  useEffect(() => {
    localStorage.setItem('installed_plugins', JSON.stringify(installedPlugins));
    window.dispatchEvent(new Event('storage'));
  }, [installedPlugins]);

  const filteredPlugins = AVAILABLE_PLUGINS.filter(plugin => {
    const matchesSearch = plugin.name.toLowerCase().includes(search.toLowerCase()) || 
                         plugin.description.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = selectedCategory === "all" || plugin.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleInstall = (plugin: Plugin) => {
    setInstalledPlugins(prev => [...prev, plugin.id]);
    
    // Apply plugin based on category
    if (plugin.category === "theme") {
      applyTheme(plugin);
    } else if (plugin.category === "command") {
      registerCommand(plugin);
    } else {
      toast.success(`${plugin.name} installed!`);
    }
  };

  const applyTheme = (plugin: Plugin) => {
    const themeMap: Record<string, { primary: string; accent: string; background: string }> = {
      'dark-neon': { primary: '180 100% 50%', accent: '300 100% 50%', background: '240 100% 5%' },
      'ocean-blue': { primary: '200 100% 50%', accent: '210 100% 60%', background: '210 80% 10%' },
      'blood-red': { primary: '0 100% 50%', accent: '10 100% 60%', background: '0 50% 5%' },
      'forest-green': { primary: '142 70% 45%', accent: '120 60% 50%', background: '140 40% 8%' },
      'midnight-purple': { primary: '280 80% 55%', accent: '260 70% 60%', background: '270 50% 8%' },
    };
    
    const theme = themeMap[plugin.id];
    if (theme) {
      Object.entries(theme).forEach(([key, value]) => {
        document.documentElement.style.setProperty(`--${key}`, String(value));
        localStorage.setItem(`theme_${key}`, String(value));
      });
      localStorage.setItem('active_theme', plugin.id);
      toast.success(`${plugin.name} theme applied!`);
    }
  };

  const registerCommand = (plugin: Plugin) => {
    const commands = JSON.parse(localStorage.getItem('plugin_commands') || '[]');
    commands.push({
      id: plugin.id,
      name: plugin.name.toLowerCase().replace(/\s/g, ''),
      description: plugin.description
    });
    localStorage.setItem('plugin_commands', JSON.stringify(commands));
    toast.success(`Command registered! Use in Terminal.`);
  };

  const handleUninstall = (pluginId: string) => {
    setInstalledPlugins(prev => prev.filter(id => id !== pluginId));
    toast.success("Plugin uninstalled");
  };

  const isInstalled = (pluginId: string) => installedPlugins.includes(pluginId);

  const renderStars = (rating: number) => (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map(star => (
        <Star 
          key={star}
          className={cn(
            "w-3 h-3",
            star <= Math.floor(rating) 
              ? "fill-amber-400 text-amber-400" 
              : "text-muted-foreground"
          )}
        />
      ))}
    </div>
  );

  return (
    <div className="flex flex-col h-full bg-gradient-to-br from-background via-background to-purple-500/5">
      {/* Header */}
      <div className="border-b border-border bg-background/80 backdrop-blur-sm p-4">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2.5 rounded-xl bg-gradient-to-br from-purple-500/20 to-purple-500/5 border border-purple-500/20">
            <Puzzle className="w-6 h-6 text-purple-400" />
          </div>
          <div className="flex-1">
            <h1 className="text-xl font-bold">Plugin Store</h1>
            <p className="text-xs text-muted-foreground">Extend your system</p>
          </div>
          <Badge variant="outline" className="gap-1.5 px-3 py-1.5">
            <Puzzle className="w-3 h-3" />
            {installedPlugins.length} Installed
          </Badge>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="w-full grid grid-cols-2">
            <TabsTrigger value="browse" className="gap-2">
              <Sparkles className="w-4 h-4" />
              Browse
            </TabsTrigger>
            <TabsTrigger value="installed" className="gap-2">
              <Check className="w-4 h-4" />
              Installed
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <ScrollArea className="flex-1">
        {activeTab === "browse" && (
          <div className="p-4 space-y-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search plugins..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Category Filters */}
            <div className="flex gap-2 flex-wrap">
              <Button
                variant={selectedCategory === "all" ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory("all")}
              >
                All
              </Button>
              {Object.entries(CATEGORY_CONFIG).map(([key, config]) => {
                const Icon = config.icon;
                return (
                  <Button
                    key={key}
                    variant={selectedCategory === key ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedCategory(key)}
                    className="gap-1.5"
                  >
                    <Icon className={cn("w-3 h-3", selectedCategory !== key && config.color)} />
                    {config.label}
                  </Button>
                );
              })}
            </div>

            {/* Featured Section */}
            {selectedCategory === "all" && !search && (
              <div>
                <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  Featured Plugins
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  {AVAILABLE_PLUGINS.filter(p => p.featured).slice(0, 4).map(plugin => (
                    <PluginCard
                      key={plugin.id}
                      plugin={plugin}
                      compact
                      isInstalled={isInstalled(plugin.id)}
                      onInstall={() => handleInstall(plugin)}
                      onView={() => setSelectedPlugin(plugin)}
                      renderStars={renderStars}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Plugin List */}
            <div className="space-y-2">
              {filteredPlugins.map(plugin => (
                <PluginCard
                  key={plugin.id}
                  plugin={plugin}
                  isInstalled={isInstalled(plugin.id)}
                  onInstall={() => handleInstall(plugin)}
                  onUninstall={() => handleUninstall(plugin.id)}
                  onView={() => setSelectedPlugin(plugin)}
                  renderStars={renderStars}
                />
              ))}

              {filteredPlugins.length === 0 && (
                <div className="text-center py-12 text-muted-foreground">
                  <Puzzle className="w-12 h-12 mx-auto mb-3 opacity-30" />
                  <p className="font-medium">No plugins found</p>
                  <p className="text-sm">Try adjusting your search</p>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === "installed" && (
          <div className="p-4 space-y-3">
            {installedPlugins.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Puzzle className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p className="font-medium">No plugins installed</p>
                <p className="text-sm">Browse the store to find plugins</p>
              </div>
            ) : (
              AVAILABLE_PLUGINS.filter(p => installedPlugins.includes(p.id)).map(plugin => (
                <PluginCard
                  key={plugin.id}
                  plugin={plugin}
                  isInstalled
                  onInstall={() => {}}
                  onUninstall={() => handleUninstall(plugin.id)}
                  onView={() => setSelectedPlugin(plugin)}
                  renderStars={renderStars}
                />
              ))
            )}
          </div>
        )}
      </ScrollArea>

      {/* Plugin Detail Modal */}
      {selectedPlugin && (
        <PluginDetailModal
          plugin={selectedPlugin}
          isInstalled={isInstalled(selectedPlugin.id)}
          onClose={() => setSelectedPlugin(null)}
          onInstall={() => handleInstall(selectedPlugin)}
          onUninstall={() => handleUninstall(selectedPlugin.id)}
          renderStars={renderStars}
        />
      )}
    </div>
  );
};

// Plugin Card Component
interface PluginCardProps {
  plugin: Plugin;
  compact?: boolean;
  isInstalled: boolean;
  onInstall: () => void;
  onUninstall?: () => void;
  onView: () => void;
  renderStars: (rating: number) => React.ReactNode;
}

const PluginCard = ({ 
  plugin, compact, isInstalled, onInstall, onUninstall, onView, renderStars 
}: PluginCardProps) => {
  const config = CATEGORY_CONFIG[plugin.category];
  const Icon = config?.icon || Puzzle;

  if (compact) {
    return (
      <button
        onClick={onView}
        className="flex items-center gap-3 p-3 rounded-xl border border-border bg-card hover:bg-accent/50 transition-all text-left"
      >
        <div className={cn("p-2 rounded-lg bg-muted/50", config?.color)}>
          <Icon className="w-5 h-5" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-medium text-sm truncate">{plugin.name}</div>
          <div className="flex items-center gap-2">
            {renderStars(plugin.rating)}
          </div>
        </div>
      </button>
    );
  }

  return (
    <div className="group flex items-start gap-3 p-3 rounded-xl border border-border bg-card hover:border-primary/30 transition-all">
      <button 
        onClick={onView}
        className={cn("p-2.5 rounded-xl bg-muted/50 shrink-0", config?.color)}
      >
        <Icon className="w-5 h-5" />
      </button>
      
      <div className="flex-1 min-w-0">
        <button onClick={onView} className="text-left w-full">
          <div className="flex items-center gap-2 mb-0.5">
            <h3 className="font-semibold text-sm group-hover:text-primary transition-colors">{plugin.name}</h3>
            {plugin.new && <Badge className="bg-green-500/20 text-green-400 text-[10px] px-1.5">NEW</Badge>}
          </div>
          <p className="text-xs text-muted-foreground line-clamp-1 mb-1.5">{plugin.description}</p>
        </button>
        
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          {renderStars(plugin.rating)}
          <span>{plugin.downloads}</span>
          <Badge variant="outline" className="text-[10px] capitalize">{plugin.category}</Badge>
        </div>
      </div>

      <div className="flex gap-2 shrink-0">
        {isInstalled ? (
          <>
            <Button variant="outline" size="sm" disabled className="gap-1 text-xs">
              <Check className="w-3 h-3" />
            </Button>
            {onUninstall && (
              <Button variant="ghost" size="sm" onClick={onUninstall} className="text-destructive">
                <Trash2 className="w-3 h-3" />
              </Button>
            )}
          </>
        ) : (
          <Button size="sm" onClick={onInstall} className="gap-1 text-xs">
            <Download className="w-3 h-3" />
            Install
          </Button>
        )}
      </div>
    </div>
  );
};

// Plugin Detail Modal
const PluginDetailModal = ({ 
  plugin, isInstalled, onClose, onInstall, onUninstall, renderStars 
}: {
  plugin: Plugin;
  isInstalled: boolean;
  onClose: () => void;
  onInstall: () => void;
  onUninstall: () => void;
  renderStars: (rating: number) => React.ReactNode;
}) => {
  const config = CATEGORY_CONFIG[plugin.category];
  const Icon = config?.icon || Puzzle;

  return (
    <div className="absolute inset-0 bg-background/95 backdrop-blur-sm z-50 flex flex-col">
      <div className="flex items-center justify-between p-4 border-b border-border">
        <button onClick={onClose} className="p-2 hover:bg-muted rounded-lg transition-colors">
          <ChevronLeft className="w-5 h-5" />
        </button>
        <h2 className="font-semibold">Plugin Details</h2>
        <div className="w-9" />
      </div>

      <ScrollArea className="flex-1">
        <div className="p-6 space-y-6">
          {/* Header */}
          <div className="flex items-start gap-4">
            <div className={cn(
              "p-4 rounded-2xl bg-muted/50 border border-border",
              config?.color
            )}>
              <Icon className="w-10 h-10" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold">{plugin.name}</h1>
                {plugin.featured && <Badge className="bg-amber-500/20 text-amber-400">Featured</Badge>}
              </div>
              <p className="text-sm text-muted-foreground capitalize">{plugin.category} Plugin</p>
              <div className="flex items-center gap-3 mt-2">
                {renderStars(plugin.rating)}
                <span className="text-sm">{plugin.rating}</span>
              </div>
            </div>
          </div>

          {/* Install Button */}
          {isInstalled ? (
            <div className="flex gap-3">
              <Button size="lg" variant="outline" disabled className="flex-1 gap-2">
                <Check className="w-4 h-4" />
                Installed
              </Button>
              <Button size="lg" variant="destructive" onClick={onUninstall}>
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          ) : (
            <Button size="lg" onClick={onInstall} className="w-full gap-2">
              <Download className="w-4 h-4" />
              Install Plugin
            </Button>
          )}

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-3 rounded-lg bg-muted/50">
              <div className="text-lg font-bold">{plugin.downloads}</div>
              <div className="text-xs text-muted-foreground">Downloads</div>
            </div>
            <div className="text-center p-3 rounded-lg bg-muted/50">
              <div className="text-lg font-bold">v{plugin.version}</div>
              <div className="text-xs text-muted-foreground">Version</div>
            </div>
            <div className="text-center p-3 rounded-lg bg-muted/50">
              <div className="text-lg font-bold">{plugin.rating}</div>
              <div className="text-xs text-muted-foreground">Rating</div>
            </div>
          </div>

          {/* Description */}
          <div>
            <h3 className="font-semibold mb-2">Description</h3>
            <p className="text-sm text-muted-foreground">{plugin.description}</p>
          </div>

          {/* Author */}
          <div>
            <h3 className="font-semibold mb-2">Developer</h3>
            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/30">
              <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center font-bold">
                {plugin.author[0]}
              </div>
              <div>
                <div className="font-medium">{plugin.author}</div>
                <div className="text-xs text-muted-foreground">Verified Developer</div>
              </div>
            </div>
          </div>
        </div>
      </ScrollArea>
    </div>
  );
};
