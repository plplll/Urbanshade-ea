import { useState, useEffect, useCallback } from "react";

export interface VirtualFile {
  id: string;
  name: string;
  type: "file" | "folder";
  content?: string;
  parentId: string | null;
  createdAt: string;
  modifiedAt: string;
  size: number;
  extension?: string;
}

const DEFAULT_FILES: VirtualFile[] = [
  { id: "root", name: "Root", type: "folder", parentId: null, createdAt: new Date().toISOString(), modifiedAt: new Date().toISOString(), size: 0 },
  { id: "documents", name: "Documents", type: "folder", parentId: "root", createdAt: new Date().toISOString(), modifiedAt: new Date().toISOString(), size: 0 },
  { id: "downloads", name: "Downloads", type: "folder", parentId: "root", createdAt: new Date().toISOString(), modifiedAt: new Date().toISOString(), size: 0 },
  { id: "pictures", name: "Pictures", type: "folder", parentId: "root", createdAt: new Date().toISOString(), modifiedAt: new Date().toISOString(), size: 0 },
  { id: "system", name: "System", type: "folder", parentId: "root", createdAt: new Date().toISOString(), modifiedAt: new Date().toISOString(), size: 0 },
  { id: "readme", name: "README.txt", type: "file", content: "Welcome to Urbanshade OS!\n\nThis is your virtual file system. You can create, edit, and delete files here.\n\nTry creating a new document in the Documents folder!", parentId: "documents", createdAt: new Date().toISOString(), modifiedAt: new Date().toISOString(), size: 156, extension: "txt" },
  { id: "secrets", name: "CLASSIFIED.txt", type: "file", content: "[REDACTED]\n\nProject URBANSHADE - Level 5 Clearance Required\n\nSubject: Containment Breach Protocol\n\nIf you're reading this, you've accessed restricted files.\nReport to Section Chief immediately.\n\n- Dr. ████████", parentId: "system", createdAt: new Date().toISOString(), modifiedAt: new Date().toISOString(), size: 234, extension: "txt" },
];

export const useVirtualFileSystem = () => {
  const [files, setFiles] = useState<VirtualFile[]>(() => {
    const saved = localStorage.getItem('virtual_filesystem');
    return saved ? JSON.parse(saved) : DEFAULT_FILES;
  });

  useEffect(() => {
    localStorage.setItem('virtual_filesystem', JSON.stringify(files));
  }, [files]);

  const getChildren = useCallback((parentId: string | null) => {
    return files.filter(f => f.parentId === parentId);
  }, [files]);

  const getFile = useCallback((id: string) => {
    return files.find(f => f.id === id);
  }, [files]);

  const getPath = useCallback((fileId: string): string => {
    const file = files.find(f => f.id === fileId);
    if (!file || file.id === "root") return "/";
    
    const parts: string[] = [file.name];
    let current = file;
    while (current.parentId && current.parentId !== "root") {
      const parent = files.find(f => f.id === current.parentId);
      if (parent) {
        parts.unshift(parent.name);
        current = parent;
      } else break;
    }
    return "/" + parts.join("/");
  }, [files]);

  const createFile = useCallback((name: string, parentId: string, content: string = "") => {
    const extension = name.includes('.') ? name.split('.').pop() : undefined;
    const newFile: VirtualFile = {
      id: Date.now().toString(),
      name,
      type: "file",
      content,
      parentId,
      createdAt: new Date().toISOString(),
      modifiedAt: new Date().toISOString(),
      size: content.length,
      extension
    };
    setFiles(prev => [...prev, newFile]);
    return newFile;
  }, []);

  const createFolder = useCallback((name: string, parentId: string) => {
    const newFolder: VirtualFile = {
      id: Date.now().toString(),
      name,
      type: "folder",
      parentId,
      createdAt: new Date().toISOString(),
      modifiedAt: new Date().toISOString(),
      size: 0
    };
    setFiles(prev => [...prev, newFolder]);
    return newFolder;
  }, []);

  const updateFile = useCallback((id: string, content: string) => {
    setFiles(prev => prev.map(f => 
      f.id === id 
        ? { ...f, content, modifiedAt: new Date().toISOString(), size: content.length }
        : f
    ));
  }, []);

  const renameFile = useCallback((id: string, newName: string) => {
    setFiles(prev => prev.map(f => 
      f.id === id 
        ? { ...f, name: newName, modifiedAt: new Date().toISOString() }
        : f
    ));
  }, []);

  const deleteFile = useCallback((id: string) => {
    // Also delete all children if it's a folder
    const toDelete = new Set<string>([id]);
    const addChildren = (parentId: string) => {
      files.filter(f => f.parentId === parentId).forEach(f => {
        toDelete.add(f.id);
        if (f.type === "folder") addChildren(f.id);
      });
    };
    const file = files.find(f => f.id === id);
    if (file?.type === "folder") addChildren(id);
    
    setFiles(prev => prev.filter(f => !toDelete.has(f.id)));
  }, [files]);

  const moveFile = useCallback((id: string, newParentId: string) => {
    setFiles(prev => prev.map(f => 
      f.id === id 
        ? { ...f, parentId: newParentId, modifiedAt: new Date().toISOString() }
        : f
    ));
  }, []);

  const searchFiles = useCallback((query: string) => {
    const lowerQuery = query.toLowerCase();
    return files.filter(f => 
      f.name.toLowerCase().includes(lowerQuery) ||
      (f.content && f.content.toLowerCase().includes(lowerQuery))
    );
  }, [files]);

  return {
    files,
    getChildren,
    getFile,
    getPath,
    createFile,
    createFolder,
    updateFile,
    renameFile,
    deleteFile,
    moveFile,
    searchFiles
  };
};
