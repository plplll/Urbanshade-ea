import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Save, FileText, FolderOpen, File, Plus } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import { useVirtualFileSystem, VirtualFile } from "@/hooks/useVirtualFileSystem";

export const Notepad = () => {
  const [content, setContent] = useState("");
  const [fileName, setFileName] = useState("Untitled.txt");
  const [currentFileId, setCurrentFileId] = useState<string | null>(null);
  const [modified, setModified] = useState(false);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [showOpenDialog, setShowOpenDialog] = useState(false);
  const [newFileName, setNewFileName] = useState("Untitled.txt");
  const [selectedFolder, setSelectedFolder] = useState("documents");

  const { files, getChildren, createFile, updateFile, getFile, getPath } = useVirtualFileSystem();

  // Get text files for open dialog
  const textFiles = files.filter(f => f.type === "file" && (f.extension === "txt" || f.extension === "md" || f.extension === "log"));
  const folders = files.filter(f => f.type === "folder" && f.id !== "root");

  const handleContentChange = (value: string) => {
    setContent(value);
    setModified(true);
  };

  const handleNew = () => {
    if (modified && !window.confirm("You have unsaved changes. Create new file anyway?")) return;
    setContent("");
    setFileName("Untitled.txt");
    setCurrentFileId(null);
    setModified(false);
  };

  const handleSave = () => {
    if (currentFileId) {
      // Update existing file
      updateFile(currentFileId, content);
      setModified(false);
      toast.success(`${fileName} saved!`);
    } else {
      // Show save dialog for new file
      setShowSaveDialog(true);
    }
  };

  const handleSaveAs = () => {
    setShowSaveDialog(true);
  };

  const handleSaveConfirm = () => {
    const name = newFileName.endsWith('.txt') ? newFileName : `${newFileName}.txt`;
    const newFile = createFile(name, selectedFolder, content);
    setCurrentFileId(newFile.id);
    setFileName(name);
    setModified(false);
    setShowSaveDialog(false);
    toast.success(`${name} saved to ${folders.find(f => f.id === selectedFolder)?.name || 'Documents'}!`);
  };

  const handleOpen = (file: VirtualFile) => {
    if (modified && !window.confirm("You have unsaved changes. Open another file anyway?")) return;
    setContent(file.content || "");
    setFileName(file.name);
    setCurrentFileId(file.id);
    setModified(false);
    setShowOpenDialog(false);
    toast.success(`Opened ${file.name}`);
  };

  return (
    <div className="flex flex-col h-full bg-gradient-to-br from-background to-muted/10">
      {/* Toolbar */}
      <div className="border-b border-border/50 p-3 flex items-center gap-2 bg-background/50 backdrop-blur-sm">
        <FileText className="w-5 h-5 text-primary" />
        <span className="text-sm font-mono font-semibold text-foreground">
          {fileName}{modified ? " •" : ""}
        </span>
        <div className="flex-1" />
        <Button size="sm" variant="ghost" onClick={handleNew} title="New">
          <Plus className="w-4 h-4" />
        </Button>
        <Button size="sm" variant="ghost" onClick={() => setShowOpenDialog(true)} title="Open">
          <FolderOpen className="w-4 h-4" />
        </Button>
        <Button size="sm" className="bg-primary hover:bg-primary/90 gap-2" onClick={handleSave}>
          <Save className="w-4 h-4" />
          Save
        </Button>
      </div>

      {/* Editor */}
      <div className="flex-1 p-4">
        <Textarea
          value={content}
          onChange={(e) => handleContentChange(e.target.value)}
          placeholder="Start typing your notes..."
          className="h-full border border-border/30 rounded-lg resize-none focus-visible:ring-2 focus-visible:ring-primary/50 font-mono text-base bg-background/50 backdrop-blur-sm"
        />
      </div>

      {/* Status Bar */}
      <div className="border-t border-border/50 px-4 py-1 text-xs text-muted-foreground flex justify-between bg-muted/30">
        <span>{content.length} characters | {content.split('\n').length} lines</span>
        <span>{currentFileId ? getPath(currentFileId) : "Unsaved"}</span>
      </div>

      {/* Save Dialog */}
      <Dialog open={showSaveDialog} onOpenChange={setShowSaveDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Save File</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">File name</label>
              <Input
                value={newFileName}
                onChange={(e) => setNewFileName(e.target.value)}
                placeholder="filename.txt"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Save to folder</label>
              <div className="grid grid-cols-2 gap-2">
                {folders.map(folder => (
                  <button
                    key={folder.id}
                    onClick={() => setSelectedFolder(folder.id)}
                    className={`p-3 rounded-lg border text-left transition-all ${
                      selectedFolder === folder.id 
                        ? "border-primary bg-primary/10" 
                        : "border-border hover:bg-muted/50"
                    }`}
                  >
                    <div className="text-sm font-medium">{folder.name}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSaveDialog(false)}>Cancel</Button>
            <Button onClick={handleSaveConfirm}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Open Dialog */}
      <Dialog open={showOpenDialog} onOpenChange={setShowOpenDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Open File</DialogTitle>
          </DialogHeader>
          <ScrollArea className="h-64">
            <div className="space-y-2 p-1">
              {textFiles.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">No text files found</p>
              ) : (
                textFiles.map(file => (
                  <button
                    key={file.id}
                    onClick={() => handleOpen(file)}
                    className="w-full p-3 rounded-lg border border-border hover:bg-muted/50 text-left transition-all flex items-center gap-3"
                  >
                    <File className="w-4 h-4 text-primary" />
                    <div>
                      <div className="text-sm font-medium">{file.name}</div>
                      <div className="text-xs text-muted-foreground">{getPath(file.id)}</div>
                    </div>
                  </button>
                ))
              )}
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </div>
  );
};
