import React, { useCallback, useState, useRef, useEffect } from 'react';
import { EditorState } from 'draft-js';
import { Editor } from 'react-draft-wysiwyg';
import "react-quill/dist/quill.snow.css"; // Import styles
import 'react-draft-wysiwyg/dist/react-draft-wysiwyg.css';
import {
  Bold,
  Italic,
  Underline,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Link2,
  Image,
  List,
  ListOrdered,
  ChevronDown,
  Undo,
  Redo,
  Printer,
  FileText,
  Star,
  Share2,
  MoreVertical,
  Camera
} from 'lucide-react';
import { useParams } from 'react-router-dom';
import { convertToRaw, convertFromRaw } from "draft-js";

 function App() {
  const [editorState, setEditorState] = useState(EditorState.createEmpty());
  const [documentTitle, setDocumentTitle] = useState('');
  const [content, setContent] = useState("");

  // Extracting the 'id' from the URL params
  const { id } = useParams();
  console.log(id);

  // two use effect both having their own state vars, so on the first one state change there is rerender before second one is triggered
  useEffect(()=>{
  //   let textEditorData = async () => {
  //     const documentData = await fetch("http://localhost:8080/text-editor/"+id, {
  //       method: "GET",      
  //       credentials: "include",
  //   });

  //   const data = await documentData.json();
  //   // setData({title: data.title, content: data.content})
  //   setDocumentTitle(data.title);
  //   setContent(data.content)
  // };

  const fetchDocument = async () => {
          try {
            const response = await fetch(import.meta.env.VITE_API_URL +"/text-editor/"+id, {
              method: "GET",
              credentials: "include",
            });
    
            const data = await response.json();
            console.log("Fetched Data:", JSON.stringify(data.content, null, 2)); // Debugging
    
            if (data.content && data.content.blocks) {
              if (!data.content.entityMap) {
                data.content.entityMap = {}; // Ensure entityMap exists
              }
              setEditorState(EditorState.createWithContent(convertFromRaw(data.content)));
            } else {
              console.warn("Invalid or empty content, loading blank editor.");
              setEditorState(EditorState.createEmpty());
            }
    
            setDocumentTitle(data.title || "Untitled Document");
          } catch (error) {
            console.error("Error fetching document:", error);
          }
        };

  fetchDocument();

  }, []);//Render → useEffect Runs → State Updates → Re-Render

  let textEditorData = async () => {
    const rawContent = convertToRaw(editorState.getCurrentContent());
    const documentData = await fetch(import.meta.env.VITE_API_URL + "/text-editor/"+id, {
      method: "PUT",  
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({documentTitle, rawContent}),
      credentials: "include",
    });

    const changedData = await documentData.json();    
    console.log(changedData)
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Top Navigation Bar */}
      <nav className="border-b border-gray-200 bg-white px-4 py-2">
        <div className="flex items-center justify-between">
          <div className="flex small-screen-left-nav items-center space-x-4">
            <FileText className="h-10 w-10 text-blue-600" />            
            <div className="flex flex-col">
              <input
                type="text"
                value={documentTitle}
                onChange={(e) => setDocumentTitle(e.target.value)}
                className="border-none bg-transparent text-lg font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded px-2 sm: text-sm"
              />
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <button onClick={async ()=>{ await textEditorData();}} className="flex items-center space-x-1 rounded-full bg-blue-100 px-4 py-2 text-blue-700 hover:bg-blue-200">
              <span>Save</span>
            </button>
          </div>
        </div>
      </nav>

      <Editor
        editorState={editorState}
        onEditorStateChange={setEditorState}
        toolbarClassName="flex sticky top-0 z-50 !justify-center mx-auto !border-0 !border-b-2 !border-[#ccc] shadow-md"
        editorClassName="mt-6 bg-white p-5 shadow-lg min-h-[1300px] max-w-5xl mx-auto mb-12 border-2 rounded-sm border-gray-300"
        editorStyle={{ minHeight: "1300px" }}
      />
    </div>
  );
}

export default App;

// import React, { useState, useEffect } from "react";
// import { Editor } from "react-draft-wysiwyg";
// import { EditorState, convertFromRaw, convertToRaw } from "draft-js";
// import "react-draft-wysiwyg/dist/react-draft-wysiwyg.css";
// import { FileText } from "lucide-react";
// import { useParams } from "react-router-dom";

// const TextEditor = () => {
//   const { id } = useParams(); // Get document ID from URL
//   const [editorState, setEditorState] = useState(EditorState.createEmpty());
//   const [documentTitle, setDocumentTitle] = useState("");

//   // Fetch document content from API
//   useEffect(() => {
//     const fetchDocument = async () => {
//       try {
//         const response = await fetch(`http://localhost:8080/text-editor/${id}`, {
//           method: "GET",
//           credentials: "include",
//         });

//         const data = await response.json();
//         console.log("Fetched Data:", JSON.stringify(data, null, 2)); // Debugging

//         if (data.content && data.content.blocks) {
//           if (!data.content.entityMap) {
//             data.content.entityMap = {}; // Ensure entityMap exists
//           }
//           setEditorState(EditorState.createWithContent(convertFromRaw(data.content)));
//         } else {
//           console.warn("Invalid or empty content, loading blank editor.");
//           setEditorState(EditorState.createEmpty());
//         }

//         setDocumentTitle(data.title || "Untitled Document");
//       } catch (error) {
//         console.error("Error fetching document:", error);
//       }
//     };

//     fetchDocument();
//   }, [id]);

//   // Auto-save changes to API
//   const onEditorStateChange = async (newEditorState) => {
//     setEditorState(newEditorState);

//     const rawContent = convertToRaw(newEditorState.getCurrentContent());

//     try {
//       await fetch(`http://localhost:8080/text-editor/${id}`, {
//         method: "PUT",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ title: documentTitle, content: rawContent }),
//         credentials: "include",
//       });
//     } catch (error) {
//       console.error("Error saving document:", error);
//     }
//   };

//   return (
//     <div className="min-h-screen bg-white">
//       {/* Top Navigation Bar */}
//       <nav className="border-b border-gray-200 bg-white px-4 py-2">
//         <div className="flex items-center justify-between">
//           <div className="flex small-screen-left-nav items-center space-x-4">
//             <FileText className="h-10 w-10 text-blue-600" />
//             <div className="flex flex-col">
//               <input
//                 type="text"
//                 value={documentTitle}
//                 onChange={(e) => setDocumentTitle(e.target.value)}
//                 className="border-none bg-transparent text-lg font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded px-2 text-sm"
//               />
//             </div>
//           </div>
//           <div className="flex items-center space-x-4">
//             <button className="flex items-center space-x-1 rounded-full bg-blue-100 px-4 py-2 text-blue-700 hover:bg-blue-200">
//               <span>Save</span>
//             </button>
//           </div>
//         </div>
//       </nav>

//       <Editor
//         editorState={editorState}
//         onEditorStateChange={onEditorStateChange}
//         toolbarClassName="flex sticky top-0 z-50 !justify-center mx-auto !border-0 !border-b-2 !border-[#ccc] shadow-md"
//         editorClassName="mt-6 bg-white p-5 shadow-lg min-h-[300px] max-w-5xl mx-auto mb-12 border-2 rounded-sm border-gray-300"
//         editorStyle={{ minHeight: "1300px" }}
//       />
//     </div>
//   );
// };

// export default TextEditor;
