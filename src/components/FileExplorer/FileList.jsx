import React, { useMemo, useState } from 'react';
import FileItem from './FileItem';
import { useProject } from '../../context/ProjectContext';
import Text from '../Text';

// Build a hierarchical tree from flat files array keyed by path
const buildTree = (files) => {
  const root = { name: '', path: '', children: {}, isFolder: true };

  files.forEach((f) => {
    // normalize path (remove leading slash)
    const p = f.path.replace(/^\//, '').replace(/\/$/, '');
    const parts = p.split('/').filter(Boolean);
    let node = root;
    parts.forEach((part, idx) => {
      const isLast = idx === parts.length - 1;
      const isFolderNode = !isLast ? true : (f.type === 'folder');
      if (!node.children[part]) {
        // build path for this node (always folder nodes end with '/')
        const parentPath = node.path ? node.path.replace(/\/$/, '') + '/' : '';
        const nodePath = parentPath + part + (isFolderNode ? '/' : '');
        node.children[part] = {
          name: part,
          path: nodePath.replace(/^\//, ''),
          children: {},
          isFolder: isFolderNode,
          orig: isLast ? f : undefined,
        };
      }
      node = node.children[part];
    });
  });

  const toArray = (node) => {
    const arr = Object.values(node.children).map((child) => ({
      ...child,
      children: toArray(child),
    }));
    // sort: folders first, then files, both alphabetically
    arr.sort((a, b) => {
      if (a.isFolder && !b.isFolder) return -1;
      if (!a.isFolder && b.isFolder) return 1;
      return a.name.localeCompare(b.name);
    });
    return arr;
  };

  return toArray(root);
};

const TreeNode = ({ node, level = 0, onOpenFile, activeFile }) => {
  const [open, setOpen] = useState(true);

  if (node.isFolder) {
    return (
      <li>
        <div
          className={`flex items-center justify-between px-2 py-1 rounded hover:bg-gray-700/30 cursor-pointer`}
          style={{ paddingLeft: `${level * 12 + 8}px` }}
          onClick={() => setOpen((s) => !s)}
          role="button"
          tabIndex={0}
        >
          <div className="flex items-center gap-2">
            <span>{open ? '📂' : '📁'}</span>
            <span className="truncate font-medium">{node.name}</span>
          </div>
          <div className="text-gray-400 text-sm">{node.children.length}</div>
        </div>
        {open && node.children && node.children.length > 0 && (
          <ul className="mt-1">
            {node.children.map((child) => (
              <TreeNode key={child.path} node={child} level={level + 1} onOpenFile={onOpenFile} activeFile={activeFile} />
            ))}
          </ul>
        )}
      </li>
    );
  }

  // file node
  return (
    <li style={{ paddingLeft: `${level * 12 + 8}px` }}>
      <div onClick={() => onOpenFile('/' + node.path)}>
        <FileItem file={{ ...node.orig, path: '/' + node.path }} isActive={activeFile === '/' + node.path} />
      </div>
    </li>
  );
};

const FileList = () => {
  const { files, activeFile, setActiveFile } = useProject();

  const tree = useMemo(() => buildTree(files || []), [files]);

  if (!files || files.length === 0) {
    return (
      <div className="text-gray-500 text-center py-4">
        <Text as="p" variant="body">No files available. Create or load a project to view files.</Text>
      </div>
    );
  }

  const handleOpenFile = (path) => {
    setActiveFile(path);
  };

  return (
    <ul className="file-list space-y-1 py-2">
      {tree.map((node) => (
        <TreeNode key={node.path || node.name} node={node} onOpenFile={handleOpenFile} activeFile={activeFile} />
      ))}
    </ul>
  );
};

export default FileList;