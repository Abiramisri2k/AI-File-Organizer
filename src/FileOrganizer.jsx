import React, { useState, useRef, useEffect } from 'react';
import { Folder, File, Image, FileText, Music, Video, MessageCircle, Send, X, Loader2, ChevronRight, Edit2, Trash2 } from 'lucide-react';

const INITIAL_FILES = [
  { id: 1, name: 'vacation.png', type: 'image', size: '2.3 MB', folder: null },
  { id: 2, name: 'report.pdf', type: 'document', size: '450 KB', folder: null },
  { id: 3, name: 'song.mp3', type: 'audio', size: '5.1 MB', folder: null },
  { id: 4, name: 'presentation.pptx', type: 'document', size: '8.2 MB', folder: null },
  { id: 5, name: 'photo1.jpg', type: 'image', size: '3.4 MB', folder: null },
  { id: 6, name: 'video.mp4', type: 'video', size: '45 MB', folder: null },
  { id: 7, name: 'screenshot.png', type: 'image', size: '1.2 MB', folder: null },
  { id: 8, name: 'notes.txt', type: 'document', size: '12 KB', folder: null },
];

const INITIAL_FOLDERS = [
  { id: 'images', name: 'Images', color: 'bg-blue-500', parent: null },
  { id: 'documents', name: 'Documents', color: 'bg-green-500', parent: null },
  { id: 'media', name: 'Media', color: 'bg-purple-500', parent: null },
];

const INITIAL_MESSAGE = {
  id: 1,
  text: "Hi 👋 I'm your AI File Organizer. Try commands like:\n• 'move vacation.png to Images'\n• 'move all png files to Images'\n• 'create folder called Projects'\n• 'create folder Photos inside Media'\n• 'rename Images to Pictures'\n• 'delete Documents folder'\n• 'undo' to revert last action\n• 'reset' to restore defaults",
  sender: 'ai'
};

const FileOrganizer = () => {
  const [files, setFiles] = useState([]);
  const [folders, setFolders] = useState([]);
  const [messages, setMessages] = useState([]);
  const [history, setHistory] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [chatHeight, setChatHeight] = useState(600);
  const [isResizing, setIsResizing] = useState(false);
  const [selectedFolder, setSelectedFolder] = useState(null);
  const [isLoaded, setIsLoaded] = useState(false);
  
  const chatEndRef = useRef(null);
  const chatWindowRef = useRef(null);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const savedFiles = localStorage.getItem('ai-organizer-files');
      const savedFolders = localStorage.getItem('ai-organizer-folders');
      const savedMessages = localStorage.getItem('ai-organizer-messages');
      const savedHistory = localStorage.getItem('ai-organizer-history');
      const savedChatHeight = localStorage.getItem('ai-organizer-chatHeight');
      const savedSelectedFolder = localStorage.getItem('ai-organizer-selectedFolder');

      setFiles(savedFiles ? JSON.parse(savedFiles) : INITIAL_FILES);
      setFolders(savedFolders ? JSON.parse(savedFolders) : INITIAL_FOLDERS);
      setMessages(savedMessages ? JSON.parse(savedMessages) : [INITIAL_MESSAGE]);
      setHistory(savedHistory ? JSON.parse(savedHistory) : []);
      setChatHeight(savedChatHeight ? parseInt(savedChatHeight, 10) : 600);
      setSelectedFolder(savedSelectedFolder && savedSelectedFolder !== 'null' ? savedSelectedFolder : null);
      
      setIsLoaded(true);
    } catch (error) {
      console.error('Failed to load from localStorage:', error);
      setFiles(INITIAL_FILES);
      setFolders(INITIAL_FOLDERS);
      setMessages([INITIAL_MESSAGE]);
      setHistory([]);
      setIsLoaded(true);
    }
  }, []);

  // Save files to localStorage
  useEffect(() => {
    if (isLoaded) {
      try {
        localStorage.setItem('ai-organizer-files', JSON.stringify(files));
      } catch (error) {
        console.error('Failed to save files:', error);
      }
    }
  }, [files, isLoaded]);

  // Save folders to localStorage
  useEffect(() => {
    if (isLoaded) {
      try {
        localStorage.setItem('ai-organizer-folders', JSON.stringify(folders));
      } catch (error) {
        console.error('Failed to save folders:', error);
      }
    }
  }, [folders, isLoaded]);

  // Save messages to localStorage
  useEffect(() => {
    if (isLoaded) {
      try {
        localStorage.setItem('ai-organizer-messages', JSON.stringify(messages));
      } catch (error) {
        console.error('Failed to save messages:', error);
      }
    }
  }, [messages, isLoaded]);

  // Save history to localStorage
  useEffect(() => {
    if (isLoaded) {
      try {
        localStorage.setItem('ai-organizer-history', JSON.stringify(history));
      } catch (error) {
        console.error('Failed to save history:', error);
      }
    }
  }, [history, isLoaded]);

  // Save chatHeight to localStorage
  useEffect(() => {
    if (isLoaded) {
      try {
        localStorage.setItem('ai-organizer-chatHeight', chatHeight.toString());
      } catch (error) {
        console.error('Failed to save chatHeight:', error);
      }
    }
  }, [chatHeight, isLoaded]);

  // Save selectedFolder to localStorage
  useEffect(() => {
    if (isLoaded) {
      try {
        localStorage.setItem('ai-organizer-selectedFolder', selectedFolder === null ? 'null' : selectedFolder);
      } catch (error) {
        console.error('Failed to save selectedFolder:', error);
      }
    }
  }, [selectedFolder, isLoaded]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (isResizing) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isResizing]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isChatOpen && chatWindowRef.current && !chatWindowRef.current.contains(event.target)) {
        setIsChatOpen(false);
      }
    };

    if (isChatOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [isChatOpen]);

  const getFileIcon = (type) => {
    const icons = {
      image: <Image className="w-5 h-5 text-blue-500" />,
      document: <FileText className="w-5 h-5 text-green-500" />,
      audio: <Music className="w-5 h-5 text-purple-500" />,
      video: <Video className="w-5 h-5 text-red-500" />,
    };
    return icons[type] || <File className="w-5 h-5 text-gray-500" />;
  };

  const findFolderByName = (name) => {
    const searchName = name.toLowerCase().trim();
    return folders.find(f => 
      f.name.toLowerCase() === searchName || 
      f.id === searchName ||
      f.id.includes(searchName)
    );
  };

  const getFileExtension = (filename) => {
    const parts = filename.split('.');
    return parts.length > 1 ? parts[parts.length - 1].toLowerCase() : '';
  };

  const saveStateToHistory = () => {
    setHistory(prev => [...prev, { 
      files: JSON.parse(JSON.stringify(files)), 
      folders: JSON.parse(JSON.stringify(folders)) 
    }].slice(-20));
  };

  const parseCommand = (command) => {
    const cmd = command.toLowerCase().trim();
    
    const fixName = (str) => {
      return str.trim().replace(/\s+/g, " ").replace(/^\w/, (c) => c.toUpperCase());
    };

    // 1. UNDO COMMAND
    if (cmd.match(/^(undo|revert|go back|reverse|cancel)$/)) {
      return { action: 'undo' };
    }

    // 2. RESET COMMAND
    if (cmd.match(/^(reset|clear all|start over|restore default)$/)) {
      return { action: 'reset' };
    }

    // 3. RENAME FOLDER
    const renameMatch = cmd.match(/rename\s+(?:folder\s+)?["']?([\w\s-]+)["']?\s+to\s+["']?([\w\s-]+)["']?/i);
    if (renameMatch) {
      const oldName = renameMatch[1].trim();
      const newName = fixName(renameMatch[2]);
      const folder = findFolderByName(oldName);
      
      if (!folder) {
        return {
          action: 'info',
          summary: `I couldn't find a folder named "${oldName}".`
        };
      }
      
      const existingFolder = findFolderByName(newName);
      if (existingFolder && existingFolder.id !== folder.id) {
        return {
          action: 'info',
          summary: `A folder named "${newName}" already exists.`
        };
      }
      
      return {
        action: 'rename_folder',
        folderId: folder.id,
        oldName: folder.name,
        newName: newName,
        summary: `Renamed "${folder.name}" to "${newName}".`
      };
    }

    // 4. DELETE FOLDER
    const deleteMatch = cmd.match(/delete\s+(?:folder\s+)?["']?([\w\s-]+)["']?/i);
    if (deleteMatch) {
      const folderName = deleteMatch[1].trim();
      const folder = findFolderByName(folderName);
      
      if (!folder) {
        return {
          action: 'info',
          summary: `I couldn't find a folder named "${folderName}".`
        };
      }
      
      return {
        action: 'delete_folder',
        folderId: folder.id,
        folderName: folder.name,
        summary: `Deleted "${folder.name}" folder.`
      };
    }

    // 5. CREATE NESTED FOLDER
    const createNested = cmd.match(/create\s+(?:a\s+)?(?:new\s+)?folder\s+(?:called\s+|named\s+)?["']?([\w\s-]+)["']?\s+(?:inside|in|within|under)\s+["']?([\w\s-]+)["']?/i);
    if (createNested) {
      const newFolderName = fixName(createNested[1]);
      const parentFolderName = createNested[2];
      const parentFolder = findFolderByName(parentFolderName);
      
      if (!parentFolder) {
        return {
          action: 'info',
          summary: `I couldn't find a folder named "${parentFolderName}".`
        };
      }
      
      const existingFolder = folders.find(f => 
        f.name.toLowerCase() === newFolderName.toLowerCase() && 
        f.parent === parentFolder.id
      );
      
      if (existingFolder) {
        return {
          action: 'info',
          summary: `A folder named "${newFolderName}" already exists inside ${parentFolder.name}.`
        };
      }
      
      return {
        action: 'create_nested_folder',
        newFolderName,
        parentFolderId: parentFolder.id,
        parentFolderName: parentFolder.name,
        summary: `Created "${newFolderName}" folder inside ${parentFolder.name}.`
      };
    }

    // 6. CREATE SIMPLE FOLDER
    const createSimple = cmd.match(/create\s+(?:a\s+)?(?:new\s+)?folder\s+(?:called\s+|named\s+)?["']?([\w\s-]+)["']?/i);
    if (createSimple) {
      const folderName = fixName(createSimple[1]);
      const existingFolder = findFolderByName(folderName);
      
      if (existingFolder) {
        return {
          action: 'info',
          summary: `A folder named "${folderName}" already exists.`
        };
      }
      
      return {
        action: 'create_simple_folder',
        newFolderName: folderName,
        summary: `Created "${folderName}" folder.`
      };
    }

    // 7. MOVE ALL FILES OF A TYPE
    const moveAllType = cmd.match(/move\s+all\s+([\w]+)\s+(?:files?\s+)?(?:to|into)\s+["']?([\w\s-]+)["']?/i);
    if (moveAllType) {
      const fileExtension = moveAllType[1].toLowerCase().replace(/^\./, '');
      const targetFolderName = moveAllType[2];
      
      let targetFolder = findFolderByName(targetFolderName);
      const matchingFiles = files.filter(f => getFileExtension(f.name) === fileExtension);
      
      if (matchingFiles.length === 0) {
        return {
          action: 'info',
          summary: `No ${fileExtension} files found.`
        };
      }
      
      const createFolder = !targetFolder;
      if (!targetFolder) {
        targetFolder = { 
          id: targetFolderName.toLowerCase().replace(/\s+/g, '-'),
          name: fixName(targetFolderName)
        };
      }
      
      return {
        action: 'move_all_by_extension',
        fileExtension,
        targetFolder,
        createFolder,
        fileCount: matchingFiles.length,
        fileNames: matchingFiles.map(f => f.name),
        summary: createFolder 
          ? `Created "${targetFolder.name}" folder and moved ${matchingFiles.length} ${fileExtension} file(s) into it.`
          : `Moved ${matchingFiles.length} ${fileExtension} file(s) to ${targetFolder.name}.`
      };
    }

    // 8. MOVE SINGLE FILE
    const moveSingle = cmd.match(/move\s+["']?([\w\s.-]+)["']?\s+(?:to|into)\s+["']?([\w\s-]+)["']?/i);
    if (moveSingle) {
      const fileName = moveSingle[1].trim();
      const targetFolderName = moveSingle[2];
      
      const fileToMove = files.find(f => f.name.toLowerCase() === fileName.toLowerCase());
      if (!fileToMove) {
        return {
          action: 'info',
          summary: `I couldn't find a file named "${fileName}".`
        };
      }
      
      let targetFolder = findFolderByName(targetFolderName);
      const createFolder = !targetFolder;
      
      if (!targetFolder) {
        targetFolder = { 
          id: targetFolderName.toLowerCase().replace(/\s+/g, '-'),
          name: fixName(targetFolderName)
        };
      }
      
      return {
        action: 'move_file',
        fileName: fileToMove.name,
        targetFolder,
        createFolder,
        summary: createFolder
          ? `Created "${targetFolder.name}" folder and moved "${fileToMove.name}" into it.`
          : `Moved "${fileToMove.name}" to ${targetFolder.name}.`
      };
    }

    // 9. LIST FILES/FOLDERS
    if (cmd.match(/(?:list|show|display)\s+(?:all\s+)?(?:files|folders)/i)) {
      return {
        action: 'list',
        summary: `You have ${files.length} file(s) and ${folders.length} folder(s).`
      };
    }

    // 10. OPEN FOLDER
    const openMatch = cmd.match(/open\s+(?:folder\s+)?["']?([\w\s-]+)["']?/i);
    if (openMatch) {
      const folderName = openMatch[1];
      const folder = findFolderByName(folderName);
      
      if (!folder) {
        return {
          action: 'info',
          summary: `I couldn't find a folder named "${folderName}".`
        };
      }
      
      return {
        action: 'open_folder',
        folderId: folder.id,
        summary: `Opening ${folder.name} folder.`
      };
    }

    return {
      action: 'info',
      summary: "I couldn't understand that command. Try:\n• 'move vacation.png to Images'\n• 'move all png files to Images'\n• 'create folder called Projects'\n• 'rename Images to Pictures'\n• 'delete Documents folder'"
    };
  };

  const executeCommand = async (command) => {
    setIsProcessing(true);
    await new Promise(resolve => setTimeout(resolve, 600));
    
    try {
      const action = parseCommand(command);
      
      if (action.action === 'info' || action.action === 'list') {
        addAIMessage(action.summary);
        setIsProcessing(false);
        return;
      }

      if (action.action === 'open_folder') {
        setSelectedFolder(action.folderId);
        addAIMessage(action.summary);
        setIsProcessing(false);
        return;
      }

      if (action.action === 'undo') {
        if (history.length === 0) {
          addAIMessage("Nothing to undo! You haven't made any changes yet.");
        } else {
          const previousState = history[history.length - 1];
          setFiles(previousState.files);
          setFolders(previousState.folders);
          setHistory(prev => prev.slice(0, -1));
          addAIMessage("✅ Undone! Restored to previous state.");
        }
        setIsProcessing(false);
        return;
      }

      if (action.action === 'reset') {
        try {
          localStorage.removeItem('ai-organizer-files');
          localStorage.removeItem('ai-organizer-folders');
          localStorage.removeItem('ai-organizer-messages');
          localStorage.removeItem('ai-organizer-history');
          localStorage.removeItem('ai-organizer-selectedFolder');
        } catch (error) {
          console.error('Failed to clear localStorage:', error);
        }
        
        setFiles(INITIAL_FILES);
        setFolders(INITIAL_FOLDERS);
        setMessages([INITIAL_MESSAGE]);
        setHistory([]);
        setSelectedFolder(null);
        addAIMessage("✅ All files and folders have been reset to default!");
        setIsProcessing(false);
        return;
      }

      saveStateToHistory();

      if (action.action === 'create_simple_folder') {
        const colors = ['bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-orange-500', 'bg-pink-500', 'bg-red-500', 'bg-indigo-500', 'bg-teal-500'];
        const randomColor = colors[Math.floor(Math.random() * colors.length)];
        const newFolderId = action.newFolderName.toLowerCase().replace(/\s+/g, '-') + '-' + Date.now();
        
        setFolders(prev => [...prev, {
          id: newFolderId,
          name: action.newFolderName,
          color: randomColor,
          parent: null
        }]);
        
        addAIMessage(action.summary);
      }

      if (action.action === 'create_nested_folder') {
        const colors = ['bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-orange-500', 'bg-pink-500', 'bg-red-500', 'bg-indigo-500', 'bg-teal-500'];
        const randomColor = colors[Math.floor(Math.random() * colors.length)];
        const newFolderId = `${action.parentFolderId}-${action.newFolderName.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}`;
        
        setFolders(prev => [...prev, {
          id: newFolderId,
          name: action.newFolderName,
          color: randomColor,
          parent: action.parentFolderId
        }]);
        
        addAIMessage(action.summary);
      }

      if (action.action === 'move_file') {
        if (action.createFolder) {
          const colors = ['bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-orange-500', 'bg-pink-500', 'bg-red-500', 'bg-indigo-500', 'bg-teal-500'];
          const randomColor = colors[Math.floor(Math.random() * colors.length)];
          
          setFolders(prev => [...prev, {
            id: action.targetFolder.id,
            name: action.targetFolder.name,
            color: randomColor,
            parent: null
          }]);
        }
        
        setFiles(prevFiles => 
          prevFiles.map(file => 
            file.name === action.fileName
              ? { ...file, folder: action.targetFolder.id }
              : file
          )
        );
        
        addAIMessage(action.summary);
      }

      if (action.action === 'move_all_by_extension') {
        if (action.createFolder) {
          const colors = ['bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-orange-500', 'bg-pink-500', 'bg-red-500', 'bg-indigo-500', 'bg-teal-500'];
          const randomColor = colors[Math.floor(Math.random() * colors.length)];
          
          setFolders(prev => [...prev, {
            id: action.targetFolder.id,
            name: action.targetFolder.name,
            color: randomColor,
            parent: null
          }]);
        }
        
        setFiles(prevFiles => 
          prevFiles.map(file => 
            action.fileNames.includes(file.name)
              ? { ...file, folder: action.targetFolder.id }
              : file
          )
        );
        
        addAIMessage(action.summary);
      }

      if (action.action === 'rename_folder') {
        setFolders(prevFolders =>
          prevFolders.map(folder =>
            folder.id === action.folderId
              ? { ...folder, name: action.newName }
              : folder
          )
        );
        
        addAIMessage(action.summary);
      }

      if (action.action === 'delete_folder') {
        const folderFiles = files.filter(f => f.folder === action.folderId);
        
        setFiles(prevFiles =>
          prevFiles.map(file =>
            file.folder === action.folderId
              ? { ...file, folder: null }
              : file
          )
        );
        
        setFolders(prevFolders =>
          prevFolders.filter(f => f.id !== action.folderId && f.parent !== action.folderId)
        );
        
        if (selectedFolder === action.folderId) {
          setSelectedFolder(null);
        }
        
        const fileMsg = folderFiles.length > 0 
          ? ` ${folderFiles.length} file(s) moved to "All Files".`
          : '';
        addAIMessage(action.summary + fileMsg);
      }

    } catch (error) {
      console.error('Command error:', error);
      addAIMessage("❌ An error occurred while processing your command.");
    } finally {
      setIsProcessing(false);
    }
  };

  const addAIMessage = (text) => {
    setMessages(prev => [...prev, { id: Date.now(), text, sender: 'ai' }]);
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isProcessing) return;

    const userMessage = inputMessage.trim();
    setMessages(prev => [...prev, { id: Date.now(), text: userMessage, sender: 'user' }]);
    setInputMessage('');

    await executeCommand(userMessage);
  };

  const handleMouseDown = (e) => {
    setIsResizing(true);
    e.preventDefault();
  };

  const handleMouseMove = (e) => {
    if (!isResizing) return;
    const newHeight = window.innerHeight - e.clientY - 24;
    if (newHeight >= 300 && newHeight <= 800) {
      setChatHeight(newHeight);
    }
  };

  const handleMouseUp = () => {
    setIsResizing(false);
  };

  const getFilesByFolder = (folderId) => files.filter(f => f.folder === folderId);
  const getUnorganizedFiles = () => files.filter(f => !f.folder);
  const getSubfolders = (parentId) => folders.filter(f => f.parent === parentId);
  const displayFiles = selectedFolder ? getFilesByFolder(selectedFolder) : getUnorganizedFiles();
  const displaySubfolders = selectedFolder ? getSubfolders(selectedFolder) : [];

  return (
    <div className="flex h-screen bg-gray-50">
      <div className="w-64 bg-white border-r border-gray-200 p-4 flex flex-col">
        <h2 className="text-lg font-semibold mb-4 text-gray-800">Folders</h2>
        
        <div 
          onClick={() => setSelectedFolder(null)}
          className={`flex items-center gap-3 p-3 rounded-lg mb-2 cursor-pointer transition-colors ${
            selectedFolder === null ? 'bg-blue-50 border-2 border-blue-500' : 'hover:bg-gray-50'
          }`}
        >
          <div className="w-8 h-8 bg-gray-400 rounded-lg flex items-center justify-center">
            <Folder className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1">
            <p className="font-medium text-gray-800">All Files</p>
            <p className="text-xs text-gray-500">{getUnorganizedFiles().length} files</p>
          </div>
        </div>

        <div className="space-y-2 flex-1 overflow-y-auto">
          {folders.filter(f => !f.parent).map(folder => (
            <div
              key={folder.id}
              onClick={() => setSelectedFolder(folder.id)}
              className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors ${
                selectedFolder === folder.id ? 'bg-blue-50 border-2 border-blue-500' : 'hover:bg-gray-50'
              }`}
            >
              <div className={`w-8 h-8 ${folder.color} rounded-lg flex items-center justify-center`}>
                <Folder className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-gray-800">{folder.name}</p>
                <p className="text-xs text-gray-500">
                  {getFilesByFolder(folder.id).length} files
                  {getSubfolders(folder.id).length > 0 && ` • ${getSubfolders(folder.id).length} folders`}
                </p>
              </div>
              <ChevronRight className="w-4 h-4 text-gray-400" />
            </div>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-auto p-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold text-gray-900">
              {selectedFolder ? folders.find(f => f.id === selectedFolder)?.name : 'All Files'}
            </h1>
          </div>

          {displaySubfolders.length > 0 && (
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-gray-700 mb-3">Folders</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {displaySubfolders.map(subfolder => (
                  <div
                    key={subfolder.id}
                    onClick={() => setSelectedFolder(subfolder.id)}
                    className="bg-white p-4 rounded-lg border border-gray-200 hover:shadow-md transition-shadow cursor-pointer"
                  >
                    <div className="flex items-start gap-3">
                      <div className={`w-10 h-10 ${subfolder.color} rounded-lg flex items-center justify-center shrink-0`}>
                        <Folder className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 truncate">{subfolder.name}</p>
                        <p className="text-sm text-gray-500">{getFilesByFolder(subfolder.id).length} files</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {displayFiles.length > 0 ? (
            <div>
              {displaySubfolders.length > 0 && <h2 className="text-lg font-semibold text-gray-700 mb-3">Files</h2>}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {displayFiles.map(file => (
                  <div
                    key={file.id}
                    className="bg-white p-4 rounded-lg border border-gray-200 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start gap-3">
                      {getFileIcon(file.type)}
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 truncate">{file.name}</p>
                        <p className="text-sm text-gray-500">{file.size}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : displaySubfolders.length === 0 ? (
            <div className="text-center py-16">
              <Folder className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No files in this folder</p>
            </div>
          ) : null}
        </div>
      </div>

      {!isChatOpen && (
        <button
          onClick={() => setIsChatOpen(true)}
          className="fixed bottom-6 left-6 w-16 h-16 bg-gradient-to-br from-blue-600 to-blue-700 text-white rounded-full shadow-2xl hover:shadow-blue-500/50 hover:scale-110 transition-all duration-300 flex items-center justify-center z-50"
          aria-label="Open AI Assistant"
        >
          <MessageCircle className="w-7 h-7" />
        </button>
      )}

      {isChatOpen && (
        <div 
          ref={chatWindowRef}
          className="fixed bottom-2 left-6 w-96 bg-white rounded-2xl shadow-2xl flex flex-col border border-gray-200 z-50"
          style={{ height: `${chatHeight}px` }}
        >
          <div
            className="absolute top-0 left-0 right-0 h-2 cursor-ns-resize hover:bg-blue-100 transition-colors rounded-t-2xl"
            onMouseDown={handleMouseDown}
          >
            <div className="w-12 h-1 bg-gray-300 rounded-full mx-auto mt-0.5"></div>
          </div>

          <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-blue-600 text-white rounded-t-2xl mt-2">
            <div className="flex items-center gap-2">
              <MessageCircle className="w-5 h-5" />
              <h3 className="font-semibold">AI File Organizer</h3>
            </div>
            <button
              onClick={() => setIsChatOpen(false)}
              className="hover:bg-blue-700 p-1 rounded transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map(message => (
              <div
                key={message.id}
                className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] p-3 rounded-2xl ${
                    message.sender === 'user'
                      ? 'bg-blue-600 text-white rounded-br-none'
                      : 'bg-gray-100 text-gray-900 rounded-bl-none'
                  }`}
                >
                  <p className="text-sm whitespace-pre-line">{message.text}</p>
                </div>
              </div>
            ))}
            {isProcessing && (
              <div className="flex justify-start">
                <div className="bg-gray-100 text-gray-900 p-3 rounded-2xl rounded-bl-none">
                  <Loader2 className="w-5 h-5 animate-spin" />
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          <div className="p-4 border-t border-gray-200">
            <div className="flex gap-2">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="Ask me to organize files..."
                className="flex-1 px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={isProcessing}
              />
              <button
                onClick={handleSendMessage}
                disabled={isProcessing || !inputMessage.trim()}
                className="w-10 h-10 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FileOrganizer;